import { asyncHandler } from "../../../../middleware/async-middleware";
import { Request, Response } from "express";
import { handleError } from "../../../../logs/helpers/erroHandler";
import { createResponse } from "../../../../logs/helpers/response";
import { JobCategory, JobSubCategory } from "../../models/association";
import { validateInput } from "../../../../utils/validation/validation";
import { MulterRequest } from "src/types/interfaces/interfaces.common";
import cloudinary from "../../../../config/cloudinary";
import paginate from "express-paginate";
import validatePagination from "../../../../utils/pagination/pagination";



// Create a new subcategory
const createSubCategory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {


    
    try {
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

      const { category_id, job_subcategory_name } = value;

      // Check if the category exists
      const category = await JobCategory.findByPk(category_id);
      if (!category) {
        res.status(404).json(createResponse(false, "Category not found"));
        return;
      }

      // Ensure a file was uploaded;
      const imageFile = (req as MulterRequest).files?.find(
        (file: { fieldname: string }) => file.fieldname === "job_subcategory_image"
      );
      if (!imageFile) {
        res.status(400).json(createResponse(false, "Image file is required"));
        return;
      }

      // Upload image to Cloudinary
      const result = await cloudinary.v2.uploader.upload(imageFile.path, {
        folder: "ekazi-api",
      });
      const imageUrl = result.secure_url;

      // Create the subcategory
      await JobSubCategory.create({
        category_id,
        job_subcategory_name,
        job_subcategory_image: imageUrl,
        isActive: true,
      });

      res
        .status(201)
        .json(createResponse(true, "Subcategory created successfully"));
    } catch (error: any) {
      if (error.name === "SequelizeUniqueConstraintError") {
        handleError(error, req, res, "Subcategory name already exists");
      }
      handleError(
        error,
        req,
        res,
        "An error occurred while creating the subcategory"
      );
    }
  }
);

// Get all sub-categories with pagination
const getAllSubCategories = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const pagination = validatePagination(req, res, 1, 20);
      if (!pagination) return;

      const { page, limit } = pagination;

      // Calculate offset
      const offset = (page - 1) * limit;

      const [subCategories, itemCount] = await Promise.all([
        JobSubCategory.findAll({
            attributes: ['id', 'job_subcategory_name', 'job_subcategory_image', 'isActive'],
            include: {
              model: JobCategory,
              as: 'category',
              attributes: ['id', 'job_category_name']
          },
            offset,
            limit,
        }),
        JobCategory.count(),
    ]);

       const pageCount = Math.ceil(itemCount / limit);
     
             res.status(200).json(createResponse(true, 'sub_categories retrieved successfully', {
              subCategories,
                 meta: {
                     pageCount,
                     itemCount,
                     currentPage: page,
                     hasMore: paginate.hasNextPages(req)(pageCount),
                     pages: paginate.getArrayPages(req)(3, pageCount, page),
                 }
             }));
    } catch (error) {

      handleError(
        error,
        req,
        res,
        "Error retrieving sub-categories"
      );
    }
});


// Get all subcategories by category ID
const getSubCategoriesByCategoryId = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { category_id } = req.params;

      // Fetch subcategories for the given category ID
      const subCategories = await JobSubCategory.findAll({
        where: { category_id },
        attributes: ["id", "job_subcategory_name", "isActive"],
      });

      if (subCategories.length === 0) {
        res
          .status(404)
          .json(
            createResponse(false, "No subcategories found for this category")
          );
        return;
      }

      res.status(200).json(
        createResponse(true, "Subcategories retrieved successfully", {
          subCategories,
        })
      );
    } catch (error) {
      handleError(
        error,
        req,
        res,
        "An error occurred while fetching the subcategories"
      );
    }
  }
);

// Get a single subcategory by ID
const getSubCategoryById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const subCategory = await JobSubCategory.findByPk(id);
      if (!subCategory) {
        res.status(404).json(createResponse(false, "Subcategory not found"));
        return;
      }
      res.status(200).json(
        createResponse(true, "Subcategory retrieved successfully", {
          subCategory,
        })
      );
    } catch (error) {
      handleError(
        error,
        req,
        res,
        "An error occurred while fetching the subcategory"
      );
    }
  }
);

