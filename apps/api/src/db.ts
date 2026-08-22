import pg from "pg";
import { Db } from "@repo/server";

const { Pool } = pg;

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgres://postgres:postgres@127.0.0.1:5432/dynamicForms";

let pool: pg.Pool | undefined;
let db: Db | undefined;

export async function connectDb(): Promise<Db> {
  if (db) return db;

  pool = new Pool({ connectionString: databaseUrl });
  await pool.query("select 1");
  const activePool = pool;
  db = new Db(
    (text, params) => activePool.query(text, params),
    () => activePool.connect(),
  );
  return db;
}

export function getDb(): Db {
  if (!db) throw new Error("Database not connected. Call connectDb() first.");
  return db;
}

export async function closeDb(): Promise<void> {
  await pool?.end();
  pool = undefined;
  db = undefined;
}