import { Request, Response } from "express";
import { asyncHandler } from "../../../middleware/async-middleware";
import { handleError } from "../../../logs/helpers/erroHandler";
import { createResponse } from "../../../logs/helpers/response";
import { ServiceOrder, ServiceProviders } from "../models/associations";
import { getUserIdFromToken } from "../../../utils/user/get_userId";
import { v4 as uuidv4 } from "uuid";
import { createNotifications } from "../../Notifications/service/notificationService";
import Service from "../models/services";
import { Users } from "../../Users/model/associations";
import { validateInput } from "../../../utils/validation/validation";
import { updateAverageResponseTime } from "./updateAverageResponseTime";

// Delay Function (if needed)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Create Service Order
 */
export const createServiceOrder = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const transaction = await ServiceOrder.sequelize?.transaction();
    try {
      const client_user_id = getUserIdFromToken(req);

      const { value, errors } = validateInput(req.body);
      if (errors) {
        res.status(400).json(createResponse(false, "Validation failed", { errors }));
        return;
      }

      if (!value) {
        res.status(400).json(createResponse(false, "Validation failed", { errors: ["Invalid input data"] }));
        return;
      }

      const { service_id, latitude, longitude } = value;

      // Limit on the number of pending orders a user can have
      const MAX_PENDING_ORDERS = 3;

      // Check the number of pending orders for the client
      const pendingOrdersCount = await ServiceOrder.count({
        where: {
          client_user_id,
          status: "pending",
        },
        transaction,
      });

      if (pendingOrdersCount >= MAX_PENDING_ORDERS) {
        res
          .status(400)
          .json(
            createResponse(
              false,
              `You have reached the limit of ${MAX_PENDING_ORDERS} pending orders. Please complete or cancel an existing order before creating a new one.`
            )
          );
        return;
      }

      // Find the service by ID with provider_id attribute
      const service = await Service.findByPk(service_id, {
        attributes: ["provider_id"],
        transaction,
      });

      if (!service) {
        res.status(404).json(createResponse(false, "Service not found"));
        return;
      }

      // Find the service provider
      // @ts-ignore
      const serviceProvider = await ServiceProviders.findByPk(service.provider_id,
        {
          attributes: ["user_id"],
          transaction,
        }
      );

      if (!serviceProvider) {
        res.status(500).json(createResponse(false, "Provider not found"));
        return;
      }

      // Ensure client is not the service provider
      if (client_user_id === serviceProvider.user_id) {
        res.status(400).json(createResponse(false, "A service provider cannot create an order for their own service"));
        return;
      }

      const tracking_number = `SO-${uuidv4()}`;
      const expires_at = new Date(Date.now() + 600000);

      // Create Service Order within transaction
      const newServiceOrder = await ServiceOrder.create(
        {
          client_user_id,
          provider_user_id: serviceProvider.user_id,
          service_id,
          status: "pending",
          requested_at: new Date(),
          expires_at,
          tracking_number,
          latitude,
          longitude,
        },
        { transaction }
      );

      // Send notifications concurrently to provider and client
      await Promise.all([
        createNotifications(
            serviceProvider.user_id,
          "notification",
          `New service order. Tracking number: ${tracking_number}`
        ),
        createNotifications(
          client_user_id,
          "notification",
          `New service order created. Tracking number: ${tracking_number}`
        ),
      ]);

      await transaction?.commit();
      res.status(201).json(
        createResponse(true, "Service order created successfully", {
          data: newServiceOrder,
        })
      );
    } catch (error) {
      if (transaction) await transaction.rollback();
      handleError(
        error,
        req,
        res,
        "An error occurred while creating the service order"
      );
    }
  }
);

/**
 * Accept Service Order
 * Only the provider linked to the service is allowed to accept the order.
 */
export const acceptServiceOrder = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const transaction = await ServiceOrder.sequelize?.transaction();
    try {
      const { order_id } = req.params;
      const provider_user_id = getUserIdFromToken(req) ?? "";

      // Load the service order along with its related service and client
      const serviceOrder = await ServiceOrder.findByPk(order_id, {
        include: [
          { model: Service, as: "service" },
          { model: Users, as: "client" },
        ],
        transaction,
      });

      if (!serviceOrder) {
        res.status(404).json(createResponse(false, "Service order not found"));
        return;
      }

      // Check if the order is already accepted
      if (serviceOrder.status === "accepted") {
        res
          .status(400)
          .json(createResponse(false, "Service order is already accepted"));
        return;
      }

      // Fetch the provider's user account
      const providerUser = await ServiceProviders.findOne({
        where: {
          user_id: provider_user_id,
        },
        attributes: ["id", "points", "totalEarnings"],
        transaction,
      });
      if (!providerUser) {
        res.status(404).json(createResponse(false, "Provider user not found"));
        return;
      }

      // Update the order status to accepted
      const service_order = await serviceOrder.update(
        {
          status: "accepted",
          accepted_at: new Date(),
          provider_user_id,
        },
        { transaction }
      );

      // Update provider's average response time
      await updateAverageResponseTime(
        provider_user_id,
        service_order?.accepted_at,
        service_order.requested_at,
        transaction
      );

      //will add a arived logic to  fit this  well
       await serviceOrder.update(
          {
            status: "in_progress",
            provider_user_id,
          },
          { transaction }
       );

      // Send notifications
      await Promise.all([
        // Notification to the client
        createNotifications(
          serviceOrder.client_user_id,
          "notification",
          `Your service request has been accepted. Provider: ${providerUser.business_name}.`
        ),
        // Notification to the provider
        createNotifications(
          provider_user_id,
          "notification",
          `You have accepted a service request.`
        ),
      ]);

      await transaction?.commit();
      res.status(200).json(
        createResponse(true, "Service order accepted successfully", )
      );
    } catch (error) {
      if (transaction) await transaction.rollback();
      handleError(
        error,
        req,
        res,
        "An error occurred while accepting the service order"
      );
    }
  }
);

