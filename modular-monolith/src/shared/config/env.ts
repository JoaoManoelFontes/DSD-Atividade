export type PaymentImplementation = "mock" | "slow";

function readNumber(name: string, fallback: number) {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallback;
  }

  const value = Number(rawValue);

  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a valid number`);
  }

  return value;
}

function readPaymentImplementation(): PaymentImplementation {
  const value = process.env.PAYMENT_IMPLEMENTATION ?? "mock";

  if (value === "mock" || value === "slow") {
    return value;
  }

  throw new Error("PAYMENT_IMPLEMENTATION must be either 'mock' or 'slow'");
}

export const config = {
  host: process.env.HOST ?? "0.0.0.0",
  port: readNumber("PORT", 3000),
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgresql://modular:modular@localhost:5432/modular_monolith",
  paymentImplementation: readPaymentImplementation(),
  slowPaymentDelayMs: readNumber("SLOW_PAYMENT_DELAY_MS", 2000),
};
