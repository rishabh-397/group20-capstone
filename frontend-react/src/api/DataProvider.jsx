import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchJSON } from "./client.js";
import { DEMO } from "./demoData.js";
import { CONFIG, ENDPOINTS } from "../lib/config.js";

const DataContext = createContext(null);

const KEYS = {
  kpis: ENDPOINTS.kpis,
  salesOverview: ENDPOINTS.salesOverview,
  segmentation: ENDPOINTS.segmentation,
  forecast: ENDPOINTS.forecast,
  discountMargin: ENDPOINTS.discountMargin,
};

const initial = Object.fromEntries(
  Object.keys(KEYS).map((k) => [k, { status: "loading", data: null, error: null }])
);

export function DataProvider({ children }) {
  const [entries, setEntries] = useState(initial);

  const loadOne = useCallback(async (key) => {
    setEntries((prev) => ({ ...prev, [key]: { ...prev[key], status: "loading", error: null } }));
    try {
      const data = await fetchJSON(KEYS[key]);
      setEntries((prev) => ({ ...prev, [key]: { status: "ok", data, error: null } }));
    } catch (err) {
      const message = err.message || String(err);
      setEntries((prev) => ({
        ...prev,
        [key]: CONFIG.demoFallback && DEMO[key]
          ? { status: "demo", data: DEMO[key], error: message }
          : { status: "error", data: null, error: message },
      }));
    }
  }, []);

  const reload = useCallback(() => {
    Object.keys(KEYS).forEach(loadOne);
  }, [loadOne]);

  useEffect(() => { reload(); }, [reload]);

  // Connection state is derived, not tracked separately — one source of truth.
  const connection = useMemo(() => {
    const statuses = Object.values(entries).map((e) => e.status);
    if (statuses.includes("ok")) return "live";
    if (statuses.includes("loading")) return "connecting";
    if (statuses.includes("demo")) return "demo";
    return "down";
  }, [entries]);

  const value = useMemo(
    () => ({ entries, reload, reloadOne: loadOne, connection, paths: KEYS }),
    [entries, reload, loadOne, connection]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside <DataProvider>");
  return ctx;
}

/** One endpoint's slice: { status, data, error, reload } */
export function useEndpoint(key) {
  const { entries, reloadOne } = useData();
  const entry = entries[key] || { status: "loading", data: null, error: null };
  return { ...entry, reload: () => reloadOne(key) };
}
