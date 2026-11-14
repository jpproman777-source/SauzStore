-- Run this once in phpMyAdmin with sauz_store_db selected.
-- Existing rows are preserved. Products remain one row per size/color variant.

ALTER TABLE customers
  MODIFY id_customer INT(11) NOT NULL,
  MODIFY doc_type VARCHAR(40) NULL,
  MODIFY birthday DATE NULL,
  MODIFY user_role VARCHAR(16) NOT NULL DEFAULT 'CLIENT',
  ADD COLUMN city VARCHAR(100) NULL AFTER address,
  ADD UNIQUE KEY uq_customers_email (email);

ALTER TABLE products
  MODIFY id_product INT(11) NOT NULL AUTO_INCREMENT,
  ADD COLUMN product_group_id INT(11) NULL AFTER id_product,
  ADD COLUMN sku VARCHAR(100) NOT NULL DEFAULT '' AFTER name,
  ADD COLUMN brand VARCHAR(100) NOT NULL DEFAULT '' AFTER sku,
  ADD COLUMN description TEXT NULL AFTER brand,
  ADD COLUMN image_url VARCHAR(1000) NOT NULL DEFAULT '' AFTER description,
  ADD COLUMN alternate_images JSON NULL AFTER image_url,
  ADD COLUMN previous_price DECIMAL(12,2) NULL AFTER price,
  ADD COLUMN active TINYINT(1) NOT NULL DEFAULT 1 AFTER stock,
  ADD COLUMN subcategory VARCHAR(80) NOT NULL DEFAULT '' AFTER category,
  ADD COLUMN icon VARCHAR(32) NOT NULL DEFAULT '' AFTER subcategory,
  ADD COLUMN commercial TINYINT(1) NOT NULL DEFAULT 1 AFTER icon,
  ADD COLUMN source_import_key VARCHAR(180) NULL AFTER active,
  ADD UNIQUE KEY uq_products_source_import_key (source_import_key);

UPDATE products SET product_group_id = id_product WHERE product_group_id IS NULL;

ALTER TABLE products
  MODIFY product_group_id INT(11) NOT NULL,
  ADD KEY idx_products_group (product_group_id),
  ADD KEY idx_products_active (active);

ALTER TABLE sales
  MODIFY id_sale INT(11) NOT NULL AUTO_INCREMENT,
  MODIFY id_customer INT(11) NULL,
  ADD COLUMN order_code VARCHAR(40) NULL AFTER id_sale,
  ADD COLUMN order_status VARCHAR(40) NOT NULL DEFAULT 'Pendiente' AFTER total,
  ADD COLUMN subtotal DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER total,
  ADD COLUMN tax DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER subtotal,
  ADD COLUMN item_count INT(11) NOT NULL DEFAULT 0 AFTER tax,
  ADD COLUMN payment_method VARCHAR(40) NOT NULL DEFAULT 'cash' AFTER item_count,
  ADD COLUMN shipping_address JSON NULL AFTER payment_method,
  ADD COLUMN customer_snapshot JSON NULL AFTER shipping_address,
  ADD COLUMN tracking_history JSON NULL AFTER customer_snapshot;

UPDATE sales SET order_code = CONCAT('SAUZ-LEGACY-', id_sale) WHERE order_code IS NULL;

UPDATE sales s
JOIN (
  SELECT id_sale, SUM(quantity * unit_price) AS line_total, SUM(quantity) AS line_count
  FROM sale_items
  GROUP BY id_sale
) i ON i.id_sale = s.id_sale
SET s.subtotal = i.line_total, s.item_count = i.line_count
WHERE s.subtotal = 0 AND s.item_count = 0;

ALTER TABLE sales
  MODIFY order_code VARCHAR(40) NOT NULL,
  ADD UNIQUE KEY uq_sales_order_code (order_code);

CREATE TABLE customer_addresses (
  id_address INT(11) NOT NULL AUTO_INCREMENT,
  id_customer INT(11) NOT NULL,
  recipient VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL DEFAULT '',
  department VARCHAR(100) NOT NULL DEFAULT '',
  city VARCHAR(100) NOT NULL,
  neighborhood VARCHAR(150) NOT NULL DEFAULT '',
  address VARCHAR(255) NOT NULL,
  complement VARCHAR(255) NOT NULL DEFAULT '',
  address_references VARCHAR(500) NOT NULL DEFAULT '',
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id_address),
  KEY idx_customer_addresses_customer (id_customer),
  CONSTRAINT fk_customer_addresses_customer
    FOREIGN KEY (id_customer) REFERENCES customers (id_customer)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
