import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/data/products";

export function FeaturedBundles({ products }: { products: Product[] }) {
  const featured = products.filter((p) => p.featured).slice(0, 9);

  return (
    <section className="section-pad py-20 md:py-28">
      <div className="section-inner">
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-accent">
          🔥 Best Sellers
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl font-extrabold tracking-tight md:text-5xl">
          Featured Creator Bundles
        </h2>
        <p className="mt-4 max-w-xl text-text-secondary">
          Ready-to-post packs engineered for reach — skip the blank canvas and
          ship content that converts.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
