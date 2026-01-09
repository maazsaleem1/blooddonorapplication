/**
 * Notifications Screen
 * Pure UI - NO business logic
 * Consumes NotificationController state
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNotificationController } from '../../controllers/NotificationController';
import { Loader } from '../../components/Loader';
import { EmptyState } from '../../components/EmptyState';
import { Colors } from '../../core/theme/colors';
import { Typography } from '../../core/theme/typography';

interface NotificationsScreenProps {
  navigation: any;
}

// Mock notification data
const mockNotifications = [
  {
    id: '1',
    title: 'New Blood Request',
    message: 'Emergency blood request for O+ in your area',
    time: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    title: 'New Message',
    message: 'You have a new message from John Doe',
    time: '5 hours ago',
    read: false,
  },
];

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  navigation,
}) => {
  const { notifications, isLoading } = useNotificationController();

  if (isLoading) {
    return <Loader fullScreen message="Loading notifications..." />;
  }

  const displayNotifications = notifications.length > 0 ? notifications : mockNotifications;

  if (displayNotifications.length === 0) {
    return (
      <EmptyState
        title="No notifications"
        message="You're all caught up!"
        icon={<Text style={styles.emptyIcon}>🔔</Text>}
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={displayNotifications}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <TouchableOpacity
            style={[styles.notificationItem, !item.read && styles.unread]}
          >
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationMessage}>{item.message}</Text>
              <Text style={styles.notificationTime}>{item.time}</Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
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
  notificationItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unread: {
    backgroundColor: Colors.gray50,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  notificationMessage: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  notificationTime: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: 12,
  },
  emptyIcon: {
    fontSize: 64,
  },
});

