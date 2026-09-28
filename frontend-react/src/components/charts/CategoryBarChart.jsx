import { money, moneyExact } from "../../lib/format.js";

function getScale(series) {
  const maxValue = series.reduce(
    (max, row) => Number.isFinite(row.value) ? Math.max(max, row.value, 0) : max,
    0
  );

  if (!maxValue) return { maximum: 1, ticks: [0, 0.25, 0.5, 0.75, 1] };

  const roughStep = maxValue / 4;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;
  const stepSize = (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude;
  const maximum = stepSize * Math.ceil(maxValue / stepSize);
  const intervals = Math.round(maximum / stepSize);

  return {
    maximum,
    ticks: Array.from({ length: intervals + 1 }, (_, index) => index * stepSize),
  };
}

export default function CategoryBarChart({ series }) {
  if (!series.length) return null;
  const scale = getScale(series);

  return (
    <div className="category-chart">
      <div className="category-axis">
        <div className="category-scale" aria-label={`Sales scale from zero to ${money(scale.maximum)}`}>
          {scale.ticks.map((tick, index) => (
            <span
              key={index}
              className="category-tick"
              style={{ left: `${(tick / scale.maximum) * 100}%` }}
            >
              {money(tick)}
            </span>
          ))}
        </div>
      </div>
      <ul className="category-bars" aria-label="Sales by category">
        {series.map((row, index) => (
          <li className="category-row" key={row.name}>
            <span className="category-name">{row.name}</span>
            <div className="category-track" aria-hidden="true">
              <span className={`category-gridline tone-${index}`} />
              {scale.ticks.slice(1).map((tick, tickIndex) => (
                <span
                  key={tickIndex}
                  className="category-gridline"
                  style={{ left: `${(tick / scale.maximum) * 100}%` }}
                />
              ))}
              <span
                className={`category-bar tone-${index % 3}`}
                style={{
                  width: `${Math.min(Math.max(row.value, 0) / scale.maximum, 1) * 100}%`,
                }}
              />
            </div>
            <span className="category-value">{moneyExact(row.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}