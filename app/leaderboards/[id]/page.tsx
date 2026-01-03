import Link from "next/link";
import { prisma } from "@/lib/db";

interface LeaderboardPageProps {
  params: { id: string };
}

export default async function LeaderboardPage({ params }: LeaderboardPageProps) {
  const leaderboard = await prisma.leaderboard.findUnique({
    where: { id: params.id },
  });

  if (!leaderboard) {
    return (
      <main style={{ padding: "3rem" }}>
        <h1>Leaderboard not found</h1>
        <Link href="/dashboard">Back to dashboard</Link>
      </main>
    );
  }

  return (
    <main style={{ padding: "3rem" }}>
      <h1>{leaderboard.name ?? "Your leaderboard"}</h1>
      <p>Owner ID: {leaderboard.ownerId}</p>
      <Link href="/dashboard">Back to dashboard</Link>
    </main>
  );
}
