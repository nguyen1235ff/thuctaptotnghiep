-- =====================================================
-- FOOD DELIVERY SYSTEM - V2 SEED SAMPLE DATA
-- Fix password hashes + Thêm dữ liệu mẫu đầy đủ
-- Password cho tất cả users: admin123
-- =====================================================

-- =====================================================
-- 1. FIX PASSWORD HASHES (hash cũ trong V1 sai)
-- BCrypt(admin123, cost=10)
-- =====================================================
UPDATE users
SET password_hash = '$2a$10$.ssy89CiP.Q.nARhc86QKex2wCjtIfJU1xqH7ujwV7Tjf7QVb2S/a'
WHERE username IN ('admin', 'owner1');

-- =====================================================
-- 2. THÊM USERS MẪU
-- =====================================================

-- Customer 1
INSERT INTO users (username, email, password_hash, full_name, phone, address, is_active)
VALUES ('customer1', 'customer1@gmail.com',
        '$2a$10$.ssy89CiP.Q.nARhc86QKex2wCjtIfJU1xqH7ujwV7Tjf7QVb2S/a',
        N'Nguyễn Văn A', '0922222222', N'123 Lê Lợi, Quận 1, TP.HCM', 1);

-- Customer 2
INSERT INTO users (username, email, password_hash, full_name, phone, address, is_active)
VALUES ('customer2', 'customer2@gmail.com',
        '$2a$10$.ssy89CiP.Q.nARhc86QKex2wCjtIfJU1xqH7ujwV7Tjf7QVb2S/a',
        N'Trần Thị B', '0933333333', N'456 Nguyễn Huệ, Quận 1, TP.HCM', 1);

-- Restaurant owner 2
INSERT INTO users (username, email, password_hash, full_name, phone, is_active)
VALUES ('owner2', 'owner2@fooddelivery.com',
        '$2a$10$.ssy89CiP.Q.nARhc86QKex2wCjtIfJU1xqH7ujwV7Tjf7QVb2S/a',
        N'Restaurant Owner 2', '0944444444', 1);

-- Shipper 1
INSERT INTO users (username, email, password_hash, full_name, phone, is_active)
VALUES ('shipper1', 'shipper1@fooddelivery.com',
        '$2a$10$.ssy89CiP.Q.nARhc86QKex2wCjtIfJU1xqH7ujwV7Tjf7QVb2S/a',
        N'Shipper Lê Văn C', '0955555555', 1);

-- Gán role cho users mới
-- customer1 (user_id=3) -> CUSTOMER (role_id=2)
INSERT INTO user_roles (user_id, role_id) VALUES (3, 2);
-- customer2 (user_id=4) -> CUSTOMER
INSERT INTO user_roles (user_id, role_id) VALUES (4, 2);
-- owner2 (user_id=5) -> RESTAURANT
INSERT INTO user_roles (user_id, role_id) VALUES (5, 3);
-- shipper1 (user_id=6) -> SHIPPER (role_id=4)
INSERT INTO user_roles (user_id, role_id) VALUES (6, 4);

-- =====================================================
-- 3. THÊM RESTAURANTS
-- =====================================================

-- Restaurant 2 (owner2)
INSERT INTO restaurants (restaurant_name, description, address, phone, email, owner_id, rating, delivery_fee, min_order_value, is_active)
VALUES (N'Bún Bò Huế Ngon', N'Bún bò Huế chuẩn vị truyền thống từ Cố Đô',
        N'78 Pasteur, Quận 3, TP.HCM', '0944444444', 'bunbo@gmail.com',
        5, 4.50, 15000, 40000, 1);

-- Restaurant 3 (owner1 sở hữu thêm 1)
INSERT INTO restaurants (restaurant_name, description, address, phone, email, owner_id, rating, delivery_fee, min_order_value, is_active)
VALUES (N'Cơm Tấm Sài Gòn', N'Cơm tấm sườn bì chả đặc trưng Sài Gòn',
        N'99 Đinh Tiên Hoàng, Bình Thạnh, TP.HCM', '0911111111', 'comtam@gmail.com',
        2, 4.80, 10000, 30000, 1);

-- Restaurant 4
INSERT INTO restaurants (restaurant_name, description, address, phone, email, owner_id, rating, delivery_fee, min_order_value, is_active)
VALUES (N'Trà Sữa The Alley', N'Trà sữa cao cấp, topping đa dạng',
        N'15 Nguyễn Trãi, Quận 5, TP.HCM', '0955555555', 'thealley@gmail.com',
        5, 4.20, 20000, 50000, 1);

