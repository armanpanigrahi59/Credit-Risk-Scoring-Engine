import React from "react";
import { Activity, Database, RefreshCw, Sparkles } from "lucide-react";

export default function Header({ health, activeEngine, refreshing, onRefresh }) {
  const isDbConnected = health?.database === "connected";
  const isMlActive = health?.ml?.status === "active";
  
  return (
    <section className="topbar">
      <div>
        <span className="eyebrow">Risk Orchestrator Suite</span>
        <h1>Credit Risk Workbench</h1>
        <p>Configure applicants, view dynamic underwriting insights, monitor live model comparison metrics, and inspect historical decision pipelines.</p>
      </div>
      <div className="status-strip">
        {/* Backend MERN Link Indicator */}
        <div className={`status-pill ${health?.backend === "ok" ? "good" : "danger"}`}>
          <Activity size={18} />
          <span>Gateway API</span>
          <strong>{health?.backend === "ok" ? "🟢 Online" : "🔴 Offline"}</strong>
        </div>

        {/* Database Persistence Link Indicator */}
        <div className={`status-pill ${isDbConnected ? "good" : "danger"}`}>
          <Database size={18} />
          <span>DB Link</span>
          <strong>{isDbConnected ? "🟢 Connected" : "🔴 Offline"}</strong>
        </div>

        {/* Active AI Engine Connection status indicator */}
        <div className={`status-pill ${isMlActive ? "good" : "danger"}`}>
          <Sparkles size={18} />
          <span>AI Engine</span>
          <strong>
            {isMlActive ? "🟢 AI Engine Active" : "🔴 AI Engine Unavailable"}
          </strong>
        </div>

        <button 
          className="icon-action" 
          type="button" 
          onClick={onRefresh} 
          aria-label="Refresh health logs" 
          title="Refresh health logs"
          disabled={refreshing}
        >
          <RefreshCw size={18} className={refreshing ? "spin" : ""} />
        </button>
      </div>
    </section>
  );
}
