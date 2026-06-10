import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 20000
});

export async function fetchHealth() {
  const { data } = await api.get("/health");
  return data;
}

export async function fetchMetrics() {
  const { data } = await api.get("/metrics");
  return data;
}

export async function fetchIndiaMetrics() {
  const { data } = await api.get("/india/metrics");
  return data;
}

export async function submitScore(applicant) {
  const { data } = await api.post("/scores", { applicant });
  return data;
}

export async function submitIndiaScore(applicant) {
  const { data } = await api.post("/scores/india", { applicant });
  return data;
}

export async function fetchScores() {
  const { data } = await api.get("/scores?limit=12");
  return data;
}
