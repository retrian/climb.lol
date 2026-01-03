"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import type { AuthProviderMeta } from "@/lib/auth";

type SignInOptionsProps = {
  providers: AuthProviderMeta[];
};

export default function SignInOptions({ providers }: SignInOptionsProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const oauthProviders = providers.filter((provider) => provider.type === "oauth");
  const credentialProvider = providers.find(
    (provider) => provider.type === "credentials",
  );

  return (
    <div className="auth-options">
      {oauthProviders.length > 0 && (
        <div className="auth-group">
          <p className="eyebrow">OAuth providers</p>
          <div className="auth-buttons">
            {oauthProviders.map((provider) => (
              <button
                key={provider.id}
                type="button"
                className="button button--ghost"
                onClick={() => signIn(provider.id)}
              >
                Continue with {provider.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {credentialProvider && (
        <div className="auth-group">
          <p className="eyebrow">Demo access</p>
          <p className="muted">
            OAuth isn&apos;t configured in this environment. Use demo access to preview
            the dashboard flows.
          </p>
          <form
            className="auth-form"
            onSubmit={(event) => {
              event.preventDefault();
              signIn("demo", { name, email, callbackUrl: "/dashboard" });
            }}
          >
            <label>
              Display name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Demo Summoner"
              />
            </label>
            <label>
              Email (optional)
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="demo@climb.lol"
              />
            </label>
            <button type="submit" className="button button--primary">
              Continue to demo
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
