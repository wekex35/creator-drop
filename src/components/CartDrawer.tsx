"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useCashfreeCheckout } from "@/hooks/useCashfreeCheckout";
import { formatINR } from "@/lib/money";
import {
  isValidCustomer,
  loadCheckoutCustomer,
  type CheckoutCustomer,
} from "@/lib/orders";

export function CartDrawer() {
  const router = useRouter();
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    setQuantity,
    total,
    clearCart,
  } = useCart();
  const { ready, loading, error, startCheckout } = useCashfreeCheckout();
  const [localError, setLocalError] = useState("");

  async function handleCheckout() {
    setLocalError("");
    const customer: CheckoutCustomer = loadCheckoutCustomer();

    if (!isValidCustomer(customer)) {
      setLocalError("Add your name, email, and phone on the cart page first.");
      closeCart();
      router.push("/cart");
      return;
    }

    const result = await startCheckout(items, customer);
    if (!result) return;

    if (result.paid) clearCart();
    closeCart();
    router.push(`/payment/status?order_id=${encodeURIComponent(result.orderId)}`);
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden={!isOpen}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-line bg-bg-secondary transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-xl font-bold">Item added</h2>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full border border-line px-3 py-1 text-sm text-text-secondary hover:text-text-primary"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="text-sm text-text-secondary">
              Your cart is empty. Grab a bundle and start posting.
            </p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 border-b border-line pb-4"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-bg-tertiary">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                      unoptimized={/^https?:\/\//i.test(item.image)}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {formatINR(item.price)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="inline-flex items-center rounded-full border border-white/15">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(item.id, item.quantity - 1)
                          }
                          className="grid h-7 w-7 place-items-center text-sm"
                          aria-label="Decrease"
                        >
                          −
                        </button>
                        <span className="min-w-5 text-center text-xs font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(item.id, item.quantity + 1)
                          }
                          className="grid h-7 w-7 place-items-center text-sm"
                          aria-label="Increase"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-[11px] uppercase tracking-wide text-gold hover:text-accent"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-line px-5 py-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-text-secondary">Subtotal</span>
            <span className="font-display text-2xl font-bold">
              {formatINR(total)}
            </span>
          </div>
          {(error || localError) && (
            <div
              className="mb-3 rounded-xl border border-accent/30 bg-accent/10 px-3 py-3 text-sm leading-relaxed text-accent-soft"
              role="alert"
            >
              {localError || error}
            </div>
          )}
          <Link
            href="/cart"
            onClick={closeCart}
            className="btn-primary w-full"
          >
            View cart
          </Link>
          <button
            type="button"
            disabled={items.length === 0 || loading || !ready}
            onClick={() => void handleCheckout()}
            className="btn-ghost mt-2 w-full disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Opening Cashfree…" : "Check out"}
          </button>
        </div>
      </aside>
    </>
  );
}
