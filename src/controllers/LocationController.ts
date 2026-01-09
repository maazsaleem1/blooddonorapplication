/**
 * Location Controller
 * Handles ALL location-related business logic
 * NO UI - Pure business logic controller
 */
import { create } from 'zustand';
import { LocationService } from '../data/services/locationService';
import { Coordinates, calculateDistance } from '../core/utils/distanceCalculator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConstants } from '../core/constants/appConstants';
import * as Location from 'expo-location';

interface LocationState {
  currentLocation: Coordinates | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
}

interface LocationActions {
  // Actions
  getCurrentLocation: () => Promise<Coordinates>;
  requestPermissions: () => Promise<boolean>;
  saveLocation: (location: Coordinates) => Promise<void>;
  getSavedLocation: () => Promise<Coordinates | null>;
  watchLocation: (callback: (location: Coordinates) => void) => Promise<void>;
  stopWatching: () => void;
  clearError: () => void;
}

type LocationController = LocationState & LocationActions;

let locationSubscription: Location.LocationSubscription | null = null;

/**
 * Location Controller Store
 * Manages location state and business logic
 */
export const useLocationController = create<LocationController>((set, get) => ({
  // Initial State
  currentLocation: null,
  isLoading: false,
  error: null,
  hasPermission: false,

  // Get current location
  getCurrentLocation: async () => {
    set({ isLoading: true, error: null });

    try {
      const location = await LocationService.getCurrentLocation();
      set({
        currentLocation: location,
        isLoading: false,
        hasPermission: true,
      });

      // Save location to storage
      await get().saveLocation(location);

      return location;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to get location',
        isLoading: false,
      });
      throw error;
    }
  },

  // Request location permissions
  requestPermissions: async () => {
    try {
      const granted = await LocationService.requestPermissions();
      set({ hasPermission: granted });
      return granted;
    } catch (error: any) {
      set({ error: error.message || 'Failed to request permissions' });
      return false;
    }
  },

  // Save location to storage
  saveLocation: async (location: Coordinates) => {
    try {
      const locationData = JSON.stringify(location);
      await AsyncStorage.setItem(
        AppConstants.STORAGE_KEYS.USER_LOCATION,
        locationData
      );
    } catch (error: any) {
      console.error('Failed to save location:', error);
    }
  },

  // Get saved location from storage
  getSavedLocation: async () => {
    try {
      const locationData = await AsyncStorage.getItem(
        AppConstants.STORAGE_KEYS.USER_LOCATION
      );
      if (locationData) {
        return JSON.parse(locationData) as Coordinates;
      }
      return null;
    } catch (error: any) {
      return null;
    }
  },

  // Watch location changes
  watchLocation: async (callback: (location: Coordinates) => void) => {
    try {
      // Stop existing subscription if any
      if (locationSubscription) {
        LocationService.stopWatching(locationSubscription);
      }

      const subscription = await LocationService.watchPosition((location) => {
        set({ currentLocation: location });
        callback(location);
      });

      locationSubscription = subscription;
    } catch (error: any) {
      set({ error: error.message || 'Failed to watch location' });
      throw error;
    }
  },

  // Stop watching location
  stopWatching: () => {
    if (locationSubscription) {
      LocationService.stopWatching(locationSubscription);
      locationSubscription = null;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

