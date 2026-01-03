import express from "express";
import leaderboardsRouter from "./routes/leaderboards.js";

const app = express();

app.use(express.json());
app.use(leaderboardsRouter);

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  // UI should consume stored data only via the API.
  console.log(`Server listening on port ${port}`);
});
