"use client";

import { useEffect, useState } from "react";
import {
  loadCheckoutCustomer,
  saveCheckoutCustomer,
  type CheckoutCustomer,
} from "@/lib/orders";

type Props = {
  value?: CheckoutCustomer;
  onChange: (customer: CheckoutCustomer) => void;
};

export function CustomerFields({ value, onChange }: Props) {
  const [customer, setCustomer] = useState<CheckoutCustomer>(
    value ?? { name: "", email: "", phone: "" },
  );

  useEffect(() => {
    const stored = loadCheckoutCustomer();
    setCustomer(stored);
    onChange(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once
  }, []);

  function update<K extends keyof CheckoutCustomer>(
    key: K,
    next: CheckoutCustomer[K],
  ) {
    const updated = { ...customer, [key]: next };
    setCustomer(updated);
    saveCheckoutCustomer(updated);
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
        Delivery details
      </p>
      <label className="block">
        <span className="sr-only">Full name</span>
        <input
          type="text"
          name="name"
          autoComplete="name"
          placeholder="Full name"
          value={customer.name}
          onChange={(e) => update("name", e.target.value)}
          className="w-full rounded-xl border border-line bg-bg-tertiary px-3 py-2.5 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent"
        />
      </label>
      <label className="block">
        <span className="sr-only">Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Email for download link"
          value={customer.email}
          onChange={(e) => update("email", e.target.value)}
          className="w-full rounded-xl border border-line bg-bg-tertiary px-3 py-2.5 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent"
        />
      </label>
      <label className="block">
        <span className="sr-only">Phone</span>
        <input
          type="tel"
          name="phone"
          autoComplete="tel"
          placeholder="10-digit phone"
          value={customer.phone}
          onChange={(e) => update("phone", e.target.value)}
          className="w-full rounded-xl border border-line bg-bg-tertiary px-3 py-2.5 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent"
        />
      </label>
    </div>
  );
}
