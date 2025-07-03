// Define the custom response and error interfaces.
export interface ResponseData {
    [key: string]: unknown;
}

export interface Response {
    success: boolean;
    message: string;
    data: ResponseData;
}

export interface ApiError extends Error {
    statusCode?: number;
}


export interface UserDetailsAttributes {
    id: string;
    user_id: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    gender?: string | null;
    date_of_birth?: Date | null;
    image: string;
    about_the_user?: string | null;
}

export interface UserLocationAttributes {
    id: string;
    user_id:  string | null;
    country?: string | null;
    state?: string | null;
    state_name?: string | null;
    continent?: string | null;
    city?: string | null;
    zip?: string | null;
}

export interface IUser {
    id: string;
    email: string;
    phone_number?: string | null;
    username?: string | null;
    password: string;
    status?: string | null;
    authType?: string | null;
    isActive: boolean;
    isEmailVerified: boolean;
    deletedAt?: Date | null; 
}

export interface PasswordResetTokenAttributes {
    id: string;
    email: string;
    password_reset_token: string;
    expires_at: Date;
}

export interface EmailVerificationAttributes {
    id: string;
    email: string;
    registration_token: string;
    token_expires_at: Date;
}

export interface AccountToDeleteAttributes {
    id: string;
    user_id: string;
    deletion_date: Date;
}

export interface IUserRoles {
    id: string;
    user_id: string;
    role_id: string;
}

export interface IRole {
    id: string;
    role_name: string;
    role_status: boolean;
}

export interface JobAttributes {
  id: string;
  jobType: string;
  data: object;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retryCount: number;
  scheduledAt?: Date | null;
  executedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NotificationAttributes {
  id: string;
  user_id?: string | null; 
  notification_type: string;
  notification_content: string;
  is_read: boolean;
  createdAt?: Date; 
  updatedAt?: Date; 
}

export interface JobCategoryAttributes {
    id: string;
    job_category_name: string;
    image: string;
    isActive: boolean;
}

export interface JobSubCategoryAttributes {
    id: string;
    category_id: string;
    job_subcategory_name: string;
    job_subcategory_image:string;
    isActive: boolean;
}



export interface ExperienceLevelAttributes {
    id: string;
    level: string;
    description?:string | null;
    minimum_years: number;
    is_active: boolean;
}


