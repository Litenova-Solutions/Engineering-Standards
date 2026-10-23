// This file is generated from the published OpenAPI document. Do not edit it by hand.

export type SubmitExpenseData = {
  body: {
    amount: string;
    currency: string;
    receiptId?: string | null;
  };
};

export type SubmitExpenseResponse = {
  expenseId: string;
};

export type ExpenseRow = {
  expenseId: string;
  amount: string;
  currency: string;
  state: string;
  submittedAt: string;
};

export type ListExpensesResponse = {
  expenses: ExpenseRow[];
};
