import { config } from "./env.js";
import { DefaultMenuService } from "../../modules/menu/services/default-menu-service.js";
import { MenuRepository } from "../../modules/menu/repositories/menu-repository.js";
import { KitchenNotificationService } from "../../modules/notifications/services/kitchen-notification-service.js";
import { NotificationRepository } from "../../modules/notifications/repositories/notification-repository.js";
import { DefaultOrderService } from "../../modules/orders/services/default-order-service.js";
import { OrderRepository } from "../../modules/orders/repositories/order-repository.js";
import { PaymentRepository } from "../../modules/payments/repositories/payment-repository.js";
import { MockPaymentService } from "../../modules/payments/services/mock-payment-service.js";
import { SlowPaymentService } from "../../modules/payments/services/slow-payment-service.js";

export function buildContainer() {
  const menuRepository = new MenuRepository();
  const orderRepository = new OrderRepository();
  const paymentRepository = new PaymentRepository();
  const notificationRepository = new NotificationRepository();

  const menuService = new DefaultMenuService(menuRepository);
  const notificationService = new KitchenNotificationService(
    notificationRepository,
  );
  const orderService = new DefaultOrderService(orderRepository, menuService);

  const paymentService =
    config.paymentImplementation === "slow"
      ? new SlowPaymentService(
          paymentRepository,
          orderService,
          notificationService,
          config.slowPaymentDelayMs,
        )
      : new MockPaymentService(
          paymentRepository,
          orderService,
          notificationService,
        );

  return {
    menuService,
    orderService,
    paymentService,
    notificationService,
  };
}
