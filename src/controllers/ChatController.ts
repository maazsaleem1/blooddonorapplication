/**
 * Chat Controller
 * Handles ALL chat-related business logic
 * NO UI - Pure business logic controller
 */
import { create } from 'zustand';
import { FirestoreService } from '../data/firebase/firestoreService';
import { Chat, Message } from '../domain/models/Chat';
import { AuthService } from '../data/firebase/authService';

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

interface ChatActions {
  // Actions
  fetchUserChats: () => Promise<void>;
  getOrCreateChat: (otherUserId: string) => Promise<string>;
  sendMessage: (chatId: string, text: string, imageUrl?: string) => Promise<void>;
  subscribeToMessages: (chatId: string) => () => void;
  subscribeToChats: () => () => void;
  markMessageAsSeen: (chatId: string, messageId: string) => Promise<void>;
  clearError: () => void;
}

type ChatController = ChatState & ChatActions;

/**
 * Chat Controller Store
 * Manages chat state and business logic
 */
export const useChatController = create<ChatController>((set, get) => ({
  // Initial State
  chats: [],
  currentChat: null,
  messages: [],
  isLoading: false,
  error: null,

  // Fetch user chats
  fetchUserChats: async () => {
    const userId = await AuthService.getCurrentUserId();
    if (!userId) {
      set({ error: 'User not authenticated' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const chats = await FirestoreService.getUserChats(userId);
      set({ chats, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch chats',
        isLoading: false,
      });
    }
  },

  // Get or create chat with another user
  getOrCreateChat: async (otherUserId: string): Promise<string> => {
    const currentUserId = await AuthService.getCurrentUserId();
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    try {
      // First, check Firestore directly for existing chat
      const existingChat = await FirestoreService.findChatByParticipants(
        currentUserId,
        otherUserId
      );

      if (existingChat) {
        console.log('✅ [ChatController] Found existing chat:', existingChat.id);
        set({ currentChat: existingChat });

        // Update local chats if not already present
        const currentChats = get().chats;
        if (!currentChats.find(c => c.id === existingChat.id)) {
          set({ chats: [...currentChats, existingChat] });
        }

        return existingChat.id;
      }

      // Create new chat with consistent ID format (sorted user IDs)
      // This ensures the same chat ID regardless of who initiates
      const sortedUserIds = [currentUserId, otherUserId].sort();
      const chatId = `${sortedUserIds[0]}_${sortedUserIds[1]}`;

      const newChat: Chat = {
        id: chatId,
        participants: [currentUserId, otherUserId],
        unreadCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await FirestoreService.saveChat(newChat);
      console.log('✅ [ChatController] Created new chat:', chatId);

      set({ currentChat: newChat });

      // Add to local chats
      const currentChats = get().chats;
      set({ chats: [...currentChats, newChat] });

      return chatId;
    } catch (error: any) {
      console.error('❌ [ChatController] Error in getOrCreateChat:', error);
      throw new Error(`Failed to create chat: ${error.message}`);
    }
  },

  // Send message
  sendMessage: async (chatId: string, text: string, imageUrl?: string) => {
    const currentUserId = await AuthService.getCurrentUserId();
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    try {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const message: Message = {
        id: messageId,
        chatId,
        senderId: currentUserId,
        text,
        imageUrl,
        timestamp: new Date(),
        status: 'sent',
      };

      await FirestoreService.saveMessage(chatId, message);
      console.log('✅ [ChatController] Message saved to Firestore');

      // Don't update local messages here - let the real-time listener handle it
      // This ensures consistency with Firestore
    } catch (error: any) {
      set({ error: error.message || 'Failed to send message' });
      throw error;
    }
  },

  subscribeToMessages: (chatId: string) => {
    console.log('🔍 [ChatController] Subscribing to messages for chat:', chatId);

    const unsubscribe = FirestoreService.getChatMessages(chatId, (messages) => {
      console.log('✅ [ChatController] Received messages:', messages.length);
      set({ messages });
    });

    return () => {
      console.log('🔍 [ChatController] Unsubscribing from messages');
      unsubscribe();
    };
  },

  subscribeToChats: () => {
    let isSubscribed = true;

    const pollChats = async () => {
      if (!isSubscribed) return;

      await get().fetchUserChats();

      if (isSubscribed) {
        setTimeout(pollChats, 5000);
      }
    };

    pollChats();

    return () => {
      isSubscribed = false;
    };
  },

  markMessageAsSeen: async (chatId: string, messageId: string) => {
    try {
      const messages = get().messages;
      const updatedMessages = messages.map(msg =>
        msg.id === messageId ? { ...msg, status: 'seen' as const } : msg
      );
      set({ messages: updatedMessages });
    } catch (error: any) {
      console.error('Failed to mark message as seen:', error);
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
