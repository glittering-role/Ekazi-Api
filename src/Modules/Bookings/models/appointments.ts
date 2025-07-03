import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../config/db';

interface AppointmentAttributes {
    id: string;
    service_id: string | null;
    client_user_id: string | null;
    service_provider_id: string | null;
    appointment_date: Date;
    status: string | null;
    notes?: string | null;
    last_updated_by?: string | null;
    last_action?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

interface AppointmentCreationAttributes extends Optional<AppointmentAttributes, 'id'> {}

class Appointment extends Model<AppointmentAttributes, AppointmentCreationAttributes>
    implements AppointmentAttributes {
    public id!: string;
    public service_id!: string | null;
    public client_user_id!: string | null;
    public service_provider_id!: string | null;
    public appointment_date!: Date;
    public status!: string | null;
    public notes?: string | null;
    public last_updated_by?: string | null;
    public last_action?: string | null;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Appointment.init(
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
        client_user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        service_provider_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        appointment_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('scheduled', 'completed', 'cancelled', 'rescheduled'),
            defaultValue: 'scheduled',
            allowNull: false,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        last_updated_by: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        last_action: {
            type: DataTypes.ENUM('created', 'updated', 'cancelled', 'rescheduled'),
            allowNull: true,
        },
    },
    {
        sequelize: db,
        modelName: 'appointment',
        freezeTableName: true,
        timestamps: true,
    }
);

export default Appointment;
