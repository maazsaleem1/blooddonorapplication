/**
 * App-wide Constants
 * All constants used across the app are defined here
 */
export const AppConstants = {
  // App Info
  APP_NAME: 'Blood Donation',
  APP_VERSION: '1.0.0',

  // Distance Filters (in meters)
  DISTANCE_500M: 500,
  DISTANCE_1KM: 1000,
  DISTANCE_3KM: 3000,
  DISTANCE_5KM: 5000,

  // Blood Groups
  BLOOD_GROUPS: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],

  // Firestore Collections
  COLLECTIONS: {
    USERS: 'users',
    DONORS: 'donors',
    CHATS: 'chats',
    MESSAGES: 'messages',
    NOTIFICATIONS: 'notifications',
    BLOOD_REQUESTS: 'bloodRequests',
  },

  // Storage Keys
  STORAGE_KEYS: {
    ONBOARDING_COMPLETE: 'onboarding_complete',
    USER_LOCATION: 'user_location',
    FCM_TOKEN: 'fcm_token',
  },

  // Map Settings
  MAP: {
    DEFAULT_ZOOM: 15,
    DEFAULT_LATITUDE: 24.8607, // Default: Pakistan
    DEFAULT_LONGITUDE: 67.0011,
  },

  // Urgency Levels
  URGENCY_LEVELS: {
    LOW: 'Low',
    MEDIUM: 'Medium',
    EMERGENCY: 'Emergency',
  },

  // Firebase Project ID (from firebaseConfig)
  FIREBASE_PROJECT_ID: 'authapp-2af47', // Update this if your project ID is different
} as const;

