import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../config/db';

interface PostImageAttributes {
    id: string;
    post_id: string;
    image_url: string;
    is_primary: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

interface PostImageCreationAttributes extends Optional<PostImageAttributes, 'id' | 'is_primary' | 'createdAt' | 'updatedAt'> {}

class PostImage extends Model<PostImageAttributes, PostImageCreationAttributes> implements PostImageAttributes {
    public id!: string;
    public post_id!: string;
    public image_url!: string;
    public is_primary!: boolean;
    public deletedAt?: Date | null;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

PostImage.init(
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
        image_url: {
            type: DataTypes.STRING(350),
            allowNull: false,
        },
        is_primary: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
    },
    {
        sequelize: db,
        tableName: 'service_post_images',
        freezeTableName: true,
        timestamps: true,
        paranoid: true,
        indexes: [
            {
                name: "idx_post_image_post_id",
                fields: ["post_id"],
            },
            {
                name: "idx_post_image_is_primary",
                fields: ["is_primary"],
            },
        ],
    }
);

export default PostImage;
