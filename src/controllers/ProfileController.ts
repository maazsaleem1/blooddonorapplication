/**
 * Profile Controller
 * Handles ALL profile-related business logic
 * NO UI - Pure business logic controller
 */
import { create } from 'zustand';
import { FirestoreService } from '../data/firebase/firestoreService';
import { StorageService } from '../data/firebase/storageService';
import { AuthService } from '../data/firebase/authService';
import { User } from '../domain/models/User';
import * as ImagePicker from 'expo-image-picker';

interface ProfileState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface ProfileActions {
  // Actions
  fetchUserProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateProfileImage: () => Promise<void>;
  clearError: () => void;
}

type ProfileController = ProfileState & ProfileActions;

/**
 * Profile Controller Store
 * Manages profile state and business logic
 */
export const useProfileController = create<ProfileController>((set, get) => ({
  // Initial State
  user: null,
  isLoading: false,
  error: null,

  // Fetch user profile
  fetchUserProfile: async () => {
    const userId = await AuthService.getCurrentUserId();
    if (!userId) {
      set({ error: 'User not authenticated' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const user = await FirestoreService.getUser(userId);
      set({ user, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch profile',
        isLoading: false,
      });
    }
  },

  // Update profile
  updateProfile: async (data: Partial<User>) => {
    const userId = await AuthService.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    set({ isLoading: true, error: null });

    try {
      await FirestoreService.saveUser(userId, {
        ...data,
        updatedAt: new Date(),
      });

      // Refresh user data
      await get().fetchUserProfile();
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update profile',
        isLoading: false,
      });
      throw error;
    }
  },

  // Update profile image
  updateProfileImage: async () => {
    const userId = await AuthService.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    set({ isLoading: true, error: null });

    try {
      // Request image picker permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access media library was denied');
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        set({ isLoading: false });
        return;
      }

      // Upload image (mock - just returns local URI)
      const imageUri = result.assets[0].uri;
      const storagePath = `profile-images/${userId}.jpg`;
      const downloadURL = await StorageService.uploadImage(imageUri, storagePath);

      // Update user profile with image URL
      await FirestoreService.saveUser(userId, {
        profileImageUrl: downloadURL,
        updatedAt: new Date(),
      });

      // Refresh user data
      await get().fetchUserProfile();
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update profile image',
        isLoading: false,
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
