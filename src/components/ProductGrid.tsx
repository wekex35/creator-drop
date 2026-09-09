"use client";

import { useMemo, useState } from "react";
import {
  categoryLabels,
  type Product,
  type ProductCategory,
} from "@/data/products";
import { ProductCard } from "@/components/ProductCard";

const filters: ProductCategory[] = [
  "all",
  "templates",
  "ebooks",
  "presets",
  "audits",
];

export function ProductGrid({ products }: { products: Product[] }) {
  const [active, setActive] = useState<ProductCategory>("all");

  const filtered = useMemo(() => {
    if (active === "all") return products;
    return products.filter((p) => p.category === active);
  }, [active, products]);

  return (
    <section id="shop" className="section-pad scroll-mt-20 py-20 md:py-28">
      <div className="section-inner">
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-accent">
          The Toolkit
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl font-extrabold tracking-tight md:text-5xl">
          Explore Digital Products
        </h2>
        <p className="mt-4 max-w-xl text-text-secondary">
          Instantly download professional assets designed to elevate your social
          channels.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActive(filter)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                active === filter
                  ? "bg-[linear-gradient(135deg,#FF7A00_0%,#FF3500_100%)] text-white shadow-[0_0_20px_rgba(255,122,0,0.25)]"
                  : "border border-line text-text-secondary hover:text-text-primary"
              }`}
            >
              {categoryLabels[filter]}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
