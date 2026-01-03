import Link from "next/link";
import { getPublicLeaderboards } from "../../lib/leaderboards";
import { visibilityLabels } from "../../lib/visibility";

export default function LeaderboardsPage() {
  const leaderboards = getPublicLeaderboards();

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Leaderboards</h1>
      <p>Only public leaderboards appear in the directory.</p>
      <ul>
        {leaderboards.map((leaderboard) => (
          <li key={leaderboard.slug}>
            <Link href={`/leaderboards/${leaderboard.slug}`}>
              {leaderboard.name}
            </Link>{" "}
            <span>({visibilityLabels[leaderboard.visibility]})</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
