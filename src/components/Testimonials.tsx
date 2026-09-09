import { testimonials } from "@/data/products";

export function Testimonials() {
  return (
    <section
      id="reviews"
      className="scroll-mt-20 border-y border-line bg-bg-secondary"
    >
      <div className="section-pad py-20 md:py-28">
        <div className="section-inner">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-accent">
            Testimonials
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-extrabold tracking-tight md:text-5xl">
            Loved by 10,000+ Creators
          </h2>
          <p className="mt-4 max-w-xl text-text-secondary">
            See how creators are scaling their personal brands and saving hours
            of design time with our assets.
          </p>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {testimonials.map((t) => (
              <blockquote
                key={t.handle}
                className="flex h-full flex-col rounded-2xl border border-line bg-bg-primary p-6"
              >
                <p className="text-gold">★★★★★</p>
                <p className="mt-4 flex-1 text-base leading-relaxed text-text-primary">
                  “{t.quote}”
                </p>
                <footer className="mt-6 flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[linear-gradient(135deg,#FF7A00_0%,#FF3500_100%)] font-extrabold text-white">
                    {t.initials}
                  </span>
                  <div>
                    <p className="font-bold">{t.name}</p>
                    <p className="text-sm text-text-secondary">{t.handle}</p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
