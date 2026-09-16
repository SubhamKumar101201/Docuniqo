import * as SQLite from "expo-sqlite";

const DATABASE_VERSION = 1;

export async function migrateDatabase(db: SQLite.SQLiteDatabase) {
  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );

  let user_version = result?.user_version ?? 0;

  if (user_version < 1) {
    // Create initial tables

    user_version = 1;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
