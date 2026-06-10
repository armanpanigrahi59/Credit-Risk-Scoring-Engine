import React from "react";
import { CheckCircle2, CreditCard, Loader2 } from "lucide-react";

export default function CreditCardForm({
  applicant,
  onSubmit,
  loading,
  onFieldChange,
  onSetPreset,
  presets,
  ccFormTab,
  setCcFormTab,
  payStatusOptions
}) {
  return (
    <form className="panel form-panel" onSubmit={onSubmit}>
      <div className="panel-title split-title">
        <div>
          <div className="title-line">
            <CreditCard size={20} />
            <h2>Credit Card Default Assessment</h2>
          </div>
          <p>Configure applicant demographics, billing history, and repayment statuses.</p>
        </div>
        <button className="primary-action compact" type="submit" disabled={loading}>
          {loading ? <Loader2 className="spin" size={18} /> : <CheckCircle2 size={18} />}
          Score
        </button>
      </div>

      <div className="preset-row">
        {Object.entries(presets).map(([key, value]) => (
          <button 
            className="preset-button" 
            type="button" 
            key={key} 
            onClick={() => onSetPreset(value)}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Inner Sub-tabs for Form Layout */}
      <div className="form-subtabs">
        <button 
          type="button" 
          className={`subtab-btn ${ccFormTab === "profile" ? "active" : ""}`}
          onClick={() => setCcFormTab("profile")}
        >
          1. Profile Details
        </button>
        <button 
          type="button" 
          className={`subtab-btn ${ccFormTab === "history" ? "active" : ""}`}
          onClick={() => setCcFormTab("history")}
        >
          2. Delay History (Months 1-6)
        </button>
        <button 
          type="button" 
          className={`subtab-btn ${ccFormTab === "billing" ? "active" : ""}`}
          onClick={() => setCcFormTab("billing")}
        >
          3. Bills & Payments
        </button>
      </div>

      {ccFormTab === "profile" && (
        <div className="form-section fade-in">
          <h3>Demographics & Credit Limit</h3>
          <div className="form-grid">
            <label className="field">
              <span>Credit Limit ($)</span>
              <input 
                type="number" 
                value={applicant.limit_bal} 
                step="10000" 
                min="0" 
                onChange={(e) => onFieldChange("limit_bal", e.target.value)} 
              />
            </label>
            <label className="field">
              <span>Age (Years)</span>
              <input 
                type="number" 
                value={applicant.age} 
                min="18" 
                max="100" 
                onChange={(e) => onFieldChange("age", e.target.value)} 
              />
            </label>
            <label className="field">
              <span>Gender</span>
              <select 
                value={applicant.sex} 
                onChange={(e) => onFieldChange("sex", e.target.value)}
              >
                <option value={1}>Male</option>
                <option value={2}>Female</option>
              </select>
            </label>
            <label className="field">
              <span>Education</span>
              <select 
                value={applicant.education} 
                onChange={(e) => onFieldChange("education", e.target.value)}
              >
                <option value={1}>Graduate School</option>
                <option value={2}>University</option>
                <option value={3}>High School</option>
                <option value={4}>Others</option>
                <option value={5}>Unknown (5)</option>
                <option value={6}>Unknown (6)</option>
              </select>
            </label>
            <label className="field">
              <span>Marriage Status</span>
              <select 
                value={applicant.marriage} 
                onChange={(e) => onFieldChange("marriage", e.target.value)}
              >
                <option value={1}>Married</option>
                <option value={2}>Single</option>
                <option value={3}>Others</option>
              </select>
            </label>
          </div>
        </div>
      )}

      {ccFormTab === "history" && (
        <div className="form-section fade-in">
          <h3>Delay Codes (-2: Paid fully, 0: Revolving, 1+: Months delayed)</h3>
          <div className="form-grid">
            {[
              { label: "Month 1 Delay Status", field: "pay_0" },
              { label: "Month 2 Delay Status", field: "pay_2" },
              { label: "Month 3 Delay Status", field: "pay_3" },
              { label: "Month 4 Delay Status", field: "pay_4" },
              { label: "Month 5 Delay Status", field: "pay_5" },
              { label: "Month 6 Delay Status", field: "pay_6" }
            ].map((row) => (
              <label className="field" key={row.field}>
                <span>{row.label}</span>
                <select 
                  value={applicant[row.field]} 
                  onChange={(e) => onFieldChange(row.field, e.target.value)}
                >
                  {payStatusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>
      )}

      {ccFormTab === "billing" && (
        <div className="form-section fade-in">
          <h3>Statement Balances vs Payment Amounts</h3>
          <div className="billing-list">
            <div className="billing-header">
              <span>Month Period</span>
              <span>Bill Amount ($)</span>
              <span>Paid Amount ($)</span>
            </div>
            {[
              { label: "Month 1 (Latest)", bill: "bill_amt1", pay: "pay_amt1" },
              { label: "Month 2", bill: "bill_amt2", pay: "pay_amt2" },
              { label: "Month 3", bill: "bill_amt3", pay: "pay_amt3" },
              { label: "Month 4", bill: "bill_amt4", pay: "pay_amt4" },
              { label: "Month 5", bill: "bill_amt5", pay: "pay_amt5" },
              { label: "Month 6 (Oldest)", bill: "bill_amt6", pay: "pay_amt6" }
            ].map((row) => (
              <div className="billing-row" key={row.bill}>
                <span className="row-label">{row.label}</span>
                <input 
                  type="number" 
                  value={applicant[row.bill]} 
                  onChange={(e) => onFieldChange(row.bill, e.target.value)} 
                  placeholder="Bill amount" 
                />
                <input 
                  type="number" 
                  value={applicant[row.pay]} 
                  min="0" 
                  onChange={(e) => onFieldChange(row.pay, e.target.value)} 
                  placeholder="Paid amount" 
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
