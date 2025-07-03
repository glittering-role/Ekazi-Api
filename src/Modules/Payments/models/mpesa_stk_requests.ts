import { DataTypes, Model, Optional } from 'sequelize';
import db from "../../../config/db";

interface MpesaStkRequestAttributes {
    id: string;
    phone: string | null;
    amount: number | null;
    reference: string | null;
    description: string | null;
    businessShortCode: string | null;
    checkoutRequestID: string | null;
    status: string | null;
    receiptNumber?: string | null;
    resultDesc?: string;
    transactionDate?: string | null;
}

interface MpesaStkRequestCreationAttributes extends Optional<MpesaStkRequestAttributes, 'id'> {}

class MpesaStkRequest extends Model<MpesaStkRequestAttributes, MpesaStkRequestCreationAttributes> implements MpesaStkRequestAttributes {
    public id!: string;
    public phone!: string;
    public amount!: number | null;
    public reference!: string;
    public description!: string;
    public businessShortCode!: string;
    public checkoutRequestID!: string | null;
    public status!: string;
    public receiptNumber?: string;
    public resultDesc?: string;
    public transactionDate?: string;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

MpesaStkRequest.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        reference: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        businessShortCode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        checkoutRequestID: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        receiptNumber: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        resultDesc: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        transactionDate: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize :db,
        modelName: 'Mpesa_stk_requests',
        tableName: 'mpesa_stk_requests',
        freezeTableName: true,
        timestamps: true,
    }
);

export default MpesaStkRequest;
