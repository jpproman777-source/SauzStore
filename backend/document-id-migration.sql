-- Run once in phpMyAdmin with sauz_store_db selected.
-- Existing ids keep their current values as strings; customer sales and saved
-- addresses remain linked to the same customer records.

ALTER TABLE sales
  DROP FOREIGN KEY fk_sales_customer;

ALTER TABLE customer_addresses
  DROP FOREIGN KEY fk_customer_addresses_customer;

ALTER TABLE customers
  MODIFY id_customer VARCHAR(30) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL;

ALTER TABLE sales
  MODIFY id_customer VARCHAR(30) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL;

ALTER TABLE customer_addresses
  MODIFY id_customer VARCHAR(30) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL;

ALTER TABLE sales
  ADD CONSTRAINT fk_sales_customer
    FOREIGN KEY (id_customer) REFERENCES customers (id_customer);

ALTER TABLE customer_addresses
  ADD CONSTRAINT fk_customer_addresses_customer
    FOREIGN KEY (id_customer) REFERENCES customers (id_customer)
    ON DELETE CASCADE;
