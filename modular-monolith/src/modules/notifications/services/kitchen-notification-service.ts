import type { NotificationService } from "../interfaces/notification-service.js";
import { NotificationRepository } from "../repositories/notification-repository.js";
import type { Notification } from "../types/notification.js";

export class KitchenNotificationService implements NotificationService {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async notifyKitchen(orderId: number): Promise<Notification> {
    const notification = await this.notificationRepository.create(
      orderId,
      "KITCHEN_NOTIFIED",
    );

    console.log(`[notifications] kitchen notified for order ${orderId}`);
    return notification;
  }

  async listNotifications(): Promise<Notification[]> {
    return this.notificationRepository.findAll();
  }

  async getNotificationById(id: number): Promise<Notification | null> {
    return this.notificationRepository.findById(id);
  }
}
