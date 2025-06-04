-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "societe" TEXT,
    "email" TEXT,
    "telephone" TEXT,
    "motif" TEXT,
    "reponses" TEXT,
    "heureArrivee" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "heureDepart" DATETIME,
    "estPresent" BOOLEAN NOT NULL DEFAULT true,
    "arriveType" TEXT NOT NULL DEFAULT 'VERIFY',
    "departType" TEXT NOT NULL DEFAULT 'VERIFY',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("createdAt", "email", "estPresent", "heureArrivee", "heureDepart", "id", "motif", "nom", "prenom", "reponses", "societe", "telephone", "updatedAt") SELECT "createdAt", "email", "estPresent", "heureArrivee", "heureDepart", "id", "motif", "nom", "prenom", "reponses", "societe", "telephone", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
