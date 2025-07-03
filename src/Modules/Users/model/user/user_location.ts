import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../../config/db';
import {UserLocationAttributes} from "../../../../types/interfaces/schema/interfaces.schema";

interface UserLocationCreationAttributes extends Optional<UserLocationAttributes, 'id'> {}

class UserLocation extends Model<UserLocationAttributes, UserLocationCreationAttributes> implements UserLocationAttributes {
    public id!: string;
    public user_id!: string | null;
    public country!: string | null;
    public state!: string | null;
    public state_name!: string | null;
    public continent!: string | null;
    public city!: string | null;
    public zip!: string | null;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

UserLocation.init(
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
        country: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        state: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        state_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        continent: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        zip: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize: db,
        modelName: 'user_location',
        freezeTableName: true,
        timestamps: true,
    }
);

export default UserLocation;
