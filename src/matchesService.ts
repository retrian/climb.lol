import { matchesStore } from "./db.js";
import { fetchMatchHistory } from "./matchHistoryClient.js";

export async function syncMatches(leaderboardId: string): Promise<number> {
  const latestEndedAt = matchesStore.getLatestEndedAt(leaderboardId);
  const newMatches = await fetchMatchHistory(leaderboardId, latestEndedAt);

  if (newMatches.length === 0) {
    return 0;
  }

  return matchesStore.upsertMatches(newMatches);
}
