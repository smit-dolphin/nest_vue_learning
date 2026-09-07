CREATE TYPE "VideoType" AS ENUM ('VIDEO', 'BURNED_VIDEO');

ALTER TABLE "Video"
ADD COLUMN "type" "VideoType" NOT NULL DEFAULT 'VIDEO',
ADD COLUMN "parentVideoId" TEXT;

CREATE INDEX "Video_parentVideoId_idx" ON "Video"("parentVideoId");

ALTER TABLE "Video"
ADD CONSTRAINT "Video_parentVideoId_fkey"
FOREIGN KEY ("parentVideoId") REFERENCES "Video"("id")
ON DELETE CASCADE ON UPDATE CASCADE;