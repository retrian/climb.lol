import jwt from "jsonwebtoken";
import { config } from "./config.js";

const getTokenFromRequest = (req) => {
  const header = req.header("authorization");
  if (!header) return null;
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
};

const resolveUserId = (payload) => {
  if (!payload || typeof payload !== "object") return null;
  return payload.sub || payload.userId || null;
};

const verifyToken = (token) => {
  if (!config.jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.verify(token, config.jwtSecret);
};

export const requireAuth = (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const payload = verifyToken(token);
    const userId = resolveUserId(payload);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = { id: userId };
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

export const optionalAuth = (req, _res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return next();
    }
    const payload = verifyToken(token);
    const userId = resolveUserId(payload);
    if (userId) {
      req.user = { id: userId };
    }
    return next();
  } catch {
    return next();
  }
};
