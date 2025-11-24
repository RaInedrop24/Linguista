-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Vocabulary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "italian" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "partOfSpeech" TEXT NOT NULL,
    "exampleSentence" TEXT NOT NULL DEFAULT '',
    "frequency" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL DEFAULT 'seed',
    "audioUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Conjugation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vocabularyId" TEXT NOT NULL,
    "tense" TEXT NOT NULL,
    "person" TEXT NOT NULL,
    "form" TEXT NOT NULL,
    CONSTRAINT "Conjugation_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "Vocabulary" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "boxLevel" INTEGER NOT NULL DEFAULT 1,
    "nextReviewDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastQualityScore" INTEGER NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "incorrectCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserProgress_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "Vocabulary" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Vocabulary_frequency_idx" ON "Vocabulary"("frequency");

-- CreateIndex
CREATE INDEX "Vocabulary_partOfSpeech_idx" ON "Vocabulary"("partOfSpeech");

-- CreateIndex
CREATE INDEX "Conjugation_vocabularyId_idx" ON "Conjugation"("vocabularyId");

-- CreateIndex
CREATE INDEX "UserProgress_userId_nextReviewDate_idx" ON "UserProgress"("userId", "nextReviewDate");

-- CreateIndex
CREATE INDEX "UserProgress_nextReviewDate_idx" ON "UserProgress"("nextReviewDate");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_userId_vocabularyId_key" ON "UserProgress"("userId", "vocabularyId");
