import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BadgeCheck,
  BarChart3,
  Database,
  FileClock,
  Gauge,
  IndianRupee,
  ShieldAlert,
  TrendingUp,
  WalletCards,
  CreditCard
} from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import AuroraBackground from "./components/AuroraBackground";
import Header from "./components/Header";
import IndiaLoanForm from "./components/IndiaLoanForm";
import CreditCardForm from "./components/CreditCardForm";
import HistoryTable from "./components/HistoryTable";

import {
  initialApplicant,
  applicantPresets,
  initialCreditCardApplicant,
  ccPresets,
  payStatusOptions,
  filterOptions
} from "./config/constants";

import {
  fetchHealth,
  fetchIndiaMetrics,
  fetchMetrics,
  fetchScores,
  submitIndiaScore,
  submitScore
} from "./services/api";

import "./styles.css";

function App() {
  const [activeEngine, setActiveEngine] = useState("india"); // "india" | "credit_card"
  const [indiaApplicant, setIndiaApplicant] = useState(initialApplicant);
  const [ccApplicant, setCcApplicant] = useState(initialCreditCardApplicant);

  const [health, setHealth] = useState({
    backend: "checking",
    database: "checking",
    ml: { status: "checking" }
  });
  const [indiaMetrics, setIndiaMetrics] = useState(null);
  const [ccMetrics, setCcMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  
  const [latestIndia, setLatestIndia] = useState(null);
  const [latestCc, setLatestCc] = useState(null);

  const [ccFormTab, setCcFormTab] = useState("profile"); // "profile" | "history" | "billing"
  const [riskFilter, setRiskFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Health check and metrics retrieval
  async function loadDashboardData() {
    try {
      const [healthData, indiaMetricsData, ccMetricsData, scoreData] = await Promise.all([
        fetchHealth().catch(() => ({
          backend: "offline",
          database: "offline",
          ml: { status: "unavailable" }
        })),
        fetchIndiaMetrics().catch(() => null),
        fetchMetrics().catch(() => null),
        fetchScores().catch(() => ({ items: [] }))
      ]);

      setHealth(healthData);
      if (indiaMetricsData) setIndiaMetrics(indiaMetricsData);
      if (ccMetricsData) setCcMetrics(ccMetricsData);
      setHistory(scoreData?.items || []);
    } catch (err) {
      console.error("Dashboard failed to retrieve active statuses:", err);
    }
  }

  // Automatic connection health check loop (polls every 15s)
  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(async () => {
      try {
        const healthData = await fetchHealth().catch(() => ({
          backend: "offline",
          database: "offline",
          ml: { status: "unavailable" }
        }));
        setHealth(healthData);
      } catch (err) {
        setHealth({
          backend: "offline",
          database: "offline",
          ml: { status: "unavailable" }
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const activeMetrics = useMemo(() => {
    return activeEngine === "india" ? indiaMetrics : ccMetrics;
  }, [activeEngine, indiaMetrics, ccMetrics]);

  const auroraColors = useMemo(() => {
    return activeEngine === "india"
      ? ["#0f766e", "#f59e0b", "#0d9488"]
      : ["#1e3a8a", "#6366f1", "#ec4899"];
  }, [activeEngine]);

  const modelRows = useMemo(() => {
    if (!activeMetrics?.models) return [];
    return Object.entries(activeMetrics.models).map(([name, model]) => ({
      name: toTitle(name),
      auc: asPercent(model.auc_roc),
      accuracy: asPercent(model.accuracy),
      precision: asPercent(model.average_precision),
      latency: Number(model.avg_batch_latency_ms_per_record || 0)
    }));
  }, [activeMetrics]);

  // Underwriting and Signal Calculations
  const indiaAffordability = useMemo(() => buildAffordability(indiaApplicant), [indiaApplicant]);
  const indiaAffordabilityRows = useMemo(() => buildAffordabilityRows(indiaApplicant, indiaAffordability), [indiaApplicant, indiaAffordability]);
  const indiaSignals = useMemo(() => buildIndiaRiskSignals(indiaApplicant, indiaAffordability), [indiaApplicant, indiaAffordability]);

  const ccSignals = useMemo(() => buildCcRiskSignals(ccApplicant), [ccApplicant]);
  const ccTrendRows = useMemo(() => buildCcTrendRows(ccApplicant), [ccApplicant]);

  const activeSignals = activeEngine === "india" ? indiaSignals : ccSignals;
  const activeLatest = activeEngine === "india" ? latestIndia : latestCc;

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const isIndia = item.applicant?.market === "India" || item.applicant?.loan_amount_inr;
      const matchesEngine = activeEngine === "india" ? isIndia : !isIndia;
      if (!matchesEngine) return false;
      if (riskFilter === "All") return true;
      return item.result?.risk_tier === riskFilter;
    });
  }, [history, activeEngine, riskFilter]);

  const trendRows = useMemo(() => {
    return filteredHistory
      .slice()
      .reverse()
      .map((item, index) => ({
        label: `#${index + 1}`,
        probability: Math.round((item.result?.default_probability || 0) * 100),
        latency: Number(item.result?.response_time_ms || 0)
      }));
  }, [filteredHistory]);

  function handleIndiaFieldUpdate(field, value) {
    setIndiaApplicant((current) => ({ ...current, [field]: Number(value) }));
  }

  function handleIndiaTextFieldUpdate(field, value) {
    setIndiaApplicant((current) => ({ ...current, [field]: value }));
  }

  function handleIndiaBooleanUpdate(field, value) {
    setIndiaApplicant((current) => ({ ...current, [field]: value }));
  }

  function handleCcFieldUpdate(field, value) {
    setCcApplicant((current) => ({ ...current, [field]: Number(value) }));
  }

  async function handleRefresh() {
    setRefreshing(true);
    setError("");
    try {
      await loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (activeEngine === "india") {
        const response = await submitIndiaScore(indiaApplicant);
        setLatestIndia(response.result);
      } else {
        const response = await submitScore(ccApplicant);
        setLatestCc(response.result);
      }
      const scoreData = await fetchScores();
      setHistory(scoreData?.items || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <AuroraBackground colorStops={auroraColors} />
      <div className="ambient-grid" aria-hidden="true" />
      
      {/* Header with dynamic status dot connection monitor */}
      <Header 
        health={health} 
        activeEngine={activeEngine} 
        refreshing={refreshing} 
        onRefresh={handleRefresh} 
      />

      {/* Engine Switcher */}
      <section className="engine-tabs">
        <button 
          className={`tab-btn ${activeEngine === "india" ? "active" : ""}`} 
          onClick={() => { setActiveEngine("india"); setError(""); }}
        >
          <IndianRupee size={18} />
          <span>India Loan Risk Engine</span>
        </button>
        <button 
          className={`tab-btn ${activeEngine === "credit_card" ? "active" : ""}`} 
          onClick={() => { setActiveEngine("credit_card"); setError(""); }}
        >
          <CreditCard size={18} />
          <span>Credit Card Default Engine</span>
        </button>
      </section>

      {error && <div className="alert">{error}</div>}

      <section className="metric-grid" aria-label="Active Model Metrics">
        <Metric icon={<BadgeCheck />} label="Selected Model" value={toTitle(activeMetrics?.selected_model || "Loading")} />
        <Metric icon={<Gauge />} label="AUC-ROC" value={activeMetrics?.selected_auc_roc || "..."} />
        <Metric icon={<FileClock />} label="Training Records" value={formatNumber(activeMetrics?.dataset?.records || 0)} />
        <Metric icon={<ShieldAlert />} label="Decisions Tracked" value={filteredHistory.length} />
      </section>

      <section className="workspace-grid">
        {activeEngine === "india" ? (
          <IndiaLoanForm 
            applicant={indiaApplicant}
            presets={applicantPresets}
            loading={loading}
            onSubmit={handleSubmit}
            onFieldChange={handleIndiaFieldUpdate}
            onTextFieldChange={handleIndiaTextFieldUpdate}
            onBooleanChange={handleIndiaBooleanUpdate}
            onSetPreset={setIndiaApplicant}
          />
        ) : (
          <CreditCardForm 
            applicant={ccApplicant}
            presets={ccPresets}
            loading={loading}
            onSubmit={handleSubmit}
            onFieldChange={handleCcFieldUpdate}
            onSetPreset={setCcApplicant}
            ccFormTab={ccFormTab}
            setCcFormTab={setCcFormTab}
            payStatusOptions={payStatusOptions}
          />
        )}

        <aside className="side-stack">
          <ResultPanel 
            latest={activeLatest} 
            metrics={activeMetrics} 
            signals={activeSignals} 
            activeEngine={activeEngine} 
          />
          <SignalPanel signals={activeSignals} activeEngine={activeEngine} />
        </aside>
      </section>

      <section className="analytics-grid">
        {activeEngine === "india" ? (
          <ChartPanel icon={<WalletCards />} title="EMI Affordability Plan" subtitle="Monthly income and estimated EMI as bars; LTV and total obligation ratios as lines.">
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={indiaAffordabilityRows} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dce4df" />
                <XAxis dataKey="label" />
                <YAxis yAxisId="money" tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} />
                <YAxis yAxisId="percent" orientation="right" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={chartValueFormatter} />
                <Legend />
                <Bar yAxisId="money" dataKey="monthlyIncome" name="Monthly Income" fill="#2f6f73" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="money" dataKey="emi" name="Est. EMI" fill="#d08c3f" radius={[4, 4, 0, 0]} />
                <Line yAxisId="percent" type="monotone" dataKey="ltv" name="LTV" stroke="#5f6caf" strokeWidth={3} dot={{ r: 3 }} />
                <Line yAxisId="percent" type="monotone" dataKey="obligation" name="Total Obligation" stroke="#a4433f" strokeWidth={3} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartPanel>
        ) : (
          <ChartPanel icon={<WalletCards />} title="Billing & Repayment Trend" subtitle="Monthly statement balances (bars) vs. payment amounts (lines) over the last 6 months.">
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={ccTrendRows} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dce4df" />
                <XAxis dataKey="label" />
                <YAxis yAxisId="money" tickFormatter={(value) => `$${Math.round(value / 1000)}k`} />
                <Tooltip formatter={ccChartValueFormatter} />
                <Legend />
                <Bar yAxisId="money" dataKey="bill" name="Statement Balance" fill="#5f6caf" radius={[4, 4, 0, 0]} />
                <Line yAxisId="money" type="monotone" dataKey="payment" name="Amount Paid" stroke="#d08c3f" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartPanel>
        )}

        <ChartPanel icon={<BarChart3 />} title="Model Metrics Comparison" subtitle="AUC-ROC, accuracy, average precision, and latency for active model benchmarks.">
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={modelRows} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dce4df" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="score" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <YAxis yAxisId="latency" orientation="right" tickFormatter={(value) => `${value}ms`} />
              <Tooltip formatter={modelValueFormatter} />
              <Legend />
              <Bar yAxisId="score" dataKey="auc" name="AUC" fill="#2f6f73" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="score" dataKey="accuracy" name="Accuracy" fill="#d08c3f" radius={[4, 4, 0, 0]} />
              <Line yAxisId="score" type="monotone" dataKey="precision" name="Avg Precision" stroke="#5f6caf" strokeWidth={3} dot={{ r: 3 }} />
              <Line yAxisId="latency" type="monotone" dataKey="latency" name="Latency" stroke="#a4433f" strokeWidth={3} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartPanel>
      </section>

      {/* Decision Table */}
      <HistoryTable 
        filteredHistory={filteredHistory}
        activeEngine={activeEngine}
        riskFilter={riskFilter}
        setRiskFilter={setRiskFilter}
        filterOptions={filterOptions}
        formatCurrency={formatCurrency}
        formatGlobalCurrency={formatGlobalCurrency}
        toTitle={toTitle}
      />
    </main>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="metric">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ChartPanel({ icon, title, subtitle, children }) {
  return (
    <section className="panel chart-panel">
      <div className="panel-title">
        <div className="title-line">
          {icon}
          <h2>{title}</h2>
        </div>
        <p>{subtitle}</p>
      </div>
      <div className="chart-box">{children}</div>
    </section>
  );
}

function ResultPanel({ latest, metrics, signals, activeEngine }) {
  const probability = latest ? Math.round(latest.default_probability * 100) : 0;
  return (
    <section className="panel result-panel">
      <div className="panel-title">
        <div className="title-line">
          <Gauge />
          <h2>Decision Output</h2>
        </div>
      </div>
      <div className={`gauge ${latest?.risk_tier?.toLowerCase() || ""}`} style={{ "--score": `${probability}%` }}>
        <span>{probability}%</span>
        <small>default probability</small>
      </div>
      <div className="decision-grid">
        <div>
          <span>Risk Tier</span>
          <strong className={`risk-text ${latest?.risk_tier?.toLowerCase() || ""}`}>{latest?.risk_tier || "Pending"}</strong>
        </div>
        <div>
          <span>Decision</span>
          <strong>{toTitle(latest?.decision || "Not scored")}</strong>
        </div>
        <div>
          <span>Model AUC</span>
          <strong>{metrics?.selected_auc_roc || "..."}</strong>
        </div>
        <div>
          <span>
            {activeEngine === "india" ? "EMI Burden" : "Utilization"}
          </span>
          <strong className="risk-value">
            {activeEngine === "india" ? `${signals.emiBurden}%` : `${signals.utilization}%`}
          </strong>
        </div>
      </div>
    </section>
  );
}

function SignalPanel({ signals, activeEngine }) {
  return (
    <section className="panel signal-panel">
      <div className="panel-title">
        <div className="title-line">
          <TrendingUp />
          <h2>Underwriting Signals</h2>
        </div>
      </div>
      {activeEngine === "india" ? (
        <div className="signal-list">
          <Signal label="Loan-to-value (LTV)" value={`${signals.ltv}%`} tone={signals.ltv > 85 ? "danger" : signals.ltv > 70 ? "warn" : "good"} />
          <Signal label="EMI burden" value={`${signals.emiBurden}%`} tone={signals.emiBurden > 45 ? "danger" : signals.emiBurden > 32 ? "warn" : "good"} />
          <Signal label="Total obligation" value={`${signals.totalObligation}%`} tone={signals.totalObligation > 60 ? "danger" : signals.totalObligation > 45 ? "warn" : "good"} />
          <Signal label="CIBIL band" value={signals.cibilBand} tone={signals.cibilScore < 680 ? "danger" : signals.cibilScore < 730 ? "warn" : "good"} />
        </div>
      ) : (
        <div className="signal-list">
          <Signal label="Credit Utilization" value={`${signals.utilization}%`} tone={signals.utilization > 80 ? "danger" : signals.utilization > 50 ? "warn" : "good"} />
          <Signal label="Avg Repayment Ratio" value={`${signals.repaymentRatio}%`} tone={signals.repaymentRatio < 20 ? "danger" : signals.repaymentRatio < 50 ? "warn" : "good"} />
          <Signal label="Max Delay Code" value={signals.maxDelay <= 0 ? "No Delay" : `${signals.maxDelay} Mo.`} tone={signals.maxDelay >= 2 ? "danger" : signals.maxDelay === 1 ? "warn" : "good"} />
          <Signal label="Credit Limit Band" value={signals.cibilBand} tone={signals.limit < 50000 ? "warn" : "good"} />
        </div>
      )}
    </section>
  );
}

function Signal({ label, value, tone }) {
  return (
    <div className={`signal ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function buildAffordability(applicant) {
  const monthlyIncome = Number(applicant.annual_income_inr || 0) / 12;
  const monthlyRate = 0.09 / 12;
  const tenure = Number(applicant.term_months || 1);
  const loan = Number(applicant.loan_amount_inr || 0);
  const emi = loan * monthlyRate * ((1 + monthlyRate) ** tenure) / (((1 + monthlyRate) ** tenure) - 1);
  const ltv = Math.round((loan / Math.max(Number(applicant.property_value_inr || 1), 1)) * 100);
  const emiBurden = Math.round((emi / Math.max(monthlyIncome, 1)) * 100);
  const totalObligation = Math.min(100, Math.round(emiBurden + Number(applicant.dti_ratio || 0)));
  return { monthlyIncome, emi, ltv, emiBurden, totalObligation };
}

function buildAffordabilityRows(applicant, affordability) {
  const annualIncome = Number(applicant.annual_income_inr || 0);
  return [
    { label: "Current", monthlyIncome: affordability.monthlyIncome, emi: affordability.emi, ltv: affordability.ltv, obligation: affordability.totalObligation },
    { label: "+10% Loan", monthlyIncome: affordability.monthlyIncome, emi: affordability.emi * 1.1, ltv: Math.min(100, Math.round(affordability.ltv * 1.1)), obligation: Math.min(100, Math.round(affordability.totalObligation * 1.08)) },
    { label: "+15% Income", monthlyIncome: annualIncome * 1.15 / 12, emi: affordability.emi, ltv: affordability.ltv, obligation: Math.max(0, Math.round(affordability.totalObligation * 0.88)) },
    { label: "Shorter Tenure", monthlyIncome: affordability.monthlyIncome, emi: affordability.emi * 1.22, ltv: affordability.ltv, obligation: Math.min(100, Math.round(affordability.totalObligation * 1.16)) }
  ];
}

function buildIndiaRiskSignals(applicant, affordability) {
  const score = Number(applicant.cibil_score || 0);
  return {
    ...affordability,
    cibilScore: score,
    cibilBand: score >= 750 ? "Strong" : score >= 700 ? "Acceptable" : score >= 650 ? "Watch" : "Weak"
  };
}

function buildCcRiskSignals(applicant) {
  const limit = Number(applicant.limit_bal || 1);
  const bill1 = Number(applicant.bill_amt1 || 0);
  
  const billAmts = [
    applicant.bill_amt1, applicant.bill_amt2, applicant.bill_amt3,
    applicant.bill_amt4, applicant.bill_amt5, applicant.bill_amt6
  ].map(Number);
  const payAmts = [
    applicant.pay_amt1, applicant.pay_amt2, applicant.pay_amt3,
    applicant.pay_amt4, applicant.pay_amt5, applicant.pay_amt6
  ].map(Number);
  
  const avgBill = billAmts.reduce((a, b) => a + b, 0) / 6;
  const avgPay = payAmts.reduce((a, b) => a + b, 0) / 6;
  
  const utilization = Math.min(100, Math.round((bill1 / limit) * 100));
  const repaymentRatio = avgBill > 0 ? Math.min(100, Math.round((avgPay / avgBill) * 100)) : 100;
  
  const maxDelay = Math.max(
    Number(applicant.pay_0 || 0),
    Number(applicant.pay_2 || 0),
    Number(applicant.pay_3 || 0),
    Number(applicant.pay_4 || 0),
    Number(applicant.pay_5 || 0),
    Number(applicant.pay_6 || 0)
  );
  
  let cibilBand = "Low Limit";
  if (limit >= 200000) cibilBand = "High Limit";
  else if (limit >= 70000) cibilBand = "Medium Limit";

  return {
    utilization,
    repaymentRatio,
    maxDelay,
    cibilBand,
    limit
  };
}

function buildCcTrendRows(applicant) {
  return [
    { label: "M-6", bill: applicant.bill_amt6, payment: applicant.pay_amt6 },
    { label: "M-5", bill: applicant.bill_amt5, payment: applicant.pay_amt5 },
    { label: "M-4", bill: applicant.bill_amt4, payment: applicant.pay_amt4 },
    { label: "M-3", bill: applicant.bill_amt3, payment: applicant.pay_amt3 },
    { label: "M-2", bill: applicant.bill_amt2, payment: applicant.pay_amt2 },
    { label: "M-1", bill: applicant.bill_amt1, payment: applicant.pay_amt1 }
  ].map(row => ({
    ...row,
    bill: Number(row.bill || 0),
    payment: Number(row.payment || 0)
  }));
}

function chartValueFormatter(value, name) {
  if (name === "LTV" || name === "Total Obligation") return [`${value}%`, name];
  return [formatCurrency(value), name];
}

function ccChartValueFormatter(value, name) {
  return [formatGlobalCurrency(value), name];
}

function modelValueFormatter(value, name) {
  if (name === "Latency") return [`${Number(value).toFixed(4)} ms`, name];
  return [`${Number(value).toFixed(1)}%`, name];
}

function historyValueFormatter(value, name) {
  if (name === "Latency") return [`${Number(value).toFixed(2)} ms`, name];
  return [`${value}%`, name];
}

function asPercent(value) {
  return Math.round(Number(value || 0) * 1000) / 10;
}

function toTitle(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function formatGlobalCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(Number(value || 0));
}

createRoot(document.getElementById("root")).render(<App />);
