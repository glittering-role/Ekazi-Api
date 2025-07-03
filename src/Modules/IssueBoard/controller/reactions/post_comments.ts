import { Request, Response } from 'express';
import { createResponse } from '../../../../logs/helpers/response';
import { validateInput } from '../../../../utils/validation/validation';
import { getUserIdFromToken } from '../../../../utils/user/get_userId';
import db from "../../../../config/db";
import {CommentReplies, Comment} from "../../models/associations";
import {handleError} from "../../../../logs/helpers/erroHandler";
import {asyncHandler} from "../../../../middleware/async-middleware";

// Create a comment on a post
export const createComment= asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
    const transaction = await db.transaction();

    try {
        const user_id = getUserIdFromToken(req);
        if (!user_id) {
            await transaction.rollback();
             res.status(401).json(
                createResponse(false, "User not authenticated")
            );
            return
        }

        // Validate input
        const { value, errors } = validateInput(req.body);
        if (errors) {
            res
                .status(400)
                .json(createResponse(false, "Validation failed", { errors }));
            return;
        }

        // Ensure value is defined
        if (!value) {
            res.status(400).json(
                createResponse(false, "Validation failed", {
                    errors: ["Invalid input data"],
                })
            );
            return;
        }

        const { post_id, comment, parent_comment_id } = value;

        // If this is a reply, validate that the parent comment exists
        if (parent_comment_id) {
            const parentComment = await Comment.findOne({
                where: { id: parent_comment_id, post_id },
                transaction,
            });

            if (!parentComment) {
                await transaction.rollback();
                 res.status(404).json(
                    createResponse(false, "Parent comment not found or does not belong to this post")
                );
                return
            }
        }

        // Create the comment or reply
        let newComment;
        if (parent_comment_id) {
            // Create a reply
            newComment = await CommentReplies.create(
                {
                    post_id,
                    user_id,
                    comment,
                    parent_comment_id,
                },
                { transaction }
            );
        } else {
            // Create a top-level comment
            newComment = await Comment.create(
                {
                    post_id,
                    user_id,
                    comment,
                },
                { transaction }
            );
        }

        await transaction.commit();
         res.status(201).json(
            createResponse(true, "Comment created successfully", { comment: newComment })
        );
    } catch (error) {
        await transaction.rollback();
        handleError(
            error,
            req,
            res,
            "Failed to create comment"
        );
    }
});

// Delete a comment
export const deleteComment = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
    const transaction = await db.transaction();

    try {
        const user_id = getUserIdFromToken(req);
        if (!user_id) {
            await transaction.rollback();
             res.status(401).json(
                createResponse(false, "User not authenticated")
            );
            return
        }

        const { comment_id } = req.params;

        // Try to find and delete the user's comment
        const deletedComment = await Comment.destroy({
            where: { id: comment_id, user_id },
            transaction,
        });

        if (deletedComment) {
            await transaction.commit();
             res.status(200).json(
                createResponse(true, "Comment deleted successfully")
            );
            return
        }

        // Try to find and delete the user's reply
        const deletedReply = await CommentReplies.destroy({
            where: { id: comment_id, user_id },
            transaction,
        });

        if (deletedReply) {
            await transaction.commit();
             res.status(200).json(
                createResponse(true, "Reply deleted successfully")
            );
            return
        }

        // If neither the comment nor the reply is found or belongs to the user
        await transaction.rollback();
         res.status(404).json(
            createResponse(false, "Comment or reply not found or you do not have permission to delete it")
        );

    } catch (error) {
        await transaction.rollback();
        handleError(
            error,
            req,
            res,
            "Failed to delete comment or reply"
        );
    }
});