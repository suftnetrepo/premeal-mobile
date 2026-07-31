export type Role = "CUSTOMER" | "RESTAURANT_OWNER" | "ADMIN";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type MenuItemOption = {
  id: string;
  name: string;
  priceDeltaCents: number;
  isAvailable: boolean;
};

export type ModifierGroup = {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  sortOrder: number;
  options: MenuItemOption[];
};

export type MenuItem = {
  id: string;
  restaurantId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  priceCents: number;
  imageUrl: string | null;
  isAvailable: boolean;
  modifierGroups?: ModifierGroup[];
};

export type Restaurant = {
  id: string;
  name: string;
  slug: string;
  cuisine: string;
  description: string | null;
  imageUrl: string | null;
  minOrderCents: number;
  // Per-restaurant, not a flat platform-wide fee — each restaurant sets
  // its own via /restaurant/location on the web owner dashboard.
  // getListableRestaurants() (shared by web's homepage and this app's
  // /api/restaurants) returns full Restaurant rows with no `select`
  // narrowing these out, so the backend has always sent this — it just
  // wasn't declared here.
  deliveryFeeCents: number;
  phone: string | null;
  contactEmail: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  deliveryRadiusKm: number | null;
  averageRating: number | null;
  reviewCount: number;
  menuItems: MenuItem[];
  distanceKm?: number | null;
};

export type SlotStatus = "available" | "limited" | "full";

export type DeliverySlot = {
  id: string;
  date: string;
  windowStart: string;
  windowEnd: string;
  capacity: number;
  bookedCount: number;
  remaining: number;
  status: SlotStatus;
};

export type RestaurantDetail = Restaurant & {
  deliverySlots: DeliverySlot[];
};

export type OrderStatus =
  | "PENDING_CONFIRMATION"
  | "PAYMENT_ACTION_REQUIRED"
  | "CONFIRMED"
  | "DECLINED"
  | "EXPIRED"
  | "CANCELLED"
  | "PREPARING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED";

export type OrderItemModifier = {
  groupName: string;
  optionName: string;
  priceDeltaCents: number;
};

export type OrderItem = {
  id: string;
  nameSnapshot: string;
  priceCents: number;
  quantity: number;
  modifiers: OrderItemModifier[];
  // Live MenuItem.imageUrl, not a snapshot — unlike nameSnapshot/priceCents.
  // If a restaurant changes a dish's photo later, old orders show the new
  // photo, not what was true when it was ordered. Accepted tradeoff.
  menuItem: { imageUrl: string | null };
};

export type Order = {
  id: string;
  status: OrderStatus;
  subtotalCents: number;
  deliveryFeeCents: number;
  discountCents: number;
  totalCents: number;
  deliveryAddress: string;
  confirmationDeadline: string;
  restaurantCancelReason: string | null;
  cancelledByRestaurant: boolean;
  refundedAt: string | null;
  restaurant: { id: string; name: string };
  slot: { date: string; windowStart: string; windowEnd: string };
  items: OrderItem[];
  // The API's `include: { review: true }` (see premeal-app's
  // /api/orders/[id]) returns the full Review row, including createdAt —
  // this was just under-declared here previously.
  review: { rating: number; comment: string | null; createdAt: string } | null;
};

export type Address = {
  id: string;
  label: string | null;
  address: string;
  isDefault: boolean;
  latitude: number | null;
  longitude: number | null;
};
