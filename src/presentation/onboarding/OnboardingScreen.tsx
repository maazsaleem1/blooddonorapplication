/**
 * Onboarding Screen
 * Pure UI - NO business logic
 * Consumes OnboardingController state
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useOnboardingController } from '../../controllers/OnboardingController';
import { CustomButton } from '../../components/CustomButton';
import { Colors } from '../../core/theme/colors';
import { Typography } from '../../core/theme/typography';

interface OnboardingScreenProps {
    navigation: any;
}

const { width } = Dimensions.get('window');

const onboardingPages = [
    {
        title: 'Welcome to Blood Donation',
        description: 'Help save lives by connecting donors with those in need.',
        icon: '🩸',
    },
    {
        title: 'Find Nearby Donors',
        description: 'Discover blood donors in your area and connect instantly.',
        icon: '📍',
    },
    {
        title: 'Real-time Chat',
        description: 'Communicate directly with donors and requesters.',
        icon: '💬',
    },
    {
        title: 'Emergency Alerts',
        description: 'Get notified about urgent blood requests in your area.',
        icon: '🚨',
    },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
    navigation,
}) => {
    const { currentPage, nextPage, previousPage, completeOnboarding } =
        useOnboardingController();

    const handleNext = async () => {
        if (currentPage < onboardingPages.length - 1) {
            nextPage();
        } else {
            await completeOnboarding();
            navigation.replace('Login');
        }
    };

    const handleSkip = async () => {
        await completeOnboarding();
        navigation.replace('Login');
    };

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEnabled={false}
                ref={(ref) => {
                    if (ref) {
                        ref.scrollTo({ x: currentPage * width, animated: true });
                    }
                }}
            >
                {onboardingPages.map((page, index) => (
                    <View key={index} style={[styles.page, { width }]}>
                        <Text style={styles.icon}>{page.icon}</Text>
                        <Text style={styles.title}>{page.title}</Text>
                        <Text style={styles.description}>{page.description}</Text>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.dots}>
                    {onboardingPages.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === currentPage && styles.dotActive,
                            ]}
                        />
                    ))}
                </View>

                <View style={styles.buttons}>
                    {currentPage > 0 && (
                        <CustomButton
                            title="Previous"
                            onPress={previousPage}
                            variant="outline"
                            size="medium"
                            style={styles.button}
                        />
                    )}

                    <CustomButton
                        title={currentPage === onboardingPages.length - 1 ? 'Get Started' : 'Next'}
                        onPress={handleNext}
                        variant="primary"
                        size="medium"
                        style={styles.button}
                    />
                </View>

                <CustomButton
                    title="Skip"
                    onPress={handleSkip}
                    variant="outline"
                    size="small"
                    style={styles.skipButton}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    page: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    icon: {
        fontSize: 80,
        marginBottom: 32,
    },
    title: {
        ...Typography.h1,
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        ...Typography.body1,
        color: Colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
    },
    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.gray300,
        marginHorizontal: 4,
    },
    dotActive: {
        backgroundColor: Colors.primary,
        width: 24,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 16,
    },
    button: {
        flex: 1,
    },
    skipButton: {
        alignSelf: 'center',
    },
});

