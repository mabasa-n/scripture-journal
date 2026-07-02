import { buildApp } from "./app";
import { env } from "./config/env";
import { testDbConnection } from "./db";

async function start() {
  try {
    await testDbConnection();

    const app = await buildApp();

    await app.listen({ port: env.port, host: "0.0.0.0" });
    console.log(`Server listening on http://localhost:${env.port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();
