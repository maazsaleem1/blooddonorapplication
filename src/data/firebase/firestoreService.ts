/**
 * Firestore Service
 * Handles all Firestore database operations
 * NO UI logic - Pure service layer
 */
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    Timestamp,
    QuerySnapshot,
    DocumentData,
} from 'firebase/firestore';
import { firestore } from '../../core/config/firebaseConfig';
import { AppConstants } from '../../core/constants/appConstants';
import { User } from '../../domain/models/User';
import { Donor } from '../../domain/models/Donor';
import { Chat, Message } from '../../domain/models/Chat';
import { BloodRequest } from '../../domain/models/BloodRequest';

export class FirestoreService {
    /**
     * Save user to Firestore
     */
    static async saveUser(userId: string, userData: Partial<User>): Promise<void> {
        console.log('🔍 [FirestoreService] saveUser() called for userId:', userId);

        try {
            const userRef = doc(firestore, AppConstants.COLLECTIONS.USERS, userId);

            // Convert Date objects to Timestamps for Firestore
            const firestoreData: any = {
                ...userData,
                updatedAt: Timestamp.now(),
            };

            // Convert createdAt if it exists
            if (userData.createdAt) {
                firestoreData.createdAt = userData.createdAt instanceof Date
                    ? Timestamp.fromDate(userData.createdAt)
                    : Timestamp.now();
            }

            // Convert lastDonationDate if it exists
            if (userData.lastDonationDate) {
                firestoreData.lastDonationDate = userData.lastDonationDate instanceof Date
                    ? Timestamp.fromDate(userData.lastDonationDate)
                    : Timestamp.now();
            }

            // Location is already an object, no conversion needed

            console.log('🔍 [FirestoreService] Saving user data to Firestore...');
            console.log('🔍 [FirestoreService] User data:', JSON.stringify(firestoreData, null, 2));
            await setDoc(userRef, firestoreData, { merge: true });
            console.log('✅ [FirestoreService] User data saved successfully');
        } catch (error: any) {
            console.error('❌ [FirestoreService] saveUser error:', error);
            console.error('❌ [FirestoreService] Error code:', error?.code);
            console.error('❌ [FirestoreService] Error message:', error?.message);
            throw new Error(`Failed to save user: ${error.message}`);
        }
    }

    /**
     * Get user by ID
     */
    static async getUser(userId: string): Promise<User | null> {
        console.log('🔍 [FirestoreService] getUser() called for userId:', userId);

        try {
            const userRef = doc(firestore, AppConstants.COLLECTIONS.USERS, userId);
            console.log('🔍 [FirestoreService] Fetching user document...');
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                console.log('✅ [FirestoreService] User document found');
                const data = userSnap.data();
                return {
                    ...data,
                    id: userSnap.id,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as User;
            }
            console.log('❌ [FirestoreService] User document does not exist');
            return null;
        } catch (error: any) {
            console.error('❌ [FirestoreService] Error getting user:', error);
            console.error('❌ [FirestoreService] Error message:', error?.message);
            throw new Error(`Failed to get user: ${error.message}`);
        }
    }

