-- =====================================================
-- FOOD DELIVERY - V3: ALTER VARCHAR -> NVARCHAR
-- Chỉ alter cột chứa nội dung tiếng Việt
-- Bỏ qua các cột có UNIQUE/INDEX constraint:
--   username, email, order_code, voucher_code, token_value
-- =====================================================

-- =====================================================
-- TABLE: users (chỉ full_name, address, avatar_url)
-- =====================================================
ALTER TABLE users ALTER COLUMN full_name     NVARCHAR(100) NOT NULL;
ALTER TABLE users ALTER COLUMN address       NVARCHAR(500);
ALTER TABLE users ALTER COLUMN avatar_url    NVARCHAR(500);
ALTER TABLE users ALTER COLUMN password_hash NVARCHAR(255) NOT NULL;

-- =====================================================
-- TABLE: roles (chỉ description)
-- =====================================================
ALTER TABLE roles ALTER COLUMN description NVARCHAR(255);

-- =====================================================
-- TABLE: restaurants (skip email, phone)
-- =====================================================
ALTER TABLE restaurants ALTER COLUMN restaurant_name NVARCHAR(100) NOT NULL;
ALTER TABLE restaurants ALTER COLUMN description     NVARCHAR(500);
ALTER TABLE restaurants ALTER COLUMN address         NVARCHAR(500) NOT NULL;
ALTER TABLE restaurants ALTER COLUMN image_url       NVARCHAR(500);

-- =====================================================
-- TABLE: categories
-- =====================================================
ALTER TABLE categories ALTER COLUMN category_name NVARCHAR(100) NOT NULL;
ALTER TABLE categories ALTER COLUMN description   NVARCHAR(255);
ALTER TABLE categories ALTER COLUMN image_url     NVARCHAR(500);

-- =====================================================
-- TABLE: foods
-- =====================================================
ALTER TABLE foods ALTER COLUMN food_name   NVARCHAR(100) NOT NULL;
ALTER TABLE foods ALTER COLUMN description NVARCHAR(500);
ALTER TABLE foods ALTER COLUMN image_url   NVARCHAR(500);

-- =====================================================
-- TABLE: orders (skip order_code - has UNIQUE constraint)
-- =====================================================
ALTER TABLE orders ALTER COLUMN delivery_address NVARCHAR(500) NOT NULL;
ALTER TABLE orders ALTER COLUMN notes            NVARCHAR(500);

-- =====================================================
-- TABLE: order_items
-- =====================================================
ALTER TABLE order_items ALTER COLUMN food_name NVARCHAR(100);

-- =====================================================
-- TABLE: order_status_history
-- =====================================================
ALTER TABLE order_status_history ALTER COLUMN notes NVARCHAR(500);

-- =====================================================
-- TABLE: reviews
-- =====================================================
ALTER TABLE reviews ALTER COLUMN comment NVARCHAR(500);

-- =====================================================
-- TABLE: vouchers (skip voucher_code - UNIQUE)
-- =====================================================
ALTER TABLE vouchers ALTER COLUMN description NVARCHAR(255);

-- =====================================================
-- UPDATE DỮ LIỆU TIẾNG VIỆT ĐÚNG
-- =====================================================

-- Restaurants
UPDATE restaurants SET
    restaurant_name = N'Bún Bò Huế Ngon',
    description     = N'Bún bò Huế chuẩn vị truyền thống từ Cố Đô',
    address         = N'78 Pasteur, Quận 3, TP.HCM'
WHERE restaurant_id = 2;

UPDATE restaurants SET
    restaurant_name = N'Cơm Tấm Sài Gòn',
    description     = N'Cơm tấm sườn bì chả đặc trưng Sài Gòn',
    address         = N'99 Đinh Tiên Hoàng, Bình Thạnh, TP.HCM'
WHERE restaurant_id = 3;

UPDATE restaurants SET
    restaurant_name = N'Trà Sữa The Alley',
    description     = N'Trà sữa cao cấp, topping đa dạng',
    address         = N'15 Nguyễn Trãi, Quận 5, TP.HCM'
WHERE restaurant_id = 4;

-- Users
UPDATE users SET
    full_name = N'Nguyễn Văn A',
    address   = N'123 Lê Lợi, Quận 1, TP.HCM'
WHERE username = 'customer1';

UPDATE users SET
    full_name = N'Trần Thị B',
    address   = N'456 Nguyễn Huệ, Quận 1, TP.HCM'
WHERE username = 'customer2';

UPDATE users SET
    full_name = N'Shipper Lê Văn C'
WHERE username = 'shipper1';

UPDATE users SET
    full_name = N'Administrator'
WHERE username = 'admin';

UPDATE users SET
    full_name = N'Restaurant Owner 1'
WHERE username = 'owner1';

UPDATE users SET
    full_name = N'Restaurant Owner 2'
WHERE username = 'owner2';

