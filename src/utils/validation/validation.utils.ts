// validation.utils.ts
// Contains type definitions, error messages, and utility/helper functions

export interface UserInput {
    name: string;
    email: string;
    phone: string;
    password: string;
    current_password: string;
    new_password: string;
    date: string;
    username: string;
    idNumber: number;
    description: string;
    text: string;
    title: string;
    amount: number;
    status: string;
    address: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    about_the_user: string;
    country: string;
    state: string;
    state_name: string;
    continent: string;
    city: string;
    zip: string;
    role_name: string;
    emailOrPhone: string;
    token: string;
    rememberMe: boolean;
    job_category_name: string;
    job_subcategory_name: string;
    category_id: string;
    sub_category_id: string;
    provider_id: string;
    pricing_mode: string;
    price: number;
    location: string;
    postFor: string;
    user_id: string;
    national_id: string;
    full_government_names: string;
    selfie: string;
    verification_date: string;
    phone_number: string;
    business_location: string;
    work_description: string;
    availability: string;
    is_verified: boolean;
    is_occupied: boolean;
    is_online: boolean;
    rating: number;
    comment: string;
    service_provider_id: string;
    institution_name: string;
    certification_name: string;
    start_date: Date;
    end_date: Date;
    is_current: boolean;
    certification_document: string;
    skill_description: string;
    service_location_preference: string;
    notes: string;
    appointment_date: Date;
    service_id: string;
    billing_cycle: string;
    service_limit: number;
    features: string[];
    trial_period: number;
    discount: number;
    priority_support: boolean;
    auto_renew: boolean;
    plan_id: string;
    business_name: string;
    business_type: string;
    years_of_experience: number;
    points: number;
    purchase_type: string;
    price_from: number;
    price_to: number;
    longitude: number | null;
    latitude: number | null;
    budget:number;
    provider_user_id:string;
    deadline:Date;
    post_id:string;
    parent_comment_id:string;
}

// Reusable error messages
export const messages = {
    required: 'Field is required.',
    minLength: 'Field must be at least {{min}} characters long.',
    maxLength: 'Field cannot exceed {{max}} characters.',
    invalid: 'Field is invalid.',
    dateInvalid: 'Invalid date format.',
    ratingInvalid: 'Rating must be between 1 and 5.',
    modeInvalid: 'Mode must be one of "on-site", "remote", or "hybrid".',
    minimumYearsInvalid: 'Minimum years is required and must be a valid number.',
    isCurrentInvalid: 'Invalid current status.',
    greaterThanPriceFrom: 'Price to should be greater than price from',
};

// Utility function for phone number formatting and validation
export const formatPhoneNumber = (phoneNumber: string): string => {
    if (phoneNumber.startsWith('07')) {
        return '254' + phoneNumber.slice(1);
    }
    return phoneNumber;
};

// Function to check if the user is over 18
export const isOver18 = (dob: string): boolean => {
    const today = new Date();
    const birthDate = new Date(dob);
    const age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    return month < 0 || (month === 0 && today.getDate() < birthDate.getDate())
        ? age - 1 >= 18
        : age >= 18;
};

// Custom validation functions
export const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? null : 'Invalid email format';

export const validatePhoneNumber = (phone: string) =>
    /^254[7-8]\d{8}$/.test(phone) ? null : 'Invalid phone number format';

export const validateEmailOrPhone = (value: string) => {
    if (value.includes('@')) return validateEmail(value);
    return validatePhoneNumber(value);
};
