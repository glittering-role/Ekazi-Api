import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../config/db';

// Define the attributes for the Bid model
interface BidAttributes {
    id: string;
    post_id: string;
    user_id: string;
    amount: number;
    comment: string | null;
    created_at: Date;
    status: string;

    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

// Define the attributes required for creating a new Bid
interface BidCreationAttributes extends Optional<BidAttributes, 'id' | 'created_at'> {}

// Define the Bid model class
class Bid extends Model<BidAttributes, BidCreationAttributes> implements BidAttributes {
    public id!: string;
    public post_id!: string;
    public user_id!: string;
    public amount!: number;
    public comment!: string | null;
    public created_at!: Date;
    public status!: string;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date | null;
}

// Initialize the Bid model
Bid.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        post_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING(50),
            defaultValue: 'pending',
            allowNull: false,
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
    },
    {
        sequelize: db,
        tableName: 'bids',
        timestamps: true,
        underscored: true,
        paranoid: true,
        indexes: [
            {
                name: "idx_bid_post_id",
                fields: ["post_id"],
            },
            {
                name: "idx_bid_user_id",
                fields: ["user_id"],
            },
            {
                name: "idx_bid_status",
                fields: ["status"],
            },
        ],
    }
);

export default Bid;