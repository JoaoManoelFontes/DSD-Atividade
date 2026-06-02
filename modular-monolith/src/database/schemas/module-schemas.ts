export const moduleSchemas = ["menu", "orders", "payments", "notifications"] as const;

export type ModuleSchema = (typeof moduleSchemas)[number];
