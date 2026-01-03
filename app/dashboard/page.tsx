import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLeaderboardsForOwner } from "@/lib/leaderboards";
import { visibilityLabels } from "@/lib/visibility";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const leaderboards = getLeaderboardsForOwner(session.user.id);

  return (
    <main className="page">
      <section className="section">
        <div className="section__header">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Manage your leaderboard</h1>
            <p className="muted">
              You can create exactly one leaderboard per account. Keep it public,
              unlisted, or private.
            </p>
          </div>
          <Link href="/leaderboards/new" className="button button--ghost">
            Create leaderboard
          </Link>
        </div>
        {leaderboards.length === 0 ? (
          <div className="panel">
            <h2>No leaderboard yet</h2>
            <p className="muted">
              Create your NA roster, set roles, and start tracking ranked-only
              stats.
            </p>
            <Link href="/leaderboards/new" className="button button--primary">
              Create now
            </Link>
          </div>
        ) : (
          <div className="grid grid--2">
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
                    <span className="pill">
                      {visibilityLabels[leaderboard.visibility]}
                    </span>
                    <span className="pill">{leaderboard.season}</span>
                  </div>
                </div>
                <div className="card__actions">
                  <Link
                    href={`/leaderboards/${leaderboard.slug}`}
                    className="link"
                  >
                    View public page →
                  </Link>
                  <Link href="/leaderboards/new" className="link">
                    Edit settings →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
