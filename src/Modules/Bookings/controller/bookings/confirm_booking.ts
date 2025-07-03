import { Request, Response } from "express";
import { Booking } from "../../models/associations";
import { handleError } from "../../../../logs/helpers/erroHandler";
import { asyncHandler } from "../../../../middleware/async-middleware";
import { createResponse } from "../../../../logs/helpers/response";
import { Op } from "sequelize";
import { getUserIdFromToken } from "../../../../utils/user/get_userId";
import { createNotifications } from "../../../Notifications/service/notificationService";
import db from "../../../../config/db";

/**
 * Confirm or cancel a booking. Only the service provider can perform these actions.
 */
export const confirmOrCancelBooking = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // Start transaction using the sequelize instance from Booking model.
      const transaction = await db.transaction();
      try {
        const { id } = req.params;
        const { action } = req.body;
        const provider_id = getUserIdFromToken(req) ?? "";

        if (!provider_id) {
          await transaction.rollback();
          res.status(400).json(createResponse(false, "Provider ID is required."));
          return;
        }

        // Find the booking using the transaction.
        const booking = await Booking.findByPk(id, { transaction });
        if (!booking) {
          await transaction.rollback();
          res.status(404).json(createResponse(false, "Booking not found."));
          return;
        }

        if (booking.provider_id !== provider_id) {
          await transaction.rollback();
          res.status(403).json(createResponse(false, "Only the service provider can modify this booking."));
          return;
        }

        if (action === "confirm") {
          if (booking.status !== "pending") {
            await transaction.rollback();
            res.status(400).json(createResponse(false, "Only pending bookings can be confirmed."));
            return;
          }

          // Check for conflicting bookings using the same transaction.
          const conflict = await Booking.findOne({
            where: {
              provider_id,
              status: { [Op.in]: ["confirmed"] },
              [Op.and]: [
                { start_time: { [Op.lt]: booking.end_time } },
                { end_time: { [Op.gt]: booking.start_time } },
              ],
            },
            transaction,
          });

          if (conflict) {
            await transaction.rollback();
            res.status(400).json(createResponse(false, "You already have another booking at this time."));
            return;
          }

          booking.status = "confirmed";
          booking.last_updated_by = provider_id;
          booking.last_action = "updated";
          await booking.save({ transaction });

          // Send notification (outside transaction if notifications are handled separately).
          await createNotifications(booking.user_id, "notification", "Your booking has been confirmed.");

          await transaction.commit();
          res.status(200).json(createResponse(true, "Booking confirmed successfully", { booking }));
        } else if (action === "cancel") {
          if (booking.status !== "pending") {
            await transaction.rollback();
            res.status(400).json(createResponse(false, "Only pending bookings can be canceled."));
            return;
          }

          booking.status = "cancelled";
          booking.last_updated_by = provider_id;
          booking.last_action = "cancelled";
          await booking.save({ transaction });

          await createNotifications(provider_id, "notification", "Your booking has been canceled.");

          // If booking was previously confirmed, issue a warning notification.
          // @ts-ignore
          if (booking?.status === "confirmed") {
            await createNotifications(
                provider_id,
                "notification",
                "Warning: You canceled a booking that was previously confirmed. Repeated cancellations may lead to penalties."
            );
          }

          await transaction.commit();
          res.status(200).json(createResponse(true, "Booking canceled successfully", { booking }));
        } else {
          await transaction.rollback();
          res.status(400).json(createResponse(false, "Invalid action. Use 'confirm' or 'cancel'."));
        }
      } catch (error) {
        await transaction.rollback();
        handleError(error, req, res, "Error processing booking action");
      }
    }
);

/**
 * Cancel a booking. Only the user who booked can cancel.
 */
export const cancelBooking = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const transaction = await db.transaction();
      try {
        const { bookingId } = req.params;
        const userId = getUserIdFromToken(req) ?? "";

        const booking = await Booking.findByPk(bookingId, { transaction });
        if (!booking) {
          await transaction.rollback();
          res.status(404).json({ message: "Booking not found" });
          return;
        }

        // Ensure only the user who booked can cancel.
        if (booking.user_id !== userId) {
          await transaction.rollback();
          res.status(403).json({ message: "Unauthorized to cancel this booking" });
          return;
        }

        if (booking.status === "cancelled" || booking.status === "completed") {
          await transaction.rollback();
          res.status(400).json({ message: "Booking cannot be cancelled" });
          return;
        }

        // Update the booking status within the transaction.
        await booking.update(
            {
              status: "cancelled",
              last_updated_by: userId,
              last_action: "cancelled",
            },
            { transaction }
        );

        await createNotifications(booking.user_id, "Booking", "Your booking has been Canceled.");
        await createNotifications(booking.provider_id, "Booking", "A booking you manage has been Canceled.");

        await transaction.commit();
        res.status(200).json({ message: "Booking cancelled successfully" });
      } catch (error) {
        await transaction.rollback();
        handleError(error, req, res, "Error cancelling booking");
      }
    }
);

/**
 * Mark a booking as attended/completed. Only the service provider can perform this action.
 */
export const attendBooking = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const transaction = await db.transaction();
  try {
    const { id } = req.params;
    const provider_id = getUserIdFromToken(req) ?? "";

    if (!provider_id) {
      await transaction.rollback();
      res.status(400).json(createResponse(false, "Provider ID is required."));
      return;
    }

    const booking = await Booking.findByPk(id, { transaction });
    if (!booking) {
      await transaction.rollback();
      res.status(404).json(createResponse(false, "Booking not found."));
      return;
    }

    if (booking.provider_id !== provider_id) {
      await transaction.rollback();
      res.status(403).json(createResponse(false, "Only the service provider can attend to this booking."));
      return;
    }

    if (booking.status !== "confirmed") {
      await transaction.rollback();
      res.status(400).json(createResponse(false, "Booking must be confirmed before it can be attended."));
      return;
    }

    booking.status = "completed";
    booking.last_updated_by = provider_id;
    booking.last_action = "updated";
    await booking.save({ transaction });

    await transaction.commit();
    res.status(200).json(createResponse(true, "Booking marked as completed", { booking }));
  } catch (error) {
    await transaction.rollback();
    handleError(error, req, res, "Error attending booking");
  }
});
