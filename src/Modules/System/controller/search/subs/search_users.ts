import db from "../../../../../config/db";
import { QueryTypes } from "sequelize";
import { isValidUserQuery } from "../../../../../utils/validation/validate_query";
import { redis_client } from "../../../../../config/redis_config"; // Import Redis client

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error("Query timeout exceeded")), ms)
        ),
    ]);
}

async function searchUsersStream(query: string) {
    try {
        // Validate the query
        if (!isValidUserQuery(query)) {
            return null;
        }

        // Generate a unique cache key
        const cacheKey = `search:users:${query}`;

        // Check if results are cached in Redis
        const cachedResults = await redis_client.get(cacheKey);
        if (cachedResults) {
            console.log("Returning cached results for query:", query);
            return JSON.parse(cachedResults);
        }

        // SQL query to fetch users
        const sql = `
            SELECT 
                u.id, u.email, u.username, 
                ud.first_name, ud.last_name, ud.image,
                CASE WHEN sp.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_service_provider
            FROM users u
            LEFT JOIN user_details ud ON u.id = ud.user_id
            LEFT JOIN service_providers sp ON u.id = sp.user_id
            WHERE u.email LIKE :query
            OR u.username LIKE :query
            OR u.phone_number LIKE :query
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

        // Format the results to include user details
        const formattedResults = results.map((result: any) => ({
            id: result.id,
            email: result.email,
            username: result.username,
            name: `${result.first_name} ${result.last_name}`,
            image: result.image,
            is_service_provider: result.is_service_provider,
        }));

        // Cache the results in Redis
        if (formattedResults && formattedResults.length > 0) {
            await redis_client.set(cacheKey, JSON.stringify(formattedResults), "EX", 60); // Cache for 60 seconds
            console.log("Cached results for query:", query);
        }

        return formattedResults;
    } catch (error: any) {
        // Handle specific timeout errors
        if (error.message === "Query timeout exceeded") {
            throw new Error("The search operation took too long. Please try again later.");
        }

        // Handle other errors
        throw new Error("Failed to fetch users. Please try again later.");
    }
}

export { searchUsersStream };