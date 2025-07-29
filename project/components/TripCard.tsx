import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Trip } from '@/types';
import { formatCurrency } from '@/utils/calculations';

interface TripCardProps {
  trip: Trip;
  onPress?: () => void;
}

export function TripCard({ trip, onPress }: TripCardProps) {
  const totalExpenses = trip.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const participantCount = trip.participants.length;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{trip.name}</Text>
          {trip.description && (
            <Text style={styles.description}>{trip.description}</Text>
          )}
        </View>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: trip.isActive ? '#10B981' : '#6B7280' }]} />
        </View>
      </View>
      
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Ionicons name="people" size={16} color="#6B7280" />
          <Text style={styles.statText}>{participantCount} participants</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="receipt" size={16} color="#6B7280" />
          <Text style={styles.statText}>{trip.expenses.length} expenses</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.totalLabel}>Total Spent</Text>
        <Text style={styles.totalAmount}>
          {formatCurrency(totalExpenses)}
        </Text>
      </View>

      <View style={styles.inviteCode}>
        <Text style={styles.inviteLabel}>Invite Code: </Text>
        <Text style={styles.inviteText}>{trip.inviteCode}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  statusIndicator: {
    marginLeft: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
  },
  inviteCode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 8,
  },
  inviteLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  inviteText: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '600',
    letterSpacing: 1,
  },
});