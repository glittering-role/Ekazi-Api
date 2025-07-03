import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../config/db';
import Like from "./likes";

// Define the attributes for the Post model
interface PostAttributes {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    video_url: string | null;
    location: string | null;
    latitude: number | null;
    longitude: number | null;
    created_at: Date;
    status: string;
    budget: number | null;
    deadline: Date | null;
    sub_category_id:string;

    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

// Define the attributes required for creating a new Post
interface PostCreationAttributes extends Optional<PostAttributes, 'id' | 'created_at'> {}

// Define the Post model class
class Post extends Model<PostAttributes, PostCreationAttributes> implements PostAttributes {
    public id!: string;
    public user_id!: string;
    public title!: string;
    public description!: string | null;
    public image_url!: string | null;
    public video_url!: string | null;
    public location!: string | null;
    public latitude!: number | null;
    public longitude!: number | null;
    public created_at!: Date;
    public status!: string;
    public budget!: number | null;
    public deadline!: Date | null;
    public sub_category_id!: string;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date | null;
}

// Initialize the Post model
Post.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        sub_category_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        image_url: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        video_url: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        location: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        latitude: {
            type: DataTypes.DECIMAL(10, 7),
            allowNull: true,
        },
        longitude: {
            type: DataTypes.DECIMAL(10, 7),
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING(50),
            defaultValue: 'open',
            allowNull: false,
        },
        budget: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        deadline: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
    },
    {
        sequelize: db,
        tableName: 'service_job_posts',
        timestamps: true,
        underscored: true,
        paranoid: true,
        indexes: [
            {
                name: "idx_post_status",
                fields: ["status"],
            },
            {
                name: "idx_post_created_at",
                fields: ["created_at"],
            },
            {
                name: "idx_post_user_id",
                fields: ["user_id"],
            },
            {
                name: "idx_post_sub_category_id",
                fields: ["sub_category_id"],
            },
        ],
    }
);

export default Post;