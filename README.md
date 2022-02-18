# README

This README provide description and guideline to work with this repository.

Database schema:

- SQL

<pre><code>
CREATE TABLE vouchers (
  voucher_code VARCHAR(255) NOT NULL,
  customer_id VARCHAR(255) NULL,
  used BOOLEAN NOT NULL DEFAULT 0,
  created_at DATETIME,
  updated_at DATETIME,
  PRIMARY KEY (voucher_code)
) ENGINE = INNODB;
</code></pre>
