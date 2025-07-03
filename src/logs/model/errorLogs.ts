import {DataTypes} from 'sequelize';
import db from '../../config/db';

export const ErrorLog = db.define(
    'error_logs',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        level: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        message: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: true,

        }
    }, {
        freezeTableName: true,
        timestamps: true,
    });
