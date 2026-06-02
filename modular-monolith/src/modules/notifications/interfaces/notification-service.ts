import type { Notification } from "../types/notification.js";

export interface NotificationService {
  notifyKitchen(orderId: number): Promise<Notification>;
  listNotifications(): Promise<Notification[]>;
  getNotificationById(id: number): Promise<Notification | null>;
}
