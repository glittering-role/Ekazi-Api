import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../config/db';

// Interface for attributes
interface ServiceProviderAttributes {
    id: string;
    provider_id: string | null
    skill_description?: string | null;
    category_id?: string | null;
}

// Interface for creation attributes
interface ServiceProviderCreationAttributes
    extends Optional<ServiceProviderAttributes, 'id' | 'skill_description' | 'category_id' > {}

class ServiceProviderSkills
    extends Model<ServiceProviderAttributes, ServiceProviderCreationAttributes>
    implements ServiceProviderAttributes
{
    public id!: string;
    public provider_id!: string;
    public skill_description!: string | null;
    public category_id!: string | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

ServiceProviderSkills.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        provider_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        skill_description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        category_id : {
            type: DataTypes.UUID,
            allowNull: false,
        }
    },
    {
        sequelize: db,
        modelName: 'service_provider_skills',
        freezeTableName: true,
        timestamps: true,
    }
);

export default ServiceProviderSkills;
