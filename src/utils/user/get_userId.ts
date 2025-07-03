import { Request } from "express";
import logger from "../../logs/helpers/logger";

// Define types for the access token and user object
interface User {
    id: string;
}

interface AccessToken {
    userId?: User;
}

// Function to extract user ID from the token
const getUserIdFromToken = (req: Request): string | undefined => {
    try {
        // Extract the access token from the request
        const accessToken = req.user as AccessToken | null;

        // Check if userId exists in the access token
        if (!accessToken || !accessToken.userId || !accessToken.userId.id) {

            // Return undefined if userId is not found
            return undefined;
        }

        return accessToken.userId.id;
    } catch (error: any) {
        logger.error(`Error extracting user ID: ${error.message}`, {
            metadata: {
                timestamp: new Date().toISOString(),
                error: error.message,
                stack: error.stack,
            },
        });

        throw new Error(`Error extracting user ID: ${error.message}`);
    }
};

export { getUserIdFromToken };
