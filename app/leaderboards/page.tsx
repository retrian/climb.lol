import Link from "next/link";
export const dynamic = "force-dynamic";
import { visibilityLabels } from "../../lib/visibility";
import { prisma } from "@/lib/db";

export default async function LeaderboardsPage() {
  const leaderboards = await prisma.leaderboard.findMany({
    where: { visibility: "Public" },
    select: { name: true, slug: true, visibility: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Leaderboards</h1>
      <p>Only public leaderboards appear in the directory.</p>
      <ul>
        {leaderboards.map((leaderboard) => (
          <li key={leaderboard.slug}>
            <Link href={`/leaderboards/${leaderboard.slug}`}>
              {leaderboard.name}
            </Link>{" "}
            {(() => {
              const visKey = (String(leaderboard.visibility).toLowerCase() as
                | "public"
                | "unlisted"
                | "private");
              return <span>({visibilityLabels[visKey]})</span>;
            })()}
          </li>
        ))}
      </ul>
    </main>
  );
}
