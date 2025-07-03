import cloudinary from '../../../../config/cloudinary';
import { Request, Response } from 'express';
import {Users, Roles, UserDetails} from '../../model/associations';
import { asyncHandler } from '../../../../middleware/async-middleware';
import { handleError } from '../../../../logs/helpers/erroHandler';
import { getUserIdFromToken } from '../../../../utils/user/get_userId';
import { createResponse } from '../../../../logs/helpers/response';
import  reloadUserWithDetails  from '../../utils/userUtils';
import generateAvatar from '../../jobs/avatarService';
import {createNotifications} from "../../../Notifications/service/notificationService";
import {MulterRequest} from "../../../../types/interfaces/interfaces.common";

// Reusable function to fetch user with details and roles
const getUserWithDetailsAndRoles = async (userId: string): Promise<Users | null> => {
  return await Users.findOne({
    where: { id: userId },
    include: [
      {
        model: UserDetails,
        as: 'user_detail',
        attributes: ['first_name', 'middle_name', 'last_name', 'image'],
      },
      {
        model: Roles,
        as: 'Roles',
        attributes: ['id', 'role_name'],
        through: { attributes: [] },
      },
    ],
  });
};


// Function to handle updating profile image
const updateProfileImage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    
    const user_id = getUserIdFromToken(req);

    const user = await getUserWithDetailsAndRoles(user_id as string);

    if (!user) {
      res.status(404).json(createResponse(false, 'User not found'));
      return;
    }

    const userDetails = await UserDetails.findOne({ where: { user_id: user.id } });
    if (!userDetails) {
      res.status(404).json(createResponse(false, 'User details not found'));
      return;
    }

    // Fetch the current image URL
    const currentImageUrl = userDetails.image;
    const oldImagePublicId = currentImageUrl?.split('/').pop()?.split('.')[0]; 

   
    if (oldImagePublicId) {
      const fullPublicId = `ekazi-api/${oldImagePublicId}`; 
      
      cloudinary.v2.uploader.destroy(fullPublicId,{ invalidate: true },(error: any, result: any) => {
        if (error) {
          handleError(error, req, res, 'An Error occurred while removing  image from cloudinary');
        } 
      });
    }
    

    // Cast req to MulterRequest to access the files
    const imageFile = (req as MulterRequest).files?.find((file) => file.fieldname === 'image');
    if (!imageFile) {
      res.status(400).json(createResponse(false, 'Image file is required'));
      return;
    }

    // Upload the new image to Cloudinary
    const result = await cloudinary.v2.uploader.upload(imageFile.path, { folder: 'ekazi-api' });
    const newImageUrl = result.secure_url;

    // Update the user's details with the new image URL
    await userDetails.update({ image: newImageUrl });

    const dataForState = await reloadUserWithDetails(user);

    // Notify the user about the new queue entry
    const notificationMessage = `Your profile picture has been updated successfully.`;
    await createNotifications(user.id, 'Profile Picture Updated', notificationMessage);

    res.status(200).json(createResponse(true, 'Profile picture updated successfully', dataForState));
  } catch (error) {
    handleError(error, req, res, 'An error occurred while updating the profile picture');
  }
});


// Function to handle removing profile image
const removeProfileImage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id = getUserIdFromToken(req);

    const user = await getUserWithDetailsAndRoles(user_id as string);

    if (!user) {
      res.status(404).json(createResponse(false, 'User not found'));
      return;
    }

    const userDetails = await UserDetails.findOne({ where: { user_id: user.id } });
    if (!userDetails) {
      res.status(404).json(createResponse(false, 'User details not found'));
      return;
    }

    const currentImageUrl = userDetails.image;
    const oldImagePublicId = currentImageUrl?.split('/').pop()?.split('.')[0]; 

   
    if (oldImagePublicId) {
      const fullPublicId = `ekazi-api/${oldImagePublicId}`; 
      
      cloudinary.v2.uploader.destroy(fullPublicId,{ invalidate: true },(error: any, result: any) => {
        if (error) {
          handleError(error, req, res, 'An Error occurred while removing  image from cloudinary');
        } 
      });
    }
    
    // Generate a default image
    const defaultProfilePicture = await generateAvatar(user.email);

    await userDetails.update({ image: defaultProfilePicture });

    const dataForState = await reloadUserWithDetails(user);

     // Notify the user about the new queue entry
     const notificationMessage = `Your profile picture has been updated successfully.`;
     await createNotifications(user.id, 'Profile Picture Updated', notificationMessage);

    res.status(200).json(createResponse(true, 'Profile picture removed successfully', dataForState));
  } catch (error) {
    handleError(error, req, res, 'An error occurred while removing the profile picture');
  }
});

export {
  updateProfileImage,
  removeProfileImage,
};
