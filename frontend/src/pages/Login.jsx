import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    }
  }

  return <AuthCard title="Welcome Back" form={form} setForm={setForm} submit={submit} error={error} button="Login" footer={<span>No account? <Link to="/register">Register</Link></span>} />;
}

export function AuthCard({ title, form, setForm, submit, error, button, footer }) {
  return (
    <main className="auth-screen">
      <form className="auth-card" onSubmit={submit}>
        <h1>{title}</h1>
        <input type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        <input type="password" placeholder="Password" minLength={8} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
        {error && <p className="form-error">{error}</p>}
        <button>{button}</button>
        {footer}
      </form>
    </main>
  );
}
