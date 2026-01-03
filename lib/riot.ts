type ResolveResult = {
  puuid: string;
  gameName: string;
  tagLine: string | null;
  profileIconId?: number;
};

export async function resolveRiotIdToPuuid(riotId: string): Promise<ResolveResult> {
  // Expect format like "SummonerName#NA1" or "SummonerName" (assume NA1)
  const parts = riotId.split("#");
  const name = parts[0]?.trim();
  const tag = parts[1]?.trim() ?? "NA1";

  if (!name) throw new Error("invalid_riot_id");

  // Only allow NA1 for this application
  if (!/^NA/i.test(tag)) {
    const err: any = new Error("region_not_supported");
    err.code = "region_not_supported";
    throw err;
  }

  const apiKey = process.env.RIOT_API_KEY;
  if (!apiKey) {
    const err: any = new Error("missing_riot_api_key");
    err.code = "missing_riot_api_key";
    throw err;
  }

  // Use NA1 summoner-v4 endpoint to resolve by name
  const url = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(name)}`;

  const res = await fetch(url, {
    headers: { "X-Riot-Token": apiKey },
    method: "GET",
  });

  if (res.status === 404) {
    const err: any = new Error("summoner_not_found");
    err.code = "summoner_not_found";
    throw err;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err: any = new Error("riot_api_error");
    err.code = "riot_api_error";
    err.message = text || res.statusText;
    throw err;
  }

  const data = (await res.json()) as any;

  return {
    puuid: data.puuid,
    gameName: data.name,
    tagLine: tag,
    profileIconId: data.profileIconId,
  };
}

export function makeProfileIconUrl(iconId?: number) {
  if (!iconId) return null;
  // Use data dragon CDN base; leaving version unspecified may break if needed, but default to a stable base path
  return `https://ddragon.leagueoflegends.com/cdn/12.23.1/img/profileicon/${iconId}.png`;
}

export default { resolveRiotIdToPuuid, makeProfileIconUrl };

// Fetch recent match IDs for a given PUUID (americas platform for NA region match-v5)
export async function getMatchIdsByPuuid(puuid: string, startTimeSec?: number, count = 10): Promise<string[]> {
  const apiKey = process.env.RIOT_API_KEY;
  if (!apiKey) throw new Error("missing_riot_api_key");

  const url = new URL(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids`);
  url.searchParams.set("count", String(count));
  if (startTimeSec) url.searchParams.set("startTime", String(startTimeSec));

  const res = await fetch(url.toString(), { headers: { "X-Riot-Token": apiKey } });
  if (res.status === 404) return [];
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err: any = new Error("riot_api_error");
    err.message = text || res.statusText;
    throw err;
  }

  const ids = (await res.json()) as string[];
  return ids || [];
}

// Fetch match detail by matchId
export async function getMatchById(matchId: string): Promise<any> {
  const apiKey = process.env.RIOT_API_KEY;
  if (!apiKey) throw new Error("missing_riot_api_key");

  const url = `https://americas.api.riotgames.com/lol/match/v5/matches/${encodeURIComponent(matchId)}`;
  const res = await fetch(url, { headers: { "X-Riot-Token": apiKey } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err: any = new Error("riot_api_error");
    err.message = text || res.statusText;
    throw err;
  }

  return await res.json();
}
