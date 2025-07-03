import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../../config/db';
import {EmailVerificationAttributes} from "../../../../types/interfaces/schema/interfaces.schema";

interface EmailVerificationCreationAttributes extends Optional<EmailVerificationAttributes, 'id'> {}

class EmailVerification extends Model<EmailVerificationAttributes, EmailVerificationCreationAttributes> implements EmailVerificationAttributes {
  public id!: string;
  public email!: string;
  public registration_token!: string;
  public token_expires_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

EmailVerification.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      registration_token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      token_expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize: db, // Your sequelize instance
      modelName: 'email_verification',
      freezeTableName: true,
      timestamps: true,
    }
);

export default EmailVerification;
