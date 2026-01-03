import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const oauthProviders = [
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    : null,
  process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET
    ? DiscordProvider({
        clientId: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
      })
    : null,
].filter((provider): provider is NonNullable<typeof provider> => Boolean(provider));

const demoProvider = CredentialsProvider({
  id: "demo",
  name: "Demo access",
  credentials: {
    name: { label: "Display name", type: "text" },
    email: { label: "Email", type: "email" },
  },
  async authorize(credentials) {
    const name = credentials?.name?.trim();
    const email = credentials?.email?.trim();

    if (!name && !email) {
      return null;
    }

    return {
      id: `demo-${email ?? name ?? "user"}`,
      name: name || "Demo User",
      email: email || "demo@climb.lol",
    };
  },
});

const providers =
  oauthProviders.length > 0 ? oauthProviders : [demoProvider];

export type AuthProviderMeta = {
  id: string;
  name: string;
  type: "oauth" | "credentials";
};

export const providerMetadata: AuthProviderMeta[] = providers.map(
  (provider) => ({
    id: provider.id,
    name: provider.name,
    type: provider.type === "credentials" ? "credentials" : "oauth",
  }),
);

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers,
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.uid = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid ?? token.sub ?? "") as string;
      }
      return session;
    },
  },
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
  }
}