-- Categories
UPDATE categories SET category_name = N'Đồ Uống',     description = N'Nước ngọt, nước ép'           WHERE category_id = 3;
UPDATE categories SET category_name = N'Bún Bò',      description = N'Các món bún bò truyền thống'  WHERE category_id = 4;
UPDATE categories SET category_name = N'Khai Vị',     description = N'Nem, chả giò'                 WHERE category_id = 5;
UPDATE categories SET category_name = N'Tráng Miệng', description = N'Chè, bánh ngọt'               WHERE category_id = 6;
UPDATE categories SET category_name = N'Cơm Tấm',    description = N'Cơm tấm sườn, bì, chả'        WHERE category_id = 7;
UPDATE categories SET category_name = N'Nước Uống',   description = N'Nước ngọt, trà đá'            WHERE category_id = 8;
UPDATE categories SET category_name = N'Trà Sữa',    description = N'Trà sữa các vị'               WHERE category_id = 9;
UPDATE categories SET category_name = N'Smoothie',    description = N'Sinh tố trái cây'             WHERE category_id = 10;

-- Foods
UPDATE foods SET food_name = N'Pizza Hải Sản',          description = N'Pizza tươi với tôm, mực, cua xốt cà chua'         WHERE food_id = 2;
UPDATE foods SET food_name = N'Pizza BBQ Gà',           description = N'Pizza BBQ với thịt gà nướng, hành tây, ớt chuông'  WHERE food_id = 3;
UPDATE foods SET food_name = N'Spaghetti Bolognese',    description = N'Mì Ý sốt thịt bò băm truyền thống Ý'              WHERE food_id = 4;
UPDATE foods SET food_name = N'Fettuccine Alfredo',     description = N'Mì dẹt sốt kem bơ phô mai'                         WHERE food_id = 5;
UPDATE foods SET food_name = N'Nước Ép Cam',            description = N'Nước ép cam tươi 500ml'                            WHERE food_id = 7;
UPDATE foods SET food_name = N'Bún Bò Huế Đặc Biệt',   description = N'Bún bò Huế với giò heo, chả cua, huyết đặc biệt'  WHERE food_id = 8;
UPDATE foods SET food_name = N'Bún Bò Huế Thường',     description = N'Bún bò Huế truyền thống với thịt bắp bò'            WHERE food_id = 9;
UPDATE foods SET food_name = N'Nem Rán',                description = N'Nem rán giòn 5 cái kèm nước chấm'                  WHERE food_id = 10;
UPDATE foods SET food_name = N'Chả Giò Tôm',           description = N'Chả giò nhân tôm thịt giòn rụm'                    WHERE food_id = 11;
UPDATE foods SET food_name = N'Chè Thái',               description = N'Chè Thái với thạch, đậu, nước cốt dừa'             WHERE food_id = 12;
UPDATE foods SET food_name = N'Cơm Tấm Sườn Bì Chả',  description = N'Cơm tấm đầy đủ sườn nướng, bì, chả, trứng ốp la'  WHERE food_id = 13;
UPDATE foods SET food_name = N'Cơm Tấm Sườn Đặc Biệt',description = N'Sườn cốt lết lớn nướng than hoa thơm lừng'          WHERE food_id = 14;
UPDATE foods SET food_name = N'Cơm Tấm Gà Nướng',     description = N'Ức gà nướng sả ớt, cơm tấm dẻo'                    WHERE food_id = 15;
UPDATE foods SET food_name = N'Trà Đá Chanh',          description = N'Trà đá chanh mát lạnh 500ml'                       WHERE food_id = 16;
UPDATE foods SET food_name = N'Nước Ngọt',             description = N'Pepsi / 7Up lon 330ml'                             WHERE food_id = 17;
UPDATE foods SET food_name = N'Trà Sữa Trân Châu Đen', description = N'Trà sữa Đài Loan với trân châu đen dẻo thơm'      WHERE food_id = 18;
UPDATE foods SET food_name = N'Matcha Latte Trân Châu', description = N'Matcha Nhật Bản pha kem tươi, trân châu trắng'    WHERE food_id = 19;
UPDATE foods SET food_name = N'Hồng Trà Sữa Tươi',    description = N'Hồng trà Sri Lanka pha sữa tươi nguyên kem'        WHERE food_id = 20;
UPDATE foods SET food_name = N'Smoothie Xoài',         description = N'Sinh tố xoài Cát Hòa nguyên chất 400ml'           WHERE food_id = 21;
UPDATE foods SET food_name = N'Smoothie Dâu Tây',      description = N'Sinh tố dâu tây tươi mát 400ml'                   WHERE food_id = 22;

-- Vouchers
UPDATE vouchers SET description = N'Giảm 10% cho đơn hàng đầu tiên'    WHERE voucher_code = 'WELCOME10';
UPDATE vouchers SET description = N'Giảm 20,000đ cho đơn từ 100,000đ'  WHERE voucher_code = 'SAVE20K';
UPDATE vouchers SET description = N'Giảm phí ship 15,000đ'              WHERE voucher_code = 'FREESHIP';
UPDATE vouchers SET description = N'Siêu giảm 15% cho đơn từ 200,000đ' WHERE voucher_code = 'SUPER15';
