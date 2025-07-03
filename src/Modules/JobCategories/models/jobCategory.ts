import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../config/db';
import {JobCategoryAttributes} from 'src/types/interfaces/schema/interfaces.schema';

// Optional attributes for the JobCategory creation
interface JobCategoryCreationAttributes extends Optional<JobCategoryAttributes, 'id'> {}

class JobCategory extends Model<JobCategoryAttributes, JobCategoryCreationAttributes>
    implements JobCategoryAttributes {
    public id!: string;
    public job_category_name!: string;
    public image!: string;
    public isActive!: boolean;
}

JobCategory.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        job_category_name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize: db,
        modelName: 'job_categories',
        freezeTableName: true,
        timestamps: false,
    }
);

export default JobCategory;
