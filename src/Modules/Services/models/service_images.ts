import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../config/db';

interface ServiceImageAttributes {
    id: string;
    service_id: string;
    image_url: string;
    is_primary: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null; 
}

interface ServiceImageCreationAttributes extends Optional<ServiceImageAttributes, 'id' | 'is_primary' | 'createdAt' | 'updatedAt'> {}

class ServiceImage extends Model<ServiceImageAttributes, ServiceImageCreationAttributes> implements ServiceImageAttributes {
    public id!: string;
    public service_id!: string;
    public image_url!: string;
    public is_primary!: boolean;
    public deletedAt?: Date | null; 
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

ServiceImage.init(
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
        tableName: 'service_images',
        freezeTableName: true,
        timestamps: true,
        paranoid: true, 
    }
);

export default ServiceImage;
