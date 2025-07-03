import Ratings from "./rating";
import ServiceProviders from "./service_provider";
import VerificationDocuments from "./verification_documents";
import { Users } from "../../Users/model/associations";
import ServiceImage from "./service_images";
import Service from "./services";
import { JobSubCategory } from "../../JobCategories/models/association";
import { MpesaStkRequest } from "../../Payments/models/associations";
import ServiceOrder from "./service_orders";

// Users & ServiceProviders
Users.hasOne(ServiceProviders, { foreignKey: 'user_id', as: 'serviceProvider' });
ServiceProviders.belongsTo(Users, { foreignKey: 'user_id', as: 'user' });

// Service & ServiceProviders Association
Service.belongsTo(ServiceProviders, { foreignKey: 'provider_id', as: 'provider' });
ServiceProviders.hasMany(Service, { foreignKey: 'provider_id', as: 'services' });

// Service & Ratings Association
Service.hasMany(Ratings, { foreignKey: 'service_id', as: 'serviceRatings' }); // Unique alias
Ratings.belongsTo(Service, { foreignKey: 'service_id', as: 'ratedService' }); // Unique alias

// Ratings & Users (User who rated)
Ratings.belongsTo(Users, { foreignKey: 'user_id', as: 'userWhoRated' }); // Unique alias
Users.hasMany(Ratings, { foreignKey: 'user_id', as: 'userRatings' }); // Unique alias

// VerificationDocuments & Users
VerificationDocuments.belongsTo(Users, { foreignKey: 'user_id', as: 'serviceProviderVerificationDocuments' });
Users.hasMany(VerificationDocuments, { foreignKey: 'user_id', as: 'verificationDocuments' });

// Service & ServiceImage
Service.hasMany(ServiceImage, { foreignKey: 'service_id', as: 'images', onDelete: 'CASCADE' });
ServiceImage.belongsTo(Service, { foreignKey: 'service_id', as: 'item', onDelete: 'CASCADE' });

// JobSubCategory & Services
JobSubCategory.hasMany(Service, { foreignKey: 'sub_category_id', as: 'services' });
Service.belongsTo(JobSubCategory, { foreignKey: 'sub_category_id', as: 'subcategory' });

// ServiceOrder & MpesaStkRequest
ServiceOrder.belongsTo(MpesaStkRequest, { foreignKey: 'mpesa_stk_request_id', as: 'mpesa_stk_request' });

// ServiceOrder & Users (Client)
ServiceOrder.belongsTo(Users, { foreignKey: 'client_user_id', as: 'client' });
Users.hasMany(ServiceOrder, { foreignKey: 'client_user_id', as: 'clientOrders' });

// ServiceOrder & Users (Provider)
ServiceOrder.belongsTo(Users, { foreignKey: 'provider_user_id', as: 'serviceProviderUser' });
Users.hasMany(ServiceOrder, { foreignKey: 'provider_user_id', as: 'providerServiceOrders' });

// ServiceOrder & Service
ServiceOrder.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });
Service.hasMany(ServiceOrder, { foreignKey: 'service_id', as: 'serviceOrders' });

// ServiceOrder & ServiceProvider
ServiceOrder.belongsTo(ServiceProviders, { foreignKey: 'provider_user_id', as: 'assignedProvider' });
ServiceProviders.hasMany(ServiceOrder, { foreignKey: 'provider_user_id', as: 'providerOrders' });

// Export models & associations
export {
    Service,
    ServiceProviders,
    Ratings,
    VerificationDocuments,
    ServiceOrder
};