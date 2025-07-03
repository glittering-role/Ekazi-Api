import { UserDetails } from'../model/associations';
import Roles from '../model/roles/role';

const reloadUserWithDetails = async (user : any) => {
    try {
        // Reload user with updated details and roles
        await user.reload({
            include: [
                {
                    model: UserDetails,
                    as: 'user_detail',
                    attributes: ['image'],
                },
                {
                    model: Roles,
                    as: 'Roles',
                    attributes: ['id', 'role_name'],
                    through: { attributes: [] }
                },
            ],
        });

        // Extract roles
        const roles = user.Roles ? user.Roles.map((role: { id: any; role_name: any; }) => ({
            id: role.id,
            role_name: role.role_name,
        })) : [];

        // Prepare the response data
        const dataForState = {
            username: user.username,
            image: user.user_detail.image,
            isEmailVerified: user.isEmailVerified,
            roles,
        };

        return dataForState;

    } catch (error : any) {
        throw new Error('Error reloading user with details and roles: ' + error.message);
    }
};

export default reloadUserWithDetails;