import db from "../../../../../config/db";
import { QueryTypes } from "sequelize";
import {isValidGeneralQuery} from "../../../../../utils/validation/validate_query";
import { redis_client } from "../../../../../config/redis_config";

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error("Query timeout exceeded")), ms)
        ),
    ]);
}

async function searchJobSubCategoriesStream(query: string) {
    try {
        const cacheKey = `search:jobSubCategories:${query}`;
        const cachedResults = await redis_client.get(cacheKey);

        if (cachedResults) {
            return JSON.parse(cachedResults);
        }

        if (!isValidGeneralQuery(query)) return null;

        const sql = `
            SELECT id, job_subcategory_name AS name
            FROM job_subcategories
            WHERE job_subcategory_name LIKE :query
            LIMIT 10;
        `;

        const results = await withTimeout(
            db.query(sql, {
                replacements: { query: `%${query}%` },
                type: QueryTypes.SELECT,
                raw: true,
                benchmark: true,
            }),
            5000 // 5-second timeout
        );

        // Cache the results in Redis
        await redis_client.set(cacheKey, JSON.stringify(results), "EX", 60); // Cache for 60 seconds

        return results;
    } catch (error) {
        console.error("Error in searchJobSubCategoriesStream:", error);
        throw new Error("Failed to fetch job subcategories. Please try again later.");
    }
}

export { searchJobSubCategoriesStream };

