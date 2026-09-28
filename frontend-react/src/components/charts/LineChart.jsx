import { compact, truncate } from "../../lib/format.js";

/**
 * sets: [{ label, color, dashed, points: [{ x, y }] }]
 * Non-finite y values break the line rather than emitting NaN coordinates,
 * which is what lets the forecast series start where the actuals stop.
 */
export default function LineChart({ sets, format = compact, xLabels = [], refLines = [] }) {
  const values = sets.flatMap((s) => s.points.map((p) => p.y)).filter(Number.isFinite);
  if (!values.length) return null;

  const W = 720, H = 280, padL = 56, padR = 14, padB = 44, padT = 16;
  const valueMin = Math.min(...values);
  const valueMax = Math.max(...values);
  const range = valueMax - valueMin || Math.abs(valueMax) * 0.1 || 1;
  const top = valueMax + range * 0.08;
  const bottom = valueMin - range * 0.08;
  const n = Math.max(...sets.map((s) => s.points.length));
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const X = (i) => padL + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const Y = (v) => padT + plotH - ((v - bottom) / (top - bottom || 1)) * plotH;

  const labels = xLabels.length ? xLabels : sets[0].points.map((p, i) => p.x ?? i);
  const labelStep = Math.ceil(labels.length / 9);

  return (
    <>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Actual versus predicted sales">
        {[0, 1, 2, 3, 4].map((i) => {
          const y = padT + plotH - (plotH * i) / 4;
          return (
            <g key={i}>
              <line className="gridline" x1={padL} y1={y} x2={W - padR} y2={y} />
              <text className="axis-label" x={padL - 8} y={y + 4} textAnchor="end">
                {format(bottom + ((top - bottom) * i) / 4)}
              </text>
            </g>
          );
        })}

        {refLines.map((r, i) => (
          <g key={`ref-${i}`}>
            <line
              className="refline"
              x1={padL} y1={Y(r.value)} x2={W - padR} y2={Y(r.value)}
              stroke={r.color || "var(--ink-3)"}
              strokeWidth="1.4"
              strokeDasharray="4 4"
            />
          </g>
        ))}

        {labels.map((lb, i) =>
          i % labelStep ? null : (
            <text
              key={i}
              className="axis-label"
              x={X(i)}
              y={padT + plotH + 18}
              textAnchor={labels.length === 1 ? "middle" : i === 0 ? "start" : i === labels.length - 1 ? "end" : "middle"}
            >
              {truncate(String(lb), 8)}
            </text>
          )
        )}

        {sets.map((s) => {
          let pen = "M";
          let d = "";
          s.points.forEach((p, i) => {
            if (!Number.isFinite(p.y)) { pen = "M"; return; }
            d += `${pen}${X(i).toFixed(1)} ${Y(p.y).toFixed(1)} `;
            pen = "L";
          });
          return (
            <g key={s.label}>
              <path
                d={d}
                fill="none"
                stroke={s.color}
                strokeWidth="2.2"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray={s.dashed ? "6 5" : undefined}
              />
              {s.points.map((p, i) =>
                Number.isFinite(p.y) ? (
                  <circle key={i} cx={X(i)} cy={Y(p.y)} r="3" fill={s.color}>
                    <title>{`${p.x ?? i}: ${format(p.y)}`}</title>
                  </circle>
                ) : null
              )}
            </g>
          );
        })}

        {refLines.map((r, i) => {
          const labelY = padT + 2 + i * 16;
          return (
            <text
              key={`ref-label-${i}`}
              className="axis-label"
              x={W - padR}
              y={labelY}
              textAnchor="end"
              paintOrder="stroke"
              stroke="var(--surface)"
              strokeWidth="4"
              strokeLinejoin="round"
            >
              {r.label ? `${r.label}: ${format(r.value)}` : format(r.value)}
            </text>
          );
        })}
      </svg>

      <div className="legend">
        {sets.map((s) => (
          <span key={s.label}>
            <i style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </>
  );
}
