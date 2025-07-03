import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../config/db'; // Adjust the path to your Sequelize instance


// Define the attributes for the Like model
interface LikeAttributes {
    id: string;
    post_id: string;
    user_id: string;
    created_at: Date;

    createdAt?: Date;
    updatedAt?: Date;
}

// Define the attributes required for creating a new Like
interface LikeCreationAttributes extends Optional<LikeAttributes, 'id' | 'created_at'> {}

// Define the Like model class
class Like extends Model<LikeAttributes, LikeCreationAttributes> implements LikeAttributes {
    public id!: string;
    public post_id!: string;
    public user_id!: string;
    public created_at!: Date;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// Initialize the Like model
Like.init(
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
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
    },
    {
        sequelize: db,
        tableName: 'likes',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                name: 'idx_post_id',
                fields: ['post_id'],
            },
            {
                name: 'idx_user_id',
                fields: ['user_id'],
            },
            {
                name: 'idx_post_user',
                fields: ['post_id', 'user_id'],
                unique: true,
            },
        ],
    }
);

export default Like;