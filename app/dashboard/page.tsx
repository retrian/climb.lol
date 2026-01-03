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
