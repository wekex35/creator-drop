"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CustomerFields } from "@/components/CustomerFields";
import { useCart } from "@/context/CartContext";
import { discountPercent, type Product } from "@/data/products";
import { useCashfreeCheckout } from "@/hooks/useCashfreeCheckout";
import { formatINR } from "@/lib/money";
import type { CheckoutCustomer } from "@/lib/orders";
import { extractPinId, pinEmbedSrc } from "@/lib/sample-media";

const OFFER_MS = 18 * 60 * 1000 + 46 * 1000;

const RECENT_BUYERS = [
  { name: "Rajan", avatar: "https://i.pravatar.cc/80?img=12" },
  { name: "Sahil", avatar: "https://i.pravatar.cc/80?img=33" },
  { name: "Vicky", avatar: "https://i.pravatar.cc/80?img=52" },
  { name: "Kamal", avatar: "https://i.pravatar.cc/80?img=15" },
  { name: "Kajol", avatar: "https://i.pravatar.cc/80?img=47" },
  { name: "Aman", avatar: "https://i.pravatar.cc/80?img=68" },
  { name: "Priya", avatar: "https://i.pravatar.cc/80?img=5" },
  { name: "Nikki", avatar: "https://i.pravatar.cc/80?img=9" },
  { name: "Ravi", avatar: "https://i.pravatar.cc/80?img=60" },
  { name: "Ved", avatar: "https://i.pravatar.cc/80?img=70" },
  { name: "Neha", avatar: "https://i.pravatar.cc/80?img=32" },
  { name: "Arjun", avatar: "https://i.pravatar.cc/80?img=11" },
];

const AUDIENCE = [
  "Content creators",
  "Faceless page admins",
  "Social media managers",
  "Students",
  "Freelancers",
  "Digital marketers",
];

const EXTRA_PROOF = [
  {
    name: "Priya Verma",
    place: "Jaipur · Social Media Manager",
    quote:
      "Mere faceless page ke liye perfect. Content ready hai — music + caption add karke post. Audience ruk ke dekhti hai.",
  },
  {
    name: "Harsh",
    place: "Mumbai · Student",
    quote:
      "Expected nahi tha itna useful hoga. Content ideas dhundhne ka tension almost khatam.",
  },
];

const MINI_FAQ = [
  {
    q: "How do I get access?",
    a: "Right after payment you get an instant Google Drive link on the thank-you screen and in your email. Lifetime access.",
  },
  {
    q: "Is this a one-time payment?",
    a: "Yes. Pay once, keep forever — including future updates to this pack. No subscription.",
  },
  {
    q: "Can I post on Instagram / YouTube / TikTok?",
    a: "Yes. Files are unbranded. Add your logo, captions, and music before uploading for best results.",
  },
];

