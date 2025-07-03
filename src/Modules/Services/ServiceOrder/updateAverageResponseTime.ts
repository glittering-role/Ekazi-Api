import { Transaction } from "sequelize";
import { ServiceOrder, ServiceProviders } from "../models/associations";

/**
 * Calculates and updates the provider's average response time.
 * @param providerUserId - The ID of the provider accepting the order.
 * @param acceptedAt - The timestamp when the order was accepted.
 * @param requestedAt - The timestamp when the order was requested.
 * @param transaction - Sequelize transaction object for consistency.
 */
export const updateAverageResponseTime = async (
    providerUserId: string,
    acceptedAt: Date | null,
    requestedAt: Date | null,
    transaction?: Transaction
  ): Promise<void> => {
    if (!acceptedAt || !requestedAt) {
      console.warn("AcceptedAt or RequestedAt is null, skipping calculation.");
      return; 
    }
  
    // Calculate the response time for this order
    const responseTime = (acceptedAt.getTime() - requestedAt.getTime()) / 1000; // Convert to seconds
  
    // Fetch past response times for the provider
    const pastOrders = await ServiceOrder.findAll({
      where: {
        provider_user_id: providerUserId,
        status: "accepted",
        accepted_at: { $ne: null },
      },
      attributes: ["requested_at", "accepted_at"],
      transaction,
    });
  
    const pastResponseTimes = pastOrders
      .map((order) =>
        order.accepted_at && order.requested_at
          ? (new Date(order.accepted_at).getTime() - new Date(order.requested_at).getTime()) / 1000
          : null
      )
      .filter((time): time is number => time !== null); 
  
    // Include the new response time in the average calculation
    pastResponseTimes.push(responseTime);
  
    // Calculate new average response time
    const averageResponseTime =
      pastResponseTimes.reduce((acc: number, time: number) => acc + time, 0) /
      pastResponseTimes.length;
  
    // Update the provider's record with the new average response time
    await ServiceProviders.update(
      { averageResponseTime },
      {
        where: { user_id: providerUserId },
        transaction,
      }
    );
  };
  