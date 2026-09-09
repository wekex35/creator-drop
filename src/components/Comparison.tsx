const rows = [
  {
    feature: "Template Quality & File Resolution",
    others: "Low res / watermarked",
    us: "4K Ultra HD / Hand-designed",
  },
  {
    feature: "Dynamic Customization Options",
    others: "Locked PDFs / static PNGs",
    us: "100% Editable Canva & Notion links",
  },
  {
    feature: "Future Asset Updates",
    others: "Pay again for new releases",
    us: "Lifetime free updates access",
  },
  {
    feature: "Secure Checkout & Access",
    others: "Unverified links / spam drive access",
    us: "Instant secure email links",
  },
  {
    feature: "Dedicated Creator Support",
    others: "No responses / broken chat support",
    us: "Direct WhatsApp & Email help",
  },
];

export function Comparison() {
  return (
    <section className="border-y border-line bg-bg-secondary">
      <div className="section-pad py-20 md:py-28">
        <div className="section-inner">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-accent">
            Comparison
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-extrabold tracking-tight md:text-5xl">
            Why Creators Choose Us
          </h2>
          <p className="mt-4 max-w-xl text-text-secondary">
            Don&apos;t waste money on outdated archives with broken links. Get
            the premium creator standard.
          </p>

          <div className="mt-10 overflow-x-auto rounded-2xl border border-line">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-bg-primary">
                <tr>
                  <th className="px-5 py-4 font-bold text-text-secondary">
                    Feature
                  </th>
                  <th className="px-5 py-4 font-bold text-text-secondary">
                    Other Cheap Bundles
                  </th>
                  <th className="px-5 py-4 font-bold text-accent">
                    The Social Game
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.feature} className="border-t border-line">
                    <td className="px-5 py-4 font-semibold text-text-primary">
                      {row.feature}
                    </td>
                    <td className="px-5 py-4 text-text-secondary">
                      <span className="mr-2 text-red-400">✕</span>
                      {row.others}
                    </td>
                    <td className="px-5 py-4 text-text-primary">
                      <span className="mr-2 text-success">✓</span>
                      {row.us}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
