import {asyncHandler} from "../../../middleware/async-middleware";
import {Request, Response} from "express";
import {handleError} from "../../../logs/helpers/erroHandler";
import {Notification} from "../models/associations";
import {Roles, Users} from "../../Users/model/associations";
import { getUserIdFromToken } from "src/utils/user/get_userId";
import {createResponse} from "../../../logs/helpers/response";

const getAllNotifications  = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        // Fetch notifications
        const notifications = await Notification.findAll({
            where: {
                user_id: null,
            },
            attributes: [
                "id",
                "user_id",
                "notification_type",
                "notification_content",
                "is_read",
                "createdAt"
              ],
            order: [['createdAt', 'DESC']]
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
        handleError(error, req, res, 'Internal server error while fetching notifications');
    }
});

// Delete one or more notifications for a user (direct deletion)
const deleteNotification  = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id, ids } = req.body; 

    if (id) {
        try {
            const notification = await Notification.findByPk(id);
            if (!notification) {
                 res.status(404).json(createResponse(false, 'Notification not found'));
                return
            }

            await Notification.destroy({ where: { id } });

            res.status(200).json(createResponse(true, 'Notification deleted successfully'));
        } catch (error) {
            handleError(error, req, res, 'An error occurred while deleting the notification');
        }
    } else if (ids && Array.isArray(ids) && ids.length > 0) {
        try {
            // Perform the batch deletion of notifications
            const deleteCount = await Notification.destroy({
                where: {
                    id: ids
                }
            });

            if (deleteCount === 0) {
                 res.status(404).json(createResponse(false, 'No matching notifications found for deletion'));
                return
            }

            res.status(200).json(createResponse(true, `Successfully deleted ${deleteCount} notification(s)`));
        } catch (error) {
            handleError(error, req, res, 'An error occurred while deleting notifications');
        }
    } else {
        res.status(400).json(createResponse(false, 'Invalid request parameters'));
    }
});

export {
    getAllNotifications,
    deleteNotification
};