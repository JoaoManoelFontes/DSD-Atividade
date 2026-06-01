function getPort(): number {
  const port = Number(process.env.PORT ?? 3002);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT must be a positive integer");
  }

  return port;
}

export const config = {
  host: process.env.HOST ?? "0.0.0.0",
  port: getPort(),
};
