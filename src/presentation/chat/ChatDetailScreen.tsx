/**
 * Chat Detail Screen
 * Pure UI - NO business logic
 * Consumes ChatController for messages
 */
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useChatController } from '../../controllers/ChatController';
import { CustomButton } from '../../components/CustomButton';
import { Loader } from '../../components/Loader';
import { Colors } from '../../core/theme/colors';
import { Typography } from '../../core/theme/typography';
import { AuthService } from '../../data/firebase/authService';
import { Message } from '../../domain/models/Chat';

interface ChatDetailScreenProps {
  route: any;
  navigation: any;
}

export const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { chatId, otherUserId } = route.params || {};
  const { messages, sendMessage, subscribeToMessages } = useChatController();
  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    AuthService.getCurrentUserId().then(setCurrentUserId);
  }, []);

  useEffect(() => {
    if (!chatId) {
      console.error('❌ [ChatDetailScreen] No chatId provided');
      return;
    }
    console.log('🔍 [ChatDetailScreen] Subscribing to messages for chat:', chatId);
    const unsubscribe = subscribeToMessages(chatId);
    return unsubscribe;
  }, [chatId]);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim() || !chatId) return;

    try {
      console.log('🔍 [ChatDetailScreen] Sending message:', messageText.trim());
      await sendMessage(chatId, messageText.trim());
      setMessageText('');
      console.log('✅ [ChatDetailScreen] Message sent successfully');
    } catch (err: any) {
      console.error('❌ [ChatDetailScreen] Failed to send message:', err);
      alert(err.message || 'Failed to send message');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === currentUserId;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myBubble : styles.otherBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText,
            ]}
          >
            {item.text}
          </Text>
          <Text style={styles.messageTime}>
            {item.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No messages yet. Start the conversation!</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          placeholderTextColor={Colors.gray400}
          multiline
        />
        <CustomButton
          title="Send"
          onPress={handleSend}
          variant="primary"
          size="small"
          disabled={!messageText.trim()}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: Colors.primary,
  },
  otherBubble: {
    backgroundColor: Colors.gray200,
  },
  messageText: {
    ...Typography.body1,
    marginBottom: 4,
  },
  myMessageText: {
    color: Colors.white,
  },
  otherMessageText: {
    color: Colors.textPrimary,
  },
  messageTime: {
    ...Typography.caption,
    color: Colors.gray500,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    ...Typography.body1,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    ...Typography.body1,
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
});

