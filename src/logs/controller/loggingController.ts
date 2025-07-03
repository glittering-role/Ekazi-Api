import { Request, Response } from "express";
import { createResponse } from "../helpers/response";
import { ErrorLog } from "../model/errorLogs";
import { Op } from "sequelize";
import { asyncHandler } from "../../middleware/async-middleware";
import logger from "../helpers/logger";

// Utility function for error logging and response
const handleError = (error: unknown, req: Request, res: Response, executionTime: number, message: string) => {
  const errorMsg = error instanceof Error ? error.message : 'An unknown error occurred';
  logger.error(message, {
    method: req.method,
    route: req.originalUrl,
    executionTime,
    error: errorMsg,
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });

  res.status(500).json(createResponse(false, message));
};


// Controller function to fetch logs with asyncHandler wrapper
const getLogs = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { logLevel, page = 1, limit = 100 } = req.query;
  const startTime = Date.now();

  try {
    const pageNumber = parseInt(String(page), 10) || 1;
    const pageSize = parseInt(String(limit), 10) || 100;

    if (isNaN(pageNumber) || pageNumber < 1 || isNaN(pageSize) || pageSize < 1) {
      const errorMessage = isNaN(pageNumber) || pageNumber < 1
          ? 'Invalid page number, should start with 1'
          : 'Invalid limit number, should be at least 1';
      logger.error(errorMessage, { method: req.method, route: req.originalUrl });
       res.status(400).json(createResponse(false, errorMessage));
    }

    const whereCondition = logLevel ? { level: logLevel } : {};

    const [logs, itemCount] = await Promise.all([
      ErrorLog.findAll({
        where: whereCondition,
        order: [['createdAt', 'DESC']],
        offset: (pageNumber - 1) * pageSize,
        limit: pageSize,
      }),
      ErrorLog.count({ where: whereCondition }),
    ]);

    const pageCount = Math.ceil(itemCount / pageSize);
    res.status(200).json(createResponse(true, logs.length ? 'Logs fetched successfully' : 'No logs found', {
      logs: logs.length ? logs : {},
      meta: { pageCount, itemCount, currentPage: pageNumber }
    }));

  } catch (error) {
    const executionTime = Date.now() - startTime;
    handleError(error, req, res, executionTime, 'Error fetching logs');
  }
});

// Deletes logs based on an array of provided dates
const deleteLogsByDate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { dates } = req.query;
  const startTime = Date.now();

  try {
    const dateArray = JSON.parse(dates as string);

    if (!Array.isArray(dateArray) || dateArray.length === 0) {
      const errorMessage = !Array.isArray(dateArray) ? 'Dates must be an array' : 'Dates array cannot be empty';
      logger.error(errorMessage, { method: req.method, route: req.originalUrl });
       res.status(400).json(createResponse(false, errorMessage));
    }

    await ErrorLog.destroy({
      where: {
        createdAt: {
          [Op.in]: dateArray.map((date: string) => new Date(date)),
        },
      },
    });

    res.status(200).json(createResponse(true, 'Logs deleted successfully.'));
  } catch (error: unknown) {
    const executionTime = Date.now() - startTime;
    handleError(error, req, res, executionTime, 'Invalid dates format. Provide a valid JSON array of dates.');
  }
});

// Deletes all logs in batches
const deleteAllLogs = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const BATCH_SIZE = 1000;
  let totalDeleted = 0;
  const startTime = Date.now();

  try {
    while (true) {
      const deletedCount = await ErrorLog.destroy({
        where: {},
        limit: BATCH_SIZE,
      });

      totalDeleted += deletedCount;
      if (deletedCount < BATCH_SIZE) break;
    }

    res.status(200).json(createResponse(true, `All logs deleted successfully. Total logs deleted: ${totalDeleted}`));
  } catch (error : unknown) {
    const executionTime = Date.now() - startTime;
    handleError(error, req, res, executionTime, 'Error deleting all logs');
  }
});

export { getLogs, deleteLogsByDate, deleteAllLogs };
