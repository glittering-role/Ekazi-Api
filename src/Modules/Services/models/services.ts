import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../config/db';
import ServiceProviders from "./service_provider";

interface ServiceAttributes {
    id: string;
    title: string | null;
    title_slug: string | null;
    description: string | null;
    sub_category_id: string | null;
    provider_id: string | null;
    pricing_mode: string | null;
    location?: string | null;
    service_location_preference?: string | null;
    status: boolean;
    postFor: string | null;
    provider?: ServiceProviders;
    price_from?: number;
    price_to?: number;

    longitude: number | null;
    latitude: number | null;

    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;  

}

interface ServiceCreationAttributes extends Optional<ServiceAttributes, 'id' | 'location' | 'createdAt' | 'updatedAt'> {}

class Service extends Model<ServiceAttributes, ServiceCreationAttributes> implements ServiceAttributes {
    public id!: string;
    public title!: string | null;
    public title_slug!: string | null;
    public description!: string | null;
    public sub_category_id!: string | null;
    public provider_id!: string | null;
    public pricing_mode!: string | null;
    public price_from!: number;
    public price_to!: number;
    public location?: string | null;
    public status!: boolean;
    public postFor!: string | null;
    public service_location_preference?: string | null;
    public provider?: ServiceProviders;

    public longitude!: number | null;
    public latitude!: number | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date | null;
}

Service.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        title_slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        sub_category_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        provider_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        service_location_preference: {
            type: DataTypes.ENUM('remote', 'on-site', 'hybrid'),
            allowNull: false,
        },
        pricing_mode: {
            type: DataTypes.ENUM('hourly-rate', 'fixed'),
            allowNull: false,
        },
        price_from: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                isDecimal: true,
            },
        },
        price_to: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            validate: {
                isDecimal: true,
            },
        },
        location: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
        },
        postFor: {
            type: DataTypes.ENUM('public', 'private'),
            defaultValue: 'public',
            allowNull: false,
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        longitude: {
            type: DataTypes.DECIMAL(10, 7),
            allowNull: true,
        },
        latitude: {
            type: DataTypes.DECIMAL(10, 7),
            allowNull: true,
        },

    },
    {
        sequelize: db,
        tableName: 'services',
        freezeTableName: true,
        timestamps: true, 
        paranoid: true,  
    }
);

export default Service;
