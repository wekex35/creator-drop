const items = [
  "Canva templates",
  "Viral reel bundles",
  "Lightroom presets",
  "Notion planners",
  "Instant delivery",
  "Lifetime updates",
  "UPI checkout",
];

export function Marquee() {
  const row = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-line bg-[linear-gradient(135deg,#FF7A00_0%,#FF3500_100%)] py-3 text-white">
      <div className="marquee-track flex w-max gap-10 whitespace-nowrap px-4 font-display text-sm font-extrabold uppercase tracking-[0.18em]">
        {row.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center gap-10">
            {item}
            <span aria-hidden>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
