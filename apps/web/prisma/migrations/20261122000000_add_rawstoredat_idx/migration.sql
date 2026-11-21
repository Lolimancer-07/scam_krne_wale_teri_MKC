-- Speeds up retention purge queries for opted-in raw samples.
CREATE INDEX "Analysis_rawStoredAt_idx" ON "Analysis"("rawStoredAt");
