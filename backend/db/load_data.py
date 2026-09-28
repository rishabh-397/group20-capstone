"""
Loads Eklavya's cleaned_data2.csv into the PostgreSQL star schema defined in db/schema.sql.
Usage: python db/load_data.py
Reads DATABASE_URL from .env (see app/core/config.py).
"""
import pandas as pd
from sqlalchemy import create_engine
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.core.config import settings

SOURCE_CSV = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "cleaned_data2.csv")


def main():
    engine = create_engine(settings.DATABASE_URL)
    df = pd.read_csv(SOURCE_CSV, low_memory=False)
    df["Order Date"] = pd.to_datetime(df["Order Date"])
    df["Sales Date"] = pd.to_datetime(df["Sales Date"])

    # --- dim_customers ---
    customers = df[["Customer ID", "Segment"]].drop_duplicates("Customer ID").copy()
    customers["customer_name"] = customers["Customer ID"]
    customers["last_name"] = None
    customers["date_of_birth"] = None
    customers = customers.rename(columns={"Customer ID": "customer_id", "Segment": "segment"})
    customers[["customer_id", "customer_name", "last_name", "date_of_birth", "segment"]].to_sql(
        "dim_customers", engine, if_exists="append", index=False
    )
    print(f"Loaded dim_customers: {len(customers)} rows")

    # --- dim_products ---
    products = df[["Product ID", "Product Name", "Category of Goods", "Sub-Category"]].drop_duplicates("Product ID").copy()
    products = products.rename(columns={
        "Product ID": "product_id", "Product Name": "product_name",
        "Category of Goods": "category", "Sub-Category": "sub_category",
    })
    products.to_sql("dim_products", engine, if_exists="append", index=False)
    print(f"Loaded dim_products: {len(products)} rows")

    # --- dim_store ---
    stores = df[["Region", "State", "City Type", "Outlet Type"]].drop_duplicates().reset_index(drop=True).copy()
    stores["store_id"] = stores.index + 1
    stores["country"] = "India"
    stores["postal_code"] = None
    stores = stores.rename(columns={
        "Region": "region", "State": "state", "City Type": "city_type", "Outlet Type": "outlet_type",
    })
    stores[["store_id", "country", "region", "state", "postal_code", "city_type", "outlet_type"]].to_sql(
        "dim_store", engine, if_exists="append", index=False
    )
    print(f"Loaded dim_store: {len(stores)} rows")

    store_key_cols = ["Region", "State", "City Type", "Outlet Type"]
    store_lookup = stores.rename(columns={
        "region": "Region", "state": "State", "city_type": "City Type", "outlet_type": "Outlet Type",
    })[store_key_cols + ["store_id"]]
    fact = df.merge(store_lookup, on=store_key_cols, how="left")

    # --- fact_sales ---
    fact_out = pd.DataFrame({
        "order_id": fact["Order ID"],
        "customer_id": fact["Customer ID"],
        "product_id": fact["Product ID"],
        "store_id": fact["store_id"],
        "order_date": fact["Order Date"].dt.date,
        "ship_date": None,
        "sales_date": fact["Sales Date"].dt.date,
        "ship_mode": "Standard Class",
        "order_year": fact["Order Date"].dt.year,
        "quantity": fact["Quantity"],
        "sales": fact["Sales"],
        "discount": fact["Discount"],
        "profit": fact["Profit"],
    })
    fact_out.to_sql("fact_sales", engine, if_exists="append", index=False)
    print(f"Loaded fact_sales: {len(fact_out)} rows")

    print("\nDone. NOTE: customer_loyalty table not loaded — customer_info.csv not yet available in this pipeline.")


if __name__ == "__main__":
    main()