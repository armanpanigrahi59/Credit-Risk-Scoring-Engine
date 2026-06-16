import { useEffect, useMemo, useState } from "react";
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { api } from "../api/client";
import Layout from "../components/Layout";

const colors = { LOW: "#16a34a", MEDIUM: "#d97706", HIGH: "#dc2626" };

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/applications").then((response) => setItems(response.data)).finally(() => setLoading(false));
  }, []);

  const kpis = useMemo(() => ({
    total: items.length,
    approved: items.filter((item) => item.status === "APPROVED").length,
    rejected: items.filter((item) => item.status === "REJECTED").length,
    pending: items.filter((item) => item.status === "MANUAL REVIEW").length
  }), [items]);

  const riskRows = ["LOW", "MEDIUM", "HIGH"].map((risk) => ({ name: risk, value: items.filter((item) => item.score_result.risk_class === risk).length }));
  const timeline = items.slice().reverse().map((item, index) => ({ name: `#${index + 1}`, applications: index + 1, score: item.score_result.risk_score }));

  return (
    <Layout>
      <header className="page-header">
        <h1>Dashboard</h1>
        <p>Portfolio performance, decision mix, and recent application activity.</p>
      </header>
      <section className="kpi-grid">
        <Metric label="Total Applications" value={kpis.total} />
        <Metric label="Approved" value={kpis.approved} />
        <Metric label="Rejected" value={kpis.rejected} />
        <Metric label="Pending" value={kpis.pending} />
      </section>
      {loading ? <div className="skeleton" /> : (
        <>
          <section className="chart-grid">
            <div className="panel">
              <h2>Applications over last 30 days</h2>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={timeline}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="applications" stroke="#1E3A8A" strokeWidth={3} />
                  <Line dataKey="score" stroke="#16a34a" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="panel">
              <h2>Risk distribution</h2>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={riskRows} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96}>
                    {riskRows.map((entry) => <Cell key={entry.name} fill={colors[entry.name]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section className="panel">
            <h2>Recent applications</h2>
            <table>
              <tbody>
                {items.slice(0, 6).map((item) => (
                  <tr key={item.id}>
                    <td>{item.applicant_data.name}</td>
                    <td>{item.score_result.risk_score}</td>
                    <td><span className={`badge ${item.score_result.risk_class.toLowerCase()}`}>{item.score_result.risk_class}</span></td>
                    <td>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </Layout>
  );
}

function Metric({ label, value }) {
  return <article className="metric-card"><span>{label}</span><strong>{value}</strong></article>;
}
