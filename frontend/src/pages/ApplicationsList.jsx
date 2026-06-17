import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Calendar, Award, User, ClipboardList } from "lucide-react";

import { api } from "../api/client";
import Layout from "../components/Layout";

export default function ApplicationsList() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/applications")
      .then((response) => setItems(response.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesQuery = item.applicant_data.name.toLowerCase().includes(query.toLowerCase());
      const matchesRisk = risk === "ALL" || item.score_result.risk_class === risk;
      return matchesQuery && matchesRisk;
    });
  }, [items, query, risk]);

  return (
    <Layout>
      <header className="page-header">
        <h1>Evaluation Logs</h1>
        <p>Audit evaluation history, filter by risk classification, and explore decision summaries.</p>
      </header>

      <div className="table-tools" style={{ gap: "16px", flexWrap: "wrap", marginBottom: "28px" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <Search size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
          <input
            placeholder="Search applicant name..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            style={{ paddingLeft: "42px", width: "100%" }}
          />
        </div>
        <div style={{ position: "relative", minWidth: "160px" }}>
          <Filter size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", pointerEvents: "none" }} />
          <select
            value={risk}
            onChange={(event) => setRisk(event.target.value)}
            style={{ paddingLeft: "42px", cursor: "pointer", width: "100%" }}
          >
            <option value="ALL">All Risk Classes</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
          </select>
        </div>
      </div>

      <section className="panel">
        {loading ? (
          <div className="skeleton" />
        ) : filtered.length === 0 ? (
          <div className="empty">
            <ClipboardList size={48} style={{ display: "block", margin: "0 auto 16px", opacity: 0.3 }} />
            <p>No evaluations match the search filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th><User size={14} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} /> Applicant Name</th>
                  <th>Decision</th>
                  <th><Award size={14} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} /> Risk Rating</th>
                  <th>Score</th>
                  <th><Calendar size={14} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} /> Evaluation Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>
                      <Link to={`/applications/${item.id}`} style={{ color: "#fff", hover: { textDecoration: "underline" } }}>
                        {item.applicant_data.name}
                      </Link>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      <span style={{
                        color: item.status === "APPROVED" ? "var(--success)" : item.status === "REJECTED" ? "var(--danger)" : "var(--warning)"
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${item.score_result.risk_class.toLowerCase()}`}>
                        {item.score_result.risk_class}
                      </span>
                    </td>
                    <td style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: "16px" }}>{item.score_result.risk_score}</td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {new Date(item.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Layout>
  );
}
