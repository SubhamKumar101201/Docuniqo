import { getDatabase } from "./db";
import { migrateDatabase } from "./migrations";

export async function initializeDatabase() {
  const db = await getDatabase();

  await migrateDatabase(db);

  console.log("Docuniqo database initialized: ", db);
}
