import { Roles, UserRoles } from '../../model/associations';

export const assignUserRole = async (
    userId: string, 
    roleName: string, 
    transaction: any
): Promise<boolean> => {
    try {
        // Find the role without creating it (include the transaction)
        const role = await Roles.findOne({
            where: { role_name: roleName },
            transaction
        });

        if (!role) {
        
            return false;
        }

        // Create the user-role association (using the transaction)
        await UserRoles.create({
            user_id: userId,
            role_id: role.id,
        }, { transaction });

        return true;
    } catch (error) {
        console.error(`Error assigning role '${roleName}' to user '${userId}':`, error);
        return false;
    }
};
