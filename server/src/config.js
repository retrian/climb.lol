const normalizeBaseUrl = (value) => value.replace(/\/+$/, "");

const getEnv = (key, fallback) => {
  const value = process.env[key];
  return value && value.trim().length > 0 ? value.trim() : fallback;
};

export const config = {
  appBaseUrl: normalizeBaseUrl(getEnv("APP_BASE_URL", "http://localhost:3000")),
  apiBaseUrl: normalizeBaseUrl(getEnv("API_BASE_URL", "http://localhost:4000")),
  cdnBaseUrl: normalizeBaseUrl(getEnv("CDN_BASE_URL", "http://localhost:3000")),
  opggBaseUrl: normalizeBaseUrl(getEnv("OPGG_BASE_URL", "https://www.op.gg")),
  riotDdragonBase: normalizeBaseUrl(getEnv("RIOT_DDRAGON_BASE", "https://ddragon.leagueoflegends.com"))
};
