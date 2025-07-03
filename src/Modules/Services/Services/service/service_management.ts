import { asyncHandler } from "../../../../middleware/async-middleware";
import { Request, Response } from "express";
import { createResponse } from "../../../../logs/helpers/response";
import cloudinary from '../../../../config/cloudinary';
import { validateInput } from "../../../../utils/validation/validation";
import {handleError} from "../../../../logs/helpers/erroHandler";
import Service from "../../models/services";
import ServiceImage from "../../models/service_images";
import {MulterRequest} from "../../../../types/interfaces/interfaces.common";
import {getUserIdFromToken} from "../../../../utils/user/get_userId";
import {
    ServiceProviders
} from "../../models/associations";
import {JobCategory, JobSubCategory} from "../../../JobCategories/models/association";
import { generateUniqueSlug } from "./create_service";

// Common include options for related models
const serviceIncludeOptions = [
    {
        model: ServiceImage,
        as: 'images',
        attributes: ['id', 'image_url', 'is_primary'],
    },
    {
        model: JobSubCategory,
        as: 'subcategory',
        attributes: ['id', 'job_subcategory_name'],
        include: [
            {
                model: JobCategory,
                as: 'category',
                attributes: ['id', 'job_category_name'],
            },
        ],
    },
];

// Helper function to fetch a service by ID
const fetchServiceById = async (serviceId: string) => {
    return await Service.findByPk(serviceId, { include: serviceIncludeOptions });
};

// Helper function to fetch services for a provider
const fetchServicesByProvider = async (providerId: string) => {
    return await Service.findAll({
        where: { provider_id: providerId },
        include: serviceIncludeOptions,
    });
};

// Get a single service by ID
const getServiceById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const service = await fetchServiceById(id);

        if (service) {
            res.status(200).json(createResponse(true, 'Service retrieved successfully', { service }));
        } else {
            res.status(404).json(createResponse(false, 'Service not found'));
        }
    } catch (error) {
        handleError(error, req, res, 'An error occurred while fetching the service');
    }
});

// Get services for a provider
const getMyService = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const user_id = getUserIdFromToken(req);
        const serviceProvider = await ServiceProviders.findOne({ where: { user_id } });

        if (!serviceProvider) {
             res.status(400).json(createResponse(false, "Complete registration first"));
             return
        }

        const services = await fetchServicesByProvider(serviceProvider.id);

        if (services.length > 0) {
            res.status(200).json(createResponse(true, 'Services retrieved successfully', { services }));
        } else {
            res.status(404).json(createResponse(false, 'No services found'));
        }
    } catch (error) {
        handleError(error, req, res, 'An error occurred while fetching the services');
    }
});



// Update a service
const updateService = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Find the service by ID
        const service = await Service.findByPk(id);
        if (!service) {
            res.status(404).json(createResponse(false, 'Service not found'));
            return;
        }

        // Validate input
        const { value, errors } = validateInput(req.body);
        if (errors) {
            res.status(400).json(createResponse(false, "Validation failed", { errors }));
            return;
        }

        if (value) {
            const { title, description, sub_category_id, provider_id, pricing_mode, price_from , price_to, location, postFor, service_location_preference } = value;

            if (title && title !== service.title) {
                const baseSlug = title.toLowerCase().replace(/\s+/g, "-");
                const uniqueSlug = await generateUniqueSlug(baseSlug);
                service.title_slug = uniqueSlug;

                service.title = title;
            }

            service.description = description || service.description;
            service.sub_category_id = sub_category_id || service.sub_category_id;
            service.provider_id = provider_id || service.provider_id;
            service.pricing_mode = pricing_mode || service.pricing_mode;
            service.service_location_preference = service_location_preference || service.service_location_preference;
            service.price_from = price_from || service.price_from;
            service.price_to = price_to || service.price_to;
            service.location = location || service.location;
            service.postFor = postFor || service.postFor;

            await service.save();
        }

        res.status(200).json(createResponse(true, 'Service updated successfully', { service }));
    } catch (error: any) {
        handleError(error, req, res, 'An error occurred while updating the service');
    }
});


// Delete a service
const deleteService = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Find the service by ID
        const service = await Service.findByPk(id);
        if (!service) {
            res.status(404).json(createResponse(false, 'Service not found'));
            return;
        }

        // Delete associated images from Cloudinary
        const images = await ServiceImage.findAll({ where: { service_id: id } });
        for (const image of images) {
            const publicId = image.image_url.split('/').pop()?.split('.')[0];
            if (publicId) {
                await cloudinary.v2.uploader.destroy(`ekazi-api/services/${publicId}`);
            }
        }

        // Delete the service and its images
        await ServiceImage.destroy({ where: { service_id: id } });
        await service.destroy();

        res.status(200).json(createResponse(true, 'Service deleted successfully'));
    } catch (error) {
        handleError(error, req, res, 'An error occurred while deleting the service');
    }
});

