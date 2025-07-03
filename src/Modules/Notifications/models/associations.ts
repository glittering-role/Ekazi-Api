import Users from "../../Users/model/user/user";
import Notification from "./notifications";

// User and Notification (One-to-Many)
Users.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications', onDelete: 'CASCADE', });
Notification.belongsTo(Users, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE', });

export { Notification };
