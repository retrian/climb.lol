import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
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
    // Redirect to slug-based URL
    redirect(`/leaderboards/${existing.slug}`);
  }

  redirect("/leaderboards/new");
}
