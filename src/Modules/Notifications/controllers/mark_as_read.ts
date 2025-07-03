import { asyncHandler } from "../../../middleware/async-middleware";
import { Request, Response } from "express";
import { handleError } from "../../../logs/helpers/erroHandler";
import { Notification } from "../models/associations";
import { createResponse } from "../../../logs/helpers/response";

export const markAsReadNotifications = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { notificationIds } = req.body;

         // Check if ids are provided and validate batch size
      if (!notificationIds || (Array.isArray(notificationIds) && notificationIds.length === 0)) {
        res
          .status(400)
          .json(createResponse(false, "Invalid or missing notification ID(s)"));
        return;
      }

      // Limit the number of notifications to delete at once
      const notificationId = Array.isArray(notificationIds) ? notificationIds : [notificationIds]; 

        await Notification.update(
            { is_read: true }, 
            {
                where: {
                    id: notificationId, 
                }
            }
        );

        // Respond with success message
        res.status(200).json(createResponse(true));
    } catch (error) {
        handleError(error, req, res, 'Failed to mark notifications as read');
    }
});