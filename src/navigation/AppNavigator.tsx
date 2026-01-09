/**
 * App Navigator
 * Main navigation setup
 * NO business logic - Pure navigation configuration
 */
import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthController } from '../controllers/AuthController';
import { AppRoutes } from '../core/constants/appRoutes';

// Screens
import { LoginScreen } from '../presentation/auth/LoginScreen';
import { SignupScreen } from '../presentation/auth/SignupScreen';
import { OnboardingScreen } from '../presentation/onboarding/OnboardingScreen';
import { HomeScreen } from '../presentation/home/HomeScreen';
import { ChatScreen } from '../presentation/chat/ChatScreen';
import { ChatDetailScreen } from '../presentation/chat/ChatDetailScreen';
import { NotificationsScreen } from '../presentation/notifications/NotificationsScreen';
import { ProfileScreen } from '../presentation/profile/ProfileScreen';
import { BloodRequestScreen } from '../presentation/blood-request/BloodRequestScreen';
import { BloodRequestsListScreen } from '../presentation/blood-request/BloodRequestsListScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator (after login)
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#E53E3E',
        tabBarInactiveTintColor: '#718096',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home Screen',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="BloodRequests"
        component={BloodRequestsListScreen}
        options={{
          title: 'Blood Requests',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🩸</Text>,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💬</Text>,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🔔</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

// Main App Navigator
export const AppNavigator: React.FC = () => {
  const { isAuthenticated, checkAuthState } = useAuthController();
  const [isChecking, setIsChecking] = React.useState(true);

  useEffect(() => {
    const init = async () => {
      await checkAuthState();
      setIsChecking(false);
    };
    init();
  }, []);

  // Log auth state changes
  useEffect(() => {
    console.log('🔍 [AppNavigator] isAuthenticated changed:', isAuthenticated);
  }, [isAuthenticated]);

  if (isChecking) {
    return null; // Or a splash screen
  }

  console.log('🔍 [AppNavigator] Rendering - isAuthenticated:', isAuthenticated);

  return (
    <NavigationContainer key={isAuthenticated ? 'authenticated' : 'unauthenticated'}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="ChatDetail"
              component={ChatDetailScreen}
              options={{
                headerShown: true,
                title: 'Chat',
                headerStyle: { backgroundColor: '#E53E3E' },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name="BloodRequest"
              component={BloodRequestScreen}
              options={{
                headerShown: true,
                title: 'Create Blood Request',
                headerStyle: { backgroundColor: '#E53E3E' },
                headerTintColor: '#fff',
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

