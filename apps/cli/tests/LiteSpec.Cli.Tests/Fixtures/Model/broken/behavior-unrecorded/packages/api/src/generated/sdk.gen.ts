// Fixture client in the shape of the generated API client.
export const borrowCopy = (options) => (options.client ?? client).post({
    url: '/api/lending/borrow-copy',
});

export const returnCopy = (options) => (options.client ?? client).post({
    url: '/api/lending/return-copy',
});

export const extendLoan = (options) => (options.client ?? client).post({
    url: '/api/lending/extend-loan',
});

export const listLoans = (options) => (options.client ?? client).get({
    url: '/api/lending/list-loans',
});

export const registerCopy = (options) => (options.client ?? client).post({
    url: '/api/lending/register-copy',
});

export const retireCopy = (options) => (options.client ?? client).post({
    url: '/api/lending/retire-copy',
});

export const placeHold = (options) => (options.client ?? client).post({
    url: '/api/lending/place-hold',
});

export const cancelHold = (options) => (options.client ?? client).post({
    url: '/api/lending/cancel-hold',
});

export const ghostOp = (options) => (options.client ?? client).post<{ ok: boolean }>({
    url: '/api/lending/ghost-op',
});
