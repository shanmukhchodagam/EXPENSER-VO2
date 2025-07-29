# EXPENSER - Trip Expense Manager

A cross-platform mobile application built with React Native and Expo for managing and splitting expenses during group trips.

## Firebase Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `expenser-app` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. In your Firebase project, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** provider
3. Optionally enable other providers (Google, Apple, etc.)

### 3. Get Configuration Values

1. Go to **Project Settings** (gear icon) > **General**
2. Scroll down to "Your apps" section
3. Click "Add app" and select **Web** (</>) icon
4. Register your app with nickname: `expenser-web`
5. Copy the configuration object

### 4. Update Firebase Configuration

Replace the fake values in `config/firebase.ts` with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  // measurementId: "your-measurement-id" // If using Analytics
};
```

### 5. Security Rules (Optional)

For additional security, you can set up Firestore security rules and configure authentication settings in the Firebase Console.

## Features

- ✅ Firebase Authentication (Email/Password)
- ✅ Trip creation and management
- ✅ Expense tracking and categorization
- ✅ Automatic settlement calculations
- ✅ Offline support with AsyncStorage
- ✅ Real-time data synchronization
- ✅ Invite code system for joining trips
- ✅ Cross-platform compatibility (iOS, Android, Web)

## Authentication Flow

1. **Sign Up**: Users create accounts with email, password, and display name
2. **Sign In**: Existing users authenticate with email and password
3. **Token Management**: Firebase ID tokens are stored securely using Expo SecureStore
4. **Auto-login**: Users remain signed in across app sessions
5. **Sign Out**: Secure logout with token cleanup

## Error Handling

The app includes comprehensive error handling for common authentication scenarios:
- Invalid email format
- Weak passwords
- Email already in use
- User not found
- Network errors
- Too many failed attempts

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Deployment

The app is ready for deployment with:
- EAS Build for native app builds
- Firebase Hosting for web deployment
- Proper environment variable management