import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../config/db';

// Interface for attributes
interface AvailabilityOverrideAttributes {
    id?: string;
    provider_id: string;
    override_date: string;
    start_time?: string | null;
    end_time?: string | null;
    is_available: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Interface for creation attributes
interface AvailabilityOverrideCreationAttributes
    extends Optional<AvailabilityOverrideAttributes, 'id' | 'start_time' | 'end_time'> {}

class AvailabilityOverride
    extends Model<AvailabilityOverrideAttributes, AvailabilityOverrideCreationAttributes>
    implements AvailabilityOverrideAttributes
{
    public id!: string;
    public provider_id!: string;
    public override_date!: string;
    public start_time?: string | null;
    public end_time?: string | null;
    public is_available!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// Define Model
AvailabilityOverride.init(
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
        override_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        start_time: {
            type: DataTypes.TIME,
            allowNull: true,
        },
        end_time: {
            type: DataTypes.TIME,
            allowNull: true,
        },
        is_available: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize: db,
        modelName: 'availability_override',
        freezeTableName: true,
        timestamps: true,
        indexes: [
            { fields: ['provider_id'] },
            { fields: ['override_date'] },
        ],
    }
);


export default AvailabilityOverride;
