-- CreateTable
CREATE TABLE "GoogleAuthCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoogleAuthCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GoogleAuthCode_expiresAt_idx" ON "GoogleAuthCode"("expiresAt");

-- CreateIndex
CREATE INDEX "GoogleAuthCode_userId_idx" ON "GoogleAuthCode"("userId");

-- AddForeignKey
ALTER TABLE "GoogleAuthCode" ADD CONSTRAINT "GoogleAuthCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
