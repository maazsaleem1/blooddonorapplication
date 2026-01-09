/**
 * Distance Calculator Utility
 * Calculates distance between two coordinates using Haversine formula
 * NO UI logic - Pure calculation utility
 */

export interface Coordinates {
    latitude: number;
    longitude: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param coord1 First coordinate (latitude, longitude)
 * @param coord2 Second coordinate (latitude, longitude)
 * @returns Distance in meters
 */
export const calculateDistance = (
    coord1: Coordinates,
    coord2: Coordinates
): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = toRadians(coord2.latitude - coord1.latitude);
    const dLon = toRadians(coord2.longitude - coord1.longitude);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(coord1.latitude)) *
        Math.cos(toRadians(coord2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance); // Return in meters, rounded
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
};

/**
 * Format distance for display
 * @param distanceInMeters Distance in meters
 * @returns Formatted string (e.g., "500m" or "1.5km")
 */
export const formatDistance = (distanceInMeters: number): string => {
    if (distanceInMeters < 1000) {
        return `${distanceInMeters}m`;
    }
    const km = (distanceInMeters / 1000).toFixed(1);
    return `${km}km`;
};

