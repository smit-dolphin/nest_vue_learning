/*
  Warnings:

  - A unique constraint covering the columns `[queueJobId]` on the table `SubtitleJob` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "SubtitleJob" ADD COLUMN     "queueJobId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "SubtitleJob_queueJobId_key" ON "SubtitleJob"("queueJobId");
