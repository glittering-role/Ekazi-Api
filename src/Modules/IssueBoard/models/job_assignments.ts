import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../config/db';


// Define the attributes for the JobAssignment model
interface JobAssignmentAttributes {
    id: string;
    post_id: string;
    bid_id: string;
    provider_user_id: number;
    assigned_at: Date;
    completed_at: Date | null;
    status: string;

    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

// Define the attributes required for creating a new JobAssignment
interface JobAssignmentCreationAttributes extends Optional<JobAssignmentAttributes, 'id' | 'assigned_at'> {}

// Define the JobAssignment model class
class JobAssignment extends Model<JobAssignmentAttributes, JobAssignmentCreationAttributes> implements JobAssignmentAttributes {
    public id!: string;
    public post_id!: string;
    public bid_id!: string;
    public provider_user_id!: number;
    public assigned_at!: Date;
    public completed_at!: Date | null;
    public status!: string;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date | null;
}

// Initialize the JobAssignment model
JobAssignment.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        post_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        bid_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        provider_user_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING(50),
            defaultValue: 'assigned',
            allowNull: false,
        },
        assigned_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        completed_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize: db,
        tableName: 'service_job_assignments',
        timestamps: true,
        underscored: true,
    }
);


export default JobAssignment;