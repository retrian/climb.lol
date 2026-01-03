import { Visibility } from "./visibility";

export type ChampionPick = {
  name: string;
  shortName: string;
  accent: string;
};

export type LeaderboardPlayer = {
  id: string;
  displayName: string;
  riotId: string;
  role: string;
  twitchUrl?: string;
  twitterUrl?: string;
  opggUrl: string;
  profileInitials: string;
  rank: string;
  lp: number;
  wins: number;
  losses: number;
  topChamps: ChampionPick[];
};

export type LatestGame = {
  id: string;
  playerName: string;
  champion: string;
  championAccent: string;
  kda: string;
  cs: number;
  result: "Win" | "Loss";
  duration: string;
  queue: string;
  timeAgo: string;
};

export type Leaderboard = {
  id: string;
  slug: string;
  name: string;
  description: string;
  season?: string;
  visibility: Visibility;
  ownerId: string;
  bannerGradient: string;
  accentColor: string;
  players: LeaderboardPlayer[];
  latestGames: LatestGame[];
};

const buildOpggUrl = (riotId: string) => {
  const formatted = riotId.replace("#", "-");
  return `https://www.op.gg/summoners/na/${encodeURIComponent(formatted)}`;
};

const leaderboards: Leaderboard[] = [
  {
    id: "lb-arcane",
    slug: "arcane-ascension",
    name: "Arcane Ascension",
    description:
      "Friends & rivals climbing together. Weekly rank pushes with curated builds and lineup roles.",
    season: "Season 14 · Split 2",
    visibility: "public",
    ownerId: "user-1",
    bannerGradient:
      "linear-gradient(120deg, rgba(79, 70, 229, 0.4), rgba(110, 231, 255, 0.25)), radial-gradient(circle at top, rgba(15, 23, 42, 0.7), rgba(10, 15, 25, 0.95))",
    accentColor: "#6EE7FF",
    players: [
      {
        id: "p1",
        displayName: "Selene",
        riotId: "Selene#LUX",
        role: "Mid",
        twitchUrl: "https://twitch.tv/seleneplays",
        twitterUrl: "https://x.com/selene_mid",
        opggUrl: buildOpggUrl("Selene#LUX"),
        profileInitials: "SE",
        rank: "Diamond II",
        lp: 64,
        wins: 71,
        losses: 49,
        topChamps: [
          { name: "Ahri", shortName: "A", accent: "#fca5a5" },
          { name: "Orianna", shortName: "O", accent: "#a5b4fc" },
          { name: "Syndra", shortName: "S", accent: "#f9a8d4" },
          { name: "Azir", shortName: "Az", accent: "#fde68a" },
          { name: "Taliyah", shortName: "T", accent: "#fcd34d" },
        ],
      },
      {
        id: "p2",
        displayName: "Hawk",
        riotId: "Hawk#NA1",
        role: "Jungle",
        twitchUrl: "https://twitch.tv/hawkpath",
        opggUrl: buildOpggUrl("Hawk#NA1"),
        profileInitials: "HK",
        rank: "Diamond IV",
        lp: 22,
        wins: 62,
        losses: 55,
        topChamps: [
          { name: "Viego", shortName: "V", accent: "#6ee7b7" },
          { name: "Lee Sin", shortName: "LS", accent: "#fdba74" },
          { name: "Kindred", shortName: "K", accent: "#a7f3d0" },
          { name: "Sejuani", shortName: "S", accent: "#bfdbfe" },
          { name: "Nocturne", shortName: "N", accent: "#c4b5fd" },
        ],
      },
      {
        id: "p3",
        displayName: "Mira",
        riotId: "Mira#ADC",
        role: "Bot",
        twitchUrl: "https://twitch.tv/mirashots",
        twitterUrl: "https://x.com/mirashots",
        opggUrl: buildOpggUrl("Mira#ADC"),
        profileInitials: "MR",
        rank: "Platinum I",
        lp: 88,
        wins: 58,
        losses: 50,
        topChamps: [
          { name: "Kai'Sa", shortName: "K", accent: "#a78bfa" },
          { name: "Jinx", shortName: "J", accent: "#f472b6" },
          { name: "Aphelios", shortName: "A", accent: "#60a5fa" },
          { name: "Zeri", shortName: "Z", accent: "#5eead4" },
          { name: "Xayah", shortName: "X", accent: "#fda4af" },
        ],
      },
      {
        id: "p4",
        displayName: "Aster",
        riotId: "Aster#SUP",
        role: "Support",
        twitterUrl: "https://x.com/aster_ward",
        opggUrl: buildOpggUrl("Aster#SUP"),
        profileInitials: "AS",
        rank: "Platinum II",
        lp: 41,
        wins: 53,
        losses: 44,
        topChamps: [
          { name: "Nami", shortName: "N", accent: "#7dd3fc" },
          { name: "Rakan", shortName: "R", accent: "#fdba74" },
          { name: "Renata", shortName: "Re", accent: "#c4b5fd" },
          { name: "Thresh", shortName: "T", accent: "#86efac" },
          { name: "Braum", shortName: "B", accent: "#93c5fd" },
        ],
      },
      {
        id: "p5",
        displayName: "Vale",
        riotId: "Vale#TOP",
        role: "Top",
        opggUrl: buildOpggUrl("Vale#TOP"),
        profileInitials: "VA",
        rank: "Emerald II",
        lp: 12,
        wins: 45,
        losses: 42,
        topChamps: [
          { name: "Aatrox", shortName: "Aa", accent: "#f87171" },
          { name: "Ornn", shortName: "O", accent: "#94a3b8" },
          { name: "Camille", shortName: "C", accent: "#60a5fa" },
          { name: "Gwen", shortName: "G", accent: "#a5b4fc" },
          { name: "K'Sante", shortName: "K", accent: "#fda4af" },
        ],
      },
    ],
    latestGames: [
      {
        id: "g1",
        playerName: "Selene",
        champion: "Ahri",
        championAccent: "#fca5a5",
        kda: "12 / 2 / 9",
        cs: 236,
        result: "Win",
        duration: "31:22",
        queue: "Ranked Solo",
        timeAgo: "18m ago",
      },
      {
        id: "g2",
        playerName: "Hawk",
        champion: "Viego",
        championAccent: "#6ee7b7",
        kda: "6 / 3 / 11",
        cs: 184,
        result: "Win",
        duration: "29:40",
        queue: "Ranked Solo",
        timeAgo: "44m ago",
      },
      {
        id: "g3",
        playerName: "Mira",
        champion: "Kai'Sa",
        championAccent: "#a78bfa",
        kda: "9 / 5 / 6",
        cs: 212,
        result: "Loss",
        duration: "35:05",
        queue: "Ranked Flex",
        timeAgo: "1h ago",
      },
      {
        id: "g4",
        playerName: "Aster",
        champion: "Rakan",
        championAccent: "#fdba74",
        kda: "2 / 4 / 15",
        cs: 38,
        result: "Win",
        duration: "27:51",
        queue: "Ranked Solo",
        timeAgo: "1h ago",
      },
    ],
  },
  {
    id: "lb-shroud",
    slug: "midnight-shroud",
    name: "Midnight Shroud",
    description:
      "Late-night NA grinders. Flexible roles, macro focus, and weekly patch labs.",
    season: "Season 14 · Split 2",
    visibility: "unlisted",
    ownerId: "user-2",
    bannerGradient:
      "linear-gradient(120deg, rgba(15, 118, 110, 0.5), rgba(30, 41, 59, 0.9))",
    accentColor: "#5EEAD4",
    players: [
      {
        id: "p6",
        displayName: "Noir",
        riotId: "Noir#LUL",
        role: "Mid",
        opggUrl: buildOpggUrl("Noir#LUL"),
        profileInitials: "NO",
        rank: "Emerald I",
        lp: 73,
        wins: 39,
        losses: 31,
        topChamps: [
          { name: "LeBlanc", shortName: "LB", accent: "#c4b5fd" },
          { name: "Talon", shortName: "T", accent: "#fda4af" },
          { name: "Akali", shortName: "A", accent: "#fcd34d" },
          { name: "Sylas", shortName: "S", accent: "#bae6fd" },
          { name: "Twisted Fate", shortName: "TF", accent: "#fca5a5" },
        ],
      },
    ],
    latestGames: [],
  },
  {
    id: "lb-private",
    slug: "inner-circle",
    name: "Inner Circle",
    description:
      "Private roster for scrims, review, and long-term synergy tracking.",
    season: "Season 14 · Split 2",
    visibility: "private",
    ownerId: "user-3",
    bannerGradient:
      "linear-gradient(120deg, rgba(30, 64, 175, 0.45), rgba(15, 23, 42, 0.95))",
    accentColor: "#93C5FD",
    players: [],
    latestGames: [],
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

export function getFeaturedLeaderboard(): Leaderboard {
  return leaderboards[0];
}
