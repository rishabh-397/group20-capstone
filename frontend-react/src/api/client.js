import { CONFIG } from "../lib/config.js";

export async function fetchJSON(path, { signal } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), CONFIG.timeoutMs);
  if (signal) signal.addEventListener("abort", () => ctrl.abort(), { once: true });
  try {
    const res = await fetch(CONFIG.apiBase + path, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    if (err.name === "AbortError") throw new Error(`Request timed out after ${CONFIG.timeoutMs / 1000}s`);
    if (err instanceof TypeError) throw new Error("Network or CORS error — the server didn't respond");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
