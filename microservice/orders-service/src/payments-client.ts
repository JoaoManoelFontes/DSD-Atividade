import { config } from "./config.js";

interface ProcessPaymentInput {
  orderId: number;
  amount: number;
  observation: string | null;
}

export class PaymentsServiceError extends Error {}

export async function processPayment(input: ProcessPaymentInput): Promise<void> {
  let response: Response;

  try {
    response = await fetch(`${config.paymentsServiceUrl}/payments`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(config.paymentsTimeoutMs),
    });
  } catch {
    throw new PaymentsServiceError("Payments service is unavailable");
  }

  if (!response.ok) {
    throw new PaymentsServiceError("Payments service rejected the request");
  }
}
