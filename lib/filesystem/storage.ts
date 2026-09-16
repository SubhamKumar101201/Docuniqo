import {
    DOCUMENTS_DIRECTORY,
    DOCUNIQO_DIRECTORY,
    SYSTEM_DIRECTORY,
    THUMBNAILS_DIRECTORY,
} from "./paths";

export function initializeFileSystem() {
  DOCUNIQO_DIRECTORY.create({
    idempotent: true,
    intermediates: true,
  });

  DOCUMENTS_DIRECTORY.create({
    idempotent: true,
    intermediates: true,
  });

  THUMBNAILS_DIRECTORY.create({
    idempotent: true,
    intermediates: true,
  });

  SYSTEM_DIRECTORY.create({
    idempotent: true,
    intermediates: true,
  });
}
