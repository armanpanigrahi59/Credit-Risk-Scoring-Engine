import React from "react";
import { Database } from "lucide-react";

export default function HistoryTable({
  filteredHistory,
  activeEngine,
  riskFilter,
  setRiskFilter,
  filterOptions,
  formatCurrency,
  formatGlobalCurrency,
  toTitle
}) {
  return (
    <section className="panel history-panel">
      <div className="panel-title split-title">
        <div>
          <div className="title-line">
            <Database size={20} />
            <h2>{activeEngine === "india" ? "India Decision History" : "Credit Card Scoring Logs"}</h2>
          </div>
          <p>Recent scoring runs with default probability predictions and proxy model latencies.</p>
        </div>
        <div className="filter-row" aria-label="Risk tier filter">
          {filterOptions.map((tier) => (
            <button 
              className={riskFilter === tier ? "filter active" : "filter"} 
              type="button" 
              key={tier} 
              onClick={() => setRiskFilter(tier)}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      <div className="history-grid">
        <div className="table-wrap" style={{ gridColumn: "span 2" }}>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>{activeEngine === "india" ? "Requested Loan" : "Credit Limit"}</th>
                <th>{activeEngine === "india" ? "CIBIL Score" : "Age / Gender"}</th>
                <th>Probability</th>
                <th>Tier</th>
                <th>Decision</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item) => (
                <tr key={item._id}>
                  <td>{new Date(item.createdAt).toLocaleString()}</td>
                  <td>
                    {activeEngine === "india"
                      ? formatCurrency(item.applicant?.loan_amount_inr)
                      : formatGlobalCurrency(item.applicant?.limit_bal)}
                  </td>
                  <td>
                    {activeEngine === "india"
                      ? (item.applicant?.cibil_score || "-")
                      : `${item.applicant?.age || "-"} y/o (${item.applicant?.sex === 1 ? "M" : "F"})`}
                  </td>
                  <td>{Math.round((item.result?.default_probability || 0) * 100)}%</td>
                  <td>
                    <span className={`tier ${item.result?.risk_tier?.toLowerCase()}`}>
                      {item.result?.risk_tier}
                    </span>
                  </td>
                  <td>{toTitle(item.result?.decision || "")}</td>
                </tr>
              ))}
              {!filteredHistory.length && (
                <tr>
                  <td colSpan="6" className="empty-row">No runs scored yet under this track with the selected filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
