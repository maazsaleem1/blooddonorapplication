/**
 * Authentication Service
 * Handles all Firebase Authentication operations
 * NO UI logic - Pure service layer
 */
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    sendEmailVerification,
    updateProfile,
    User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../../core/config/firebaseConfig';
import { User, UserRegistrationData, UserLoginData } from '../../domain/models/User';

// Interface for Firebase Auth registration (only email & password needed)
interface FirebaseRegisterData {
    email: string;
    password: string;
    name?: string;
}

export class AuthService {
    /**
     * Register a new user (Firebase Auth only - email & password)
     */
    static async register(data: UserRegistrationData): Promise<{ uid: string }> {
        console.log('🔍 [AuthService] register() called with email:', data.email);

        try {
            // Validate email format
            if (!data.email || !data.email.includes('@')) {
                throw new Error('Please enter a valid email address');
            }

            // Validate password length
            if (!data.password || data.password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            console.log('🔍 [AuthService] Calling createUserWithEmailAndPassword...');
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                data.email,
                data.password
            );
            console.log('✅ [AuthService] User created successfully, uid:', userCredential.user.uid);

            // Update user profile if name provided
            if (data.name) {
                try {
                    await updateProfile(userCredential.user, {
                        displayName: data.name,
                    });
                } catch (profileError) {
                    console.warn('Failed to update profile:', profileError);
                    // Continue even if profile update fails
                }
            }

            // Send email verification (don't block on this)
            if (userCredential.user) {
                try {
                    await sendEmailVerification(userCredential.user);
                } catch (verificationError) {
                    console.warn('Failed to send verification email:', verificationError);
                    // Continue even if verification email fails
                }
            }

            return { uid: userCredential.user.uid };
        } catch (error: any) {
            console.error('❌ [AuthService] Registration error:', error);
            console.error('❌ [AuthService] Error code:', error?.code);
            console.error('❌ [AuthService] Error message:', error?.message);

            // Provide user-friendly error messages
            let errorMessage = 'Registration failed';

            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered. Please login instead.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Please enter a valid email address.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak. Please use at least 6 characters.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            throw new Error(errorMessage);
        }
    }

    /**
     * Login user
     */
    static async login(data: UserLoginData): Promise<{ uid: string }> {
        console.log('🔍 [AuthService] login() called with email:', data.email);

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                data.email,
                data.password
            );
            console.log('✅ [AuthService] Login successful, uid:', userCredential.user.uid);
            return { uid: userCredential.user.uid };
        } catch (error: any) {
            console.error('❌ [AuthService] Login error:', error);
            console.error('❌ [AuthService] Error code:', error?.code);

            let errorMessage = 'Login failed';

            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Please enter a valid email address.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            throw new Error(errorMessage);
        }
    }

    /**
     * Logout current user
     */
    static async logout(): Promise<void> {
        console.log('🔍 [AuthService] logout() called');
        try {
            await signOut(auth);
            console.log('✅ [AuthService] Logout successful');
        } catch (error: any) {
            console.error('❌ [AuthService] Logout error:', error);
            throw new Error(`Logout failed: ${error.message}`);
        }
    }

    /**
     * Send password reset email
     */
    static async resetPassword(email: string): Promise<void> {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error: any) {
            throw new Error(`Password reset failed: ${error.message}`);
        }
    }

    /**
     * Get current authenticated user
     */
    static getCurrentUser(): FirebaseUser | null {
        return auth.currentUser;
    }

    /**
     * Check if user is authenticated
     */
    static isAuthenticated(): boolean {
        return auth.currentUser !== null;
    }

    /**
     * Get current user ID
     */
    static async getCurrentUserId(): Promise<string | null> {
        return auth.currentUser?.uid || null;
    }
}

