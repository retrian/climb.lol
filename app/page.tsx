import Link from "next/link";
import {
  getFeaturedLeaderboard,
  getPublicLeaderboards,
} from "@/lib/leaderboards";
import { visibilityLabels } from "@/lib/visibility";

export default function HomePage() {
  const featured = getFeaturedLeaderboard();
  const publicLeaderboards = getPublicLeaderboards();

  return (
    <main className="page">
      <section className="hero">
        <div className="hero__content">
          <p className="eyebrow">Public NA LoL leaderboards</p>
          <h1>
            A clean, modern leaderboard hub that mixes Riot stats with your own
            team context.
          </h1>
          <p className="lead">
            Build exactly one leaderboard per account, add up to 15 NA players,
            and publish a polished roster with ranked-only champion insights and
            match summaries.
          </p>
          <div className="hero__actions">
            <Link href="/leaderboards" className="button button--primary">
              Browse leaderboards
            </Link>
            <Link href="/leaderboards/new" className="button button--ghost">
              Create your leaderboard
            </Link>
          </div>
          <div className="hero__stats">
            <div>
              <p className="stat">1</p>
              <p className="muted">Leaderboard per account</p>
            </div>
            <div>
              <p className="stat">15</p>
              <p className="muted">NA-only players max</p>
            </div>
            <div>
              <p className="stat">30m</p>
              <p className="muted">Refresh cadence</p>
            </div>
          </div>
        </div>
        <div className="hero__panel">
          <div className="panel panel--glow">
            <p className="eyebrow">Featured leaderboard</p>
            <h2>{featured.name}</h2>
            <p className="muted">{featured.description}</p>
            <div className="pill-row">
              <span className="pill">{featured.season}</span>
              <span className="pill">
                {visibilityLabels[featured.visibility]}
              </span>
              <span className="pill">
                {featured.players.length} active players
              </span>
            </div>
            <div className="preview-list">
              {featured.players.slice(0, 3).map((player) => {
                const total = player.wins + player.losses;
                const winrate = Math.round((player.wins / total) * 100);
                return (
                  <div className="preview-card" key={player.id}>
                    <div className="avatar avatar--lg">{player.profileInitials}</div>
                    <div>
                      <p className="preview-card__name">{player.displayName}</p>
                      <p className="muted">
                        {player.role} · {player.rank} ({player.lp} LP)
                      </p>
                    </div>
                    <div className="preview-card__winrate">
                      <span>{player.wins}W - {player.losses}L</span>
                      <div className="winrate-bar">
                        <span style={{ width: `${winrate}%` }}>{winrate}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <div>
            <p className="eyebrow">Product snapshot</p>
            <h2>What this site delivers</h2>
          </div>
          <Link href="/leaderboards" className="link">
            View public directory →
          </Link>
        </div>
        <div className="grid grid--3">
          <article className="card">
            <h3>Public + private leaderboards</h3>
            <p className="muted">
              Directory lists only public leaderboards. Unlisted leaderboards are
              link-only. Private boards are visible only to the owner.
            </p>
          </article>
          <article className="card">
            <h3>Hybrid roster data</h3>
            <p className="muted">
              Owners control roles, Riot IDs, and social links. Riot API snapshots
              fill in ranks, win rates, profile icons, and top champions.
            </p>
          </article>
          <article className="card">
            <h3>Latest games roll-up</h3>
            <p className="muted">
              Aggregated recent matches for every player are displayed below each
              leaderboard with champion, K/D/A, CS, and queue metadata.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <div>
            <p className="eyebrow">Blueprint</p>
            <h2>Recommended stack + architecture</h2>
          </div>
        </div>
        <div className="grid grid--2">
          <article className="card">
            <h3>Tech stack</h3>
            <ul className="list">
              <li>Next.js 14 App Router + React 18 + TypeScript</li>
              <li>NextAuth (RSO first, fallback OAuth/email providers)</li>
              <li>Prisma ORM + Postgres (Render managed instance)</li>
              <li>Redis or Postgres JSON for cached Riot snapshots</li>
              <li>CSS modules or Tailwind (this UI uses global CSS)</li>
            </ul>
          </article>
          <article className="card">
            <h3>Hosting split</h3>
            <ul className="list">
              <li>Frontend: Vercel (edge caching + ISR)</li>
              <li>Backend + DB: Render (API routes + cron jobs)</li>
              <li>Background refresh: Render cron every 30 minutes</li>
            </ul>
          </article>
          <article className="card">
            <h3>Data freshness</h3>
            <ul className="list">
              <li>Store Riot API data as snapshots on refresh</li>
              <li>Serve stale data immediately (stale-while-revalidate)</li>
              <li>Refresh per leaderboard or per player batch, not per page load</li>
              <li>Surface last refresh timestamps + status in UI</li>
            </ul>
          </article>
          <article className="card">
            <h3>Auth strategy</h3>
            <ul className="list">
              <li>Primary: Riot Sign On (OAuth/OpenID Connect)</li>
              <li>Fallback: Magic link + Google/Discord OAuth for MVP</li>
              <li>Reason: RSO production keys require approval and review</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <div>
            <p className="eyebrow">System design</p>
            <h2>Schema, API routes, and Riot data flow</h2>
          </div>
        </div>
        <div className="grid grid--2">
          <article className="card">
            <h3>Database schema</h3>
            <ul className="list">
              <li>User (1:1 leaderboard limit)</li>
              <li>Leaderboard (name, description, season, visibility)</li>
              <li>LeaderboardPlayer (role, Riot ID, socials, cached stats)</li>
              <li>Match (recent games, queue, K/D/A, CS, win)</li>
              <li>RefreshLog (cron job audit + errors)</li>
            </ul>
          </article>
          <article className="card">
            <h3>API surface</h3>
            <ul className="list">
              <li>POST /api/auth/rso (Riot OAuth callback)</li>
              <li>GET /api/leaderboards (public directory)</li>
              <li>POST /api/leaderboards (create, 1 per user)</li>
              <li>PATCH /api/leaderboards/:id (edit settings + visibility)</li>
              <li>POST /api/leaderboards/:id/players (max 15)</li>
              <li>DELETE /api/leaderboards/:id/players/:playerId</li>
              <li>POST /api/refresh/:leaderboardId (cron-triggered refresh)</li>
            </ul>
          </article>
          <article className="card">
            <h3>Riot API integration</h3>
            <ol className="list list--ordered">
              <li>Resolve Riot ID → account-v1 (PUUID)</li>
              <li>PUUID → summoner-v4 for profile icon + name</li>
              <li>Summoner ID → league-v4 for ranked stats</li>
              <li>PUUID → match-v5 for latest matches (ranked only)</li>
              <li>Map champion IDs via Data Dragon</li>
            </ol>
          </article>
          <article className="card">
            <h3>Security checklist</h3>
            <ul className="list">
              <li>Rate-limit API routes + cron endpoints</li>
              <li>Validate inputs (zod + server-side guards)</li>
              <li>Store secrets in Render/Vercel env vars</li>
              <li>Rotate Riot API keys and track quota usage</li>
              <li>Auth sessions via secure, HTTP-only cookies</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <div>
            <p className="eyebrow">Build plan</p>
            <h2>Step-by-step rollout</h2>
          </div>
        </div>
        <div className="grid grid--2">
          <article className="card">
            <h3>MVP (2-3 weeks)</h3>
            <ol className="list list--ordered">
              <li>Scaffold Next.js + Prisma + Postgres</li>
              <li>Implement leaderboards CRUD + 1-per-user gate</li>
              <li>Wire Riot ID to PUUID mapping + ranked stats cache</li>
              <li>Public directory + private/unlisted routing</li>
              <li>Latest games section + Data Dragon assets</li>
            </ol>
          </article>
          <article className="card">
            <h3>Enhancements</h3>
            <ol className="list list--ordered">
              <li>RSO auth approval + migration from fallback provider</li>
              <li>Queue filtering + advanced match stats</li>
              <li>Custom themes + banner uploads via CDN</li>
              <li>Shareable embeds + export to PNG</li>
              <li>Observability dashboards (Sentry + Render metrics)</li>
            </ol>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <div>
            <p className="eyebrow">Public directory</p>
            <h2>Live leaderboards</h2>
          </div>
        </div>
        <div className="grid grid--3">
          {publicLeaderboards.map((leaderboard) => (
            <article key={leaderboard.id} className="card card--leaderboard">
              <div className="card__banner" style={{ backgroundImage: leaderboard.bannerGradient }} />
              <div className="card__body">
                <h3>{leaderboard.name}</h3>
                <p className="muted">{leaderboard.description}</p>
                <div className="pill-row">
                  <span className="pill">{leaderboard.season}</span>
                  <span className="pill">{leaderboard.players.length} players</span>
                </div>
              </div>
              <Link href={`/leaderboards/${leaderboard.slug}`} className="link">
                View leaderboard →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
