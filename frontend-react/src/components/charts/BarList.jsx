import { money } from "../../lib/format.js";

const BAR_COLORS = [
  "var(--bar-series-1)",
  "var(--bar-series-2)",
  "var(--bar-series-3)",
  "var(--bar-series-4)",
  "var(--bar-series-5)",
  "var(--bar-series-6)",
  "var(--bar-series-7)",
  "var(--bar-series-8)",
];

/** Horizontal bars as a table — scales cleanly at any width and stays readable on mobile. */
export default function BarList({ series, format = money, color }) {
  if (!series.length) return null;
  const top = Math.max(...series.map((d) => d.value), 1);
  return (
    <table>
      <tbody>
        {series.map((d, index) => (
          <tr key={d.name}>
            <td style={{ width: "38%" }}>{d.name}</td>
            <td className="bar-cell" style={{ width: "38%" }}>
              <span
                className="fill"
                style={{
                  width: `${Math.max((d.value / top) * 100, 1)}%`,
                  background: d.color || BAR_COLORS[index % BAR_COLORS.length] || color || "var(--secondary)",
                }}
              />
            </td>
            <td className="num" style={{ width: "24%" }}>{format(d.value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
