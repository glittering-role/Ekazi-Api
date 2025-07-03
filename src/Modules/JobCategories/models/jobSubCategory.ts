import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../config/db';
import {JobSubCategoryAttributes} from "../../../types/interfaces/schema/interfaces.schema";

interface JobSubCategoryCreationAttributes extends Optional<JobSubCategoryAttributes, 'id'> {}

class JobSubCategory extends Model<JobSubCategoryAttributes, JobSubCategoryCreationAttributes>
    implements JobSubCategoryAttributes {
    public id!: string;
    public category_id!: string;
    public job_subcategory_name!: string;
    public job_subcategory_image! :string;
    public isActive!: boolean;
}

JobSubCategory.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        category_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        job_subcategory_name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        job_subcategory_image: {
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
        modelName: 'job_subcategories',
        freezeTableName: true,
        timestamps: false,
    }
);

export default JobSubCategory;
