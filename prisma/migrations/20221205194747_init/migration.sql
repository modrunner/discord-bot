/*
  Warnings:

  - The primary key for the `ModrinthTrackedProject` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CurseforgeTrackedProject` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `ModrinthTrackedProject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `CurseforgeTrackedProject` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ModrinthTrackedProject" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    CONSTRAINT "ModrinthTrackedProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ModrinthProject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ModrinthTrackedProject_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "DiscordGuild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ModrinthTrackedProject" ("channelId", "guildId", "projectId") SELECT "channelId", "guildId", "projectId" FROM "ModrinthTrackedProject";
DROP TABLE "ModrinthTrackedProject";
ALTER TABLE "new_ModrinthTrackedProject" RENAME TO "ModrinthTrackedProject";
CREATE TABLE "new_CurseforgeTrackedProject" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    CONSTRAINT "CurseforgeTrackedProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "CurseforgeProject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CurseforgeTrackedProject_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "DiscordGuild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CurseforgeTrackedProject" ("channelId", "guildId", "projectId") SELECT "channelId", "guildId", "projectId" FROM "CurseforgeTrackedProject";
DROP TABLE "CurseforgeTrackedProject";
ALTER TABLE "new_CurseforgeTrackedProject" RENAME TO "CurseforgeTrackedProject";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
