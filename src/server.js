const express = require('express');

const app = express();
app.use(express.json());

const leaderboards = new Map();

function getLeaderboard(id) {
  if (!leaderboards.has(id)) {
    leaderboards.set(id, new Map());
  }
  return leaderboards.get(id);
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

app.get('/api/leaderboards/:id/players', (req, res) => {
  const leaderboard = getLeaderboard(req.params.id);
  res.json({
    players: Array.from(leaderboard.values())
  });
});

app.post('/api/leaderboards/:id/players', async (req, res) => {
  const { gameName, tagLine } = req.body || {};

  if (!gameName || !tagLine) {
    return res.status(400).json({ error: 'gameName and tagLine are required' });
  }

  let puuid;
  try {
    puuid = await resolvePuuid(gameName, tagLine);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message });
  }

  const leaderboard = getLeaderboard(req.params.id);

  if (leaderboard.size >= 15) {
    return res.status(400).json({ error: 'Leaderboards are limited to 15 players' });
  }

  if (leaderboard.has(puuid)) {
    return res.status(409).json({ error: 'Player already exists on this leaderboard' });
  }

  const player = {
    puuid,
    gameName,
    tagLine
  };

  leaderboard.set(puuid, player);

  return res.status(201).json({ player });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on port ${port}`);
});
