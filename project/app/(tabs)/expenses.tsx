import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useTrip } from '@/context/TripContext';
import { ExpenseCard } from '@/components/ExpenseCard';
import { SettlementCard } from '@/components/SettlementCard';
import { ExpenseCategory } from '@/types';

export default function ExpensesScreen() {
  const { state: authState } = useAuth();
  const { trips, currentTrip, addExpense, getSettlements } = useTrip();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [selectedTripId, setSelectedTripId] = useState('');
  const [loading, setLoading] = useState(false);

  const activeTrip = currentTrip || trips.find(trip => trip.isActive);
  const allExpenses = trips.flatMap(trip => 
    trip.expenses.map(expense => ({ ...expense, tripName: trip.name, participants: trip.participants }))
  );
  const settlements = activeTrip ? getSettlements(activeTrip.id) : [];

  const handleAddExpense = async () => {
    const tripId = selectedTripId || activeTrip?.id;
    
    if (!description.trim() || !amount || !tripId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const trip = trips.find(t => t.id === tripId);
    if (!trip) {
      Alert.alert('Error', 'Selected trip not found');
      return;
    }

    setLoading(true);
    try {
      await addExpense({
        tripId,
        description: description.trim(),
        amount: numericAmount,
        currency: 'USD',
        category,
        paidBy: authState.user?.id || '',
        splitAmong: trip.participants.map(p => p.userId),
        splitType: 'equal',
      });
      
      setShowAddModal(false);
      setDescription('');
      setAmount('');
      setCategory('food');
      setSelectedTripId('');
      Alert.alert('Success', 'Expense added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
          disabled={trips.length === 0}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {activeTrip && settlements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settlements</Text>
            <Text style={styles.sectionSubtitle}>Who owes whom</Text>
            {settlements.map((settlement, index) => (
              <SettlementCard
                key={`${settlement.fromUserId}-${settlement.toUserId}-${index}`}
                settlement={settlement}
                participants={activeTrip.participants}
              />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          {allExpenses.length > 0 ? (
            allExpenses
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  participants={expense.participants}
                />
              ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={60} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>No expenses yet</Text>
              <Text style={styles.emptyStateMessage}>
                {trips.length === 0 
                  ? 'Create a trip first to start adding expenses'
                  : 'Add your first expense to get started'
                }
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Expense</Text>
            <TouchableOpacity onPress={handleAddExpense} disabled={loading}>
              <Text style={[styles.modalAction, loading && styles.modalActionDisabled]}>
                Add
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Trip *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedTripId || activeTrip?.id}
                  onValueChange={setSelectedTripId}
                >
                  {trips.map(trip => (
                    <Picker.Item key={trip.id} label={trip.name} value={trip.id} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={styles.textInput}
                value={description}
                onChangeText={setDescription}
                placeholder="What did you spend on?"
                maxLength={100}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount *</Text>
              <TextInput
                style={styles.textInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={category}
                  onValueChange={setCategory}
                >
                  <Picker.Item label="Food & Dining" value="food" />
                  <Picker.Item label="Transportation" value="transport" />
                  <Picker.Item label="Accommodation" value="accommodation" />
                  <Picker.Item label="Entertainment" value="entertainment" />
                  <Picker.Item label="Shopping" value="shopping" />
                  <Picker.Item label="Utilities" value="utilities" />
                  <Picker.Item label="Other" value="other" />
                </Picker>
              </View>
            </View>
          </ScrollView>
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: 'white',
  },
});