// Example client in the shape of the generated API client.
export const submitExpense = (options) => (options.client ?? client).post({
    url: '/api/spending/submit-expense',
});

export const approveExpense = (options) => (options.client ?? client).post({
    url: '/api/spending/approve-expense',
});

export const rejectExpense = (options) => (options.client ?? client).post({
    url: '/api/spending/reject-expense',
});

export const reimburseExpense = (options) => (options.client ?? client).post({
    url: '/api/spending/reimburse-expense',
});

export const listExpenses = (options) => (options.client ?? client).get({
    url: '/api/spending/list-expenses',
});

export const attachReceipt = (options) => (options.client ?? client).post({
    url: '/api/spending/attach-receipt',
});

export const setReceiptThreshold = (options) => (options.client ?? client).post({
    url: '/api/spending/set-receipt-threshold',
});

export const exportExpenses = (options) => (options.client ?? client).post({
    url: '/api/spending/export-expenses',
});
