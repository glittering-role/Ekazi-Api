import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../../config/db';
import {IUserRoles} from "../../../../types/interfaces/schema/interfaces.schema";

interface IUserRolesCreationAttributes extends Optional<IUserRoles, 'id'> {}

class UserRoles extends Model<IUserRoles, IUserRolesCreationAttributes> implements IUserRoles {
    id!: string;
    user_id!: string;
    role_id!: string;
}

// Initialize the `UserRoles` model
UserRoles.init(
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
        role_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        sequelize: db,
        modelName: 'user_roles',
        freezeTableName: true,
        timestamps: true,
    }
);

export default UserRoles;
