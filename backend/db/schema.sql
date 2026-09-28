-- Database Schema — Business Sales Intelligence Dashboard
-- Source: Mrinal's Database_Schema_API_Reference.pdf
-- Adapted: a few columns made nullable because the currently available source file
-- (Eklavya's cleaned_data.csv) doesn't supply them (e.g. last_name, postal_code, ship_mode).

CREATE TABLE dim_customers (
    customer_id     VARCHAR(10) PRIMARY KEY,
    customer_name   VARCHAR(50) NOT NULL,
    last_name       VARCHAR(50),
    date_of_birth   DATE,
    segment         VARCHAR(20) NOT NULL CHECK (segment IN ('Consumer','Corporate'))
);

CREATE TABLE dim_products (
    product_id      VARCHAR(10) PRIMARY KEY,
    product_name    VARCHAR(100) NOT NULL,
    category        VARCHAR(50) NOT NULL,
    sub_category    VARCHAR(50) NOT NULL
);

CREATE TABLE dim_store (
    store_id        SERIAL PRIMARY KEY,
    country         VARCHAR(50) NOT NULL DEFAULT 'India',
    region          VARCHAR(20) NOT NULL CHECK (region IN ('East','West','North','South')),
    state           VARCHAR(50) NOT NULL,
    postal_code     INTEGER,
    city_type       VARCHAR(20) NOT NULL CHECK (city_type IN ('Tier 1','Tier 2','Village')),
    outlet_type     VARCHAR(20) NOT NULL CHECK (outlet_type IN ('Large','Medium','Small')),
    UNIQUE (region, state, city_type, outlet_type)
);

CREATE TABLE fact_sales (
    order_id        VARCHAR(10) PRIMARY KEY,
    customer_id     VARCHAR(10) NOT NULL REFERENCES dim_customers(customer_id),
    product_id      VARCHAR(10) NOT NULL REFERENCES dim_products(product_id),
    store_id        INTEGER NOT NULL REFERENCES dim_store(store_id),
    order_date      DATE NOT NULL,
    ship_date       DATE,
    sales_date      DATE,
    ship_mode       VARCHAR(20),
    order_year      INTEGER NOT NULL,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    sales           NUMERIC(12,2) NOT NULL,
    discount        NUMERIC(5,4) NOT NULL CHECK (discount BETWEEN 0 AND 1),
    profit          NUMERIC(12,2) NOT NULL
);

CREATE INDEX idx_fact_sales_year ON fact_sales(order_year);
CREATE INDEX idx_fact_sales_customer ON fact_sales(customer_id);
CREATE INDEX idx_fact_sales_product ON fact_sales(product_id);
CREATE INDEX idx_fact_sales_store ON fact_sales(store_id);

CREATE TABLE customer_loyalty (
    loyalty_customer_id VARCHAR(10) PRIMARY KEY,
    email           VARCHAR(100),
    signup_date     DATE,
    gender          VARCHAR(20),
    region          VARCHAR(20),
    loyalty_tier    VARCHAR(20)
);