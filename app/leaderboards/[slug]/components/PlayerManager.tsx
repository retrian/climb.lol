"use client";
import React, { useState } from "react";

type Player = {
  id: string;
  puuid: string;
  gameName: string;
  tagLine: string | null;
  role: string;
};

export default function PlayerManager({ slug, initialPlayers }: { slug: string; initialPlayers: Player[] }) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers ?? []);
  const [riotId, setRiotId] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  async function addPlayer(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboards/${slug}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riotId, role }),
      });
      const data = await res.json();
      if (res.ok) {
        // reload page to fetch fresh server-side data
        location.reload();
      } else {
        alert(data.error || "Failed to add player");
      }
    } finally {
      setLoading(false);
    }
  }

  async function removePlayer(id: string) {
    if (!confirm("Remove this player from leaderboard?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboards/${slug}/players/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setPlayers((p) => p.filter((pl) => pl.id !== id));
      } else {
        alert(data.error || "Failed to remove");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      <h3>Players ({players.length}/15)</h3>
      <form onSubmit={addPlayer} style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input value={riotId} onChange={(e) => setRiotId(e.target.value)} placeholder="Riot ID e.g. SkyHook#NA1" />
        <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role (optional)" />
        <button type="submit" disabled={loading || players.length >= 15}>Add</button>
      </form>

      <ul>
        {players.map((p) => (
          <li key={p.id}>
            <strong>{p.gameName}{p.tagLine ? `#${p.tagLine}` : ""}</strong> — {p.role}{" "}
            <button onClick={() => removePlayer(p.id)} disabled={loading}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
