-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('Public', 'Unlisted', 'Private');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leaderboard" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "bannerUrl" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'Public',
    "lastRefreshAt" TIMESTAMP(3),
    "lastRefreshStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardPlayer" (
    "id" TEXT NOT NULL,
    "leaderboardId" TEXT NOT NULL,
    "puuid" TEXT NOT NULL,
    "gameName" TEXT NOT NULL,
    "tagLine" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "twitchUrl" TEXT,
    "twitterUrl" TEXT,
    "profileIconUrl" TEXT,
    "rankTier" TEXT,
    "rankDivision" TEXT,
    "lp" INTEGER,
    "wins" INTEGER,
    "losses" INTEGER,
    "topChamps" JSONB,
    "lastRefreshedAt" TIMESTAMP(3),
    "lastRefreshStatus" TEXT,
    "lastRefreshError" TEXT,

    CONSTRAINT "LeaderboardPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "leaderboardId" TEXT NOT NULL,
    "puuid" TEXT NOT NULL,
    "champId" INTEGER,
    "champName" TEXT NOT NULL,
    "kills" INTEGER NOT NULL,
    "deaths" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "cs" INTEGER NOT NULL,
    "queueType" TEXT NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "isWin" BOOLEAN NOT NULL,
    "matchTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshLog" (
    "id" TEXT NOT NULL,
    "leaderboardId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "errorSummary" TEXT,

    CONSTRAINT "RefreshLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Leaderboard_ownerId_key" ON "Leaderboard"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Leaderboard_slug_key" ON "Leaderboard"("slug");

-- CreateIndex
CREATE INDEX "Leaderboard_visibility_idx" ON "Leaderboard"("visibility");

-- CreateIndex
CREATE INDEX "Leaderboard_slug_idx" ON "Leaderboard"("slug");

-- CreateIndex
CREATE INDEX "LeaderboardPlayer_puuid_idx" ON "LeaderboardPlayer"("puuid");

-- CreateIndex
CREATE INDEX "LeaderboardPlayer_leaderboardId_idx" ON "LeaderboardPlayer"("leaderboardId");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardPlayer_leaderboardId_puuid_key" ON "LeaderboardPlayer"("leaderboardId", "puuid");

-- CreateIndex
CREATE UNIQUE INDEX "Match_matchId_key" ON "Match"("matchId");

-- CreateIndex
CREATE INDEX "Match_leaderboardId_matchTime_idx" ON "Match"("leaderboardId", "matchTime" DESC);

-- CreateIndex
CREATE INDEX "Match_puuid_idx" ON "Match"("puuid");

-- CreateIndex
CREATE INDEX "RefreshLog_leaderboardId_startedAt_idx" ON "RefreshLog"("leaderboardId", "startedAt" DESC);

-- AddForeignKey
ALTER TABLE "Leaderboard" ADD CONSTRAINT "Leaderboard_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardPlayer" ADD CONSTRAINT "LeaderboardPlayer_leaderboardId_fkey" FOREIGN KEY ("leaderboardId") REFERENCES "Leaderboard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_leaderboardId_fkey" FOREIGN KEY ("leaderboardId") REFERENCES "Leaderboard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshLog" ADD CONSTRAINT "RefreshLog_leaderboardId_fkey" FOREIGN KEY ("leaderboardId") REFERENCES "Leaderboard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
