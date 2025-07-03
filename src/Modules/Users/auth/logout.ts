import {createResponse} from "../../../logs/helpers/response";
import {asyncHandler} from "../../../middleware/async-middleware";
import {Request, Response} from "express";
const {handleError} = require("../../../logs/helpers/erroHandler");

export const logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    // Clear the session cookie from the client side
    res.clearCookie('x_TKN');

    // Respond with a success message
    res.status(200).json(createResponse(true, 'Logged out successfully'));

  } catch (error) {
    handleError(error, req, res, "Error while logging out.");
  }
});


