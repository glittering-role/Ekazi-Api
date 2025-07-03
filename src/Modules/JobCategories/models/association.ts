import JobCategory  from "./jobCategory";
import JobSubCategory from "./jobSubCategory";

// JobCategory and JobSubCategory association
JobCategory.hasMany(JobSubCategory, { foreignKey: 'category_id', as: 'sub_categories', onDelete: 'CASCADE' });
JobSubCategory.belongsTo(JobCategory, { foreignKey: 'category_id', as: 'category', onDelete: 'CASCADE' });

export { JobCategory, JobSubCategory };
