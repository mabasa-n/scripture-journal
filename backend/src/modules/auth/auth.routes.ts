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
  app.post("/api/auth/login", async (request, reply) => {
    try {
      const { credential } = request.body as { credential?: string };

      if (!credential) {
        return reply.status(400).send({
          error: "Google credential token is required",
        });
      } else {
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
        let userId: string;

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

          // First time logging in
          const newUser = await db
            .insert(users)
            .values({
              googleId: payload.sub, // Google's unique ID for the user
              email: payload.email,
            })
            .returning({ id: users.id });
          userId = newUser[0].id;
        } else {
          // Returning user
          userId = existingUsers[0].id;
        }

        // 4. Create internal signed session token
        const token = app.jwt.sign({ userId, email: payload.email });

        // 5. Store the session token in an HttpOnly cookie
        reply.setCookie("session", token, {
          path: "/",
          httpOnly: true, // Javascript cannot read this (prevents XSS)
          secure: env.nodeEnv === "production", // Must be true in prod (HTTPS)
          sameSite: "lax", // Protects against CSRF
          maxAge: 60 * 60 * 24 * 7, // 1 week
        });

        return reply.send({
          success: true,
          message: "Logged in successfully",
          userId,
        });
      }
    } catch (error) {
      app.log.error(error);
      return reply.status(401).send({ error: "Authentication failed" });
    }
  });

  app.post("/api/auth/logout", async (request, reply) => {
    reply.clearCookie("session", { path: "/" });
    return reply.send({ success: true, message: "Logged out" });
  });
}
