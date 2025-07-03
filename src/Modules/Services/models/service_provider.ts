import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../config/db';

// Interface for attributes
interface ServiceProviderAttributes {
    id: string;
    user_id: string | null;
    business_name?: string | null;
    business_type?: string | null;
    phone_number?: string | null;
    business_location?: string | null;
    work_description?: string | null;
    years_of_experience?: number | null; 
    availability?: string | null;
    status: 'under_review' | 'approved' | 'deactivated' | 'flagged';
    is_verified: boolean;
    is_occupied: boolean;
    is_online: boolean;
    totalCommission: number | null;
    totalEarnings: number | null;
    averageResponseTime?: number | null; 

}

// Interface for creation attributes
interface ServiceProviderCreationAttributes
    extends Optional<ServiceProviderAttributes, 'id' | 'phone_number' | 'business_location' | 'business_type' | 'work_description' | 'availability' |  'is_verified' | 'is_occupied' | 'is_online' |'years_of_experience' | "totalCommission" | "totalEarnings" > {}

class ServiceProviders
    extends Model<ServiceProviderAttributes, ServiceProviderCreationAttributes>
    implements ServiceProviderAttributes
{
    public id!: string;
    public user_id!: string;
    public points!: number;
    public business_name!: string | null;
    public business_type!: string | null;
    public phone_number!: string | null;
    public business_location!: string | null;
    public work_description!: string | null;
    public availability!: string | null;
    public years_of_experience!: number | null;
    public status!: 'under_review' | 'approved' | 'deactivated' | 'flagged';
    public is_verified!: boolean;
    public is_occupied!: boolean;
    public is_online!: boolean;
    public totalCommission!: number | null;
    public totalEarnings!: number | null;
    public averageResponseTime!: number | null;  


    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

ServiceProviders.init(
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

        business_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        business_type: {
            type: DataTypes.ENUM('solo', 'business'),
            allowNull: true,
        },
        phone_number: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        business_location: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        years_of_experience: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        work_description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        availability: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('under_review', 'approved', 'deactivated', 'flagged'),
            allowNull: false,
            defaultValue: 'under_review',
        },
        totalCommission: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
            allowNull: false,
        },
        totalEarnings:{
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
            allowNull: false,
        },
        is_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        is_occupied: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        is_online: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        averageResponseTime: {
            type: DataTypes.FLOAT, 
            allowNull: true,
        },
    },
    {
        sequelize: db,
        modelName: 'service_providers',
        freezeTableName: true,
        timestamps: true,
    }
);

export default ServiceProviders;
