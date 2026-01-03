import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { prisma } from "./db.js";
import { config } from "./config.js";
import { optionalAuth, requireAuth } from "./auth.js";

const app = express();
const PORT = process.env.PORT || 4000;

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (config.corsOrigins.includes("*") || config.corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    const error = new Error("Origin not allowed by CORS");
    error.status = 403;
    return callback(error);
  }
};

app.use(cors(corsOptions));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false
  })
);
app.use(express.json({ limit: "100kb" }));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const getUserId = (req) => req.user?.id || null;
const toVisibilityDetail = (visibility) => {
  if (visibility === "Public") return "Shows in directory";
  if (visibility === "Unlisted") return "Shareable link only";
  return "Owner only";
};
const minutesSince = (date) => {
  if (!date) return 0;
  return Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
};

const formatPlayer = (player) => {
  const riotId = `${player.gameName}#${player.tagLine}`;
  const wins = player.wins || 0;
  const losses = player.losses || 0;
  const total = wins + losses;
  const winratePercent = total ? Math.round((wins / total) * 100) : 0;
  const rankParts = [player.rankTier, player.rankDivision, player.lp ? `${player.lp} LP` : null]
    .filter(Boolean)
    .join(" • ");

  return {
    riotId,
    profileIconUrl: player.profileIconUrl || "",
    role: player.role,
    rank: rankParts || "Unranked",
    wins,
    losses,
    winratePercent,
    topChamps: Array.isArray(player.topChamps) ? player.topChamps : [],
    socials: [
      player.twitchUrl ? { label: player.twitchUrl.replace("https://", ""), url: player.twitchUrl } : null,
      player.twitterUrl ? { label: player.twitterUrl.replace("https://", ""), url: player.twitterUrl } : null
    ].filter(Boolean),
    socialsSummary: player.twitchUrl || player.twitterUrl ? "Socials linked" : "No socials"
  };
};

const formatMatch = (match, riotId) => ({
  player: riotId,
  champion: match.champName,
  kda: `${match.kills} / ${match.deaths} / ${match.assists}`,
  cs: match.cs,
  result: match.isWin ? "W" : "L",
  queue: match.queueType,
  duration: `${Math.round(match.durationSec / 60)}m`,
  timeAgo: `${minutesSince(match.matchTime)} min ago`
});

const shareableUrlFor = (slug) => new URL(`/leaderboards/${slug}`, config.appBaseUrl).toString();

const logError = (message, error, meta = {}, level = "error") => {
  const payload = {
    level,
    message,
    ...meta,
    error: error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      : undefined
  };

  if (level === "warn") {
    console.warn(JSON.stringify(payload));
  } else {
    console.error(JSON.stringify(payload));
  }
};

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

app.get(
  "/leaderboards",
  asyncHandler(async (req, res) => {
    const search = (req.query.search || "").toString().toLowerCase();
    const boards = await prisma.leaderboard.findMany({
      where: {
        visibility: "Public",
        name: search ? { contains: search, mode: "insensitive" } : undefined
      },
      include: {
        _count: {
          select: { players: true }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    res.json(
      boards.map((board) => ({
        id: board.id,
        name: board.name,
        description: board.description,
        slug: board.slug,
        shareableUrl: shareableUrlFor(board.slug),
        visibility: board.visibility,
        visibilityDetail: toVisibilityDetail(board.visibility),
        playerCount: board._count.players,
        updatedMinutes: minutesSince(board.lastRefreshAt || board.updatedAt),
        refreshStatus: board.lastRefreshStatus || "pending",
        nextRefreshMinutes: 30,
        players: [],
        latestGames: []
      }))
    );
  })
);

app.get(
  "/leaderboards/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    const board = await prisma.leaderboard.findUnique({
      where: { ownerId: userId },
      include: { players: true }
    });
    if (!board) {
      return res.status(404).json({ error: "Leaderboard not found" });
    }
    res.json({
      id: board.id,
      name: board.name,
      description: board.description || "",
      slug: board.slug,
      shareableUrl: shareableUrlFor(board.slug),
      visibility: board.visibility,
      visibilityDetail: toVisibilityDetail(board.visibility),
      playerCount: board.players.length,
      updatedMinutes: minutesSince(board.lastRefreshAt || board.updatedAt),
      refreshStatus: board.lastRefreshStatus || "pending",
      nextRefreshMinutes: 30,
      players: board.players.map(formatPlayer),
      latestGames: []
    });
  })
);

app.get(
  "/leaderboards/:slug",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const board = await prisma.leaderboard.findUnique({
      where: { slug: req.params.slug },
      include: {
        players: true,
        matches: {
          orderBy: { matchTime: "desc" },
          take: 10
        }
      }
    });
    if (!board) {
      return res.status(404).json({ error: "Leaderboard not found" });
    }
    const userId = getUserId(req);
    if (board.visibility === "Private" && board.ownerId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const players = board.players.map(formatPlayer);
    const latestGames = board.matches.map((match) => {
      const player = board.players.find((entry) => entry.puuid === match.puuid);
      const riotId = player ? `${player.gameName}#${player.tagLine}` : "Unknown";
      return formatMatch(match, riotId);
    });

    res.json({
      id: board.id,
      name: board.name,
      description: board.description,
      slug: board.slug,
      shareableUrl: shareableUrlFor(board.slug),
      visibility: board.visibility,
      visibilityDetail: toVisibilityDetail(board.visibility),
      playerCount: players.length,
      updatedMinutes: minutesSince(board.lastRefreshAt || board.updatedAt),
      refreshStatus: board.lastRefreshStatus || "pending",
      nextRefreshMinutes: 30,
      players,
      latestGames
    });
  })
);

