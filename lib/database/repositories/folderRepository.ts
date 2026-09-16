import * as Crypto from "expo-crypto";
import { getDatabase } from "../db";

// create a function to create a folder
export async function createFolder(
  name: string,
  parentId: string | null = null,
) {
  const db = await getDatabase();

  const id = Crypto.randomUUID();
  const now = Date.now();

  await db.runAsync(
    `
    INSERT INTO folders (
        id,
        name,
        parent_id,
        created_at,
        updated_at,
        deleted_at
      )
      VALUES (?, ?, ?, ?, ?, NULL)
    `,
    id,
    name.trim(),
    parentId,
    now,
    now,
  );

  return id;
}

// create a function to get the root folder
export async function getRootFolders() {
  const db = await getDatabase();

  return db.getAllAsync(
    `
      SELECT *
      FROM folders
      WHERE parent_id IS NULL
      AND deleted_at IS NULL
      ORDER BY name COLLATE NOCASE ASC
    `,
  );
}

// create a function to get the child folders of a parent folder
export async function getChildFolders(parentId: string) {
  const db = await getDatabase();

  return db.getAllAsync(
    `
      SELECT *
      FROM folders
      WHERE parent_id = ?
      AND deleted_at IS NULL
      ORDER BY name COLLATE NOCASE ASC
    `,
    parentId,
  );
}

// create a function for get a folder by it's id
export async function getFolderById(id: string) {
  const db = await getDatabase();

  return db.getFirstAsync(
    `
      SELECT *
      FROM folders
      WHERE id = ?
      AND deleted_at IS NULL
    `,
    id,
  );
}

// create a function for rename a folder
export async function renameFolder(id: string, newName: string) {
  const db = await getDatabase();

  await db.runAsync(
    `
      UPDATE folders
      SET
      name = ?,
      updated_at = ?
      WHERE id = ?
      AND deleted_at IS NULL
    `,
    newName.trim(),
    Date.now(),
    id,
  );
}

// create a function for movefolder
export async function moveFolder(folderId: string, newParentId: string | null) {
  const db = await getDatabase();

  //check whether the folderid and parentid same or not if same throw error
  if (folderId === newParentId) {
    throw new Error("A folder cannot be moved inside itself.");
  }

  await db.runAsync(
    `
      UPDATE folders
      SET
      parent_id = ?,
      updated_at = ?
      WHERE id = ?
      AND deleted_at IS NULL
    `,
    newParentId,
    Date.now(),
    folderId,
  );
}

// create a soft-delete operation where file dont permanently deleted it move to trash folder so we can restore later if we want.
export async function trashFolder(id: string) {
  const db = await getDatabase();

  await db.runAsync(
    `
      UPDATE folders
      SET
      deleted_at = ?,
      updated_at = ?
      WHERE id = ?
    `,
    Date.now(),
    Date.now(),
    id,
  );
}
