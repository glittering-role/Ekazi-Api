// user.validation.ts
// Contains the Joi schema and the validateInput function for user input

import Joi, { ObjectSchema } from "joi";
import { UserInput, messages, formatPhoneNumber, isOver18, validateEmailOrPhone } from "./validation.utils";

// Define the Joi schema for validating UserInput
const userSchema: ObjectSchema<UserInput> = Joi.object({
    name: Joi.string().min(3).optional().messages({ 'string.min': messages.minLength }),
    notes: Joi.string().min(1).optional().messages({ 'string.min': messages.minLength }),
    token: Joi.string().min(1).optional().messages({ 'string.min': messages.minLength }),
    role_name: Joi.string().optional().messages({ 'any.optional': messages.required }),
    email: Joi.string().email().optional().messages({ 'string.email': messages.invalid }),
    phone: Joi.string().custom((value, helpers) => {
        const formattedPhoneNumber = formatPhoneNumber(value);
        const error = Joi.string().pattern(/^[a-zA-Z0-9._-]*$/).validate(formattedPhoneNumber).error;
        if (error) return helpers.error('any.invalid');
        return formattedPhoneNumber;
    }).optional().messages({ 'string.pattern.base': messages.invalid }),
    emailOrPhone: Joi.string().custom((value, helpers) => {
        const validationResult = validateEmailOrPhone(value);
        if (validationResult) return helpers.error('any.invalid', { message: validationResult });
        return value;
    }).optional().messages({ 'string.email': messages.invalid }),
    password: Joi.string().min(8).optional().messages({ 'string.min': messages.minLength }),
    current_password: Joi.string().min(8).optional().messages({ 'string.min': messages.minLength }),
    new_password: Joi.string().min(8).when('current_password', { is: Joi.exist(), then: Joi.optional() }),
    date: Joi.date().iso().messages({ 'date.base': messages.invalid }),
    username: Joi.string().min(6).pattern(/^[a-zA-Z0-9._-]+$/).optional().messages({ 'string.min': messages.minLength }),
    idNumber: Joi.number().optional().messages({ 'number.base': messages.invalid }),
    description: Joi.string().min(10).max(200).optional().messages({
        'string.min': messages.minLength,
        'string.max': messages.maxLength,
    }),
    text: Joi.string().min(1).optional().messages({ 'string.min': messages.minLength }),
    title: Joi.string().min(5).optional().messages({ 'string.min': messages.minLength }),
    amount: Joi.number().min(0).optional().messages({ 'number.base': messages.invalid }),
    status: Joi.string().valid('active', 'inactive', 'pending').optional().messages({
        'any.only': 'Status must be active, inactive, or pending',
    }),
    address: Joi.string().min(10).optional().messages({ 'string.min': messages.minLength }),
    first_name: Joi.string().min(2).optional().messages({ 'string.min': messages.minLength }),
    middle_name: Joi.string().min(2).optional().messages({ 'string.min': messages.minLength }),
    last_name: Joi.string().min(2).optional().messages({ 'string.min': messages.minLength }),
    date_of_birth: Joi.date().iso().optional().custom((value, helpers) => {
        if (!isOver18(value)) return helpers.error('any.invalid');
        if (new Date(value) > new Date()) return helpers.error('any.invalid');
        return value;
    }).messages({ 'date.base': messages.invalid }),
    appointment_date: Joi.date().iso().optional().messages({ 'date.base': messages.invalid }),
    gender: Joi.string().valid('male', 'female', 'other').optional().messages({
        'any.only': 'Gender must be male, female, or other',
    }),
    about_the_user: Joi.string().min(10).max(300).optional().messages({
        'string.min': messages.minLength,
        'string.max': messages.maxLength,
    }),
    country: Joi.string().min(2).optional().messages({ 'string.min': messages.minLength }),
    state: Joi.string().min(2).optional().messages({ 'string.min': messages.minLength }),
    state_name: Joi.string().min(2).optional().messages({ 'string.min': messages.minLength }),
    continent: Joi.string().min(2).optional().messages({ 'string.min': messages.minLength }),
    city: Joi.string().min(2).optional().messages({ 'string.min': messages.minLength }),
    zip: Joi.string().pattern(/^[0-9]{5}$/).optional().messages({ 'string.pattern.base': messages.invalid }),
    rememberMe: Joi.boolean().optional().messages({ 'boolean.base': messages.invalid }),
    job_category_name: Joi.string().min(3).optional().messages({ 'string.min': messages.minLength }),
    job_subcategory_name: Joi.string().min(3).optional().messages({ 'string.min': messages.minLength }),
    category_id: Joi.string().guid({ version: 'uuidv4' }).optional().messages({ 'string.guid': 'Category ID must be a valid UUID' }),
    user_id: Joi.string().uuid().optional().messages({ 'string.uuid': messages.invalid }),
    national_id: Joi.string().min(5).max(20).optional().messages({
        'string.min': messages.minLength.replace('{{min}}', '5'),
        'string.max': messages.maxLength.replace('{{max}}', '20'),
    }),
    full_government_names: Joi.string().min(3).max(100).optional().messages({
        'string.min': messages.minLength.replace('{{min}}', '3'),
        'string.max': messages.maxLength.replace('{{max}}', '100'),
    }),
    selfie: Joi.string().uri().optional().messages({ 'string.uri': messages.invalid }),
    verification_date: Joi.date().optional().messages({ 'date.base': messages.dateInvalid }),
    phone_number: Joi.string().optional().messages({ 'string.base': messages.invalid }),
    business_name: Joi.string().min(2).optional().messages({ 'string.min': messages.minLength }),
    business_type: Joi.string().min(2).optional().messages({ 'string.min': messages.minLength }),
    years_of_experience: Joi.number().min(0).optional().messages({ 'number.base': messages.invalid }),
    business_location: Joi.string().optional().messages({ 'string.base': messages.invalid }),
    availability: Joi.string().optional().messages({ 'string.base': messages.invalid }),
    is_verified: Joi.boolean().optional().messages({ 'boolean.base': messages.invalid }),
    is_occupied: Joi.boolean().optional().messages({ 'boolean.base': messages.invalid }),
    is_online: Joi.boolean().optional().messages({ 'boolean.base': messages.invalid }),
    rating: Joi.number().min(1).max(5).optional().messages({ 'number.base': messages.ratingInvalid }),
    comment: Joi.string().optional().messages({ 'string.base': messages.invalid }),
    service_location_preference: Joi.string().valid('on-site', 'remote', 'hybrid').optional().messages({ 'any.only': messages.modeInvalid }),
    sub_category_id: Joi.string().uuid().optional().messages({ 'string.guid': 'Sub Category ID must be a valid UUID' }),
    provider_id: Joi.string().uuid().optional().messages({ 'string.guid': 'Provider ID must be a valid UUID' }),
    pricing_mode: Joi.string().valid('fixed', 'hourly').optional().messages({
        'any.only': 'Pricing mode must be either "fixed" or "hourly".'
    }),
    price: Joi.number().min(0).optional().messages({ 'number.min': 'Price must be a positive number.' }),
    location: Joi.string().min(2).optional().messages({ 'string.min': 'Location must be at least 2 characters long.' }),
    postFor: Joi.string().valid('private', 'public').optional().messages({
        'any.only': 'PostFor must be public or private'
    }),
    service_id: Joi.string().guid({ version: 'uuidv4' }).optional().messages({ 'string.guid': 'Service ID must be a valid UUID' }),
    provider_user_id: Joi.string().guid({ version: 'uuidv4' }).optional().messages({ 'string.guid': 'Provider ID must be a valid UUID' }),
    billing_cycle: Joi.string().valid('monthly', 'yearly').optional().messages({ 'any.only': 'Billing cycle must be either "monthly" or "yearly".' }),
    service_limit: Joi.number().min(1).optional().messages({
        'number.base': 'Service limit must be a positive number.',
        'number.min': 'Service limit must be at least 1.',
    }),
    features: Joi.array().items(Joi.string()).optional().messages({ 'array.base': 'Features must be an array of strings.' }),
    trial_period: Joi.number().min(0).optional().messages({
        'number.base': 'Trial period must be a positive number.',
        'number.min': 'Trial period cannot be less than 0.',
    }),
    discount: Joi.number().min(0).max(100).optional().messages({
        'number.base': 'Discount must be a percentage between 0 and 100.',
        'number.min': 'Discount cannot be less than 0.',
        'number.max': 'Discount cannot be greater than 100.',
    }),
    priority_support: Joi.boolean().optional().messages({ 'boolean.base': 'Priority support must be a boolean.' }),
    auto_renew: Joi.boolean().optional().messages({ 'boolean.base': 'Auto renew must be a boolean.' }),
    plan_id: Joi.string().guid({ version: 'uuidv4' }).optional().messages({ 'string.guid': 'Plan ID must be a valid UUID' }),
    longitude: Joi.number().allow(null).optional().messages({ 'number.base': messages.invalid }),
    latitude: Joi.number().allow(null).optional().messages({ 'number.base': messages.invalid }),
    points: Joi.number().allow(null).optional().messages({ 'number.base': messages.invalid }),
    budget:Joi.number().allow(null).optional().messages({ 'number.base': messages.invalid }),
    purchase_type: Joi.string().valid('monthly', 'yearly', 'weekly', 'daily').optional().messages({ 'any.only': 'Billing cycle must be either "monthly" or "yearly".' }),
    price_from: Joi.number().allow(null).optional().messages({ 'number.base': messages.invalid }),
    price_to: Joi.number().allow(null).optional().custom((value, helpers) => {
        const { price_from } = helpers.state.ancestors[0];
        if (value !== null && price_from !== null && value < price_from) {
            return helpers.error('any.invalid', { message: messages.greaterThanPriceFrom });
        }
        return value;
    }).messages({ 'number.base': messages.invalid }),
    deadline:Joi.date().iso().optional().messages({ 'date.base': messages.invalid }),
    post_id: Joi.string().guid({ version: 'uuidv4' }).optional().messages({ 'string.guid': 'Post ID must be a valid UUID' }),
    parent_comment_id: Joi.string()
        .guid({ version: 'uuidv4' })
        .allow(null , "") // Allow null values
        .optional() // Allow the field to be omitted
        .messages({ 'string.guid': 'Parent Comment ID must be a valid UUID' }),});

// Function to validate the input data
const validateInput = (input: unknown, showAllErrors: boolean = false): { value?: UserInput; errors?: string[] } => {
    const { error, value } = userSchema.validate(input, { abortEarly: !showAllErrors });
    if (error) {
        return {
            errors: showAllErrors
                ? error.details.map((detail) => detail.message)
                : [error.details[0].message],
        };
    }
    return { value };
};

export { validateInput };
