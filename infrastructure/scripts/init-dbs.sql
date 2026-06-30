-- Create a database for each microservice to enforce the Database-per-Service pattern

CREATE DATABASE identity_db;
CREATE DATABASE user_db;
CREATE DATABASE product_db;
CREATE DATABASE inventory_db;
CREATE DATABASE order_db;
CREATE DATABASE payment_db;
CREATE DATABASE shipping_db;
CREATE DATABASE notification_db;
CREATE DATABASE review_db;

-- In a production environment, each DB would also have its own user/role
-- with restricted access, but for local dev we use the superuser.
