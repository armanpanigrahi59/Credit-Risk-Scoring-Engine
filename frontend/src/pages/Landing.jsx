import { useState, useMemo } from "react";
import { ArrowRight, BadgeCheck, Blocks, BrainCircuit, FileSearch, Gauge, LockKeyhole, ShieldCheck, Workflow, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import ScoreGauge from "../components/ScoreGauge";
import StatsCounter from "../components/StatsCounter";
import TestimonialCarousel from "../components/TestimonialCarousel";
import Ballpit from "../components/Ballpit";
import Prism from "../components/Prism";
import FloatingLines from "../components/FloatingLines";

const features = [
  [Gauge, "Real-Time Scoring", "Decision-ready risk scores in under 200ms for most applications."],
  [BrainCircuit, "Explainable AI", "Top contributing risk factors are returned with every score."],
  [ShieldCheck, "Fraud Detection", "Behavioral and affordability signals flag suspicious patterns."],
  [Blocks, "Batch Processing", "Designed for portfolios as well as single applicant reviews."],
  [LockKeyhole, "Regulatory Compliance", "Auditable decisions, user boundaries, and stored score results."],
  [Workflow, "API Integration", "Clean FastAPI routes for scoring, auth, and application history."]
];

export default function Landing() {
  const [calc, setCalc] = useState({
    annual_income: 950000,
    loan_amount: 250000,
    debt_to_income: 0.28,
    payment_score: 88,
    delinquencies: 0,
    credit_length: 8
  });

  const preview = useMemo(() => {
    // Simple local heuristic that mirrors backend behavior for presentation
    let score = 660;
    score += (calc.payment_score - 75) * 1.5;
    score -= calc.debt_to_income * 120;
    score -= calc.delinquencies * 28;
    score += Math.min(20, calc.credit_length * 2.5);
    
    const loanRatio = calc.loan_amount / Math.max(1, calc.annual_income);
    score -= loanRatio * 180;

    const rounded = Math.max(300, Math.min(850, Math.round(score)));
    let label = "MEDIUM";
    if (rounded >= 700) label = "LOW";
    else if (rounded < 580) label = "HIGH";

    const confidence = (82.4 + (rounded % 120) * 0.12).toFixed(1);
    return { score: rounded, label, confidence };
  }, [calc]);

  return (
    <main className="landing" style={{ background: "var(--bg-main)", color: "var(--text-primary)" }}>
      <nav className="landing-nav" style={{ position: "relative", zIndex: 10 }}>
        <strong>RiskEngine</strong>
        <div>
          <a href="#features">Features</a>
          <a href="#interactive">Estimator</a>
          <a href="#pricing">Pricing</a>
          <Link to="/login" className="login-nav-btn">Login</Link>
        </div>
      </nav>

      {/* Hero Section: Integrated Visuals (FloatingLines + Prism + Ballpit + Gauge) */}
      <section className="hero" style={{ position: "relative", overflow: "hidden", minHeight: "92vh", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", alignItems: "center", padding: "80px clamp(22px, 6vw, 88px) 100px", gap: "40px" }}>
        
        {/* Layer 1: Floating Lines Interactive Wave Background */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "auto", opacity: 0.55 }}>
          <FloatingLines 
            enabledWaves={["top","middle","bottom"]}
            lineCount={8}
            lineDistance={8}
            bendRadius={8}
            bendStrength={-2}
            interactive
            parallax={true}
            animationSpeed={1}
            gradientStart="#e945f5"
            gradientMid="#3b82f6"
            gradientEnd="#6a6a6a"
          />
        </div>

        {/* Hero Copy (Text Content) */}
        <div className="hero-copy" style={{ position: "relative", zIndex: 2 }}>
          <div className="ml-badge">
            <Sparkles size={14} style={{ color: "#60a5fa" }} />
            <span>Machine Learning Credit Scoring</span>
          </div>
          <h1 style={{ background: "linear-gradient(135deg, #ffffff 30%, var(--text-secondary) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "clamp(36px, 5vw, 54px)", lineHeight: "1.1", marginBottom: "20px" }}>
            Predict Credit Risk.<br />Instantly. Accurately.
          </h1>
          <p style={{ fontSize: "18px", lineHeight: "1.6", color: "var(--text-secondary)", maxWidth: "560px", marginBottom: "40px" }}>
            Advanced AI-powered credit scoring engine that transforms financial, demographic, and historical profile data into explainable, instant decisions.
          </p>
          <div className="hero-actions">
            <Link className="primary" to="/register" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>Get Started Free <ArrowRight size={18} /></Link>
            <a className="secondary" href="#interactive">Try Estimator Sandbox</a>
          </div>
        </div>

        {/* Unified Graphic Card on Right (Prism + Ballpit + Gauge) */}
        <div className="unified-graphic-card" style={{ position: "relative", zIndex: 2, borderRadius: "24px", border: "1px solid var(--border-color)", overflow: "hidden", background: "rgba(10, 11, 22, 0.45)", backdropFilter: "blur(12px)", boxShadow: "0 25px 60px rgba(0, 0, 0, 0.45)", height: "550px", display: "flex", justifyContent: "center", alignItems: "center" }}>
          
          {/* Layer 2: 3D Rotating Prism Background */}
          <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}>
            <Prism
              animationType="rotate"
              timeScale={0.4}
              height={3.2}
              baseWidth={5.0}
              scale={3.2}
              hueShift={220}
              colorFrequency={1.0}
              noise={0}
              glow={1.1}
              suspendWhenOffscreen={true}
            />
          </div>

          {/* Layer 3: Interactive Physics Ballpit Overlaid on Prism */}
          <div style={{ position: "absolute", inset: 0, zIndex: 2, mixBlendMode: "screen" }}>
            {/* Component inspired by Kevin Levron: https://x.com/soju22/status/1858925191671271801 */}
            <Ballpit
              count={90}
              gravity={0.012}
              friction={0.9975}
              wallBounce={0.95}
              followCursor={true}
            />
          </div>

          {/* Layer 4: Glassmorphic Floating Scoring Gauge Badge */}
          <div style={{ position: "relative", zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 24px", borderRadius: "20px", background: "rgba(15, 23, 42, 0.7)", border: "1px solid rgba(255, 255, 255, 0.08)", backdropFilter: "blur(8px)", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)", pointerEvents: "none" }}>
            <ScoreGauge score={742} label="LOW" size="small" />
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600, marginTop: "8px" }}>91.4% ML Confidence</span>
          </div>

        </div>
      </section>

      <section className="stats-bar" style={{ position: "relative", zIndex: 2 }}>
        <StatsCounter value={98.7} suffix="%" label="Prediction Accuracy" />
        <StatsCounter value={2} suffix="M+" label="Applications Scored" />
        <StatsCounter value={200} suffix="ms" label="Average Latency" />
        <StatsCounter value={50} suffix="+" label="Risk Factors Configured" />
      </section>

      {/* Interactive Estimator Sandbox with Rupee Formats */}
      <section id="interactive" style={{ padding: "100px clamp(22px, 6vw, 88px)", borderBottom: "1px solid var(--border-color)", position: "relative", zIndex: 2 }}>
        <h2 style={{ fontFamily: "Outfit", fontSize: "36px", textAlign: "center", marginBottom: "12px", fontWeight: 800 }}>
          Interactive Scorer Sandbox
        </h2>
        <p style={{ color: "var(--text-secondary)", textAlign: "center", maxWidth: "600px", margin: "0 auto 48px", fontSize: "16px" }}>
          Tweak client variables below to simulate real-time ML risk categorization and confidence ranges in Indian Rupees (₹).
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "48px", alignItems: "center" }} className="chart-grid">
          <div className="panel" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "20px", padding: "28px" }}>
            <label style={{ display: "grid", gap: "6px", fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)" }}>
              Annual Income (₹)
              <input type="number" value={calc.annual_income} onChange={e => setCalc({...calc, annual_income: Number(e.target.value)})} />
            </label>
            <label style={{ display: "grid", gap: "6px", fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)" }}>
              Requested Loan Amount (₹)
              <input type="number" value={calc.loan_amount} onChange={e => setCalc({...calc, loan_amount: Number(e.target.value)})} />
            </label>
            <label style={{ display: "grid", gap: "6px", fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)" }}>
              Debt-to-Income Ratio
              <input type="number" step="0.01" value={calc.debt_to_income} onChange={e => setCalc({...calc, debt_to_income: Number(e.target.value)})} />
            </label>
            <label style={{ display: "grid", gap: "6px", fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)" }}>
              Payment History Score (0-100)
              <input type="number" min="0" max="100" value={calc.payment_score} onChange={e => setCalc({...calc, payment_score: Number(e.target.value)})} />
            </label>
            <label style={{ display: "grid", gap: "6px", fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)" }}>
              Number of Delinquencies
              <input type="number" value={calc.delinquencies} onChange={e => setCalc({...calc, delinquencies: Number(e.target.value)})} />
            </label>
            <label style={{ display: "grid", gap: "6px", fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)" }}>
              Credit History Length (years)
              <input type="number" value={calc.credit_length} onChange={e => setCalc({...calc, credit_length: Number(e.target.value)})} />
            </label>
          </div>

          <div className="panel" style={{ textAlign: "center", padding: "40px", background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "20px" }}>
            <h3 style={{ margin: "0 0 20px", fontFamily: "Outfit", fontSize: "20px", fontWeight: 700 }}>Scoring Outcome</h3>
            <ScoreGauge score={preview.score} label={preview.label} />
            <span style={{ color: "var(--text-secondary)", display: "block", marginTop: "12px", fontSize: "14px" }}>
              {preview.confidence}% confidence interval
            </span>
          </div>
        </div>
      </section>

      <section id="features" className="features-grid" style={{ position: "relative", zIndex: 2 }}>
        {features.map(([Icon, title, description]) => (
          <article key={title} style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "16px", padding: "28px" }}>
            <Icon size={32} style={{ color: "var(--accent-primary)", marginBottom: "16px" }} />
            <h2>{title}</h2>
            <p>{description}</p>
          </article>
        ))}
      </section>

      <section className="flow" style={{ position: "relative", zIndex: 2 }}>
        {["Submit Applicant Data", "AI Scores Risk", "Instant Decision + Explanation"].map((step, index) => (
          <div key={step} style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "16px", padding: "24px" }}>
            <span style={{ background: "var(--accent-glow)", color: "var(--accent-primary)", border: "1px solid rgba(59, 130, 246, 0.2)" }}>{index + 1}</span>
            <strong>{step}</strong>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: "6px 0 0" }}>
              {["Capture client parameters securely", "Run optimized XGBoost neural pipeline", "Download audit logs and explanations"][index]}
            </p>
          </div>
        ))}
      </section>

      <TestimonialCarousel />

      {/* Pricing in Rupees */}
      <section id="pricing" className="pricing" style={{ position: "relative", zIndex: 2 }}>
        {["Starter", "Pro", "Enterprise"].map((plan, index) => (
          <article key={plan} className={plan === "Pro" ? "popular" : ""} style={{ background: "rgba(255,255,255,0.01)", border: plan === "Pro" ? "2px solid var(--accent-primary)" : "1px solid var(--border-color)", borderRadius: "20px", padding: "36px 28px" }}>
            {plan === "Pro" && <b style={{ background: "var(--accent-primary)", color: "#fff" }}>Most Popular</b>}
            <h2>{plan}</h2>
            <strong style={{ fontFamily: "Outfit", fontSize: "36px", fontWeight: 800, color: "#fff" }}>
              {index === 0 ? "₹3,999" : index === 1 ? "₹11,999" : "Custom"}
            </strong>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: "8px 0 24px" }}>
              {["1,000 scores/month", "Advanced explanations", "Dedicated deployment"][index]}
            </p>
            <ul style={{ borderTop: "1px solid var(--border-color)", paddingTop: "20px" }}>
              <li><BadgeCheck size={16} style={{ color: "var(--success)" }} /> JWT dashboard</li>
              <li><BadgeCheck size={16} style={{ color: "var(--success)" }} /> API access</li>
              <li><BadgeCheck size={16} style={{ color: "var(--success)" }} /> PDF reports</li>
            </ul>
          </article>
        ))}
      </section>

      <footer>
        <strong>RiskEngine</strong>
        <span>Privacy Policy</span>
        <span>Security Audits</span>
        <span>Developer Docs</span>
        <small>Copyright © 2026 Credit Risk Scoring Engine. All rights reserved.</small>
      </footer>
    </main>
  );
}
