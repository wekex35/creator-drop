"use client";

import { useState, type FormEvent } from "react";

export function EmailCapture() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
    setEmail("");
  }

  return (
    <section className="section-pad py-16 md:py-24">
      <div className="section-inner rounded-[2rem] border border-line bg-bg-secondary px-6 py-10 md:px-12 md:py-14">
        <div className="grid items-end gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-accent">
              🎁 Free Starter Kit
            </p>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
              Level Up Your Creator Game
            </h2>
            <p className="mt-4 max-w-lg text-text-secondary">
              Drop your email and get our Free Starter Kit — 5 Canva templates,
              Lightroom presets & a Growth Playbook delivered straight to your
              inbox.
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@creator.com"
              className="w-full flex-1 rounded-full border border-line bg-bg-primary px-5 py-3 text-text-primary outline-none placeholder:text-text-muted focus:border-accent"
            />
            <button type="submit" className="btn-primary shrink-0">
              Get Free Kit
            </button>
          </form>
        </div>
        {done && (
          <p className="mt-4 text-sm text-success">
            You&apos;re in! Check your inbox shortly.
          </p>
        )}
        <p className="mt-4 text-xs text-text-muted">
          No spam, ever. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
