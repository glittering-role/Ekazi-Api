import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../config/db';

interface RatingsAttributes {
    id: string;
    service_id: string;
    user_id: string;
    rating: number;
    comment?: string | null;
}

interface RatingsCreationAttributes
    extends Optional<RatingsAttributes, 'id' | 'comment'> {}

class Ratings
    extends Model<RatingsAttributes, RatingsCreationAttributes>
    implements RatingsAttributes
{
    public id!: string;
    public service_id!: string;
    public user_id!: string;
    public rating!: number;
    public comment!: string | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Ratings.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        service_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5,
            },
        },
        comment: {
            type: DataTypes.STRING(350),
            allowNull: true,
        }
    },
    {
        sequelize: db,
        tableName: 'ratings',
        freezeTableName: true,
        timestamps: true,
    }
);

export default Ratings;