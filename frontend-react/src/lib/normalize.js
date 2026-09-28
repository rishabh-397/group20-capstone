/**
 * The backend's exact field names aren't pinned down yet, so every read goes
 * through these helpers: they try the likely spellings and accept a breakdown
 * as either an array of objects or an object map. A naming mismatch then
 * degrades to an empty series instead of a crash.
 */
import { PALETTE } from "./config.js";

const flatten = (k) => String(k).toLowerCase().replace(/[^a-z0-9]/g, "");

export function pick(obj, keys, fallback = null) {
  if (!obj || typeof obj !== "object") return fallback;
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  const flat = {};
  for (const k in obj) flat[flatten(k)] = obj[k];
  for (const k of keys) {
    const v = flat[flatten(k)];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return fallback;
}

export function num(v) {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[^0-9.\-]/g, ""));
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
}

/** Unwrap a `{ data: {...} }` envelope if the API uses one. */
export function unwrap(payload) {
  if (payload && typeof payload.data === "object" && payload.data !== null && !Array.isArray(payload.data)) {
    return payload.data;
  }
  return payload || {};
}

/** Look for a block by name, one level deep as well as at the root. */
export function findBlock(obj, keys) {
  if (!obj || typeof obj !== "object") return null;
  const direct = pick(obj, keys, null);
  if (direct) return direct;
  for (const k in obj) {
    const child = obj[k];
    if (child && typeof child === "object" && !Array.isArray(child)) {
      const nested = pick(child, keys, null);
      if (nested) return nested;
    }
  }
  return null;
}

/** -> [{ name, value, extra }] from an array of objects or an object map. */
export function asSeries(raw, nameKeys, valueKeys) {
  if (!raw) return [];
  if (!Array.isArray(raw) && typeof raw === "object") {
    return Object.entries(raw)
      .map(([k, v]) =>
        v && typeof v === "object"
          ? { name: k, value: num(pick(v, valueKeys, 0)), extra: v }
          : { name: k, value: num(v), extra: null }
      )
      .filter((d) => Number.isFinite(d.value));
  }
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) =>
      row && typeof row === "object"
        ? { name: String(pick(row, nameKeys, "Unknown")), value: num(pick(row, valueKeys, NaN)), extra: row }
        : null
    )
    .filter((d) => d && Number.isFinite(d.value));
}

/** -> [{ x, y }] for time series. */
export function asPoints(raw, xKeys, yKeys) {
  if (!raw) return [];
  if (!Array.isArray(raw) && typeof raw === "object") {
    return Object.entries(raw)
      .map(([k, v]) => ({ x: k, y: num(v && typeof v === "object" ? pick(v, yKeys, 0) : v) }))
      .filter((p) => Number.isFinite(p.y));
  }
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r) => (r && typeof r === "object" ? { x: String(pick(r, xKeys, "")), y: num(pick(r, yKeys, NaN)) } : null))
    .filter((p) => p && Number.isFinite(p.y));
}

export function colorize(series, offset = 0) {
  return series.map((d, i) => ({ ...d, color: PALETTE[(i + offset) % PALETTE.length] }));
}

/** True when the endpoint answers but is still serving stub content. */
export function looksLikePlaceholder(payload) {
  if (!payload) return true;
  const s = JSON.stringify(payload).toLowerCase();
  return /placeholder|dummy|not[_ ]?implemented|coming soon/.test(s);
}
