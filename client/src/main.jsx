import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Database,
  FileClock,
  Gauge,
  IndianRupee,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  WalletCards
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
import { fetchHealth, fetchIndiaMetrics, fetchScores, submitIndiaScore } from "./services/api";
import "./styles.css";

const initialApplicant = {
  loan_amount_inr: 2800000,
  annual_income_inr: 1200000,
  property_value_inr: 4200000,
  term_months: 240,
  cibil_score: 760,
  dti_ratio: 32,
  age_band: "35-44",
  gender: "Joint",
  region: "North",
  loan_product: "Home Loan",
  loan_purpose: "Home Purchase",
  employment_type: "Salaried",
  bureau_type: "CIBIL",
  co_applicant: true,
  pre_approved: false
};

const applicantPresets = {
  "Prime Home": initialApplicant,
  "Thin Margin": {
    ...initialApplicant,
    loan_amount_inr: 3600000,
    annual_income_inr: 780000,
    property_value_inr: 4100000,
    cibil_score: 672,
    dti_ratio: 54,
    age_band: "25-34",
    region: "south",
    co_applicant: false
  },
  "Vehicle Buyer": {
    ...initialApplicant,
    loan_amount_inr: 850000,
    annual_income_inr: 900000,
    property_value_inr: 1100000,
    term_months: 60,
    cibil_score: 720,
    dti_ratio: 28,
    loan_product: "Vehicle Loan",
    loan_purpose: "Vehicle Purchase"
  },
  "Business Need": {
    ...initialApplicant,
    loan_amount_inr: 1800000,
    annual_income_inr: 1050000,
    property_value_inr: 2500000,
    term_months: 96,
    cibil_score: 690,
    dti_ratio: 46,
    loan_product: "Business Loan",
    loan_purpose: "Business Expansion",
    employment_type: "Self-employed"
  }
};

const filterOptions = ["All", "Low", "Medium", "High", "Critical"];

