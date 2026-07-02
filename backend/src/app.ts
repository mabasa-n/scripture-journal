import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import { env } from "./config/env";
import { authRoutes } from "./modules/auth/auth.routes";
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

  await app.register(fastifyJwt, { secret: env.jwtSecret });
  await app.register(fastifyCookie, {
    secret: env.jwtSecret, // Signs the cookie
    hook: "onRequest",
  });

  await app.register(healthRoutes);
  await app.register(authRoutes);

  return app;
}
