-- =====================================================
-- FOOD DELIVERY SYSTEM - DATABASE INITIALIZATION
-- =====================================================

-- =====================================================
-- 1. CREATE ROLES TABLE
-- =====================================================
CREATE TABLE roles (
                       role_id INT IDENTITY(1,1) PRIMARY KEY,
                       role_name VARCHAR(50) NOT NULL UNIQUE,
                       description VARCHAR(255),
                       created_at DATETIME DEFAULT GETDATE()
);

-- =====================================================
-- 2. CREATE USERS TABLE
-- =====================================================
CREATE TABLE users (
                       user_id INT IDENTITY(1,1) PRIMARY KEY,
                       username VARCHAR(50) NOT NULL UNIQUE,
                       email VARCHAR(100) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       full_name VARCHAR(100) NOT NULL,
                       phone VARCHAR(20),
                       address VARCHAR(500),
                       avatar_url VARCHAR(500),
                       is_active BIT DEFAULT 1,
                       created_at DATETIME DEFAULT GETDATE(),
                       updated_at DATETIME DEFAULT GETDATE()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- =====================================================
-- 3. CREATE USER_ROLES TABLE
-- =====================================================
CREATE TABLE user_roles (
                            user_id INT NOT NULL,
                            role_id INT NOT NULL,
                            assigned_at DATETIME DEFAULT GETDATE(),
                            PRIMARY KEY (user_id, role_id),
                            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                            FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

-- =====================================================
-- 4. CREATE RESTAURANTS TABLE
-- =====================================================
CREATE TABLE restaurants (
                             restaurant_id INT IDENTITY(1,1) PRIMARY KEY,
                             restaurant_name VARCHAR(100) NOT NULL,
                             description VARCHAR(500),
                             address VARCHAR(500) NOT NULL,
                             phone VARCHAR(20) NOT NULL,
                             email VARCHAR(100),
                             owner_id INT NOT NULL,
                             rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
                             total_reviews INT DEFAULT 0,
                             delivery_fee DECIMAL(10,2) DEFAULT 0,
                             min_order_value DECIMAL(10,2) DEFAULT 0,
                             is_active BIT DEFAULT 1,
                             image_url VARCHAR(500),
                             created_at DATETIME DEFAULT GETDATE(),
                             updated_at DATETIME DEFAULT GETDATE(),
                             FOREIGN KEY (owner_id) REFERENCES users(user_id),
                             CHECK (delivery_fee >= 0),
                             CHECK (min_order_value >= 0)
);

CREATE INDEX idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX idx_restaurants_active ON restaurants(is_active);

-- =====================================================
-- 5. CREATE CATEGORIES TABLE
-- =====================================================
CREATE TABLE categories (
                            category_id INT IDENTITY(1,1) PRIMARY KEY,
                            category_name VARCHAR(100) NOT NULL,
                            description VARCHAR(255),
                            restaurant_id INT NOT NULL,
                            image_url VARCHAR(500),
                            display_order INT DEFAULT 0,
                            created_at DATETIME DEFAULT GETDATE(),
                            FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);

CREATE INDEX idx_categories_restaurant ON categories(restaurant_id);

-- =====================================================
-- 6. CREATE FOODS TABLE
-- =====================================================
CREATE TABLE foods (
                       food_id INT IDENTITY(1,1) PRIMARY KEY,
                       food_name VARCHAR(100) NOT NULL,
                       description VARCHAR(500),
                       price DECIMAL(10,2) NOT NULL,
                       image_url VARCHAR(500),
                       category_id INT NOT NULL,
                       restaurant_id INT NOT NULL,
                       is_available BIT DEFAULT 1,
                       created_at DATETIME DEFAULT GETDATE(),
                       updated_at DATETIME DEFAULT GETDATE(),
                       FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE,
                       FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id), -- ĐÃ BỎ ON DELETE CASCADE Ở ĐÂY
                       CHECK (price > 0)
);

CREATE INDEX idx_foods_restaurant ON foods(restaurant_id);
CREATE INDEX idx_foods_category ON foods(category_id);
CREATE INDEX idx_foods_available ON foods(is_available);

-- =====================================================
-- 7. CREATE VOUCHERS TABLE
-- =====================================================
CREATE TABLE vouchers (
                          voucher_id INT IDENTITY(1,1) PRIMARY KEY,
                          voucher_code VARCHAR(50) NOT NULL UNIQUE,
                          description VARCHAR(255),
                          discount_type VARCHAR(20) NOT NULL,
                          discount_value DECIMAL(10,2) NOT NULL,
                          min_order_value DECIMAL(10,2) DEFAULT 0,
                          max_uses INT,
                          used_count INT DEFAULT 0,
                          start_date DATETIME NOT NULL,
                          end_date DATETIME NOT NULL,
                          is_active BIT DEFAULT 1,
                          created_at DATETIME DEFAULT GETDATE(),
                          CHECK (discount_value > 0),
                          CHECK (discount_type IN ('PERCENTAGE', 'FIXED_AMOUNT')),
                          CHECK (start_date < end_date)
);

CREATE INDEX idx_vouchers_code ON vouchers(voucher_code);
CREATE INDEX idx_vouchers_active ON vouchers(is_active);

-- =====================================================
-- 8. CREATE CARTS TABLE
-- =====================================================
CREATE TABLE carts (
                       cart_id INT IDENTITY(1,1) PRIMARY KEY,
                       user_id INT NOT NULL UNIQUE,
                       restaurant_id INT,
                       total_items INT DEFAULT 0,
                       subtotal DECIMAL(10,2) DEFAULT 0,
                       created_at DATETIME DEFAULT GETDATE(),
                       updated_at DATETIME DEFAULT GETDATE(),
                       FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                       FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
);

CREATE INDEX idx_carts_user ON carts(user_id);

-- =====================================================
-- 9. CREATE CART_ITEMS TABLE
-- =====================================================
CREATE TABLE cart_items (
                            cart_item_id INT IDENTITY(1,1) PRIMARY KEY,
                            cart_id INT NOT NULL,
                            food_id INT NOT NULL,
                            quantity INT NOT NULL CHECK (quantity > 0),
                            unit_price DECIMAL(10,2) NOT NULL,
                            total_price DECIMAL(10,2),
                            created_at DATETIME DEFAULT GETDATE(),
                            updated_at DATETIME DEFAULT GETDATE(),
                            FOREIGN KEY (cart_id) REFERENCES carts(cart_id) ON DELETE CASCADE,
                            FOREIGN KEY (food_id) REFERENCES foods(food_id),
                            UNIQUE (cart_id, food_id)
);

-- =====================================================
-- 10. CREATE ORDERS TABLE
-- =====================================================
CREATE TABLE orders (
                        order_id INT IDENTITY(1,1) PRIMARY KEY,
                        order_code VARCHAR(20) NOT NULL UNIQUE,
                        customer_id INT NOT NULL,
                        restaurant_id INT NOT NULL,
                        shipper_id INT,
                        delivery_address VARCHAR(500) NOT NULL,
                        delivery_phone VARCHAR(20) NOT NULL,
                        subtotal DECIMAL(10,2) NOT NULL,
                        delivery_fee DECIMAL(10,2) DEFAULT 0,
                        discount_amount DECIMAL(10,2) DEFAULT 0,
                        voucher_id INT,
                        total_amount DECIMAL(10,2) NOT NULL,
                        order_status VARCHAR(50) DEFAULT 'PENDING',
                        notes VARCHAR(500),
                        created_at DATETIME DEFAULT GETDATE(),
                        updated_at DATETIME DEFAULT GETDATE(),
                        FOREIGN KEY (customer_id) REFERENCES users(user_id),
                        FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id),
                        FOREIGN KEY (shipper_id) REFERENCES users(user_id),
                        FOREIGN KEY (voucher_id) REFERENCES vouchers(voucher_id),
                        CHECK (order_status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'DELIVERING', 'COMPLETED', 'CANCELLED')),
                        CHECK (total_amount > 0)
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_shipper ON orders(shipper_id);
CREATE INDEX idx_orders_status ON orders(order_status);

