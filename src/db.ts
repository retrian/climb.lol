import Database from "better-sqlite3";

export type MatchSummary = {
  id: string;
  leaderboardId: string;
  playerId: string;
  score: number;
  rank: number;
  endedAt: string;
};

const db = new Database("./data.sqlite");

db.exec(`
  CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    leaderboard_id TEXT NOT NULL,
    player_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    rank INTEGER NOT NULL,
    ended_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS matches_leaderboard_ended_at
    ON matches (leaderboard_id, ended_at DESC);
`);

export const matchesStore = {
  getLatestEndedAt(leaderboardId: string): string | null {
    const row = db
      .prepare(
        "SELECT ended_at as endedAt FROM matches WHERE leaderboard_id = ? ORDER BY ended_at DESC LIMIT 1",
      )
      .get(leaderboardId) as { endedAt?: string } | undefined;
    return row?.endedAt ?? null;
  },

  upsertMatches(matches: MatchSummary[]): number {
    const insert = db.prepare(
      `
        INSERT INTO matches (id, leaderboard_id, player_id, score, rank, ended_at)
        VALUES (@id, @leaderboardId, @playerId, @score, @rank, @endedAt)
        ON CONFLICT(id) DO UPDATE SET
          leaderboard_id = excluded.leaderboard_id,
          player_id = excluded.player_id,
          score = excluded.score,
          rank = excluded.rank,
          ended_at = excluded.ended_at
      `,
    );
    const transaction = db.transaction((rows: MatchSummary[]) => {
      for (const row of rows) {
        insert.run(row);
      }
    });
    transaction(matches);
    return matches.length;
  },

  getLatestMatches(leaderboardId: string, limit: number): MatchSummary[] {
    return db
      .prepare(
        `
          SELECT
            id,
            leaderboard_id as leaderboardId,
            player_id as playerId,
            score,
            rank,
            ended_at as endedAt
          FROM matches
          WHERE leaderboard_id = ?
          ORDER BY ended_at DESC
          LIMIT ?
        `,
      )
      .all(leaderboardId, limit) as MatchSummary[];
  },
};

export default db;
