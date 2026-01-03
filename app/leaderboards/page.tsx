import Link from "next/link";
import { getPublicLeaderboards } from "@/lib/leaderboards";
import { visibilityLabels } from "@/lib/visibility";

export default function LeaderboardsPage() {
  const leaderboards = getPublicLeaderboards();

  return (
    <main className="page">
      <section className="section">
        <div className="section__header">
          <div>
            <p className="eyebrow">Leaderboards</p>
            <h1>Public directory</h1>
            <p className="muted">
              Browse live leaderboards. Unlisted boards stay off this list and are
              accessible by direct link only.
            </p>
          </div>
          <Link href="/leaderboards/new" className="button button--ghost">
            Create leaderboard
          </Link>
        </div>
        <div className="grid grid--3">
          {leaderboards.map((leaderboard) => (
            <article key={leaderboard.id} className="card card--leaderboard">
              <div
                className="card__banner"
                style={{ backgroundImage: leaderboard.bannerGradient }}
              />
              <div className="card__body">
                <h2>{leaderboard.name}</h2>
                <p className="muted">{leaderboard.description}</p>
                <div className="pill-row">
                  <span className="pill">{leaderboard.season}</span>
                  <span className="pill">
                    {visibilityLabels[leaderboard.visibility]}
                  </span>
                  <span className="pill">
                    {leaderboard.players.length} players
                  </span>
                </div>
              </div>
              <Link
                href={`/leaderboards/${leaderboard.slug}`}
                className="link"
              >
                View leaderboard →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
