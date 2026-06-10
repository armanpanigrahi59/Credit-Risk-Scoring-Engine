import axios from "axios";
import { spawn } from "child_process";
import { config } from "../config.js";

const mlClient = axios.create({
  baseURL: config.mlServiceUrl,
  timeout: 15000
});

export async function getMlHealth() {
  const { data } = await mlClient.get("/health");
  return data;
}

export async function scoreApplicant(applicant) {
  const { data } = await mlClient.post("/score", applicant);
  return data;
}

export async function scoreIndiaLoan(applicant) {
  const { data } = await mlClient.post("/india/score", applicant);
  return data;
}

export async function getMlMetrics() {
  const { data } = await mlClient.get("/metrics");
  return data;
}

export async function getIndiaMlMetrics() {
  const { data } = await mlClient.get("/india/metrics");
  return data;
}

export function runTraining() {
  if (!config.allowTraining) {
    const error = new Error("Training is disabled for this environment.");
    error.statusCode = 403;
    throw error;
  }

  return new Promise((resolve, reject) => {
    const child = spawn(config.pythonBin, ["-m", "src.train"], {
      cwd: process.cwd().replace(/\\server$/, ""),
      shell: process.platform === "win32"
    });

    let output = "";
    let errorOutput = "";

    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      errorOutput += chunk.toString();
    });
    child.on("close", (code) => {
      if (code !== 0) {
        const error = new Error(errorOutput || `Training exited with code ${code}`);
        error.statusCode = 500;
        reject(error);
        return;
      }
      resolve({ output: output.trim() });
    });
  });
}
