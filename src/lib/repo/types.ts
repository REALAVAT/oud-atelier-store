import type {
  Address,
  Customer,
  DiscountCode,
  EmailLog,
  Order,
  OrderStatus,
  Product,
  Review,
  StoreSettings,
} from "@/lib/types";

export interface Repo {
  listProducts(): Promise<Product[]>;
  saveProduct(p: Product): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  uploadImage(file: File): Promise<string>;

  listOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | null>;
  listMyOrders(userId: string, email: string): Promise<Order[]>;
  updateOrderStatus(id: string, status: OrderStatus, note?: string): Promise<Order | null>;

  listCustomers(): Promise<Customer[]>;

  listDiscounts(): Promise<DiscountCode[]>;
  saveDiscount(d: DiscountCode): Promise<void>;
  deleteDiscount(id: string): Promise<void>;

  getSettings(): Promise<StoreSettings>;
  saveSettings(s: StoreSettings): Promise<void>;

  listAddresses(userId: string): Promise<Address[]>;
  saveAddress(userId: string, a: Address): Promise<void>;
  deleteAddress(userId: string, id: string): Promise<void>;

  listReviews(productId: string): Promise<Review[]>;
  addReview(r: Review): Promise<void>;

  listEmails(): Promise<EmailLog[]>;
}
