import { Request, Response } from "express";
import {createResponse} from "../../../../logs/helpers/response";
import {asyncHandler} from "../../../../middleware/async-middleware";
import { Appointment } from "../../models/associations";
import { getUserNameById, isFutureDate } from "../utils/utils";
import {getUserIdFromToken} from "../../../../utils/user/get_userId";
import {createNotifications} from "../../../Notifications/service/notificationService";
import {handleError} from "../../../../logs/helpers/erroHandler";

// Update an appointment
const updateAppointment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, notes, appointment_date } = req.body;

        const user_id = getUserIdFromToken(req);

        const appointment = await Appointment.findByPk(id);
        if (!appointment) {
             res.status(404).json(createResponse(false, 'Appointment not found'));
             return
        }

        // Check if appointment_date is in the future
        if (!isFutureDate(new Date(appointment_date))) {
             res.status(400).json(createResponse(false, 'Appointment date must be in the future'));
             return
        }

        // Check if the user is authorized to cancel the appointment
        if (appointment.client_user_id !== user_id && appointment.service_provider_id !== user_id) {
             res.status(403).json(createResponse(false, 'Unauthorized to update this appointment'));
             return
        }

        const previousStatus = appointment.status;

        // Update status to rescheduled if appointment_date is changed
        if (appointment_date && appointment_date !== appointment.appointment_date) {
            appointment.status = 'rescheduled';
        }

        if (status) {
            if (status === 'completed' && appointment.status === 'cancelled') {
                 res.status(400).json(createResponse(false, 'Cannot complete a cancelled appointment'));
                 return
            }
            appointment.status = status;
        }

        if (notes) appointment.notes = notes;
        if (appointment_date) appointment.appointment_date = appointment_date;

        await appointment.save();


        const user_name = await getUserNameById(user_id);
        const message = `Your appointment has been updated successfully by ${user_name}.`;

        await createNotifications(user_id, 'Appointment Updated', message);

         res.status(200).json(createResponse(true, 'Appointment updated successfully'));

    } catch (error) {
        handleError(error, req, res, "Error updating appointment");
    }
   });

// Cancel an appointment
const cancelAppointment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user_id = getUserIdFromToken(req);

        const appointment = await Appointment.findByPk(id);
        if (!appointment) {
             res.status(404).json(createResponse(false, 'Appointment not found'));
             return
        }

        // Check if the user is authorized to cancel the appointment
        if (appointment.client_user_id !== user_id && appointment.service_provider_id !== user_id) {
             res.status(403).json(createResponse(false, 'Unauthorized to cancel this appointment'));
             return
        }

        // Update the appointment status to cancelled
        appointment.status = 'cancelled';
        await appointment.save();

        // Send notification about the cancellation
        const user_name = await getUserNameById(user_id);
        const message = `Your appointment has been cancelled by ${user_name}.`;

        await createNotifications(user_id, 'Appointment Cancelled', message);

         res.status(200).json(createResponse(true, 'Appointment cancelled successfully'));

    } catch (error) {
        handleError(error, req, res, "Error cancelling appointment");
    }
});

export { updateAppointment, cancelAppointment };