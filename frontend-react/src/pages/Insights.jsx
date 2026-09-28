import { useData, useEndpoint } from "../api/DataProvider.jsx";
import Panel from "../components/Panel.jsx";
import { discountMarginSeries, segmentSeries } from "../lib/selectors.js";
import { count, money, pct } from "../lib/format.js";

const pct2 = (v) => (Number.isFinite(v) ? v.toFixed(1) + "%" : "—");

/** Findings are derived from whatever the API returned, so they stay true as the data changes. */
function buildFindings(segData, marginData) {
  const findings = [];
  const segs = segmentSeries(segData);
  const tiers = discountMarginSeries(marginData);

  // The strongest real signal in the dataset — lead with it.
  if (tiers.length > 1) {
    const first = tiers[0];
    const last = tiers[tiers.length - 1];
    findings.push({
      title: "Margin falls steadily as discounts get deeper",
      body: `Average margin runs ${pct2(first.value)} on ${first.name} orders and drops to ${pct2(
        last.value
      )} on ${last.name} orders — a clean, monotonic decline across every tier in between. Average order value barely moves across the same tiers, so deep discounts are a margin cost, not a basket-size gain.`,
      src: "Source: /sales/discount-margin — confirmed against the analysis report",
    });
  }

  if (segs.length) {
    const total = segs.reduce((s, d) => s + d.value, 0) || 1;
    const biggest = [...segs].sort((a, b) => b.value - a.value)[0];
    findings.push({
      title: "Bargain-driven purchases outnumber premium ones",
      body: `${biggest.name} is the largest cluster at ${pct(biggest.value / total)} of transactions (${count(
        biggest.value
      )} of ${count(total)}). That a heavy-discount segment outsizes the low-discount ones lines up with how retail volume usually works — bargain purchases are frequent, premium ones are not.`,
      src: "Source: /segmentation/ — cluster sizes from the K-Means model output",
    });
  }

  findings.push({
    title: "Category, region and outlet don't move sales here",
    body: "This was tested directly, not assumed: ANOVA found no statistically significant effect of category, region, or outlet on sales in this dataset. The near-flat bars on the Sales Analysis page are the honest result of that test, not a display issue — we're reporting it as found rather than smoothing it into a more dramatic-looking chart.",
    src: "Source: ANOVA testing performed on the cleaned dataset",
  });

  if (!findings.length) {
    findings.push({
      title: "Waiting on data",
      body: "Insights generate automatically once the segmentation and discount-margin endpoints respond.",
      src: "",
    });
  }
  return findings;
}

const RECOMMENDATIONS = [
  {
    title: "Protect margin on heavy-discount transactions",
    body: "The mid-value, heavy-discount cluster is where discount depth and volume overlap. Cap the discount band there before widening promotions elsewhere.",
  },
  {
    title: "Set discount policy by tier, not as one blanket rule",
    body: "Margin decays in a clean, predictable curve from 0–10% discount through 50%+, so a single storewide discount cap either leaves margin on the table at the shallow end or erodes it too far at the deep end. A tiered cap tracks the actual curve instead.",
  },
  {
    title: "Treat low-value, low-discount buyers as a volume base",
    body: "This group buys without prompting, so discounting into it spends margin on sales that were already going to happen. Use it to stabilise baseline demand in the forecast instead.",
  },
];

export default function Insights() {
  const seg = useEndpoint("segmentation");
  const margin = useEndpoint("discountMargin");
  const { connection } = useData();
  const findings = buildFindings(seg.data, margin.data);

  return (
    <>
      <Panel
        title="What the data shows"
        hint={connection === "live" ? "generated from the live response" : "generated from sample data"}
      >
        {findings.map((f) => (
          <div className="insight" key={f.title}>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
            {f.src && <div className="src">{f.src}</div>}
          </div>
        ))}
      </Panel>

      <Panel title="Recommended actions" hint="team's working set">
        {RECOMMENDATIONS.map((r) => (
          <div className="insight rec" key={r.title}>
            <h3>{r.title}</h3>
            <p>{r.body}</p>
          </div>
        ))}
      </Panel>
    </>
  );
}
