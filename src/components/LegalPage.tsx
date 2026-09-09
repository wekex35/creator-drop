import Link from "next/link";
import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";

type LegalPageProps = {
  title: string;
  updated?: string;
  children: ReactNode;
};

export function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <div className="flex min-h-full flex-col bg-bg-primary">
      <Header />
      <main className="flex-1">
        <article className="section-pad py-12 md:py-16">
          <div className="section-inner max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">
              <Link href="/" className="hover:text-accent">
                Home
              </Link>
              <span className="mx-2 text-text-muted/60">/</span>
              Legal
            </p>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
              {title}
            </h1>
            {updated ? (
              <p className="mt-3 text-sm text-text-secondary">
                Last updated: {updated}
              </p>
            ) : null}
            <div className="legal-prose mt-10 space-y-8 text-sm leading-relaxed text-text-secondary md:text-[15px]">
              {children}
            </div>
          </div>
        </article>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl font-bold text-text-primary md:text-2xl">
        {title}
      </h2>
      {children}
    </section>
  );
}
