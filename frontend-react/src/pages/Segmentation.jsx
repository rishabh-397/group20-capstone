import { useEndpoint } from "../api/DataProvider.jsx";
import { Async, Empty } from "../components/States.jsx";
import Panel from "../components/Panel.jsx";
import Donut from "../components/charts/Donut.jsx";
import { segmentDetail, segmentSeries } from "../lib/selectors.js";
import { num, pick } from "../lib/normalize.js";
import { count, decimal, money, pct } from "../lib/format.js";

const SEGMENT_COLORS = ["var(--segment-teal)", "var(--segment-blue)", "var(--segment-green)"];

const KNOWN_SEGMENTS = [
  {
    pattern: /high value.*low discount/,
    label: "High-Value, Low-Discount",
    description: "Higher-value purchases with lower discounts",
    color: SEGMENT_COLORS[0],
  },
  {
    pattern: /low value.*low discount/,
    label: "Low-Value, Low-Discount",
    description: "Lower-value purchases with lower discounts",
    color: SEGMENT_COLORS[1],
  },
  {
    pattern: /mid value.*heavy discount/,
    label: "Mid-Value, Heavy-Discount",
    description: "Mid-value purchases with deeper discounts",
    color: SEGMENT_COLORS[2],
  },
];

function presentSegment(segment, index) {
  const normalizedName = segment.name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const known = KNOWN_SEGMENTS.find(({ pattern }) => pattern.test(normalizedName));
  return {
    ...segment,
    color: known?.color || SEGMENT_COLORS[index % SEGMENT_COLORS.length],
    label: known?.label || segment.name,
    description: known?.description || "",
  };
}

function apiPercentage(segment) {
  const value = num(pick(segment.extra, [
    "percentage",
    "percent",
    "percentage_of_total",
    "percentage_of_transactions",
    "share_percentage",
    "share_pct",
    "transaction_share_pct",
  ], NaN));
  return Number.isFinite(value) ? value : null;
}

function SegmentCard({ segment }) {
  const d = segmentDetail(segment.extra);
  const percentage = apiPercentage(segment);
  const rows = [
    ["Transactions", count(segment.value)],
    percentage !== null ? ["Share of transactions", `${decimal(percentage)}%`] : null,
    Number.isFinite(d.avgSales) ? ["Average sale", money(d.avgSales)] : null,
    Number.isFinite(d.avgDiscount)
      ? ["Average discount", d.avgDiscount <= 1 ? pct(d.avgDiscount) : `${decimal(d.avgDiscount)}%`]
      : null,
    Number.isFinite(d.avgQuantity) ? ["Average quantity", decimal(d.avgQuantity)] : null,
  ].filter(Boolean);

  return (
    <article className="segment-card" style={{ "--segment-color": segment.color }}>
      <header className="segment-card-head">
        <span className="segment-mark" aria-hidden="true" />
        <div>
          <h3>{segment.label}</h3>
          {segment.description && <p>{segment.description}</p>}
        </div>
      </header>
      <dl className="segment-metrics">
        {rows.map(([k, v]) => (
          <div className="segment-metric" key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {percentage !== null && (
        <div className="segment-share" aria-label={`${decimal(percentage)} percent of transactions`}>
          <span style={{ width: `${Math.max(0, Math.min(percentage, 100))}%` }} />
        </div>
      )}
    </article>
  );
}

function SegmentLegend({ segments }) {
  return (
    <div className="segmentation-legend" aria-label="Segment legend">
      {segments.map((segment) => {
        const percentage = apiPercentage(segment);
        return (
          <div className="segment-legend-item" key={segment.name}>
            <span
              className="segment-mark"
              style={{ "--segment-color": segment.color }}
              aria-hidden="true"
            />
            <div className="segment-legend-copy">
              <strong>{segment.label}</strong>
              {segment.description && <span>{segment.description}</span>}
            </div>
            <div className="segment-legend-values">
              <strong>{count(segment.value)}</strong>
              <span>transactions</span>
              {percentage !== null && <span>{decimal(percentage)}%</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Segmentation() {
  const seg = useEndpoint("segmentation");

  return (
    <div className="segmentation-page">
      <Async endpoint={seg} what="segmentation results">
        {(data) => {
          const segs = segmentSeries(data).map(presentSegment);
          if (!segs.length) return <Empty>The segmentation endpoint returned no clusters.</Empty>;
          const total = segs.reduce((s, d) => s + d.value, 0) || 1;

          return (
            <>
              <Panel title="Segment distribution" hint={`${segs.length} clusters · ${count(total)} transactions`}>
                <div className="segmentation-overview">
                  <div className="segmentation-donut">
                    <Donut series={segs} size={210} showPercent={false} />
                  </div>
                  <SegmentLegend segments={segs} />
                </div>
              </Panel>

              <div className="grid three segmentation-card-grid">
                {segs.map((segment) => (
                  <SegmentCard key={segment.name} segment={segment} />
                ))}
              </div>

              <Panel title="How to read these segments">
                <p className="prose">
                  Each segment describes transaction value and discount depth, not a named customer. The labels and
                  counts above come from the segmentation response; average sale, discount and quantity appear only
                  when those fields are present.
                </p>
              </Panel>
            </>
          );
        }}
      </Async>
    </div>
  );
}
