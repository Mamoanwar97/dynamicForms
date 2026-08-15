import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import type { Context } from "@repo/server";
import { getDb } from "./db.js";

export async function createContext(
  _opts: CreateFastifyContextOptions,
): Promise<Context> {
  return { db: getDb() };
}
