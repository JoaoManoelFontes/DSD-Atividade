import type {
  CreateMenuItemInput,
  MenuItem,
  UpdateMenuItemInput,
} from "../types/menu-item.js";

export interface MenuService {
  createMenuItem(input: CreateMenuItemInput): Promise<MenuItem>;
  listMenuItems(): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | null>;
  getAvailableMenuItems(ids: number[]): Promise<MenuItem[]>;
  updateMenuItem(id: number, input: UpdateMenuItemInput): Promise<MenuItem>;
  deleteMenuItem(id: number): Promise<void>;
}
