import type { Payment, ProcessPaymentInput } from "../types/payment.js";

export interface PaymentService {
  processPayment(input: ProcessPaymentInput): Promise<Payment>;
  getPaymentById(id: number): Promise<Payment | null>;
  getPaymentByOrderId(orderId: number): Promise<Payment | null>;
}
