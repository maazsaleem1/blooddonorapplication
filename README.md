# Blood Donation Mobile Application

A production-ready Blood Donation Mobile Application built with **React Native + Expo** and **Firebase**, following **Clean Architecture** principles with strict separation of concerns.

## 🏗️ Architecture

This app follows **Clean Architecture** with Controller-Driven Logic:

- **Presentation Layer**: Pure UI components and screens (NO business logic)
- **Controllers**: All business logic (using Zustand for state management)
- **Domain Layer**: Models and entities
- **Data Layer**: Firebase services (Auth, Firestore, Storage, Notifications)
- **Core Layer**: Constants, theme, utilities, configuration

### ✅ Architecture Rules

- ❌ **NO** Firebase logic inside UI
- ❌ **NO** business logic inside screens/components
- ❌ **NO** calculations (distance, filters) inside UI
- ✅ **ALL** logic goes inside Controllers
- ✅ UI only consumes controller state
- ✅ Reusable components are pure UI

## 📂 Project Structure

```
src/
├── core/
│   ├── constants/        # App constants and routes
│   ├── theme/            # Colors and typography
│   ├── utils/            # Utility functions (distance calculator, etc.)
│   └── config/           # Firebase configuration
│
├── data/
│   ├── firebase/         # Firebase services (auth, firestore, storage, notifications)
│   └── services/         # Other services (location)
│
├── domain/
│   └── models/           # Domain models (User, Donor, Chat, BloodRequest)
│
├── controllers/          # Business logic controllers (Zustand stores)
│   ├── AuthController.ts
│   ├── HomeController.ts
│   ├── LocationController.ts
│   ├── ChatController.ts
│   └── ...
│
├── components/           # Reusable UI components (pure, no logic)
│   ├── CustomButton.tsx
│   ├── CustomInput.tsx
│   ├── DonorCard.tsx
│   └── ...
│
├── presentation/         # UI Screens (pure, consume controllers)
│   ├── auth/
│   ├── home/
│   ├── map/
│   └── ...
│
└── navigation/           # Navigation setup
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Expo CLI
- Firebase account
- Android Studio / Xcode (for emulators)

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up Firebase:**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Enable Firebase Storage
   - Enable Cloud Messaging
   - Copy your Firebase config

3. **Configure Firebase:**
   - Update `src/core/config/firebaseConfig.ts` with your Firebase credentials
   - Or use environment variables:
     ```bash
     EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
     EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
     EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
     EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
     EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
     EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
     ```

4. **Start the app:**
```bash
npm start
```

## 📱 Features

### ✅ Authentication
- Email/Password registration and login
- Session management
- Password reset

### ✅ User Profile
- Profile creation with blood group, age, gender
- Profile image upload
- Location selection via map

### ✅ Home Screen
- Nearby donors list
- Distance calculation (Haversine formula)
- Filter by blood group and distance (500m, 1km, 3km, 5km)
- Real-time donor updates

### ✅ Map View
- Google Maps integration
- Donor markers
- Current location tracking

### ✅ Chat System
- One-to-one real-time chat
- Message send/receive
- Firestore real-time listeners

### ✅ Notifications
- Firebase Cloud Messaging (FCM)
- Push notifications for:
  - New blood requests
  - New chat messages
  - Nearby emergencies

### ✅ Blood Requests
- Create blood requests
- Urgency levels (Low, Medium, Emergency)
- Nearby donor notifications

## 🛠️ Tech Stack

- **React Native** + **Expo** (SDK 54)
- **TypeScript** (for type safety)
- **Firebase**:
  - Authentication
  - Firestore (Database)
  - Storage (Images)
  - Cloud Messaging (Notifications)
- **Zustand** (State Management)
- **React Navigation** (Navigation)
- **Expo Location** (Location services)
- **React Native Maps** (Maps)

## 📝 Code Structure

### Controllers (Business Logic)

All business logic is in controllers using Zustand:

```typescript
// Example: HomeController
export const useHomeController = create<HomeController>((set, get) => ({
  donors: [],
  fetchDonors: async () => {
    // Business logic here
  },
  filterDonors: (options) => {
    // Filtering logic here
  },
}));
```

### UI Components (Pure)

UI components only accept props and render:

```typescript
// Example: CustomButton
export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant,
  // ... props only
}) => {
  // Pure UI rendering - NO logic
};
```

### Screens (Consume Controllers)

Screens consume controller state and actions:

```typescript
// Example: HomeScreen
export const HomeScreen: React.FC = () => {
  const { donors, fetchDonors } = useHomeController();
  // UI only - consumes controller state
};
```

## 🔧 Development

### Running on Device

1. Install Expo Go app on your device
2. Scan QR code from terminal
3. Or use emulator:
   - Android: `npm run android`
   - iOS: `npm run ios`

### Building for Production

```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

## 📄 License

This project is for educational purposes.

## 🤝 Contributing

This is a production-ready template following Clean Architecture. Feel free to extend and customize according to your needs.

---

**Built with ❤️ following Clean Architecture principles**
