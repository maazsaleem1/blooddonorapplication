/**
 * Login Screen
 * Pure UI - NO business logic
 * Consumes AuthController state and actions
 */
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useAuthController } from '../../controllers/AuthController';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { Loader } from '../../components/Loader';
import { Colors } from '../../core/theme/colors';
import { Typography } from '../../core/theme/typography';
import { AppRoutes } from '../../core/constants/appRoutes';

interface LoginScreenProps {
    navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    const { login, isLoading, error, clearError } = useAuthController();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        clearError();
    }, []);

    const handleLogin = async () => {
        try {
            await login({ email, password });
            // Navigation handled by auth state change
        } catch (err) {
            // Error handled by controller
        }
    };

    if (isLoading) {
        return <Loader fullScreen message="Logging in..." />;
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Login to continue</Text>
                </View>

                <View style={styles.form}>
                    <CustomInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={error || undefined}
                    />

                    <CustomInput
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        secureTextEntry
                        error={error || undefined}
                    />

                    <CustomButton
                        title="Login"
                        onPress={handleLogin}
                        variant="primary"
                        size="large"
                        style={styles.loginButton}
                        disabled={!email || !password}
                    />

                    <CustomButton
                        title="Don't have an account? Sign Up"
                        onPress={() => navigation.navigate('Signup')}
                        variant="outline"
                        size="medium"
                        style={styles.signupButton}
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
        justifyContent: 'center',
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
    loginButton: {
        marginTop: 8,
        marginBottom: 16,
    },
    signupButton: {
        marginTop: 8,
    },
});

