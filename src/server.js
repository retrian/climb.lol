const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
app.use(express.json());

const prisma = new PrismaClient();

function logError(message, error, meta = {}, level = 'error') {
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

  if (level === 'warn') {
    console.warn(JSON.stringify(payload));
  } else {
    console.error(JSON.stringify(payload));
  }
}

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

async function resolvePuuid(gameName, tagLine) {
  const apiKey = process.env.RIOT_API_KEY;
  if (!apiKey) {
    const error = new Error('RIOT_API_KEY is not configured');
    error.status = 500;
    throw error;
  }

  const encodedGameName = encodeURIComponent(gameName);
  const encodedTagLine = encodeURIComponent(tagLine);
  const url = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodedGameName}/${encodedTagLine}`;

  const response = await fetch(url, {
    headers: {
      'X-Riot-Token': apiKey
    }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    const error = new Error(`Riot API request failed: ${response.status} ${errorBody}`);
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  return data.puuid;
}

app.get(
  '/api/leaderboards/:id/players',
  asyncHandler(async (req, res) => {
    const players = await prisma.leaderboardPlayer.findMany({
      where: { leaderboardId: req.params.id },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ players });
  })
);

app.post(
  '/api/leaderboards/:id/players',
  asyncHandler(async (req, res) => {
    const { gameName, tagLine } = req.body || {};

    if (!gameName || !tagLine) {
      return res.status(400).json({ error: 'gameName and tagLine are required' });
    }

    let puuid;
    try {
      puuid = await resolvePuuid(gameName, tagLine);
    } catch (error) {
      logError('Failed to resolve player PUUID', error, {
        leaderboardId: req.params.id,
        gameName,
        tagLine
      });
      const status = error.status || 500;
      return res
        .status(status)
        .json({ error: status === 500 ? 'Failed to resolve player' : error.message });
    }

    const leaderboardId = req.params.id;
    const playerCount = await prisma.leaderboardPlayer.count({
      where: { leaderboardId }
    });

    if (playerCount >= 15) {
      return res.status(400).json({ error: 'Leaderboards are limited to 15 players' });
    }

    const existing = await prisma.leaderboardPlayer.findUnique({
      where: { leaderboardId_puuid: { leaderboardId, puuid } }
    });

    if (existing) {
      return res.status(409).json({ error: 'Player already exists on this leaderboard' });
    }

    const player = await prisma.leaderboardPlayer.create({
      data: {
        leaderboardId,
        puuid,
        gameName,
        tagLine
      }
    });

    return res.status(201).json({ player });
  })
);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const level = status >= 500 ? 'error' : 'warn';
  logError('Request failed', err, {
    status,
    method: req.method,
    route: req.originalUrl
  }, level);
  res
    .status(status)
    .json({ error: status >= 500 ? 'Internal server error' : err.message });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on port ${port}`);
});
