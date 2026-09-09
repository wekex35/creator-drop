import type { Metadata } from "next";
import { Suspense } from "react";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PaymentStatusView } from "@/components/PaymentStatusView";

export const metadata: Metadata = {
  title: "Payment status – CreatorDrop",
  description: "Confirm your CreatorDrop purchase and access downloads.",
};

export default function PaymentStatusPage() {
  return (
    <div className="flex min-h-full flex-col bg-bg-primary">
      <Header />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="section-pad py-20 text-center text-text-secondary">
              Loading payment status…
            </div>
          }
        >
          <PaymentStatusView />
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
