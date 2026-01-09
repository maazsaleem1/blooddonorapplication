/**
 * Authentication Controller
 * Handles ALL authentication business logic
 * NO UI - Pure business logic controller
 */
import { create } from 'zustand';
import { AuthService } from '../data/firebase/authService';
import { FirestoreService } from '../data/firebase/firestoreService';
import { User, UserRegistrationData, UserLoginData } from '../domain/models/User';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

interface AuthActions {
    // Actions
    register: (data: UserRegistrationData) => Promise<void>;
    login: (data: UserLoginData) => Promise<void>;
    logout: () => Promise<void>;
    checkAuthState: () => Promise<boolean>;
    resetPassword: (email: string) => Promise<void>;
    clearError: () => void;
}

type AuthController = AuthState & AuthActions;

/**
 * Authentication Controller Store
 * Manages authentication state and business logic
 */
export const useAuthController = create<AuthController>((set, get) => ({
    // Initial State
    user: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,

    // Register new user
    register: async (data: UserRegistrationData) => {
        set({ isLoading: true, error: null });

        try {
            // 1. Register user
            const authResult = await AuthService.register(data);

            // 2. Create user document
            const userData: User = {
                id: authResult.uid,
                email: data.email,
                name: data.name,
                phone: data.phone,
                bloodGroup: data.bloodGroup,
                gender: data.gender,
                age: data.age,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await FirestoreService.saveUser(authResult.uid, userData);
            console.log('✅ [AuthController] User saved to Firestore, updating state...');

            // 3. Update state
            set({
                user: userData,
                isAuthenticated: true,
                isLoading: false,
            });
            console.log('✅ [AuthController] State updated - isAuthenticated: true');
        } catch (error: any) {
            set({
                error: error.message || 'Registration failed',
                isLoading: false,
            });
            throw error;
        }
    },

    // Login user
    login: async (data: UserLoginData) => {
        set({ isLoading: true, error: null });

        try {
            // 1. Login user
            const authResult = await AuthService.login(data);

            // 2. Get user data
            const user = await FirestoreService.getUser(authResult.uid);

            if (!user) {
                throw new Error('User data not found');
            }

            // 3. Update state
            set({
                user,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.message || 'Login failed',
                isLoading: false,
            });
            throw error;
        }
    },

    // Logout user
    logout: async () => {
        set({ isLoading: true });

        try {
            await AuthService.logout();
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.message || 'Logout failed',
                isLoading: false,
            });
            throw error;
        }
    },

    // Check authentication state
    checkAuthState: async (): Promise<boolean> => {
        try {
            const userId = await AuthService.getCurrentUserId();

            if (!userId) {
                set({ isAuthenticated: false, user: null });
                return false;
            }

            // Get user data
            const user = await FirestoreService.getUser(userId);

            if (user) {
                set({
                    user,
                    isAuthenticated: true,
                });
                return true;
            }

            set({ isAuthenticated: false, user: null });
            return false;
        } catch (error: any) {
            set({ isAuthenticated: false, user: null });
            return false;
        }
    },

    // Reset password
    resetPassword: async (email: string) => {
        set({ isLoading: true, error: null });

        try {
            await AuthService.resetPassword(email);
            set({ isLoading: false });
        } catch (error: any) {
            set({
                error: error.message || 'Password reset failed',
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

