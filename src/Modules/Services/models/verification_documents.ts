import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../config/db';

// Define interface for the attributes
interface VerificationDocumentAttributes {
    id: string;
    user_id: string | null;
    national_id: string | null;
    selfie: string | null;
    first_name: string | null;
    middle_name: string | null;
    last_name: string | null;
    is_verified: boolean;
    verification_date: Date | null;

}

// Define optional fields for creation
interface VerificationDocumentCreationAttributes
    extends Optional<VerificationDocumentAttributes, 'id' > {}

class VerificationDocuments
    extends Model<VerificationDocumentAttributes, VerificationDocumentCreationAttributes>
    implements VerificationDocumentAttributes
{
    public id!: string;
    public user_id!: string;
    public national_id!: string;
    public first_name!: string;
    public middle_name!: string | null;
    public last_name!: string;
    public selfie!: string;
    public is_verified!: boolean;
    public verification_date!: Date | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// Initialize the model
VerificationDocuments.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        national_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        middle_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        selfie: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        is_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        verification_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },

    },
    {
        sequelize: db,
        modelName: 'verification_documents',
        freezeTableName: true,
        timestamps: true,
    }
);

export default VerificationDocuments;
