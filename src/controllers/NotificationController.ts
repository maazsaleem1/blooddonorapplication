/**
 * Notification Controller
 * Handles ALL notification-related business logic
 * NO UI - Pure business logic controller
 */
import { create } from 'zustand';
import { NotificationService } from '../data/firebase/notificationService';
import * as Notifications from 'expo-notifications';

interface NotificationState {
  notifications: Notifications.Notification[];
  unreadCount: number;
  fcmToken: string | null;
  isLoading: boolean;
  error: string | null;
}

interface NotificationActions {
  // Actions
  requestPermissions: () => Promise<boolean>;
  getFCMToken: () => Promise<string | null>;
  saveFCMToken: (token: string) => Promise<void>;
  sendLocalNotification: (title: string, body: string, data?: any) => Promise<void>;
  clearNotifications: () => void;
  setUnreadCount: (count: number) => void;
  clearError: () => void;
}

type NotificationController = NotificationState & NotificationActions;

/**
 * Notification Controller Store
 * Manages notification state and business logic
 */
export const useNotificationController = create<NotificationController>((set, get) => ({
  // Initial State
  notifications: [],
  unreadCount: 0,
  fcmToken: null,
  isLoading: false,
  error: null,

  // Request notification permissions
  requestPermissions: async () => {
    set({ isLoading: true, error: null });

    try {
      const granted = await NotificationService.requestPermissions();

      if (granted) {
        // Get FCM token
        const token = await get().getFCMToken();
        if (token) {
          await get().saveFCMToken(token);
        }
      }

      set({ isLoading: false });
      return granted;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to request permissions',
        isLoading: false,
      });
      return false;
    }
  },

  // Get FCM token
  getFCMToken: async () => {
    try {
      const token = await NotificationService.getToken();
      set({ fcmToken: token });
      return token;
    } catch (error: any) {
      set({ error: error.message || 'Failed to get FCM token' });
      return null;
    }
  },

  // Save FCM token
  saveFCMToken: async (token: string) => {
    try {
      const { AuthService } = await import('../data/firebase/authService');
      const userId = await AuthService.getCurrentUserId();
      if (userId) {
        await NotificationService.saveFCMToken(userId, token);
      }
      set({ fcmToken: token });
    } catch (error: any) {
      set({ error: error.message || 'Failed to save FCM token' });
    }
  },

  // Send local notification
  sendLocalNotification: async (title: string, body: string, data?: any) => {
    try {
      await NotificationService.sendNotification(title, body);
      set({ unreadCount: get().unreadCount + 1 });
    } catch (error: any) {
      set({ error: error.message || 'Failed to send notification' });
    }
  },

  // Clear notifications
  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  // Set unread count
  setUnreadCount: (count: number) => {
    set({ unreadCount: count });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
