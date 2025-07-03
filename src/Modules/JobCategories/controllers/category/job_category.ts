import {asyncHandler} from "../../../../middleware/async-middleware";
import {Request, Response} from "express";
import {handleError} from "../../../../logs/helpers/erroHandler";
import {createResponse} from "../../../../logs/helpers/response";
import cloudinary from '../../../../config/cloudinary';
import {JobCategory, JobSubCategory} from "../../models/association";
import {MulterRequest} from "../../../../types/interfaces/interfaces.common";
import paginate from "express-paginate";
import validatePagination from "../../../../utils/pagination/pagination";
import {validateInput} from "../../../../utils/validation/validation";
import {Op} from "sequelize";


// Create a new category
const createCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { value, errors } = validateInput(req.body);
        if (errors) {
            res.status(400).json(createResponse(false, "Validation failed", { errors }));
            return;
        }

        // Ensure value is defined
        if (!value) {
            res.status(400).json(createResponse(false, "Validation failed", { errors: ["Invalid input data"] }));
            return;
        }

        const { job_category_name } = value;

        // Ensure a file was uploaded;
        const imageFile = (req as MulterRequest).files?.find((file: { fieldname: string; }) => file.fieldname === 'image');
        if (!imageFile) {
            res.status(400).json(createResponse(false, 'Image file is required'));
            return;
        }

        // Upload image to Cloudinary
        const result = await cloudinary.v2.uploader.upload(imageFile.path, { folder: 'ekazi-api' });
        const imageUrl = result.secure_url;

        // Create the category
         await JobCategory.create({
            isActive: false,
            job_category_name: job_category_name,
            image: imageUrl
        });

         res.status(201).json(createResponse(true, 'Category created successfully'));

    } catch (error : any ) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            handleError(error, req, res, 'Category name already exists');
        }

        handleError(error, req, res, 'An error occurred while creating the category');
    }
});


// Get all categories with pagination
const getAllCategories = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const pagination = validatePagination(req, res, 1, 20);
        if (!pagination) return;

        const { page, limit } = pagination;

        // Calculate offset
        const offset = (page - 1) * limit;

        // Fetch paginated results
        const [categories, itemCount] = await Promise.all([
            JobCategory.findAll({
                attributes: ['id', 'job_category_name', 'image', 'isActive'],
                offset,
                limit,
            }),
            JobCategory.count(),
        ]);

        const pageCount = Math.ceil(itemCount / limit);

        res.status(200).json(createResponse(true, 'Categories retrieved successfully', {
            categories,
            meta: {
                pageCount,
                itemCount,
                currentPage: page,
                hasMore: paginate.hasNextPages(req)(pageCount),
                pages: paginate.getArrayPages(req)(3, pageCount, page),
            }
        }));
    } catch (error) {
        handleError(error, req, res, 'An error occurred while fetching categories');
    }
});


// Get a single category by ID
const getCategoryById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const category = await JobCategory.findByPk(id);
        if (!category) {
             res.status(404).json(createResponse(false, 'Category not found'));
             return
        }
         res.status(200).json(createResponse(true, 'Category retrieved successfully', {category}));

    } catch (error) {
        handleError(error, req, res, 'An error occurred while fetching the category');
    }
});

// Get all categories with subcategories, with optional search and pagination
// Get all categories with subcategories, with optional search and pagination
const getAllCategoriesWithSubcategories = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { search } = req.query; // Extract search query from request

        // If search term is provided, disable pagination and filter based on the search term.
        // Note: MySQL doesn't support ILIKE, so we use LIKE instead.
        const whereCondition: any = {};
        if (search) {
            whereCondition[Op.or] = [
                { job_category_name: { [Op.like]: `%${search}%` } }, // Search for category name
                { '$sub_categories.job_subcategory_name$': { [Op.like]: `%${search}%` } } // Search for subcategory name
            ];
        }

        let pagination: any = null;
        let categories: any;
        let itemCount: number;

        if (search) {
            // When a search query is present, we disable pagination
            categories = await JobCategory.findAll({
                attributes: ['id', 'job_category_name', 'image', 'isActive'],
                include: {
                    model: JobSubCategory,
                    as: 'sub_categories',
                    attributes: ['id', 'job_subcategory_name', 'job_subcategory_image', 'isActive'],
                },
                where: whereCondition,
            });
            itemCount = categories.length;
        } else {
            // If no search query, apply pagination
            pagination = validatePagination(req, res, 1, 20);
            if (!pagination) return; // Return early if validation fails
            const { page, limit } = pagination;
            const offset = (page - 1) * limit;

            const [fetchedCategories, totalItemCount] = await Promise.all([
                JobCategory.findAll({
                    attributes: ['id', 'job_category_name', 'image', 'isActive'],
                    include: {
                        model: JobSubCategory,
                        as: 'sub_categories',
                        attributes: ['id', 'job_subcategory_name', 'job_subcategory_image', 'isActive'],
                    },
                    where: whereCondition,
                    offset,
                    limit,
                }),
                JobCategory.count({ where: whereCondition }),
            ]);

            categories = fetchedCategories;
            itemCount = totalItemCount;
        }

        const pageCount = pagination ? Math.ceil(itemCount / pagination.limit) : 1;

        res.status(200).json(createResponse(true, 'Categories with subcategories retrieved successfully', {
            categories,
            meta: pagination ? {
                pageCount,
                itemCount,
                currentPage: pagination.page,
                hasMore: paginate.hasNextPages(req)(pageCount),
                pages: paginate.getArrayPages(req)(3, pageCount, pagination.page),
            } : {},
        }));
    } catch (error) {
        handleError(error, req, res, 'An error occurred while fetching categories with subcategories');
    }
});



