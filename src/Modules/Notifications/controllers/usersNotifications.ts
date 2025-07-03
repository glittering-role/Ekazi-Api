import { asyncHandler } from "../../../middleware/async-middleware";
import { Request, Response } from "express";
import { handleError } from "../../../logs/helpers/erroHandler";
import { Notification } from "../models/associations";
import { getUserIdFromToken } from "../../../utils/user/get_userId";
import { createResponse } from "../../../logs/helpers/response";

const getUserNotifications = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const user_id = getUserIdFromToken(req);

    try {
      // Fetch all notifications for the user
      const notifications = await Notification.findAll({
        where: {
          user_id: user_id, // Fetch notifications for the current user
        },
        attributes: [
          "id",
          "user_id",
          "notification_type",
          "notification_content",
          "is_read",
          "createdAt"
        ],
        order: [["createdAt", "DESC"]], 
      });

     
      const unreadCount = notifications.filter((n) => !n.is_read).length;

      if (notifications.length === 0) {
        res.status(200).json(
          createResponse(true, "No notifications found", {
            notifications: {
              message_count: 0, 
              list: [], 
            },
          })
        );
        return;
      }

      res.status(200).json(
        createResponse(true, "Notifications retrieved successfully", {
          notifications: {
            message_count: unreadCount, 
            list: notifications, 
          },
        })
      );
    } catch (error) {
      handleError(
        error,
        req,
        res,
        "An error occurred while retrieving notifications"
      );
    }
  }
);
// Delete one or more notifications for a user (direct deletion)
const deleteUserNotification = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    
    const { id } = req.body;
    const user_id = getUserIdFromToken(req);

    try {
      // Check if ids are provided and validate batch size
      if (!id || (Array.isArray(id) && id.length === 0)) {
        res
          .status(400)
          .json(createResponse(false, "Invalid or missing notification ID(s)"));
        return;
      }

      // Limit the number of notifications to delete at once
      const notificationIds = Array.isArray(id) ? id : [id];

      const deleteCount = await Notification.destroy({
        where: {
          id: notificationIds,
          user_id: user_id,
        },
      });

      if (deleteCount === 0) {
        res
          .status(404)
          .json(
            createResponse(
              false,
              "No matching notifications found for deletion"
            )
          );
        return;
      }

      res
        .status(200)
        .json(
          createResponse(
            true,
            `Successfully deleted ${deleteCount} notification(s)`
          )
        );
    } catch (error) {
      handleError(
        error,
        req,
        res,
        "An error occurred while deleting notifications"
      );
    }
  }
);

export { getUserNotifications, deleteUserNotification };
