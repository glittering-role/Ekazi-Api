import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../config/db';

interface SubscriptionAttributes {
    id: string;
    user_id:  string | null | undefined;
    plan_id: string;
    start_date: Date | null;
    end_date: Date | null;
    status: 'in_progress' | 'active' | 'expired' | 'canceled' | 'failed';
    auto_renew: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Define optional attributes for create() method
interface SubscriptionCreationAttributes extends Optional<SubscriptionAttributes, 'id'> {}

class Subscription extends Model<SubscriptionAttributes, SubscriptionCreationAttributes>
    implements SubscriptionAttributes {
    public id!: string;
    public user_id!: string | null | undefined;
    public plan_id!: string;
    public start_date!: Date | null;
    public end_date!: Date | null;
    public status!: 'in_progress' | 'active' | 'expired' | 'canceled' | 'failed';
    public auto_renew!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    subscriptionPlan: any;
}

Subscription.init(
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
        plan_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('in_progress', 'active', 'expired', 'canceled' , 'failed'),
            allowNull: false,
        },
        auto_renew: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize,
        modelName: 'Subscription',
        tableName: 'subscriptions',
        freezeTableName: true,
        timestamps: true,
    }
);

export default Subscription;
