import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config.js";
import { connectDatabase } from "./db.js";
import scoreRoutes from "./routes/scoreRoutes.js";
import systemRoutes from "./routes/systemRoutes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));

app.use("/api", systemRoutes);
app.use("/api/scores", scoreRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((error, _req, res, _next) => {
  if (error.name === "ZodError") {
    res.status(400).json({
      message: "Invalid applicant payload.",
      issues: error.issues
    });
    return;
  }

  res.status(error.statusCode || 500).json({
    message: error.message || "Unexpected server error."
  });
});

await connectDatabase();

app.listen(config.port, () => {
  console.log(`Credit risk API listening on port ${config.port}`);
});
