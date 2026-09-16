import { initializeDatabase } from "../database/initDatabase";
import { initializeFileSystem } from "../filesystem/storage";

export async function initializeStorage() {
  initializeFileSystem();

  await initializeDatabase();

  console.log("Docuniqo storage initialized");
}
