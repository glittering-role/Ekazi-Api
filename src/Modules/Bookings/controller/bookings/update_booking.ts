import { Request, Response } from "express";
import { Op } from "sequelize";
import {
  DefaultAvailability,
  BlockedDate,
  AvailabilityOverride,
  Booking,
} from "../../models/associations";
import { handleError } from "../../../../logs/helpers/erroHandler";
import { asyncHandler } from "../../../../middleware/async-middleware";
import { createResponse } from "../../../../logs/helpers/response";
import { getUserIdFromToken } from "../../../../utils/user/get_userId";

/**
 * Update a booking. Only the service provider (matching provider_id) can update a booking.
 * This version uses the updated DefaultAvailability model where availability dates are stored as a JSON array (selected_dates).
 */
export const updateBooking = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { id } = req.params;
        const { start_time, end_time, service_id } = req.body;
        const user_id = getUserIdFromToken(req) ?? "";

        const booking = await Booking.findByPk(id);
        if (!booking) {
          res.status(404).json(createResponse(false, "Booking not found."));
          return;
        }

        if (booking.provider_id !== user_id) {
          res.status(403).json(
              createResponse(false, "Only the service provider can update this booking.")
          );
          return;
        }

        // Convert provided times to Date objects
        const newStart = start_time ? new Date(start_time) : booking.start_time;
        const newEnd = end_time ? new Date(end_time) : booking.end_time;

        if (newStart >= newEnd) {
          res.status(400).json(createResponse(false, "Start time must be before end time."));
          return;
        }

        // Extract the booking date (YYYY-MM-DD)
        const bookingDate = newStart.toISOString().split("T")[0];

        // Format times to HH:MM:SS for comparison
        const formatTime = (date: Date): string => date.toTimeString().split(" ")[0];
        const bookingStartStr = formatTime(newStart);
        const bookingEndStr = formatTime(newEnd);

        // Check provider's default availability using the updated model:
        // Ensure that the booking date is included in the provider's selected_dates array
        // and that the requested times fall within the provider's available hours.
        const defaultSchedule = await DefaultAvailability.findOne({
          where: {
            provider_id: user_id,
            selected_dates: { [Op.contains]: [bookingDate] },
            start_time: { [Op.lte]: bookingStartStr },
            end_time: { [Op.gte]: bookingEndStr },
          },
        });
        if (!defaultSchedule) {
          res.status(400).json(
              createResponse(
                  false,
                  "Provider is not available during these hours based on default availability."
              )
          );
          return;
        }

        // Check if the provider has blocked the booking date
        const blocked = await BlockedDate.findOne({
          where: { provider_id: user_id, blocked_date: bookingDate },
        });
        if (blocked) {
          res.status(400).json(createResponse(false, "Provider is unavailable on this date."));
          return;
        }

        // Check if there's an availability override for the booking date
        const override = await AvailabilityOverride.findOne({
          where: { provider_id: user_id, override_date: bookingDate },
        });
        if (override) {
          if (!override.is_available) {
            res.status(400).json(
                createResponse(false, "Provider is unavailable on this date (override).")
            );
            return;
          }
          if (override.start_time && override.end_time) {
            if (
                bookingStartStr < override.start_time ||
                bookingEndStr > override.end_time
            ) {
              res.status(400).json(
                  createResponse(
                      false,
                      "Booking time is outside the provider's override available hours."
                  )
              );
              return;
            }
          }
        }

        // Check for booking conflicts for the provider (ignoring the current booking)
        const conflict = await Booking.findOne({
          where: {
            id: { [Op.ne]: id },
            provider_id: user_id,
            status: { [Op.in]: ["pending", "confirmed"] },
            [Op.and]: [
              { start_time: { [Op.lt]: newEnd } },
              { end_time: { [Op.gt]: newStart } },
            ],
          },
        });
        if (conflict) {
          res.status(400).json(
              createResponse(false, "Provider already has a booking during this time.")
          );
          return;
        }

        // Update the booking details
        booking.start_time = newStart;
        booking.end_time = newEnd;
        if (service_id) booking.service_id = service_id;
        booking.last_updated_by = user_id;
        booking.last_action = "updated";
        await booking.save();

        res.status(200).json(createResponse(true, "Booking updated successfully", { booking }));
      } catch (error) {
        handleError(error, req, res, "Error updating booking");
      }
    }
);
