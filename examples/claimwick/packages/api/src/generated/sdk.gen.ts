// This file is generated from the published OpenAPI document. Do not edit it by hand.
import { client, type Options } from "./client.gen";
import type { ListExpensesResponse, SubmitExpenseData, SubmitExpenseResponse } from "./types.gen";

export const submitExpense = <ThrowOnError extends boolean = false>(options: Options<SubmitExpenseData, ThrowOnError>) =>
  (options.client ?? client).post<SubmitExpenseResponse, unknown, ThrowOnError>({
    url: "/api/expenses",
    ...options,
  });

export const listExpenses = <ThrowOnError extends boolean = false>(options: Options<never, ThrowOnError> = {}) =>
  (options.client ?? client).get<ListExpensesResponse, unknown, ThrowOnError>({
    url: "/api/expenses",
    ...options,
  });
