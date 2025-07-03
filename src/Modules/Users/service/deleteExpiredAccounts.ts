import { Op } from "sequelize";
import { AccountToDelete, Users } from "../model/associations";
import db from "../../../config/db";
import logger from "../../../logs/helpers/logger";

export const deleteExpiredAccounts = async (): Promise<void> => {
  const transaction = await db.transaction(); // Start transaction

  try {
    const now = new Date();

    // Find accounts whose deletion date has passed
    const expiredAccounts = await AccountToDelete.findAll({
      where: {
        deletion_date: { [Op.lte]: now },
      },
      transaction, 
    });

    if (expiredAccounts.length === 0) {
      await transaction.commit(); 
      return;
    }

    for (const account of expiredAccounts) {
      const user = await Users.findByPk(account.user_id, { transaction });

      if (user) {
        await user.destroy({ force: true, transaction }); 
      }

      await account.destroy({ transaction }); 
    }

    await transaction.commit(); 
    logger.info(`✅ Deleted ${expiredAccounts.length} expired accounts.`);
  } catch (error) {
    await transaction.rollback(); // Rollback on error
    logger.error("❌ Error deleting expired accounts:", error);
  }
};
