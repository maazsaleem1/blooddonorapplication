/**
 * User Model
 * Domain model for user entity
 */
// import { Coordinates } from '../utils/distanceCalculator';

export interface User {
    id: string;
    email: string;
    name: string;
    phone: string;
    bloodGroup: string;
    gender: 'Male' | 'Female' | 'Other';
    age: number;
    profileImageUrl?: string;
    // location?: Coordinates; // User's current location
    availability?: 'Available' | 'Busy' | 'Unavailable'; // Donor availability
    lastDonationDate?: Date; // Last blood donation date
    createdAt: Date;
    updatedAt: Date;
}

/**
 * User Registration Data
 * Data required for user registration
 */
export interface UserRegistrationData {
    email: string;
    password: string;
    name: string;
    phone: string;
    bloodGroup: string;
    gender: 'Male' | 'Female' | 'Other';
    age: number;
}

/**
 * User Login Data
 * Data required for user login
 */
export interface UserLoginData {
    email: string;
    password: string;
}

