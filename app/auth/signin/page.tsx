import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions, providerMetadata } from "@/lib/auth";
import SignInOptions from "./sign-in-options";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <main className="page">
      <section className="section">
        <div className="section__header">
          <div>
            <p className="eyebrow">Sign in</p>
            <h1>Connect your Riot identity</h1>
            <p className="muted">
              Riot Sign On (RSO) is the preferred authentication method, but it
              requires production approval. Until then, configure OAuth providers
              or use demo access locally.
            </p>
          </div>
          <Link href="/" className="link">
            Back to home →
          </Link>
        </div>

        <div className="panel auth-panel">
          <div className="auth-copy">
            <h2>Authentication options</h2>
            <p className="muted">
              When RSO is approved, users will sign in with their Riot account and
              create exactly one leaderboard. For now, enable Google or Discord
              OAuth to test production-like flows.
            </p>
            <ul className="list">
              <li>RSO OAuth/OIDC (primary, requires approval)</li>
              <li>Google/Discord OAuth (fallback while awaiting RSO)</li>
              <li>Demo credentials (local-only preview)</li>
            </ul>
          </div>
          <SignInOptions providers={providerMetadata} />
        </div>
      </section>
    </main>
  );
}
