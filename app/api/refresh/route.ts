import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMatchIdsByPuuid, getMatchById } from "@/lib/riot";

async function processLeaderboard(lb: any) {
  const refreshLog = await prisma.refreshLog.create({ data: { leaderboardId: lb.id, status: "running" } });
  let processed = 0;
  try {
    const players = await prisma.leaderboardPlayer.findMany({ where: { leaderboardId: lb.id } });

    for (const p of players) {
      // Find latest stored match time for this player
      const latest = await prisma.match.findFirst({
        where: { leaderboardId: lb.id, puuid: p.puuid },
        orderBy: { matchTime: "desc" },
        select: { matchTime: true, matchId: true },
      });

      const startTimeSec = latest ? Math.floor(new Date(latest.matchTime).getTime() / 1000) : undefined;

      // Fetch recent match IDs (limit to 10 per player for rate-safety)
      let ids: string[] = [];
      try {
        ids = await getMatchIdsByPuuid(p.puuid, startTimeSec, 10);
      } catch (e: any) {
        // Log and continue
        console.error(`Failed to fetch match ids for ${p.puuid}:`, e?.message ?? e);
        continue;
      }

      if (!ids || ids.length === 0) continue;

      // De-dupe against existing matches
      const existing = await prisma.match.findMany({ where: { matchId: { in: ids } }, select: { matchId: true } });
      const existingSet = new Set(existing.map((e) => e.matchId));
      const newIds = ids.filter((id) => !existingSet.has(id));

      for (const matchId of newIds) {
        // Fetch match detail
        let detail: any;
        try {
          detail = await getMatchById(matchId);
        } catch (e: any) {
          console.error(`Failed to fetch match ${matchId}:`, e?.message ?? e);
          continue;
        }

        try {
          const info = detail.info;
          const participant = info.participants.find((part: any) => part.puuid === p.puuid);
          if (!participant) continue;

          const champId = participant.championId ?? null;
          const champName = participant.championName ?? participant.champion ?? "";
          const kills = participant.kills ?? 0;
          const deaths = participant.deaths ?? 0;
          const assists = participant.assists ?? 0;
          const cs = (participant.totalMinionsKilled ?? 0) + (participant.neutralMinionsKilled ?? 0);
          const isWin = !!participant.win;
          const queueType = String(info.queueId ?? "");
          const durationSec = info.gameDuration ?? Math.floor((info.gameEndTimestamp - info.gameStartTimestamp) / 1000) ?? 0;
          const matchTime = info.gameStartTimestamp ? new Date(info.gameStartTimestamp) : new Date();

          await prisma.match.create({
            data: {
              matchId,
              leaderboardId: lb.id,
              puuid: p.puuid,
              champId,
              champName,
              kills,
              deaths,
              assists,
              cs,
              queueType,
              durationSec,
              isWin,
              matchTime,
            },
          });
          processed += 1;
        } catch (e: any) {
          console.error(`Failed to store match ${matchId}:`, e?.message ?? e);
          continue;
        }
      }
    }

    await prisma.leaderboard.update({ where: { id: lb.id }, data: { lastRefreshAt: new Date(), lastRefreshStatus: "success" } });
    await prisma.refreshLog.update({ where: { id: refreshLog.id }, data: { finishedAt: new Date(), status: "success" } });
    return { success: true, processed };
  } catch (e: any) {
    await prisma.leaderboard.update({ where: { id: lb.id }, data: { lastRefreshAt: new Date(), lastRefreshStatus: "error" } });
    await prisma.refreshLog.update({ where: { id: refreshLog.id }, data: { finishedAt: new Date(), status: "error", errorSummary: String(e?.message ?? e) } });
    return { success: false, error: String(e?.message ?? e) };
  }
}

export async function GET() {
  // Basic permission: allow anonymous (cron) but ensure RIOT_API_KEY is set
  if (!process.env.RIOT_API_KEY) {
    return NextResponse.json({ error: "missing_riot_api_key" }, { status: 500 });
  }

  const leaderboards = await prisma.leaderboard.findMany({ select: { id: true } });
  const results: any = [];

  for (const lb of leaderboards) {
    // Process sequentially to be kind to Riot rate limits
    // eslint-disable-next-line no-await-in-loop
    const res = await processLeaderboard(lb);
    results.push({ leaderboardId: lb.id, result: res });
  }

  return NextResponse.json({ ok: true, results });
}
