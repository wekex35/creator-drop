export type CheckoutCustomer = {
  name: string;
  email: string;
  phone: string;
};

export type CheckoutLineItem = {
  id: string;
  quantity: number;
};

export type PendingOrder = {
  orderId: string;
  productIds: string[];
  titles: string[];
  amount: number;
  createdAt: number;
};

const PENDING_ORDERS_KEY = "creatordrop-pending-orders";
const CUSTOMER_KEY = "creatordrop-checkout-customer";

export function loadCheckoutCustomer(): CheckoutCustomer {
  if (typeof window === "undefined") {
    return { name: "", email: "", phone: "" };
  }
  try {
    const raw = localStorage.getItem(CUSTOMER_KEY);
    if (!raw) return { name: "", email: "", phone: "" };
    return JSON.parse(raw) as CheckoutCustomer;
  } catch {
    return { name: "", email: "", phone: "" };
  }
}

export function saveCheckoutCustomer(customer: CheckoutCustomer) {
  localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
}

export function savePendingOrder(order: PendingOrder) {
  const all = loadPendingOrders();
  all[order.orderId] = order;
  sessionStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(all));
}

export function loadPendingOrder(orderId: string): PendingOrder | null {
  return loadPendingOrders()[orderId] ?? null;
}

function loadPendingOrders(): Record<string, PendingOrder> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(PENDING_ORDERS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, PendingOrder>;
  } catch {
    return {};
  }
}

export function isValidCustomer(customer: CheckoutCustomer) {
  const phone = customer.phone.replace(/\D/g, "");
  return (
    customer.name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim()) &&
    phone.length >= 10
  );
}
