import express from 'express';
import {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    getAllCategoriesWithSubcategories
} from '../../controllers/category/job_category';
import {verifyToken} from "../../../Users/middleware/jwt_auth";
import upload from "../../../../utils/multer/image_upload";

const CategoryRouter = express.Router();

// Middleware to verify token (authentication check)
CategoryRouter.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Category
 *   description: Category management
 */

/**
 * @swagger
 * /category/create-category:
 *   post:
 *     summary: Create a new category
 *     tags: [Category]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               job_category_name:
 *                 type: string
 *                 example: Engineering
 *               image:
 *                 type: string
 *                 format: binary
 *             required:
 *               - job_category_name
 *               - image
 *     responses:
 *       201:
 *         description: Category created successfully.
 *       400:
 *         description: Bad request. Validation failed.
 *       401:
 *         description: Unauthorized. Token is missing or invalid.
 */
CategoryRouter.post('/create-category', upload, createCategory);

/**
 * @swagger
 * /category/get-all-categories:
 *   get:
 *     summary: Get all categories with pagination
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: A list of categories.
 *       500:
 *         description: Internal server error.
 */
CategoryRouter.get('/get-all-categories', getAllCategories);

/**
 * @swagger
 * /category/get-category-by-id/{id}:
 *   get:
 *     summary: Get a specific category by ID
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The category ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The category details.
 *       404:
 *         description: Category not found.
 */
CategoryRouter.get('/get-category-by-id/:id', getCategoryById);

/**
 * @swagger
 * /category/update-category/{id}:
 *   patch:
 *     summary: Update an existing category
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The category ID.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               job_category_name:
 *                 type: string
 *                 example: Updated Engineering
 *               image:
 *                 type: string
 *                 format: binary
 *             required:
 *               - job_category_name
 *               - image
 *     responses:
 *       200:
 *         description: Category updated successfully.
 *       400:
 *         description: Bad request. Validation failed.
 *       404:
 *         description: Category not found.
 */
CategoryRouter.patch('/update-category/:id', upload, updateCategory);

/**
 * @swagger
 * /category/delete-category/{id}:
 *   delete:
 *     summary: Delete a category by ID
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The category ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted successfully.
 *       404:
 *         description: Category not found.
 */
CategoryRouter.delete('/delete-category/:id', deleteCategory);

/**
 * @swagger
 * /category/{id}/toggle-status:
 *   patch:
 *     summary: Toggle the activation status of a category
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The category ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category activation status updated.
 *       404:
 *         description: Category not found.
 */
CategoryRouter.patch('/:id/toggle-status', toggleCategoryStatus);

/**
 * @swagger
 * /category/with-subcategories:
 *   get:
 *     summary: Get all categories with their subcategories
 *     tags: [Category]
 *     parameters:
 *       - in: query
 *         name: search
 *         description: A search term to filter categories and subcategories by name.
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         description: The page number to fetch (used for pagination).
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         description: The number of items per page (used for pagination).
 *         required: false
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: A list of categories with subcategories.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the request was successful.
 *                 message:
 *                   type: string
 *                   description: A message describing the result of the request.
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: The category ID.
 *                           job_category_name:
 *                             type: string
 *                             description: The name of the category.
 *                           image:
 *                             type: string
 *                             description: The image associated with the category.
 *                           isActive:
 *                             type: boolean
 *                             description: Whether the category is active.
 *                           sub_categories:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                 job_subcategory_name:
 *                                   type: string
 *                                 isActive:
 *                                   type: boolean
 *                     meta:
 *                       type: object
 *                       properties:
 *                         pageCount:
 *                           type: integer
 *                           description: Total number of pages based on the current pagination settings.
 *                         itemCount:
 *                           type: integer
 *                           description: Total number of items available in the database.
 *                         currentPage:
 *                           type: integer
 *                           description: The current page number.
 *                         hasMore:
 *                           type: boolean
 *                           description: Whether there are more pages available.
 *                         pages:
 *                           type: array
 *                           items:
 *                             type: integer
 *                             description: Array of page numbers for pagination.
 *       500:
 *         description: An error occurred while fetching categories with subcategories.
 */
CategoryRouter.get('/with-subcategories', getAllCategoriesWithSubcategories);


export default CategoryRouter;
