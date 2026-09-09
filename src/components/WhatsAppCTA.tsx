export function WhatsAppCTA() {
  return (
    <section className="section-pad pb-8">
      <div className="section-inner overflow-hidden rounded-[2rem] border border-line bg-[linear-gradient(135deg,#121224_0%,#05050d_50%,#1a0f08_100%)]">
        <div className="grid items-center gap-10 p-8 md:grid-cols-2 md:p-12">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-success">
              <span className="relative inline-flex h-2.5 w-2.5">
                <span className="pulse-ring absolute inset-0 rounded-full" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-success" />
              </span>
              We&apos;re Online
            </p>
            <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
              Got Questions?
              <br />
              We&apos;re One Message Away.
            </h2>
            <p className="mt-4 max-w-md text-text-secondary">
              Downloads, payments, custom edits — whatever you need, our team is
              live on WhatsApp. Real humans, real help, fast replies.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-text-secondary">
              <li>· Replies within minutes</li>
              <li>· Download & payment issues</li>
              <li>· Custom template help</li>
            </ul>
            <a
              href="https://wa.me/918368469060"
              target="_blank"
              rel="noreferrer"
              className="btn-primary mt-8"
            >
              Chat on WhatsApp →
            </a>
          </div>

          <div className="rounded-2xl border border-line bg-bg-primary/70 p-5 backdrop-blur">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[linear-gradient(135deg,#FF7A00_0%,#FF3500_100%)] text-xs font-extrabold text-white">
                TSG
              </span>
              <div>
                <p className="font-bold">The Social Game Support</p>
                <p className="text-xs text-success">Online now</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-bg-tertiary px-4 py-3">
                Hey! 👋 How can we help you today?
              </p>
              <p className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-accent/20 px-4 py-3 text-text-primary">
                I need help with my template download 🙏
              </p>
              <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-bg-tertiary px-4 py-3">
                On it! We&apos;ll fix it for you right away ✅
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
