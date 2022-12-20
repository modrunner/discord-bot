-- CreateTable
CREATE TABLE "DiscordGuild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "changelogMaxLength" INTEGER NOT NULL DEFAULT 4000,
    "maxTrackedProjects" INTEGER NOT NULL DEFAULT 100,
    "notificationStyle" TEXT NOT NULL DEFAULT 'normal'
);

-- CreateTable
CREATE TABLE "CurseforgeProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "dateUpdated" DATETIME NOT NULL,
    "latestFileId" TEXT,
    "secondLatestFileID" TEXT
);

-- CreateTable
CREATE TABLE "CurseforgeTrackedProject" (
    "projectId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,

    PRIMARY KEY ("projectId", "guildId", "channelId"),
    CONSTRAINT "CurseforgeTrackedProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "CurseforgeProject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CurseforgeTrackedProject_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "DiscordGuild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ModrinthProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "dateUpdated" DATETIME NOT NULL,
    "latestFileId" TEXT
);

-- CreateTable
CREATE TABLE "ModrinthTrackedProject" (
    "projectId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,

    PRIMARY KEY ("projectId", "guildId", "channelId"),
    CONSTRAINT "ModrinthTrackedProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ModrinthProject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ModrinthTrackedProject_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "DiscordGuild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
