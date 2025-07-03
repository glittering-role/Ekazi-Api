import { Request, Response } from "express";
import { asyncHandler } from "../../../../middleware/async-middleware";
import { createResponse } from "../../../../logs/helpers/response";
import { handleError } from "../../../../logs/helpers/erroHandler";
import {
    AvailabilityOverride,
    BlockedDate,
    DefaultAvailability,
    Booking
} from "../../models/associations";
import { Op } from "sequelize";

interface CalendarEvent {
    title: string;
    start: string | Date;
    end?: string | Date;
    allDay: boolean;
    backgroundColor: string;
    borderColor: string;
    status: string;
}

export const getProviderCalendar = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { provider_id } = req.params;
        const { month, year } = req.query;

        // Validation
        if (!provider_id) {
            res.status(400).json(createResponse(false, "Provider ID is required."));
            return;
        }

        // Date calculations
        const currentDate = new Date();
        const currentYear = currentDate.getUTCFullYear();
        const currentMonth = currentDate.getUTCMonth() + 1;

        const targetMonth = parseInt(month?.toString() || currentMonth.toString(), 10);
        const targetYear = parseInt(year?.toString() || currentYear.toString(), 10);

        if (targetMonth < 1 || targetMonth > 12) {
            res.status(400).json(createResponse(false, "Invalid month (1-12)"));
            return;
        }
        if (targetYear < 2025) {
            res.status(400).json(createResponse(false, "Invalid year (2025 and later)"));
            return;
        }

        // Month boundaries
        const monthStart = new Date(Date.UTC(targetYear, targetMonth - 1, 1));
        const monthEnd = new Date(Date.UTC(targetYear, targetMonth, 0, 23, 59, 59));
        const daysInMonth = new Date(targetYear, targetMonth, 0).getUTCDate();

        // Data fetching
        const [defaultAvailabilities, overrides, blockedDates, confirmedBookings] = await Promise.all([
            DefaultAvailability.findAll({
                where: { provider_id },
                attributes: ["id", "selected_dates", "start_time", "end_time", "createdAt"],
                order: [['createdAt', 'DESC']]
            }),
            AvailabilityOverride.findAll({
                where: {
                    provider_id,
                    override_date: { [Op.between]: [monthStart, monthEnd] }
                },
                attributes: ["override_date", "start_time", "end_time", "is_available"]
            }),
            BlockedDate.findAll({
                where: {
                    provider_id,
                    blocked_date: { [Op.between]: [monthStart, monthEnd] }
                },
                attributes: ["blocked_date", "reason"]
            }),
            Booking.findAll({
                where: {
                    provider_id,
                    status: "confirmed",
                    start_time: { [Op.between]: [monthStart, monthEnd] }
                },
                attributes: ["start_time", "end_time"]
            })
        ]);

        // Date processing
        const dateMap = new Map<string, { start: string; end: string }>();
        for (const availability of defaultAvailabilities) {
            if (Array.isArray(availability.selected_dates)) {
                availability.selected_dates.forEach(date => {
                    if (!dateMap.has(date)) {
                        dateMap.set(date, {
                            start: availability.start_time,
                            end: availability.end_time
                        });
                    }
                });
            }
        }

        // Lookup maps
        const overrideMap = new Map(
            overrides.map(ov => [ov.override_date, ov])
        );

        const blockedMap = new Map(
            blockedDates.map(bd => [bd.blocked_date, bd])
        );

        const bookingMap = new Map<string, Booking[]>();
        confirmedBookings.forEach(booking => {
            const bookingDate = new Date(booking.start_time);
            const dateKey = [
                bookingDate.getUTCFullYear(),
                String(bookingDate.getUTCMonth() + 1).padStart(2, '0'),
                String(bookingDate.getUTCDate()).padStart(2, '0')
            ].join('-');

            if (!bookingMap.has(dateKey)) {
                bookingMap.set(dateKey, []);
            }
            bookingMap.get(dateKey)?.push(booking);
        });


        // Calendar generation
        const calendarEvents: CalendarEvent[] = [];
        const timeRegex = /^([0-1]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(Date.UTC(targetYear, targetMonth - 1, day));
            const dateKey = currentDate.toISOString().split('T')[0];

            // Blocked dates check
            if (blockedMap.has(dateKey)) {
                calendarEvents.push(createBlockedEvent(blockedMap.get(dateKey)!, currentDate));
                continue;
            }

            // Override check
            const override = overrideMap.get(dateKey);
            if (override && !override.is_available) {
                calendarEvents.push({
                    title: "Unavailable (Override)",
                    start: currentDate.toISOString(),
                    allDay: true,
                    backgroundColor: "#ff4444",
                    borderColor: "#cc0000",
                    status: "blocked"
                });
                continue;
            }

            // Availability check
            const defaultTimes = dateMap.get(dateKey);
            if (!defaultTimes && !override?.is_available) continue;

            // Time processing
            let startTime = override?.is_available ? override.start_time : defaultTimes!.start;
            let endTime = override?.is_available ? override.end_time : defaultTimes!.end;

            if (!timeRegex.test(startTime ?? "")) startTime = "09:00:00";
            if (!timeRegex.test(endTime ?? "")) endTime = "17:00:00";

            const workStart = new Date(`${dateKey}T${startTime}Z`);
            const workEnd = new Date(`${dateKey}T${endTime}Z`);
            if (workEnd <= workStart) workEnd.setUTCDate(workEnd.getUTCDate() + 1);

            // Booking processing
            const bookings = processBookings(bookingMap.get(dateKey) || [], workStart, workEnd);
            calendarEvents.push(...generateAvailabilitySlots(workStart, workEnd, bookings));
        }

        // Final response
        res.status(200).json(createResponse(true, "Calendar retrieved", {
            calendarEvents: calendarEvents.sort((a, b) =>
                new Date(a.start).getTime() - new Date(b.start).getTime()
            )
        }));

    } catch (error) {
        handleError(error, req, res, "Calendar retrieval error");
    }
});

