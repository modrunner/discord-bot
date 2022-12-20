/*
  Warnings:

  - You are about to drop the column `secondLatestFileID` on the `CurseforgeProject` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CurseforgeProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "dateUpdated" DATETIME NOT NULL,
    "latestFileId" TEXT,
    "secondLatestFileId" TEXT
);
INSERT INTO "new_CurseforgeProject" ("dateUpdated", "id", "latestFileId", "name") SELECT "dateUpdated", "id", "latestFileId", "name" FROM "CurseforgeProject";
DROP TABLE "CurseforgeProject";
ALTER TABLE "new_CurseforgeProject" RENAME TO "CurseforgeProject";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
