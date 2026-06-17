import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { AuthCard } from "./Login";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      if (Array.isArray(err.response?.data?.detail)) {
        setError(err.response.data.detail.map(d => d.msg).join(". "));
      } else {
        setError(err.response?.data?.detail || "Registration failed. Try a different email.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create Account"
      subtitle="Register a secure RiskEngine analyst account"
      form={form}
      setForm={setForm}
      submit={submit}
      error={error}
      loading={loading}
      button="Create Analyst Account"
      footer={
        <span>
          Already registered? <Link to="/login">Sign in here</Link>
        </span>
      }
    />
  );
}
