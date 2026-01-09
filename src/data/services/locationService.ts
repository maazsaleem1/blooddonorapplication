/**
 * Location Service
 * Handles location operations using Expo Location
 * NO UI logic - Pure service layer
 */
import * as Location from 'expo-location';
import { Coordinates } from '../../core/utils/distanceCalculator';

export class LocationService {
  /**
   * Request location permissions
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error: any) {
      throw new Error(`Failed to request location permissions: ${error.message}`);
    }
  }

  /**
   * Check if location permissions are granted
   */
  static async checkPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Get current location
   */
  static async getCurrentLocation(): Promise<Coordinates> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error('Location permissions not granted');
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error: any) {
      throw new Error(`Failed to get current location: ${error.message}`);
    }
  }

  /**
   * Watch position changes
   */
  static async watchPosition(
    callback: (location: Coordinates) => void
  ): Promise<Location.LocationSubscription> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error('Location permissions not granted');
        }
      }

      return await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          callback({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );
    } catch (error: any) {
      throw new Error(`Failed to watch position: ${error.message}`);
    }
  }

  /**
   * Stop watching position
   */
  static stopWatching(subscription: Location.LocationSubscription): void {
    subscription.remove();
  }
}

