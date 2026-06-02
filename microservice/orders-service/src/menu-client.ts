import { config } from "./config.js";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  available: boolean;
}

export class MenuItemValidationError extends Error {}

export class MenuServiceUnavailableError extends Error {}

export async function getAvailableMenuItem(menuItemId: number): Promise<MenuItem> {
  let response: Response;

  try {
    response = await fetch(`${config.menuServiceUrl}/menu-items/${menuItemId}`);
  } catch {
    throw new MenuServiceUnavailableError("Menu service is unavailable");
  }

  if (response.status === 404) {
    throw new MenuItemValidationError("Menu item not found");
  }

  if (!response.ok) {
    throw new MenuServiceUnavailableError("Menu service is unavailable");
  }

  const menuItem = (await response.json()) as MenuItem;

  if (!menuItem.available) {
    throw new MenuItemValidationError("Menu item is unavailable");
  }

  return menuItem;
}
