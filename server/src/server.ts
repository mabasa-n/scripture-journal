import { buildApp } from "./app";
import { validateEnv } from "./config/env";

async function start() {
  const env = validateEnv();
  const app = await buildApp();

  try {
    await app.listen({
      port: env?.PORT,
      host: env?.HOST,
    });
    app.log.info(`Server running on http:${env?.HOST}:${env?.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  //   Graceful shutdown handler
  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];

  for (const signal of signals) {
    process.on(signal, async () => {
      app.log.info(`Received ${signal}, shutting down server...`);
      await app.close();
      process.exit(0);
    });
  }
}

start();
