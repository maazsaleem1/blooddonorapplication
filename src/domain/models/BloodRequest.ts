/**
 * Blood Request Model
 * Domain model for blood request entity
 */
import { Coordinates } from '../../core/utils/distanceCalculator';

export interface BloodRequest {
    id: string;
    requesterId: string;
    requesterName: string;
    bloodGroup: string;
    urgency: 'Low' | 'Medium' | 'Emergency';
    hospital: string;
    location: Coordinates;
    notes?: string;
    status: 'Pending' | 'Accepted' | 'Completed' | 'Cancelled';
    acceptedBy?: string; // Donor ID who accepted
    sentTo?: string; // Donor ID to whom request was sent (for specific requests)
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Blood Request Creation Data
 * Data required to create a blood request
 */
export interface BloodRequestData {
    bloodGroup: string;
    urgency: 'Low' | 'Medium' | 'Emergency';
    hospital: string;
    location: Coordinates;
    notes?: string;
}

