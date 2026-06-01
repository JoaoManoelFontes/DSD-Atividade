import type { NotificationService } from "../../notifications/interfaces/notification-service.js";
import type { OrderService } from "../../orders/interfaces/order-service.js";
import { AppError } from "../../../shared/errors/app-error.js";
import type { PaymentService } from "../interfaces/payment-service.js";
import { PaymentRepository } from "../repositories/payment-repository.js";
import type { Payment, ProcessPaymentInput } from "../types/payment.js";

export class MockPaymentService implements PaymentService {
  constructor(
    protected readonly paymentRepository: PaymentRepository,
    protected readonly orderService: OrderService,
    protected readonly notificationService: NotificationService,
  ) {}

  async processPayment(input: ProcessPaymentInput): Promise<Payment> {
    const order = await this.orderService.getOrderById(input.orderId);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.status !== "PENDING_PAYMENT") {
      throw new AppError("Order is not pending payment", 409);
    }

    const pendingPayment = await this.paymentRepository.createPending(
      order.id,
      order.total,
    );

    console.log(`[payments] payment ${pendingPayment.id} created as pending`);

    if (input.approved === false) {
      const rejectedPayment = await this.paymentRepository.updateStatus(
        pendingPayment.id,
        "REJECTED",
      );

      if (!rejectedPayment) {
        throw new AppError("Payment not found", 404);
      }

      console.log(`[payments] payment ${rejectedPayment.id} rejected`);
      return rejectedPayment;
    }

    const approvedPayment = await this.paymentRepository.updateStatus(
      pendingPayment.id,
      "APPROVED",
    );

    if (!approvedPayment) {
      throw new AppError("Payment not found", 404);
    }

    console.log(`[payments] payment ${approvedPayment.id} approved`);

    await this.orderService.markOrderPaid(order.id);
    await this.notificationService.notifyKitchen(order.id);
    await this.orderService.sendOrderToKitchen(order.id);

    return approvedPayment;
  }

  async getPaymentById(id: number): Promise<Payment | null> {
    return this.paymentRepository.findById(id);
  }

  async getPaymentByOrderId(orderId: number): Promise<Payment | null> {
    return this.paymentRepository.findLatestByOrderId(orderId);
  }
}
