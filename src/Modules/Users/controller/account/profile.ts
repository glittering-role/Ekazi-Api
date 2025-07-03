import {Users, UserDetails, Roles, UserLocation} from "../../model/associations";
import { asyncHandler } from "../../../../middleware/async-middleware";
import { Request, Response } from "express";
import {getUserIdFromToken} from "../../../../utils/user/get_userId";
import {handleError} from "../../../../logs/helpers/erroHandler";

let userId; // Declared globally within the file

// Controller function to get user profile
const getMyProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {

    userId = getUserIdFromToken(req);

    if (!userId) {
       res.status(400).json({
        success: false,
        message: "User ID is missing in the token.",
      });
    }

    // Fetch user details from the database
    const user = await Users.findByPk(userId, {
      attributes : ["id", "email", "phone_number" , "username" , "authType", "status", "createdAt"],
      include: [
        {
          model: UserDetails,
          attributes: [
            "first_name",
            "middle_name",
            "last_name",
            "gender",
            "image",
            "about_the_user",
          ],
        },
        {
          model: Roles,
          as: "Roles",
          attributes: ["id", "role_name"],
          through: { attributes: [] },
        },
        {
          model: UserLocation,
          attributes: ['country', 'state_name', 'continent', 'city', 'zip']
        }
      ],
    });

    if (!user) {
       res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const {...userWithoutSensitiveData } = user?.toJSON();

    res.status(200).json({
      success: true,
      message: "User details fetched successfully.",
      data: {
        user: userWithoutSensitiveData,
      },
    });
  } catch (error) {
    // Log and handle errors
    handleError(error, req, res, "Internal Server Error");
  }
});

export { getMyProfile };
