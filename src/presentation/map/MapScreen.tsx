/**
 * Map Screen
 * Pure UI - NO business logic
 * Displays map with donor markers
 */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useHomeController } from '../../controllers/HomeController';
import { useLocationController } from '../../controllers/LocationController';
import { Loader } from '../../components/Loader';
import { Colors } from '../../core/theme/colors';
import { AppConstants } from '../../core/constants/appConstants';

interface MapScreenProps {
    navigation: any;
}

export const MapScreen: React.FC<MapScreenProps> = ({ navigation }) => {
    const { filteredDonors } = useHomeController();
    const { currentLocation, getCurrentLocation } = useLocationController();
    const [mapRegion, setMapRegion] = useState<Region>({
        latitude: AppConstants.MAP.DEFAULT_LATITUDE,
        longitude: AppConstants.MAP.DEFAULT_LONGITUDE,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });

    useEffect(() => {
        if (!currentLocation) {
            getCurrentLocation().then((location) => {
                setMapRegion({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                });
            });
        } else {
            setMapRegion({
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            });
        }
    }, [currentLocation, getCurrentLocation]);

    if (!currentLocation) {
        return <Loader fullScreen message="Loading map..." />;
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                region={mapRegion}
                onRegionChangeComplete={setMapRegion}
                showsUserLocation
                showsMyLocationButton
            >
                {/* Current User Location */}
                {currentLocation && (
                    <Marker
                        coordinate={{
                            latitude: currentLocation.latitude,
                            longitude: currentLocation.longitude,
                        }}
                        title="Your Location"
                        pinColor={Colors.primary}
                    />
                )}

                {/* Donor Markers */}
                {filteredDonors.map((donor) => (
                    <Marker
                        key={donor.id}
                        coordinate={{
                            latitude: donor.location.latitude,
                            longitude: donor.location.longitude,
                        }}
                        title={donor.name}
                        description={`${donor.bloodGroup} - ${donor.availability}`}
                        pinColor={donor.availability === 'Available' ? Colors.success : Colors.warning}
                    />
                ))}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
});

