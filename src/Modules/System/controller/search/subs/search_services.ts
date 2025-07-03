import db from "../../../../../config/db";
import { QueryTypes } from "sequelize";
import { isValidGeneralQuery } from "../../../../../utils/validation/validate_query";
import { redis_client } from "../../../../../config/redis_config"; // Import Redis client

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error("Query timeout exceeded")), ms)
        ),
    ]);
}

async function searchServicesStream(query: string) {
    try {
        // Validate the query
        if (!isValidGeneralQuery(query)) {
            return null;
        }

        const cacheKey = `search:services:${query}`;

        // Check if results are cached in Redis
        const cachedResults = await redis_client.get(cacheKey);
        if (cachedResults) {
            console.log("Returning cached results for query:", query);
            return JSON.parse(cachedResults);
        }

        // SQL query to fetch services with price, images, and provider details
        const sql = `
            SELECT 
                s.id,
                s.title,
                s.description,
                s.price_from,
                s.price_to,
                s.location,
                si.image_url AS image,
                sp.business_name AS provider_business_name,
                u.username AS provider_username,
                ud.first_name AS provider_first_name,
                ud.last_name AS provider_last_name,
                ud.image AS provider_image
            FROM services s
            LEFT JOIN service_images si ON s.id = si.service_id AND si.is_primary = true
            LEFT JOIN service_providers sp ON s.provider_id = sp.id
            LEFT JOIN users u ON sp.user_id = u.id
            LEFT JOIN user_details ud ON u.id = ud.user_id
            WHERE s.title LIKE :query
            OR s.description LIKE :query
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

        // Format the results to include price, images, and provider details
        const formattedResults = results.map((result: any) => ({
            id: result.id,
            title: result.title,
            description: result.description,
            price: {
                from: result.price_from,
                to: result.price_to,
            },
            image: result.image,
            provider: {
                business_name: result.provider_business_name,
                username: result.provider_username,
                name: `${result.provider_first_name} ${result.provider_last_name}`,
                image: result.provider_image,
            },
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
        throw new Error("Failed to fetch services. Please try again later.");
    }
}

export { searchServicesStream };