-- =====================================================
-- 4. THÊM CATEGORIES CHO RESTAURANT 1 (Pizza Palace, restaurant_id=1)
-- =====================================================
INSERT INTO categories (category_name, description, restaurant_id, display_order)
VALUES (N'Pasta', N'Mì Ý các loại', 1, 2);

INSERT INTO categories (category_name, description, restaurant_id, display_order)
VALUES (N'Đồ Uống', N'Nước ngọt, nước ép', 1, 3);

-- =====================================================
-- 5. THÊM CATEGORIES CHO RESTAURANT 2 (Bún Bò)
-- =====================================================
INSERT INTO categories (category_name, description, restaurant_id, display_order)
VALUES (N'Bún Bò', N'Các món bún bò truyền thống', 2, 1);

INSERT INTO categories (category_name, description, restaurant_id, display_order)
VALUES (N'Khai Vị', N'Nem, chả giò', 2, 2);

INSERT INTO categories (category_name, description, restaurant_id, display_order)
VALUES (N'Tráng Miệng', N'Chè, bánh ngọt', 2, 3);

-- =====================================================
-- 6. THÊM CATEGORIES CHO RESTAURANT 3 (Cơm Tấm)
-- =====================================================
INSERT INTO categories (category_name, description, restaurant_id, display_order)
VALUES (N'Cơm Tấm', N'Cơm tấm sườn, bì, chả', 3, 1);

INSERT INTO categories (category_name, description, restaurant_id, display_order)
VALUES (N'Nước Uống', N'Nước ngọt, trà đá', 3, 2);

-- =====================================================
-- 7. THÊM CATEGORIES CHO RESTAURANT 4 (Trà Sữa)
-- =====================================================
INSERT INTO categories (category_name, description, restaurant_id, display_order)
VALUES (N'Trà Sữa', N'Trà sữa các vị', 4, 1);

INSERT INTO categories (category_name, description, restaurant_id, display_order)
VALUES (N'Smoothie', N'Sinh tố trái cây', 4, 2);

-- =====================================================
-- 8. THÊM FOODS
-- =====================================================

-- Restaurant 1: Pizza Palace (category_id 1=Pizza, 2=Pasta, 3=Đồ Uống)
INSERT INTO foods (food_name, description, price, category_id, restaurant_id, is_available)
VALUES (N'Pizza Hải Sản', N'Pizza tươi với tôm, mực, cua xốt cà chua',
        180000, 1, 1, 1);

INSERT INTO foods (food_name, description, price, category_id, restaurant_id, is_available)
VALUES (N'Pizza BBQ Gà', N'Pizza BBQ với thịt gà nướng, hành tây, ớt chuông',
        165000, 1, 1, 1);

INSERT INTO foods (food_name, description, price, category_id, restaurant_id, is_available)
VALUES (N'Spaghetti Bolognese', N'Mì Ý sốt thịt bò băm truyền thống Ý',
        135000, 2, 1, 1);

INSERT INTO foods (food_name, description, price, category_id, restaurant_id, is_available)
VALUES (N'Fettuccine Alfredo', N'Mì dẹt sốt kem bơ phô mai',
        145000, 2, 1, 1);

INSERT INTO foods (food_name, description, price, category_id, restaurant_id, is_available)
VALUES (N'Coca Cola', N'Coca Cola lon 330ml', 25000, 3, 1, 1);

INSERT INTO foods (food_name, description, price, category_id, restaurant_id, is_available)
VALUES (N'Nước Ép Cam', N'Nước ép cam tươi 500ml', 35000, 3, 1, 1);

-- Restaurant 2: Bún Bò Huế (category 4=Bún Bò, 5=Khai Vị, 6=Tráng Miệng)
INSERT INTO foods (food_name, description, price, category_id, restaurant_id, is_available)
VALUES (N'Bún Bò Huế Đặc Biệt', N'Bún bò Huế với giò heo, chả cua, huyết đặc biệt',
        85000, 4, 2, 1);

INSERT INTO foods (food_name, description, price, category_id, restaurant_id, is_available)
VALUES (N'Bún Bò Huế Thường', N'Bún bò Huế truyền thống với thịt bắp bò',
        65000, 4, 2, 1);

INSERT INTO foods (food_name, description, price, category_id, restaurant_id, is_available)
VALUES (N'Nem Rán', N'Nem rán giòn 5 cái kèm nước chấm',
        45000, 5, 2, 1);

INSERT INTO foods (food_name, description, price, category_id, restaurant_id, is_available)
VALUES (N'Chả Giò Tôm', N'Chả giò nhân tôm thịt giòn rụm',
        50000, 5, 2, 1);

