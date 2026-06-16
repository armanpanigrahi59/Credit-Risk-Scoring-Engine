import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client";
import Layout from "../components/Layout";

export default function ApplicationsList() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState("ALL");

  useEffect(() => {
    api.get("/applications").then((response) => setItems(response.data));
  }, []);

  const filtered = useMemo(() => items.filter((item) => {
    const matchesQuery = item.applicant_data.name.toLowerCase().includes(query.toLowerCase());
    const matchesRisk = risk === "ALL" || item.score_result.risk_class === risk;
    return matchesQuery && matchesRisk;
  }), [items, query, risk]);

  return (
    <Layout>
      <header className="page-header">
        <h1>Applications List</h1>
        <p>Search, filter, and open complete scoring decisions.</p>
      </header>
      <div className="table-tools">
        <input placeholder="Search applicant" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select value={risk} onChange={(event) => setRisk(event.target.value)}>
          <option>ALL</option><option>LOW</option><option>MEDIUM</option><option>HIGH</option>
        </select>
      </div>
      <section className="panel">
        {filtered.length === 0 ? <p className="empty">No applications match the current filters.</p> : (
          <table>
            <thead><tr><th>Name</th><th>Status</th><th>Risk</th><th>Score</th><th>Date</th></tr></thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td><Link to={`/applications/${item.id}`}>{item.applicant_data.name}</Link></td>
                  <td>{item.status}</td>
                  <td><span className={`badge ${item.score_result.risk_class.toLowerCase()}`}>{item.score_result.risk_class}</span></td>
                  <td>{item.score_result.risk_score}</td>
                  <td>{new Date(item.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </Layout>
  );
}
