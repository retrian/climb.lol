import type { ReactNode } from "react";
import "../styles.css";

export const metadata = {
  title: "climb.lol",
  description: "Leaderboards for climbers",
};

function Nav() {
  return (
    <header style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <a href="/" style={{ color: "var(--text)", textDecoration: "none", fontWeight: 800, fontSize: 20 }}>
            climb.lol
          </a>
        </div>
        <nav style={{ display: "flex", gap: 16 }}>
          <a href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Home</a>
          <a href="/leaderboards" style={{ color: "var(--muted)", textDecoration: "none" }}>Leaderboards</a>
          <a href="/dashboard" style={{ color: "var(--muted)", textDecoration: "none" }}>Dashboard</a>
        </nav>
      </div>
    </header>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="page">{children}</main>
      </body>
    </html>
  );
}
