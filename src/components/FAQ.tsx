"use client";

import { useState } from "react";
import { faqs } from "@/data/products";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="section-pad scroll-mt-20 py-20 md:py-28">
      <div className="section-inner grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-accent">
            FAQ
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
            Help & FAQs
          </h2>
          <p className="mt-4 text-text-secondary">
            Got questions? We&apos;ve got answers.
          </p>
        </div>

        <div className="divide-y divide-line border-y border-line">
          {faqs.map((faq, index) => {
            const isOpen = open === index;
            return (
              <div key={faq.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="font-display text-lg font-bold">{faq.q}</span>
                  <span className="text-accent">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <p className="pb-5 text-sm leading-relaxed text-text-secondary">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
