import { jsPDF } from "jspdf";
import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useParams } from "react-router-dom";

import { api } from "../api/client";
import Layout from "../components/Layout";
import ScoreGauge from "../components/ScoreGauge";

export default function Results() {
  const { id } = useParams();
  const [item, setItem] = useState(null);

  useEffect(() => {
    api.get(`/applications/${id}`).then((response) => setItem(response.data));
  }, [id]);

  if (!item) return <Layout><div className="skeleton" /></Layout>;
  const result = item.score_result;

  function download() {
    const doc = new jsPDF();
    doc.text("Credit Risk Score Report", 20, 20);
    doc.text(`Applicant: ${item.applicant_data.name}`, 20, 34);
    doc.text(`Score: ${result.risk_score}`, 20, 48);
    doc.text(`Decision: ${result.decision}`, 20, 62);
    doc.text(`Reasoning: ${result.reasoning}`, 20, 76, { maxWidth: 165 });
    doc.save(`credit-risk-report-${item.id}.pdf`);
  }

  return (
    <Layout>
      <header className="page-header">
        <h1>Score Result</h1>
        <p>{item.applicant_data.name} scored {result.risk_class} risk with {result.confidence}% confidence.</p>
      </header>
      <section className={`decision-banner ${result.decision.toLowerCase().replace(" ", "-")}`}>
        <strong>{result.decision}</strong>
        <span>{result.reasoning}</span>
      </section>
      <section className="result-grid">
        <div className="panel">
          <ScoreGauge score={result.risk_score} label={result.risk_class} />
        </div>
        <div className="panel">
          <h2>Top 5 Factors</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={result.top_features}>
              <XAxis dataKey="feature" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="impact" fill="#1E3A8A" />
            </BarChart>
          </ResponsiveContainer>
          <button onClick={download}>Download PDF Report</button>
        </div>
      </section>
    </Layout>
  );
}
