/**
 * Chat Model
 * Domain model for chat entity
 */
export interface Chat {
  id: string;
  participants: string[]; // User IDs
  lastMessage?: Message;
  lastMessageTime?: Date;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Message Model
 * Domain model for message entity
 */
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'seen';
  imageUrl?: string;
}

/**
 * Chat Participant Info
 * Additional info about chat participants
 */
export interface ChatParticipant {
  userId: string;
  name: string;
  profileImageUrl?: string;
  bloodGroup: string;
}

