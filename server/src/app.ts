import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { validateEnv } from "./config/env";

export async function buildApp(): Promise<FastifyInstance> {
  const env = validateEnv();

  const app = Fastify({
    logger: {
      level: env?.NODE_ENV === "development" ? "info" : "error",
      transport:
        env?.NODE_ENV === "development"
          ? {
              target: "pino-pretty",
              options: { translateTime: "HH:MM:ss Z", ignore: "pid.hostname" },
            }
          : undefined,
    },
  });

  //   CORS configuration
  await app.register(cors, {
    origin: env?.CORS_ORIGIN,
    credentials: true,
  });

  //   Health check endpoint
  app.get("/health", async () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  return app;
}
