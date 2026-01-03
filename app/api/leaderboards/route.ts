import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
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

  // Generate a URL-friendly slug from the name (or a short random id)
  function slugify(input: string | null) {
    if (!input) return null;
    const s = input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .slice(0, 60);
    return s || null;
  }

  let baseSlug = slugify(name?.trim() || null) ?? null;

  // Fallback to short random slug when name is empty
  function randomSlug() {
    return Math.random().toString(36).slice(2, 9);
  }

  if (!baseSlug) baseSlug = randomSlug();

  // Ensure slug uniqueness by appending a counter if needed
  let slug = baseSlug;
  let counter = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const exists = await prisma.leaderboard.findUnique({ where: { slug } });
    if (!exists) break;
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  // Ensure owner user row exists in our database. NextAuth may not persist users to Prisma
  // (no adapter configured), so create or resolve a matching `User` row before creating
  // the leaderboard to avoid foreign key errors.
  const sessionUserId = session.user.id as string;

  let owner = await prisma.user.findUnique({ where: { id: sessionUserId } });
  if (!owner && session.user.email) {
    owner = await prisma.user.findUnique({ where: { email: session.user.email } });
  }

  if (!owner) {
    if (!session.user.email) {
      return NextResponse.json({ error: "missing_user_email" }, { status: 400 });
    }
    try {
      owner = await prisma.user.create({
        data: {
          id: sessionUserId,
          email: session.user.email,
          name: session.user.name ?? null,
          imageUrl: (session.user.image as string) ?? null,
        },
      });
    } catch (e: any) {
      // If create failed due to email already used by another record, fall back to that record
      if (session.user.email) {
        const byEmail = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (byEmail) owner = byEmail;
      }
      if (!owner) throw e;
    }
  }

  const created = await prisma.leaderboard.create({
    data: {
      ownerId: owner.id,
      name: name?.trim() || "",
      slug,
    },
  });

  if (contentType.includes("form")) {
    const url = new URL(`/leaderboards/${created.slug}`, request.url);
    return NextResponse.redirect(url, { status: 303 });
  }

  return NextResponse.json(
    { id: created.id, ownerId: created.ownerId, name: created.name, slug: created.slug },
    { status: 201 }
  );
}
