export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemInput {
  name: string;
  description: string;
  price: number;
  available: boolean;
}

export interface UpdateMenuItemInput extends CreateMenuItemInput {}
