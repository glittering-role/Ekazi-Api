// import dotenv from 'dotenv';
// import winston from 'winston';
// import { AuditLog } from '../model/auditLog';
// import logger from '../helpers/logger';
//
// // Load environment variables
// dotenv.config();
//
// // Define custom levels for audit logging
// const customAuditLevels = {
//   levels: {
//     audit: 0,
//   },
//   colors: {
//     audit: 'blue',
//   },
// };
//
// // Configure Winston logger for audit level only
// const auditLogger = winston.createLogger({
//   levels: customAuditLevels.levels,
//   level: 'audit',
//   transports: [
//     new winston.transports.File({ filename: 'audit.log' }), // This stores logs to a file
//   ],
// });
//
// winston.addColors(customAuditLevels.colors);
//
// // In-memory cache to store logs temporarily
// let auditLogCache: Array<any> = [];
// let auditLogTracker: Record<string, number> = {}; // To track unique logs based on user, model, action, and meta
//
// const BATCH_SIZE = 1500;
//
// // Function to generate a unique key for each log entry based on relevant fields
// const generateLogKey = (userId: string, modelName: string, action: string, meta: object): string => {
//   return `${userId}-${modelName}-${action}-${JSON.stringify(meta)}`;
// };
//
// // Function to log audit activity
// const logAuditActivity = async (req: any, modelName: string, action: string, meta: object = {}): Promise<void> => {
//   try {
//     const userId = req.user?.userId?.id || "Anonymous";
//
//     // Extract browser details directly from user-agent header
//     const userAgent = req.headers['user-agent'] || 'Unknown';
//     let browserDetails = { family: 'Unknown', major: 'Unknown', os: 'Unknown', device: 'Unknown' };
//
//     // Extract basic browser and device information from the user-agent string using regex
//     const browserRegex = /(firefox|msie|trident|chrome|safari|opera|edge)\/(\d+)/i;
//     const deviceRegex = /(mobile|tablet|desktop)/i;
//
//     const browserMatch = userAgent.match(browserRegex);
//     const deviceMatch = userAgent.match(deviceRegex);
//
//     if (browserMatch) {
//       browserDetails.family = browserMatch[1] || 'Unknown';
//       browserDetails.major = browserMatch[2] || 'Unknown';
//     }
//
//     // Simple device detection
//     if (deviceMatch) {
//       browserDetails.device = deviceMatch[1] || 'Unknown';
//     }
//
//     // Extract operating system (example for Windows and MacOS)
//     if (/windows/i.test(userAgent)) {
//       browserDetails.os = 'Windows';
//     } else if (/macintosh|mac os x/i.test(userAgent)) {
//       browserDetails.os = 'Mac OS';
//     } else if (/android/i.test(userAgent)) {
//       browserDetails.os = 'Android';
//     } else if (/iphone|ipod|ipad/i.test(userAgent)) {
//       browserDetails.os = 'iOS';
//     }
//
//     // Construct the metadata with endpoint, browser, and device details
//     const fullMeta = {
//       ...meta,
//       endpoint: req.originalUrl,
//       browser: {
//         browserName: browserDetails.family,
//         browserVersion: browserDetails.major,
//         os: browserDetails.os,
//       },
//       device: browserDetails.device,
//     };
//
//     // Generate a unique key for this log entry
//     const logKey = generateLogKey(userId, modelName, action, fullMeta);
//
//     // Set the time window for duplicate checks (e.g., 1 minute)
//     const TIME_WINDOW = 60; // Time window in seconds (1 minute)
//
//     // Check if the logKey exists within the last time window (1 minute)
//     if (auditLogTracker[logKey] && Date.now() - auditLogTracker[logKey] < TIME_WINDOW * 1000) {
//       // If log already exists within the time window, skip adding it to cache
//       return;
//     }
//
//     // Update the tracker with the current timestamp for this logKey
//     auditLogTracker[logKey] = Date.now();
//
//     // Add the log to the in-memory cache
//     auditLogCache.push({
//       userId,
//       modelName,
//       action,
//       meta: fullMeta,
//     });
//
//     // If the cache has reached the batch size, write the logs to the database and log file
//     if (auditLogCache.length >= BATCH_SIZE) {
//       // Save the audit logs to the database
//       await AuditLog.bulkCreate(auditLogCache);
//
//       // Write audit details to the log file
//       auditLogCache.forEach(log => {
//         const logMessage = `User ID: ${log.userId || 'Anonymous'} | Model: ${log.modelName} | Action: ${log.action} | Meta: ${JSON.stringify(log.meta)}`;
//         auditLogger.log('audit', logMessage);
//       });
//
//       // Clear the cache after writing the logs
//       auditLogCache = [];
//     }
//
//   } catch (error) {
//     // Handle any errors that might occur during logging
//     logger.error(`Error logging audit activity: ${error.message}`, {
//       metadata: {
//         route: req.originalUrl,
//         method: req.method,
//         timestamp: new Date().toISOString(),
//         error: error.message,
//       }
//     });
//   }
// };
//
// export default logAuditActivity;
