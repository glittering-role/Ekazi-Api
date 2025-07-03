import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../config/db';


// Define the attributes for the Comment model
interface CommentAttributes {
    id: string;
    post_id: string;
    user_id: string;
    comment: string;
    created_at: Date;

    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

// Define the attributes required for creating a new Comment
interface CommentCreationAttributes extends Optional<CommentAttributes, 'id' | 'created_at'> {}

// Define the Comment model class
class Comment extends Model<CommentAttributes, CommentCreationAttributes> implements CommentAttributes {
    public id!: string;
    public post_id!: string;
    public user_id!: string;
    public comment!: string;
    public created_at!: Date;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date | null;
}

// Initialize the Comment model
Comment.init(
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
        comment: {
            type: DataTypes.TEXT,
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
        tableName: 'comments',
        timestamps: true,
        underscored: true,
        paranoid: true,
        indexes: [
            // Index on post_id for faster lookups of comments for a specific post
            {
                name: 'idx_post_id',
                fields: ['post_id'],
            },
            // Index on user_id for faster lookups of comments by a specific user
            {
                name: 'idx_user_id',
                fields: ['user_id'],
            },
            // Composite index on (post_id, user_id) for faster lookups of comments by a specific user on a specific post
            {
                name: 'idx_post_user',
                fields: ['post_id', 'user_id'],
            },
        ],
    }
);

export default Comment;