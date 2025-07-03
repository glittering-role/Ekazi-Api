import express from 'express';
import {
  getMyProfile,
} from '../../controller/account/profile';

import {updateProfileImage, removeProfileImage} from '../../controller/account/update_image';
import {
  updateProfile,
  addOrUpdatePhoneNumber,
  checkUsernameAvailability,
  updateUsername,
  removePhoneNumber,
  updateUserLocation
} from "../../controller/account/account_update";
import upload from "../../../../utils/multer/image_upload";
import {verifyToken} from '../../middleware/jwt_auth';

const ProfileRouter = express.Router();


ProfileRouter.use(verifyToken);


/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile management
 */

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Retrieve the profile of the authenticated user
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phoneNumber:
 *                   type: string
 *       401:
 *         description: Unauthorized. Token is missing or invalid.
 */
ProfileRouter.get('/', getMyProfile);

/**
 * @swagger
 * /profile/update-details:
 *   patch:
 *     summary: Update the profile details of the authenticated user
 *     tags: [Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: John
 *               middle_name:
 *                 type: string
 *                 example: Michael
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 example: 1990-01-01
 *               gender:
 *                 type: string
 *                 example: male
 *               about_the_user:
 *                 type: string
 *                 example: I am a software engineer.
 *     responses:
 *       200:
 *         description: Profile details updated successfully.
 *       400:
 *         description: Bad request. Validation failed or no fields provided for update.
 *       401:
 *         description: Unauthorized. Token is missing or invalid.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal Server Error.
 */

ProfileRouter.patch('/update-details', updateProfile);

/**
 * @swagger
 * /profile/update-location:
 *   patch:
 *     summary: Update the user's location manually
 *     tags: [Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               country:
 *                 type: string
 *                 example: USA
 *               city:
 *                 type: string
 *                 example: New York
 *               zip:
 *                 type: string
 *                 example: 10001
 *     responses:
 *       200:
 *         description: Location updated successfully.
 *       400:
 *         description: Bad request. Validation failed or no fields provided for update.
 *       401:
 *         description: Unauthorized. Token is missing or invalid.
 *       500:
 *         description: Internal Server Error.
 */
ProfileRouter.patch('/update-location', updateUserLocation);


/**
 * @swagger
 * /profile/add-phone-number:
 *   post:
 *     summary: Add a phone number for the authenticated user
 *     tags: [Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone_number:
 *                 type: string
 *                 example: 254712345678
 *     responses:
 *       200:
 *         description: Phone number added successfully.
 *       400:
 *         description: Bad request. Invalid phone number format.
 *       401:
 *         description: Unauthorized. Token is missing or invalid.
 */
ProfileRouter.post('/add-phone-number', addOrUpdatePhoneNumber);

/**
 * @swagger
 * /profile/add-username:
 *   post:
 *     summary: Add a username for the authenticated user
 *     tags: [Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: john_doe123
 *     responses:
 *       200:
 *         description: Username added successfully.
 *       400:
 *         description: Bad request. Invalid username format.
 *       401:
 *         description: Unauthorized. Token is missing or invalid.
 */
ProfileRouter.post('/add-username', updateUsername);

/**
 * @swagger
 * /profile/remove-phone-number:
 *   delete:
 *     summary: Remove a phone number for the authenticated user
 *     tags: [Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: 254712345678
 *     responses:
 *       200:
 *         description: Phone number removed successfully.
 *       400:
 *         description: Bad request. Invalid phone number format.
 *       401:
 *         description: Unauthorized. Token is missing or invalid.
 */
ProfileRouter.delete('/remove-phone-number', removePhoneNumber);


/**
 * @swagger
 * /profile/update-profile-image:
 *   patch:
 *     summary: Update the profile image of the authenticated user
 *     tags: [Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile image updated successfully.
 *       400:
 *         description: Bad request. Invalid image file.
 *       401:
 *         description: Unauthorized. Token is missing or invalid.
 */
ProfileRouter.patch('/update-profile-image', upload, updateProfileImage);

/**
 * @swagger
 * /profile/remove-profile-image:
 *   patch:
 *     summary: Remove the profile image for the authenticated user
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Profile image removed successfully.
 *       401:
 *         description: Unauthorized. Token is missing or invalid.
 */
ProfileRouter.patch('/remove-profile-image', removeProfileImage);

ProfileRouter.patch('/check_username', checkUsernameAvailability);


export default ProfileRouter;
