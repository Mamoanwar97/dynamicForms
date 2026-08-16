import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { verifyToken, type Context } from "@repo/server";
import { getDb } from "./db.js";

const jwtSecret = process.env.JWT_SECRET ?? "dev-only-jwt-secret-change-me";

export async function createContext(
  { req }: CreateFastifyContextOptions,
): Promise<Context> {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : undefined;

  let user = null;
  if (token) {
    try {
      user = await verifyToken(token, jwtSecret);
    } catch {
      user = null;
    }
  }
  return { db: getDb(), user, jwtSecret };
}