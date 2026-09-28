import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { DataProvider } from "./api/DataProvider.jsx";
import Sidebar from "./components/Sidebar.jsx";
import TopBar from "./components/TopBar.jsx";
import DemoBanner from "./components/DemoBanner.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SalesAnalysis from "./pages/SalesAnalysis.jsx";
import Segmentation from "./pages/Segmentation.jsx";
import Forecasting from "./pages/Forecasting.jsx";
import Insights from "./pages/Insights.jsx";
import DataStatus from "./pages/DataStatus.jsx";

const META = {
  "/": ["Main Dashboard", "A consolidated view of sales performance, transaction segmentation, forecasting, and data-driven business insights."],
  "/sales": ["Sales Analysis", "Category, region and outlet performance"],
  "/segments": ["Customer Segmentation", "Transaction clusters from the ML team's analysis"],
  "/forecast": ["Sales Forecasting", "Historical vs predicted sales"],
  "/insights": ["Insights & Recommendations", "What the numbers imply for the business"],
  "/data": ["Dataset & API status", "What's connected, what's still pending"],
};

const THEME_STORAGE_KEY = "group20-sales-dashboard-theme";

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export default function App() {
  const { pathname } = useLocation();
  const [title, note] = META[pathname] || META["/"];
  const [theme, setTheme] = useState(getStoredTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      return;
    }
  }, [theme]);

  return (
    <DataProvider>
      <div className="shell">
        <Sidebar />
        <div className="main">
          <TopBar title={title} note={note} theme={theme} onThemeChange={setTheme} />
          <main className="content">
            <DemoBanner />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sales" element={<SalesAnalysis />} />
              <Route path="/segments" element={<Segmentation />} />
              <Route path="/forecast" element={<Forecasting />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/data" element={<DataStatus />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </main>
        </div>
      </div>
    </DataProvider>
  );
}
