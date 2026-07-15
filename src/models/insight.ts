export type MonthlyCashFlowPoint = {
  month: string;
  incomeInCents: number;
  expenseInCents: number;
  netCashFlowInCents: number;
};

export type MonthlyMoneySavedPoint = {
  month: string;
  savedInCents: number;
};
