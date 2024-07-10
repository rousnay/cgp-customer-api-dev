export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  PARTIAL_PAID = 'partial_paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIAL_REFUNDED = 'partial_refunded',
}

export enum PaymentMethodType {
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
}

export enum PaymentTransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}
