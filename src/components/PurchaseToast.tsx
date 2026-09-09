"use client";

import { useEffect, useState } from "react";
import { purchaseToasts, products } from "@/data/products";

export function PurchaseToast() {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    const show = () => {
      setIndex((i) => (i + 1) % purchaseToasts.length);
      setVisible(true);
      hideTimer = setTimeout(() => setVisible(false), 4200);
    };

    const start = setTimeout(show, 2800);
    const interval = setInterval(show, 14000);

    return () => {
      clearTimeout(start);
      clearInterval(interval);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  const person = purchaseToasts[index];
  const product = products[index % Math.min(products.length, 7)];

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-24 left-4 z-30 max-w-xs animate-[toast-in_0.35s_ease] rounded-2xl border border-line bg-bg-secondary/95 p-3 shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-md sm:left-6"
      role="status"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#FF7A00_0%,#FF3500_100%)] text-sm font-extrabold text-white">
          {person.name.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary">
            {person.name}{" "}
            <span className="font-normal text-text-secondary">
              from {person.city} just purchased
            </span>
          </p>
          <p className="mt-0.5 truncate text-xs text-accent">{product.title}</p>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="text-text-muted hover:text-text-primary"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
