"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AnalyticsSummary } from "@/lib/analytics";
import { formatINR } from "@/lib/money";

type Props = {
  analytics: AnalyticsSummary;
  productCount: number;
};

export function AdminDashboard({ analytics, productCount }: Props) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const cards = [
    { label: "Revenue (paid)", value: formatINR(analytics.revenue) },
    { label: "Paid orders", value: String(analytics.paidOrders) },
    { label: "Customers", value: String(analytics.customers) },
    {
      label: "Avg order value",
      value: formatINR(analytics.averageOrderValue),
    },
    { label: "Revenue 7d", value: formatINR(analytics.revenue7d) },
    { label: "Revenue 30d", value: formatINR(analytics.revenue30d) },
    { label: "All orders", value: String(analytics.createdOrders) },
    { label: "Products", value: String(productCount) },
  ];

  return (
    <div className="section-pad py-8 md:py-12">
      <div className="section-inner space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
              CreatorDrop admin
            </p>
            <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              Analytics
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/catalog" className="btn-primary px-4 py-2 text-sm">
              Manage catalog
            </Link>
            <Link href="/" className="btn-ghost px-4 py-2 text-sm">
              Storefront
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="btn-ghost px-4 py-2 text-sm"
            >
              Log out
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-line bg-bg-secondary p-4"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                {card.label}
              </p>
              <p className="mt-2 font-display text-2xl font-bold tabular-nums">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-line bg-bg-secondary p-5">
            <h2 className="font-display text-xl font-bold">Top products</h2>
            {analytics.topProducts.length === 0 ? (
              <p className="mt-4 text-sm text-text-secondary">
                No paid sales yet.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-line">
                {analytics.topProducts.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-start justify-between gap-3 py-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-text-primary">{p.title}</p>
                      <p className="text-text-muted">{p.units} units</p>
                    </div>
                    <p className="shrink-0 font-semibold tabular-nums">
                      {formatINR(p.revenue)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-line bg-bg-secondary p-5">
            <h2 className="font-display text-xl font-bold">Order status</h2>
            <ul className="mt-4 space-y-2">
              {Object.entries(analytics.statusBreakdown).map(([status, n]) => (
                <li
                  key={status}
                  className="flex items-center justify-between rounded-xl border border-line bg-bg-tertiary px-3 py-2 text-sm"
                >
                  <span className="font-medium">{status}</span>
                  <span className="tabular-nums text-text-secondary">{n}</span>
                </li>
              ))}
              {Object.keys(analytics.statusBreakdown).length === 0 ? (
                <p className="text-sm text-text-secondary">No orders yet.</p>
              ) : null}
            </ul>
          </section>
        </div>

        <section className="overflow-hidden rounded-2xl border border-line bg-bg-secondary">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-display text-xl font-bold">Recent orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-bg-tertiary text-[11px] uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Products</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {analytics.recentOrders.map((order) => (
                  <tr key={order.orderId}>
                    <td className="px-4 py-3 font-mono text-xs">
                      {order.orderId}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-xs text-text-muted">
                        {order.customerEmail}
                      </p>
                    </td>
                    <td className="max-w-[14rem] px-4 py-3 text-text-secondary">
                      {order.productTitles.join(", ")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          order.status === "PAID"
                            ? "bg-success/15 text-success"
                            : "bg-white/5 text-text-secondary"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatINR(order.amount)}
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {new Date(order.createdAt).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
                {analytics.recentOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-text-secondary"
                    >
                      No orders yet — sales will show up here.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
