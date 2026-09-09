import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { TrustBar } from "@/components/TrustBar";
import { FeaturedBundles } from "@/components/FeaturedBundles";
import { Tools } from "@/components/Tools";
import { ProductGrid } from "@/components/ProductGrid";
import { Comparison } from "@/components/Comparison";
import { HowItWorks } from "@/components/HowItWorks";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";
import { EmailCapture } from "@/components/EmailCapture";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { PurchaseToast } from "@/components/PurchaseToast";
import { SUPPORT_WHATSAPP } from "@/data/contact";
import { listProducts } from "@/lib/products-db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await listProducts();

  return (
    <div id="top" className="flex min-h-full flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Marquee />
        <TrustBar />
        <FeaturedBundles products={products} />
        <Tools />
        <ProductGrid products={products} />
        <Comparison />
        <HowItWorks />
        <Testimonials />
        <FAQ />
        <WhatsAppCTA />
        <EmailCapture />
      </main>
      <Footer />
      <CartDrawer />
      <PurchaseToast />

      <a
        href={`${SUPPORT_WHATSAPP}?text=${encodeURIComponent("Hi CreatorDrop — I have a question")}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-20 inline-flex items-center gap-2 rounded-full bg-whatsapp px-4 py-3 text-sm font-extrabold text-[#052e16] shadow-[0_10px_30px_rgba(37,211,102,0.35)] transition hover:scale-[1.03]"
      >
        <span className="hidden sm:inline">Still in doubt?</span> Chat on
        WhatsApp
      </a>
    </div>
  );
}
