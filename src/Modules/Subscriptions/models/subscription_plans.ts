import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../config/db';

interface SubscriptionPlanAttributes {
    id: string;
    name: string;
    description?: string;
    price: number | null;
    billing_cycle: string;
    service_limit: number;
    features?: object;
    trial_period?: number;
    discount?: number;
    is_active: boolean;
    is_free: boolean;
    priority_support: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Define optional attributes for create() method
interface SubscriptionPlanCreationAttributes extends Optional<SubscriptionPlanAttributes, 'id'> {}

class SubscriptionPlan
    extends Model<SubscriptionPlanAttributes, SubscriptionPlanCreationAttributes>
    implements SubscriptionPlanAttributes {
    public id!: string;
    public name!: string;
    public description?: string;
    public price!: number | null;
    public billing_cycle!: string;
    public service_limit!: number;
    public features?: object;
    public trial_period?: number;
    public discount?: number;
    public is_active!: boolean;
    public is_free!: boolean;
    public priority_support!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

SubscriptionPlan.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        billing_cycle: {
            type: DataTypes.ENUM('monthly', 'yearly', 'weekly', 'daily'),
            allowNull: false,
        },
        service_limit: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        features: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        trial_period: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },
        discount: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
            defaultValue: 0.0,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        is_free: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        priority_support: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize,
        modelName: 'subscription_plans',
        tableName: 'subscription_plans',
        freezeTableName: true,
        timestamps: true,
    }
);

export default SubscriptionPlan;