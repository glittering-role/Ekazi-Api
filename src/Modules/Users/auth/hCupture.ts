import axios from 'axios';
import logger from "../../../logs/helpers/logger";

require('dotenv').config();

// hCaptcha secret key
const HC_SECRET_KEY = process.env.SECRET_KEY

const verifyHcaptcha = async (hcaptchaToken : any) => {
    try {
        const response = await axios.post('https://hcaptcha.com/siteverify', null, {
            params: {
                secret: HC_SECRET_KEY,
                response: hcaptchaToken,
            },
        });
        return response.data.success;
    } catch (error : any) {
        logger.error(`Error verifying hCaptcha: ${error.message}`, {
            metadata: {
                timestamp: new Date().toISOString(),
                error: error.message,
                stack: error.stack,
            },
        });
        return false;


    }
};
export { verifyHcaptcha }
