const steps = [
  {
    n: "1",
    title: "Choose Your Toolkit",
    body: "Explore our collection of bundles, reels, presets, and Notion content calendars. Select the asset pack that matches your brand direction.",
  },
  {
    n: "2",
    title: "Instant Secure checkout",
    body: "Proceed to payment. All checkout transactions are processed instantly through Shopify's secure, PCI-compliant gateway supporting UPI & Cards.",
  },
  {
    n: "3",
    title: "Instant Downloads link",
    body: "Access secure, high-speed download links on the thank you page and in your inbox within 5 seconds of purchase. No waiting around.",
  },
  {
    n: "4",
    title: "Edit, Publish & Scale",
    body: "Drag and drop details into Canva or Lightroom, customize layouts with your logos, post consistent aesthetic content, and watch your following scale!",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="section-pad scroll-mt-20 py-20 md:py-28">
      <div className="section-inner">
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-accent">
          How It Works
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl font-extrabold tracking-tight md:text-5xl">
          Step-by-Step Creator Journey
        </h2>
        <p className="mt-4 max-w-xl text-text-secondary">
          Get high-end premium resources running on your channels in less than 2
          minutes.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step) => (
            <div key={step.n} className="relative">
              <p className="font-display text-5xl font-extrabold text-accent/25">
                {step.n}
              </p>
              <h3 className="mt-2 font-display text-xl font-bold">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
