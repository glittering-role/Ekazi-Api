import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../config/db';

// Interface for attributes
interface BlockedDateAttributes {
    id?: string;
    provider_id: string;
    blocked_date: string; // Keeping as string to match Sequelize DATEONLY
    reason?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Interface for creation attributes
interface BlockedDateCreationAttributes extends Optional<BlockedDateAttributes, 'id'> {}

class BlockedDate
    extends Model<BlockedDateAttributes, BlockedDateCreationAttributes>
    implements BlockedDateAttributes
{
    public id!: string;
    public provider_id!: string;
    public blocked_date!: string;
    public reason?: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// Define Model
BlockedDate.init(
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
        blocked_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        reason: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    },
    {
        sequelize: db,
        modelName: 'blocked_dates',
        freezeTableName: true,
        timestamps: true,
        indexes: [
            { fields: ['provider_id'] },
            { fields: ['blocked_date'] },
        ],
    }
);


export default BlockedDate;
