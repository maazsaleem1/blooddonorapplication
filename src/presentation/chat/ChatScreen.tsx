/**
 * Chat List Screen
 * Pure UI - NO business logic
 * Consumes ChatController state
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useChatController } from '../../controllers/ChatController';
import { Loader } from '../../components/Loader';
import { EmptyState } from '../../components/EmptyState';
import { Colors } from '../../core/theme/colors';
import { Typography } from '../../core/theme/typography';
import { AuthService } from '../../data/firebase/authService';
import { FirestoreService } from '../../data/firebase/firestoreService';

interface ChatScreenProps {
  navigation: any;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ navigation }) => {
  const { chats, isLoading, fetchUserChats, subscribeToChats } =
    useChatController();
  const [participantNames, setParticipantNames] = useState<Record<string, string>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserChats();
    const unsubscribe = subscribeToChats();
    AuthService.getCurrentUserId().then(setCurrentUserId);
    return unsubscribe;
  }, []);

  // Fetch participant names
  useEffect(() => {
    const fetchParticipantNames = async () => {
      try {
        const currentUserId = await AuthService.getCurrentUserId();
        if (!currentUserId) return;

        const names: Record<string, string> = {};
        
        // Get unique participant IDs from all chats
        const participantIds = new Set<string>();
        chats.forEach(chat => {
          chat.participants.forEach(id => {
            if (id !== currentUserId) {
              participantIds.add(id);
            }
          });
        });

        // Fetch user names
        for (const userId of participantIds) {
          try {
            const user = await FirestoreService.getUser(userId);
            if (user) {
              names[userId] = user.name;
            }
          } catch (error) {
            console.error(`Failed to get user ${userId}:`, error);
            names[userId] = 'Unknown User';
          }
        }

        setParticipantNames(names);
      } catch (error) {
        console.error('Failed to fetch participant names:', error);
      }
    };

    if (chats.length > 0) {
      fetchParticipantNames();
    }
  }, [chats]);

  const handleChatPress = (chatId: string, otherUserId?: string) => {
    navigation.navigate('ChatDetail', { chatId, otherUserId });
  };


  if (isLoading) {
    return <Loader fullScreen message="Loading chats..." />;
  }

  if (chats.length === 0) {
    return (
      <EmptyState
        title="No chats yet"
        message="Start a conversation with a donor"
        icon={<Text style={styles.emptyIcon}>💬</Text>}
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const otherParticipantId = currentUserId
            ? item.participants.find((id: string) => id !== currentUserId) || item.participants[0]
            : item.participants[0];
          
          const chatName = otherParticipantId && participantNames[otherParticipantId]
            ? participantNames[otherParticipantId]
            : `Chat ${item.id.substring(0, 8)}`;
          
          return (
            <TouchableOpacity
              style={styles.chatItem}
              onPress={() => handleChatPress(item.id, otherParticipantId)}
            >
              <View style={styles.chatContent}>
                <View style={styles.chatInfo}>
                  <Text style={styles.chatName}>
                    {chatName}
                  </Text>
                  {item.lastMessage ? (
                    <Text style={styles.lastMessage} numberOfLines={1}>
                      {item.lastMessage.text}
                    </Text>
                  ) : (
                    <Text style={styles.lastMessage} numberOfLines={1}>
                      No messages yet
                    </Text>
                  )}
                  {item.lastMessageTime && (
                    <Text style={styles.timeText}>
                      {item.lastMessageTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  )}
                </View>
                {item.unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.unreadCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
  },
  chatItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  lastMessage: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  timeText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '700',
  },
  emptyIcon: {
    fontSize: 64,
  },
});

