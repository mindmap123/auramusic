-- CreateTable
CREATE TABLE "StoreGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#1db954',
    "defaultStyleId" TEXT,
    "defaultVolume" INTEGER NOT NULL DEFAULT 70,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StoreSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT,
    "styleId" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    CONSTRAINT "StoreSchedule_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StoreSchedule_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "MusicStyle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StoreFavorite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "styleId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StoreFavorite_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StoreFavorite_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "MusicStyle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MusicStyle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mixUrl" TEXT,
    "coverUrl" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 3600,
    "icon" TEXT,
    "colorTheme" TEXT,
    "bannerHorizontal" TEXT NOT NULL DEFAULT 'center',
    "bannerVertical" TEXT NOT NULL DEFAULT 'center'
);
INSERT INTO "new_MusicStyle" ("colorTheme", "description", "duration", "icon", "id", "mixUrl", "name", "slug") SELECT "colorTheme", "description", "duration", "icon", "id", "mixUrl", "name", "slug" FROM "MusicStyle";
DROP TABLE "MusicStyle";
ALTER TABLE "new_MusicStyle" RENAME TO "MusicStyle";
CREATE UNIQUE INDEX "MusicStyle_slug_key" ON "MusicStyle"("slug");
CREATE TABLE "new_Store" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "currentStyleId" TEXT,
    "volume" INTEGER NOT NULL DEFAULT 70,
    "isPlaying" BOOLEAN NOT NULL DEFAULT false,
    "isAutoMode" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastPlayedAt" DATETIME,
    "role" TEXT NOT NULL DEFAULT 'STORE',
    "accentColor" TEXT NOT NULL DEFAULT 'green',
    "groupId" TEXT,
    "city" TEXT,
    "country" TEXT,
    "storeType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Store_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "StoreGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Store_currentStyleId_fkey" FOREIGN KEY ("currentStyleId") REFERENCES "MusicStyle" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Store" ("createdAt", "currentStyleId", "email", "id", "isPlaying", "lastPlayedAt", "name", "password", "role", "updatedAt", "volume") SELECT "createdAt", "currentStyleId", "email", "id", "isPlaying", "lastPlayedAt", "name", "password", "role", "updatedAt", "volume" FROM "Store";
DROP TABLE "Store";
ALTER TABLE "new_Store" RENAME TO "Store";
CREATE UNIQUE INDEX "Store_email_key" ON "Store"("email");
CREATE INDEX "Store_groupId_idx" ON "Store"("groupId");
CREATE INDEX "Store_city_idx" ON "Store"("city");
CREATE INDEX "Store_isActive_idx" ON "Store"("isActive");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "StoreGroup_name_key" ON "StoreGroup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "StoreFavorite_storeId_styleId_key" ON "StoreFavorite"("storeId", "styleId");

-- CreateIndex
CREATE INDEX "ActivityLog_storeId_createdAt_idx" ON "ActivityLog"("storeId", "createdAt");
