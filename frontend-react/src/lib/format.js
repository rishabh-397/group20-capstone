import { CONFIG } from "./config.js";

const nf = new Intl.NumberFormat(CONFIG.locale);
const nf1 = new Intl.NumberFormat(CONFIG.locale, { maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat(CONFIG.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const count = (v) => (Number.isFinite(v) ? nf.format(v) : "—");
export const decimal = (v) => (Number.isFinite(v) ? nf1.format(v) : "—");

export function compact(v) {
  if (!Number.isFinite(v)) return "—";
  const a = Math.abs(v);
  if (CONFIG.locale === "en-IN") {
    if (a >= 1e7) return nf1.format(v / 1e7) + " Cr";
    if (a >= 1e5) return nf1.format(v / 1e5) + " L";
  } else {
    if (a >= 1e9) return nf1.format(v / 1e9) + "B";
    if (a >= 1e6) return nf1.format(v / 1e6) + "M";
    if (a >= 1e3) return nf1.format(v / 1e3) + "K";
  }
  return nf1.format(v);
}

export const money = (v) => (Number.isFinite(v) ? CONFIG.currency + compact(v) : "—");
export const moneyExact = (v) => (Number.isFinite(v) ? CONFIG.currency + nf2.format(v) : "—");
export const pct = (v) => (Number.isFinite(v) ? nf1.format(v * 100) + "%" : "—");
export const truncate = (s, n) => (String(s).length > n ? String(s).slice(0, n - 1) + "…" : String(s));
