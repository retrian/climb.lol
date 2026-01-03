import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(request: Request, { params }: { params: { slug: string; playerId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const leaderboard = await prisma.leaderboard.findUnique({ where: { slug: params.slug } });
  if (!leaderboard) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (leaderboard.ownerId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const player = await prisma.leaderboardPlayer.findUnique({ where: { id: params.playerId } });
  if (!player || player.leaderboardId !== leaderboard.id) {
    return NextResponse.json({ error: "player_not_found" }, { status: 404 });
  }

  await prisma.leaderboardPlayer.delete({ where: { id: params.playerId } });

  return NextResponse.json({ success: true }, { status: 200 });
}
