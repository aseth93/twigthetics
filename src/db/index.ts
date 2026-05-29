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

export type AppDb = NonNullable<ReturnType<typeof getDb>>;
export { schema };
export * from "./schema";
