import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
        <div>
          <p className="eyebrow">Leaderboard hub</p>
          <h1>climb.lol</h1>
          <p className="subtitle">Track and share your curated League rank leaderboards.</p>
        </div>

        <div>
          {session ? (
            <div className="pill">
              <div>
                <div style={{ fontWeight: 700 }}>{session.user.name ?? "Climber"}</div>
                <div className="muted">Signed in</div>
              </div>
            </div>
          ) : (
            <div className="pill">
              <Link href="/api/auth/signin/google">Sign in</Link>
            </div>
          )}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 24 }}>
        <h2>Get started</h2>
        <p className="muted">Browse public leaderboards or sign in to create and manage your own leaderboard.</p>
        <div style={{ marginTop: 16 }}>
          <Link href="/leaderboards" className="pill">View Leaderboards</Link>{" "}
          <Link href="/dashboard" className="pill">Dashboard</Link>
        </div>
      </div>
    </section>
  );
}
