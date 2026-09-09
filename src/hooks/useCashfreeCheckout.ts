"use client";

import { useCallback, useEffect, useState } from "react";
import type { CartItem } from "@/context/CartContext";
import {
  isValidCustomer,
  savePendingOrder,
  type CheckoutCustomer,
} from "@/lib/orders";

type CashfreeCheckout = {
  checkout: (options: {
    paymentSessionId: string;
    redirectTarget?: "_self" | "_blank" | "_modal";
  }) => Promise<{
    error?: { message?: string };
    paymentDetails?: unknown;
  }>;
};

type CheckoutResult = {
  orderId: string;
  paid: boolean;
  message: string;
};

export function useCashfreeCheckout() {
  const [cashfree, setCashfree] = useState<CashfreeCheckout | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const { load } = await import("@cashfreepayments/cashfree-js");
        const mode =
          process.env.NEXT_PUBLIC_CASHFREE_MODE === "production"
            ? "production"
            : "sandbox";
        const instance = await load({ mode });
        if (!cancelled) setCashfree(instance as CashfreeCheckout);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Payment gateway failed to load. Refresh and try again.");
        }
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  const startCheckout = useCallback(
    async (
      items: CartItem[],
      customer: CheckoutCustomer,
    ): Promise<CheckoutResult | null> => {
      setError("");

      if (items.length === 0) {
        setError("Your cart is empty.");
        return null;
      }

      if (!isValidCustomer(customer)) {
        setError("Enter a valid name, email, and 10-digit phone number.");
        return null;
      }

      if (!cashfree) {
        setError("Payment gateway is still loading. Try again in a moment.");
        return null;
      }

      setLoading(true);

      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((item) => ({
              id: item.id,
              quantity: item.quantity,
            })),
            customer,
          }),
        });

        const payload = (await response.json()) as {
          success: boolean;
          error?: string;
          data?: {
            orderId: string;
            paymentSessionId: string;
            orderAmount: number;
            items: Array<{ id: string; title: string }>;
          };
        };

        if (!payload.success || !payload.data?.paymentSessionId) {
          throw new Error(payload.error || "Failed to create payment order");
        }

        const { orderId, paymentSessionId, orderAmount, items: lineItems } =
          payload.data;

        savePendingOrder({
          orderId,
          productIds: lineItems.map((item) => item.id),
          titles: lineItems.map((item) => item.title),
          amount: orderAmount,
          createdAt: Date.now(),
        });

        const result = await cashfree.checkout({
          paymentSessionId,
          redirectTarget: "_modal",
        });

        if (result.error) {
          throw new Error(result.error.message || "Checkout was cancelled");
        }

        const verifyResponse = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });

        const verifyPayload = (await verifyResponse.json()) as {
          success: boolean;
          error?: string;
          data?: { orderStatus?: string };
        };

        if (!verifyPayload.success) {
          throw new Error(verifyPayload.error || "Could not verify payment");
        }

        const paid = verifyPayload.data?.orderStatus === "PAID";
        return {
          orderId,
          paid,
          message: paid
            ? "Payment successful"
            : `Payment status: ${verifyPayload.data?.orderStatus ?? "UNKNOWN"}`,
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Checkout failed. Try again.";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [cashfree],
  );

  return {
    ready: Boolean(cashfree),
    loading,
    error,
    setError,
    startCheckout,
  };
}
