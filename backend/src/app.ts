import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import { env } from "./config/env";
import { authRoutes } from "./modules/auth/auth.routes";
import { scriptureEntryRoutes } from "./modules/scripture-entries/scripture-entry.routes";
import { healthRoutes } from "./routes/health.routes";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      transport: {
        target: "pino-pretty",
        options: {
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        },
      },
    },
  });

  // Register Core Plugins
  await app.register(cors, {
    origin: env.frontendUrl,
    credentials: true,
  });

  await app.register(fastifyCookie, {
    hook: "onRequest",
  });
  await app.register(fastifyJwt, {
    secret: env.jwtSecret,
    sign: { expiresIn: "7d" },
    cookie: {
      cookieName: "session",
      signed: false,
    },
  });

  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(scriptureEntryRoutes);

  return app;
}
