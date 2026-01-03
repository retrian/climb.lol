const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");

const getEnv = (key: string, fallback: string) => {
  const value = process.env[key];
  return value && value.trim().length > 0 ? value.trim() : fallback;
};

const appBaseUrl = normalizeBaseUrl(getEnv("APP_BASE_URL", "http://localhost:3000"));
const apiBaseUrl = normalizeBaseUrl(getEnv("API_BASE_URL", "http://localhost:4000"));

export const config = {
  appBaseUrl,
  apiBaseUrl,
  matchHistoryBaseUrl: normalizeBaseUrl(getEnv("MATCH_HISTORY_BASE_URL", apiBaseUrl)),
  cdnBaseUrl: normalizeBaseUrl(getEnv("CDN_BASE_URL", "http://localhost:3000")),
  opggBaseUrl: normalizeBaseUrl(getEnv("OPGG_BASE_URL", "https://www.op.gg")),
  riotDdragonBase: normalizeBaseUrl(
    getEnv("RIOT_DDRAGON_BASE", "https://ddragon.leagueoflegends.com")
  ),
  matchesDbPath: getEnv("MATCHES_DB_PATH", "./data.sqlite"),
};
