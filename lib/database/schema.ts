export const DATABASE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS folders (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    parent_id TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER,
    FOREIGN KEY (parent_id) REFERENCES folders(id)
  );

  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    folder_id TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    extension TEXT,
    size INTEGER,
    local_path TEXT NOT NULL,
    checksum TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER,
    FOREIGN KEY (folder_id) REFERENCES folders(id)
  );

  CREATE INDEX IF NOT EXISTS idx_folders_parent_id
  ON folders(parent_id);

  CREATE INDEX IF NOT EXISTS idx_documents_folder_id
  ON documents(folder_id);

  CREATE INDEX IF NOT EXISTS idx_documents_deleted_at
  ON documents(deleted_at);
`;
