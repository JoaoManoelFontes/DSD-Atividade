export type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ProcessPaymentInput {
  orderId: number;
  approved?: boolean;
}

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  paidAt: string | null;
}
