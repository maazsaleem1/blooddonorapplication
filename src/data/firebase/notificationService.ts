/**
 * Firebase Cloud Messaging Service
 * Handles Firebase Cloud Messaging (FCM) operations
 * NO UI logic - Pure service layer
 */
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirestoreService } from './firestoreService';
import { AppConstants } from '../../core/constants/appConstants';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from '../../core/config/firebaseConfig';

const FCM_TOKEN_KEY = '@fcm_token';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export class NotificationService {
    /**
     * Request notification permissions
     */
    static async requestPermissions(): Promise<boolean> {
        try {
            const { status } = await Notifications.requestPermissionsAsync();
            return status === 'granted';
        } catch (error: any) {
            throw new Error(`Failed to request permissions: ${error.message}`);
        }
    }

    /**
     * Get FCM token (using Expo Notifications)
     */
    static async getToken(): Promise<string | null> {
        try {
            const token = await Notifications.getExpoPushTokenAsync({
                projectId: AppConstants.FIREBASE_PROJECT_ID,
            });
            return token.data;
        } catch (error: any) {
            console.error('Failed to get FCM token:', error);
            return null;
        }
    }

    /**
     * Save FCM token to Firestore and AsyncStorage
     */
    static async saveFCMToken(userId: string, token: string): Promise<void> {
        try {
            // Save to AsyncStorage
            await AsyncStorage.setItem(FCM_TOKEN_KEY, token);

            // Save to Firestore
            const tokenRef = doc(firestore, AppConstants.COLLECTIONS.USERS, userId);
            const userDoc = await getDoc(tokenRef);

            if (userDoc.exists()) {
                await setDoc(tokenRef, {
                    fcmToken: token,
                    updatedAt: new Date(),
                }, { merge: true });
            } else {
                await setDoc(tokenRef, {
                    fcmToken: token,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }

            console.log('✅ [NotificationService] FCM token saved to Firestore');
        } catch (error: any) {
            throw new Error(`Failed to save FCM token: ${error.message}`);
        }
    }

    /**
     * Get FCM token for a user
     */
    static async getUserFCMToken(userId: string): Promise<string | null> {
        try {
            const userRef = doc(firestore, AppConstants.COLLECTIONS.USERS, userId);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                return userDoc.data()?.fcmToken || null;
            }
            return null;
        } catch (error: any) {
            console.error('Failed to get user FCM token:', error);
            return null;
        }
    }

    /**
     * Send local notification
     */
    static async sendNotification(
        title: string,
        body: string,
        data?: any
    ): Promise<void> {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data: data || {},
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: null, // Show immediately
            });
        } catch (error: any) {
            throw new Error(`Failed to send notification: ${error.message}`);
        }
    }

    /**
     * Send notification to specific user (via their FCM token)
     * In production, this would use Firebase Cloud Functions or a backend service
     */
    static async sendNotificationToUser(
        userId: string,
        title: string,
        body: string,
        data?: any
    ): Promise<void> {
        try {
            // Get user's FCM token
            const fcmToken = await this.getUserFCMToken(userId);

            if (!fcmToken) {
                console.warn(`No FCM token found for user ${userId}`);
                return;
            }

            // In production, you would send this via Firebase Cloud Functions
            // For now, we'll save it to Firestore notifications collection
            await FirestoreService.saveNotification({
                id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId,
                title,
                body,
                data: data || {},
                read: false,
                createdAt: new Date(),
            });

            console.log(`✅ [NotificationService] Notification saved for user ${userId}`);
        } catch (error: any) {
            console.error('Failed to send notification to user:', error);
        }
    }
}

