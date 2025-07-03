import { Sequelize, Op } from "sequelize";

/**
 * Builds a filter to find the provider's default availability slot.
 * Uses JSON_CONTAINS to check if the booking date is present in the selected_dates JSON array.
 *
 * @param provider_user_id - The ID of the provider user.
 * @param bookingDate - The booking date in YYYY-MM-DD format.
 * @param formattedStartTime - The formatted start time (HH:mm:ss).
 * @param formattedEndTime - The formatted end time (HH:mm:ss).
 * @returns An object suitable for use as a Sequelize "where" filter.
 */
export const buildDefaultAvailabilityFilter = (
    provider_user_id: string,
    bookingDate: string,
    formattedStartTime: string,
    formattedEndTime: string
) => ({
    provider_id: provider_user_id,
    start_time: { [Op.lte]: formattedStartTime },
    end_time: { [Op.gte]: formattedEndTime },
    [Op.and]: Sequelize.where(
        Sequelize.fn("JSON_CONTAINS", Sequelize.col("selected_dates"), JSON.stringify(bookingDate)),
        1
    ),
});
