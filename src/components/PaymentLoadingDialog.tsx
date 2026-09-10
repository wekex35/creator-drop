"use client";

export function PaymentLoadingDialog({
  open,
  message = "Opening secure payment…",
}: {
  open: boolean;
  message?: string;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-label={message}
    >
      <div className="w-full max-w-sm rounded-2xl border border-line bg-bg-secondary px-6 py-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-accent/30 bg-accent/10">
          <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-accent/25 border-t-accent" />
        </div>
        <p className="mt-5 font-display text-xl font-bold tracking-tight text-text-primary">
          Please wait
        </p>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          {message}
        </p>
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">
          Do not refresh or close this page
        </p>
      </div>
    </div>
  );
}
