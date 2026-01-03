import type { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLeaderboardsForOwner } from "@/lib/leaderboards";
import "../styles.css";

export const metadata = {
  title: "climb.lol · League of Legends Leaderboards",
  description:
    "Create and share League of Legends leaderboards with live Riot stats, curated player roles, and recency snapshots.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  const ownsLeaderboard = getLeaderboardsForOwner(userId).length > 0;

  return (
    <html lang="en">
      <body>
        <header className="nav">
          <div className="nav__inner">
            <Link href="/" className="brand">
              climb<span>.lol</span>
            </Link>
            <nav className="nav__links">
              <Link href="/">Home</Link>
              <Link href="/leaderboards">Leaderboards</Link>
              {!session ? (
                <Link href="/auth/signin" className="button button--ghost">
                  Sign in
                </Link>
              ) : (
                <>
                  {ownsLeaderboard ? (
                    <Link href="/dashboard" className="button button--ghost">
                      My Leaderboard
                    </Link>
                  ) : (
                    <Link href="/leaderboards/new" className="button button--ghost">
                      Create Leaderboard
                    </Link>
                  )}
                  <Link href="/api/auth/signout" className="button button--ghost">
                    Sign out
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
        {children}
        <footer className="footer">
          <div className="footer__inner">
            <div>
              <p className="footer__brand">climb.lol</p>
              <p className="muted">
                Public LoL leaderboards with curated roles, Riot stats, and
                30-minute refresh cycles.
              </p>
            </div>
            <div className="footer__links">
              <Link href="/leaderboards">Browse leaderboards</Link>
              <Link href="/leaderboards/new">Create leaderboard</Link>
              <a
                href="https://developer.riotgames.com/"
                target="_blank"
                rel="noreferrer"
              >
                Riot Games API
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
