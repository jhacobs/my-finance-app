export const queryKeys = {
  transactions: {
    index: ["transactions"] as const,
    recent: () => [...queryKeys.transactions.index, "recent"] as const,
  },
  balance: {
    index: ["balance"] as const,
    totalIncome: () => [...queryKeys.balance.index, "totalIncome"] as const,
    totalExpense: () => [...queryKeys.balance.index, "totalExpense"] as const,
    totalBalance: () => [...queryKeys.balance.index, "totalBalance"] as const,
  },
};
