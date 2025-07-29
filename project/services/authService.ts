import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile,
  User as FirebaseUser,
  AuthError
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { User } from '@/types';

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthError extends Error {
  code: string;
}

// Convert Firebase user to our User type
const convertFirebaseUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    avatar: firebaseUser.photoURL || undefined,
    createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
  };
};

// Get user's ID token for API authentication
const getUserToken = async (firebaseUser: FirebaseUser): Promise<string> => {
  try {
    return await firebaseUser.getIdToken();
  } catch (error) {
    console.error('Error getting user token:', error);
    throw new Error('Failed to get authentication token');
  }
};

// Sign up with email and password
export const signUpWithEmail = async (
  email: string, 
  password: string, 
  name: string
): Promise<AuthResponse> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Update the user's display name
    await updateProfile(firebaseUser, {
      displayName: name
    });
    
    const user = convertFirebaseUser(firebaseUser);
    const token = await getUserToken(firebaseUser);
    
    return { user, token };
  } catch (error: any) {
    console.error('Sign up error:', error);
    throw handleAuthError(error);
  }
};

// Sign in with email and password
export const signInWithEmail = async (
  email: string, 
  password: string
): Promise<AuthResponse> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    const user = convertFirebaseUser(firebaseUser);
    const token = await getUserToken(firebaseUser);
    
    return { user, token };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw handleAuthError(error);
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error('Failed to sign out');
  }
};

// Handle Firebase Auth errors with user-friendly messages
const handleAuthError = (error: any): Error => {
  let message = 'An authentication error occurred';
  
  switch (error.code) {
    case 'auth/email-already-in-use':
      message = 'An account with this email already exists';
      break;
    case 'auth/weak-password':
      message = 'Password should be at least 6 characters';
      break;
    case 'auth/invalid-email':
      message = 'Please enter a valid email address';
      break;
    case 'auth/user-not-found':
      message = 'No account found with this email';
      break;
    case 'auth/wrong-password':
      message = 'Incorrect password';
      break;
    case 'auth/too-many-requests':
      message = 'Too many failed attempts. Please try again later';
      break;
    case 'auth/network-request-failed':
      message = 'Network error. Please check your connection';
      break;
    case 'auth/invalid-credential':
      message = 'Invalid email or password';
      break;
    default:
      message = error.message || 'Authentication failed';
  }
  
  const authError = new Error(message) as AuthError;
  authError.code = error.code;
  return authError;
};

// Get current user token (for API calls)
export const getCurrentUserToken = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (user) {
      return await getUserToken(user);
    }
    return null;
  } catch (error) {
    console.error('Error getting current user token:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!auth.currentUser;
};