import { useState } from "react";
import { NavLink } from "react-router-dom";

const LINKS = [
  { to: "/", label: "Dashboard", icon: "dashboard", end: true },
  { to: "/sales", label: "Sales Analysis", icon: "sales" },
  { to: "/segments", label: "Segmentation", icon: "segments" },
  { to: "/forecast", label: "Forecasting", icon: "forecast" },
  { to: "/insights", label: "Insights & Recommendations", icon: "insights" },
  { to: "/data", label: "System & API", icon: "system" },
];

const ICONS = {
  dashboard: (
    <>
      <rect x="3" y="3" width="8" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="11" width="7" height="10" rx="1" />
      <rect x="3" y="15" width="8" height="6" rx="1" />
    </>
  ),
  sales: (
    <>
      <path d="M3 3v18h18" />
      <path d="m7 14 4-4 4 3 6-7" />
      <path d="M17 6h4v4" />
    </>
  ),
  segments: (
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="12" cy="18" r="2.5" />
      <path d="M8.2 7.3 10.7 16M15.8 7.3 13.3 16M8.5 6h7" />
    </>
  ),
  forecast: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="m7 17 3-3 3 2 4-4" />
    </>
  ),
  insights: (
    <>
      <path d="M9 18h6M10 22h4" />
      <path d="M8.2 14.5A7 7 0 1 1 15.8 14.5c-.9.7-1.3 1.6-1.3 2.5h-5c0-.9-.4-1.8-1.3-2.5Z" />
      <path d="M12 2v1M4.9 4.9l.7.7M19.1 4.9l-.7.7" />
    </>
  ),
  system: (
    <>
      <rect x="3" y="4" width="18" height="6" rx="1.5" />
      <rect x="3" y="14" width="18" height="6" rx="1.5" />
      <path d="M7 7h.01M7 17h.01M11 7h6M11 17h6" />
    </>
  ),
};

function NavIcon({ name }) {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {ICONS[name]}
    </svg>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  return (
    <aside className={"sidebar" + (open ? " open" : "")}>
      <div className="brand">
        <div className="txt">
          <div className="course">DSN4091 · Capstone · Group 20</div>
          <div className="name">Sales Analytics &amp; Forecasting</div>
          <div className="sub">Retail analytics dashboard</div>
        </div>
        <button className="btn menu-btn" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          Menu
        </button>
      </div>

      <nav className="nav" aria-label="Sections">
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)}>
            <NavIcon name={l.icon} />
            <span className="nav-label">{l.label}</span>
            {l.tag && <span className="tag">{l.tag}</span>}
          </NavLink>
        ))}
      </nav>

    </aside>
  );
}
