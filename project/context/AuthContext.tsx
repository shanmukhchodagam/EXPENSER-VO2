import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { signUpWithEmail, signInWithEmail, signOut as firebaseSignOut } from '@/services/authService';
import { AuthState, User } from '@/types';

interface AuthContextType {
  state: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction = 
  | { type: 'SIGN_IN_START' }
  | { type: 'SIGN_IN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'SIGN_IN_FAILURE' }
  | { type: 'SIGN_OUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'RESTORE_TOKEN'; payload: { user: User; token: string } | null };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SIGN_IN_START':
      return { ...state, loading: true };
    case 'SIGN_IN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      };
    case 'SIGN_IN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
      };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case 'RESTORE_TOKEN':
      if (action.payload) {
        return {
          ...state,
          isAuthenticated: true,
          user: action.payload.user,
          token: action.payload.token,
          loading: false,
        };
      }
      return { ...state, loading: false };
    default:
      return state;
  }
};

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // User is signed in
          const user: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            avatar: firebaseUser.photoURL || undefined,
            createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
          };
          
          const token = await firebaseUser.getIdToken();
          
          // Store user data locally
          await SecureStore.setItemAsync('authToken', token);
          await AsyncStorage.setItem('currentUser', JSON.stringify(user));
          
          dispatch({ type: 'RESTORE_TOKEN', payload: { user, token } });
        } catch (error) {
          console.error('Error processing auth state:', error);
          dispatch({ type: 'RESTORE_TOKEN', payload: null });
        }
      } else {
        // User is signed out
        try {
          await SecureStore.deleteItemAsync('authToken');
          await AsyncStorage.removeItem('currentUser');
        } catch (error) {
          console.error('Error clearing auth data:', error);
        }
        dispatch({ type: 'RESTORE_TOKEN', payload: null });
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    dispatch({ type: 'SIGN_IN_START' });
    
    try {
      const { user, token } = await signInWithEmail(email, password);
      
      // Store authentication data locally
      await SecureStore.setItemAsync('authToken', token);
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));

      dispatch({ 
        type: 'SIGN_IN_SUCCESS', 
        payload: { user, token } 
      });
    } catch (error) {
      dispatch({ type: 'SIGN_IN_FAILURE' });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    dispatch({ type: 'SIGN_IN_START' });
    
    try {
      const { user, token } = await signUpWithEmail(email, password, name);
      
      // Store authentication data locally
      await SecureStore.setItemAsync('authToken', token);
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));

      dispatch({ 
        type: 'SIGN_IN_SUCCESS', 
        payload: { user, token } 
      });
    } catch (error) {
      dispatch({ type: 'SIGN_IN_FAILURE' });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut();
      dispatch({ type: 'SIGN_OUT' });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateUser = (user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  return (
    <AuthContext.Provider value={{ state, signIn, signUp, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};