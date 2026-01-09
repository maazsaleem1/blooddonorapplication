/**
 * Home Screen
 * Pure UI - NO business logic
 * Consumes HomeController and LocationController state
 */
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
} from 'react-native';
import { useHomeController } from '../../controllers/HomeController';
import { useLocationController } from '../../controllers/LocationController';
import { DonorCard } from '../../components/DonorCard';
import { Loader } from '../../components/Loader';
import { EmptyState } from '../../components/EmptyState';
import { CustomButton } from '../../components/CustomButton';
import { Colors } from '../../core/theme/colors';
import { Typography } from '../../core/theme/typography';

interface HomeScreenProps {
    navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const {
        filteredDonors,
        isLoading,
        error,
        fetchDonors,
        setCurrentUserLocation,
        subscribeToDonors,
    } = useHomeController();

    const {
        getCurrentLocation,
        currentLocation,
    } = useLocationController();

    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        // Get user location and save to Firestore
        getCurrentLocation()
            .then(async (location) => {
                setCurrentUserLocation(location);

                // Save location to Firestore for current user
                try {
                    const { FirestoreService } = await import('../../data/firebase/firestoreService');
                    const { AuthService } = await import('../../data/firebase/authService');
                    const userId = await AuthService.getCurrentUserId();
                    if (userId) {
                        await FirestoreService.saveUser(userId, {
                            availability: 'Available',
                        });
                        console.log('✅ [HomeScreen] Location saved to Firestore');
                    }
                } catch (error) {
                    console.error('❌ [HomeScreen] Failed to save location to Firestore:', error);
                }
            })
            .catch((error) => {
                console.error('❌ [HomeScreen] Failed to get location:', error);
            });

        // Fetch donors
        fetchDonors();

        // Subscribe to real-time updates
        const unsubscribe = subscribeToDonors();
        return unsubscribe;
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDonors();
        setRefreshing(false);
    };

    const handleDonorPress = (donorId: string) => {
        // Navigate to blood request screen
        navigation.navigate('BloodRequest', { donorId });
    };

    const handleRequestPress = (donorId: string) => {
        // Navigate to create blood request screen
        navigation.navigate('BloodRequest', { donorId });
    };

    if (isLoading && filteredDonors.length === 0) {
        return <Loader fullScreen message="Loading donors..." />;
    }

    return (
        <View style={styles.container}>
            {/* Donors List */}
            {filteredDonors.length === 0 ? (
                <EmptyState
                    title="No donors found"
                    message="Try adjusting your filters or check back later"
                    icon={<Text style={styles.emptyIcon}>🩸</Text>}
                />
            ) : (
                <FlatList
                    data={filteredDonors}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <DonorCard
                            donor={item}
                            onPress={() => handleDonorPress(item.id)}
                            onRequestPress={() => handleRequestPress(item.id)}
                            showDistance={!!currentLocation}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}
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
    emptyIcon: {
        fontSize: 64,
    },
});

