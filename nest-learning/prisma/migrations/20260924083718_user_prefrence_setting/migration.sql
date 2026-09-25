/*
  Warnings:

  - You are about to drop the column `settings` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "settings";

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "compactView" BOOLEAN NOT NULL DEFAULT false,
    "defaultLanguage" TEXT NOT NULL DEFAULT 'en',
    "defaultFormat" "SubtitleFormat" NOT NULL DEFAULT 'SRT',
    "autoPunctuation" BOOLEAN NOT NULL DEFAULT true,
    "wordLevelTiming" BOOLEAN NOT NULL DEFAULT false,
    "autoTranslate" BOOLEAN NOT NULL DEFAULT false,
    "translateLanguage" TEXT,
    "fontSize" INTEGER NOT NULL DEFAULT 32,
    "fontColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "backgroundOpacity" INTEGER NOT NULL DEFAULT 50,
    "position" TEXT NOT NULL DEFAULT 'bottom',
    "outline" BOOLEAN NOT NULL DEFAULT true,
    "jobComplete" BOOLEAN NOT NULL DEFAULT true,
    "jobFailed" BOOLEAN NOT NULL DEFAULT true,
    "weeklyReport" BOOLEAN NOT NULL DEFAULT false,
    "productUpdates" BOOLEAN NOT NULL DEFAULT true,
    "marketing" BOOLEAN NOT NULL DEFAULT false,
    "autoDownload" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
