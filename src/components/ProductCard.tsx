"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/data/products";
import { formatINR } from "@/lib/money";

export { formatINR };

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-bg-secondary transition duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_0_30px_rgba(255,122,0,0.12)]">
      <Link
        href={`/products/${product.id}`}
        className="relative aspect-[4/3] overflow-hidden bg-bg-tertiary"
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full place-items-center text-xs text-text-muted">
            No cover
          </div>
        )}
        <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur">
          {product.badge}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <span className="text-gold">★★★★★</span>
          <span>{product.rating}</span>
        </div>
        <Link href={`/products/${product.id}`}>
          <h3 className="font-display text-lg font-bold leading-snug text-text-primary transition hover:text-accent">
            {product.title}
          </h3>
        </Link>
        <p className="line-clamp-2 text-sm leading-relaxed text-text-secondary">
          {product.tagline}
        </p>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-2">
          <div>
            <p className="font-display text-xl font-bold text-text-primary">
              {formatINR(product.price)}
            </p>
            <p className="text-xs text-text-muted line-through">
              {formatINR(product.compareAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => addItem(product)}
              className="rounded-full border border-line px-3 py-2 text-xs font-bold uppercase tracking-wide text-text-primary transition hover:border-white/25"
            >
              Add to Cart
            </button>
            <Link
              href={`/products/${product.id}`}
              className="rounded-full bg-[linear-gradient(135deg,#FF7A00_0%,#FF3500_100%)] px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-white transition hover:brightness-110"
            >
              Buy Now
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
