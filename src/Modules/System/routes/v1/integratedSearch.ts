import {integratedSearch} from "../../controller/search/searchController";

const express = require('express');

const searchRoutes = express.Router();

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Perform integrated search across multiple entities
 */

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Integrated search across Users, Services, Job Categories, and Job Sub Categories
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           description: The search query string
 *         required: true
 *     responses:
 *       200:
 *         description: Search results from all entities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "550e8400-e29b-41d4-a716-446655440000"
 *                       email:
 *                         type: string
 *                         example: "user@example.com"
 *                       phone_number:
 *                         type: string
 *                         example: "+1234567890"
 *                       source:
 *                         type: string
 *                         example: "Users"
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "550e8400-e29b-41d4-a716-446655440000"
 *                       title:
 *                         type: string
 *                         example: "Service Title"
 *                       description:
 *                         type: string
 *                         example: "Service Description"
 *                       source:
 *                         type: string
 *                         example: "Services"
 *                 jobCategories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "550e8400-e29b-41d4-a716-446655440000"
 *                       name:
 *                         type: string
 *                         example: "Job Category"
 *                       source:
 *                         type: string
 *                         example: "JobCategory"
 *                 jobSubCategories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "550e8400-e29b-41d4-a716-446655440000"
 *                       name:
 *                         type: string
 *                         example: "Job Sub Category"
 *                       source:
 *                         type: string
 *                         example: "JobSubCategory"
 *       400:
 *         description: Missing or invalid query parameter
 *       500:
 *         description: Internal server error
 */
searchRoutes.get('/', integratedSearch);

export default searchRoutes;