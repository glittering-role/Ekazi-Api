import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../config/db';


// Define the attributes for the Comment model
interface CommentRepliesAttributes {
    id: string;
    post_id: string;
    user_id: string;
    parent_comment_id: string | null;
    comment: string;
    created_at: Date;

    createdAt?: Date;
    updatedAt?: Date;
}

// Define the attributes required for creating a new Comment
interface CommentRepliesCreationAttributes extends Optional<CommentRepliesAttributes, 'id' | 'created_at' | 'parent_comment_id'> {}

// Define the Comment model class
class CommentReplies extends Model<CommentRepliesAttributes, CommentRepliesCreationAttributes> implements CommentRepliesAttributes {
    public id!: string;
    public post_id!: string;
    public user_id!: string;
    public parent_comment_id!: string | null;
    public comment!: string;
    public created_at!: Date;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// Initialize the Comment model
CommentReplies.init(
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
        parent_comment_id: {
            type: DataTypes.UUID,
            allowNull: true,
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
        tableName: 'comments_replies',
        timestamps: true,
        underscored: true,
        indexes: [
            // Index on post_id for faster lookups of replies for a specific post
            {
                name: 'idx_post_id',
                fields: ['post_id'],
            },
            // Index on user_id for faster lookups of replies by a specific user
            {
                name: 'idx_user_id',
                fields: ['user_id'],
            },
            // Index on parent_comment_id for faster lookups of replies to a specific comment
            {
                name: 'idx_parent_comment_id',
                fields: ['parent_comment_id'],
            },
            // Composite index on (post_id, user_id) for faster lookups of replies by a specific user on a specific post
            {
                name: 'idx_post_user',
                fields: ['post_id', 'user_id'],
            },
        ],
    }
);


export default CommentReplies;