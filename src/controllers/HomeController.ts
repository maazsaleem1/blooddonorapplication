/**
 * Home Controller
 * Handles ALL home screen business logic (donors, filters, distance calculations)
 * NO UI - Pure business logic controller
 */
import { create } from 'zustand';
import { FirestoreService } from '../data/firebase/firestoreService';
import { AuthService } from '../data/firebase/authService';
import { Donor, DonorFilterOptions } from '../domain/models/Donor';
import { calculateDistance, Coordinates } from '../core/utils/distanceCalculator';
import { AppConstants } from '../core/constants/appConstants';

interface HomeState {
  donors: Donor[];
  filteredDonors: Donor[];
  isLoading: boolean;
  error: string | null;
  selectedBloodGroup: string | null;
  selectedDistance: number;
  currentUserLocation: Coordinates | null;
}

interface HomeActions {
  // Actions
  fetchDonors: () => Promise<void>;
  filterDonors: (options: DonorFilterOptions) => void;
  setSelectedBloodGroup: (bloodGroup: string | null) => void;
  setSelectedDistance: (distance: number) => void;
  setCurrentUserLocation: (location: Coordinates) => void;
  calculateAndSortByDistance: () => void;
  subscribeToDonors: () => () => void;
  clearError: () => void;
}

type HomeController = HomeState & HomeActions;

/**
 * Home Controller Store
 * Manages home screen state and business logic
 */
export const useHomeController = create<HomeController>((set, get) => ({
  // Initial State
  donors: [],
  filteredDonors: [],
  isLoading: false,
  error: null,
  selectedBloodGroup: null,
  selectedDistance: AppConstants.DISTANCE_5KM,
  currentUserLocation: null,

  // Fetch all donors
  fetchDonors: async () => {
    set({ isLoading: true, error: null });

    try {
      // Get current user ID to exclude from donors list
      const currentUserId = await AuthService.getCurrentUserId();
      console.log('🔍 [HomeController] Current user ID:', currentUserId);

      const donors = await FirestoreService.getDonors();
      console.log('🔍 [HomeController] Total donors fetched:', donors.length);

      // Filter out current user from donors list
      let donorsExcludingCurrentUser = currentUserId
        ? donors.filter((donor) => donor.id !== currentUserId)
        : donors;

      console.log('🔍 [HomeController] Donors after filtering current user:', donorsExcludingCurrentUser.length);

      // Show all donors (with or without location)
      // Calculate distances if user location is available
      const { currentUserLocation } = get();
      let donorsWithDistance = donorsExcludingCurrentUser;

      if (currentUserLocation) {
        donorsWithDistance = donorsExcludingCurrentUser.map((donor) => {
          if (donor.location && donor.location.latitude && donor.location.longitude) {
            return {
              ...donor,
              distance: calculateDistance(currentUserLocation, donor.location),
            };
          }
          return donor; // Keep donor even without location
        });
      }

      // Sort by availability (Available first, then Busy, then Unavailable)
      donorsWithDistance.sort((a, b) => {
        const availabilityOrder = { 'Available': 0, 'Busy': 1, 'Unavailable': 2 };
        const aOrder = availabilityOrder[a.availability || 'Unavailable'];
        const bOrder = availabilityOrder[b.availability || 'Unavailable'];
        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }
        // If same availability, sort by name
        return a.name.localeCompare(b.name);
      });

      set({
        donors: donorsWithDistance,
        filteredDonors: donorsWithDistance,
        isLoading: false,
      });

      console.log('✅ [HomeController] Donors loaded:', donorsWithDistance.length);
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch donors',
        isLoading: false,
      });
    }
  },

  // Filter donors based on options
  filterDonors: (options: DonorFilterOptions) => {
    const { donors, currentUserLocation } = get();
    let filtered = [...donors];

    // Filter by blood group
    if (options.bloodGroup) {
      filtered = filtered.filter((donor) => donor.bloodGroup === options.bloodGroup);
    }

    // Filter by availability
    if (options.availability) {
      filtered = filtered.filter((donor) => donor.availability === options.availability);
    }

    // Filter by distance
    if (options.maxDistance && currentUserLocation) {
      filtered = filtered.filter((donor) => {
        if (!donor.location) return false;
        if (!donor.distance) {
          const distance = calculateDistance(currentUserLocation, donor.location);
          donor.distance = distance;
        }
        return donor.distance <= options.maxDistance!;
      });
    }

    // Sort
    if (options.sortBy === 'distance' && currentUserLocation) {
      filtered.sort((a, b) => {
        if (!a.location || !b.location) return 0;
        const distanceA = a.distance || calculateDistance(currentUserLocation, a.location);
        const distanceB = b.distance || calculateDistance(currentUserLocation, b.location);
        return distanceA - distanceB;
      });
    } else if (options.sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    set({ filteredDonors: filtered });
  },

  // Set selected blood group
  setSelectedBloodGroup: (bloodGroup: string | null) => {
    set({ selectedBloodGroup: bloodGroup });
    get().calculateAndSortByDistance();
  },

  // Set selected distance
  setSelectedDistance: (distance: number) => {
    set({ selectedDistance: distance });
    get().calculateAndSortByDistance();
  },

  // Set current user location
  setCurrentUserLocation: (location: Coordinates) => {
    set({ currentUserLocation: location });
    get().calculateAndSortByDistance();
  },

  // Calculate distances and sort
  calculateAndSortByDistance: async () => {
    const { donors, currentUserLocation, selectedBloodGroup, selectedDistance } = get();

    // Get current user ID to ensure we exclude them
    const currentUserId = await AuthService.getCurrentUserId();

    // Filter out current user if not already filtered
    let filteredDonors = currentUserId
      ? donors.filter((donor) => donor.id !== currentUserId)
      : donors;

    if (!currentUserLocation) {
      set({ filteredDonors: filteredDonors });
      return;
    }

    // Calculate distances (only for donors with location)
    let donorsWithDistance = filteredDonors.map((donor) => {
      if (donor.location) {
        return {
          ...donor,
          distance: calculateDistance(currentUserLocation, donor.location),
        };
      }
      return donor; // Keep donor without location
    });

    // Apply blood group filter
    if (selectedBloodGroup) {
      donorsWithDistance = donorsWithDistance.filter(
        (donor) => donor.bloodGroup === selectedBloodGroup
      );
    }

    // Apply distance filter
    donorsWithDistance = donorsWithDistance.filter(
      (donor) => donor.distance && donor.distance <= selectedDistance
    );

    // Sort by distance (donors with distance first, then by name)
    donorsWithDistance.sort((a, b) => {
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      if (a.distance !== undefined) return -1;
      if (b.distance !== undefined) return 1;
      return a.name.localeCompare(b.name);
    });

    set({ filteredDonors: donorsWithDistance });
  },

  // Subscribe to real-time donor updates (mock - polls every 5 seconds)
  subscribeToDonors: () => {
    let isSubscribed = true;

    const pollDonors = async () => {
      if (!isSubscribed) return;

      try {
        await get().fetchDonors();
      } catch (error) {
        console.error('Failed to fetch donors:', error);
      }

      if (isSubscribed) {
        setTimeout(pollDonors, 5000);
      }
    };

    pollDonors();

    return () => {
      isSubscribed = false;
    };
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

