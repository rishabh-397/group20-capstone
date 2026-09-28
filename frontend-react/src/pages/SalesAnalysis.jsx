import { useState } from "react";
import { useEndpoint } from "../api/DataProvider.jsx";
import { Async, Empty, Pending } from "../components/States.jsx";
import Panel from "../components/Panel.jsx";
import CategoryBarChart from "../components/charts/CategoryBarChart.jsx";
import ColumnChart from "../components/charts/ColumnChart.jsx";
import BarList from "../components/charts/BarList.jsx";
import LineChart from "../components/charts/LineChart.jsx";
import {
  applyControls,
  categorySeries,
  discountMarginSeries,
  outletSeries,
  regionSeries,
  trendPoints,
} from "../lib/selectors.js";
import { count, money, moneyExact, pct } from "../lib/format.js";

function DimensionBreakdownTable({ label, series }) {
  const total = series.reduce((s, d) => s + d.value, 0) || 1;
  if (!series.length) return <Empty>No {label.toLowerCase()} breakdown in the response.</Empty>;
  return (
    <table>
      <thead>
        <tr>
          <th>{label}</th>
          <th className="num">Sales</th>
          <th className="num">Share</th>
        </tr>
      </thead>
      <tbody>
        {series.map((d) => (
          <tr key={d.name}>
            <td>{d.name}</td>
            <td className="num">{moneyExact(d.value)}</td>
            <td className="num">{pct(d.value / total)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DiscountMarginChart({ rows }) {
  if (!rows.length) return <Empty>No discount-margin breakdown in the response.</Empty>;
  return (
    <>
      <ColumnChart series={rows} format={pct2} color="var(--secondary)" />
      <table style={{ marginTop: 18 }}>
        <thead>
          <tr>
            <th>Discount tier</th>
            <th className="num">Avg margin</th>
            <th className="num">Avg order value</th>
            <th className="num">Orders</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td>{r.name}</td>
              <td className="num">{pct2(r.value)}</td>
              <td className="num">{money(r.avgOrderValue)}</td>
              <td className="num">{count(r.orders)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
// avg_margin_pct arrives as a plain number like 19.07, not a 0–1 fraction — format directly.
const pct2 = (v) => (Number.isFinite(v) ? v.toFixed(1) + "%" : "—");

export default function SalesAnalysis() {
  const sales = useEndpoint("salesOverview");
  const margin = useEndpoint("discountMargin");
  const [sort, setSort] = useState("value");
  const [top, setTop] = useState("all");
  const [chunk, setChunk] = useState(0);
  const CHUNK_SIZE = 6;

  const controls = (
    <>
      <label>
        Sort
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="value">Highest sales</option>
          <option value="name">Name</option>
        </select>
      </label>
      <label>
        Show
        <select value={top} onChange={(e) => setTop(e.target.value)}>
          <option value="all">All</option>
          <option value="5">Top 5</option>
          <option value="10">Top 10</option>
        </select>
      </label>
    </>
  );

  return (
    <Async endpoint={sales} what="the sales overview">
      {(data) => {
        const opts = { sort, top };
        const cat = applyControls(categorySeries(data), opts);
        const reg = applyControls(regionSeries(data), opts);
        const out = applyControls(outletSeries(data), opts);
        const trend = trendPoints(data);

        const totalChunks = Math.max(1, Math.ceil(trend.length / CHUNK_SIZE));
        const safeChunk = Math.min(chunk, totalChunks - 1);
        const chunkStart = safeChunk * CHUNK_SIZE;
        const trendChunk = trend.slice(chunkStart, chunkStart + CHUNK_SIZE);
        const chunkLabel =
          trendChunk.length ? `${trendChunk[0].x} \u2013 ${trendChunk[trendChunk.length - 1].x}` : "";
        const chunkVals = trendChunk.filter((p) => Number.isFinite(p.y));
        const chunkAvg = chunkVals.length ? chunkVals.reduce((s, p) => s + p.y, 0) / chunkVals.length : null;

        return (
          <>
            <div className="grid two">
              <Panel title="Sales by region" flush>
                {reg.length ? <BarList series={reg} /> : <Empty>No region breakdown in the response.</Empty>}
              </Panel>
              <Panel title="Sales by outlet" flush>
                {out.length ? <BarList series={out} /> : <Empty>No outlet breakdown in the response.</Empty>}
              </Panel>
            </div>

            <Panel title="Sales by category" controls={controls}>
              {cat.length ? <CategoryBarChart series={cat} /> : <Empty>No category breakdown in the response.</Empty>}
              <p className="footnote" style={{ marginTop: 14 }}>
                Category, region, and outlet sales show relatively similar patterns across the dataset. Statistical
                analysis found no statistically significant effect from these three factors on sales. The
                discount–margin analysis below highlights the key variation observed in the dataset.
              </p>
            </Panel>

            <Panel
              title="Margin by discount tier"
              hint={margin.status === "demo" ? "sample" : "strongest signal in the dataset"}
            >
              <Async endpoint={margin} what="the discount-margin breakdown">
                {(data) => <DiscountMarginChart rows={discountMarginSeries(data)} />}
              </Async>
              <p className="footnote" style={{ marginTop: 14 }}>
                Average margin drops steadily as discount depth increases — from roughly 19% at 0–10% discount down
                to about 10% at 50%+. Average order value stays flat across tiers, so this is a margin story, not a
                basket-size story.
              </p>
            </Panel>

            <Panel
              title="Monthly sales trend"
              hint={trend.length ? `${chunkLabel} · ${safeChunk + 1} of ${totalChunks}` : undefined}
              controls={
                trend.length > CHUNK_SIZE ? (
                  <>
                    <button
                      type="button"
                      className="btn"
                      disabled={safeChunk === 0}
                      onClick={() => setChunk(Math.max(0, safeChunk - 1))}
                    >
                      ← Prev 6 mo
                    </button>
                    <button
                      type="button"
                      className="btn"
                      disabled={safeChunk >= totalChunks - 1}
                      onClick={() => setChunk(Math.min(totalChunks - 1, safeChunk + 1))}
                    >
                      Next 6 mo →
                    </button>
                  </>
                ) : undefined
              }
            >
              {trend.length ? (
                <LineChart
                  sets={[{ label: "Sales", color: "var(--secondary)", points: trendChunk }]}
                  xLabels={trendChunk.map((p) => p.x)}
                  refLines={chunkAvg != null ? [{ value: chunkAvg, label: "Avg", color: "var(--ink-3)" }] : []}
                />
              ) : (
                <Pending
                  title="Waiting on the date-field fix"
                  who="Status: date-field fix · expected within 3–5 days · no frontend change needed"
                >
                  <p>
                    The sales endpoint doesn't return a monthly series yet — it's a known data issue in the date column.
                    The chart renders automatically once the response includes a <code>monthly_trend</code> array of{" "}
                    <code>{"{ month, sales }"}</code> objects.
                  </p>
                </Pending>
              )}
            </Panel>

            <Panel title="Full breakdown" hint="reflects the filters above">
              <div className="grid three" style={{ marginBottom: 0 }}>
                <Panel title="Category" flush>
                  <DimensionBreakdownTable label="Category" series={cat} />
                </Panel>
                <Panel title="Region" flush>
                  <DimensionBreakdownTable label="Region" series={reg} />
                </Panel>
                <Panel title="Outlet" flush>
                  <DimensionBreakdownTable label="Outlet" series={out} />
                </Panel>
              </div>
            </Panel>
          </>
        );
      }}
    </Async>
  );
}