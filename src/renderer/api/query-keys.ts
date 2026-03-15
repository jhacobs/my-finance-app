export const queryKeys = {
  transactions: {
    index: ["transactions"] as const,
    recent: () => [...queryKeys.transactions.index, "recent"] as const,
  },
};
