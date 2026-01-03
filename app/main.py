from __future__ import annotations

import os
import sqlite3
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import FastAPI

DATABASE_PATH = os.getenv("DATABASE_PATH", "./data.db")
STALE_MINUTES = int(os.getenv("STALE_MINUTES", "30"))

app = FastAPI()


def _get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def _init_db() -> None:
    with _get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS players (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                last_refreshed_at TEXT,
                last_refresh_status TEXT,
                last_refresh_error TEXT
            )
            """
        )


@app.on_event("startup")
async def startup() -> None:
    _init_db()


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _isoformat(dt: datetime | None) -> str | None:
    return dt.isoformat() if dt else None


def _parse_iso(dt_value: str | None) -> datetime | None:
    if not dt_value:
        return None
    return datetime.fromisoformat(dt_value)


def _is_stale(last_refreshed_at: datetime | None) -> bool:
    if last_refreshed_at is None:
        return True
    return last_refreshed_at <= _utc_now() - timedelta(minutes=STALE_MINUTES)


def _refresh_player(player: sqlite3.Row) -> dict[str, Any]:
    refreshed_at = _utc_now()
    return {
        "id": player["id"],
        "name": player["name"],
        "last_refreshed_at": _isoformat(refreshed_at),
        "last_refresh_status": "success",
        "last_refresh_error": None,
    }


@app.post("/api/refresh")
async def refresh_stale_players() -> dict[str, Any]:
    with _get_connection() as connection:
        players = connection.execute(
            """
            SELECT id, name, last_refreshed_at, last_refresh_status, last_refresh_error
            FROM players
            """
        ).fetchall()

        stale_players = []
        for player in players:
            last_refreshed_at = _parse_iso(player["last_refreshed_at"])
            if _is_stale(last_refreshed_at):
                stale_players.append(player)

        refreshed = []
        for player in stale_players:
            updated = _refresh_player(player)
            refreshed.append(updated)
            connection.execute(
                """
                UPDATE players
                SET last_refreshed_at = ?,
                    last_refresh_status = ?,
                    last_refresh_error = ?
                WHERE id = ?
                """,
                (
                    updated["last_refreshed_at"],
                    updated["last_refresh_status"],
                    updated["last_refresh_error"],
                    updated["id"],
                ),
            )

    return {
        "stale_cutoff_minutes": STALE_MINUTES,
        "refreshed_count": len(refreshed),
        "refreshed_players": refreshed,
    }
