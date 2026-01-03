import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function NewLeaderboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <main style={{ padding: "3rem" }}>
      <h1>Create your leaderboard</h1>
      <p>Only one leaderboard is allowed per owner.</p>
      <form action="/api/leaderboards" method="post">
        <label style={{ display: "block", marginBottom: "1rem" }}>
          Name
          <input
            type="text"
            name="name"
            placeholder="Summit crushers"
            style={{ display: "block", marginTop: "0.5rem" }}
          />
        </label>
        <button type="submit">Create leaderboard</button>
      </form>
      <div style={{ marginTop: "1.5rem" }}>
        {session ? (
          <Link href="/dashboard">Back to dashboard</Link>
        ) : (
          <Link href="/api/auth/signin">Sign in</Link>
        )}
      </div>
    </main>
  );
}
