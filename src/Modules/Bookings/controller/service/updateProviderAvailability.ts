import {ServiceProviders} from "../../../Services/models/associations";
import {Booking} from "../../models/associations";
import {Op} from "sequelize";
import db from "../../../../config/db";
import logger from "../../../../logs/helpers/logger";

export const updateProviderAvailability = async () => {
    let transaction;
    try {
        const currentTime = new Date();
        transaction = await db.transaction();

        // Get all providers with active bookings in a single query
        const activeProviders = await Booking.findAll({
            attributes: [[db.fn('DISTINCT', db.col('provider_id')), 'provider_id']],
            where: {
                status: 'confirmed',
                start_time: { [Op.lte]: currentTime },
                end_time: { [Op.gte]: currentTime }
            },
            transaction,
            raw: true
        });

        const activeProviderIds = activeProviders.map(p => p.provider_id);

        // Bulk update all providers in two operations
        await ServiceProviders.update({
            is_occupied: true,
            availability: 'unavailable'
        }, {
            where: { id: { [Op.in]: activeProviderIds } },
            transaction
        });

        await ServiceProviders.update({
            is_occupied: false,
            availability: 'available'
        }, {
            where: { id: { [Op.notIn]: activeProviderIds } },
            transaction
        });

        await transaction.commit();

    } catch (error : any) {
        if (transaction) await transaction.rollback();
        logger.error(`❌ Error updating provider availability: ${error.message}`, {
            metadata: {
                timestamp: new Date().toISOString(),
                error: error.message,
                stack: error.stack,
            },
        });
    }
};