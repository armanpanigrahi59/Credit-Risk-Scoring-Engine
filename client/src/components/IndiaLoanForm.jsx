import React from "react";
import { CheckCircle2, IndianRupee, Loader2 } from "lucide-react";

export default function IndiaLoanForm({
  applicant,
  onSubmit,
  loading,
  onFieldChange,
  onTextFieldChange,
  onBooleanChange,
  onSetPreset,
  presets
}) {
  return (
    <form className="panel form-panel" onSubmit={onSubmit}>
      <div className="panel-title split-title">
        <div>
          <div className="title-line">
            <IndianRupee size={20} />
            <h2>India Loan Application</h2>
          </div>
          <p>Configure financial particulars, bureau signals, and collateral details.</p>
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

      <div className="form-section">
        <h3>Loan and Affordability</h3>
        <div className="form-grid">
          <label className="field">
            <span>Loan Amount (INR)</span>
            <input 
              type="number" 
              value={applicant.loan_amount_inr} 
              step="50000" 
              onChange={(e) => onFieldChange("loan_amount_inr", e.target.value)} 
            />
          </label>
          <label className="field">
            <span>Annual Income (INR)</span>
            <input 
              type="number" 
              value={applicant.annual_income_inr} 
              step="50000" 
              onChange={(e) => onFieldChange("annual_income_inr", e.target.value)} 
            />
          </label>
          <label className="field">
            <span>Property Value (INR)</span>
            <input 
              type="number" 
              value={applicant.property_value_inr} 
              step="50000" 
              onChange={(e) => onFieldChange("property_value_inr", e.target.value)} 
            />
          </label>
          <label className="field">
            <span>Tenure (Months)</span>
            <input 
              type="number" 
              value={applicant.term_months} 
              min="6" 
              max="480" 
              step="6" 
              onChange={(e) => onFieldChange("term_months", e.target.value)} 
            />
          </label>
          <label className="field">
            <span>Existing DTI %</span>
            <input 
              type="number" 
              value={applicant.dti_ratio} 
              min="0" 
              max="100" 
              onChange={(e) => onFieldChange("dti_ratio", e.target.value)} 
            />
          </label>
        </div>
      </div>

      <div className="form-section">
        <h3>Applicant & Bureau Details</h3>
        <div className="form-grid">
          <label className="field">
            <span>CIBIL Score</span>
            <input 
              type="number" 
              value={applicant.cibil_score} 
              min="300" 
              max="900" 
              step="5" 
              onChange={(e) => onFieldChange("cibil_score", e.target.value)} 
            />
          </label>
          <label className="field">
            <span>Age Band</span>
            <select 
              value={applicant.age_band} 
              onChange={(e) => onTextFieldChange("age_band", e.target.value)}
            >
              {["25-34", "35-44", "45-54", "55-64", "65-74", ">74"].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Gender</span>
            <select 
              value={applicant.gender} 
              onChange={(e) => onTextFieldChange("gender", e.target.value)}
            >
              {["Male", "Female", "Joint", "Sex Not Available"].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Region</span>
            <select 
              value={applicant.region} 
              onChange={(e) => onTextFieldChange("region", e.target.value)}
            >
              {["North", "south", "central", "North-East"].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Bureau Type</span>
            <select 
              value={applicant.bureau_type} 
              onChange={(e) => onTextFieldChange("bureau_type", e.target.value)}
            >
              {["CIBIL", "Experian", "CRIF", "Equifax"].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="form-section">
        <h3>Underwriting Parameters</h3>
        <div className="form-grid">
          <label className="field">
            <span>Loan Product</span>
            <select 
              value={applicant.loan_product} 
              onChange={(e) => onTextFieldChange("loan_product", e.target.value)}
            >
              {["Home Loan", "Vehicle Loan", "Personal Loan", "Business Loan"].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Loan Purpose</span>
            <select 
              value={applicant.loan_purpose} 
              onChange={(e) => onTextFieldChange("loan_purpose", e.target.value)}
            >
              {[
                "Home Purchase", "Balance Transfer", "Home Improvement", 
                "Business Expansion", "Vehicle Purchase", "Personal Use"
              ].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Employment</span>
            <select 
              value={applicant.employment_type} 
              onChange={(e) => onTextFieldChange("employment_type", e.target.value)}
            >
              {["Salaried", "Self-employed"].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>
          <label className="field toggle-field">
            <span>Co-applicant Included</span>
            <input 
              type="checkbox" 
              checked={applicant.co_applicant} 
              onChange={(e) => onBooleanChange("co_applicant", e.target.checked)} 
            />
          </label>
          <label className="field toggle-field">
            <span>Pre-approved Offer</span>
            <input 
              type="checkbox" 
              checked={applicant.pre_approved} 
              onChange={(e) => onBooleanChange("pre_approved", e.target.checked)} 
            />
          </label>
        </div>
      </div>
    </form>
  );
}
