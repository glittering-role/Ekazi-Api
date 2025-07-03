import { Op, Transaction } from "sequelize";
import logger from "../../../../logs/helpers/logger";
import DefaultAvailability from "../../models/default_availability";
import db from "../../../../config/db";

const BATCH_SIZE = 1000; // Adjust based on DB performance

export const removeOldAvailabilityDates = async () => {
    let transaction: Transaction | null = null;
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        transaction = await db.transaction();
        let deletedCount = 0;
        let updatedCount = 0;
        let offset = 0;
        let hasMoreRecords = true;

        while (hasMoreRecords) {
            const availabilities = await DefaultAvailability.findAll({
                limit: BATCH_SIZE,
                offset: offset,
                order: [["createdAt", "ASC"]],
                transaction,
            });

            if (availabilities.length === 0) {
                hasMoreRecords = false;
                break;
            }

            offset += availabilities.length;

            const toDelete: string[] = [];
            const toUpdate: { id: string; selected_dates: string[] }[] = [];

            // Filter in memory
            for (const availability of availabilities) {
                const updatedDates = availability.selected_dates.filter(
                    (date: string) => new Date(date) >= oneWeekAgo
                );

                if (updatedDates.length === 0) {
                    toDelete.push(availability.id);
                } else if (updatedDates.length !== availability.selected_dates.length) {
                    toUpdate.push({ id: availability.id, selected_dates: updatedDates });
                }
            }

            // Bulk delete
            if (toDelete.length > 0) {
                const count = await DefaultAvailability.destroy({
                    where: { id: { [Op.in]: toDelete } },
                    transaction, // Pass the transaction
                });
                deletedCount += count;
            }

            // Bulk update using parallel queries
            if (toUpdate.length > 0) {
                const updatePromises = toUpdate.map(update =>
                    DefaultAvailability.update(
                        { selected_dates: update.selected_dates },
                        {
                            where: { id: update.id },
                            transaction,
                        }
                    )
                );

                const results = await Promise.all(updatePromises);
                updatedCount += results.filter(Boolean).length;
            }

            logger.info(`Processed batch: Deleted ${deletedCount}, Updated ${updatedCount}`);
        }

        await transaction.commit();
        logger.info(`Cleanup complete: Deleted ${deletedCount} records, Updated ${updatedCount}`);
    } catch (error) {
        if (transaction) await transaction.rollback();
        logger.error("Error during availability cleanup:", { error });
        throw error;
    }
};