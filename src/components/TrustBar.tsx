import { SUPPORT_EMAIL } from "@/data/contact";

const pillars = [
  {
    title: "Instant Delivery",
    body: "Get secure download links directly on the thank you screen and in your inbox seconds after checkout.",
  },
  {
    title: "Secure Payments",
    body: "100% secure transactions with encrypted checkout. Safe UPI & Card payments.",
  },
  {
    title: "Lifetime Access",
    body: "Download once and access all future updates to your purchased bundle for free, forever.",
  },
  {
    title: "Creator Support",
    body: `Have a question or need customization help? Reach our dedicated support team on ${SUPPORT_EMAIL}`,
  },
];

export function TrustBar() {
  return (
    <section className="border-y border-line bg-bg-secondary">
      <div className="section-pad py-12 md:py-16">
        <div className="section-inner grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-2xl border border-line bg-bg-primary/60 px-5 py-6 transition hover:border-accent/25"
            >
              <h3 className="font-display text-lg font-bold text-text-primary">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {pillar.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
