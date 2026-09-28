const env = import.meta.env ?? {};

export const CONFIG = {
  apiBase: env.VITE_API_BASE || "http://127.0.0.1:8000/api/v1",
  timeoutMs: 8000,
  locale: "en-IN",
  // Set to "" if the dataset's sales figures are unitless.
  currency: "₹",
  // Falls back to bundled sample data when the API can't be reached, so the
  // UI stays demo-able. Set VITE_DEMO_FALLBACK=false for hard errors.
  demoFallback: env.VITE_DEMO_FALLBACK !== "false",
};

export const ENDPOINTS = {
  kpis: env.VITE_EP_KPIS || "/kpis/",
  salesOverview: env.VITE_EP_SALES || "/sales/overview",
  segmentation: env.VITE_EP_SEGMENTATION || "/segmentation/",
  // Confirm this path with Rishabh — assumed, not verified.
  forecast: env.VITE_EP_FORECAST || "/forecast/",
  discountMargin: env.VITE_EP_DISCOUNT_MARGIN || "/sales/discount-margin",
};

export const PALETTE = [
  "var(--series-1)", "var(--series-2)", "var(--series-3)", "var(--series-4)",
  "var(--series-5)", "var(--series-6)", "var(--series-7)", "var(--series-8)",
];

export function apiHost() {
  try { return new URL(CONFIG.apiBase).host; } catch { return CONFIG.apiBase; }
}
