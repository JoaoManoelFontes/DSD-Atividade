import type { NotificationService } from "../../notifications/interfaces/notification-service.js";
import type { OrderService } from "../../orders/interfaces/order-service.js";
import { PaymentRepository } from "../repositories/payment-repository.js";
import type { Payment, ProcessPaymentInput } from "../types/payment.js";
import { MockPaymentService } from "./mock-payment-service.js";

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export class SlowPaymentService extends MockPaymentService {
  constructor(
    paymentRepository: PaymentRepository,
    orderService: OrderService,
    notificationService: NotificationService,
    private readonly delayMs: number,
  ) {
    super(paymentRepository, orderService, notificationService);
  }

  override async processPayment(input: ProcessPaymentInput): Promise<Payment> {
    console.log(`[payments] slow payment simulation waiting ${this.delayMs}ms`);
    await sleep(this.delayMs);
    return super.processPayment(input);
  }
}
