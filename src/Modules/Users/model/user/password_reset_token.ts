import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../../config/db';
import {PasswordResetTokenAttributes} from "../../../../types/interfaces/schema/interfaces.schema";

interface PasswordResetTokenCreationAttributes extends Optional<PasswordResetTokenAttributes, 'id'> {}

class PasswordResetToken extends Model<PasswordResetTokenAttributes, PasswordResetTokenCreationAttributes> implements PasswordResetTokenAttributes {
    public id!: string;
    public email!: string;
    public password_reset_token!: string;
    public expires_at!: Date;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

PasswordResetToken.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password_reset_token: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
        }
    },
    {
        sequelize: db,
        modelName: 'password_reset_token',
        freezeTableName: true,
        timestamps: true,
    }
);

export default PasswordResetToken;
