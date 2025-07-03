import express from 'express';
import {
    createSubCategory,
    getSubCategoriesByCategoryId,
    getSubCategoryById,
    updateSubCategory,
    deleteSubCategory,
    toggleSubCategoryStatus,
    getAllSubCategories
} from "../../controllers/subCategory/job_subcategories";
import {verifyToken} from "../../../Users/middleware/jwt_auth";
import upload from "../../../../utils/multer/image_upload";

const SubCategoryRouter = express.Router();

SubCategoryRouter.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Job Subcategories
 *   description: Job subcategory management
 */

/**
 * @swagger
 * /subcategories/create-sub-category:
 *   post:
 *     summary: Create a new job subcategory
 *     tags: [Job Subcategories]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               category_id:
 *                 type: string
 *                 example: 1
 *               job_subcategory_name:
 *                 type: string
 *                 example: Software Development
 *               job_subcategory_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Subcategory created successfully.
 *       400:
 *         description: Validation failed or missing fields.
 *       404:
 *         description: Category not found.
 *       500:
 *         description: Internal Server Error.
 */
SubCategoryRouter.post('/create-sub-category', upload, createSubCategory);

/**
 * @swagger
 * /subcategories/get-all-subcategories:
 *   get:
 *     summary: Get all sub categories with pagination
 *     tags: [Job Subcategories]
 *     responses:
 *       200:
 *         description: A list of sub categories.
 *       500:
 *         description: Internal server error.
 */
SubCategoryRouter.get('/get-all-subcategories', getAllSubCategories);

/**
 * @swagger
 * /subcategories/{category_id}:
 *   get:
 *     summary: Get all subcategories for a specific category
 *     tags: [Job Subcategories]
 *     parameters:
 *       - in: path
 *         name: category_id
 *         required: true
 *         schema:
 *           type: string
 *           example: 1
 *     responses:
 *       200:
 *         description: Subcategories retrieved successfully.
 *       404:
 *         description: No subcategories found.
 *       500:
 *         description: Internal Server Error.
 */
SubCategoryRouter.get('/:category_id', getSubCategoriesByCategoryId);

/**
 * @swagger
 * /subcategories/subcategories-by-id/{id}:
 *   get:
 *     summary: Get a subcategory by ID
 *     tags: [Job Subcategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 1
 *     responses:
 *       200:
 *         description: Subcategory retrieved successfully.
 *       404:
 *         description: Subcategory not found.
 *       500:
 *         description: Internal Server Error.
 */
SubCategoryRouter.get('/subcategories-by-id/:id', getSubCategoryById);

/**
 * @swagger
 * /subcategories/update-subCategory/{id}:
 *   patch:
 *     summary: Update a job subcategory
 *     tags: [Job Subcategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               job_subcategory_name:
 *                 type: string
 *                 example: Web Development
 *               job_subcategory_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Subcategory updated successfully.
 *       400:
 *         description: Validation failed or missing fields.
 *       404:
 *         description: Subcategory not found.
 *       500:
 *         description: Internal Server Error.
 */
SubCategoryRouter.patch('/update-subCategory/:id', upload, updateSubCategory);

/**
 * @swagger
 * /subcategories/delete-sub-category/{id}:
 *   delete:
 *     summary: Delete a job subcategory
 *     tags: [Job Subcategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 1
 *     responses:
 *       200:
 *         description: Subcategory deleted successfully.
 *       404:
 *         description: Subcategory not found.
 *       500:
 *         description: Internal Server Error.
 */
SubCategoryRouter.delete('/delete-sub-category/:id', deleteSubCategory);

/**
 * @swagger
 * /subcategories/toggle-status/{id}:
 *   patch:
 *     summary: Toggle the status of a job subcategory
 *     tags: [Job Subcategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 1
 *     responses:
 *       200:
 *         description: Subcategory status updated successfully.
 *       404:
 *         description: Subcategory not found.
 *       500:
 *         description: Internal Server Error.
 */
SubCategoryRouter.patch('/toggle-status/:id', toggleSubCategoryStatus);

export default SubCategoryRouter;
