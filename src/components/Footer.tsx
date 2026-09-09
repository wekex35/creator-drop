import Link from "next/link";
import {
  SITE_NAME,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SUPPORT_WHATSAPP,
} from "@/data/contact";

export function Footer() {
  return (
    <footer className="border-t border-line bg-bg-primary">
      <div className="section-pad py-14">
        <div className="section-inner grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl font-extrabold">
              Creator<span className="text-accent">Drop</span>
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-secondary">
              Premium digital assets for modern creators to build, scale, and
              dominate.
            </p>
            <a
              href={SUPPORT_WHATSAPP}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex text-sm font-bold text-accent hover:text-accent-soft"
            >
              WhatsApp →
            </a>
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">
              Products
            </p>
            <ul className="mt-4 space-y-2 text-sm text-text-secondary">
              <li>
                <a href="/#shop" className="hover:text-text-primary">
                  All Templates
                </a>
              </li>
              <li>
                <a href="/#shop" className="hover:text-text-primary">
                  Canva Packs
                </a>
              </li>
              <li>
                <a href="/#shop" className="hover:text-text-primary">
                  Lightroom Presets
                </a>
              </li>
              <li>
                <a href="/#shop" className="hover:text-text-primary">
                  Bundles
                </a>
              </li>
              <li>
                <a href="/#shop" className="hover:text-text-primary">
                  Notion Templates
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">
              Company
            </p>
            <ul className="mt-4 space-y-2 text-sm text-text-secondary">
              <li>
                <Link href="/" className="hover:text-text-primary">
                  Home
                </Link>
              </li>
              <li>
                <a href="/#reviews" className="hover:text-text-primary">
                  Reviews
                </a>
              </li>
              <li>
                <a href="/#faq" className="hover:text-text-primary">
                  FAQs
                </a>
              </li>
              <li>
                <a href="/#shop" className="hover:text-text-primary">
                  Shop
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">
              Support
            </p>
            <ul className="mt-4 space-y-2 text-sm text-text-secondary">
              <li>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="hover:text-text-primary"
                >
                  {SUPPORT_EMAIL}
                </a>
              </li>
              <li>{SUPPORT_PHONE}</li>
              <li>
                <Link href="/refund-policy" className="hover:text-text-primary">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-text-primary"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="hover:text-text-primary"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="section-inner mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {SITE_NAME} · All rights reserved.</p>
          <p>Secure Checkout · Instant Delivery · PCI Compliant · 10,000+ Creators</p>
        </div>
      </div>
    </footer>
  );
}
