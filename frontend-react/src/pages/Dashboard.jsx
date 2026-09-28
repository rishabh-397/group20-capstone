import { useEndpoint } from "../api/DataProvider.jsx";
import { Async, Empty } from "../components/States.jsx";
import KpiBand from "../components/KpiBand.jsx";
import Panel from "../components/Panel.jsx";
import ColumnChart from "../components/charts/ColumnChart.jsx";
import Donut from "../components/charts/Donut.jsx";
import { categorySeries, kpiFields, segmentSeries } from "../lib/selectors.js";
import { count, money, moneyExact, pct } from "../lib/format.js";

export default function Dashboard() {
  const kpis = useEndpoint("kpis");
  const sales = useEndpoint("salesOverview");
  const seg = useEndpoint("segmentation");

  return (
    <>
      <div className="dashboard-intro">
        <h2>Business Sales Forecasting, Transaction Segmentation &amp; Business Insights Using Data Science</h2>
        <p>
          Integrated platform for sales analysis, transaction segmentation, and forecasting.
          <br />
          Includes discount–margin analysis, statistical validation, interactive insights, and business recommendations.
        </p>
      </div>
      <Async endpoint={kpis} what="the KPIs">
        {(data) => {
          const k = kpiFields(data);
          return (
            <KpiBand
              items={[
                {
                  label: "Total sales",
                  value: money(k.totalSales),
                  meta: Number.isFinite(k.totalSales) ? moneyExact(k.totalSales) : "field not found in response",
                },
                { label: "Transactions", value: count(k.totalTransactions), meta: "records in the dataset" },
                {
                  label: "Total profit",
                  value: money(k.totalProfit),
                  meta: Number.isFinite(k.margin) ? `${pct(k.margin)} margin` : "",
                },
                { label: "Average order value", value: money(k.aov), meta: "sales ÷ transactions" },
                {
                  label: "Leading category",
                  value: k.topCategory ?? "—",
                  text: true,
                  meta: `Leading region: ${k.topRegion ?? "—"}`,
                },
              ]}
            />
          );
        }}
      </Async>

      <div className="grid two">
        <Panel title="Sales by category" hint={sales.status === "demo" ? "top 8 · sample" : "top 8"} flush>
          <Async endpoint={sales} what="the sales overview">
            {(data) => {
              const cat = categorySeries(data);
              if (!cat.length) return <Empty>Category breakdown not present in the sales response.</Empty>;
              return <ColumnChart series={cat.slice(0, 8)} height={360} />;
            }}
          </Async>
        </Panel>

        <Panel title="Transaction segments" hint={seg.status === "demo" ? "sample" : "from clustering"} flush>
          <Async endpoint={seg} what="segmentation">
            {(data) => {
              const segs = segmentSeries(data);
              if (!segs.length) return <Empty>No segments returned.</Empty>;
              return (
                <div className="donut-wrap">
                  <Donut series={segs} size={220} />
                  <div style={{ flex: 1, minWidth: 200 }}>
                    {segs.map((s) => (
                      <div key={s.name} className="seg-row">
                        <span className="swatch" style={{ background: s.color }} />
                        <span style={{ flex: 1 }}>{s.name}</span>
                        <b>{count(s.value)}</b>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }}
          </Async>
        </Panel>
      </div>
    </>
  );
}
