import type { CreateOrderInput, Order } from "../types/order.js";

export interface OrderService {
  createOrder(input: CreateOrderInput): Promise<Order>;
  listOrders(): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | null>;
  cancelOrder(id: number): Promise<Order>;
  markOrderPaid(id: number): Promise<Order>;
  sendOrderToKitchen(id: number): Promise<Order>;
}