INSERT INTO foods (food_name, description, price, category_id, restaurant_id, is_available)
VALUES (N'Chè Thái', N'Chè Thái với thạch, đậu, nước cốt dừa',
        35000, 6, 2, 1);

-- Restaurant 3: Cơm Tấm (category 7=Cơm Tấm, 8=Nước Uống)
INSERT INTO foods (food_name, description, price, category_id, restaurant_id, is_available)
VALUES (N'Cơm Tấm Sườn Bì Chả', N'Cơm tấm đầy đủ sườn nướng, bì, chả, trứng ốp la',
        75000, 7, 3, 1);

INSERT INTO foods (food_name, description, price, category_id, restaurant_id, is_available)
VALUES (N'Cơm Tấm Sườn Đặc Biệt', N'Sườn cốt lết lớn nướng than hoa thơm lừng',
        90000, 7, 3, 1);

INSERT INTO foods (food_name, description, price, category_id, restaurant_id, is_available)
VALUES (N'Cơm Tấm Gà Nướng', N'Ức gà nướng sả ớt, cơm tấm dẻo',
        70000, 7, 3, 1);

INSERT INTO foods (food_name, description, price, category_id, restaurant_id, is_available)
VALUES (N'Trà Đá Chanh', N'Trà đá chanh mát lạnh 500ml', 15000, 8, 3, 1);

INSERT INTO foods (food_name, description, price, category_id, restaurant_id, is_available)
VALUES (N'Nước Ngọt', N'Pepsi / 7Up lon 330ml', 20000, 8, 3, 1);

-- Restaurant 4: Trà Sữa The Alley (category 9=Trà Sữa, 10=Smoothie)
INSERT INTO foods (food_name, description, price, category_id, restaurant_id, is_available)
VALUES (N'Trà Sữa Trân Châu Đen', N'Trà sữa Đài Loan với trân châu đen dẻo thơm',
        65000, 9, 4, 1);

INSERT INTO foods (food_name, description, price, category_id, restaurant_id, is_available)
VALUES (N'Matcha Latte Trân Châu', N'Matcha Nhật Bản pha kem tươi, trân châu trắng',
        75000, 9, 4, 1);

INSERT INTO foods (food_name, description, price, category_id, restaurant_id, is_available)
VALUES (N'Hồng Trà Sữa Tươi', N'Hồng trà Sri Lanka pha sữa tươi nguyên kem',
        70000, 9, 4, 1);

INSERT INTO foods (food_name, description, price, category_id, restaurant_id, is_available)
VALUES (N'Smoothie Xoài', N'Sinh tố xoài Cát Hòa nguyên chất 400ml',
        55000, 10, 4, 1);

INSERT INTO foods (food_name, description, price, category_id, restaurant_id, is_available)
VALUES (N'Smoothie Dâu Tây', N'Sinh tố dâu tây tươi mát 400ml',
        60000, 10, 4, 1);

-- =====================================================
-- 9. THÊM VOUCHERS
-- =====================================================

INSERT INTO vouchers (voucher_code, description, discount_type, discount_value, min_order_value, max_uses, used_count, start_date, end_date, is_active)
VALUES ('WELCOME10', N'Giảm 10% cho đơn hàng đầu tiên', 'PERCENTAGE', 10.00, 0, 1000, 0,
        DATEADD(DAY, -30, GETDATE()), DATEADD(DAY, 365, GETDATE()), 1);

INSERT INTO vouchers (voucher_code, description, discount_type, discount_value, min_order_value, max_uses, used_count, start_date, end_date, is_active)
VALUES ('SAVE20K', N'Giảm 20,000đ cho đơn từ 100,000đ', 'FIXED_AMOUNT', 20000.00, 100000, 500, 0,
        DATEADD(DAY, -30, GETDATE()), DATEADD(DAY, 90, GETDATE()), 1);

INSERT INTO vouchers (voucher_code, description, discount_type, discount_value, min_order_value, max_uses, used_count, start_date, end_date, is_active)
VALUES ('FREESHIP', N'Giảm phí ship 15,000đ', 'FIXED_AMOUNT', 15000.00, 50000, NULL, 0,
        DATEADD(DAY, -30, GETDATE()), DATEADD(DAY, 60, GETDATE()), 1);

INSERT INTO vouchers (voucher_code, description, discount_type, discount_value, min_order_value, max_uses, used_count, start_date, end_date, is_active)
VALUES ('SUPER15', N'Siêu giảm 15% cho đơn từ 200,000đ', 'PERCENTAGE', 15.00, 200000, 200, 0,
        DATEADD(DAY, -30, GETDATE()), DATEADD(DAY, 30, GETDATE()), 1);
