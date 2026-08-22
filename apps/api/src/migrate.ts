import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import type { Db } from "@repo/server";
import { closeDb, connectDb } from "./db.js";

const migrationsDir = fileURLToPath(new URL("../migrations", import.meta.url));

export async function migrate(db: Db): Promise<void> {
  await db.query(`
    create table if not exists _migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const files = (await readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const applied = await db.queryOne<{ name: string }>(
      `select name from _migrations where name = $1`,
      [file],
    );
    if (applied) continue;

    const sql = await readFile(path.join(migrationsDir, file), "utf8");
    await db.withTransaction(async (tx) => {
      await tx.query(sql);
      await tx.query(`insert into _migrations (name) values ($1)`, [file]);
    });
    console.log(`Applied migration: ${file}`);
  }
}

async function run(): Promise<void> {
  const db = await connectDb();
  try {
    await migrate(db);
  } finally {
    await closeDb();
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}