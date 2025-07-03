import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../config/db';
import { NotificationAttributes } from 'src/types/interfaces/schema/interfaces.schema';

// Define optional attributes for creation
type NotificationCreationAttributes = Optional<NotificationAttributes, 'id' | 'is_read'>;

// Extend the Sequelize Model with the attributes
class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes {
  public id!: string;
  public user_id!: string | null;
  public notification_type!: string;
  public notification_content!: string;
  public is_read!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the model
Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    notification_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    notification_content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize: db, 
    tableName: 'notifications', 
    freezeTableName: true, 
    timestamps: true, 
  }
);

export default Notification;