// Toggle service status
const toggleServiceStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Find the service by ID
        const service = await Service.findByPk(id);
        if (!service) {
            res.status(404).json(createResponse(false, 'Service not found'));
            return;
        }

        // Toggle the status
        service.status = !service.status;
        await service.save();

        const message = service.status ? 'Service activated successfully' : 'Service deactivated successfully';
        res.status(200).json(createResponse(true, message, { service }));
    } catch (error) {
        handleError(error, req, res, 'An error occurred while toggling the service status');
    }
});

const addServiceImage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { serviceId } = req.params;

        // Find the service by ID
        const service = await Service.findByPk(serviceId);
        if (!service) {
            res.status(404).json(createResponse(false, 'Service not found'));
            return;
        }

        // Check the number of existing images
        const existingImages = await ServiceImage.count({ where: { service_id: serviceId } });
        if (existingImages >= 7) {
            res.status(400).json(createResponse(false, 'You can only upload up to 7 images for a service'));
            return;
        }

        // Check if an image file is provided
        const imageFile = (req as MulterRequest).files?.find((file: { fieldname: string; }) => file.fieldname === 'image');
        if (!imageFile) {
            res.status(400).json(createResponse(false, 'No image file provided'));
            return;
        }

        // Upload image to Cloudinary
        const result = await cloudinary.v2.uploader.upload(imageFile.path, { folder: 'ekazi-api/services' });

        // Save image to database
        const newImage = await ServiceImage.create({
            service_id: serviceId,
            image_url: result.secure_url,
            is_primary: existingImages === 0 // Set the first image as primary
        });

        res.status(201).json(createResponse(true, 'Image added successfully', { newImage }));
    } catch (error) {
        handleError(error, req, res, 'Error adding service image');
    }
});


// Function to update an image by ID
const updateImageById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { imageId } = req.params;

        // Find the image by ID
        const image = await ServiceImage.findOne({ where: { id: imageId } });

        if (!image) {
            res.status(404).json(createResponse(false, 'Image not found'));
            return;
        }


        // Fetch the current image URL to delete from Cloudinary
        const currentImageUrl = image.image_url;

        if (currentImageUrl) {
            // Extract public ID from URL for Cloudinary removal
            const publicId = currentImageUrl.split('/').pop()?.split('.')[0];
            if (publicId) {
                // Wait for Cloudinary to remove the image
                const cloudinaryResult = await cloudinary.v2.uploader.destroy(`ekazi-api/services/${publicId}`);

                if (cloudinaryResult.result !== 'ok') {
                    handleError(new Error('Failed to remove image from Cloudinary'), req, res, 'An error occurred while removing image from Cloudinary');
                    return;
                }
            }
        }

        // Check if an image file is provided and update it
        const imageFile = (req as MulterRequest).files?.find((file: { fieldname: string; }) => file.fieldname === 'image');
        if (imageFile) {
            // Upload the new image to Cloudinary
            const result = await cloudinary.v2.uploader.upload(imageFile.path, { folder: 'ekazi-api' });
            image.image_url = result.secure_url;
        }

        // Update the image URL in the database
        await image.save();

        // Respond with success message
        res.status(200).json(createResponse(true, 'Image updated successfully', { image }));
    } catch (error) {
        handleError(error, req, res, 'Error updating item image');
    }
});

// Function to delete an image by ID
const deleteImageById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { imageId } = req.params;

        // Find the image by ID
        const image = await ServiceImage.findOne({ where: { id: imageId } });

        if (!image) {
            res.status(404).json(createResponse(false, 'Image not found'));
            return;
        }

        // Remove the image from Cloudinary
        const publicId = image.image_url.split('/').pop()?.split('.')[0];
        if (publicId) {
            const cloudinaryResult = await cloudinary.v2.uploader.destroy(`ekazi-api/services/${publicId}`);

            if (cloudinaryResult.result !== 'ok') {
                handleError(new Error('Failed to remove image from Cloudinary'), req, res, 'An error occurred while removing image from Cloudinary');
                return;
            }
        }

        // Delete the image from the database
        await ServiceImage.destroy({ where: { id: imageId } });

        // Respond with success message
        res.status(200).json(createResponse(true, 'Image deleted successfully'));
    } catch (error) {
        handleError(error, req, res, 'Error deleting item image');
    }
});

// const permanentlyDeleteService = async (serviceId: string) => {
//     const service = await Service.findByPk(serviceId, { paranoid: false }); // Include soft-deleted records
//     if (!service) {
//       throw new Error('Service not found');
//     }
  
//     // Permanently delete the service
//     await service.destroy({ force: true }); // Force delete bypasses soft delete
//     return service;
//   };


export {
    getMyService,
    updateService,
    deleteService,
    toggleServiceStatus,
    updateImageById,
    deleteImageById,
    addServiceImage,
    getServiceById
};
