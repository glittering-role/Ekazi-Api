import cron from 'node-cron';
import logger from "../../logs/helpers/logger";
import { checkExpiredOrders } from "../../Modules/Services/ServiceOrder/Job/check_expired_orders";
import {removeOldAvailabilityDates} from "../../Modules/Bookings/controller/service/removeOldAvailabilityDates";
import {sendBookingReminders} from "../../Modules/Bookings/controller/service/sendBookingReminders";
import {updateProviderAvailability} from "../../Modules/Bookings/controller/service/updateProviderAvailability";

// Reusable error handling and logging function
const handleCronError = (jobName: string, error: unknown): void => {
    if (error instanceof Error) {
        logger.error(`Error in cron job (${jobName}): ${error.message}`, {
            metadata: {
                timestamp: new Date().toISOString(),
                error: error.message,
                stack: error.stack,
            },
        });
    } else {
        logger.error(`Unknown error occurred in cron job (${jobName})`, {
            metadata: { timestamp: new Date().toISOString() },
        });
    }
};

// Cron job to run every minute
cron.schedule('* * * * *', async () => {
    try {
        // 1. Process notification jobs
        await updateProviderAvailability()
    } catch (error: unknown) {
        handleCronError('every minute', error);
    }
});

// Cron job after 10 minutes to check expired orders
cron.schedule('*/10 * * * *', async () => {
    try {
        // 1. Check expired orders
        await checkExpiredOrders();
    } catch (error: unknown) {
        handleCronError('every 10 minutes', error);
    }
});

// Cron job to remove availability dates older than 1 week, running every midnight
cron.schedule("0 0 * * *", async () => {
    try {
        await removeOldAvailabilityDates();
    } catch (error: unknown) {
        handleCronError('remove old availability dates (midnight)', error);
    }
});

cron.schedule("0 * * * *", async () => {
    try {
        await sendBookingReminders();
    } catch (error: unknown) {
        handleCronError('Error sending booking reminders Cron', error);
    }

});




