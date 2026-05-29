import { promises as fs } from "fs";
import path from "path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function getDatabaseUrl() {
  return process.env.DATABASE_URL?.trim() || "";
}

function createDatabase(url: string) {
  const client = postgres(url, {
    prepare: false,
  });

  return {
    client,
    db: drizzle(client, { schema }),
  };
}

type DatabaseBundle = ReturnType<typeof createDatabase>;

declare global {
  var __twigtheticsDb: DatabaseBundle | undefined;
  var __twigtheticsDbSchemaInit: Promise<void> | undefined;
  var __twigtheticsDbSchemaReady: boolean | undefined;
}

export function getDb() {
  const url = getDatabaseUrl();

  if (!url) {
    return null;
  }

  if (!globalThis.__twigtheticsDb) {
    globalThis.__twigtheticsDb = createDatabase(url);
  }

  return globalThis.__twigtheticsDb.db;
}

function splitMigrationStatements(contents: string) {
  return contents
    .split("--> statement-breakpoint")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function applyRuntimeMigrations(bundle: DatabaseBundle) {
  await bundle.client.unsafe(`create extension if not exists pgcrypto`);
  await bundle.client.unsafe(`
    create table if not exists "__runtime_migrations" (
      "name" text primary key,
      "applied_at" timestamp with time zone default now() not null
    )
  `);

  const appliedRows = await bundle.client<{ name: string }[]>`
    select name from "__runtime_migrations"
  `;
  const appliedMigrations = new Set(appliedRows.map((row) => row.name));
  const migrationsDirectory = path.join(process.cwd(), "src", "db", "migrations");
  const migrationEntries = (await fs.readdir(migrationsDirectory))
    .filter((entry) => entry.endsWith(".sql"))
    .sort();

  for (const entry of migrationEntries) {
    if (appliedMigrations.has(entry)) {
      continue;
    }

    const migrationContents = await fs.readFile(
      path.join(migrationsDirectory, entry),
      "utf8",
    );
    const statements = splitMigrationStatements(migrationContents);

    await bundle.client.begin(async (sql) => {
      for (const statement of statements) {
        await sql.unsafe(statement);
      }

      await sql`
        insert into "__runtime_migrations" ("name")
        values (${entry})
        on conflict ("name") do nothing
      `;
    });
  }
}

export async function getDbReady() {
  const url = getDatabaseUrl();

  if (!url) {
    return null;
  }

  if (!globalThis.__twigtheticsDb) {
    globalThis.__twigtheticsDb = createDatabase(url);
  }

  const bundle = globalThis.__twigtheticsDb;

  if (!globalThis.__twigtheticsDbSchemaReady) {
    if (!globalThis.__twigtheticsDbSchemaInit) {
      globalThis.__twigtheticsDbSchemaInit = applyRuntimeMigrations(bundle)
        .then(() => {
          globalThis.__twigtheticsDbSchemaReady = true;
        })
        .catch((error) => {
          globalThis.__twigtheticsDbSchemaInit = undefined;
          throw error;
        });
    }

    await globalThis.__twigtheticsDbSchemaInit;
  }

  return bundle.db;
}

export type AppDb = NonNullable<ReturnType<typeof getDb>>;
export { schema };
export * from "./schema";
