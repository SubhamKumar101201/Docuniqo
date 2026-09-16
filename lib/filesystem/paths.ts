import { Directory, Paths } from "expo-file-system";

export const DOCUNIQO_DIRECTORY = new Directory(Paths.document, "Docuniqo");

export const DOCUMENTS_DIRECTORY = new Directory(
  DOCUNIQO_DIRECTORY,
  "documents",
);

export const THUMBNAILS_DIRECTORY = new Directory(
  DOCUNIQO_DIRECTORY,
  "thumbnails",
);

export const SYSTEM_DIRECTORY = new Directory(DOCUNIQO_DIRECTORY, "system");
