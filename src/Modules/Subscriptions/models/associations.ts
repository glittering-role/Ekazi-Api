// Subscription <-> Users
import Users from "../../Users/model/user/user";
import Subscription from "./subscriptions";
import SubscriptionPayment from "./subscription_payment";
import SubscriptionPlan from "./subscription_plans";

Subscription.belongsTo(Users, { foreignKey: 'user_id', as: 'user' });
Users.hasMany(Subscription, { foreignKey: 'user_id', as: 'subscriptions' });

// Subscription <-> SubscriptionPlans
Subscription.belongsTo(SubscriptionPlan, { foreignKey: 'plan_id', as: 'subscriptionPlan' });
SubscriptionPlan.hasMany(Subscription, { foreignKey: 'plan_id', as: 'subscriptions' });

// SubscriptionPayment <-> Subscription
SubscriptionPayment.belongsTo(Subscription, { foreignKey: 'subscription_id', as: 'subscription' });
Subscription.hasMany(SubscriptionPayment, { foreignKey: 'subscription_id', as: 'payments' });

// SubscriptionPayment <-> Users
SubscriptionPayment.belongsTo(Users, { foreignKey: 'user_id', as: 'user' });
Users.hasMany(SubscriptionPayment, { foreignKey: 'user_id', as: 'payments' });

export {
    SubscriptionPlan,
    Subscription,
    SubscriptionPayment,
};