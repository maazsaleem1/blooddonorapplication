/**
 * Donor Card Component
 * Pure UI component - NO business logic
 * Displays donor information in a card format
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Donor } from '../domain/models/Donor';
import { Colors } from '../core/theme/colors';
import { Typography } from '../core/theme/typography';
import { formatDistance } from '../core/utils/distanceCalculator';
import { CustomButton } from './CustomButton';

interface DonorCardProps {
  donor: Donor;
  onPress?: () => void;
  onMessagePress?: () => void;
  onRequestPress?: () => void;
  showDistance?: boolean;
}

export const DonorCard: React.FC<DonorCardProps> = ({
  donor,
  onPress,
  onMessagePress,
  onRequestPress,
  showDistance = true,
}) => {
  const getAvailabilityColor = () => {
    switch (donor.availability) {
      case 'Available':
        return Colors.success;
      case 'Busy':
        return Colors.warning;
      case 'Unavailable':
        return Colors.gray400;
      default:
        return Colors.gray400;
    }
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.cardContent}
      >
        {/* Profile Image */}
        <View style={styles.imageContainer}>
          {donor.profileImageUrl ? (
            <Image
              source={{ uri: donor.profileImageUrl }}
              style={styles.image}
            />
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>
                {donor.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Donor Info */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{donor.name}</Text>
            <View
              style={[
                styles.availabilityBadge,
                { backgroundColor: getAvailabilityColor() },
              ]}
            >
              <Text style={styles.availabilityText}>
                {donor.availability}
              </Text>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.bloodGroupBadge}>
              <Text style={styles.bloodGroupText}>{donor.bloodGroup}</Text>
            </View>

            {showDistance && donor.distance !== undefined && (
              <Text style={styles.distance}>
                {formatDistance(donor.distance)}
              </Text>
            )}
          </View>

          {donor.lastDonationDate && (
            <Text style={styles.lastDonation}>
              Last donation: {donor.lastDonationDate.toLocaleDateString()}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        {onRequestPress && (
          <CustomButton
            title="Request"
            onPress={onRequestPress}
            variant="primary"
            size="small"
          />
        )}
        {onMessagePress && (
          <CustomButton
            title="Message"
            onPress={onMessagePress}
            variant="outline"
            size="small"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
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
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    marginRight: 12,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  placeholderImage: {
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    ...Typography.h3,
    color: Colors.primary,
  },
  infoContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginRight: 8,
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  availabilityText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bloodGroupBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
  },
  bloodGroupText: {
    ...Typography.body2,
    color: Colors.white,
    fontWeight: '700',
  },
  distance: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  lastDonation: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
});

