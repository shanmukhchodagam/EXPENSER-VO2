import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Settlement, Participant } from '@/types';
import { formatCurrency } from '@/utils/calculations';

interface SettlementCardProps {
  settlement: Settlement;
  participants: Participant[];
}

export function SettlementCard({ settlement, participants }: SettlementCardProps) {
  const fromParticipant = participants.find(p => p.userId === settlement.fromUserId);
  const toParticipant = participants.find(p => p.userId === settlement.toUserId);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.participantInfo}>
          <Text style={styles.fromName}>{fromParticipant?.name || 'Unknown'}</Text>
          <Text style={styles.owesText}>owes</Text>
          <Text style={styles.toName}>{toParticipant?.name || 'Unknown'}</Text>
        </View>
        
        <View style={styles.arrow}>
          <Ionicons name="arrow-forward" size={20} color="#6B7280" />
        </View>
        
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>
            {formatCurrency(settlement.amount, settlement.currency)}
          </Text>
        </View>
      </View>
    </View>
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
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  fromName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 6,
  },
  owesText: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 6,
  },
  toName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  arrow: {
    marginHorizontal: 12,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F59E0B',
  },
});