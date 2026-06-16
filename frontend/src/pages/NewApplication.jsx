import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../api/client";
import Layout from "../components/Layout";

const initial = {
  name: "Avery Morgan",
  age: 34,
  employment_type: "Salaried",
  annual_income: 96000,
  employment_years: 6,
  credit_history_length: 9,
  num_credit_accounts: 5,
  debt_to_income_ratio: 0.28,
  existing_loans: 1,
  num_delinquencies: 0,
  payment_history_score: 88,
  loan_amount: 28000,
  loan_purpose: "auto",
  tenure: 48
};

export default function NewApplication() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const groups = [
    [["name", "Name"], ["age", "Age"], ["employment_type", "Employment Type"], ["annual_income", "Annual Income"], ["employment_years", "Employment Years"]],
    [["credit_history_length", "Credit History Length"], ["debt_to_income_ratio", "Debt-to-Income Ratio"], ["existing_loans", "Existing Loans"], ["num_delinquencies", "Delinquencies"], ["payment_history_score", "Payment History Score"], ["num_credit_accounts", "Credit Accounts"]],
    [["loan_amount", "Loan Amount"], ["loan_purpose", "Purpose"], ["tenure", "Tenure Months"]]
  ];

  function update(field, value) {
    const numeric = !["name", "employment_type", "loan_purpose"].includes(field);
    setForm((current) => ({ ...current, [field]: numeric ? Number(value) : value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      const response = await api.post("/applications", form);
      navigate(`/applications/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || "Application failed validation");
    }
  }

  return (
    <Layout>
      <header className="page-header">
        <h1>New Application</h1>
        <p>Capture applicant details, financial posture, and loan terms.</p>
      </header>
      <form className="panel application-form" onSubmit={submit}>
        <div className="progress"><span style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>
        <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="form-grid">
          {groups[step].map(([field, label]) => (
            <label key={field}>
              {label}
              <input value={form[field]} onChange={(event) => update(field, event.target.value)} required />
            </label>
          ))}
        </motion.div>
        {error && <p className="form-error">{error}</p>}
        <div className="form-actions">
          <button type="button" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>
          {step < 2 ? <button type="button" onClick={() => setStep(step + 1)}>Next</button> : <button>Submit for Score</button>}
        </div>
      </form>
    </Layout>
  );
}
