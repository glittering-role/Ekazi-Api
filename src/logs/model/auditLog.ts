import {DataTypes} from 'sequelize';
import db from '../../config/db';

export const AuditLog = db.define(
  'audit_Log',
  {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  modelName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
    meta: {
      type: DataTypes.JSON,
      allowNull: true,
    }
}, {
    freezeTableName: true,
    timestamps: true,
});

