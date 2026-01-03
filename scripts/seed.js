const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo data...');

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      id: 'demo-user-1',
      email: 'demo@example.com',
      name: 'Demo User',
      imageUrl: null,
    },
  });

  // Create demo leaderboard
  const lb = await prisma.leaderboard.upsert({
    where: { slug: 'demo' },
    update: { name: 'Demo Leaderboard' },
    create: {
      id: 'demo-lb-1',
      ownerId: user.id,
      name: 'Demo Leaderboard',
      description: 'A seeded demo leaderboard',
      slug: 'demo',
      visibility: 'Public',
    },
  });

  // Create players
  const players = [
    { puuid: 'puuid-1', gameName: 'SkyHook', tagLine: 'NA1', role: 'Top' },
    { puuid: 'puuid-2', gameName: 'Nova', tagLine: 'NA1', role: 'Jungle' },
    { puuid: 'puuid-3', gameName: 'Stellar', tagLine: 'NA1', role: 'Mid' },
  ];

  for (const p of players) {
    await prisma.leaderboardPlayer.upsert({
      where: { id: `${lb.id}-${p.puuid}` },
      update: {
        gameName: p.gameName,
        tagLine: p.tagLine,
        role: p.role,
      },
      create: {
        id: `${lb.id}-${p.puuid}`,
        leaderboardId: lb.id,
        puuid: p.puuid,
        gameName: p.gameName,
        tagLine: p.tagLine,
        role: p.role,
        profileIconUrl: null,
        wins: 10,
        losses: 5,
      },
    });
  }

  // Create some matches for latest feed
  const now = Date.now();
  const matches = [];
  for (let i = 0; i < 8; i++) {
    const player = players[i % players.length];
    matches.push({
      matchId: `match-${i + 1}`,
      leaderboardId: lb.id,
      puuid: player.puuid,
      champId: 99 + i,
      champName: `Champion${i + 1}`,
      kills: Math.floor(Math.random() * 10),
      deaths: Math.floor(Math.random() * 6),
      assists: Math.floor(Math.random() * 12),
      cs: Math.floor(Math.random() * 200),
      queueType: '420',
      durationSec: 1200 + i * 60,
      isWin: i % 2 === 0,
      matchTime: new Date(now - i * 1000 * 60 * 5),
    });
  }

  for (const m of matches) {
    try {
      await prisma.match.create({ data: m });
    } catch (e) {
      // ignore dupes
    }
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
