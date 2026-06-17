import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, Mail, ArrowLeft } from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      if (Array.isArray(err.response?.data?.detail)) {
        setError(err.response.data.detail.map(d => d.msg).join(". "));
      } else {
        setError(err.response?.data?.detail || "Login failed. Check your network or credentials.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to your risk analytics workspace"
      form={form}
      setForm={setForm}
      submit={submit}
      error={error}
      loading={loading}
      button="Sign In to Workspace"
      footer={
        <span>
          No workspace account? <Link to="/register">Create one free</Link>
        </span>
      }
    />
  );
}

export function AuthCard({ title, subtitle, form, setForm, submit, error, loading, button, footer }) {
  return (
    <main className="auth-screen">
      <Link to="/" style={{ position: "absolute", top: "28px", left: "28px", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>
        <ArrowLeft size={16} /> Back to home
      </Link>
      <form className="auth-card" onSubmit={submit}>
        <div style={{ textAlign: "center", marginBottom: "12px" }}>
          <strong style={{ fontFamily: "Outfit", fontSize: "24px", fontWeight: 800, background: "linear-gradient(135deg, #60a5fa, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            RiskEngine
          </strong>
          <h1 style={{ marginTop: "14px", marginBottom: "6px" }}>{title}</h1>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "14px" }}>{subtitle}</p>
        </div>

        <div style={{ display: "grid", gap: "16px" }}>
          <label style={{ display: "grid", gap: "6px", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
            Work Email
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
              <input
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                style={{ paddingLeft: "42px" }}
                required
              />
            </div>
          </label>

          <label style={{ display: "grid", gap: "6px", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
            Password
            <div style={{ position: "relative" }}>
              <KeyRound size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
              <input
                type="password"
                placeholder="••••••••"
                minLength={8}
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                style={{ paddingLeft: "42px" }}
                required
              />
            </div>
          </label>
        </div>

        {error && <p className="form-error">{error}</p>}

        <button disabled={loading}>
          {loading ? "Authenticating..." : button}
        </button>
        {footer}
      </form>
    </main>
  );
}
