/**
 * App Routes Constants
 * All navigation routes are defined here for maintainability
 */
export const AppRoutes = {
  SPLASH: '/',
  ONBOARDING: '/onboarding',
  LOGIN: '/login',
  SIGNUP: '/signup',
  HOME: '/home',
  MAP: '/map',
  CHAT: '/chat',
  CHAT_DETAIL: '/chat/:chatId',
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
  BLOOD_REQUEST: '/blood-request',
  BLOOD_REQUEST_DETAIL: '/blood-request/:requestId',
} as const;

