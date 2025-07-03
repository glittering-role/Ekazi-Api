import { Users } from "../../Users/model/associations";
import Booking from "./booking";
import AvailabilityOverride from "./availability_override";
import BlockedDate from "./blocked_date";
import DefaultAvailability from "./default_availability";
import { Service } from "../../Services/models/associations";
import Appointment from "./appointments";


Users.hasMany(Booking, { foreignKey: 'user_id', as: 'userBookings', onDelete: 'CASCADE' });
Booking.belongsTo(Users, { foreignKey: 'user_id', as: 'user' });

Users.hasMany(Booking, { foreignKey: 'provider_id', as: 'providerBookings', onDelete: 'CASCADE' });
Booking.belongsTo(Users, { foreignKey: 'provider_id', as: 'provider' });

// Services can have many bookings
Service.hasMany(Booking, { foreignKey: "service_id", as: "serviceBookings", onDelete: "CASCADE" });
Booking.belongsTo(Service, { foreignKey: "service_id", as: "service" });


Users.hasMany(AvailabilityOverride, { foreignKey: 'provider_id', as: 'availabilityOverrides', onDelete: 'CASCADE' });
AvailabilityOverride.belongsTo(Users, { foreignKey: 'provider_id', as: 'provider' });

Users.hasMany(BlockedDate, { foreignKey: 'provider_id', as: 'blockedDates', onDelete: 'CASCADE' });
BlockedDate.belongsTo(Users, { foreignKey: 'provider_id', as: 'provider' });

Users.hasMany(DefaultAvailability, { foreignKey: 'provider_id', as: 'defaultAvailabilities', onDelete: 'CASCADE' });
DefaultAvailability.belongsTo(Users, { foreignKey: 'provider_id', as: 'provider' });


export { Appointment, Booking, AvailabilityOverride, BlockedDate, DefaultAvailability };
