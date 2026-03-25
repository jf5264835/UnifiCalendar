import { buildApp } from "./app";

const host = process.env.HOST ?? "0.0.0.0";
const port = Number(process.env.PORT ?? 3000);

async function start(): Promise<void> {
  const app = buildApp();

  try {
    await app.listen({ host, port });
    app.log.info(`Server started on http://${host}:${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();
