// import { Request, Response } from "express";
// import { Op } from "sequelize";
// import {
//   DefaultAvailability,
//   BlockedDate,
//   AvailabilityOverride,
//   Booking,
// } from "../../models/associations";
// import { handleError } from "../../../../logs/helpers/erroHandler";
// import { asyncHandler } from "../../../../middleware/async-middleware";
// import { createResponse } from "../../../../logs/helpers/response";
//
// /**
//  * Rebook a cancelled booking. Applies the same availability and conflict checks.
//  */
// export const rebook = asyncHandler(
//   async (req: Request, res: Response): Promise<void> => {
//     try {
//       const { id } = req.params;
//       const { start_time, end_time } = req.body;
//       const oldBooking = await Booking.findByPk(id);
//       if (!oldBooking) {
//         res
//           .status(404)
//           .json(createResponse(false, "Original booking not found."));
//         return;
//       }
//       if (oldBooking.status !== "cancelled") {
//         res
//           .status(400)
//           .json(
//             createResponse(false, "Only cancelled bookings can be rebooked.")
//           );
//         return;
//       }
//
//       const startTime = new Date(start_time);
//       const endTime = new Date(end_time);
//       if (startTime >= endTime) {
//         res
//           .status(400)
//           .json(createResponse(false, "Start time must be before end time."));
//         return;
//       }
//
//       const dayOfWeek = startTime
//         .toLocaleDateString("en-US", { weekday: "long" })
//         .toLowerCase();
//       const formatTime = (date: Date): string =>
//         date.toTimeString().split(" ")[0];
//       const bookingStartStr = formatTime(startTime);
//       const bookingEndStr = formatTime(endTime);
//       const bookingDate = startTime.toISOString().split("T")[0];
//
//       const defaultSchedule = await DefaultAvailability.findOne({
//         where: {
//           provider_id: oldBooking.provider_id,
//           day_of_week: dayOfWeek,
//           start_time: { [Op.lte]: bookingStartStr },
//           end_time: { [Op.gte]: bookingEndStr },
//         },
//       });
//       if (!defaultSchedule) {
//         res
//           .status(400)
//           .json(
//             createResponse(
//               false,
//               "Provider is not available during these hours (default schedule)."
//             )
//           );
//         return;
//       }
//
//       const blocked = await BlockedDate.findOne({
//         where: {
//           provider_id: oldBooking.provider_id,
//           blocked_date: bookingDate,
//         },
//       });
//       if (blocked) {
//         res
//           .status(400)
//           .json(createResponse(false, "Provider is unavailable on this date."));
//         return;
//       }
//
//       const override = await AvailabilityOverride.findOne({
//         where: {
//           provider_id: oldBooking.provider_id,
//           override_date: bookingDate,
//         },
//       });
//       if (override) {
//         if (!override.is_available) {
//           res
//             .status(400)
//             .json(
//               createResponse(
//                 false,
//                 "Provider is unavailable on this date (override)."
//               )
//             );
//           return;
//         }
//         if (override.start_time && override.end_time) {
//           if (
//             bookingStartStr < override.start_time ||
//             bookingEndStr > override.end_time
//           ) {
//             res
//               .status(400)
//               .json(
//                 createResponse(
//                   false,
//                   "Booking time is outside the provider's override available hours."
//                 )
//               );
//             return;
//           }
//         }
//       }
//
//       // Check for conflicting bookings.
//       const conflict = await Booking.findOne({
//         where: {
//           provider_id: oldBooking.provider_id,
//           status: { [Op.in]: ["pending", "confirmed"] },
//           [Op.and]: [
//             { start_time: { [Op.lt]: endTime } },
//             { end_time: { [Op.gt]: startTime } },
//           ],
//         },
//       });
//       if (conflict) {
//         res
//           .status(400)
//           .json(
//             createResponse(
//               false,
//               "Provider already has a booking during this time."
//             )
//           );
//         return;
//       }
//
//       // Create new booking with status "pending"
//       const newBooking = await Booking.create({
//         provider_id: oldBooking.provider_id,
//         user_id: oldBooking.user_id,
//         start_time: startTime,
//         end_time: endTime,
//         service_id: oldBooking.service_id,
//         status: "pending",
//       });
//       res
//         .status(201)
//         .json(
//           createResponse(true, "Booking rebooked successfully", { newBooking })
//         );
//     } catch (error) {
//       handleError(error, req, res, "Error rebooking");
//     }
//   }
// );
