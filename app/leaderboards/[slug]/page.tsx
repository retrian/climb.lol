import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";
import { visibilityLabels } from "../../../lib/visibility";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PlayerManager from "./components/PlayerManager";

type PageProps = {
  params: { slug: string };
};

export default async function LeaderboardDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id ?? null;

  const leaderboard = await prisma.leaderboard.findUnique({
    where: { slug: params.slug },
    include: { players: true },
  });

  if (!leaderboard) notFound();

  if (leaderboard.visibility === "Private" && leaderboard.ownerId !== viewerId) {
    notFound();
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>{leaderboard.name ?? "Your leaderboard"}</h1>
      {(() => {
        const visKey = (String(leaderboard.visibility).toLowerCase() as
          | "public"
          | "unlisted"
          | "private");
        return <p>Visibility: {visibilityLabels[visKey]}</p>;
      })()}
      <ul>
        {leaderboard.players.map((p) => (
          <li key={p.id}>
            {p.gameName}#{p.tagLine} — {p.role}
          </li>
        ))}
      </ul>

      {/* Player manager client component (owner-only actions) */}
      {leaderboard.ownerId === session?.user?.id ? (
        <PlayerManager slug={leaderboard.slug} initialPlayers={leaderboard.players} />
      ) : null}
    </main>
  );
}
