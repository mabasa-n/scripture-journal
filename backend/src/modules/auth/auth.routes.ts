import "@fastify/jwt";
import "@fastify/cookie";
import { FastifyInstance } from "fastify";
import { OAuth2Client } from "google-auth-library";
import { env } from "../../config/env";
import { db, users } from "../../db";
import { eq } from "drizzle-orm";

const client = new OAuth2Client({
  clientId: env.googleClientId,
});

export async function authRoutes(app: FastifyInstance) {
  // Existing Login Route
  app.post("/api/auth/login", async (request, reply) => {
    try {
      const { credential } = request.body as { credential?: string };

      if (!credential) {
        return reply.status(400).send({
          error: "Google credential token is required",
        });
      }

      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: env.googleClientId,
      });

      const payload = ticket.getPayload();

      if (!payload || !payload.email || !payload.email_verified) {
        return reply.status(401).send({ error: "Invalid Google token" });
      }

      const existingUsers = await db
        .select()
        .from(users)
        .where(eq(users.googleId, payload.sub));
      let user: typeof users.$inferSelect;

      if (existingUsers.length === 0) {
        const usersWithEmail = await db
          .select()
          .from(users)
          .where(eq(users.email, payload.email));

        if (usersWithEmail.length > 0) {
          return reply.status(409).send({
            error: "A user with this email already exists",
          });
        }

        const newUsers = await db
          .insert(users)
          .values({
            googleId: payload.sub,
            email: payload.email,
          })
          .returning();

        user = newUsers[0];
      } else {
        user = existingUsers[0];
      }

      // Sign JWT with payload
      const token = app.jwt.sign({ userId: user.id, email: user.email });

      reply.setCookie("session", token, {
        path: "/",
        httpOnly: true,
        secure: env.nodeEnv === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      return reply.send({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      app.log.error(error);
      return reply.status(401).send({ error: "Authentication failed" });
    }
  });

  // NEW: Session Validation Endpoint
  app.get("/api/auth/me", async (request, reply) => {
    const token = request.cookies.session;

    if (!token) {
      return reply.status(401).send({ error: "Unauthenticated" });
    }

    try {
      // Decode and verify the JWT signature & expiration
      const decoded = app.jwt.verify<{ userId: string; email: string }>(token);

      // Verify the user still exists in DB
      const user = await db
        .select({
          id: users.id,
          email: users.email,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1);

      if (user.length === 0) {
        reply.clearCookie("session", { path: "/" });
        return reply.status(401).send({ error: "User no longer exists" });
      }

      return reply.send({ user: user[0] });
    } catch (error) {
      // Token expired or invalid signature
      reply.clearCookie("session", { path: "/" });
      return reply.status(401).send({ error: "Invalid or expired session" });
    }
  });

  // Existing Logout Route
  app.post("/api/auth/logout", async (request, reply) => {
    reply.clearCookie("session", { path: "/" });
    return reply.send({ success: true, message: "Logged out" });
  });
}
