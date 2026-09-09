import type { Collection, WithId } from "mongodb";
import { getDeliveryUrl } from "@/data/delivery";
import { getDb } from "@/lib/mongodb";

export type OrderStatus =
  | "CREATED"
  | "ACTIVE"
  | "PAID"
  | "EXPIRED"
  | "FAILED"
  | "CANCELLED";

export type OrderCustomer = {
  name: string;
  email: string;
  phone: string;
};

export type OrderLineItem = {
  id: string;
  title: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  deliveryUrl: string;
};

export type OrderRecord = {
  orderId: string;
  status: OrderStatus;
  amount: number;
  currency: "INR";
  customer: OrderCustomer;
  items: OrderLineItem[];
  paymentSessionId?: string;
  cashfreeStatus?: string;
  paymentDetails?: unknown[];
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type CustomerRecord = {
  email: string;
  name: string;
  phone: string;
  orderIds: string[];
  createdAt: Date;
  updatedAt: Date;
};

declare global {
  // eslint-disable-next-line no-var
  var __creatordropMongoIndexesReady: Promise<void> | undefined;
}

async function ensureIndexes() {
  if (!global.__creatordropMongoIndexesReady) {
    global.__creatordropMongoIndexesReady = (async () => {
      const db = await getDb();
      await Promise.all([
        db.collection("orders").createIndex({ orderId: 1 }, { unique: true }),
        db.collection("orders").createIndex({ "customer.email": 1 }),
        db.collection("orders").createIndex({ createdAt: -1 }),
        db.collection("customers").createIndex({ email: 1 }, { unique: true }),
        db.collection("customers").createIndex({ phone: 1 }),
      ]);
    })();
  }
  await global.__creatordropMongoIndexesReady;
}

async function orders(): Promise<Collection<OrderRecord>> {
  await ensureIndexes();
  const db = await getDb();
  return db.collection<OrderRecord>("orders");
}

async function customers(): Promise<Collection<CustomerRecord>> {
  await ensureIndexes();
  const db = await getDb();
  return db.collection<CustomerRecord>("customers");
}

export function buildLineItems(
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    deliveryUrl?: string;
  }>,
): OrderLineItem[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.lineTotal,
    deliveryUrl: item.deliveryUrl || getDeliveryUrl(item.id),
  }));
}

export async function createOrder(input: {
  orderId: string;
  amount: number;
  customer: OrderCustomer;
  items: OrderLineItem[];
  paymentSessionId?: string;
  cashfreeStatus?: string;
}): Promise<OrderRecord> {
  const now = new Date();
  const record: OrderRecord = {
    orderId: input.orderId,
    status: "CREATED",
    amount: input.amount,
    currency: "INR",
    customer: input.customer,
    items: input.items,
    paymentSessionId: input.paymentSessionId,
    cashfreeStatus: input.cashfreeStatus,
    createdAt: now,
    updatedAt: now,
  };

  const col = await orders();
  await col.insertOne(record);

  const cust = await customers();
  await cust.updateOne(
    { email: input.customer.email.toLowerCase() },
    {
      $set: {
        name: input.customer.name,
        phone: input.customer.phone,
        updatedAt: now,
      },
      $setOnInsert: {
        email: input.customer.email.toLowerCase(),
        createdAt: now,
      },
      $addToSet: { orderIds: input.orderId },
    },
    { upsert: true },
  );

  return record;
}

export async function getOrderById(
  orderId: string,
): Promise<WithId<OrderRecord> | null> {
  const col = await orders();
  return col.findOne({ orderId });
}

export async function updateOrderFromCashfree(input: {
  orderId: string;
  cashfreeStatus: string;
  paymentDetails?: unknown[];
}): Promise<WithId<OrderRecord> | null> {
  const col = await orders();
  const now = new Date();
  const paid = input.cashfreeStatus === "PAID";

  await col.updateOne(
    { orderId: input.orderId },
    {
      $set: {
        cashfreeStatus: input.cashfreeStatus,
        status: paid ? "PAID" : mapCashfreeStatus(input.cashfreeStatus),
        paymentDetails: input.paymentDetails ?? [],
        updatedAt: now,
        ...(paid ? { paidAt: now } : {}),
      },
    },
  );

  return col.findOne({ orderId: input.orderId });
}

function mapCashfreeStatus(status: string): OrderStatus {
  switch (status) {
    case "PAID":
      return "PAID";
    case "ACTIVE":
      return "ACTIVE";
    case "EXPIRED":
      return "EXPIRED";
    case "CANCELLED":
      return "CANCELLED";
    default:
      return "FAILED";
  }
}

export function orderDeliveryLinks(order: OrderRecord) {
  return order.items.map((item) => ({
    id: item.id,
    title: item.title,
    deliveryUrl: item.deliveryUrl || getDeliveryUrl(item.id),
  }));
}
