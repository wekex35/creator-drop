"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getDeliveryUrl } from "@/data/delivery";
import { getProduct } from "@/data/products";
import { formatINR } from "@/lib/money";
import { loadPendingOrder, type PendingOrder } from "@/lib/orders";
import { friendlyPaymentError } from "@/lib/payment-errors";

type DeliveryLink = {
  id: string;
  title: string;
  deliveryUrl: string;
};

type VerifyData = {
  orderId: string;
  orderStatus: string;
  orderAmount: number;
  orderCurrency: string;
  orderNote?: string;
  productIds: string[];
  deliveries?: DeliveryLink[];
  downloadsEnabled?: boolean;
  testMode?: boolean;
};

export function PaymentStatusView() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") ?? "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<VerifyData | null>(null);
  const [pending, setPending] = useState<PendingOrder | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError("Missing order ID.");
      return;
    }

    setPending(loadPendingOrder(orderId));

    let cancelled = false;

    async function verify() {
      try {
        const response = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        const payload = (await response.json()) as {
          success: boolean;
          error?: string;
          data?: VerifyData;
        };

        if (cancelled) return;

        if (!payload.success || !payload.data) {
          throw new Error(payload.error || "Could not verify payment");
        }

        setData(payload.data);
      } catch (err) {
        if (!cancelled) {
          setError(friendlyPaymentError(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void verify();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const productIds = data?.productIds?.length
    ? data.productIds
    : (pending?.productIds ?? []);
  const paid = data?.orderStatus === "PAID";
  const testMode = data?.testMode === true || data?.downloadsEnabled === false;
  const downloadsEnabled = !testMode;

  return (
    <div className="section-pad pb-20 pt-6 md:pt-10">
      <div className="section-inner mx-auto max-w-2xl">
        {loading ? (
          <div className="rounded-3xl border border-line bg-bg-secondary px-6 py-16 text-center">
            <p className="font-display text-2xl font-bold">
              Confirming payment…
            </p>
            <p className="mt-2 text-text-secondary">
              Hang tight while we verify your Cashfree order.
            </p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-line bg-bg-secondary px-6 py-16 text-center">
            <p className="font-display text-2xl font-bold">Payment check failed</p>
            <p className="mt-2 text-text-secondary">{error}</p>
            <Link href="/cart" className="btn-primary mt-8 inline-flex">
              Back to cart
            </Link>
          </div>
        ) : (
          <div className="rounded-3xl border border-line bg-bg-secondary px-6 py-10 md:px-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
              Order {data?.orderId}
            </p>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              {paid ? "Payment successful" : `Status: ${data?.orderStatus}`}
            </h1>
            <p className="mt-3 text-text-secondary">
              {paid
                ? downloadsEnabled
                  ? "Your digital packs are unlocked. Download links are below."
                  : "Payment verified in test mode. Downloads stay locked until live Cashfree credentials are enabled."
                : "If you completed payment just now, refresh in a few seconds."}
            </p>

            {paid && testMode ? (
              <div className="mt-6 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-4 text-sm leading-relaxed text-text-secondary">
                <p className="font-semibold text-accent-soft">
                  Test checkout — downloads disabled
                </p>
                <p className="mt-1">
                  This store is still using Cashfree sandbox / TEST credentials.
                  Test users can&apos;t download pack PDFs. Switch to production
                  Cashfree keys to unlock real delivery links.
                </p>
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-between border-y border-line py-4">
              <span className="text-text-secondary">Amount</span>
              <span className="font-display text-2xl font-bold tabular-nums">
                {formatINR(Number(data?.orderAmount ?? pending?.amount ?? 0))}
              </span>
            </div>

            {paid && productIds.length > 0 ? (
              <ul className="mt-8 space-y-4">
                {productIds.map((id) => {
                  const product = getProduct(id);
                  const fromApi = data?.deliveries?.find((d) => d.id === id);
                  const title =
                    fromApi?.title ??
                    product?.title ??
                    pending?.titles.find(
                      (_, i) => pending.productIds[i] === id,
                    ) ??
                    id;
                  const href =
                    downloadsEnabled && fromApi?.deliveryUrl
                      ? fromApi.deliveryUrl
                      : downloadsEnabled
                        ? getDeliveryUrl(id)
                        : "";

                  return (
                    <li
                      key={id}
                      className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <p className="text-sm font-semibold leading-snug">{title}</p>
                      {downloadsEnabled && href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-primary shrink-0 text-center text-sm"
                        >
                          Open download
                        </a>
                      ) : (
                        <span className="inline-flex shrink-0 items-center justify-center rounded-full border border-line bg-bg-tertiary px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-text-muted">
                          Test user · can&apos;t download
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/#shop" className="btn-primary">
                Keep shopping
              </Link>
              {!paid ? (
                <Link href="/cart" className="btn-ghost">
                  Back to cart
                </Link>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