function App() {
  const [applicant, setApplicant] = useState(initialApplicant);
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [latest, setLatest] = useState(null);
  const [riskFilter, setRiskFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadDashboard() {
    const [healthData, metricsData, scoreData] = await Promise.all([
      fetchHealth(),
      fetchIndiaMetrics(),
      fetchScores()
    ]);
    setHealth(healthData);
    setMetrics(metricsData);
    setHistory(scoreData.items || []);
  }

  useEffect(() => {
    async function boot() {
      try {
        await loadDashboard();
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    }
    boot();
  }, []);

  const modelRows = useMemo(() => {
    if (!metrics?.models) return [];
    return Object.entries(metrics.models).map(([name, model]) => ({
      name: toTitle(name),
      auc: asPercent(model.auc_roc),
      accuracy: asPercent(model.accuracy),
      precision: asPercent(model.average_precision),
      latency: Number(model.avg_batch_latency_ms_per_record || 0)
    }));
  }, [metrics]);

  const affordability = useMemo(() => buildAffordability(applicant), [applicant]);
  const affordabilityRows = useMemo(() => buildAffordabilityRows(applicant, affordability), [applicant, affordability]);
  const riskSignals = useMemo(() => buildRiskSignals(applicant, affordability), [applicant, affordability]);
  const decisionSummary = useMemo(() => summarizeHistory(history), [history]);

  const filteredHistory = useMemo(() => {
    const indiaRows = history.filter((item) => item.applicant?.market === "India" || item.applicant?.loan_amount_inr);
    if (riskFilter === "All") return indiaRows;
    return indiaRows.filter((item) => item.result?.risk_tier === riskFilter);
  }, [history, riskFilter]);

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

  function updateField(field, value) {
    setApplicant((current) => ({ ...current, [field]: Number(value) }));
  }

  function updateTextField(field, value) {
    setApplicant((current) => ({ ...current, [field]: value }));
  }

  function updateBoolean(field, value) {
    setApplicant((current) => ({ ...current, [field]: value }));
  }

  async function handleRefresh() {
    setRefreshing(true);
    setError("");
    try {
      await loadDashboard();
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
      const response = await submitIndiaScore(applicant);
      setLatest(response.result);
      const scoreData = await fetchScores();
      setHistory(scoreData.items || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <AuroraBackground />
      <div className="ambient-grid" aria-hidden="true" />
      <section className="topbar">
        <div>
          <span className="eyebrow">India Loan Risk AI</span>
          <h1>Indian Credit Risk Workbench</h1>
          <p>Score Indian-style loan applications with rupee inputs, CIBIL-like bureau signals, EMI affordability, LTV, DTI, and audit-ready decision history.</p>
        </div>
        <div className="status-strip">
          <Status icon={<Activity />} label="API" value={health?.backend || "checking"} />
          <Status icon={<Database />} label="Mongo" value={health?.database || "checking"} />
          <Status icon={<Sparkles />} label="ML" value={health?.ml?.india_selected_model || "checking"} />
          <button className="icon-action" type="button" onClick={handleRefresh} aria-label="Refresh dashboard" title="Refresh dashboard">
            <RefreshCw className={refreshing ? "spin" : ""} />
          </button>
        </div>
      </section>

      {error && <div className="alert">{error}</div>}

      <section className="metric-grid" aria-label="India model overview">
        <Metric icon={<BadgeCheck />} label="Selected Model" value={toTitle(metrics?.selected_model || "Loading")} />
        <Metric icon={<Gauge />} label="AUC-ROC" value={metrics?.selected_auc_roc || "..."} />
        <Metric icon={<FileClock />} label="Training Records" value={formatNumber(metrics?.dataset?.records || 0)} />
        <Metric icon={<ShieldAlert />} label="Indian Decisions" value={filteredHistory.length} />
      </section>

      <section className="workspace-grid">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="panel-title split-title">
            <div>
              <div className="title-line">
                <IndianRupee />
                <h2>Indian Loan Application</h2>
              </div>
              <p>Use annual income, requested loan, collateral value, bureau score, and repayment burden.</p>
            </div>
            <button className="primary-action compact" type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 className="spin" /> : <CheckCircle2 />}
              Score
            </button>
          </div>

          <div className="preset-row">
            {Object.entries(applicantPresets).map(([key, value]) => (
              <button className="preset-button" type="button" key={key} onClick={() => setApplicant(value)}>
                {key}
              </button>
            ))}
          </div>

          <div className="form-section">
            <h3>Loan and Affordability</h3>
            <div className="form-grid">
              <NumberField label="Loan Amount (INR)" value={applicant.loan_amount_inr} step="50000" onChange={(v) => updateField("loan_amount_inr", v)} />
              <NumberField label="Annual Income (INR)" value={applicant.annual_income_inr} step="50000" onChange={(v) => updateField("annual_income_inr", v)} />
              <NumberField label="Property / Asset Value" value={applicant.property_value_inr} step="50000" onChange={(v) => updateField("property_value_inr", v)} />
              <NumberField label="Tenure (Months)" value={applicant.term_months} min="6" max="480" step="6" onChange={(v) => updateField("term_months", v)} />
              <NumberField label="Existing DTI %" value={applicant.dti_ratio} min="0" max="100" onChange={(v) => updateField("dti_ratio", v)} />
            </div>
          </div>

          <div className="form-section">
            <h3>Applicant and Bureau</h3>
            <div className="form-grid">
              <NumberField label="CIBIL Score" value={applicant.cibil_score} min="300" max="900" step="5" onChange={(v) => updateField("cibil_score", v)} />
              <SelectField label="Age Band" value={applicant.age_band} onChange={(v) => updateTextField("age_band", v)} options={["25-34", "35-44", "45-54", "55-64", "65-74", ">74"]} />
              <SelectField label="Gender" value={applicant.gender} onChange={(v) => updateTextField("gender", v)} options={["Male", "Female", "Joint", "Sex Not Available"]} />
              <SelectField label="Region" value={applicant.region} onChange={(v) => updateTextField("region", v)} options={["North", "south", "central", "North-East"]} />
              <SelectField label="Bureau" value={applicant.bureau_type} onChange={(v) => updateTextField("bureau_type", v)} options={["CIBIL", "Experian", "CRIF", "Equifax"]} />
            </div>
          </div>

          <div className="form-section">
            <h3>Loan Details</h3>
            <div className="form-grid">
              <SelectField label="Loan Product" value={applicant.loan_product} onChange={(v) => updateTextField("loan_product", v)} options={["Home Loan", "Vehicle Loan", "Personal Loan", "Business Loan"]} />
              <SelectField label="Purpose" value={applicant.loan_purpose} onChange={(v) => updateTextField("loan_purpose", v)} options={["Home Purchase", "Balance Transfer", "Home Improvement", "Business Expansion", "Vehicle Purchase", "Personal Use"]} />
              <SelectField label="Employment" value={applicant.employment_type} onChange={(v) => updateTextField("employment_type", v)} options={["Salaried", "Self-employed"]} />
              <ToggleField label="Co-applicant" checked={applicant.co_applicant} onChange={(v) => updateBoolean("co_applicant", v)} />
              <ToggleField label="Pre-approved" checked={applicant.pre_approved} onChange={(v) => updateBoolean("pre_approved", v)} />
            </div>
          </div>
        </form>

        <aside className="side-stack">
          <ResultPanel latest={latest} metrics={metrics} signals={riskSignals} />
          <SignalPanel signals={riskSignals} />
        </aside>
      </section>

      <section className="analytics-grid">
        <ChartPanel icon={<WalletCards />} title="EMI Affordability" subtitle="Monthly income and estimated EMI as bars, LTV and total obligation as lines.">
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={affordabilityRows} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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

        <ChartPanel icon={<BarChart3 />} title="Model Comparison" subtitle="AUC, accuracy, average precision, and latency for the real-data training run.">
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

      <section className="panel history-panel">
        <div className="panel-title split-title">
          <div>
            <div className="title-line">
              <Database />
              <h2>India Decision History</h2>
            </div>
            <p>Recent India-loan scores with default probability and latency trend.</p>
          </div>
          <div className="filter-row" aria-label="Risk tier filter">
            {filterOptions.map((tier) => (
              <button className={riskFilter === tier ? "filter active" : "filter"} type="button" key={tier} onClick={() => setRiskFilter(tier)}>
                {tier}
              </button>
            ))}
          </div>
        </div>

        <div className="history-grid">
          <div className="trend-box">
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={trendRows} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dce4df" />
                <XAxis dataKey="label" />
                <YAxis yAxisId="probability" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <YAxis yAxisId="latency" orientation="right" tickFormatter={(value) => `${value}ms`} />
                <Tooltip formatter={historyValueFormatter} />
                <Legend />
                <Bar yAxisId="latency" dataKey="latency" name="Latency" fill="#c8d8d2" radius={[4, 4, 0, 0]} />
                <Line yAxisId="probability" type="monotone" dataKey="probability" name="Default Probability" stroke="#a4433f" strokeWidth={3} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Loan</th>
                  <th>CIBIL</th>
                  <th>Probability</th>
                  <th>Tier</th>
                  <th>Decision</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr key={item._id}>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                    <td>{formatCurrency(item.applicant?.loan_amount_inr || item.applicant?.limit_bal)}</td>
                    <td>{item.applicant?.cibil_score || "-"}</td>
                    <td>{Math.round((item.result?.default_probability || 0) * 100)}%</td>
                    <td><span className={`tier ${item.result?.risk_tier?.toLowerCase()}`}>{item.result?.risk_tier}</span></td>
                    <td>{toTitle(item.result?.decision || "")}</td>
                  </tr>
                ))}
                {!filteredHistory.length && (
                  <tr>
                    <td colSpan="6" className="empty-row">Score an Indian loan application to start this history.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

function Status({ icon, label, value }) {
  return (
    <div className="status-pill">
      {icon}
      <span>{label}</span>
      <strong>{toTitle(value)}</strong>
    </div>
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

function NumberField({ label, value, onChange, min, max, step = "1" }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type="number" value={value} min={min} max={max} step={step} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function ToggleField({ label, checked, onChange }) {
  return (
    <label className="field toggle-field">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function ResultPanel({ latest, metrics, signals }) {
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
          <strong>{latest?.risk_tier || "Pending"}</strong>
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
          <span>EMI Burden</span>
          <strong>{signals.emiBurden}%</strong>
        </div>
      </div>
    </section>
  );
}

function SignalPanel({ signals }) {
  return (
    <section className="panel signal-panel">
      <div className="panel-title">
        <div className="title-line">
          <TrendingUp />
          <h2>Underwriting Signals</h2>
        </div>
      </div>
      <div className="signal-list">
        <Signal label="Loan-to-value" value={`${signals.ltv}%`} tone={signals.ltv > 85 ? "danger" : signals.ltv > 70 ? "warn" : "good"} />
        <Signal label="EMI burden" value={`${signals.emiBurden}%`} tone={signals.emiBurden > 45 ? "danger" : signals.emiBurden > 32 ? "warn" : "good"} />
        <Signal label="Total obligation" value={`${signals.totalObligation}%`} tone={signals.totalObligation > 60 ? "danger" : signals.totalObligation > 45 ? "warn" : "good"} />
        <Signal label="CIBIL band" value={signals.cibilBand} tone={signals.cibilScore < 680 ? "danger" : signals.cibilScore < 730 ? "warn" : "good"} />
      </div>
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

function buildRiskSignals(applicant, affordability) {
  const score = Number(applicant.cibil_score || 0);
  return {
    ...affordability,
    cibilScore: score,
    cibilBand: score >= 750 ? "Strong" : score >= 700 ? "Acceptable" : score >= 650 ? "Watch" : "Weak"
  };
}

function summarizeHistory(history) {
  return {
    manualReviews: history.filter((item) => item.result?.decision === "manual_review").length
  };
}

function chartValueFormatter(value, name) {
  if (name === "LTV" || name === "Total Obligation") return [`${value}%`, name];
  return [formatCurrency(value), name];
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

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(Number(value || 0));
}

createRoot(document.getElementById("root")).render(<App />);
