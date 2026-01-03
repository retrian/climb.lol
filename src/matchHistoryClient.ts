import type { MatchSummary } from "./db.js";

type MatchHistoryResponse = {
  matches: Array<{
    id: string;
    leaderboardId: string;
    playerId: string;
    score: number;
    rank: number;
    endedAt: string;
  }>;
};

const BASE_URL = process.env.MATCH_HISTORY_BASE_URL ?? "https://api.climb.lol";

export async function fetchMatchHistory(
  leaderboardId: string,
  since: string | null,
): Promise<MatchSummary[]> {
  const url = new URL(`/leaderboards/${leaderboardId}/matches`, BASE_URL);
  if (since) {
    url.searchParams.set("since", since);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch match history: ${response.status}`);
  }

  const payload = (await response.json()) as MatchHistoryResponse;
  return payload.matches.map((match) => ({
    id: match.id,
    leaderboardId: match.leaderboardId,
    playerId: match.playerId,
    score: match.score,
    rank: match.rank,
    endedAt: match.endedAt,
  }));
}
