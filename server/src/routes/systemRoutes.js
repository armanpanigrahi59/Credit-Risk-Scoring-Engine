import express from "express";
import { databaseStatus } from "../db.js";
import { getIndiaMlMetrics, getMlHealth, getMlMetrics, runTraining } from "../services/mlService.js";

const router = express.Router();

router.get("/health", async (_req, res) => {
  try {
    const ml = await getMlHealth();
    res.json({
      status: "ok",
      backend: "ok",
      database: databaseStatus(),
      ml
    });
  } catch (error) {
    res.status(503).json({
      status: "degraded",
      backend: "ok",
      database: databaseStatus(),
      ml: { status: "unavailable", detail: error.message }
    });
  }
});

router.get("/metrics", async (_req, res, next) => {
  try {
    res.json(await getMlMetrics());
  } catch (error) {
    next(error);
  }
});

router.get("/india/metrics", async (_req, res, next) => {
  try {
    res.json(await getIndiaMlMetrics());
  } catch (error) {
    next(error);
  }
});

router.post("/train", async (_req, res, next) => {
  try {
    const training = await runTraining();
    res.json({
      status: "completed",
      training
    });
  } catch (error) {
    next(error);
  }
});

export default router;
