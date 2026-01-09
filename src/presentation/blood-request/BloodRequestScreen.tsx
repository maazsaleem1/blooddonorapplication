/**
 * Blood Request Screen
 * Pure UI - NO business logic
 * Creates blood requests
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocationController } from '../../controllers/LocationController';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { Loader } from '../../components/Loader';
import { Colors } from '../../core/theme/colors';
import { Typography } from '../../core/theme/typography';
import { AppConstants } from '../../core/constants/appConstants';
import { FirestoreService } from '../../data/firebase/firestoreService';
import { AuthService } from '../../data/firebase/authService';
import { BloodRequestData } from '../../domain/models/BloodRequest';

interface BloodRequestScreenProps {
    navigation: any;
    route?: any;
}

export const BloodRequestScreen: React.FC<BloodRequestScreenProps> = ({
    navigation,
    route,
}) => {
    const donorId = route?.params?.donorId;
    console.log('🔍 [BloodRequestScreen] donorId from route:', donorId);
    const { currentLocation, getCurrentLocation } = useLocationController();
    const [bloodGroup, setBloodGroup] = useState('A+');
    const [urgency, setUrgency] = useState<'Low' | 'Medium' | 'Emergency'>('Medium');
    const [hospital, setHospital] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    React.useEffect(() => {
        if (!currentLocation) {
            getCurrentLocation();
        }
    }, []);

    const handleSubmit = async () => {
        if (!hospital.trim()) {
            Alert.alert('Error', 'Please enter hospital name');
            return;
        }

        if (!currentLocation) {
            Alert.alert('Error', 'Please enable location services');
            return;
        }

        setIsSubmitting(true);

        try {
            const userId = await AuthService.getCurrentUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const user = await FirestoreService.getUser(userId);
            if (!user) {
                throw new Error('User data not found');
            }

            const requestId = `request_${userId}_${Date.now()}`;
            const requestData: BloodRequestData = {
                bloodGroup,
                urgency,
                hospital: hospital.trim(),
                location: currentLocation,
                notes: notes.trim() || undefined,
            };

            const bloodRequest = {
                id: requestId,
                requesterId: userId,
                requesterName: user.name,
                ...requestData,
                status: 'Pending' as const,
                sentTo: donorId || undefined, // Store recipient ID if request was sent to specific donor
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            console.log('🔍 [BloodRequestScreen] Saving request with sentTo:', bloodRequest.sentTo);
            await FirestoreService.saveBloodRequest(bloodRequest);

            Alert.alert('Success', 'Blood request created successfully!', [
                {
                    text: 'OK',
                    onPress: () => {
                        // Reset form
                        setHospital('');
                        setNotes('');
                        navigation.goBack();
                    },
                },
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create request');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitting) {
        return <Loader fullScreen message="Submitting request..." />;
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Create Blood Request</Text>
                    <Text style={styles.subtitle}>Request blood from nearby donors</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.pickerContainer}>
                        <Text style={styles.label}>Blood Group Required</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={bloodGroup}
                                onValueChange={(itemValue) => setBloodGroup(itemValue)}
                                style={styles.picker}
                            >
                                {AppConstants.BLOOD_GROUPS.map((group) => (
                                    <Picker.Item key={group} label={group} value={group} />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.pickerContainer}>
                        <Text style={styles.label}>Urgency Level</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={urgency}
                                onValueChange={(itemValue) => setUrgency(itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Low" value="Low" />
                                <Picker.Item label="Medium" value="Medium" />
                                <Picker.Item label="Emergency" value="Emergency" />
                            </Picker>
                        </View>
                    </View>

                    <CustomInput
                        label="Hospital Name"
                        value={hospital}
                        onChangeText={setHospital}
                        placeholder="Enter hospital name"
                    />

                    <CustomInput
                        label="Notes (Optional)"
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Additional information"
                        multiline
                        numberOfLines={4}
                    />

                    <CustomButton
                        title="Submit Request"
                        onPress={handleSubmit}
                        variant="primary"
                        size="large"
                        style={styles.submitButton}
                        disabled={!hospital.trim() || !currentLocation}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 40,
    },
    header: {
        marginBottom: 32,
        alignItems: 'center',
    },
    title: {
        ...Typography.h1,
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    subtitle: {
        ...Typography.body1,
        color: Colors.textSecondary,
    },
    form: {
        width: '100%',
    },
    pickerContainer: {
        marginBottom: 16,
    },
    label: {
        ...Typography.body2,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: Colors.gray300,
        borderRadius: 8,
        backgroundColor: Colors.white,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    submitButton: {
        marginTop: 8,
    },
});

