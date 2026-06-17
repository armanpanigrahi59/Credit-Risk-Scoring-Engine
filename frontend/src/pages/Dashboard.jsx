import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, XCircle, AlertCircle, Users } from "lucide-react";

import { api } from "../api/client";
import Layout from "../components/Layout";

const colors = { LOW: "#10b981", MEDIUM: "#f59e0b", HIGH: "#ef4444" };

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/applications")
      .then((response) => setItems(response.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const kpis = useMemo(() => ({
    total: items.length,
    approved: items.filter((item) => item.status === "APPROVED").length,
    rejected: items.filter((item) => item.status === "REJECTED").length,
    pending: items.filter((item) => item.status === "MANUAL REVIEW").length
  }), [items]);

  const riskRows = useMemo(() => {
    return ["LOW", "MEDIUM", "HIGH"].map((risk) => ({
      name: risk,
      value: items.filter((item) => item.score_result.risk_class === risk).length
    }));
  }, [items]);

  const timeline = useMemo(() => {
    return items.slice().reverse().map((item, index) => ({
      name: `App ${index + 1}`,
      applications: index + 1,
      score: item.score_result.risk_score
    }));
  }, [items]);

  return (
    <Layout>
      <header className="page-header">
        <h1>Dashboard</h1>
        <p>Portfolio credit health, decision logs, and real-time risk distribution.</p>
      </header>

      <section className="kpi-grid">
        <Metric icon={Users} label="Total Portfolios" value={kpis.total} color="var(--accent-primary)" />
        <Metric icon={CheckCircle2} label="Approved Deals" value={kpis.approved} color="var(--success)" />
        <Metric icon={XCircle} label="Rejected Deals" value={kpis.rejected} color="var(--danger)" />
        <Metric icon={AlertCircle} label="Under Review" value={kpis.pending} color="var(--warning)" />
      </section>

      {loading ? (
        <div className="skeleton" />
      ) : (
        <>
          <section className="chart-grid">
            <div className="panel">
              <h2>Portfolio Performance Trends</h2>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeline}>
                    <defs>
                      <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[300, 850]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0d1127",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: "10px",
                        color: "#fff",
                        fontFamily: "Plus Jakarta Sans"
                      }}
                    />
                    <Area type="monotone" dataKey="score" stroke="var(--accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#scoreColor)" name="Credit Score" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="panel">
              <h2>Risk Distribution Mix</h2>
              <div style={{ width: "100%", height: 260, position: "relative" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskRows} dataKey="value" nameKey="name" innerRadius={65} outerRadius={95} paddingAngle={4}>
                      {riskRows.map((entry) => (
                        <Cell key={entry.name} fill={colors[entry.name]} stroke="var(--bg-panel)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0d1127",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: "10px",
                        color: "#fff"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Decision</span>
                  <strong style={{ display: "block", fontSize: "22px", color: "#fff", fontFamily: "Outfit" }}>{kpis.total} Total</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, border: 0, padding: 0 }}>Recent Applications</h2>
              <Link to="/applications" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "14px", fontWeight: 600, color: "var(--accent-primary)" }}>
                View all logs <ArrowUpRight size={16} />
              </Link>
            </div>
            {items.length === 0 ? (
              <p className="empty">No applications processed yet. Click 'New Application' to start.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Applicant Name</th>
                      <th>Risk Score</th>
                      <th>Risk Category</th>
                      <th>Decision status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.slice(0, 5).map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 600 }}>
                          <Link to={`/applications/${item.id}`} style={{ color: "#fff", hover: { textDecoration: "underline" } }}>
                            {item.applicant_data.name}
                          </Link>
                        </td>
                        <td style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: "16px" }}>{item.score_result.risk_score}</td>
                        <td>
                          <span className={`badge ${item.score_result.risk_class.toLowerCase()}`}>
                            {item.score_result.risk_class}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          <span style={{
                            color: item.status === "APPROVED" ? "var(--success)" : item.status === "REJECTED" ? "var(--danger)" : "var(--warning)"
                          }}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </Layout>
  );
}

function Metric({ icon: Icon, label, value, color }) {
  return (
    <article className="metric-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "12px", borderRadius: "12px", color: color }}>
        <Icon size={24} />
      </div>
    </article>
  );
}
