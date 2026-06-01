import { menuItems } from "./schema.js";
import { closeDatabase, db } from "./client.js";

await db
  .insert(menuItems)
  .values([
    {
      name: "X-Burger",
      description: "Hamburger, cheese, lettuce, and tomato",
      price: "18.90",
      available: true,
    },
    {
      name: "French Fries",
      description: "Crispy french fries",
      price: "9.90",
      available: true,
    },
    {
      name: "Orange Juice",
      description: "Fresh orange juice",
      price: "7.50",
      available: true,
    },
  ])
  .onConflictDoNothing({ target: menuItems.name });

await closeDatabase();

console.log("Menu database seed completed");
