import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../../config/db';
import { IUser } from '../../../../types/interfaces/schema/interfaces.schema';

interface IUserCreationAttributes extends Optional<IUser, 'id'> {}

class Users extends Model<IUser, IUserCreationAttributes> implements IUser {
  [x: string]: any;
  id!: string;
  email!: string;
  phone_number?: string | null;
  username?: string | null;
  password!: string;
  status?: string | null;
  authType?: string | null;
  isActive!: boolean;
  isEmailVerified!: boolean;
  deletedAt?: Date | null; 

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Users.init(
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
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    authType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deletedAt: { 
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize: db,
    modelName: 'users',
    freezeTableName: true,
    timestamps: true,
    paranoid: true, // Enables soft delete
  }
);

export default Users;
