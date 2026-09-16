import * as SQLite from "expo-sqlite";

let database: SQLite.SQLiteDatabase | null = null;

export async function getDatabase() {
  if (database) {
    return database;
  }

  database = await SQLite.openDatabaseAsync("docuniqo.db");

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    `);

  return database;
}