function useOfferCountdown(productId: string) {
  const [remaining, setRemaining] = useState(OFFER_MS);

  useEffect(() => {
    const key = `creatordrop-offer-${productId}`;
    let end = Number(sessionStorage.getItem(key));
    if (!end || Number.isNaN(end) || end < Date.now()) {
      end = Date.now() + OFFER_MS;
      sessionStorage.setItem(key, String(end));
    }

    const tick = () => {
      const left = Math.max(0, end - Date.now());
      setRemaining(left);
      if (left === 0) {
        end = Date.now() + OFFER_MS;
        sessionStorage.setItem(key, String(end));
        setRemaining(OFFER_MS);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [productId]);

  const totalSec = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { hours, minutes, seconds };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function stableInt(seed: string, min: number, max: number) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return min + (hash % (max - min + 1));
}

const INCLUDE_ICONS = [
  "/includes/reels.png",
  "/includes/clean.png",
  "/includes/growth.png",
  "/includes/delivery.png",
  "/includes/lifetime.png",
  "/includes/commercial.png",
] as const;

function includeIcon(item: string, index: number) {
  const t = item.toLowerCase();
  if (/commercial|client|pages &/.test(t)) return INCLUDE_ICONS[5];
  if (/lifetime|update|forever/.test(t)) return INCLUDE_ICONS[4];
  if (/drive|download|instant|access|delivery/.test(t)) return INCLUDE_ICONS[3];
  if (
    /authority|education|growth|niche|page|platform|shorts|instagram|tiktok|format|hook|retention|adrenaline|moral|story|spiritual|faith|travel|aesthetic|calm|mood|capcut/.test(
      t,
    )
  ) {
    return INCLUDE_ICONS[2];
  }
  if (
    /watermark|unbranded|caption|hd|ready|clean|logo|brand/.test(t)
  ) {
    return INCLUDE_ICONS[1];
  }
  if (/reel|clip|video|animation|timelapse|collection/.test(t)) {
    return INCLUDE_ICONS[0];
  }
  return INCLUDE_ICONS[index % INCLUDE_ICONS.length];
}

export function ProductDetail({
  product,
  bare = false,
}: {
  product: Product;
  bare?: boolean;
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const { ready, loading, error, setError, startCheckout } =
    useCashfreeCheckout();
  const { hours, minutes, seconds } = useOfferCountdown(product.id);
  const off = discountPercent(product);
  const viewers = stableInt(product.id, 180, 319);
  const slots = stableInt(`${product.id}-slots`, 7, 17);
  const [buyerIndex, setBuyerIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [customer, setCustomer] = useState<CheckoutCustomer>({
    name: "",
    email: "",
    phone: "",
  });
  const paywallRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(
      () => setBuyerIndex((i) => (i + 1) % RECENT_BUYERS.length),
      2200,
    );
    return () => clearInterval(id);
  }, []);

  async function buyNow() {
    setError("");
    paywallRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

    const result = await startCheckout(
      [{ ...product, quantity: 1 }],
      customer,
    );
    if (!result) return;

    router.push(
      `/payment/status?order_id=${encodeURIComponent(result.orderId)}`,
    );
  }

  function addToCart() {
    addItem(product);
  }

  const ctaLabel = loading
    ? "Opening payment…"
    : ready
      ? `Yes! Unlock Instant Access — ${formatINR(product.price)}`
      : "Loading payments…";

  const stats = [
    { value: product.countLabel, label: "Clips" },
    { value: "HD", label: "Ready-to-post" },
    { value: "1×", label: "Payment" },
    { value: "⚡", label: "Instant" },
  ];

  return (
    <>
      <div className="border-b border-accent/40 bg-[linear-gradient(90deg,#FF7A00_0%,#FF3500_100%)] px-4 py-2.5 text-center text-sm font-extrabold text-white">
        🔥 {off}% OFF SALE ENDING SOON — GET IT FOR {formatINR(product.price)}
      </div>

      <div className="section-pad pb-20 pt-4 md:pb-20 md:pt-8">
        <div className="section-inner">
          {!bare ? (
            <Link
              href="/#shop"
              className="inline-flex text-sm font-medium text-text-secondary transition hover:text-accent"
            >
              ← Back to shop
            </Link>
          ) : null}

          <div className={`mx-auto max-w-5xl ${bare ? "mt-0" : "mt-6"}`}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-line bg-bg-secondary shadow-[0_30px_80px_-40px_rgba(255,122,0,0.45)]">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-cover"
                  unoptimized={/^https?:\/\//i.test(product.image)}
                />
              ) : (
                <div className="grid h-full place-items-center bg-bg-tertiary text-sm text-text-muted">
                  Cover coming soon
                </div>
              )}
              <div className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur">
                {product.badge}
              </div>
              {off > 0 && (
                <div className="absolute right-4 top-4 rounded-full bg-[linear-gradient(135deg,#FF7A00_0%,#FF3500_100%)] px-3 py-1 text-xs font-extrabold text-white shadow-lg">
                  {off}% OFF
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-line bg-bg-secondary px-2 py-3 text-center"
                >
                  <p className="font-display text-lg font-extrabold text-accent sm:text-xl">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted sm:text-[11px]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {RECENT_BUYERS.slice(0, 5).map((buyer, i) => {
                  const shown =
                    RECENT_BUYERS[(buyerIndex + i) % RECENT_BUYERS.length];
                  return (
                    <div
                      key={`${shown.name}-${i}`}
                      className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-bg-primary bg-bg-tertiary shadow-sm"
                      style={{ zIndex: 5 - i }}
                    >
                      <Image
                        src={shown.avatar}
                        alt={shown.name}
                        fill
                        sizes="36px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-text-secondary">
                Recently purchased by{" "}
                <span className="font-semibold text-accent">
                  {RECENT_BUYERS[buyerIndex].name}
                </span>
                <span className="text-text-muted">
                  {" "}
                  + {RECENT_BUYERS.length - 1} others today
                </span>
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-gold">★★★★★</span>
              <span className="font-semibold text-text-primary">
                Rated {product.rating}
              </span>
              <span className="text-text-muted">
                | {product.reviews.toLocaleString("en-IN")}+ reviews
              </span>
            </div>

            <h1 className="mt-3 font-display text-3xl font-extrabold leading-[1.12] tracking-tight sm:text-4xl">
              {product.title}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-text-secondary sm:text-lg">
              {product.headline}
            </p>

            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent-soft">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative h-2 w-2 rounded-full bg-accent" />
              </span>
              <strong className="text-text-primary">{viewers}</strong> people
              are looking at this right now
            </p>

            <div className="mt-6 flex flex-wrap items-end gap-3">
              <p className="font-display text-4xl font-extrabold text-text-primary">
                {formatINR(product.price)}
              </p>
              <p className="pb-1 text-lg text-text-muted line-through">
                {formatINR(product.compareAt)}
              </p>
              <span className="mb-1 rounded-full bg-success/15 px-2.5 py-1 text-xs font-bold text-success">
                Save {formatINR(product.compareAt - product.price)}
              </span>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              One-time payment · Instant Drive access · No hidden fees
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-accent/30 bg-[linear-gradient(135deg,rgba(255,122,0,0.12),rgba(5,5,13,0.9))] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-accent">
                    Join before timer ends
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    Miss it and lose the lowest price on this drop
                  </p>
                </div>
                <div className="flex items-center gap-1.5 font-display text-2xl font-extrabold tabular-nums sm:text-3xl">
                  <TimeBlock label="HRS" value={pad(hours)} />
                  <span className="text-accent">:</span>
                  <TimeBlock label="MIN" value={pad(minutes)} />
                  <span className="text-accent">:</span>
                  <TimeBlock label="SEC" value={pad(seconds)} />
                </div>
              </div>
              <p className="mt-3 text-sm font-medium text-gold">
                Only {slots} discount slots left in this window
              </p>
            </div>

            <div
              ref={paywallRef}
              id="paywall"
              className="mt-6 space-y-4 rounded-2xl border border-line bg-bg-secondary/80 p-4"
            >
              <CustomerFields onChange={setCustomer} />
              {error ? (
                <p className="text-sm text-accent-soft" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={loading || !ready}
                  onClick={() => void buyNow()}
                  className="btn-primary flex-1 py-4 text-base disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {ctaLabel}
                </button>
                <button
                  type="button"
                  onClick={addToCart}
                  className="btn-ghost px-5"
                >
                  Add to cart
                </button>
              </div>
            </div>

            <div className="relative mt-10 overflow-hidden rounded-[1.75rem] border border-accent/35 bg-[linear-gradient(155deg,#1a1208_0%,#0a0a14_45%,#12101a_100%)] px-5 py-7 sm:px-7 sm:py-8">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-accent/20 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-24 -left-10 h-40 w-40 rounded-full bg-accent-deep/25 blur-3xl"
              />

              <p className="relative text-center text-[11px] font-extrabold uppercase tracking-[0.22em] text-accent">
                Instant unlock
              </p>
              <h2 className="relative mt-2 text-center font-display text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl">
                Everything you need to post today
              </h2>
              <p className="relative mx-auto mt-2 max-w-md text-center text-sm text-text-secondary">
                One payment. Drive link in minutes. Lifetime access to this drop.
              </p>

              <ul className="relative mt-6 grid grid-cols-3 gap-2 sm:gap-3">
                {product.includes.map((item, index) => (
                  <li
                    key={item}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-black/35 px-2 py-3.5 text-center sm:gap-2.5 sm:px-3 sm:py-5"
                  >
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-accent/25 bg-bg-tertiary shadow-[0_0_20px_rgba(255,122,0,0.2)] sm:h-14 sm:w-14">
                      <Image
                        src={includeIcon(item, index)}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </span>
                    <span className="text-[10px] font-medium leading-snug text-text-primary sm:text-sm">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="relative mt-6 border-t border-white/10 pt-5 text-center">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-text-muted">
                  Built for
                </p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-text-secondary sm:text-base">
                  {AUDIENCE.join(" · ")}
                </p>
              </div>
            </div>
          </div>

          {product.samples.length > 0 && (
            <section className="mt-16">
              <h2 className="text-center font-display text-3xl font-extrabold tracking-tight md:text-5xl">
                <span className="text-gold">Sample</span>{" "}
                <span className="text-text-primary">Videos</span>
              </h2>

              <div className="mx-auto mt-8 max-w-5xl rounded-2xl border border-accent/50 p-3 sm:p-4 md:p-5">
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4 md:gap-4">
                  {product.samples.slice(0, 8).map((src) => {
                    const pinId = extractPinId(src);
                    if (pinId) {
                      return (
                        <div
                          key={src}
                          className="overflow-hidden rounded-2xl bg-bg-tertiary"
                        >
                          <div className="relative aspect-[9/16] w-full">
                            <iframe
                              src={pinEmbedSrc(pinId)}
                              title="Sample video"
                              className="absolute inset-0 h-full w-full border-0"
                              loading="lazy"
                              scrolling="no"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div
                        key={src}
                        className="overflow-hidden rounded-2xl bg-black"
                      >
                        <video
                          src={src}
                          className="aspect-[9/16] w-full bg-black object-cover"
                          muted
                          loop
                          playsInline
                          autoPlay
                          controls
                          preload="metadata"
                          controlsList="nodownload"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <h3 className="mt-10 text-center font-display text-2xl font-extrabold tracking-tight md:text-3xl">
                See How{" "}
                <span className="text-gold">
                  {product.title.replace(/\s+Bundle.*$/i, "").trim()}
                </span>{" "}
                Can Grow Your Page Quickly
              </h3>
            </section>
          )}

          <section className="mx-auto mt-14 max-w-5xl">
            <p className="text-center text-xs font-extrabold uppercase tracking-[0.22em] text-accent">
              Social proof
            </p>
            <h2 className="mt-2 text-center font-display text-3xl font-extrabold tracking-tight">
              Don&apos;t take our word for it
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <blockquote className="rounded-2xl border border-line bg-bg-secondary p-5">
                <p className="text-gold text-sm">★★★★★</p>
                <p className="mt-3 text-sm leading-relaxed text-text-primary">
                  “{product.proof}”
                </p>
                <footer className="mt-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
                  {product.proofName}
                </footer>
              </blockquote>
              {EXTRA_PROOF.map((t) => (
                <blockquote
                  key={t.name}
                  className="rounded-2xl border border-line bg-bg-secondary p-5"
                >
                  <p className="text-gold text-sm">★★★★★</p>
                  <p className="mt-3 text-sm leading-relaxed text-text-primary">
                    “{t.quote}”
                  </p>
                  <footer className="mt-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
                    {t.name}
                    <span className="mt-1 block font-normal normal-case tracking-normal text-text-muted">
                      {t.place}
                    </span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>

          <section className="mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-line bg-bg-secondary p-6">
              <h2 className="font-display text-xl font-bold text-text-primary">
                Without this pack
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm text-text-secondary">
                <li>✕ Hours wasted filming & editing every day</li>
                <li>✕ Blank calendar → missed algorithm windows</li>
                <li>✕ Camera anxiety / showing your face</li>
                <li>✕ Slow growth, burned motivation</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-accent/35 bg-accent/5 p-6">
              <h2 className="font-display text-xl font-bold text-text-primary">
                With CreatorDrop
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm text-text-secondary">
                <li>✓ Post in under 5 minutes — copy & publish</li>
                <li>✓ 100% faceless privacy</li>
                <li>✓ Proven formats built for views</li>
                <li>✓ Lifetime access, one payment</li>
              </ul>
            </div>
          </section>

          <section className="relative mx-auto mt-14 max-w-5xl overflow-hidden rounded-[1.75rem] border border-accent/30 bg-[linear-gradient(155deg,#1a1208_0%,#0a0a14_50%,#12101a_100%)] px-5 py-7 sm:px-7 sm:py-8">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-12 top-0 h-36 w-36 rounded-full bg-accent/15 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 -right-10 h-40 w-40 rounded-full bg-accent-deep/20 blur-3xl"
            />

            <p className="relative text-center text-[11px] font-extrabold uppercase tracking-[0.22em] text-accent">
              Got questions?
            </p>
            <h2 className="relative mt-2 text-center font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              Quick FAQ
            </h2>
            <p className="relative mx-auto mt-2 max-w-sm text-center text-sm text-text-secondary">
              Straight answers before you unlock access.
            </p>

            <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/35">
              {MINI_FAQ.map((faq, index) => {
                const open = openFaq === index;
                return (
                  <div
                    key={faq.q}
                    className={
                      index > 0 ? "border-t border-white/10" : undefined
                    }
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : index)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-white/[0.03] sm:px-5"
                    >
                      <span className="font-semibold text-text-primary">
                        {faq.q}
                      </span>
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-sm font-bold transition ${
                          open
                            ? "border-accent bg-accent text-white"
                            : "border-white/20 text-accent"
                        }`}
                      >
                        {open ? "−" : "+"}
                      </span>
                    </button>
                    {open ? (
                      <p className="px-4 pb-4 text-sm leading-relaxed text-text-secondary sm:px-5">
                        {faq.a}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mx-auto mt-10 max-w-5xl rounded-[1.75rem] border border-line bg-[linear-gradient(160deg,#121224_0%,#05050d_55%,#1a1008_100%)] p-6 text-center md:p-10">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-accent">
              Time is running out
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              Grab access now at just {formatINR(product.price)}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-text-secondary">
              Lock {off}% off before this drop window closes. Instant Drive
              link. Start posting today.
            </p>
            <div className="mt-6 flex justify-center gap-2 font-display text-2xl font-extrabold tabular-nums">
              <span>{pad(hours)}</span>
              <span className="text-accent">:</span>
              <span>{pad(minutes)}</span>
              <span className="text-accent">:</span>
              <span>{pad(seconds)}</span>
            </div>
            <button
              type="button"
              disabled={loading || !ready}
              onClick={() => void buyNow()}
              className="btn-primary mt-6 px-10 py-4 text-base disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Opening payment…"
                : `Yes! I Want This — ${formatINR(product.price)}`}
            </button>
            <p className="mt-3 text-xs text-text-muted">
              Secure checkout · Instant delivery · No recurring fees
            </p>
          </section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-accent/40 bg-black/95 px-3 py-1.5 backdrop-blur-xl sm:px-6 sm:py-2">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 sm:gap-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <p className="shrink-0 text-[10px] font-bold leading-tight tracking-wide text-accent sm:text-xs">
              🚨
              <span className="ml-1 hidden sm:inline">Few Mins Left..</span>
              <span className="ml-1 sm:hidden">Few Mins</span>
            </p>
            <div className="inline-flex min-w-[9.5rem] items-stretch overflow-hidden rounded-md border border-accent/80 sm:min-w-[14rem]">
              <div className="flex-1 px-3 py-1 text-center sm:px-6 sm:py-1.5">
                <p className="font-display text-lg font-extrabold leading-none tabular-nums text-accent sm:text-2xl">
                  {pad(minutes)}
                </p>
                <p className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-white/80 sm:text-[10px]">
                  Minutes
                </p>
              </div>
              <div className="w-px bg-accent/50" />
              <div className="flex-1 px-3 py-1 text-center sm:px-6 sm:py-1.5">
                <p className="font-display text-lg font-extrabold leading-none tabular-nums text-accent sm:text-2xl">
                  {pad(seconds)}
                </p>
                <p className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-white/80 sm:text-[10px]">
                  Seconds
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={loading || !ready}
            onClick={() => void buyNow()}
            className="btn-shine min-w-[10.5rem] shrink-0 rounded-md bg-[linear-gradient(135deg,#FF7A00_0%,#FF3500_100%)] px-5 py-2 text-xs font-extrabold uppercase tracking-wide text-white shadow-[0_0_24px_rgba(255,122,0,0.4)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[18rem] sm:px-14 sm:py-2.5 sm:text-base"
          >
            {loading ? "Paying…" : "Get It Now"}
          </button>
        </div>
      </div>
    </>
  );
}

function TimeBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[3.25rem] rounded-xl border border-white/10 bg-black/40 px-2 py-1.5 text-center">
      <div className="leading-none">{value}</div>
      <div className="mt-1 text-[9px] font-semibold tracking-wider text-text-muted">
        {label}
      </div>
    </div>
  );
}
