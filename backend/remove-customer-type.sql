-- Run once in phpMyAdmin with sauz_store_db selected.
-- This permanently deletes the field and all values stored in it.
-- Run only if customers.customer_type still exists.

DROP TABLE IF EXISTS customers_customer_type_backup;
ALTER TABLE customers DROP COLUMN customer_type;