/**
 * Complete Service Order (Both client and provider mark as completed)
 */
export const completeServiceOrder = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const transaction = await ServiceOrder.sequelize?.transaction();
    try {
      const { order_id } = req.params;
      const user_id = getUserIdFromToken(req);

      if (!user_id) {
        res.status(401).json(createResponse(false, "User not authenticated"));
        return;
      }

      const serviceOrder = await ServiceOrder.findByPk(order_id, { transaction });
      if (!serviceOrder) {
        res.status(404).json(createResponse(false, "Service order not found"));
        return;
      }

      if (serviceOrder.status !== "in_progress") {
        res.status(400).json(createResponse(false, "Service order is not in progress"));
        return;
      }

      // Check if the current user is the client or the provider
      let updateData: any = {};
      if (user_id === serviceOrder.client_user_id) {
        if (serviceOrder.client_completed_at) {
          res.status(400).json(
            createResponse(
              false,
              "You have already marked this service order as complete"
            )
          );
          return;
        }
        updateData.client_completed_at = new Date();
      } else if (user_id === serviceOrder.provider_user_id) {
        if (serviceOrder.provider_completed_at) {
          res.status(400).json(
            createResponse(
              false,
              "You have already marked this service order as complete"
            )
          );
          return;
        }
        updateData.provider_completed_at = new Date();
      } else {
        res.status(403).json(
          createResponse(
            false,
            "You are not authorized to complete this service order"
          )
        );
        return;
      }

      // Update the service order with the party's completion timestamp
      await serviceOrder.update(updateData, { transaction });

      // Refresh the service order instance to reflect the changes
      await serviceOrder.reload({ transaction });

      // Check if both parties have completed the service
      if (serviceOrder.client_completed_at && serviceOrder.provider_completed_at) {
        await serviceOrder.update(
          { status: "completed", completed_at: new Date() },
          { transaction }
        );

        // Update provider's total earnings with the price of the service
        const provider = await ServiceProviders.findOne({
          where: { user_id: serviceOrder.provider_user_id },
          transaction,
        });

        if (provider) {
          provider.totalEarnings = (provider.totalEarnings || 0) + (serviceOrder.amount ?? 0);
          await provider.save({ transaction });
        }

        // Send notifications concurrently once fully completed
        await Promise.all([
          createNotifications(
            serviceOrder.provider_user_id,
            "notification",
            `Service order completed. Tracking number: ${serviceOrder.tracking_number}`
          ),
          createNotifications(
            serviceOrder.client_user_id,
            "notification",
            `Service order completed. Tracking number: ${serviceOrder.tracking_number}`
          ),
        ]);

        await transaction?.commit();
        res.status(200).json(
          createResponse(
            true,
            "Service order fully completed and earnings updated for provider"
          )
        );
      } else {
        // Commit the partial update and inform the user to wait for the other party
        await transaction?.commit();
        res.status(200).json(
          createResponse(
            true,
            "Your completion has been recorded. Waiting for the other party to mark as complete."
          )
        );
      }
    } catch (error) {
      if (transaction) await transaction.rollback();
      handleError(error, req, res, "An error occurred while completing the service order");
    }
  }
);




/**
 * Decline Service Order
 */
export const declineServiceOrder = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const transaction = await ServiceOrder.sequelize?.transaction();
    try {
      const { order_id } = req.params;
      const provider_user_id = getUserIdFromToken(req);

      if (!provider_user_id) {
        res
          .status(401)
          .json(createResponse(false, "Provider not authenticated"));
        return;
      }

      const serviceOrder = await ServiceOrder.findByPk(order_id, {
        transaction,
      });
      if (!serviceOrder) {
        res.status(404).json(createResponse(false, "Service order not found"));
        return;
      }

      if (serviceOrder.status !== "pending") {
        res
          .status(400)
          .json(
            createResponse(
              false,
              "Service order cannot be declined in its current state"
            )
          );
        return;
      }

      // Update the service order status to 'cancelled'
      await serviceOrder.update(
        { status: "cancelled", cancelled_at: new Date() },
        { transaction }
      );

      // Send notifications concurrently to both provider and client
      await Promise.all([
        createNotifications(
          provider_user_id,
          "notification",
          `You Canceled Service order. Tracking number: ${serviceOrder.tracking_number}`
        ),
        createNotifications(
          serviceOrder.client_user_id,
          "notification",
          `Service order declined by provider. Tracking number: ${serviceOrder.tracking_number}`
        ),
      ]);

      await transaction?.commit();
      res
        .status(200)
        .json(createResponse(true, "Service order declined successfully"));
    } catch (error) {
      if (transaction) await transaction.rollback();
      handleError(
        error,
        req,
        res,
        "An error occurred while declining the service order"
      );
    }
  }
);
