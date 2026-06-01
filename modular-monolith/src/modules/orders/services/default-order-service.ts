import type { MenuService } from "../../menu/interfaces/menu-service.js";
import { AppError } from "../../../shared/errors/app-error.js";
import type { OrderService } from "../interfaces/order-service.js";
import { OrderRepository } from "../repositories/order-repository.js";
import type {
  CreateOrderInput,
  Order,
  OrderItemSnapshot,
} from "../types/order.js";

export class DefaultOrderService implements OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly menuService: MenuService,
  ) {}

  async createOrder(input: CreateOrderInput): Promise<Order> {
    if (input.items.length === 0) {
      throw new AppError("Order must have at least one item");
    }

    const quantitiesByMenuItemId = new Map<number, number>();

    for (const item of input.items) {
      quantitiesByMenuItemId.set(
        item.menuItemId,
        (quantitiesByMenuItemId.get(item.menuItemId) ?? 0) + item.quantity,
      );
    }

    const menuItemIds = [...quantitiesByMenuItemId.keys()];
    const menuItems = await this.menuService.getAvailableMenuItems(menuItemIds);

    if (menuItems.length !== menuItemIds.length) {
      throw new AppError("Some menu items were not found or are unavailable", 400);
    }

    const snapshots: OrderItemSnapshot[] = menuItems.map((menuItem) => {
      const quantity = quantitiesByMenuItemId.get(menuItem.id) ?? 0;
      const subtotal = Number((menuItem.price * quantity).toFixed(2));

      return {
        menuItemId: menuItem.id,
        name: menuItem.name,
        unitPrice: menuItem.price,
        quantity,
        subtotal,
      };
    });

    const total = Number(
      snapshots.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2),
    );

    const order = await this.orderRepository.create({
      items: snapshots,
      status: "PENDING_PAYMENT",
      total,
      observation: input.observation,
    });

    console.log(`[orders] order ${order.id} created with total ${order.total}`);
    console.log(`[orders] order ${order.id} waiting for payment`);

    return order;
  }

  async listOrders(): Promise<Order[]> {
    return this.orderRepository.findAll();
  }

  async getOrderById(id: number): Promise<Order | null> {
    return this.orderRepository.findById(id);
  }

  async cancelOrder(id: number): Promise<Order> {
    const order = await this.getExistingOrder(id);

    if (order.status === "SENT_TO_KITCHEN") {
      throw new AppError("Order already sent to kitchen", 409);
    }

    if (order.status === "CANCELLED") {
      return order;
    }

    const cancelledOrder = await this.orderRepository.updateStatus(id, "CANCELLED");

    if (!cancelledOrder) {
      throw new AppError("Order not found", 404);
    }

    console.log(`[orders] order ${id} cancelled`);
    return cancelledOrder;
  }

  async markOrderPaid(id: number): Promise<Order> {
    const order = await this.getExistingOrder(id);

    if (order.status !== "PENDING_PAYMENT") {
      throw new AppError("Only orders pending payment can be marked as paid", 409);
    }

    const paidOrder = await this.orderRepository.updateStatus(id, "PAID");

    if (!paidOrder) {
      throw new AppError("Order not found", 404);
    }

    console.log(`[orders] order ${id} marked as paid`);
    return paidOrder;
  }

  async sendOrderToKitchen(id: number): Promise<Order> {
    const order = await this.getExistingOrder(id);

    if (order.status !== "PAID") {
      throw new AppError("Order must be paid before being sent to kitchen", 409);
    }

    const sentOrder = await this.orderRepository.updateStatus(
      id,
      "SENT_TO_KITCHEN",
    );

    if (!sentOrder) {
      throw new AppError("Order not found", 404);
    }

    console.log(`[orders] order ${id} sent to kitchen`);
    return sentOrder;
  }

  private async getExistingOrder(id: number): Promise<Order> {
    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    return order;
  }
}
