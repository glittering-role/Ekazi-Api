import { Request, Response } from "express";
import { DefaultAvailability, Booking, AvailabilityOverride } from "../../models/associations";
import { handleError } from "../../../../logs/helpers/erroHandler";
import { asyncHandler } from "../../../../middleware/async-middleware";
import { createResponse } from "../../../../logs/helpers/response";
import { getUserIdFromToken } from "../../../../utils/user/get_userId";
import { Service, ServiceProviders } from "../../../Services/models/associations";
import { validateTimeSlot } from "../../utils/bookingValidation";
import { buildDefaultAvailabilityFilter } from "../utils/buildDefaultAvailabilityFilter";
import db from "../../../../config/db";

/**
 * Send a booking request to the service provider based on the provider's available slot.
 * The process is wrapped in a transaction so that any failure along the way results in a rollback.
 */
export const createBooking = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        // Start a transaction using the sequelize instance from one of our models
        const transaction = await db.transaction();

        try {
            const { start_time, end_time, service_id } = req.body;
            const user_id = getUserIdFromToken(req) ?? "";
            const startTime = new Date(start_time);
            const endTime = new Date(end_time);

            // Validate time inputs
            if (startTime >= endTime) {
                await transaction.rollback();
                res.status(400).json(createResponse(false, "Start time must be before end time."));
                return;
            }

            // Extract booking date (YYYY-MM-DD) and format times
            const bookingDate = startTime.toISOString().split("T")[0];
            const formattedStartTime = startTime.toTimeString().split(" ")[0]; // HH:mm:ss
            const formattedEndTime = endTime.toTimeString().split(" ")[0];

            // Fetch service & provider info
            const service = await Service.findByPk(service_id, {
                attributes: ["provider_id"],
                include: [{ model: ServiceProviders, as: "provider", attributes: ["user_id"] }],
                transaction,
            });

            if (!service || !service.provider_id || !service.provider) {
                await transaction.rollback();
                res.status(400).json(createResponse(false, "Invalid service or provider not found."));
                return;
            }

            const provider_user_id = service.provider.user_id;

            // if (provider_user_id === user_id) {
            //     await transaction.rollback();
            //     res.status(400).json(createResponse(false, "You cannot book your own service."));
            //     return;
            // }

            // Validate time slot format and correctness
            const timeValidation = validateTimeSlot(startTime, endTime);
            if (!timeValidation.valid) {
                await transaction.rollback();
                res.status(400).json(createResponse(false, timeValidation.message));
                return;
            }

            // Check provider availability using default schedule and any overrides
            const [defaultSchedule, override] = await Promise.all([
                DefaultAvailability.findOne({
                    where: buildDefaultAvailabilityFilter(
                        provider_user_id,
                        bookingDate,
                        formattedStartTime,
                        formattedEndTime
                    ),
                    attributes: ["id"],
                    transaction,
                }),
                AvailabilityOverride.findOne({
                    where: { provider_id: provider_user_id, override_date: bookingDate },
                    attributes: ["is_available"],
                    transaction,
                }),
            ]);

            // If no default schedule exists and override is either missing or not available, reject the booking
            if (!defaultSchedule && (!override || !override.is_available)) {
                await transaction.rollback();
                res.status(400).json(createResponse(false, "Provider is unavailable at this time."));
                return;
            }

            // Create the booking request within the transaction
            const bookingRequest = await Booking.create(
                {
                    provider_id: provider_user_id,
                    user_id,
                    start_time: startTime,
                    end_time: endTime,
                    service_id,
                    status: "pending",
                },
                { transaction }
            );

            // Commit the transaction if everything is successful
            await transaction.commit();
            res
                .status(201)
                .json(createResponse(true, "Booking request sent successfully", { bookingRequest }));
        } catch (error) {
            // Rollback the transaction in case of any error
            await transaction.rollback();
            handleError(error, req, res, "Error sending booking request");
        }
    }
);
