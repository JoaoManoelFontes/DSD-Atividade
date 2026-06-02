export type NotificationStatus = "KITCHEN_NOTIFIED";

export interface Notification {
  id: number;
  orderId: number;
  status: NotificationStatus;
  createdAt: string;
}
