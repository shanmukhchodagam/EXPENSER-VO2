import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useTrip } from '@/context/TripContext';
import { TripCard } from '@/components/TripCard';
import { generateInviteCode } from '@/utils/calculations';

export default function TripsScreen() {
  const { state: authState } = useAuth();
  const { trips, createTrip, joinTrip, setCurrentTrip } = useTrip();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [tripName, setTripName] = useState('');
  const [tripDescription, setTripDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateTrip = async () => {
    if (!tripName.trim()) {
      Alert.alert('Error', 'Please enter a trip name');
      return;
    }

    setLoading(true);
    try {
      await createTrip({
        name: tripName.trim(),
        description: tripDescription.trim(),
        inviteCode: generateInviteCode(),
        createdBy: authState.user?.id || '',
        participants: [{
          userId: authState.user?.id || '',
          name: authState.user?.name || '',
          email: authState.user?.email || '',
          joinedAt: new Date(),
          isAdmin: true,
        }],
        expenses: [],
        isActive: true,
      });
      
      setShowCreateModal(false);
      setTripName('');
      setTripDescription('');
      Alert.alert('Success', 'Trip created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTrip = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    setLoading(true);
    try {
      await joinTrip(inviteCode.trim().toUpperCase());
      setShowJoinModal(false);
      setInviteCode('');
      Alert.alert('Success', 'Joined trip successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to join trip. Please check the invite code.');
    } finally {
      setLoading(false);
    }
  };

  const handleTripPress = (trip: any) => {
    setCurrentTrip(trip);
    // TODO: Navigate to trip details
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Trips</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowJoinModal(true)}
          >
            <Ionicons name="enter" size={20} color="#10B981" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerButton, styles.primaryButton]}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {trips.length > 0 ? (
          trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onPress={() => handleTripPress(trip)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="airplane-outline" size={80} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No trips yet</Text>
            <Text style={styles.emptyStateMessage}>
              Create your first trip or join an existing one to get started
            </Text>
            <View style={styles.emptyStateActions}>
              <TouchableOpacity 
                style={styles.emptyActionButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Text style={styles.emptyActionButtonText}>Create Trip</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.emptyActionButton, styles.secondaryAction]}
                onPress={() => setShowJoinModal(true)}
              >
                <Text style={[styles.emptyActionButtonText, styles.secondaryActionText]}>
                  Join Trip
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Create Trip Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Trip</Text>
            <TouchableOpacity onPress={handleCreateTrip} disabled={loading}>
              <Text style={[styles.modalAction, loading && styles.modalActionDisabled]}>
                Create
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Trip Name *</Text>
              <TextInput
                style={styles.textInput}
                value={tripName}
                onChangeText={setTripName}
                placeholder="Enter trip name"
                maxLength={50}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={tripDescription}
                onChangeText={setTripDescription}
                placeholder="Enter trip description (optional)"
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Join Trip Modal */}
      <Modal
        visible={showJoinModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowJoinModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Join Trip</Text>
            <TouchableOpacity onPress={handleJoinTrip} disabled={loading}>
              <Text style={[styles.modalAction, loading && styles.modalActionDisabled]}>
                Join
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Invite Code</Text>
              <TextInput
                style={styles.textInput}
                value={inviteCode}
                onChangeText={setInviteCode}
                placeholder="Enter 6-character code"
                maxLength={6}
                autoCapitalize="characters"
              />
              <Text style={styles.inputHint}>
                Enter the 6-character invite code shared by the trip organizer
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  primaryButton: {
    backgroundColor: '#10B981',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 12,
  },
  emptyStateMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  emptyStateActions: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyActionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#10B981',
    borderRadius: 12,
  },
  secondaryAction: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  emptyActionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActionText: {
    color: '#10B981',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  modalActionDisabled: {
    opacity: 0.5,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
});