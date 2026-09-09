import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CartPageView } from "@/components/CartPageView";

export const metadata: Metadata = {
  title: "Your cart – CreatorDrop",
  description: "Review your CreatorDrop digital packs before checkout.",
};

export default function CartPage() {
  return (
    <div className="flex min-h-full flex-col bg-bg-primary">
      <Header />
      <main className="flex-1">
        <CartPageView />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
