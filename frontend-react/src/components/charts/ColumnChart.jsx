import { money } from "../../lib/format.js";

function wrapLabel(label, maxChars) {
  const lines = [];
  let line = "";

  for (const word of String(label).trim().split(/\s+/).filter(Boolean)) {
    if (word.length > maxChars) {
      if (line) lines.push(line);
      line = "";
      for (let offset = 0; offset < word.length; offset += maxChars) {
        const part = word.slice(offset, offset + maxChars);
        if (offset + maxChars < word.length) lines.push(part);
        else line = part;
      }
    } else if (line && line.length + 1 + word.length > maxChars) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }

  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

/** Vertical bars. Drawn as SVG so there's no chart dependency to install. */
export default function ColumnChart({ series, format = money, color = "var(--secondary)", height = 260 }) {
  if (!series.length) return null;
  const W = 720, H = height, padL = 52, padR = 12, padT = 16;
  const top = Math.max(...series.map((d) => d.value), 1);
  const plotW = W - padL - padR;
  const step = plotW / series.length;
  const labels = series.map((d) => wrapLabel(d.name, Math.max(4, Math.floor((step - 4) / 6))));
  const maxLabelLines = Math.max(...labels.map((lines) => lines.length));
  const padB = 22 + maxLabelLines * 14;
  const plotH = H - padT - padB;
  const bw = Math.min(step * 0.62, 70);

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Sales by category">
      {[0, 1, 2, 3, 4].map((i) => {
        const y = padT + plotH - (plotH * i) / 4;
        return (
          <g key={i}>
            <line className="gridline" x1={padL} y1={y} x2={W - padR} y2={y} />
            <text className="axis-label" x={padL - 8} y={y + 4} textAnchor="end">
              {format((top * i) / 4)}
            </text>
          </g>
        );
      })}
      {series.map((d, i) => {
        const bh = Math.max((d.value / top) * plotH, 1);
        const x = padL + i * step + (step - bw) / 2;
        const y = padT + plotH - bh;
        return (
          <g key={d.name}>
            <rect x={x} y={y} width={bw} height={bh} rx="3" fill={d.color || color} opacity="0.9">
              <title>{`${d.name}: ${format(d.value)}`}</title>
            </rect>
            <text className="value-label" x={x + bw / 2} y={y - 5} textAnchor="middle">
              {format(d.value)}
            </text>
            <text className="axis-label" x={x + bw / 2} y={padT + plotH + 16} textAnchor="middle">
              {labels[i].map((line, lineIndex) => (
                <tspan key={lineIndex} x={x + bw / 2} dy={lineIndex === 0 ? 0 : 14}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
