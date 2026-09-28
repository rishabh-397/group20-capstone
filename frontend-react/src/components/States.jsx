import { CONFIG } from "../lib/config.js";

export function Skeleton({ rows = 4 }) {
  const widths = [92, 78, 85, 64, 70];
  return (
    <div className="state" role="status" aria-live="polite">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton sk-row" style={{ width: `${widths[i % widths.length]}%` }} />
      ))}
      <span style={{ fontSize: 13, color: "var(--ink-3)" }}>Loading…</span>
    </div>
  );
}

export function ErrorState({ what, error, onRetry }) {
  return (
    <div className="state error">
      <h3>Couldn't load {what}</h3>
      <p>
        {error}. Check that the API is running at <code>{CONFIG.apiBase}</code> and that CORS allows this page's origin.
      </p>
      {onRetry && <button className="btn" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function Empty({ children }) {
  return <div className="state">{children}</div>;
}

export function Pending({ title, children, who }) {
  return (
    <div className="pending">
      <h3>{title}</h3>
      {children}
      {who && <div className="who">{who}</div>}
    </div>
  );
}

/** Renders loading / error / content for one endpoint slice. */
export function Async({ endpoint, what, children }) {
  if (endpoint.status === "loading") return <Skeleton />;
  if (endpoint.status === "error") {
    return <ErrorState what={what} error={endpoint.error} onRetry={endpoint.reload} />;
  }
  return children(endpoint.data);
}
