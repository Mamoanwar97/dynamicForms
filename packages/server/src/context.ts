import type { AuthUser } from "./auth.ts";
import type { Db } from "./db.ts";

export type Context = {
  db: Db;
  user: AuthUser | null;
  jwtSecret: string;
};