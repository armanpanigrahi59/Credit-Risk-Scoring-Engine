import { jsPDF } from "jspdf";
import { useEffect, useState, useMemo } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { useParams, Link } from "react-router-dom";
import { Download, ArrowLeft, ShieldAlert, CheckCircle2, AlertTriangle, FileText } from "lucide-react";

import { api } from "../api/client";
import Layout from "../components/Layout";
import ScoreGauge from "../components/ScoreGauge";

export default function Results() {
  const { id } = useParams();
  const [item, setItem] = useState(null);

  useEffect(() => {
    api.get(`/applications/${id}`).then((response) => setItem(response.data));
  }, [id]);

  const cleanFeatures = useMemo(() => {
    if (!item?.score_result?.top_features) return [];
    return item.score_result.top_features.map(f => ({
      feature: f.feature.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      impact: f.impact
    }));
  }, [item]);

  if (!item) return <Layout><div className="skeleton" /></Layout>;
  const result = item.score_result;

  function download() {
    const doc = new jsPDF();
    
    // Header Band
    doc.setFillColor(7, 9, 22);
    doc.rect(0, 0, 210, 42, "F");
    
    // Logo / Title
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("RiskEngine", 20, 26);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text("AUTOMATED CREDIT RISK SCORE REPORT", 120, 26);
    
    // Divider
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1.5);
    doc.line(0, 42, 210, 42);
    
    // Section 1: Summary Info
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Applicant Profile Summary", 20, 56);
    
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(20, 60, 190, 60);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    
    // Table Details
    const leftCol = 20;
    const rightCol = 110;
    
    doc.text(`Full Name: ${item.applicant_data.name}`, leftCol, 70);
    doc.text(`Age: ${item.applicant_data.age} years`, leftCol, 78);
    doc.text(`Employment Type: ${item.applicant_data.employment_type}`, leftCol, 86);
    doc.text(`Annual Income: INR ${item.applicant_data.annual_income.toLocaleString()}`, leftCol, 94);
    doc.text(`Employment Years: ${item.applicant_data.employment_years} yrs`, leftCol, 102);
    
    doc.text(`Credit History Length: ${item.applicant_data.credit_history_length} yrs`, rightCol, 70);
    doc.text(`Debt-to-Income (DTI) Ratio: ${(item.applicant_data.debt_to_income_ratio * 100).toFixed(1)}%`, rightCol, 78);
    doc.text(`Payment History Score: ${item.applicant_data.payment_history_score}/100`, rightCol, 86);
    doc.text(`Existing Active Loans: ${item.applicant_data.existing_loans}`, rightCol, 94);
    doc.text(`Past Delinquencies: ${item.applicant_data.num_delinquencies}`, rightCol, 102);
    
    // Section 2: Scoring Outcome
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Engine Evaluation", 20, 118);
    doc.line(20, 122, 190, 122);
    
    // Colored Decision Box
    let boxColor = [245, 158, 11]; // Amber
    let textColor = [146, 64, 14]; // Amber text
    if (result.decision === "APPROVED") {
      boxColor = [16, 185, 129]; // Green
      textColor = [6, 78, 59];
    } else if (result.decision === "REJECTED") {
      boxColor = [239, 68, 68]; // Red
      textColor = [127, 29, 29];
    }
    
    doc.setFillColor(boxColor[0], boxColor[1], boxColor[2]);
    doc.rect(20, 128, 170, 22, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(`DECISION OUTCOME: ${result.decision}`, 25, 137);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Credit Risk Score: ${result.risk_score} | Risk Class: ${result.risk_class} | Confidence: ${result.confidence}%`, 25, 144);
    
    // Section 3: Reasoning
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Decision Explanations & Reasoning", 20, 162);
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(result.reasoning, 20, 170, { maxWidth: 170 });
    
    // Section 4: Key Impact Factors
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Top Factors Contributing to Decision", 20, 188);
    doc.line(20, 192, 190, 192);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    
    let yPos = 202;
    cleanFeatures.forEach((f, idx) => {
      const type = f.impact >= 0 ? "Positive Impact (Reduces Risk)" : "Negative Impact (Increases Risk)";
      doc.setFont("helvetica", "bold");
      doc.text(`${idx + 1}. ${f.feature}:`, 20, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(`${f.impact >= 0 ? "+" : ""}${f.impact} (${type})`, 75, yPos);
      yPos += 8;
    });
    
    // Footer watermark
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Generated by RiskEngine Automated ML Decision Pipeline. Confidential Document.", 20, 280);
    
    doc.save(`credit-risk-report-${item.id}.pdf`);
  }

  const decisionIcon = () => {
    if (result.decision === "APPROVED") return <CheckCircle2 size={24} style={{ color: "var(--success)" }} />;
    if (result.decision === "REJECTED") return <ShieldAlert size={24} style={{ color: "var(--danger)" }} />;
    return <AlertTriangle size={24} style={{ color: "var(--warning)" }} />;
  };

  return (
    <Layout>
      <header className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Link to="/applications" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>
            <ArrowLeft size={16} /> Back to list
          </Link>
          <h1>Evaluation Report</h1>
          <p>{item.applicant_data.name} evaluated as {result.risk_class} risk.</p>
        </div>
        <button className="secondary" onClick={download} style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "42px", padding: "0 18px" }}>
          <Download size={16} /> Download PDF Report
        </button>
      </header>

      <section className={`decision-banner ${result.decision.toLowerCase().replace(" ", "-")}`}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {decisionIcon()}
          <strong>{result.decision}</strong>
        </div>
        <span>{result.reasoning}</span>
      </section>

      <section className="result-grid">
        <div className="panel" style={{ display: "grid", placeItems: "center" }}>
          <h2 style={{ width: "100%" }}>Risk Gauge Score</h2>
          <ScoreGauge score={result.risk_score} label={result.risk_class} />
          <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", width: "100%", textAlign: "center" }}>
            <div>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600 }}>Algorithm Confidence</span>
              <strong style={{ display: "block", fontSize: "20px", color: "#fff", fontFamily: "Outfit", marginTop: "4px" }}>{result.confidence}%</strong>
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600 }}>Risk Evaluation Class</span>
              <strong style={{ display: "block", fontSize: "20px", color: "#fff", fontFamily: "Outfit", marginTop: "4px" }}>{result.risk_class}</strong>
            </div>
          </div>
        </div>

        <div className="panel" style={{ display: "flex", flexDirection: "column" }}>
          <h2>Top Feature Contribution Weights</h2>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cleanFeatures} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={135} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d1127",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    color: "#fff",
                    fontFamily: "Plus Jakarta Sans",
                    fontSize: "12px"
                  }}
                />
                <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                  {cleanFeatures.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.impact >= 0 ? "var(--success)" : "var(--danger)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p style={{ margin: "20px 0 0", fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
            <strong style={{ color: "var(--success)" }}>Positive weights</strong> represent factors that improved the credit profile score, whereas <strong style={{ color: "var(--danger)" }}>negative weights</strong> represent risk vectors.
          </p>
        </div>
      </section>

      <section className="panel" style={{ marginTop: "24px" }}>
        <h2>Complete Applicant Financial Posture</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "28px", padding: "12px 0" }}>
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Employment State</span>
            <strong style={{ display: "block", fontSize: "16px", color: "#fff", marginTop: "4px" }}>{item.applicant_data.employment_type} ({item.applicant_data.employment_years} Years)</strong>
          </div>
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Annual Income</span>
            <strong style={{ display: "block", fontSize: "16px", color: "#fff", marginTop: "4px" }}>₹{item.applicant_data.annual_income.toLocaleString()}</strong>
          </div>
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Debt-to-Income (DTI)</span>
            <strong style={{ display: "block", fontSize: "16px", color: "#fff", marginTop: "4px" }}>{(item.applicant_data.debt_to_income_ratio * 100).toFixed(1)}%</strong>
          </div>
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Active Lines / Accounts</span>
            <strong style={{ display: "block", fontSize: "16px", color: "#fff", marginTop: "4px" }}>{item.applicant_data.num_credit_accounts} Accounts ({item.applicant_data.existing_loans} Loans)</strong>
          </div>
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Repayment Score</span>
            <strong style={{ display: "block", fontSize: "16px", color: "#fff", marginTop: "4px" }}>{item.applicant_data.payment_history_score}/100</strong>
          </div>
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Past Delinquencies</span>
            <strong style={{ display: "block", fontSize: "16px", color: "#fff", marginTop: "4px" }}>{item.applicant_data.num_delinquencies} Recorded</strong>
          </div>
        </div>
      </section>
    </Layout>
  );
}
