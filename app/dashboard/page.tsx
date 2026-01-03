import Link from "next/link";
import { getLeaderboardsForOwner } from "../../lib/leaderboards";
import { visibilityLabels } from "../../lib/visibility";
import { getViewerId } from "../../lib/viewer";

export default function DashboardPage() {
  const viewerId = getViewerId();
  const leaderboards = getLeaderboardsForOwner(viewerId);

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Dashboard</h1>
      <p>Your private and unlisted leaderboards stay hidden from the directory.</p>
      <ul>
        {leaderboards.map((leaderboard) => (
          <li key={leaderboard.slug}>
            <Link href={`/leaderboards/${leaderboard.slug}`}>
              {leaderboard.name}
            </Link>{" "}
            <span>({visibilityLabels[leaderboard.visibility]})</span>
          </li>
        ))}
      </ul>
    </main>
  );
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const existing = await prisma.leaderboard.findUnique({
    where: { ownerId: session.user.id },
  });

  if (existing) {
    redirect(`/leaderboards/${existing.id}`);
  }

  redirect("/leaderboards/new");
}
