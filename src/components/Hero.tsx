export function Hero() {
  const stats = [
    { value: "11789", label: "Customer Helped" },
    { value: "99", label: "Satisfaction" },
    { value: "4.9", label: "Rating" },
  ];

  return (
    <section className="mesh-hero noise relative min-h-[100svh] overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[18%] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,122,0,0.18),transparent_68%)] blur-2xl" />
        <div className="absolute bottom-[10%] left-[8%] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(232,168,0,0.12),transparent_70%)] blur-xl" />
        <div className="absolute bottom-[20%] right-[10%] h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.1),transparent_70%)] blur-xl" />
      </div>

      <div className="section-pad relative z-10 flex min-h-[100svh] items-center py-20 md:py-24">
        <div className="section-inner mx-auto flex max-w-4xl flex-col items-center text-center">
          <div className="reveal inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold tracking-wide text-text-secondary sm:text-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_#FF8C00]" />
            </span>
            #1 Digital Product Brand for Creators
          </div>

          <h1 className="reveal reveal-delay-1 mt-7 font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Unlock Premium Resources
            <br />
            To Scale Your{" "}
            <span className="gradient-text">Social Game</span>
          </h1>

          <p className="reveal reveal-delay-2 mt-6 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
            Access the ultimate collection of Canva templates, copywriting
            guides, Lightroom presets, and custom audits. Built to convert your
            followers into paying customers.
          </p>

          <div className="reveal reveal-delay-3 mt-9 flex flex-wrap items-center justify-center gap-3">
            <a href="#shop" className="btn-primary">
              Browse Collection
            </a>
            <a href="#reviews" className="btn-ghost">
              Customer Reviews
            </a>
          </div>

          <div className="reveal reveal-delay-4 glass-panel mt-14 grid w-full max-w-3xl grid-cols-3 gap-2 rounded-3xl px-4 py-6 shadow-[0_20px_40px_rgba(0,0,0,0.25)] sm:gap-6 sm:px-10 sm:py-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-2xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
                  <span className="gradient-text">{stat.value}</span>
                </p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-text-muted sm:text-xs">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
