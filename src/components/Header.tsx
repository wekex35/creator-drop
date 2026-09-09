"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

const links = [
  { href: "/", label: "Home" },
  { href: "/#shop", label: "Shop" },
  { href: "/#faq", label: "Contact" },
];

export function Header() {
  const { count } = useCart();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const onCartPage = pathname === "/cart";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 transition ${
        scrolled || onCartPage
          ? "border-b border-line bg-bg-primary/90 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="section-pad py-3 md:py-4">
        <div className="section-inner">
          <div className="flex h-14 items-center justify-between gap-4 rounded-full border border-white/10 bg-bg-secondary/70 px-4 backdrop-blur-md sm:h-16 sm:px-6">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[linear-gradient(135deg,#FF7A00_0%,#FF3500_100%)] font-display text-xs font-extrabold text-white">
                CD
              </span>
              <span className="font-display text-lg font-bold tracking-tight sm:text-xl">
                Creator<span className="text-accent">Drop</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-8 md:flex">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-text-secondary transition hover:text-text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/cart"
                className="relative grid h-10 w-10 place-items-center rounded-full border border-white/15 text-text-primary transition hover:border-accent/50"
                aria-label="Your cart"
              >
                <CartIcon />
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-extrabold text-white">
                  {count}
                </span>
              </Link>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-text-primary md:hidden"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                {menuOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>

          {menuOpen && (
            <nav className="mt-2 flex flex-col gap-1 rounded-2xl border border-line bg-bg-secondary p-2 md:hidden">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-medium text-text-secondary hover:bg-white/[0.03] hover:text-text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}

function CartIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
      <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 8H7" />
    </svg>
  );
}
