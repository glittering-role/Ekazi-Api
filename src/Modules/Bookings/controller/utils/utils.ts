import { Request, Response } from "express";
import {createResponse} from "../../../../logs/helpers/response";
import {asyncHandler} from "../../../../middleware/async-middleware";
import {ColumnReference, Op} from "sequelize";
import { Appointment } from "../../models/associations";
import { Fn, Literal, Cast } from "sequelize/types/utils";
import {handleError} from "../../../../logs/helpers/erroHandler";
import {getUserIdFromToken} from "../../../../utils/user/get_userId";
import Users from "../../../Users/model/user/user";
import {UserDetails} from "../../../Users/model/associations";


export const getUserNameById = async (userId: string | null | undefined) => {
    const user = await Users.findOne({
        where: { id: userId ?? '' },
        include: [
            {
                model: UserDetails,
                as: 'user_detail',
                attributes: ['first_name', 'middle_name', 'last_name', 'image'],
            },
        ]
    });

    return user ? `${user.user_detail.first_name} ${user.user_detail.last_name}` : 'Unknown User';
};


// Helper function to check if a date is in the future
export const isFutureDate = (date: number | Date) => {
    const now = new Date();
    return date > now;
};

// Helper function to get Appointment count for a given time period
export const getAppointmentCountForPeriod = async (userId: string | undefined, startDate: string | number | boolean | Buffer | Date | (Fn | Literal | ColumnReference | Cast), endDate: string | number | boolean | Buffer | Date | (Fn | Literal | ColumnReference | Cast)) => {
    return await Appointment.count({
        where: {
            client_user_id:   userId ,
            service_provider_id: userId ,
            appointment_date: {
                [Op.between]: [startDate, endDate],
            },
        },
    });
};

// Helper function to get start and end dates for a given month and year
export const getStartAndEndDatesForMonth = (year: number, month: number) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    return { startDate, endDate };
};

// Get analytics for Appointment for a specific month
export const getAppointmentForMonth = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const user_id = getUserIdFromToken(req);
        const { month, year } = req.query;

        // Validate month and year
        if (!month || !year || isNaN(Number(month)) || isNaN(Number(year)) || Number(month) < 1 || Number(month) > 12) {
            res.status(400).json(createResponse(false, 'Invalid month or year'));
            return;
        }

        const { startDate, endDate } = getStartAndEndDatesForMonth(parseInt(year as string, 10), parseInt(month as string, 10));

        const count = await getAppointmentCountForPeriod(user_id, startDate, endDate);

        res.status(200).json(createResponse(true, 'Appointment for the selected month retrieved successfully', { count }));
    } catch (error) {
        handleError(error, req, res, "Error retrieving Appointment for the selected month");
    }
});