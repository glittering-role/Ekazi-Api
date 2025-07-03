import { asyncHandler } from "../../../../middleware/async-middleware";
import { Request, Response } from "express";
import { createResponse } from "../../../../logs/helpers/response";
import cloudinary from "../../../../config/cloudinary";
import { validateInput } from "../../../../utils/validation/validation";
import ServiceImage from "../../models/service_images";
import { JobSubCategory } from "../../../JobCategories/models/association";
import { handleError } from "../../../../logs/helpers/erroHandler";
import { getUserIdFromToken } from "../../../../utils/user/get_userId";
import { Service, ServiceProviders } from "../../models/associations";
import { createNotifications } from "../../../Notifications/service/notificationService";
import { Op } from "sequelize";

// Define a type for Multer Request
interface MulterRequest extends Request {
  files?: Express.Multer.File[];
}

// Function to generate a unique slug
export const generateUniqueSlug = async (baseSlug: string): Promise<string> => {
  const normalizedBaseSlug = baseSlug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  // Fetch all existing slugs that match the base slug pattern
  const existingSlugs = await Service.findAll({
    where: {
      title_slug: {
        [Op.like]: `${normalizedBaseSlug}%`, 
      },
    },
    attributes: ['title_slug'], 
  });

  // Extract slugs into an array
  const slugs = existingSlugs.map((service) => service.title_slug);

  // If the base slug is unique, return it
  if (!slugs.includes(normalizedBaseSlug)) {
    return normalizedBaseSlug;
  }

  // Find the next available unique slug
  let counter = 1;
  let newSlug = `${normalizedBaseSlug}-${counter}`;

  while (slugs.includes(newSlug)) {
    counter++;
    newSlug = `${normalizedBaseSlug}-${counter}`;
  }

  return newSlug;
};

// Helper function to validate service provider
const validateServiceProvider = async (user_id: string, res: Response) => {
  const serviceProvider = await ServiceProviders.findOne({
    where: { user_id },
  });

  if (!serviceProvider) {
    res.status(400).json(createResponse(false, "Complete registration first"));
    return null;
  }

  // Check if the provider already has 2 services
  const serviceCount = await Service.count({
    where: { provider_id: serviceProvider.id },
  });

  if (serviceCount >= 2) {
    res
      .status(400)
      .json(
        createResponse(
          false,
          "A service provider cannot have more than 2 services"
        )
      );
    return null;
  }

  return serviceProvider;
};

// Helper function to validate sub-category
const validateSubCategory = async (sub_category_id: string, provider_id: string, res: Response) => {
  const subCategory = await JobSubCategory.findByPk(sub_category_id);
  if (!subCategory) {
    res.status(404).json(createResponse(false, "Sub-category not found"));
    return false;
  }

  // Check if the provider already has a service under this sub-category
  const existingService = await Service.findOne({
    where: { provider_id, sub_category_id },
  });

  if (existingService) {
    res
      .status(400)
      .json(
        createResponse(
          false,
          "You already have a service under this sub-category. Delete the existing service before adding a new one."
        )
      );
    return false;
  }

  return true;
};

// Helper function to upload images to Cloudinary
const uploadServiceImages = async (files: Express.Multer.File[], service_id: string) => {
  for (const [index, file] of files.entries()) {
    const result = await cloudinary.v2.uploader.upload(file.path, {
      folder: "ekazi-api/services",
    });
    await ServiceImage.create({
      service_id,
      image_url: result.secure_url,
      is_primary: index === 0,
    });
  }
};

// Create a new service
const createService = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user_id = getUserIdFromToken(req) ?? "";
      const serviceProvider = await validateServiceProvider(user_id, res);
      if (!serviceProvider) return;

      const { value, errors } = validateInput(req.body);
      if (errors) {
        res.status(400).json(createResponse(false, "Validation failed", { errors }));
        return;
      }

      if (!value) {
        res.status(400).json(createResponse(false, "Validation failed", { errors: ["Invalid input data"] }));
        return;
      }

      const {
        title,
        description,
        sub_category_id,
        pricing_mode,
        price_from,
        price_to,
        location,
        service_location_preference,
        latitude,longitude
      } = value;

      // Validate sub-category
      const isSubCategoryValid = await validateSubCategory(sub_category_id, serviceProvider.id, res);
      if (!isSubCategoryValid) return;

      // Generate a unique slug
      const baseSlug = title.toLowerCase().replace(/\s+/g, "-");
      const uniqueSlug = await generateUniqueSlug(baseSlug);

      // Create the service
      const service = await Service.create({
        title,
        title_slug: uniqueSlug,
        description,
        sub_category_id,
        provider_id: serviceProvider.id,
        pricing_mode,
        price_from,
        price_to,
        location,
        postFor: "public",
        service_location_preference,
        status: true,
        latitude,longitude
      });

      // Handle image uploads if any
      const imageFiles = (req as MulterRequest).files;
      if (imageFiles && imageFiles.length > 0) {
        await uploadServiceImages(imageFiles, service.id);
      }

      // Send a notification to the service provider
      const notificationMessage = `Your service "${title}" has been successfully created.`;
      await createNotifications(user_id, "Service added successfully.", notificationMessage);

      res.status(201).json(createResponse(true, "Service created successfully"));
    } catch (error: any) {
      if (error.name === "SequelizeUniqueConstraintError") {
        handleError(error, req, res, "Service title already exists");
      } else {
        handleError(error, req, res, "An error occurred while creating the service");
      }
    }
  }
);

export { createService };