-- =====================================================
-- 11. CREATE ORDER_ITEMS TABLE
-- =====================================================
CREATE TABLE order_items (
                             order_item_id INT IDENTITY(1,1) PRIMARY KEY,
                             order_id INT NOT NULL,
                             food_id INT NOT NULL,
                             food_name VARCHAR(100),
                             quantity INT NOT NULL CHECK (quantity > 0),
                             unit_price DECIMAL(10,2),
                             total_price DECIMAL(10,2),
                             FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
                             FOREIGN KEY (food_id) REFERENCES foods(food_id)
);

-- =====================================================
-- 12. CREATE ORDER_STATUS_HISTORY TABLE
-- =====================================================
CREATE TABLE order_status_history (
                                      status_id INT IDENTITY(1,1) PRIMARY KEY,
                                      order_id INT NOT NULL,
                                      order_status VARCHAR(50) NOT NULL,
                                      changed_by INT,
                                      notes VARCHAR(500),
                                      created_at DATETIME DEFAULT GETDATE(),
                                      FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
                                      FOREIGN KEY (changed_by) REFERENCES users(user_id)
);

CREATE INDEX idx_order_status_history_order ON order_status_history(order_id);

-- =====================================================
-- 13. CREATE REVIEWS TABLE
-- =====================================================
CREATE TABLE reviews (
                         review_id INT IDENTITY(1,1) PRIMARY KEY,
                         order_id INT UNIQUE,
                         customer_id INT NOT NULL,
                         restaurant_id INT NOT NULL,
                         rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
                         comment VARCHAR(500),
                         created_at DATETIME DEFAULT GETDATE(),
                         FOREIGN KEY (order_id) REFERENCES orders(order_id),
                         FOREIGN KEY (customer_id) REFERENCES users(user_id),
                         FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
);

