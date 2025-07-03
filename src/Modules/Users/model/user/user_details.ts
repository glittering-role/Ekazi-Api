import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../../config/db';
import {UserDetailsAttributes} from "../../../../types/interfaces/schema/interfaces.schema";

interface UserDetailsCreationAttributes extends Optional<UserDetailsAttributes, 'id'> {}

class UserDetails extends Model<UserDetailsAttributes, UserDetailsCreationAttributes> implements UserDetailsAttributes {
    public id!: string;
    public user_id!: string;
    public first_name!: string;
    public middle_name!: string | null;
    public last_name!: string;
    public gender!: string | null;
    public date_of_birth!: Date | null;
    public image!: string;
    public about_the_user!: string | null;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

UserDetails.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        middle_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        gender: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        date_of_birth: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        about_the_user: {
            type: DataTypes.TEXT,
            allowNull: true,
        }
    },
    {
        sequelize: db,
        modelName: 'user_details',
        freezeTableName: true,
        timestamps: true,
    }
);

export default UserDetails;