const visibilitySchema = z.enum(["Public", "Unlisted", "Private"]);

app.post(
  "/leaderboards",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    const payloadSchema = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      bannerUrl: z.string().url().optional(),
      visibility: visibilitySchema
    });
    const payload = payloadSchema.parse(req.body);
    const slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const existing = await prisma.leaderboard.findUnique({ where: { ownerId: userId } });
    if (existing) {
      return res.status(409).json({ error: "User already owns a leaderboard" });
    }

    const board = await prisma.leaderboard.create({
      data: {
        ownerId: userId,
        name: payload.name,
        description: payload.description,
        bannerUrl: payload.bannerUrl,
        visibility: payload.visibility,
        slug
      }
    });

    res.status(201).json({
      id: board.id,
      name: board.name,
      description: board.description,
      slug: board.slug,
      shareableUrl: shareableUrlFor(board.slug),
      visibility: board.visibility,
      visibilityDetail: toVisibilityDetail(board.visibility),
      playerCount: 0,
      updatedMinutes: 0,
      refreshStatus: "pending",
      nextRefreshMinutes: 30,
      players: [],
      latestGames: []
    });
  })
);

app.post(
  "/leaderboards/:id/players",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    const payloadSchema = z.object({
      puuid: z.string().min(1),
      gameName: z.string().min(1),
      tagLine: z.string().min(1),
      role: z.string().min(1),
      twitchUrl: z.string().url().optional(),
      twitterUrl: z.string().url().optional()
    });
    const payload = payloadSchema.parse(req.body);

    const board = await prisma.leaderboard.findUnique({
      where: { id: req.params.id },
      include: { players: true }
    });
    if (!board || board.ownerId !== userId) {
      return res.status(404).json({ error: "Leaderboard not found" });
    }
    if (board.players.length >= 15) {
      return res.status(400).json({ error: "Leaderboard player limit reached" });
    }
    const existing = await prisma.leaderboardPlayer.findUnique({
      where: { leaderboardId_puuid: { leaderboardId: board.id, puuid: payload.puuid } }
    });
    if (existing) {
      return res.status(409).json({ error: "Player already exists on this leaderboard" });
    }

    const player = await prisma.leaderboardPlayer.create({
      data: {
        leaderboardId: board.id,
        puuid: payload.puuid,
        gameName: payload.gameName,
        tagLine: payload.tagLine,
        role: payload.role,
        twitchUrl: payload.twitchUrl,
        twitterUrl: payload.twitterUrl
      }
    });

    res.status(201).json(player);
  })
);

app.patch(
  "/leaderboards/:id/players/:playerId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    const payloadSchema = z.object({
      role: z.string().min(1).optional(),
      twitchUrl: z.string().url().optional(),
      twitterUrl: z.string().url().optional()
    });
    const payload = payloadSchema.parse(req.body);

    const board = await prisma.leaderboard.findUnique({ where: { id: req.params.id } });
    if (!board || board.ownerId !== userId) {
      return res.status(404).json({ error: "Leaderboard not found" });
    }

    const player = await prisma.leaderboardPlayer.update({
      where: { id: req.params.playerId },
      data: payload
    });
    res.json(player);
  })
);

app.delete(
  "/leaderboards/:id/players/:playerId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    const board = await prisma.leaderboard.findUnique({ where: { id: req.params.id } });
    if (!board || board.ownerId !== userId) {
      return res.status(404).json({ error: "Leaderboard not found" });
    }
    await prisma.leaderboardPlayer.delete({ where: { id: req.params.playerId } });
    res.status(204).end();
  })
);

app.get(
  "/leaderboards/:id/matches",
  asyncHandler(async (req, res) => {
  const limit = Number.parseInt(req.query.limit, 10) || 10;
  const matches = await prisma.match.findMany({
    where: { leaderboardId: req.params.id },
    orderBy: { matchTime: "desc" },
    take: Math.min(limit, 10)
  });
  res.json(matches);
  })
);

app.use((err, req, res, next) => {
  const isValidationError = err instanceof z.ZodError;
  const status = err.status || (isValidationError ? 400 : 500);
  const level = status >= 500 ? "error" : "warn";
  logError("Request failed", err, {
    status,
    method: req.method,
    route: req.originalUrl
  }, level);
  res
    .status(status)
    .json({ error: isValidationError ? "Invalid request" : status >= 500 ? "Internal server error" : err.message });
});

app.post("/refresh", (req, res) => {
  res.json({ status: "queued", detail: "Refresh job enqueued" });
});

app.listen(PORT, () => {
  console.log(`climb.lol API listening on ${PORT}`);
});
