import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip, Expense, Settlement } from '@/types';
import { calculateSettlements } from '@/utils/calculations';

interface TripContextType {
  trips: Trip[];
  currentTrip: Trip | null;
  loading: boolean;
  createTrip: (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  joinTrip: (inviteCode: string) => Promise<void>;
  setCurrentTrip: (trip: Trip | null) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  getSettlements: (tripId: string) => Settlement[];
  syncTrips: () => Promise<void>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

type TripAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TRIPS'; payload: Trip[] }
  | { type: 'ADD_TRIP'; payload: Trip }
  | { type: 'UPDATE_TRIP'; payload: Trip }
  | { type: 'SET_CURRENT_TRIP'; payload: Trip | null }
  | { type: 'ADD_EXPENSE'; payload: { tripId: string; expense: Expense } };

interface TripState {
  trips: Trip[];
  currentTrip: Trip | null;
  loading: boolean;
}

const tripReducer = (state: TripState, action: TripAction): TripState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_TRIPS':
      return { ...state, trips: action.payload };
    case 'ADD_TRIP':
      return { ...state, trips: [...state.trips, action.payload] };
    case 'UPDATE_TRIP':
      return {
        ...state,
        trips: state.trips.map(trip => 
          trip.id === action.payload.id ? action.payload : trip
        ),
        currentTrip: state.currentTrip?.id === action.payload.id 
          ? action.payload 
          : state.currentTrip,
      };
    case 'SET_CURRENT_TRIP':
      return { ...state, currentTrip: action.payload };
    case 'ADD_EXPENSE':
      return {
        ...state,
        trips: state.trips.map(trip =>
          trip.id === action.payload.tripId
            ? { ...trip, expenses: [...trip.expenses, action.payload.expense] }
            : trip
        ),
        currentTrip: state.currentTrip?.id === action.payload.tripId
          ? { ...state.currentTrip, expenses: [...state.currentTrip.expenses, action.payload.expense] }
          : state.currentTrip,
      };
    default:
      return state;
  }
};

const initialState: TripState = {
  trips: [],
  currentTrip: null,
  loading: false,
};

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  useEffect(() => {
    loadTripsFromStorage();
  }, []);

  const loadTripsFromStorage = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const tripsString = await AsyncStorage.getItem('trips');
      if (tripsString) {
        const trips = JSON.parse(tripsString);
        dispatch({ type: 'SET_TRIPS', payload: trips });
      }
    } catch (error) {
      console.error('Error loading trips from storage:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveTripsToStorage = async (trips: Trip[]) => {
    try {
      await AsyncStorage.setItem('trips', JSON.stringify(trips));
    } catch (error) {
      console.error('Error saving trips to storage:', error);
    }
  };

  const createTrip = async (tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // TODO: Replace with actual API call
      const newTrip: Trip = {
        ...tripData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dispatch({ type: 'ADD_TRIP', payload: newTrip });
      const updatedTrips = [...state.trips, newTrip];
      await saveTripsToStorage(updatedTrips);
    } catch (error) {
      console.error('Error creating trip:', error);
      throw error;
    }
  };

  const joinTrip = async (inviteCode: string) => {
    try {
      // TODO: Replace with actual API call
      // const trip = await tripAPI.joinTrip(inviteCode);
      
      // Mock trip for now
      const mockTrip: Trip = {
        id: Date.now().toString(),
        name: 'Joined Trip',
        inviteCode,
        createdBy: 'other-user',
        participants: [],
        expenses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      dispatch({ type: 'ADD_TRIP', payload: mockTrip });
      const updatedTrips = [...state.trips, mockTrip];
      await saveTripsToStorage(updatedTrips);
    } catch (error) {
      console.error('Error joining trip:', error);
      throw error;
    }
  };

  const setCurrentTrip = (trip: Trip | null) => {
    dispatch({ type: 'SET_CURRENT_TRIP', payload: trip });
  };

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newExpense: Expense = {
        ...expenseData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dispatch({ 
        type: 'ADD_EXPENSE', 
        payload: { tripId: expenseData.tripId, expense: newExpense } 
      });

      // Update storage
      const updatedTrips = state.trips.map(trip =>
        trip.id === expenseData.tripId
          ? { ...trip, expenses: [...trip.expenses, newExpense] }
          : trip
      );
      await saveTripsToStorage(updatedTrips);
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };

  const getSettlements = (tripId: string): Settlement[] => {
    const trip = state.trips.find(t => t.id === tripId);
    if (!trip) return [];
    
    return calculateSettlements(trip.expenses, trip.participants);
  };

  const syncTrips = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // TODO: Implement real-time sync with backend
      // const trips = await tripAPI.syncTrips();
      // dispatch({ type: 'SET_TRIPS', payload: trips });
    } catch (error) {
      console.error('Error syncing trips:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <TripContext.Provider value={{
      trips: state.trips,
      currentTrip: state.currentTrip,
      loading: state.loading,
      createTrip,
      joinTrip,
      setCurrentTrip,
      addExpense,
      getSettlements,
      syncTrips,
    }}>
      {children}
    </TripContext.Provider>
  );
}

export const useTrip = () => {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};