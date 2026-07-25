import "@fastify/jwt";
import "@fastify/cookie";
import { FastifyReply, FastifyRequest } from "fastify";

export type AuthenticatedUser = {
  userId: string;
  email: string;
};

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<AuthenticatedUser | null> {
  try {
    const user = await request.jwtVerify<AuthenticatedUser>({
      onlyCookie: true,
    });

    if (!user.userId || !user.email) {
      throw new Error("Invalid session payload");
    }

    return user;
  } catch {
    reply.status(401).send({ error: "Authentication required" });
    return null;
  }
}
