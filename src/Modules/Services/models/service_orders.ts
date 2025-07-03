import { DataTypes, Model, Optional } from 'sequelize';
import db from "../../../config/db";
import {Users} from "../../Users/model/associations";
import ServiceProviders from "./service_provider";

interface ServiceOrderAttributes {

    id: string;
    client_user_id: string | null;
    provider_user_id: string | null;
    service_id: string | null;
    mpesa_stk_request_id: string | null;
    amount: number | null;
    status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
    requested_at: Date;
    accepted_at: Date | null;
    completed_at: Date | null;
    cancelled_at: Date | null;
    tracking_number: string | null;
    expires_at: Date;
    
    longitude: number | null;
    latitude: number | null;
    client_completed_at: Date | null;
    provider_completed_at: Date | null;

    client?: Users;
    serviceProviderUser?: Users;


    createdAt?: Date;
    updatedAt?: Date;
}

interface ServiceOrderCreationAttributes extends Optional<ServiceOrderAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class ServiceOrder extends Model<ServiceOrderAttributes, ServiceOrderCreationAttributes> implements ServiceOrderAttributes {
    public id!: string;
    public client_user_id!: string | null;
    public provider_user_id!: string | null;
    public service_id!: string | null;
    public mpesa_stk_request_id!: string | null;
    public amount!: number | null;
    public status!: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
    public requested_at!: Date;
    public accepted_at!: Date | null;
    public completed_at!: Date | null;
    public cancelled_at!: Date | null;
    public tracking_number!: string | null;
    public expires_at!: Date;
    public client_completed_at!: Date | null;
    public provider_completed_at!: Date | null;
    public longitude!: number | null;
    public latitude!: number | null;


    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    service: any;
    client: any;
}

ServiceOrder.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        client_user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        provider_user_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        service_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        mpesa_stk_request_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'expired'),
            defaultValue: 'pending',
            allowNull: false,
        },
        requested_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        accepted_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        completed_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        cancelled_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        tracking_number: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        // New fields:
        client_completed_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        provider_completed_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        longitude: {
            type: DataTypes.DECIMAL(10, 7), // Higher precision for longitude
            allowNull: true,
        },
        latitude: {
            type: DataTypes.DECIMAL(10, 7), // Higher precision for latitude
            allowNull: true,
        },
    },
    {
        sequelize: db,
        modelName: 'ServiceOrders',
        tableName: 'service_orders',
        freezeTableName: true,
        timestamps: true,
    }
);

export default ServiceOrder;
