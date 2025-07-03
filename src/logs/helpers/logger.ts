import { createLogger, format, transports, Logger, LogMethod } from 'winston';
import * as path from 'path';
import * as fs from 'fs';
import { ErrorLog } from '../model/errorLogs';

// Define types for the log entry
interface LogEntry {
  level: string;
  message: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
  stack?: string;
}

// Create a buffer for batching logs
let logBuffer: LogEntry[] = [];
const BATCH_SIZE = 1000;
const FLUSH_INTERVAL = 60 * 1000;
const MAX_RETRY_ATTEMPTS = 3;

// Function to insert logs into MySQL
const insertLogsToMySQL = async (logs: LogEntry[], attempt = 1): Promise<void> => {
  try {
    const transformedLogs = logs.map(log => ({
      ...log,
      metadata: JSON.stringify(log.metadata),  // Convert metadata to string
    }));

    await ErrorLog.bulkCreate(transformedLogs);
  } catch (error) {
    if (attempt < MAX_RETRY_ATTEMPTS) {
      await insertLogsToMySQL(logs, attempt + 1);  // Retry on failure
    } else {
      const errorFilePath = path.join(__dirname, 'error-backup.log');
      const backupLog = logs.map(log => `${log.timestamp} [${log.level.toUpperCase()}] - ${log.message}\n${log.stack || ''}`).join('\n');
      fs.appendFileSync(errorFilePath, backupLog);
    }
  }
};

// Function to flush logs
const flushLogs = async (): Promise<void> => {
  if (logBuffer.length > 0) {
    // Log the batch
    logger.info(`Flushing batch of ${logBuffer.length} logs.`);

    // Insert logs into MySQL
    await insertLogsToMySQL(logBuffer);

    // Clear the buffer after flushing
    logBuffer = [];
  }
};

// Set an interval to flush logs every minute
setInterval(flushLogs, FLUSH_INTERVAL);

// Common log transport for both file and console
const commonTransports = [
  new transports.File({
    level: 'error',
    filename: path.join(__dirname, 'error.log'),
  }),
  new transports.File({
    level: 'warn',
    filename: path.join(__dirname, 'warning.log'),
  }),
  new transports.File({
    level: 'info',
    filename: path.join(__dirname, 'info.log'),
  }),
];

// Ensure at least one transport for production
const productionTransports = process.env.NODE_ENV === 'production' ? [
  new transports.Console(),
  new transports.File({
    level: 'error',
    filename: path.join(__dirname, 'production-error.log'),
  }),
] : commonTransports;

// Configure the logger with existing transports
const logger: Logger = createLogger({
  level: 'info',
  format: format.combine(
      format.timestamp(),
      format.printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} [${level.toUpperCase()}] - ${message}\n${stack || ''}`;
      })
  ),
  transports: productionTransports,
});

// Add console logging for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(format.colorize(), format.simple()),
  }));
}

// Override the default log method to add to the buffer
const originalLog = logger.log as LogMethod;

// @ts-ignore
logger.log = (level: string, message: string, metadata?: Record<string, unknown>, callback?: () => void): Logger => {
  const logEntry: LogEntry = { level, message, metadata: metadata || {}, timestamp: new Date() };
  logBuffer.push(logEntry);

  if (logBuffer.length >= BATCH_SIZE) {
    setImmediate(() => flushLogs());  // Async flush, but non-blocking
  }

  // Call the original log method with the correct number of arguments (level, message, metadata, callback)
  // @ts-ignore
  originalLog.call(logger, level, message, metadata, callback);

  // Return the logger to match the expected return type
  return logger;
};

// Export the logger
export default logger;
