/**
 * Donor Model
 * Domain model for donor entity
 */
import { Coordinates } from '../../core/utils/distanceCalculator';

export interface Donor {
  id: string;
  userId: string;
  name: string;
  bloodGroup: string;
  availability: 'Available' | 'Busy' | 'Unavailable';
  location: Coordinates | null; // Location can be null if not set
  lastDonationDate?: Date;
  profileImageUrl?: string;
  distance?: number; // Calculated distance from current user (in meters)
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Donor Filter Options
 * Options for filtering donors
 */
export interface DonorFilterOptions {
  bloodGroup?: string;
  maxDistance?: number; // in meters
  availability?: 'Available' | 'Busy' | 'Unavailable';
  sortBy?: 'distance' | 'name' | 'recent';
}

