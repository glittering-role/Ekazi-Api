import { Op } from "sequelize";
import {Booking} from "../../models/associations";
import {createNotifications} from "../../../Notifications/service/notificationService";
import logger from "../../../../logs/helpers/logger";

// Interface for Booking
interface BookingReminder {
    start_time: { toISOString: () => string };
    user_id: string | string[] | null | undefined;
    provider_id: string | string[] | null | undefined;
}

// Function to send booking reminders
export const sendBookingReminders = async () => {
    try {
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

        console.time("⏳ Fetching upcoming bookings");

        // Fetch upcoming bookings within the next hour
        const upcomingBookings: BookingReminder[] = await Booking.findAll({
            where: {
                start_time: { [Op.between]: [now, oneHourLater] },
                status: "confirmed",
            },
            attributes: ["start_time", "user_id", "provider_id"],
            raw: true,
        });

        console.timeEnd("⏳ Fetching upcoming bookings");

        if (upcomingBookings.length === 0) {
            return logger.info("✅ No upcoming bookings to remind.");
        }

        console.time("⏳ Sending notifications");

        await Promise.all(
            upcomingBookings.map(async (booking) => {
                const notificationMessage = `Reminder: Your booking starts at ${booking.start_time.toISOString()}. Please be ready.`;

                // Send notification to user
                if (booking.user_id) {
                    await createNotifications(booking.user_id, "notification", notificationMessage);
                }

                // Send notification to provider
                if (booking.provider_id) {
                    await createNotifications(booking.provider_id, "notification", notificationMessage);
                }
            })
        );

    } catch (error :any) {
        logger.error(`❌ Error sending booking reminders: ${error.message}`, {
            metadata: {
                timestamp: new Date().toISOString(),
                error: error.message,
                stack: error.stack,
            },
        });
    }
};
