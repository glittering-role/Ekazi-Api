// export const sendBatchNotifications = async (notifications: any[]) => {
//     try {
//         const messages = notifications.map(({ user_id, provider_id, message }) => [
//             { userId: user_id, message },
//             { userId: provider_id, message },
//         ]).flat(); // Flatten into a single array
//
//         console.log(`📩 Sending ${messages.length} notifications...`);
//
//         // Simulate async bulk send (replace with actual push/SMS service)
//         await Promise.all(messages.map((notif) => fakeSendNotification(notif.userId, notif.message)));
//
//         console.log("✅ All notifications sent.");
//     } catch (error) {
//         console.error("❌ Batch Notification Error:", error);
//     }
// };
//
// // Simulated async notification sender (Replace with actual service)
// const fakeSendNotification = async (userId: string, message: string) => {
//     return new Promise((resolve) => setTimeout(() => {
//         console.log(`📢 Notification sent to ${userId}: ${message}`);
//         resolve(true);
//     }, Math.random() * 200)); // Random delay to simulate network latency
// };
