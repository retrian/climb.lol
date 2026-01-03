import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getLeaderboardForViewer } from "@/lib/leaderboards";
import { visibilityLabels } from "@/lib/visibility";

type PageProps = {
  params: { slug: string };
};

export default async function LeaderboardDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id ?? null;
  const leaderboard = getLeaderboardForViewer(params.slug, viewerId);

  if (!leaderboard) {
    notFound();
  }

  return (
    <main className="page">
      <section
        className="panel banner"
        style={{ backgroundImage: leaderboard.bannerGradient }}
      >
        <div className="banner__content">
          <div>
            <p className="eyebrow">Leaderboard</p>
            <h1>{leaderboard.name}</h1>
            <p className="muted">{leaderboard.description}</p>
          </div>
          <div className="banner__meta">
            <span className="pill">{leaderboard.season}</span>
            <span className="pill">
              {visibilityLabels[leaderboard.visibility]}
            </span>
            <span className="pill">{leaderboard.players.length} players</span>
            <span className="pill">NA only · Ranked stats</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <div>
            <p className="eyebrow">Roster</p>
            <h2>Leaderboard standings</h2>
            <p className="muted">
              Owner-entered roles and socials mixed with cached Riot stats. OP.GG
              links are auto-generated.
            </p>
          </div>
          <Link href="/leaderboards" className="link">
            Back to directory →
          </Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Role</th>
                <th>Riot ID</th>
                <th>Rank</th>
                <th>Winrate</th>
                <th>Top Champs</th>
                <th>Social</th>
                <th>OP.GG</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.players.map((player) => {
                const total = player.wins + player.losses;
                const winrate = Math.round((player.wins / total) * 100);
                return (
                  <tr key={player.id}>
                    <td>
                      <div className="row">
                        <div className="avatar">{player.profileInitials}</div>
                        <div>
                          <p className="strong">{player.displayName}</p>
                          <p className="muted">{player.role} main</p>
                        </div>
                      </div>
                    </td>
                    <td>{player.role}</td>
                    <td>{player.riotId}</td>
                    <td>
                      {player.rank} · {player.lp} LP
                    </td>
                    <td>
                      <div className="winrate">
                        <span>
                          {player.wins}W - {player.losses}L
                        </span>
                        <div className="winrate-bar">
                          <span style={{ width: `${winrate}%` }}>{winrate}%</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="champions">
                        {player.topChamps.map((champ) => (
                          <span
                            key={champ.name}
                            className="champ"
                            style={{ background: champ.accent }}
                            title={champ.name}
                          >
                            {champ.shortName}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="socials">
                        {player.twitchUrl && (
                          <a
                            href={player.twitchUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Twitch
                          </a>
                        )}
                        {player.twitterUrl && (
                          <a
                            href={player.twitterUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            X
                          </a>
                        )}
                      </div>
                    </td>
                    <td>
                      <a
                        href={player.opggUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="link"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="player-cards">
          {leaderboard.players.map((player) => {
            const total = player.wins + player.losses;
            const winrate = Math.round((player.wins / total) * 100);
            return (
              <article key={player.id} className="card card--player">
                <div className="row row--space">
                  <div className="row">
                    <div className="avatar avatar--lg">
                      {player.profileInitials}
                    </div>
                    <div>
                      <h3>{player.displayName}</h3>
                      <p className="muted">
                        {player.role} · {player.riotId}
                      </p>
                    </div>
                  </div>
                  <span className="pill">{player.rank}</span>
                </div>
                <div className="stack">
                  <p className="muted">Winrate</p>
                  <div className="winrate">
                    <span>
                      {player.wins}W - {player.losses}L
                    </span>
                    <div className="winrate-bar">
                      <span style={{ width: `${winrate}%` }}>{winrate}%</span>
                    </div>
                  </div>
                </div>
                <div className="stack">
                  <p className="muted">Top champions</p>
                  <div className="champions">
                    {player.topChamps.map((champ) => (
                      <span
                        key={champ.name}
                        className="champ"
                        style={{ background: champ.accent }}
                        title={champ.name}
                      >
                        {champ.shortName}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="row row--space">
                  <div className="socials">
                    {player.twitchUrl && (
                      <a
                        href={player.twitchUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Twitch
                      </a>
                    )}
                    {player.twitterUrl && (
                      <a
                        href={player.twitterUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        X
                      </a>
                    )}
                  </div>
                  <a
                    href={player.opggUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="link"
                  >
                    OP.GG →
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <div>
            <p className="eyebrow">Latest games</p>
            <h2>Recent matches across the roster</h2>
            <p className="muted">
              Cached match snapshots refresh every 30 minutes to stay fast and
              rate-limit friendly.
            </p>
          </div>
        </div>
        {leaderboard.latestGames.length === 0 ? (
          <div className="panel">
            <p className="muted">No recent games yet for this roster.</p>
          </div>
        ) : (
          <div className="grid grid--4">
            {leaderboard.latestGames.map((game) => (
              <article key={game.id} className="card card--match">
                <div className="row row--space">
                  <span
                    className={`result ${
                      game.result === "Win" ? "result--win" : "result--loss"
                    }`}
                  >
                    {game.result}
                  </span>
                  <span className="muted">{game.timeAgo}</span>
                </div>
                <div className="row">
                  <span
                    className="champ champ--lg"
                    style={{ background: game.championAccent }}
                  >
                    {game.champion.slice(0, 2)}
                  </span>
                  <div>
                    <h3>{game.champion}</h3>
                    <p className="muted">{game.playerName}</p>
                  </div>
                </div>
                <div className="match-stats">
                  <div>
                    <p className="muted">K/D/A</p>
                    <p className="strong">{game.kda}</p>
                  </div>
                  <div>
                    <p className="muted">CS</p>
                    <p className="strong">{game.cs}</p>
                  </div>
                </div>
                <div className="match-meta">
                  <span>{game.queue}</span>
                  <span>·</span>
                  <span>{game.duration}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
