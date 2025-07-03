import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../config/db';

// Interface for attributes: selected_dates is now an array of specific dates
interface DefaultAvailabilityAttributes {
    id?: string;
    provider_id: string;
    selected_dates: string[]; // Array of specific dates
    start_time: string;
    end_time: string;
}

// Interface for creation attributes
interface DefaultAvailabilityCreationAttributes extends Optional<DefaultAvailabilityAttributes, 'id'> {}

class DefaultAvailability
    extends Model<DefaultAvailabilityAttributes, DefaultAvailabilityCreationAttributes>
    implements DefaultAvailabilityAttributes
{
    public id!: string;
    public provider_id!: string;
    public selected_dates!: string[];
    public start_time!: string;
    public end_time!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

DefaultAvailability.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        provider_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        selected_dates: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        start_time: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        end_time: {
            type: DataTypes.TIME,
            allowNull: false,
        },
    },
    {
        sequelize: db,
        modelName: 'default_availability',
        freezeTableName: true,
        timestamps: true,
        indexes: [
            { unique: false, fields: ['provider_id'] },
            { unique: false, fields: ['start_time', 'end_time'] },
        ],
    }
);

export default DefaultAvailability;
