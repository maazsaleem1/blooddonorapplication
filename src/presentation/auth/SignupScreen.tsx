/**
 * Signup Screen
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
import { Picker } from '@react-native-picker/picker';
import { useAuthController } from '../../controllers/AuthController';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { Loader } from '../../components/Loader';
import { Colors } from '../../core/theme/colors';
import { Typography } from '../../core/theme/typography';
import { AppConstants } from '../../core/constants/appConstants';

interface SignupScreenProps {
  navigation: any;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const { register, isLoading, error, clearError } = useAuthController();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    clearError();
  }, []);

  const handleSignup = async () => {
    console.log('🔍 [SignupScreen] handleSignup called');
    try {
      await register({
        email,
        password,
        name,
        phone,
        bloodGroup,
        gender,
        age: parseInt(age) || 0,
      });
      console.log('✅ [SignupScreen] Registration successful, waiting for navigation...');
      // Navigation handled by auth state change
    } catch (err: any) {
      console.error('❌ [SignupScreen] Registration error:', err);
      // Error handled by controller
    }
  };

  if (isLoading) {
    return <Loader fullScreen message="Creating account..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <View style={styles.form}>
          <CustomInput
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            error={error || undefined}
          />

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
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            error={error || undefined}
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Blood Group</Text>
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
            <Text style={styles.label}>Gender</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={gender}
                onValueChange={(itemValue) => setGender(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>
          </View>

          <CustomInput
            label="Age"
            value={age}
            onChangeText={setAge}
            placeholder="Enter your age"
            keyboardType="numeric"
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
            title="Sign Up"
            onPress={handleSignup}
            variant="primary"
            size="large"
            style={styles.signupButton}
            disabled={!name || !email || !phone || !password || !age}
          />

          <CustomButton
            title="Already have an account? Login"
            onPress={() => navigation.navigate('Login')}
            variant="outline"
            size="medium"
            style={styles.loginButton}
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
  signupButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
  },
});

