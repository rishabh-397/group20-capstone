import { useData } from "../api/DataProvider.jsx";
import { apiHost } from "../lib/config.js";

const TEXT = {
  live: () => `Live data · ${apiHost()}`,
  demo: () => "Sample data · API unreachable",
  down: () => "API unreachable",
  connecting: () => "Connecting…",
};

export default function TopBar({ title, note, theme, onThemeChange }) {
  const { connection, reload } = useData();
  return (
    <header className="topbar">
      <div style={{ flex: 1, minWidth: 180 }}>
        <h1>{title}</h1>
        <div className="page-note">{note}</div>
      </div>
      <div className="topbar-actions">
        <div className={"status " + connection} role="status">
          <span className="led" />
          <span>{TEXT[connection]()}</span>
        </div>
        <div className="theme-toggle" role="group" aria-label="Color theme">
          <button
            type="button"
            className={"theme-option" + (theme === "light" ? " active" : "")}
            aria-label="Use light mode"
            aria-pressed={theme === "light"}
            onClick={() => onThemeChange("light")}
          >
            <span aria-hidden="true">☀️</span> Light
          </button>
          <button
            type="button"
            className={"theme-option" + (theme === "dark" ? " active" : "")}
            aria-label="Use dark mode"
            aria-pressed={theme === "dark"}
            onClick={() => onThemeChange("dark")}
          >
            <span aria-hidden="true">🌙</span> Dark
          </button>
        </div>
        <button className="btn" onClick={reload}>Refresh data</button>
      </div>
    </header>
  );
}
