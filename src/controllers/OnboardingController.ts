/**
 * Onboarding Controller
 * Handles onboarding state and business logic
 * NO UI - Pure business logic controller
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConstants } from '../core/constants/appConstants';

interface OnboardingState {
  currentPage: number;
  isOnboardingComplete: boolean;
}

interface OnboardingActions {
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
  completeOnboarding: () => Promise<void>;
  checkOnboardingStatus: () => Promise<boolean>;
}

type OnboardingController = OnboardingState & OnboardingActions;

/**
 * Onboarding Controller Store
 * Manages onboarding flow state
 */
export const useOnboardingController = create<OnboardingController>((set, get) => ({
  // Initial State
  currentPage: 0,
  isOnboardingComplete: false,

  // Navigate to next page
  nextPage: () => {
    const { currentPage } = get();
    set({ currentPage: currentPage + 1 });
  },

  // Navigate to previous page
  previousPage: () => {
    const { currentPage } = get();
    if (currentPage > 0) {
      set({ currentPage: currentPage - 1 });
    }
  },

  // Go to specific page
  goToPage: (page: number) => {
    set({ currentPage: page });
  },

  // Complete onboarding
  completeOnboarding: async () => {
    try {
      await AsyncStorage.setItem(
        AppConstants.STORAGE_KEYS.ONBOARDING_COMPLETE,
        'true'
      );
      set({ isOnboardingComplete: true });
    } catch (error: any) {
      throw new Error(`Failed to complete onboarding: ${error.message}`);
    }
  },

  // Check onboarding status
  checkOnboardingStatus: async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(
        AppConstants.STORAGE_KEYS.ONBOARDING_COMPLETE
      );
      const isComplete = value === 'true';
      set({ isOnboardingComplete: isComplete });
      return isComplete;
    } catch (error: any) {
      return false;
    }
  },
}));