    /**
     * Get all users (for donor list)
     */
    static async getAllUsers(): Promise<User[]> {
        try {
            const usersRef = collection(firestore, AppConstants.COLLECTIONS.USERS);
            const snapshot = await getDocs(usersRef);

            return snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            })) as User[];
        } catch (error: any) {
            throw new Error(`Failed to get users: ${error.message}`);
        }
    }

    /**
     * Get donors (all users - location filtering happens in controller)
     */
    static async getDonors(): Promise<Donor[]> {
        try {
            const usersRef = collection(firestore, AppConstants.COLLECTIONS.USERS);
            const snapshot = await getDocs(usersRef);

            // Convert users to donors format
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    userId: doc.id,
                    name: data.name || '',
                    bloodGroup: data.bloodGroup || '',
                    availability: data.availability || 'Available',
                    location: data.location || null, // Location might be null
                    lastDonationDate: data.lastDonationDate?.toDate(),
                    profileImageUrl: data.profileImageUrl,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as Donor;
            });
        } catch (error: any) {
            console.error('❌ [FirestoreService] Error getting donors:', error);
            throw new Error(`Failed to get donors: ${error.message}`);
        }
    }

    /**
     * Save chat
     */
    static async saveChat(chat: Chat): Promise<void> {
        try {
            const chatRef = doc(firestore, AppConstants.COLLECTIONS.CHATS, chat.id);
            await setDoc(chatRef, {
                ...chat,
                createdAt: Timestamp.fromDate(chat.createdAt),
                updatedAt: Timestamp.fromDate(chat.updatedAt),
            });
        } catch (error: any) {
            throw new Error(`Failed to save chat: ${error.message}`);
        }
    }

    /**
     * Get chat by ID
     */
    static async getChat(chatId: string): Promise<Chat | null> {
        try {
            const chatRef = doc(firestore, AppConstants.COLLECTIONS.CHATS, chatId);
            const chatDoc = await getDoc(chatRef);

            if (chatDoc.exists()) {
                const data = chatDoc.data();
                return {
                    id: chatDoc.id,
                    participants: data.participants || [],
                    unreadCount: data.unreadCount || 0,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                    lastMessage: data.lastMessage,
                    lastMessageTime: data.lastMessageTime?.toDate(),
                } as Chat;
            }
            return null;
        } catch (error: any) {
            throw new Error(`Failed to get chat: ${error.message}`);
        }
    }

    /**
     * Find existing chat between two users
     */
    static async findChatByParticipants(userId1: string, userId2: string): Promise<Chat | null> {
        try {
            const chatsRef = collection(firestore, AppConstants.COLLECTIONS.CHATS);

            // Query chats where first user is a participant
            const q = query(
                chatsRef,
                where('participants', 'array-contains', userId1)
            );

            const snapshot = await getDocs(q);

            // Find chat with exactly 2 participants matching both users
            for (const doc of snapshot.docs) {
                const chatData = doc.data();
                const participants = chatData.participants || [];

                // Check if this chat has exactly 2 participants and both users are in it
                if (
                    participants.length === 2 &&
                    participants.includes(userId1) &&
                    participants.includes(userId2)
                ) {
                    return {
                        id: doc.id,
                        participants: participants,
                        unreadCount: chatData.unreadCount || 0,
                        createdAt: chatData.createdAt?.toDate() || new Date(),
                        updatedAt: chatData.updatedAt?.toDate() || new Date(),
                        lastMessage: chatData.lastMessage,
                        lastMessageTime: chatData.lastMessageTime?.toDate(),
                    } as Chat;
                }
            }

            return null;
        } catch (error: any) {
            console.error('Error finding chat by participants:', error);
            throw new Error(`Failed to find chat: ${error.message}`);
        }
    }

    /**
     * Get user chats with last message and participant info
     */
    static async getUserChats(userId: string): Promise<Chat[]> {
        try {
            const chatsRef = collection(firestore, AppConstants.COLLECTIONS.CHATS);
            const q = query(
                chatsRef,
                where('participants', 'array-contains', userId)
            );
            const snapshot = await getDocs(q);

            const chats: Chat[] = [];

            // Process each chat
            for (const doc of snapshot.docs) {
                const chatData = doc.data();
                const chatId = doc.id;

                // Get last message
                let lastMessage: Message | undefined;
                try {
                    const messagesRef = collection(
                        firestore,
                        AppConstants.COLLECTIONS.CHATS,
                        chatId,
                        AppConstants.COLLECTIONS.MESSAGES
                    );
                    const messagesQuery = query(
                        messagesRef,
                        orderBy('timestamp', 'desc'),
                        limit(1)
                    );
                    const messagesSnapshot = await getDocs(messagesQuery);

                    if (!messagesSnapshot.empty) {
                        const lastMsgDoc = messagesSnapshot.docs[0];
                        const msgData = lastMsgDoc.data();
                        lastMessage = {
                            id: lastMsgDoc.id,
                            chatId: chatId,
                            senderId: msgData.senderId,
                            text: msgData.text,
                            timestamp: msgData.timestamp?.toDate() || new Date(),
                            status: msgData.status || 'sent',
                            imageUrl: msgData.imageUrl,
                        };
                    }
                } catch (error) {
                    console.error(`Failed to get last message for chat ${chatId}:`, error);
                }

                const chat: Chat = {
                    id: chatId,
                    participants: chatData.participants || [],
                    lastMessage,
                    lastMessageTime: lastMessage?.timestamp,
                    unreadCount: chatData.unreadCount || 0,
                    createdAt: chatData.createdAt?.toDate() || new Date(),
                    updatedAt: chatData.updatedAt?.toDate() || new Date(),
                };

                chats.push(chat);
            }

            // Sort by last message time or updatedAt
            chats.sort((a, b) => {
                const timeA = a.lastMessageTime || a.updatedAt;
                const timeB = b.lastMessageTime || b.updatedAt;
                return timeB.getTime() - timeA.getTime();
            });

            return chats;
        } catch (error: any) {
            throw new Error(`Failed to get chats: ${error.message}`);
        }
    }

    /**
     * Save message
     */
    static async saveMessage(chatId: string, message: Message): Promise<void> {
        try {
            const messagesRef = collection(
                firestore,
                AppConstants.COLLECTIONS.CHATS,
                chatId,
                AppConstants.COLLECTIONS.MESSAGES
            );
            const messageRef = doc(messagesRef);

            // Prepare message data, excluding undefined fields (Firestore doesn't allow undefined)
            const messageData: any = {
                id: message.id,
                chatId: message.chatId,
                senderId: message.senderId,
                text: message.text,
                timestamp: Timestamp.fromDate(message.timestamp),
                status: message.status,
            };

            // Only include imageUrl if it's defined
            if (message.imageUrl !== undefined && message.imageUrl !== null) {
                messageData.imageUrl = message.imageUrl;
            }

            await setDoc(messageRef, messageData);
        } catch (error: any) {
            throw new Error(`Failed to save message: ${error.message}`);
        }
    }

    /**
     * Get chat messages
     */
    static getChatMessages(
        chatId: string,
        callback: (messages: Message[]) => void
    ): () => void {
        console.log('🔍 [FirestoreService] Getting messages for chat:', chatId);
        const messagesRef = collection(
            firestore,
            AppConstants.COLLECTIONS.CHATS,
            chatId,
            AppConstants.COLLECTIONS.MESSAGES
        );
        // Order by timestamp (the field we use when saving messages)
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        return onSnapshot(q,
            (snapshot) => {
                console.log('✅ [FirestoreService] Received snapshot with', snapshot.docs.length, 'messages');
                const messages = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        chatId: data.chatId || chatId,
                        senderId: data.senderId || '',
                        text: data.text || '',
                        timestamp: data.timestamp?.toDate() || new Date(),
                        status: data.status || 'sent',
                        imageUrl: data.imageUrl,
                    } as Message;
                });
                console.log('✅ [FirestoreService] Parsed', messages.length, 'messages');
                callback(messages);
            },
            (error) => {
                console.error('❌ [FirestoreService] Error in getChatMessages:', error);
                callback([]); // Return empty array on error
            }
        );
    }

    /**
     * Save notification to Firestore
     */
    static async saveNotification(notification: {
        id: string;
        userId: string;
        title: string;
        body: string;
        data?: any;
        read: boolean;
        createdAt: Date;
    }): Promise<void> {
        try {
            const notificationRef = doc(
                firestore,
                AppConstants.COLLECTIONS.NOTIFICATIONS,
                notification.id
            );
            await setDoc(notificationRef, {
                ...notification,
                createdAt: Timestamp.fromDate(notification.createdAt),
            });
        } catch (error: any) {
            throw new Error(`Failed to save notification: ${error.message}`);
        }
    }

    /**
     * Get user notifications
     */
    static async getUserNotifications(userId: string): Promise<any[]> {
        try {
            const notificationsRef = collection(firestore, AppConstants.COLLECTIONS.NOTIFICATIONS);
            const q = query(
                notificationsRef,
                where('userId', '==', userId),
                orderBy('createdAt', 'desc'),
                limit(50)
            );
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
            }));
        } catch (error: any) {
            throw new Error(`Failed to get notifications: ${error.message}`);
        }
    }

    /**
     * Mark notification as read
     */
    static async markNotificationAsRead(notificationId: string): Promise<void> {
        try {
            const notificationRef = doc(
                firestore,
                AppConstants.COLLECTIONS.NOTIFICATIONS,
                notificationId
            );
            await updateDoc(notificationRef, {
                read: true,
            });
        } catch (error: any) {
            throw new Error(`Failed to mark notification as read: ${error.message}`);
        }
    }

    /**
     * Save blood request
     */
    static async saveBloodRequest(request: BloodRequest): Promise<void> {
        try {
            const requestRef = doc(firestore, AppConstants.COLLECTIONS.BLOOD_REQUESTS, request.id);
            await setDoc(requestRef, {
                ...request,
                createdAt: Timestamp.fromDate(request.createdAt),
                updatedAt: Timestamp.fromDate(request.updatedAt),
            });
        } catch (error: any) {
            throw new Error(`Failed to save blood request: ${error.message}`);
        }
    }

    /**
     * Get blood requests
     */
    static async getBloodRequests(): Promise<BloodRequest[]> {
        try {
            const requestsRef = collection(firestore, AppConstants.COLLECTIONS.BLOOD_REQUESTS);
            const q = query(requestsRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            })) as BloodRequest[];
        } catch (error: any) {
            throw new Error(`Failed to get blood requests: ${error.message}`);
        }
    }

    /**
     * Accept blood request
     */
    static async acceptBloodRequest(requestId: string, donorId: string): Promise<void> {
        try {
            const requestRef = doc(firestore, AppConstants.COLLECTIONS.BLOOD_REQUESTS, requestId);
            await updateDoc(requestRef, {
                status: 'Accepted',
                acceptedBy: donorId,
                updatedAt: Timestamp.now(),
            });
        } catch (error: any) {
            throw new Error(`Failed to accept blood request: ${error.message}`);
        }
    }

    /**
     * Reject/Cancel blood request
     */
    static async rejectBloodRequest(requestId: string): Promise<void> {
        try {
            const requestRef = doc(firestore, AppConstants.COLLECTIONS.BLOOD_REQUESTS, requestId);
            await updateDoc(requestRef, {
                status: 'Cancelled',
                updatedAt: Timestamp.now(),
            });
        } catch (error: any) {
            throw new Error(`Failed to reject blood request: ${error.message}`);
        }
    }
}

