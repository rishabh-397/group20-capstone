import { useData } from "../api/DataProvider.jsx";
import Panel from "../components/Panel.jsx";
import { Pending } from "../components/States.jsx";
import { CONFIG, ENDPOINTS } from "../lib/config.js";

const LABELS = {
  ok: ["Connected", "ok"],
  demo: ["Sample data", "demo"],
  error: ["Unavailable", "error"],
  loading: ["Connecting", "loading"],
};

const ROWS = [
  ["Main Dashboard KPIs", "kpis", ENDPOINTS.kpis, "Summary sales, profit, transactions, and average order value."],
  ["Sales overview", "salesOverview", ENDPOINTS.salesOverview, "Monthly sales trends and category, region, and outlet breakdowns."],
  ["Segmentation", "segmentation", ENDPOINTS.segmentation, "Customer groups and purchase behavior from clustering."],
  ["Forecast", "forecast", ENDPOINTS.forecast, "Historical sales, model fit, and forward projections."],
  ["Discount margin", "discountMargin", ENDPOINTS.discountMargin, "Average margin and order value by discount tier."],
];

export default function DataStatus() {
  const { entries } = useData();

  return (
    <>
      <Panel title="Backend & API Integration" hint={`API base: ${CONFIG.apiBase}`}>
        <div className="integration-flow" aria-label="Integration flow">
          <span>PostgreSQL Database</span>
          <span className="integration-arrow" aria-hidden="true">→</span>
          <span>FastAPI Backend</span>
          <span className="integration-arrow" aria-hidden="true">→</span>
          <span>REST APIs</span>
          <span className="integration-arrow" aria-hidden="true">→</span>
          <span>Frontend Dashboard</span>
        </div>
        <div className="integration-table-wrap">
          <table className="integration-table">
            <thead>
              <tr>
                <th>Module</th>
                <th>Purpose</th>
                <th>API endpoint</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([name, key, path, purpose]) => {
                const [text, variant] = LABELS[entries[key]?.status] || ["—", "unknown"];
                return (
                  <tr key={key}>
                    <td className="integration-module">{name}</td>
                    <td className="integration-purpose">{purpose}</td>
                    <td><code>{path}</code></td>
                    <td><span className={`integration-status ${variant}`}>{text}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Resolved">
        <div style={{ marginBottom: 14 }}>
          <p>
            <strong>Monthly sales trend</strong> — <code>monthly_trend</code> is now populated on{" "}
            <code>/sales/overview</code> with all 60 real months (2019-01 through 2023-12), after
            a date-column correction (v2 dataset). Chart is live.
          </p>
        </div>
        <p>
          <strong>Real forecast values</strong> — <code>history</code> and <code>forecast</code> arrays
          are now populated on <code>/forecast/</code> with re-run model results
          (R² = 0.612) plus a 3-month forward extrapolation using the documented methodology. Page is live.
        </p>
      </Panel>
    </>
  );
}
