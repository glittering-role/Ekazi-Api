import { Request, Response } from "express";
import { createResponse } from "../../../../logs/helpers/response";
import { asyncHandler } from "../../../../middleware/async-middleware";
import { getUserIdFromToken } from "../../../../utils/user/get_userId";
import AvailabilityOverride from "../../models/availability_override";
import { handleError } from "../../../../logs/helpers/erroHandler";
import { isPastDate, isValidDate } from "../../utils/bookingValidation";


// Create availability override
const createAvailabilityOverride = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const provider_id = getUserIdFromToken(req) ?? "";
      const { override_date, start_time, end_time, is_available } = req.body;

      if (!override_date) {
        res
          .status(400)
          .json(createResponse(false, "Override date is required"));
        return;
      }


      if (!isValidDate(override_date)) {
        res
          .status(400)
          .json(createResponse(false, "Invalid date format (use YYYY-MM-DD)"));
        return;
      }

      if (isPastDate(override_date)) {
        res
          .status(400)
          .json(createResponse(false, "Cannot block dates in the past"));
        return;
      }

      const existing = await AvailabilityOverride.findOne({
        where: { provider_id, override_date },
      });

      if (existing) {
        res
          .status(409)
          .json(createResponse(false, "Override for this date already exists"));
        return;
      }

      const override = await AvailabilityOverride.create({
        provider_id,
        override_date,
        start_time,
        end_time,
        is_available,
      });

      res
        .status(201)
        .json(
          createResponse(true, "Availability override created", { override })
        );
    } catch (error) {
      handleError(error, req, res, "Error creating availability override");
    }
  }
);

// Get all availability overrides for provider
const getAvailabilityOverrides = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const provider_id = getUserIdFromToken(req);

      const overrides = await AvailabilityOverride.findAll({
        where: { provider_id },
        attributes: [
          "id",
          "override_date",
          "start_time",
          "end_time",
          "is_available",
          "createdAt",
          "updatedAt",
        ],
        order: [["override_date", "ASC"]],
      });

      res
        .status(200)
        .json(
          createResponse(true, "Availability overrides retrieved", {
            overrides,
          })
        );
    } catch (error) {
      handleError(error, req, res, "Error fetching availability overrides");
    }
  }
);

// Update availability override
const updateAvailabilityOverride = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const provider_id = getUserIdFromToken(req);
      const { id } = req.params;
      const { override_date, start_time, end_time, is_available } = req.body;

      const override = await AvailabilityOverride.findOne({
        where: { id, provider_id },
      });

      if (!override) {
        res
          .status(404)
          .json(createResponse(false, "Availability override not found"));
        return;
      }

      if (override_date) override.override_date = override_date;
      if (start_time !== undefined) override.start_time = start_time;
      if (end_time !== undefined) override.end_time = end_time;
      if (is_available !== undefined) override.is_available = is_available;

      await override.save();
      res
        .status(200)
        .json(
          createResponse(true, "Availability override updated", { override })
        );
    } catch (error) {
      handleError(error, req, res, "Error updating availability override");
    }
  }
);

// Delete availability override
const deleteAvailabilityOverride = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const provider_id = getUserIdFromToken(req);
      const { id } = req.params;

      const override = await AvailabilityOverride.findOne({
        where: { id, provider_id },
      });

      if (!override) {
        res
          .status(404)
          .json(createResponse(false, "Availability override not found"));
        return;
      }

      await override.destroy();
      res
        .status(200)
        .json(createResponse(true, "Availability override removed"));
    } catch (error) {
      handleError(error, req, res, "Error deleting availability override");
    }
  }
);

export {
  createAvailabilityOverride,
  getAvailabilityOverrides,
  updateAvailabilityOverride,
  deleteAvailabilityOverride,
};
