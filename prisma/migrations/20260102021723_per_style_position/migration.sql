/*
  Warnings:

  - You are about to drop the column `currentPosition` on the `Store` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "StoreStyleProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "styleId" TEXT NOT NULL,
    "lastPosition" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "StoreStyleProgress_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StoreStyleProgress_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "MusicStyle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Store" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "currentStyleId" TEXT,
    "volume" INTEGER NOT NULL DEFAULT 70,
    "isPlaying" BOOLEAN NOT NULL DEFAULT false,
    "lastPlayedAt" DATETIME,
    "role" TEXT NOT NULL DEFAULT 'STORE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Store_currentStyleId_fkey" FOREIGN KEY ("currentStyleId") REFERENCES "MusicStyle" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Store" ("createdAt", "currentStyleId", "email", "id", "isPlaying", "lastPlayedAt", "name", "password", "role", "updatedAt", "volume") SELECT "createdAt", "currentStyleId", "email", "id", "isPlaying", "lastPlayedAt", "name", "password", "role", "updatedAt", "volume" FROM "Store";
DROP TABLE "Store";
ALTER TABLE "new_Store" RENAME TO "Store";
CREATE UNIQUE INDEX "Store_email_key" ON "Store"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "StoreStyleProgress_storeId_styleId_key" ON "StoreStyleProgress"("storeId", "styleId");
