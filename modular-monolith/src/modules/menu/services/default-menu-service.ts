import { AppError } from "../../../shared/errors/app-error.js";
import type { MenuService } from "../interfaces/menu-service.js";
import { MenuRepository } from "../repositories/menu-repository.js";
import type {
  CreateMenuItemInput,
  MenuItem,
  UpdateMenuItemInput,
} from "../types/menu-item.js";

export class DefaultMenuService implements MenuService {
  constructor(private readonly menuRepository: MenuRepository) {}

  async createMenuItem(input: CreateMenuItemInput): Promise<MenuItem> {
    return this.menuRepository.create(input);
  }

  async listMenuItems(): Promise<MenuItem[]> {
    return this.menuRepository.findAll();
  }

  async getMenuItem(id: number): Promise<MenuItem | null> {
    return this.menuRepository.findById(id);
  }

  async getAvailableMenuItems(ids: number[]): Promise<MenuItem[]> {
    return this.menuRepository.findAvailableByIds(ids);
  }

  async updateMenuItem(id: number, input: UpdateMenuItemInput): Promise<MenuItem> {
    const menuItem = await this.menuRepository.update(id, input);

    if (!menuItem) {
      throw new AppError("Menu item not found", 404);
    }

    return menuItem;
  }

  async deleteMenuItem(id: number): Promise<void> {
    const deleted = await this.menuRepository.delete(id);

    if (!deleted) {
      throw new AppError("Menu item not found", 404);
    }
  }
}
