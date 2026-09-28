/**
 * Sample payloads, shape-matched to what the API is expected to return.
 * Used only when the backend is unreachable, so the UI is demo-able offline.
 * Delete this file (and its import in DataProvider) once everything is live.
 */
export const DEMO = {
  kpis: {
    total_sales: 12845600.5,
    total_transactions: 8523,
    total_profit: 2184752.1,
    average_order_value: 1507.2,
    top_category: "Fruits and Vegetables",
    top_region: "Tier 3",
  },
  salesOverview: {
    sales_by_category: [
      { category: "Fruits and Vegetables", sales: 2340120 },
      { category: "Snack Foods", sales: 2210430 },
      { category: "Household", sales: 1750980 },
      { category: "Frozen Foods", sales: 1420560 },
      { category: "Dairy", sales: 1310870 },
      { category: "Canned", sales: 1120340 },
      { category: "Baking Goods", sales: 980210 },
      { category: "Health and Hygiene", sales: 740150 },
      { category: "Soft Drinks", sales: 690430 },
      { category: "Meat", sales: 560980 },
    ],
    sales_by_region: [
      { region: "Tier 3", sales: 5620340 },
      { region: "Tier 2", sales: 4180920 },
      { region: "Tier 1", sales: 3044340 },
    ],
    sales_by_outlet: [
      { outlet: "OUT027", sales: 3320450 },
      { outlet: "OUT035", sales: 2210980 },
      { outlet: "OUT049", sales: 2105670 },
      { outlet: "OUT013", sales: 1980340 },
      { outlet: "OUT046", sales: 1640220 },
      { outlet: "OUT018", sales: 1587940 },
    ],
  },
  segmentation: {
    segments: [
      { cluster: 0, segment_name: "High-Value / Low-Discount", count: 30178, avg_sales: 38169.6, avg_discount: 0.17 },
      { cluster: 1, segment_name: "Low-Value / Low-Discount", count: 29892, avg_sales: 11756.3, avg_discount: 0.161 },
      { cluster: 2, segment_name: "Mid-Value / Heavy-Discount", count: 39930, avg_sales: 25172.5, avg_discount: 0.38 },
    ],
  },
  forecast: { status: "placeholder" },
  discountMargin: {
    rows: [
      { discount_tier: "0-10%", avg_margin_pct: 19.07, avg_order_value: 24963.79, orders: 18787 },
      { discount_tier: "10-20%", avg_margin_pct: 17.04, avg_order_value: 25235.77, orders: 19908 },
      { discount_tier: "20-30%", avg_margin_pct: 15.08, avg_order_value: 25096.39, orders: 19845 },
      { discount_tier: "30-40%", avg_margin_pct: 13.10, avg_order_value: 25011.14, orders: 20185 },
      { discount_tier: "40-50%", avg_margin_pct: 11.12, avg_order_value: 25117.55, orders: 20280 },
      { discount_tier: "50%+", avg_margin_pct: 10.03, avg_order_value: 24905.43, orders: 995 },
    ],
  },
};
