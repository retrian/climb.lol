import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function NewLeaderboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="page">
      <section className="section">
        <div className="section__header">
          <div>
            <p className="eyebrow">Create leaderboard</p>
            <h1>Set up your roster</h1>
            <p className="muted">
              One leaderboard per account. Add up to 15 NA players with roles,
              Riot IDs, and optional social links.
            </p>
          </div>
          <Link href="/leaderboards" className="link">
            Browse public boards →
          </Link>
        </div>
        <div className="panel form-panel">
          <form className="form" action="#">
            <div className="form__grid">
              <label>
                Leaderboard name
                <input type="text" placeholder="Arcane Ascension" />
              </label>
              <label>
                Season
                <input type="text" placeholder="Season 14 · Split 2" />
              </label>
              <label className="span-2">
                Description (optional)
                <textarea
                  placeholder="Team goals, vibes, and meta focus."
                  rows={3}
                />
              </label>
              <label>
                Visibility
                <select>
                  <option>Public</option>
                  <option>Unlisted</option>
                  <option>Private</option>
                </select>
              </label>
              <label>
                Banner URL (optional)
                <input type="url" placeholder="https://..." />
              </label>
            </div>
            <div className="form__actions">
              <button type="submit" className="button button--primary">
                Save leaderboard
              </button>
              {session ? (
                <Link href="/dashboard" className="button button--ghost">
                  Back to dashboard
                </Link>
              ) : (
                <Link href="/api/auth/signin" className="button button--ghost">
                  Sign in
                </Link>
              )}
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
