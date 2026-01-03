import { Visibility } from "./visibility";

export type LeaderboardEntry = {
  climber: string;
  score: number;
};

export type Leaderboard = {
  slug: string;
  name: string;
  ownerId: string;
  visibility: Visibility;
  entries: LeaderboardEntry[];
};

const leaderboards: Leaderboard[] = [
  {
    slug: "boulder-blitz",
    name: "Boulder Blitz",
    ownerId: "user-1",
    visibility: "public",
    entries: [
      { climber: "Ava", score: 98 },
      { climber: "Jules", score: 93 },
    ],
  },
  {
    slug: "training-block",
    name: "Training Block",
    ownerId: "user-2",
    visibility: "unlisted",
    entries: [
      { climber: "Milo", score: 88 },
      { climber: "Nina", score: 85 },
    ],
  },
  {
    slug: "team-summit",
    name: "Team Summit",
    ownerId: "user-1",
    visibility: "private",
    entries: [
      { climber: "Ezra", score: 91 },
      { climber: "Kai", score: 90 },
    ],
  },
];

export function getAllLeaderboards(): Leaderboard[] {
  return leaderboards;
}

export function getPublicLeaderboards(): Leaderboard[] {
  return leaderboards.filter((leaderboard) => leaderboard.visibility === "public");
}

export function canViewLeaderboard(
  leaderboard: Leaderboard,
  viewerId: string | null,
  options: { viaDirectory?: boolean } = {},
): boolean {
  if (options.viaDirectory) {
    return leaderboard.visibility === "public";
  }

  if (leaderboard.visibility === "private") {
    return leaderboard.ownerId === viewerId;
  }

  return true;
}

export function getLeaderboardForViewer(
  slug: string,
  viewerId: string | null,
): Leaderboard | null {
  const leaderboard = leaderboards.find((entry) => entry.slug === slug);

  if (!leaderboard) {
    return null;
  }

  return canViewLeaderboard(leaderboard, viewerId) ? leaderboard : null;
}

export function getLeaderboardsForOwner(viewerId: string | null): Leaderboard[] {
  if (!viewerId) {
    return [];
  }

  return leaderboards.filter((leaderboard) => leaderboard.ownerId === viewerId);
}
