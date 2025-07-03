import { Notification } from "../models/associations";
import { io, onlineUsers } from "../../../config/ws";
import logger from "../../../logs/helpers/logger";
import {notificationQueue} from "../../../queue/notification.queue";

/**
 * Create notifications for users and enqueue jobs to BullMQ.
 * @param users - A single user ID or an array of user IDs.
 * @param notificationType - The type of notification.
 * @param message - The notification message.
 */
const createNotifications = async (
    users: string | string[] | null | undefined,
    notificationType: string,
    message: string
) => {
    try {
        const userArray = Array.isArray(users) ? users : [users];

        // Bulk create notifications in DB
        const notifications = await Notification.bulkCreate(
            userArray.map((userId) => ({
                user_id: userId,
                notification_type: notificationType,
                notification_content: message,
            }))
        );

        // Add notification jobs to BullMQ queue
        for (const notification of notifications) {
            await notificationQueue.add("sendNotification", {
                notificationId: notification.id,
                userId: notification.user_id,
                notificationType,
                message,
            });
        }

        // Send real-time notifications to online users
        const onlineUserIds = userArray.filter((userId) => onlineUsers.has(userId || ""));
        onlineUserIds.forEach((userId) => {
            const userSocketId = onlineUsers.get(userId || "");
            if (userSocketId) {
                const notificationForUser = notifications.find((n) => n.user_id === userId);
                if (notificationForUser) {
                    io.to(userSocketId).emit("notification", {
                        _id: notificationForUser.id,
                        notification_type: notificationType,
                        notification_content: message,
                        createdAt: notificationForUser.createdAt,
                        is_read: false,
                    });
                }
            }
        });

    } catch (error: any) {
        logger.error(`Error creating notifications: ${error.message}`, {
            metadata: { timestamp: new Date().toISOString(), stack: error.stack },
        });
    }
};

export { createNotifications };
