import { getMlHealth } from "./mlService.js";

let mlHealthState = {
  status: "unavailable",
  selected_model: null,
  india_selected_model: null,
  lastChecked: null,
  error: "Monitor not started"
};

let checkIntervalId = null;

async function pingMlService() {
  try {
    const health = await getMlHealth();
    mlHealthState = {
      status: "active",
      selected_model: health.selected_model || null,
      india_selected_model: health.india_selected_model || null,
      lastChecked: new Date(),
      error: null
    };
  } catch (error) {
    console.warn(`[ML Monitor] AI Engine unavailable: ${error.message}. Retrying in 10s...`);
    mlHealthState = {
      status: "unavailable",
      selected_model: null,
      india_selected_model: null,
      lastChecked: new Date(),
      error: error.message
    };
  }
}

export function startMonitor() {
  if (checkIntervalId) return;

  console.log("[ML Monitor] Starting background AI engine health monitor...");
  pingMlService();

  // Run health check poll every 10 seconds
  checkIntervalId = setInterval(pingMlService, 10000);
}

export function getMlStatus() {
  return mlHealthState;
}

export function stopMonitor() {
  if (checkIntervalId) {
    clearInterval(checkIntervalId);
    checkIntervalId = null;
  }
}
