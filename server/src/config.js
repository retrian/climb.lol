const normalizeBaseUrl = (value) => value.replace(/\/+$/, "");

const getEnv = (key, fallback) => {
  const value = process.env[key];
  return value && value.trim().length > 0 ? value.trim() : fallback;
};

const getRequiredEnv = (key) => {
  const value = process.env[key];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value.trim();
};

const parseCsv = (value) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const isProduction = process.env.NODE_ENV === "production";
const corsOriginEnv = isProduction ? getRequiredEnv("CORS_ORIGIN") : getEnv("CORS_ORIGIN", "*");
const corsOrigins = corsOriginEnv === "*" ? ["*"] : parseCsv(corsOriginEnv);

if (!corsOrigins.length) {
  throw new Error("CORS_ORIGIN must include at least one origin");
}

const invalidOrigin = corsOrigins.find((origin) => {
  if (origin === "*") return false;
  try {
    const parsed = new URL(origin);
    return parsed.origin !== origin;
  } catch {
    return true;
  }
});

if (invalidOrigin) {
  throw new Error(`Invalid CORS origin: ${invalidOrigin}`);
}

export const config = {
  appBaseUrl: normalizeBaseUrl(getEnv("APP_BASE_URL", "http://localhost:3000")),
  apiBaseUrl: normalizeBaseUrl(getEnv("API_BASE_URL", "http://localhost:4000")),
  cdnBaseUrl: normalizeBaseUrl(getEnv("CDN_BASE_URL", "http://localhost:3000")),
  opggBaseUrl: normalizeBaseUrl(getEnv("OPGG_BASE_URL", "https://www.op.gg")),
  riotDdragonBase: normalizeBaseUrl(getEnv("RIOT_DDRAGON_BASE", "https://ddragon.leagueoflegends.com")),
  corsOrigins,
  isProduction,
  jwtSecret: getEnv("JWT_SECRET", "")
};

if (config.isProduction && !config.jwtSecret) {
  throw new Error("JWT_SECRET is required in production");
}
