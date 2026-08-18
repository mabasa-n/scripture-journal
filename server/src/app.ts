import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { validateEnv } from "./config/env";
import { db } from "./db";
import { sql } from "drizzle-orm";

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
  app.get("/api/v1/health", async () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  app.get("/api/v1/health/db", async (_request, reply) => {
    try {
      const result = await db.execute(sql`SELECT NOW()`);

      return {
        status: "ok",
        apiTimestamp: new Date().toISOString(),
      };
    } catch (error) {
      app.log.error(error);
      return reply
        .status(503)
        .send({ status: "error", message: "Database connection failed" });
    }
  });

  return app;
}
