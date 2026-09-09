import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductDetail } from "@/components/ProductDetail";
import { SITE_NAME, SITE_URL, SUPPORT_EMAIL } from "@/data/contact";
import { products as seedProducts, type Product } from "@/data/products";
import { formatINR } from "@/lib/money";
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

function productPath(id: string) {
  return `/products/${id}`;
}

function productDescription(product: Product) {
  const base = product.tagline?.trim() || product.headline?.trim() || "";
  const priceBit = `Buy for ${formatINR(product.price)} on ${SITE_NAME}.`;
  const text = base ? `${base} ${priceBit}` : priceBit;
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
}

function productJsonLd(product: Product) {
  const url = `${SITE_URL}${productPath(product.id)}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.tagline || product.headline,
    image: product.image ? [product.image] : undefined,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    category: product.badge,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price: product.price.toFixed(2),
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        email: SUPPORT_EMAIL,
      },
    },
    aggregateRating:
      product.reviews > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviews,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  };
}

export function generateStaticParams() {
  return seedProducts.map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product =
    (await getProductById(id)) ?? seedProducts.find((p) => p.id === id);

  if (!product) {
    return {
      title: `Pack not found – ${SITE_NAME}`,
      robots: { index: false, follow: false },
    };
  }

  const title = `${product.title} – ${SITE_NAME}`;
  const description = productDescription(product);
  const url = productPath(product.id);
  const images = product.image
    ? [
        {
          url: product.image,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    keywords: [
      product.title,
      product.badge,
      "Instagram Reels",
      "reel bundle",
      SITE_NAME,
      "digital download",
    ].filter(Boolean),
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: SITE_NAME,
      locale: "en_IN",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.image ? [product.image] : undefined,
    },
    other: {
      "product:price:amount": String(product.price),
      "product:price:currency": "INR",
    },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(product)),
        }}
      />
      {showHeader ? <Header /> : null}
      <main className="flex-1">
        <ProductDetail product={product} bare={bare} />
      </main>
      {showFooter ? <Footer /> : null}
      <CartDrawer />
    </div>
  );
}
