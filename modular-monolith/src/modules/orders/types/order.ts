export type OrderStatus =
  | "CREATED"
  | "PENDING_PAYMENT"
  | "PAID"
  | "SENT_TO_KITCHEN"
  | "CANCELLED";

export interface CreateOrderItemInput {
  menuItemId: number;
  quantity: number;
}

export interface CreateOrderInput {
  items: CreateOrderItemInput[];
  observation?: string;
}

export interface OrderItemSnapshot {
  menuItemId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  items: OrderItemSnapshot[];
  status: OrderStatus;
  total: number;
  observation: string | null;
  createdAt: string;
  updatedAt: string;
}
