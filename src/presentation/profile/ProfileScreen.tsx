/**
 * Profile Screen
 * Pure UI - NO business logic
 * Consumes ProfileController state
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useProfileController } from '../../controllers/ProfileController';
import { useAuthController } from '../../controllers/AuthController';
import { CustomButton } from '../../components/CustomButton';
import { Loader } from '../../components/Loader';
import { Colors } from '../../core/theme/colors';
import { Typography } from '../../core/theme/typography';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, isLoading, fetchUserProfile, updateProfileImage } =
    useProfileController();
  const { logout } = useAuthController();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleUpdateImage = async () => {
    try {
      await updateProfileImage();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update image');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  if (isLoading && !user) {
    return <Loader fullScreen message="Loading profile..." />;
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No user data found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={handleUpdateImage}>
          {user.profileImageUrl ? (
            <Image
              source={{ uri: user.profileImageUrl }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone:</Text>
          <Text style={styles.infoValue}>{user.phone}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Blood Group:</Text>
          <Text style={[styles.infoValue, styles.bloodGroup]}>
            {user.bloodGroup}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Gender:</Text>
          <Text style={styles.infoValue}>{user.gender}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Age:</Text>
          <Text style={styles.infoValue}>{user.age} years</Text>
        </View>
      </View>

      <View style={styles.actionsSection}>
        <CustomButton
          title="Edit Profile"
          onPress={() => {
            // TODO: Navigate to EditProfile screen when created
            Alert.alert('Coming Soon', 'Edit profile feature will be available soon');
          }}
          variant="primary"
          size="medium"
          style={styles.actionButton}
        />

        <CustomButton
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          size="medium"
          style={styles.actionButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 24,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  placeholderText: {
    ...Typography.h1,
    color: Colors.primary,
  },
  name: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  email: {
    ...Typography.body1,
    color: Colors.textSecondary,
  },
  infoSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  infoLabel: {
    ...Typography.body1,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  infoValue: {
    ...Typography.body1,
    color: Colors.textSecondary,
  },
  bloodGroup: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  actionsSection: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  errorText: {
    ...Typography.body1,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 40,
  },
});

