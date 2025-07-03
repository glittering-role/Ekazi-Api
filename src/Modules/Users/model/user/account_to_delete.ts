import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../../config/db';
import {AccountToDeleteAttributes} from "../../../../types/interfaces/schema/interfaces.schema";

interface AccountToDeleteCreationAttributes extends Optional<AccountToDeleteAttributes, 'id'> {}

class AccountToDelete extends Model<AccountToDeleteAttributes, AccountToDeleteCreationAttributes> implements AccountToDeleteAttributes {
  public id!: string;
  public user_id!: string;
  public deletion_date!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AccountToDelete.init(
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
      deletion_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize: db,
      modelName: 'accounts_to_delete',
      freezeTableName: true,
      timestamps: true,
    }
);

export default AccountToDelete;
