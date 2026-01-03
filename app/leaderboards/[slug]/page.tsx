import { notFound } from "next/navigation";
import { getLeaderboardForViewer } from "../../../lib/leaderboards";
import { visibilityLabels } from "../../../lib/visibility";
import { getViewerId } from "../../../lib/viewer";

type PageProps = {
  params: { slug: string };
};

export default function LeaderboardDetailPage({ params }: PageProps) {
  const viewerId = getViewerId();
  const leaderboard = getLeaderboardForViewer(params.slug, viewerId);

  if (!leaderboard) {
    notFound();
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>{leaderboard.name}</h1>
      <p>Visibility: {visibilityLabels[leaderboard.visibility]}</p>
      <ul>
        {leaderboard.entries.map((entry) => (
          <li key={entry.climber}>
            {entry.climber} — {entry.score}
          </li>
        ))}
      </ul>
    </main>
  );
}
