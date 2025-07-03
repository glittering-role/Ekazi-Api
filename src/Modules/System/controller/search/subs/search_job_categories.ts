import db from "../../../../../config/db";
import { QueryTypes } from "sequelize";
import { isValidGeneralQuery } from "../../../../../utils/validation/validate_query";
import { redis_client } from "../../../../../config/redis_config"; 

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error("Query timeout exceeded")), ms)
        ),
    ]);
}

async function searchJobCategoriesStream(query: string) {
    try {
        // Validate the query
        if (!isValidGeneralQuery(query)) {
            return null;
        }

        // Generate a unique cache key
        const cacheKey = `search:jobCategories:${query}`;

        const cachedResults = await redis_client.get(cacheKey);
        if (cachedResults) {
            console.log("Returning cached results for query:", query);
            return JSON.parse(cachedResults);
        }

        // SQL query to fetch job categories
        const sql = `
            SELECT id, job_category_name AS name
            FROM job_categories
            WHERE job_category_name LIKE :query
            LIMIT 10;
        `;

        // Execute the query with a timeout
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
        if (results && results.length > 0) {
            await redis_client.set(cacheKey, JSON.stringify(results), "EX", 60); 
            console.log("Cached results for query:", query);
        }

        return results;
    } catch (error:any) {

        if (error.message === "Query timeout exceeded") {
            throw new Error("The search operation took too long. Please try again later.");
        }

        throw new Error("Failed to fetch job categories. Please try again later.");
    }
}

export { searchJobCategoriesStream };