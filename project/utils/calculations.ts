import { Expense, Participant, Settlement } from '@/types';

export function calculateSettlements(
  expenses: Expense[], 
  participants: Participant[]
): Settlement[] {
  const balances: { [userId: string]: number } = {};
  
  // Initialize balances
  participants.forEach(participant => {
    balances[participant.userId] = 0;
  });

  // Calculate net balances for each participant
  expenses.forEach(expense => {
    const { paidBy, splitAmong, amount, splitType, customSplit } = expense;
    
    // Add amount to payer's balance
    balances[paidBy] = (balances[paidBy] || 0) + amount;
    
    // Subtract split amounts from participants
    if (splitType === 'equal') {
      const splitAmount = amount / splitAmong.length;
      splitAmong.forEach(userId => {
        balances[userId] = (balances[userId] || 0) - splitAmount;
      });
    } else if (splitType === 'custom' && customSplit) {
      splitAmong.forEach(userId => {
        const userSplit = customSplit[userId] || 0;
        balances[userId] = (balances[userId] || 0) - userSplit;
      });
    }
  });

  // Create settlements to minimize transactions
  const settlements: Settlement[] = [];
  const creditors: Array<{ userId: string; amount: number }> = [];
  const debtors: Array<{ userId: string; amount: number }> = [];

  // Separate creditors and debtors
  Object.entries(balances).forEach(([userId, balance]) => {
    if (balance > 0.01) {
      creditors.push({ userId, amount: balance });
    } else if (balance < -0.01) {
      debtors.push({ userId, amount: -balance });
    }
  });

  // Sort by amount (descending for creditors, ascending for debtors)
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => a.amount - b.amount);

  // Create settlements
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    
    const settlementAmount = Math.min(creditor.amount, debtor.amount);
    
    if (settlementAmount > 0.01) {
      settlements.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amount: Math.round(settlementAmount * 100) / 100,
        currency: 'USD', // TODO: Support multiple currencies
      });
    }

    creditor.amount -= settlementAmount;
    debtor.amount -= settlementAmount;

    if (creditor.amount <= 0.01) creditorIndex++;
    if (debtor.amount <= 0.01) debtorIndex++;
  }

  return settlements;
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function generateInviteCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}