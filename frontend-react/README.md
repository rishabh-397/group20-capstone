# Group 20 — Sales Dashboard (React)

Frontend for the DSN4091 capstone: KPIs, sales analysis, segmentation, forecasting
and insights, wired to the FastAPI backend.

React 18 + Vite + React Router. Charts are hand-written SVG components, so there's
no charting library to install or fight with.

## Run

```bash
npm install
npm run dev          # http://localhost:5173
```

Start the backend first. If the status pill in the top bar reads **Live data**, you're connected.

```bash
npm run build        # production build into dist/
npm run preview      # serve the build
```

## CORS

The dev server runs on port 5173, so FastAPI needs to allow it. In `main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

If the pill says "Sample data · API unreachable" while the server is running, this is
almost always why. The Data & API page in the app shows per-endpoint status.

## Configuration

`src/lib/config.js` holds everything tunable, and each value can be overridden with a
`.env` file (copy `.env.example`):

| Setting | Default | Notes |
|---|---|---|
| `VITE_API_BASE` | `http://127.0.0.1:8000/api/v1` | |
| `VITE_EP_FORECAST` | `/forecast/` | assumed path — confirm with Rishabh |
| `VITE_DEMO_FALLBACK` | `true` | `false` shows hard errors instead of sample data |
| `currency` | `₹` | set to `""` if sales figures are unitless |
| `locale` | `en-IN` | Lakh/Crore formatting; `en-US` gives K/M/B |

## Layout

```
src/
  api/
    client.js         fetch with timeout + readable error messages
    DataProvider.jsx  loads all endpoints once, shares status via context
    demoData.js       sample payloads — delete once everything is live
  lib/
    config.js         API base, endpoint paths, palette
    format.js         currency / compact / percent formatting
    normalize.js      tolerant field reading (see below)
    selectors.js      raw payload -> chart-ready series
  components/
    charts/           ColumnChart, BarList, Donut, LineChart
    Sidebar, TopBar, Panel, KpiBand, States, DemoBanner
  pages/              Dashboard, SalesAnalysis, Segmentation,
                      Forecasting, Insights, DataStatus
```

`useEndpoint("kpis")` gives any component `{ status, data, error, reload }`, and the
`<Async>` component turns that into loading / error / content without repeating the
branching on every page.

## Field names

The exact response fields aren't locked yet, so every read goes through `pick()`, which
tries the likely spellings (`total_sales` / `totalSales` / `sales_total`) and accepts a
breakdown as either an array of objects or an object map. A mismatch shows a
"not present in the response" note rather than crashing the page.

| Page | Endpoint | Fields read |
|---|---|---|
| Dashboard | `/kpis/` | `total_sales`, `total_transactions`, `total_profit`, `average_order_value`, `top_category`, `top_region` |
| Sales | `/sales/overview` | `sales_by_category`, `sales_by_region`, `sales_by_outlet`, `monthly_trend` |
| Segmentation | `/segmentation/` | `segments[]` with `segment_name`, `count`, `avg_sales`, `avg_discount` |
| Forecasting | `/forecast/` | `history[]`, `forecast[]` of `{ period, sales }` |
| Discount margin | `/sales/discount-margin` | `discount_tier`, `avg_margin_pct`, `avg_order_value`, `orders` (strongest real signal in the dataset) |

## Waiting on

- `monthly_trend` on `/sales/overview` — chart built, shows a pending note until it arrives (Eklavya)
- Real forecast values — page built, shows a pending note until the model is re-run (Kalpaang)
- An `/insights/` endpoint — that page currently derives findings client-side from the sales
  and segmentation responses, with static recommendation copy

## Known limitation

Sort and top-N filters run client-side on the returned aggregates. Real cross-filtering
(category × region × outlet) needs query-param support on `/sales/overview`, since the
current response is pre-aggregated and can't be sliced in the browser.
