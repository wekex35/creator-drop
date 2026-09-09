import { getDb } from "@/lib/mongodb";
import type { OrderRecord } from "@/lib/orders-db";

export type AnalyticsSummary = {
  revenue: number;
  paidOrders: number;
  createdOrders: number;
  customers: number;
  averageOrderValue: number;
  revenue7d: number;
  revenue30d: number;
  topProducts: Array<{
    id: string;
    title: string;
    units: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    orderId: string;
    status: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    productTitles: string[];
    createdAt: string;
    paidAt?: string;
  }>;
  statusBreakdown: Record<string, number>;
};

function startOfDaysAgo(days: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const db = await getDb();
  const orders = db.collection<OrderRecord>("orders");
  const customers = db.collection("customers");

  const [allOrders, customerCount] = await Promise.all([
    orders.find({}).sort({ createdAt: -1 }).limit(500).toArray(),
    customers.countDocuments(),
  ]);

  const paid = allOrders.filter((o) => o.status === "PAID");
  const revenue = paid.reduce((sum, o) => sum + o.amount, 0);
  const since7 = startOfDaysAgo(7);
  const since30 = startOfDaysAgo(30);

  const revenue7d = paid
    .filter((o) => (o.paidAt ?? o.updatedAt) >= since7)
    .reduce((sum, o) => sum + o.amount, 0);
  const revenue30d = paid
    .filter((o) => (o.paidAt ?? o.updatedAt) >= since30)
    .reduce((sum, o) => sum + o.amount, 0);

  const productMap = new Map<
    string,
    { id: string; title: string; units: number; revenue: number }
  >();

  for (const order of paid) {
    for (const item of order.items) {
      const current = productMap.get(item.id) ?? {
        id: item.id,
        title: item.title,
        units: 0,
        revenue: 0,
      };
      current.units += item.quantity;
      current.revenue += item.lineTotal;
      productMap.set(item.id, current);
    }
  }

  const statusBreakdown: Record<string, number> = {};
  for (const order of allOrders) {
    statusBreakdown[order.status] = (statusBreakdown[order.status] ?? 0) + 1;
  }

  return {
    revenue,
    paidOrders: paid.length,
    createdOrders: allOrders.length,
    customers: customerCount,
    averageOrderValue: paid.length ? revenue / paid.length : 0,
    revenue7d,
    revenue30d,
    topProducts: [...productMap.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8),
    recentOrders: allOrders.slice(0, 25).map((o) => ({
      orderId: o.orderId,
      status: o.status,
      amount: o.amount,
      customerName: o.customer.name,
      customerEmail: o.customer.email,
      productTitles: o.items.map((i) => i.title),
      createdAt: o.createdAt.toISOString(),
      paidAt: o.paidAt?.toISOString(),
    })),
    statusBreakdown,
  };
}
