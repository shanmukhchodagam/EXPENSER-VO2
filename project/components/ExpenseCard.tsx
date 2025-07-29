import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Expense, Participant } from '@/types';
import { formatCurrency } from '@/utils/calculations';

interface ExpenseCardProps {
  expense: Expense;
  participants: Participant[];
  onPress?: () => void;
}

const categoryIcons: Record<string, string> = {
  food: 'restaurant',
  transport: 'car',
  accommodation: 'bed',
  entertainment: 'game-controller',
  shopping: 'bag',
  utilities: 'bulb',
  other: 'ellipsis-horizontal',
};

const categoryColors: Record<string, string> = {
  food: '#EF4444',
  transport: '#3B82F6',
  accommodation: '#8B5CF6',
  entertainment: '#F59E0B',
  shopping: '#EC4899',
  utilities: '#10B981',
  other: '#6B7280',
};

export function ExpenseCard({ expense, participants, onPress }: ExpenseCardProps) {
  const paidByParticipant = participants.find(p => p.userId === expense.paidBy);
  const splitCount = expense.splitAmong.length;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <View style={[styles.categoryIcon, { backgroundColor: categoryColors[expense.category] }]}>
            <Ionicons 
              name={categoryIcons[expense.category] as any} 
              size={20} 
              color="white" 
            />
          </View>
          <View style={styles.details}>
            <Text style={styles.description}>{expense.description}</Text>
            <Text style={styles.metadata}>
              Paid by {paidByParticipant?.name || 'Unknown'} • Split {splitCount} ways
            </Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.amount}>
            {formatCurrency(expense.amount, expense.currency)}
          </Text>
          <Text style={styles.date}>
            {new Date(expense.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  metadata: {
    fontSize: 14,
    color: '#6B7280',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});