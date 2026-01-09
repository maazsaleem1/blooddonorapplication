/**
 * Custom Input Component
 * Pure UI component - NO business logic
 * Accepts props and renders input field
 */
import React from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TextInputProps,
    ViewStyle,
} from 'react-native';
import { Colors } from '../core/theme/colors';
import { Typography } from '../core/theme/typography';

interface CustomInputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const CustomInput: React.FC<CustomInputProps> = ({
    label,
    error,
    containerStyle,
    leftIcon,
    rightIcon,
    style,
    ...textInputProps
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[styles.inputContainer, error && styles.inputError]}>
                {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
                <TextInput
                    style={[
                        styles.input,
                        leftIcon ? styles.inputWithLeftIcon : null,
                        style,
                    ]}
                    placeholderTextColor={Colors.gray400}
                    {...textInputProps}
                />
                {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        ...Typography.body2,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.gray300,
        borderRadius: 8,
        backgroundColor: Colors.white,
    },
    inputError: {
        borderColor: Colors.error,
    },
    input: {
        flex: 1,
        ...Typography.body1,
        color: Colors.textPrimary,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    inputWithLeftIcon: {
        paddingLeft: 8,
    },
    leftIcon: {
        paddingLeft: 16,
    },
    rightIcon: {
        paddingRight: 16,
    },
    errorText: {
        ...Typography.caption,
        color: Colors.error,
        marginTop: 4,
    },
});

