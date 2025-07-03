import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../../config/db';
import {IRole} from "../../../../types/interfaces/schema/interfaces.schema";

interface IRoleCreationAttributes extends Optional<IRole, 'id'> {}

class Roles extends Model<IRole, IRoleCreationAttributes> implements IRole {
    id!: string;
    role_name!: string;
    role_status!: boolean;
}

// Initialize the `Roles` model
Roles.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        role_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role_status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
    },
    {
        sequelize: db,
        modelName: 'roles',
        freezeTableName: true,
        timestamps: true,
    }
);

export default Roles;
