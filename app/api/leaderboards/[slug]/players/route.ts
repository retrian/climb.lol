import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { resolveRiotIdToPuuid, makeProfileIconUrl } from "@/lib/riot";

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leaderboard = await prisma.leaderboard.findUnique({ where: { slug: params.slug } });
  if (!leaderboard) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (leaderboard.ownerId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const riotId = (body.riotId as string) ?? "";
  const role = (body.role as string) ?? "";
  const twitchUrl = (body.twitchUrl as string) ?? null;
  const twitterUrl = (body.twitterUrl as string) ?? null;

  if (!riotId) return NextResponse.json({ error: "riotId_required" }, { status: 400 });

  // Enforce 15-player cap
  const count = await prisma.leaderboardPlayer.count({ where: { leaderboardId: leaderboard.id } });
  if (count >= 15) return NextResponse.json({ error: "player_limit_reached" }, { status: 409 });

  // Resolve Riot ID to PUUID (NA-only enforced in resolver)
  let resolved;
  try {
    resolved = await resolveRiotIdToPuuid(riotId);
  } catch (err: any) {
    if (err?.code === "region_not_supported") {
      return NextResponse.json({ error: "region_not_supported" }, { status: 400 });
    }
    if (err?.code === "missing_riot_api_key") {
      return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
    }
    if (err?.code === "summoner_not_found") {
      return NextResponse.json({ error: "summoner_not_found" }, { status: 404 });
    }
    return NextResponse.json({ error: "riot_lookup_failed" }, { status: 502 });
  }

  // Create player; rely on DB unique constraint to avoid duplicate puuid entries per leaderboard
  try {
    const created = await prisma.leaderboardPlayer.create({
      data: {
        leaderboardId: leaderboard.id,
        puuid: resolved.puuid,
        gameName: resolved.gameName,
        tagLine: resolved.tagLine ?? "",
        role,
        twitchUrl,
        twitterUrl,
        profileIconUrl: makeProfileIconUrl(resolved.profileIconId) ?? undefined,
        lastRefreshedAt: null,
      },
    });

    return NextResponse.json({ id: created.id, puuid: created.puuid }, { status: 201 });
  } catch (e: any) {
    // Handle unique constraint violations
    const msg = e?.message ?? String(e);
    if (msg.includes("Unique constraint failed") || msg.includes("duplicate key")) {
      return NextResponse.json({ error: "player_already_exists" }, { status: 409 });
    }

    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
}
