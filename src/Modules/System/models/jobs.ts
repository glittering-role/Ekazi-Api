import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../config/db';
import { JobAttributes } from '../../../types/interfaces/schema/interfaces.schema';

// Define optional attributes for creation
interface JobCreationAttributes extends Optional<JobAttributes, 'id' | 'scheduledAt' | 'executedAt'> {}

// Extend Sequelize's Model class
class Jobs extends Model<JobAttributes, JobCreationAttributes> implements JobAttributes {
  public id!: string;
  public jobType!: string;
  public data!: object;
  public status!: 'pending' | 'processing' | 'completed' | 'failed';
  public retryCount!: number;
  public scheduledAt!: Date | null;
  public executedAt!: Date | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the Jobs model
Jobs.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    jobType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
      allowNull: false,
      validate: {
        isIn: [['pending', 'processing', 'completed', 'failed']],
      },
    },
    retryCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    executedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    modelName: 'jobs',
    freezeTableName: true,
    timestamps: true,
  }
);

export default Jobs;
