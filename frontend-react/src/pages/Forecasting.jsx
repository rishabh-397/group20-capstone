import { useState } from "react";
import { useEndpoint } from "../api/DataProvider.jsx";
import { Async, Empty, Pending } from "../components/States.jsx";
import Panel from "../components/Panel.jsx";
import KpiBand from "../components/KpiBand.jsx";
import LineChart from "../components/charts/LineChart.jsx";
import { forecastSeries } from "../lib/selectors.js";
import { looksLikePlaceholder } from "../lib/normalize.js";
import { count, money, pct } from "../lib/format.js";

function PendingNotice() {
  return (
    <Panel>
      <Pending
        title="Forecast model hasn't been re-run yet"
        who="Blocked on: data fix → model re-run"
      >
        <p>
          The endpoint is reachable but still serving placeholder values. The real series lands after the date-column
          fix goes in and the model is retrained on the corrected data.
        </p>
        <p>
          This page renders as soon as the response carries a <code>history</code> array and a <code>forecast</code>{" "}
          array of <code>{"{ period, sales }"}</code> objects — no frontend work left on my side.
        </p>
      </Pending>
    </Panel>
  );
}

const CHUNK_SIZE = 3;

export default function Forecasting() {
  const forecast = useEndpoint("forecast");

  if (forecast.status === "demo" || forecast.status === "error" || looksLikePlaceholder(forecast.data)) {
    return <PendingNotice />;
  }

  return (
    <Async endpoint={forecast} what="the forecast">
      {(data) => {
        const { history, fit, forecast: predicted } = forecastSeries(data);
        if (!history.length && !predicted.length) return <Empty>No forecast series in the response yet.</Empty>;

        const gap = (n) => Array.from({ length: n }, () => ({ x: "", y: NaN }));
        const bridged = history.length && predicted.length
          ? [...gap(history.length - 1), history[history.length - 1], ...predicted]
          : predicted;
        const total = Math.max(history.length + predicted.length, bridged.length);
        const paddedHistory = [...history, ...gap(Math.max(total - history.length, 0))];
        const paddedFit = [...fit, ...gap(Math.max(total - fit.length, 0))];
        const paddedForecast = [...gap(Math.max(total - bridged.length, 0)), ...bridged].slice(-total);
        const labels = [...history.map((p) => p.x), ...predicted.map((p) => p.x)];

        return <ForecastBody
          history={paddedHistory}
          fit={paddedFit}
          forecastBridged={paddedForecast}
          labels={labels}
          rawHistory={history}
          rawPredicted={predicted}
        />;
      }}
    </Async>
  );
}

function ForecastBody({ history, fit, forecastBridged, labels, rawHistory, rawPredicted }) {
  const [chunk, setChunk] = useState(0);
  const total = labels.length;
  const totalChunks = Math.max(1, Math.ceil(total / CHUNK_SIZE));
  const safeChunk = Math.min(chunk, totalChunks - 1);
  const start = safeChunk * CHUNK_SIZE;
  const end = start + CHUNK_SIZE;

  const chunkLabels = labels.slice(start, end);
  const chunkLabel = chunkLabels.length ? `${chunkLabels[0]} \u2013 ${chunkLabels[chunkLabels.length - 1]}` : "";

  const sets = [];
  if (history.length) sets.push({ label: "Actual sales", color: "var(--secondary)", points: history.slice(start, end) });
  if (fit.length) sets.push({ label: "Predicted (historical fit)", color: "var(--primary)", dashed: true, points: fit.slice(start, end) });
  if (forecastBridged.length) sets.push({ label: "Predicted sales", color: "var(--accent)", dashed: true, points: forecastBridged.slice(start, end) });

  const last = rawHistory[rawHistory.length - 1];
  const next = rawPredicted[0];
  const delta = last && next && last.y ? (next.y - last.y) / last.y : NaN;
  const refLines = last ? [{ value: last.y, label: "Last actual", color: "var(--ink-3)" }] : [];

  return (
    <>
      <KpiBand
        items={[
          { label: "Next period forecast", value: money(next?.y), meta: next?.x || "" },
          { label: "Last actual", value: money(last?.y), meta: last?.x || "" },
          {
            label: "Expected change",
            value: Number.isFinite(delta) ? (delta >= 0 ? "+" : "") + pct(delta) : "—",
            meta: "vs last actual period",
          },
        ]}
      />
      <Panel
        title="Actual vs predicted"
        hint={`${chunkLabel} · ${safeChunk + 1} of ${totalChunks} · ${rawHistory.length} historical, ${rawPredicted.length} forecast`}
        controls={
          <>
            <span style={{ fontSize: 12, color: "var(--ink-3)", whiteSpace: "nowrap" }}>
              Horizon: {count(rawPredicted.length)} periods
            </span>
            {totalChunks > 1 && (
              <>
              <button type="button" className="btn" disabled={safeChunk === 0} onClick={() => setChunk(Math.max(0, safeChunk - 1))}>
                ← Prev 3 mo
              </button>
              <button type="button" className="btn" disabled={safeChunk >= totalChunks - 1} onClick={() => setChunk(Math.min(totalChunks - 1, safeChunk + 1))}>
                Next 3 mo →
              </button>
              </>
            )}
          </>
        }
      >
        <LineChart sets={sets} xLabels={chunkLabels} refLines={refLines} />
      </Panel>
    </>
  );
}