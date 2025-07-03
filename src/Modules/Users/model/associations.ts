import Users from './user/user';
import UserDetails from './user/user_details';
import AccountToDelete from './user/account_to_delete';
import Roles from './roles/role';
import EmailVerification from './user/email_verification';
import PasswordResetToken from './user/password_reset_token';
import UserRoles from "./roles/user_roles";
import UserLocation from "./user/user_location";

// Define associations
Users.hasOne(UserDetails, { foreignKey: 'user_id', onDelete: 'CASCADE' });
UserDetails.belongsTo(Users, { foreignKey: 'user_id' });

Users.hasOne(UserLocation, { foreignKey: 'user_id', onDelete: 'CASCADE' });
UserLocation.belongsTo(Users, { foreignKey: 'user_id' });

Users.hasOne(AccountToDelete, { foreignKey: 'user_id', onDelete: 'CASCADE' });
AccountToDelete.belongsTo(Users, { foreignKey: 'user_id' });

Users.belongsToMany(Roles, { through: UserRoles, foreignKey: 'user_id', onDelete: 'CASCADE', as: 'Roles' });
Roles.belongsToMany(Users, { through: UserRoles, foreignKey: 'role_id', onDelete: 'CASCADE', as: 'Users' });

// Define associations between UserRoles and Roles
UserRoles.belongsTo(Roles, { foreignKey: 'role_id', as: 'Role' });
Roles.hasMany(UserRoles, { foreignKey: 'role_id', as: 'UserRoles' });

export {
  Users,
  UserDetails,
  AccountToDelete,
  Roles,
  UserRoles,
  EmailVerification,
  PasswordResetToken,
  UserLocation
};