// Helper functions
function createBlockedEvent(blockedDate: BlockedDate, date: Date): CalendarEvent {
    return {
        title: `Blocked: ${blockedDate.reason}`,
        start: date.toISOString(),
        allDay: true,
        backgroundColor: "#666666",
        borderColor: "#444444",
        status: "blocked"
    };
}

function processBookings(bookings: Booking[], workStart: Date, workEnd: Date): { start: Date; end: Date }[] {
    return bookings
        .map(b => ({
            start: new Date(b.start_time) < workStart ? workStart : new Date(b.start_time),
            end: new Date(b.end_time) > workEnd ? workEnd : new Date(b.end_time)
        }))
        .sort((a, b) => a.start.getTime() - b.start.getTime())
        .reduce((merged, booking) => {
            const last = merged[merged.length - 1];
            if (last && booking.start <= last.end) {
                if (booking.end > last.end) last.end = booking.end;
            } else {
                merged.push({ ...booking });
            }
            return merged;
        }, [] as { start: Date; end: Date }[]);
}

function generateAvailabilitySlots(workStart: Date, workEnd: Date, bookings: { start: Date; end: Date }[]): CalendarEvent[] {
    let currentStart = workStart;
    const slots: CalendarEvent[] = [];

    for (const booking of bookings) {
        if (booking.start > currentStart) {
            slots.push(createAvailableEvent(currentStart, booking.start));
        }
        slots.push({
            title: "Booked",
            start: booking.start.toISOString(),
            end: booking.end.toISOString(),
            allDay: false,
            backgroundColor: "#4d88ff",
            borderColor: "#0066cc",
            status: "booked"
        });
        currentStart = booking.end > currentStart ? booking.end : currentStart;
    }

    if (currentStart < workEnd) {
        slots.push(createAvailableEvent(currentStart, workEnd));
    }

    return slots;
}

function createAvailableEvent(start: Date, end: Date): CalendarEvent {
    return {
        title: "Available",
        start: start.toISOString(),
        end: end.toISOString(),
        allDay: false,
        backgroundColor: "#00cc66",
        borderColor: "#00994d",
        status: "available"
    };
}