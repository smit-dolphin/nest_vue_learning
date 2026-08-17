/*
  Warnings:

  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'EXTRACTING_AUDIO', 'TRANSCRIBING', 'GENERATING_SUBTITLE', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "SubtitleFormat" AS ENUM ('SRT', 'VTT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "duration" DOUBLE PRECISION,
ADD COLUMN     "status" "VideoStatus" NOT NULL DEFAULT 'UPLOADED',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Subtitle" (
    "id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "format" "SubtitleFormat" NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "videoId" TEXT NOT NULL,
    "jobId" TEXT,

    CONSTRAINT "Subtitle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubtitleJob" (
    "id" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "videoId" TEXT NOT NULL,

    CONSTRAINT "SubtitleJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subtitle_jobId_key" ON "Subtitle"("jobId");

-- AddForeignKey
ALTER TABLE "Subtitle" ADD CONSTRAINT "Subtitle_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subtitle" ADD CONSTRAINT "Subtitle_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "SubtitleJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubtitleJob" ADD CONSTRAINT "SubtitleJob_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
