Capstone Backend (FastAPI + PostgreSQL)

Backend for the Group 20 capstone: Business Sales Forecasting and Customer Segmentation Using Data Science. It serves the data behind the React dashboard through a REST API.

cleaned_data2.csv -> PostgreSQL (star schema) -> FastAPI endpoints -> React frontend
Project structure
backend/
  app/
    main.py              FastAPI app, CORS, error handler, router registration, /forecast/ alias
    core/
      config.py          Settings read from .env (handles special characters in the DB password)
      database.py        SQLAlchemy engine
    routers/             One file per endpoint group (kpis, sales, segmentation, forecasting, discount_margin)
    schemas/             Pydantic response models (one per router)
    mock_data/           JSON files (see "Where each endpoint gets its data")
  db/
    schema.sql           Table definitions (dim_customers, dim_products, dim_store, fact_sales, customer_loyalty)
    load_data.py         Loads data/cleaned_data2.csv into the tables
  data/
    cleaned_data2.csv    Cleaned dataset, 100,000 rows
  requirements.txt
  .env.example
Setup (Windows PowerShell)
Install Python 3.10+ and PostgreSQL.
Create and activate a virtual environment, then install packages:
powershell
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
Copy .env.example to .env and fill in your own PostgreSQL details. Set USE_MOCK_DATA=false. Never share or commit your real .env.
Create the database and tables (replace the port with yours, the default is 5432):
powershell
   psql -U postgres -p 5432 -c "CREATE DATABASE capstone_db;"
   psql -U postgres -p 5432 -d capstone_db -f db/schema.sql
Load the data. Expected output: 100000 / 100000 / 360 / 100000 rows.
powershell
   python db/load_data.py
Start the server:
powershell
   uvicorn app.main:app --reload

Health check: http://127.0.0.1:8000/ · Interactive docs: http://127.0.0.1:8000/docs

To reload the data later, empty the tables first or the load will fail on duplicate keys:

sql
TRUNCATE TABLE fact_sales, dim_customers, dim_products, dim_store RESTART IDENTITY CASCADE;
Endpoints
Endpoint	Used by page	Data source
GET /api/v1/kpis/	Dashboard	PostgreSQL
GET /api/v1/sales/overview	Sales Analysis	PostgreSQL
GET /api/v1/sales/discount-margin	Sales Analysis, Insights	PostgreSQL
GET /api/v1/segmentation/	Segmentation	JSON file
GET /api/v1/forecasting/	(full detail)	JSON file
GET /api/v1/forecast/	Forecasting	JSON file (same content plus history/forecast keys)

Exact response shapes are in API_Contract_Group20.md. A Postman collection is included for testing.

Where each endpoint gets its data
KPIs, sales overview and discount-margin run SQL against PostgreSQL when USE_MOCK_DATA=false. With USE_MOCK_DATA=true they read the matching file in app/mock_data/ instead.
Segmentation and forecasting always read their JSON file. These are results from the ML analysis (K-Means clusters, model metrics, actual vs predicted, and a 3-month forward forecast). The API serves them; it does not retrain anything. If the analysis is re-run, update those JSON files.
Data notes
Sales Date was reconstructed as Order Date plus a random 3-7 day offset during cleaning, because the original field had no reliable relationship to Order Date. Treat it as a synthetic field.
order_year is derived from order_date by load_data.py. The source Year column disagreed with the order date's year in about 80% of rows.
Every customer appears exactly once, so repeat-purchase or loyalty metrics cannot be computed. Segmentation is based on transaction attributes (spend, discount, margin).
Category, region and outlet totals are close to flat across the dataset (ANOVA found no significant effect). The strongest real signal is profit margin falling as discount depth increases.
The customer_loyalty table exists in the schema but is not loaded and no endpoint uses it.
The monthly trend excludes January 2024, a partial month created by the date offset.
Editing safely
If you rename or remove a field in an API response, the frontend must be updated too, because it reads those field names.
CORS currently allows all origins for development. Restrict allow_origins in app/main.py before any real deployment.