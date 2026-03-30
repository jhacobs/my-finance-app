export const queryKeys = {
  transactions: {
    index: ["transactions"] as const,
    recent: () => [...queryKeys.transactions.index, "recent"] as const,
  },
  balance: {
    totalIncome: ["balance", "totalIncome"] as const,
    totalExpense: ["balance", "totalExpense"] as const,
    totalBalance: ["balance", "totalBalance"] as const,
  },
};
