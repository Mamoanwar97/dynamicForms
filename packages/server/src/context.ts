import type { Db } from "mongodb";
import type { AuthUser } from "./auth.ts";

export type Context = {
  db: Db;
  user: AuthUser | null;
  jwtSecret: string;
};