// Update a category
const updateCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Find the category by ID
        const category = await JobCategory.findByPk(id);
        if (!category) {
            res.status(404).json(createResponse(false, 'Category not found'));
            return;
        }

        // Fetch the current image URL to delete from Cloudinary
        const currentImageUrl = category.image;
        const oldImagePublicId = currentImageUrl?.split('/').pop()?.split('.')[0];

        if (oldImagePublicId) {
            const fullPublicId = `ekazi-api/${oldImagePublicId}`;

            // Wait for Cloudinary to remove the image
            const cloudinaryResult = await cloudinary.v2.uploader.destroy(fullPublicId, { invalidate: true });
            if (cloudinaryResult.result !== 'ok') {
                handleError(new Error('Failed to remove image from Cloudinary'), req, res, 'An Error occurred while removing image from Cloudinary');
                return;
            }
        }

        // Update the name if provided
        if (req.body.job_category_name) {
            const { value, errors } = validateInput(req.body);
            if (errors) {
                res.status(400).json(createResponse(false, "Validation failed", { errors }));
                return;
            }

            // Ensure value is defined
            if (!value) {
                res.status(400).json(createResponse(false, "Validation failed", { errors: ["Invalid input data"] }));
                return;
            }

            const { job_category_name } = value;
            category.job_category_name = job_category_name;
        }

        // Check if an image file is provided and update it
        const imageFile = (req as MulterRequest).files?.find((file: { fieldname: string; }) => file.fieldname === 'image');
        if (imageFile) {
            // Upload the new image to Cloudinary
            const result = await cloudinary.v2.uploader.upload(imageFile.path, { folder: 'ekazi-api' });
            category.image = result.secure_url;
        }

        // Save the changes only if there were any updates
        await category.save();

        res.status(200).json(createResponse(true, 'Category updated successfully'));
    } catch (error: any) {
        handleError(error, req, res, 'An error occurred while updating the category');
    }
});

// Delete a category
const deleteCategory  = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const category = await JobCategory.findByPk(id);
        if (!category) {
            res.status(404).json(createResponse(false, 'Category not found'));
            return;
        }

        // Fetch the current image URL to delete from Cloudinary
        const currentImageUrl = category.image;
        const oldImagePublicId = currentImageUrl?.split('/').pop()?.split('.')[0];

        if (oldImagePublicId) {
            const fullPublicId = `ekazi-api/${oldImagePublicId}`;

            // Wait for Cloudinary to remove the image
            const cloudinaryResult = await cloudinary.v2.uploader.destroy(fullPublicId, { invalidate: true });
            if (cloudinaryResult.result !== 'ok') {
                handleError(new Error('Failed to remove image from Cloudinary'), req, res, 'An Error occurred while removing image from Cloudinary');
                return;
            }
        }

        // Delete the category
        await category.destroy();

        res.status(200).json(createResponse(true, 'Category deleted successfully'));
    } catch (error) {
        handleError(error, req, res, 'An error occurred while deleting the category');
    }
});


// Deactivate a category
const toggleCategoryStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;  // Get category ID from the URL

        // Find the category by ID
        const category = await JobCategory.findByPk(id);
        if (!category) {
            res.status(404).json(createResponse(false, 'Category not found'));
            return;
        }

        // Toggle the category's isActive status (if it's active, set to inactive and vice versa)
        category.isActive = !category.isActive;

        // Save the changes
        await category.save();

        // Respond with the updated category status
        const message = category.isActive ? 'Category activated successfully' : 'Category deactivated successfully';
        res.status(200).json(createResponse(true, message, { category }));

    } catch (error: any) {
        // Handle the error and send response
        handleError(error, req, res, 'An error occurred while toggling the category status');
    }
});

export {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    getAllCategoriesWithSubcategories
};
