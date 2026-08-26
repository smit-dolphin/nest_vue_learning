/*
  Warnings:

  - You are about to drop the `Subtitle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubtitleJob` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Subtitle" DROP CONSTRAINT "Subtitle_jobId_fkey";

-- DropForeignKey
ALTER TABLE "Subtitle" DROP CONSTRAINT "Subtitle_videoId_fkey";

-- DropForeignKey
ALTER TABLE "SubtitleJob" DROP CONSTRAINT "SubtitleJob_videoId_fkey";

-- DropIndex
DROP INDEX "Audio_videoId_key";

-- DropTable
DROP TABLE "Subtitle";

-- DropTable
DROP TABLE "SubtitleJob";

-- DropEnum
DROP TYPE "JobStatus";

-- DropEnum
DROP TYPE "SubtitleFormat";
