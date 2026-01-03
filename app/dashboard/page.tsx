import Link from "next/link";
import { getLeaderboardsForOwner } from "../../lib/leaderboards";
import { visibilityLabels } from "../../lib/visibility";
import { getViewerId } from "../../lib/viewer";

export default function DashboardPage() {
  const viewerId = getViewerId();
  const leaderboards = getLeaderboardsForOwner(viewerId);

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Dashboard</h1>
      <p>Your private and unlisted leaderboards stay hidden from the directory.</p>
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
