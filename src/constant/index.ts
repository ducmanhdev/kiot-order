export const DATE_FORMAT = 'MM-DD-YYYY HH:mm:ss';

export const ORDER_STATUS = {
    NEW: 0,
    PROCESSING: 51,
    AWAITING_PAYMENT: 7,
    SUCCESS: 8,
    CANCEL: 99,
    VOIDED: 52,
    SETTLED: 53,
    REFUNDED: 50,
    CONFIRM: 1,
    IN_PROGRESS: 2,
    READY: 3,
    PICKED_UP: 4,
    DELIVERED: 5,
    COMPLETED: 6
} as const;

export const PAYMENT_TYPES = {
    CASH: 2,
    CREDIT: 1
} as const