CREATE INDEX idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX idx_reviews_customer ON reviews(customer_id);

-- =====================================================
-- 14. CREATE REFRESH_TOKENS TABLE
-- =====================================================
CREATE TABLE refresh_tokens (
                                token_id INT IDENTITY(1,1) PRIMARY KEY,
                                user_id INT NOT NULL,
                                token_value VARCHAR(500) NOT NULL UNIQUE,
                                expires_at DATETIME NOT NULL,
                                created_at DATETIME DEFAULT GETDATE(),
                                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- =====================================================
-- 15. SEED INITIAL DATA
-- =====================================================

INSERT INTO roles (role_name, description) VALUES ('ADMIN', 'System Administrator');
INSERT INTO roles (role_name, description) VALUES ('CUSTOMER', 'Customer');
INSERT INTO roles (role_name, description) VALUES ('RESTAURANT', 'Restaurant Owner');
INSERT INTO roles (role_name, description) VALUES ('SHIPPER', 'Delivery Shipper');

INSERT INTO users (username, email, password_hash, full_name, phone, is_active)
VALUES ('admin', 'admin@fooddelivery.com', '$2a$10$slYQmyNdGzin7olVN3p5be4RFH0E6E3D0f.UDqaZbPTqYeI7A3YHy', 'Administrator', '0900000000', 1);

INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);

INSERT INTO users (username, email, password_hash, full_name, phone, is_active)
VALUES ('owner1', 'owner1@fooddelivery.com', '$2a$10$slYQmyNdGzin7olVN3p5be4RFH0E6E3D0f.UDqaZbPTqYeI7A3YHy', 'Restaurant Owner 1', '0911111111', 1);

INSERT INTO user_roles (user_id, role_id) VALUES (2, 3);

INSERT INTO restaurants (restaurant_name, address, phone, owner_id, delivery_fee, min_order_value, is_active)
VALUES ('Pizza Palace', '123 Main St', '0911111111', 2, 15000, 50000, 1);

INSERT INTO categories (category_name, restaurant_id, display_order)
VALUES ('Pizza', 1, 1);

INSERT INTO foods (food_name, price, category_id, restaurant_id, is_available)
VALUES ('Margherita Pizza', 150000, 1, 1, 1);