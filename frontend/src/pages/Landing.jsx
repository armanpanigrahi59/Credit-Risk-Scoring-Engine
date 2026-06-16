import { ArrowRight, BadgeCheck, Blocks, BrainCircuit, FileSearch, Gauge, LockKeyhole, ShieldCheck, Workflow } from "lucide-react";
import { Link } from "react-router-dom";

import ScoreGauge from "../components/ScoreGauge";
import StatsCounter from "../components/StatsCounter";
import TestimonialCarousel from "../components/TestimonialCarousel";

const features = [
  [Gauge, "Real-Time Scoring", "Decision-ready risk scores in under 200ms for most applications."],
  [BrainCircuit, "Explainable AI", "Top contributing risk factors are returned with every score."],
  [ShieldCheck, "Fraud Detection", "Behavioral and affordability signals flag suspicious patterns."],
  [Blocks, "Batch Processing", "Designed for portfolios as well as single applicant reviews."],
  [LockKeyhole, "Regulatory Compliance", "Auditable decisions, user boundaries, and stored score results."],
  [Workflow, "API Integration", "Clean FastAPI routes for scoring, auth, and application history."]
];

export default function Landing() {
  return (
    <main className="landing">
      <nav className="landing-nav">
        <strong>RiskEngine</strong>
        <div>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <Link to="/login">Login</Link>
        </div>
      </nav>
      <section className="hero">
        <div className="hero-copy">
          <h1>Predict Credit Risk. Instantly. Accurately.</h1>
          <p>AI-powered credit scoring that turns applicant, financial, and loan data into explainable decisions your team can act on.</p>
          <div className="hero-actions">
            <Link className="primary" to="/register">Get Started Free <ArrowRight size={18} /></Link>
            <Link className="secondary" to="/dashboard">See Live Demo</Link>
          </div>
        </div>
        <div className="floating-widget">
          <ScoreGauge score={742} label="LOW" />
          <span>91.4% confidence</span>
        </div>
      </section>
      <section className="stats-bar">
        <StatsCounter value={98.7} suffix="%" label="Prediction Accuracy" />
        <StatsCounter value={2} suffix="M+" label="Loan Applications Scored" />
        <StatsCounter value={200} suffix="ms" label="Average Response Time" />
        <StatsCounter value={50} suffix="+" label="Risk Factors Analyzed" />
      </section>
      <section id="features" className="features-grid">
        {features.map(([Icon, title, description]) => (
          <article key={title}>
            <Icon />
            <h2>{title}</h2>
            <p>{description}</p>
          </article>
        ))}
      </section>
      <section className="flow">
        {["Submit Applicant Data", "AI Scores Risk", "Instant Decision + Explanation"].map((step, index) => (
          <div key={step}>
            <span>{index + 1}</span>
            <strong>{step}</strong>
          </div>
        ))}
      </section>
      <TestimonialCarousel />
      <section id="pricing" className="pricing">
        {["Starter", "Pro", "Enterprise"].map((plan, index) => (
          <article key={plan} className={plan === "Pro" ? "popular" : ""}>
            {plan === "Pro" && <b>Most Popular</b>}
            <h2>{plan}</h2>
            <strong>{index === 0 ? "$49" : index === 1 ? "$149" : "Custom"}</strong>
            <p>{["1,000 scores/month", "Advanced explanations", "Dedicated deployment"][index]}</p>
            <ul>
              <li><BadgeCheck size={16} /> JWT dashboard</li>
              <li><BadgeCheck size={16} /> API access</li>
              <li><BadgeCheck size={16} /> PDF reports</li>
            </ul>
          </article>
        ))}
      </section>
      <footer>
        <strong>RiskEngine</strong>
        <span>Privacy</span>
        <span>Security</span>
        <span>Docs</span>
        <small>Copyright 2026 Credit Risk Scoring Engine</small>
      </footer>
    </main>
  );
}