// Update a subcategory
const updateSubCategory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Find the subcategory by ID
      const subCategory = await JobSubCategory.findByPk(id);
      if (!subCategory) {
        res.status(404).json(createResponse(false, "Subcategory not found"));
        return;
      }

      const { value, errors } = validateInput(req.body);
      if (errors) {
        res
          .status(400)
          .json(createResponse(false, "Validation failed", { errors }));
        return;
      }

      // Update the name if provided
      if (value?.job_subcategory_name) {
        subCategory.job_subcategory_name = value?.job_subcategory_name;
      }

      // Fetch the current image URL to delete from Cloudinary
      const currentImageUrl = subCategory.job_subcategory_image;
      const oldImagePublicId = currentImageUrl?.split("/").pop()?.split(".")[0];

      if (oldImagePublicId) {
        const fullPublicId = `ekazi-api/${oldImagePublicId}`;

        // Wait for Cloudinary to remove the image
        const cloudinaryResult = await cloudinary.v2.uploader.destroy(
          fullPublicId,
          { invalidate: true }
        );
        if (cloudinaryResult.result !== "ok") {
          handleError(
            new Error("Failed to remove image from Cloudinary"),
            req,
            res,
            "An Error occurred while removing image from Cloudinary"
          );
          return;
        }
      }

      // Check if an image file is provided and update it
      const imageFile = (req as MulterRequest).files?.find(
        (file: { fieldname: string }) => file.fieldname === "job_subcategory_image"
      );
      if (imageFile) {
        // Upload the new image to Cloudinary
        const result = await cloudinary.v2.uploader.upload(imageFile.path, {
          folder: "ekazi-api",
        });
        subCategory.job_subcategory_image = result.secure_url;
      }

      // Save the changes
      await subCategory.save();
      res
        .status(200)
        .json(createResponse(true, "Subcategory updated successfully"));
    } catch (error) {
      handleError(
        error,
        req,
        res,
        "An error occurred while updating the subcategory"
      );
    }
  }
);

// Delete a subcategory
const deleteSubCategory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const subCategory = await JobSubCategory.findByPk(id);
      if (!subCategory) {
        res.status(404).json(createResponse(false, "Subcategory not found"));
        return;
      }

      // Fetch the current image URL to delete from Cloudinary
      const currentImageUrl = subCategory.job_subcategory_image;
      const oldImagePublicId = currentImageUrl?.split("/").pop()?.split(".")[0];

      if (oldImagePublicId) {
        const fullPublicId = `ekazi-api/${oldImagePublicId}`;

        // Wait for Cloudinary to remove the image
        const cloudinaryResult = await cloudinary.v2.uploader.destroy(
          fullPublicId,
          { invalidate: true }
        );
        if (cloudinaryResult.result !== "ok") {
          handleError(
            new Error("Failed to remove image from Cloudinary"),
            req,
            res,
            "An Error occurred while removing image from Cloudinary"
          );
          return;
        }
      }

      // Delete the subcategory
      await subCategory.destroy();
      res
        .status(200)
        .json(createResponse(true, "Subcategory deleted successfully"));
    } catch (error) {
      handleError(
        error,
        req,
        res,
        "An error occurred while deleting the subcategory"
      );
    }
  }
);

// Toggle the active status of a subcategory
const toggleSubCategoryStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params; // Get subcategory ID from the URL

      // Find the subcategory by ID
      const subCategory = await JobSubCategory.findByPk(id);
      if (!subCategory) {
        res.status(404).json(createResponse(false, "Subcategory not found"));
        return;
      }

      // Toggle the subcategory's isActive status (if it's active, set to inactive and vice versa)
      subCategory.isActive = !subCategory.isActive;

      // Save the changes
      await subCategory.save();

      // Respond with the updated subcategory status
      const message = subCategory.isActive
        ? "Subcategory activated successfully"
        : "Subcategory deactivated successfully";
      res.status(200).json(createResponse(true, message, { subCategory }));
    } catch (error) {
      handleError(
        error,
        req,
        res,
        "An error occurred while toggling the subcategory status"
      );
    }
  }
);

export {
  createSubCategory,
  getSubCategoriesByCategoryId,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  toggleSubCategoryStatus,
  getAllSubCategories
};
