import express from "express";
import { databaseStatus } from "../db.js";
import { getIndiaMlMetrics, getMlMetrics, runTraining } from "../services/mlService.js";
import { getMlStatus } from "../services/monitorService.js";

const router = express.Router();

router.get("/health", (_req, res) => {
  const mlStatus = getMlStatus();
  const dbStatus = databaseStatus();

  res.json({
    status: mlStatus.status === "active" && dbStatus === "connected" ? "healthy" : "degraded",
    backend: "ok",
    database: dbStatus,
    ml: mlStatus
  });
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
