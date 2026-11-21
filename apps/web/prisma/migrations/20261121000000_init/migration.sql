-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "messageHash" TEXT NOT NULL,
    "verdict" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "redFlagCount" INTEGER NOT NULL DEFAULT 0,
    "hasUrl" BOOLEAN NOT NULL DEFAULT false,
    "rawText" TEXT,
    "rawStoredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizResult" (
    "id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Analysis_createdAt_idx" ON "Analysis"("createdAt");

-- CreateIndex
CREATE INDEX "Analysis_verdict_idx" ON "Analysis"("verdict");

-- CreateIndex
CREATE INDEX "Analysis_messageHash_idx" ON "Analysis"("messageHash");

-- CreateIndex
CREATE INDEX "Feedback_analysisId_idx" ON "Feedback"("analysisId");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

