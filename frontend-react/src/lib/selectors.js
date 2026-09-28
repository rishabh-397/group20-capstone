/** Everything that turns a raw API payload into something a chart can draw. */
import { asSeries, asPoints, colorize, findBlock, pick, num, unwrap } from "./normalize.js";

export function categorySeries(payload) {
  const blk = findBlock(unwrap(payload), ["sales_by_category", "by_category", "category_sales", "categories", "category"]);
  return colorize(asSeries(blk,
    ["category", "name", "label", "item_type", "category_name"],
    ["sales", "total_sales", "value", "amount", "revenue", "total"]));
}

export function regionSeries(payload) {
  const blk = findBlock(unwrap(payload), ["sales_by_region", "by_region", "region_sales", "regions", "region"]);
  return colorize(asSeries(blk,
    ["region", "name", "label", "region_name", "outlet_location_type"],
    ["sales", "total_sales", "value", "amount", "revenue", "total"]), 1);
}

export function outletSeries(payload) {
  const blk = findBlock(unwrap(payload), ["sales_by_outlet", "by_outlet", "outlet_sales", "outlets", "outlet", "by_store", "stores"]);
  return colorize(asSeries(blk,
    ["outlet", "name", "label", "outlet_id", "store", "outlet_type"],
    ["sales", "total_sales", "value", "amount", "revenue", "total"]), 2);
}

export function trendPoints(payload) {
  const blk = findBlock(unwrap(payload), ["monthly_trend", "monthly_sales", "sales_trend", "by_month", "trend", "monthly"]);
  return asPoints(blk, ["month", "period", "date", "label", "x", "year_month"],
                       ["sales", "total_sales", "value", "amount", "y"]);
}

function prettySegment(name, extra) {
  const label = pick(extra || {}, ["segment_name", "cluster_name", "label", "description", "name"], null);
  if (label && Number.isNaN(Number(label))) return String(label);
  if (name && Number.isNaN(Number(name))) return String(name);
  return "Segment " + name;
}

export function segmentSeries(payload) {
  const root = unwrap(payload);
  const blk = findBlock(root, ["segments", "clusters", "results", "segmentation"]) || root;
  const s = asSeries(blk,
    ["segment_name", "segment", "cluster_name", "name", "label", "cluster", "cluster_id", "segment_id"],
    ["count", "size", "transactions", "num_transactions", "n", "transaction_count", "total"]);
  return colorize(s.map((d) => ({ ...d, name: prettySegment(d.name, d.extra) })));
}

export function segmentDetail(extra) {
  const e = extra || {};
  return {
    avgSales: num(pick(e, ["avg_sales", "average_sales", "mean_sales", "avg_value", "avg_transaction_value", "avg_amount"])),
    avgDiscount: num(pick(e, ["avg_discount", "average_discount", "mean_discount", "discount"])),
    avgQuantity: num(pick(e, ["avg_quantity", "average_quantity", "mean_quantity", "quantity"])),
  };
}

export function kpiFields(payload) {
  const k = unwrap(payload);
  const totalSales = num(pick(k, ["total_sales", "totalSales", "total_sales_amount", "sales_total", "revenue", "total_revenue"]));
  const totalProfit = num(pick(k, ["total_profit", "totalProfit", "profit", "net_profit"]));
  return {
    totalSales,
    totalProfit,
    totalTransactions: num(pick(k, ["total_transactions", "totalTransactions", "transaction_count", "transactions", "total_orders", "orders"])),
    aov: num(pick(k, ["average_order_value", "aov", "avg_order_value", "averageOrderValue", "avg_transaction_value"])),
    topCategory: pick(k, ["top_category", "topCategory", "best_category", "top_selling_category"]),
    topRegion: pick(k, ["top_region", "topRegion", "best_region", "top_selling_region"]),
    margin: Number.isFinite(totalProfit) && totalSales ? totalProfit / totalSales : NaN,
  };
}

export function forecastSeries(payload) {
  const f = unwrap(payload);
  const historyBlock = findBlock(f, ["history", "historical", "actual", "actuals", "past", "historical_sales"]);
  const history = asPoints(
    historyBlock,
    ["period", "month", "date", "ds", "label", "x"],
    ["sales", "value", "actual", "y", "amount"]);
  const fit = asPoints(
    historyBlock,
    ["period", "month", "date", "ds", "label", "x"],
    ["predicted", "yhat", "prediction", "fitted"]);
  const forecast = asPoints(
    findBlock(f, ["forecast", "predicted", "prediction", "predictions", "future", "forecasted_sales"]),
    ["period", "month", "date", "ds", "label", "x"],
    ["sales", "value", "predicted", "yhat", "y", "amount"]);
  return { history, fit, forecast };
}

/** discount_tier / avg_margin_pct / avg_order_value / orders, in whatever order the API sends the rows. */
export function discountMarginSeries(payload) {
  const root = unwrap(payload);
  const blk = findBlock(root, ["rows", "discount_margin", "data"]) || root;
  const rows = asSeries(blk,
    ["discount_tier", "tier", "band", "discount_band", "label"],
    ["avg_margin_pct", "margin_pct", "avg_margin", "margin"]);
  // Keep the tier order the API returned rather than re-sorting by value —
  // the story here is the trend across tiers, not a leaderboard.
  return rows.map((d) => ({
    ...d,
    avgOrderValue: num(pick(d.extra || {}, ["avg_order_value", "aov", "average_order_value"])),
    orders: num(pick(d.extra || {}, ["orders", "order_count", "count", "n"])),
  }));
}

export function applyControls(series, { sort = "value", top = "all" } = {}) {
  const s = [...series];
  if (sort === "name") s.sort((a, b) => a.name.localeCompare(b.name));
  else s.sort((a, b) => b.value - a.value);
  return top === "all" ? s : s.slice(0, parseInt(top, 10));
}
