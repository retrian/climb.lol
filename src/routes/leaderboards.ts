import { Router } from "express";
import { matchesStore } from "../db.js";

const router = Router();

router.get("/api/leaderboards/:id/matches", (req, res) => {
  const { id } = req.params;
  const limit = Number(req.query.limit ?? 10);
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 10;

  const matches = matchesStore.getLatestMatches(id, safeLimit);
  res.json({ matches });
});

export default router;
