import { Op } from "sequelize";
import { ServiceOrder } from "../../models/associations";

export const checkExpiredOrders = async (): Promise<void> => {
    try {
        const now = new Date();

        // Update all expired orders at once
        const [updatedCount] = await ServiceOrder.update(
            { status: 'expired' },
            {
                where: {
                    status: 'pending',
                    expires_at: { [Op.lte]: now },
                },
            }
        );

        if (updatedCount > 0) {
            console.log(`${updatedCount} order(s) have expired.`);
        }
        
    } catch (error) {
        console.error('Error checking for expired orders:', error);
    }
};
