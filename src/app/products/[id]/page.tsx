import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductDetail } from "@/components/ProductDetail";
import { products as seedProducts } from "@/data/products";
import { getProductById } from "@/lib/products-db";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function flagOn(value: string | string[] | undefined) {
  const v = Array.isArray(value) ? value[0] : value;
  return v === "1" || v === "true" || v === "yes";
}

function flagOff(value: string | string[] | undefined) {
  const v = Array.isArray(value) ? value[0] : value;
  return v === "0" || v === "false" || v === "no" || v === "hide";
}

export function generateStaticParams() {
  return seedProducts.map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = (await getProductById(id)) ?? seedProducts.find((p) => p.id === id);
  if (!product) return { title: "Pack not found – CreatorDrop" };
  return {
    title: `${product.title} – CreatorDrop`,
    description: product.headline,
  };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = await searchParams;
  const product = await getProductById(id);
  if (!product) notFound();

  const bare =
    flagOn(query.bare) || flagOn(query.embed) || flagOff(query.chrome);
  const showHeader = !bare && !flagOff(query.header);
  const showFooter = !bare && !flagOff(query.footer);

  return (
    <div className="flex min-h-full flex-col bg-bg-primary">
      {showHeader ? <Header /> : null}
      <main className="flex-1">
        <ProductDetail product={product} bare={bare} />
      </main>
      {showFooter ? <Footer /> : null}
      <CartDrawer />
    </div>
  );
}
