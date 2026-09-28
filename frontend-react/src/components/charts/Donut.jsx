import { pct } from "../../lib/format.js";
import { PALETTE } from "../../lib/config.js";

export default function Donut({ series, size = 190, showPercent = true }) {
  const total = series.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2;
  const ir = r * 0.62;
  let angle = -Math.PI / 2;

  const arcs = series.map((d, i) => {
    const frac = d.value / total;
    const next = angle + frac * Math.PI * 2;
    const large = frac > 0.5 ? 1 : 0;
    const p = (a, rad) => [r + rad * Math.cos(a), r + rad * Math.sin(a)];
    const [x0, y0] = p(angle, r);
    const [x1, y1] = p(next, r);
    const [x2, y2] = p(next, ir);
    const [x3, y3] = p(angle, ir);
    angle = next;
    return (
      <path
        key={d.name}
        d={`M${x0} ${y0} A${r} ${r} 0 ${large} 1 ${x1} ${y1} L${x2} ${y2} A${ir} ${ir} 0 ${large} 0 ${x3} ${y3} Z`}
        fill={d.color || PALETTE[i % PALETTE.length]}
        opacity="0.92"
      >
        <title>{showPercent ? `${d.name}: ${pct(frac)}` : d.name}</title>
      </path>
    );
  });

  return (
    <svg
      className="chart"
      style={{ width: size, flex: `0 0 ${size}px` }}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Share by segment"
    >
      {arcs}
    </svg>
  );
}
