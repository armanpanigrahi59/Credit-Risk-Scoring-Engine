import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react";

import { api } from "../api/client";
import Layout from "../components/Layout";

const presets = {
  prime: {
    name: "Charlotte Vance",
    age: 45,
    employment_type: "Salaried",
    annual_income: 135000,
    employment_years: 14,
    credit_history_length: 19,
    num_credit_accounts: 9,
    debt_to_income_ratio: 0.16,
    existing_loans: 0,
    num_delinquencies: 0,
    payment_history_score: 97,
    loan_amount: 35000,
    loan_purpose: "home",
    tenure: 60
  },
  subprime: {
    name: "Tyler Finch",
    age: 24,
    employment_type: "Self-Employed",
    annual_income: 38000,
    employment_years: 1,
    credit_history_length: 2,
    num_credit_accounts: 5,
    debt_to_income_ratio: 0.58,
    existing_loans: 3,
    num_delinquencies: 4,
    payment_history_score: 55,
    loan_amount: 20000,
    loan_purpose: "personal",
    tenure: 36
  },
  mixed: {
    name: "Jordan Hayes",
    age: 33,
    employment_type: "Freelancer",
    annual_income: 72000,
    employment_years: 5,
    credit_history_length: 8,
    num_credit_accounts: 6,
    debt_to_income_ratio: 0.32,
    existing_loans: 1,
    num_delinquencies: 1,
    payment_history_score: 83,
    loan_amount: 18000,
    loan_purpose: "auto",
    tenure: 48
  }
};

const initial = presets.prime;

export default function NewApplication() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const groups = [
    [
      { field: "name", label: "Applicant Full Name", type: "text" },
      { field: "age", label: "Age", type: "number", min: 18, max: 85 },
      { field: "employment_type", label: "Employment Type", type: "select", options: ["Salaried", "Self-Employed", "Freelancer", "Unemployed"] },
      { field: "annual_income", label: "Annual Income (₹)", type: "number", min: 1 },
      { field: "employment_years", label: "Employment Years", type: "number", min: 0 }
    ],
    [
      { field: "credit_history_length", label: "Credit History Length (Years)", type: "number", min: 0 },
      { field: "debt_to_income_ratio", label: "Debt-to-Income Ratio (0.0 - 1.0)", type: "number", min: 0, max: 1, step: 0.01 },
      { field: "existing_loans", label: "Active Loans Count", type: "number", min: 0 },
      { field: "num_delinquencies", label: "Past Delinquencies Count", type: "number", min: 0 },
      { field: "payment_history_score", label: "Payment History Score (0-100)", type: "number", min: 0, max: 100 },
      { field: "num_credit_accounts", label: "Open Credit Accounts", type: "number", min: 0 }
    ],
    [
      { field: "loan_amount", label: "Requested Loan Amount (₹)", type: "number", min: 1 },
      { field: "loan_purpose", label: "Loan Purpose", type: "select", options: ["Personal", "Auto", "Home", "Education", "Venture"] },
      { field: "tenure", label: "Loan Tenure (Months)", type: "number", min: 6, max: 360 }
    ]
  ];

  function update(field, value) {
    const isNumeric = !["name", "employment_type", "loan_purpose"].includes(field);
    setForm((current) => ({
      ...current,
      [field]: isNumeric ? Number(value) : value
    }));
  }

  function applyPreset(presetKey) {
    setForm(presets[presetKey]);
    setStep(0);
    setError("");
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/applications", form);
      navigate(`/applications/${response.data.id}`);
    } catch (err) {
      if (Array.isArray(err.response?.data?.detail)) {
        setError(err.response.data.detail.map(d => `${d.loc.slice(1).join(".")}: ${d.msg}`).join(". "));
      } else {
        setError(err.response?.data?.detail || "Application failed validation check.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <header className="page-header">
        <h1>New Scoring Application</h1>
        <p>Capture applicant credentials, financial background, and loan terms.</p>
      </header>

      <div className="presets-container">
        <span className="preset-title">
          <Sparkles size={14} style={{ display: "inline", marginRight: "6px" }} />
          Quick Test Presets
        </span>
        <button type="button" className="preset-btn" onClick={() => applyPreset("prime")}>Prime Borrower (Low Risk)</button>
        <button type="button" className="preset-btn" onClick={() => applyPreset("mixed")}>Mixed Profile (Medium Risk)</button>
        <button type="button" className="preset-btn" onClick={() => applyPreset("subprime")}>Subprime Borrower (High Risk)</button>
      </div>

      <form className="panel application-form" onSubmit={submit}>
        <div className="progress">
          <span style={{ width: `${((step + 1) / 3) * 100}%` }} />
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="form-grid"
        >
          {groups[step].map((input) => (
            <label key={input.field}>
              {input.label}
              {input.type === "select" ? (
                <select value={form[input.field]} onChange={(e) => update(input.field, e.target.value)} required>
                  {input.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={input.type}
                  min={input.min}
                  max={input.max}
                  step={input.step}
                  value={form[input.field]}
                  onChange={(e) => update(input.field, e.target.value)}
                  placeholder={`Enter ${input.label.toLowerCase()}`}
                  required
                />
              )}
            </label>
          ))}
        </motion.div>

        {error && <p className="form-error" style={{ marginTop: "20px" }}>{error}</p>}

        <div className="form-actions">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          {step < 2 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button disabled={loading} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {loading ? "Evaluating..." : "Submit for Score"} <Sparkles size={16} />
            </button>
          )}
        </div>
      </form>
    </Layout>
  );
}
