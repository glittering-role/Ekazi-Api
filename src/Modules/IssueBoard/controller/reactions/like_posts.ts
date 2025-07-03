import { Request, Response } from "express";
import { createResponse } from "../../../../logs/helpers/response";
import { validateInput } from "../../../../utils/validation/validation";
import { getUserIdFromToken } from "../../../../utils/user/get_userId";
import { handleError } from "../../../../logs/helpers/erroHandler";
import toggleLikeQueue from "../../../../queue/toggleLike.queue";
import {asyncHandler} from "../../../../middleware/async-middleware";

 const toggleLike = asyncHandler(
     async (req: Request, res: Response): Promise<void> => {
    const user_id = getUserIdFromToken(req);
    if (!user_id) {
         res.status(401).json(createResponse(false, "User not authenticated"));
        return
    }

    const { value, errors } = validateInput(req.body);
    if (errors || !value) {
         res.status(400).json(
            createResponse(false, "Validation failed", {
                errors: errors || ["Invalid input data"],
            })
        );
        return
    }

    try {
        await toggleLikeQueue.add("toggleLikeJob", {
            user_id,
            post_id: value.post_id,
        });

         res.status(202).json(createResponse(true, "Like toggle job enqueued"));
        return
    } catch (error) {
        handleError(error, req, res, "Failed to toggle like");
    }
});

 export default toggleLike;
