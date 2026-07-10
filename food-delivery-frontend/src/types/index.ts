// 1. User & Role
export interface User {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  avatarUrl: string;
  isActive: boolean;
}

// 2. Restaurant
export interface Restaurant {
  restaurantId: number;
  restaurantName: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  ownerId: number;
  rating: number;
  totalReviews: number;
  deliveryFee: number;
  minOrderValue: number;
  isActive: boolean;
  imageUrl: string;
}

// 3. Category
export interface Category {
  categoryId: number;
  categoryName: string;
  description: string;
  restaurantId: number;
  imageUrl: string;
  displayOrder: number;
}

// 4. Food
export interface Food {
  foodId: number;
  foodName: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: number;
  restaurantId: number;
  isAvailable: boolean;
}

// 5. Voucher
export interface Voucher {
  voucherId: number;
  voucherCode: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderValue: number;
  maxUses: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// 6. Cart & CartItem
export interface CartItem {
  food: Food; // Đối tượng Food đầy đủ để hiển thị thông tin món ăn
  quantity: number;
}

// 7. Order
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';

export interface Order {
  orderId: number;
  orderCode: string;
  customerId: number;
  restaurantId: number;
  shipperId: number | null;
  deliveryAddress: string;
  deliveryPhone: string;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  voucherId: number | null;
  totalAmount: number;
  orderStatus: OrderStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}