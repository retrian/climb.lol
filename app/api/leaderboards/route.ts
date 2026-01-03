import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  if (!prisma) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.leaderboard.findUnique({
    where: { ownerId: session.user.id },
  });

  if (existing) {
    return NextResponse.json(
      { error: "User already owns a leaderboard" },
      { status: 409 }
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  let name: string | null = null;

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { name?: string };
    name = body.name ?? null;
  } else if (contentType.includes("form")) {
    const formData = await request.formData();
    const formName = formData.get("name");
    name = typeof formName === "string" ? formName : null;
  }

  const created = await prisma.leaderboard.create({
    data: {
      ownerId: session.user.id,
      name: name?.trim() || null,
    },
  });

  if (contentType.includes("form")) {
    const url = new URL(`/leaderboards/${created.id}`, request.url);
    return NextResponse.redirect(url, { status: 303 });
  }

  return NextResponse.json(
    { id: created.id, ownerId: created.ownerId, name: created.name },
    { status: 201 }
  );
}
