import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../config/db';

// Interface for attributes
interface BookingAttributes {
    service_id: string | null;
    id: string;
    provider_id: string;
    user_id: string;
    start_time: Date;
    end_time: Date;
    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    last_updated_by?: string | null;
    last_action?: string | null;
    created_at?: Date;
}

// Interface for creation attributes
interface BookingCreationAttributes
    extends Optional<BookingAttributes, 'id' | 'status' | 'created_at'> {}

class Booking extends Model<BookingAttributes, BookingCreationAttributes> implements BookingAttributes {

    public id!: string;
    public service_id!: string ;
    public provider_id!: string;
    public user_id!: string;
    public start_time!: Date;
    public end_time!: Date;
    public status!: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    public last_updated_by?: string | null;
    public last_action?: string | null;
    public readonly created_at!: Date;
}

Booking.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        service_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        provider_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        start_time: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        end_time: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('pending', 'confirmed', 'cancelled' ,'completed'),
            allowNull: false,
            defaultValue: 'pending',
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        last_updated_by: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        last_action: {
            type: DataTypes.ENUM('updated', 'cancelled', 'rescheduled'),
            allowNull: true,
        },
    },
    {
        sequelize: db,
        modelName: 'booking',
        freezeTableName: true,
        timestamps: false, 
    }
);

export default Booking;
