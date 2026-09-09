import { tools } from "@/data/products";

export function Tools() {
  return (
    <section className="border-y border-line bg-bg-secondary">
      <div className="section-pad py-20 md:py-28">
        <div className="section-inner">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-accent">
            Built for Creators
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-extrabold tracking-tight md:text-5xl">
            Works With Every Tool You Love
          </h2>
          <p className="mt-4 max-w-xl text-text-secondary">
            From Canva to Premiere Pro — our assets plug directly into your
            workflow. No learning curve, just results.
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <div
                key={tool.title}
                className="rounded-2xl border border-line bg-bg-primary/50 px-5 py-6 transition hover:border-accent/30"
              >
                <h3 className="font-display text-xl font-bold">{tool.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {tool.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
