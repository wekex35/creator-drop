"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CustomerFields } from "@/components/CustomerFields";
import { useCart } from "@/context/CartContext";
import { useCashfreeCheckout } from "@/hooks/useCashfreeCheckout";
import { formatINR } from "@/lib/money";
import type { CheckoutCustomer } from "@/lib/orders";

export function CartPageView() {
  const router = useRouter();
  const { items, total, setQuantity, removeItem, clearCart, count } =
    useCart();
  const { ready, loading, error, startCheckout } = useCashfreeCheckout();
  const [customer, setCustomer] = useState<CheckoutCustomer>({
    name: "",
    email: "",
    phone: "",
  });

  async function handleCheckout() {
    const result = await startCheckout(items, customer);
    if (!result) return;

    if (result.paid) {
      clearCart();
      router.push(`/payment/status?order_id=${encodeURIComponent(result.orderId)}`);
      return;
    }

    router.push(`/payment/status?order_id=${encodeURIComponent(result.orderId)}`);
  }

  return (
    <div className="section-pad pb-20 pt-6 md:pt-10">
      <div className="section-inner">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">
            Your cart
          </h1>
          <Link
            href="/#shop"
            className="text-sm font-semibold text-gold transition hover:text-accent"
          >
            Continue shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="mt-16 rounded-3xl border border-line bg-bg-secondary px-6 py-16 text-center">
            <p className="font-display text-2xl font-bold">Your cart is empty</p>
            <p className="mt-2 text-text-secondary">
              Grab a CreatorDrop bundle and start posting.
            </p>
            <Link href="/#shop" className="btn-primary mt-8 inline-flex">
              Browse Collection
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-10 hidden grid-cols-[1fr_180px_140px] gap-4 border-b border-line pb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted md:grid">
              <span>Product</span>
              <span className="text-center">Quantity</span>
              <span className="text-right">Total</span>
            </div>

            <ul className="divide-y divide-line">
              {items.map((item) => {
                const lineTotal = item.price * item.quantity;
                return (
                  <li
                    key={item.id}
                    className="grid gap-5 py-6 md:grid-cols-[1fr_180px_140px] md:items-center md:gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-line bg-bg-tertiary sm:h-28 sm:w-28">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="112px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 pt-1">
                        <p className="font-display text-base font-bold leading-snug text-text-primary sm:text-lg">
                          {item.title}
                        </p>
                        <p className="mt-2 text-sm text-text-secondary">
                          {formatINR(item.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 md:justify-center">
                      <div className="inline-flex items-center rounded-full border border-white/15 bg-bg-secondary">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() =>
                            setQuantity(item.id, item.quantity - 1)
                          }
                          className="grid h-10 w-10 place-items-center text-lg text-text-secondary transition hover:text-text-primary"
                        >
                          −
                        </button>
                        <span className="min-w-8 text-center text-sm font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() =>
                            setQuantity(item.id, item.quantity + 1)
                          }
                          className="grid h-10 w-10 place-items-center text-lg text-text-secondary transition hover:text-text-primary"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        aria-label="Remove item"
                        onClick={() => removeItem(item.id)}
                        className="grid h-10 w-10 place-items-center text-gold transition hover:text-accent"
                      >
                        <TrashIcon />
                      </button>
                    </div>

                    <p className="text-left text-base font-semibold tabular-nums text-text-primary md:text-right">
                      {formatINR(lineTotal)}
                    </p>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 flex flex-col gap-6 border-t border-line pt-8 md:flex-row md:items-start md:justify-between">
              <p className="text-sm text-text-secondary">
                {count} item{count === 1 ? "" : "s"} · Instant digital delivery
                after checkout
              </p>

              <div className="w-full max-w-sm space-y-5 rounded-2xl border border-line bg-bg-secondary p-5">
                <CustomerFields onChange={setCustomer} />

                <div className="flex items-center justify-between gap-4 border-t border-line pt-4">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="font-display text-2xl font-bold tabular-nums">
                    {formatINR(total)}
                  </span>
                </div>
                <p className="text-xs text-text-muted">
                  Secure checkout powered by Cashfree. Downloads unlock after
                  payment.
                </p>
                {error ? (
                  <p className="text-sm text-accent-soft" role="alert">
                    {error}
                  </p>
                ) : null}
                <button
                  type="button"
                  disabled={loading || !ready}
                  onClick={() => void handleCheckout()}
                  className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Opening Cashfree…"
                    : ready
                      ? "Pay with Cashfree"
                      : "Loading payments…"}
                </button>
                <Link
                  href="/#shop"
                  className="mt-1 block text-center text-sm font-semibold text-gold hover:text-accent"
                >
                  Continue shopping
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}
