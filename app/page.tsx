import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <main style={{ padding: "3rem" }}>
      <h1>climb.lol</h1>
      <p>Track and share your climbing leaderboard.</p>
      {session ? (
        <div>
          <p>Welcome back, {session.user.name ?? "climber"}.</p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <Link href="/dashboard">Go to dashboard</Link>
            <Link href="/api/auth/signout">Sign out</Link>
          </div>
        </div>
      ) : (
        <div>
          <p>Sign in to create your leaderboard.</p>
          <ul>
            <li>
              <Link href="/api/auth/signin/google">Sign in with Google</Link>
            </li>
            <li>
              <Link href="/api/auth/signin/discord">Sign in with Discord</Link>
            </li>
          </ul>
        </div>
      )}
    </main>
  );
}
