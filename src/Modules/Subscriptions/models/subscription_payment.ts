import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../config/db';

interface SubscriptionPaymentAttributes {
    id: string;
    subscription_id: string;
    user_id: string | null;
    phone: string;
    amount: number | null;
    payment_date: Date;
    payment_method: string;
    status: 'pending' | 'completed' | 'failed';
    transaction_id: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Define optional attributes for create() method
interface SubscriptionPaymentCreationAttributes extends Optional<SubscriptionPaymentAttributes, 'id'> {}

class SubscriptionPayment
    extends Model<SubscriptionPaymentAttributes, SubscriptionPaymentCreationAttributes>
    implements SubscriptionPaymentAttributes {
    public id!: string;
    public subscription_id!: string;
    public user_id!: string | null;
    public phone!: string;
    public amount!: number | null;
    public payment_date!: Date;
    public payment_method!: string;
    public status!: 'pending' | 'completed' | 'failed';
    public transaction_id!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

SubscriptionPayment.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        subscription_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        payment_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        payment_method: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('pending', 'completed', 'failed'),
            allowNull: false,
        },
        transaction_id: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'SubscriptionPayment',
        tableName: 'subscription_payments',
        freezeTableName: true,
        timestamps: true,
    }
);

export default SubscriptionPayment;
