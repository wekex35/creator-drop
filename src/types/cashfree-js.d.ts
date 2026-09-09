declare module "@cashfreepayments/cashfree-js" {
  export type CashfreeMode = "sandbox" | "production";

  export type CashfreeInstance = {
    checkout: (options: {
      paymentSessionId: string;
      redirectTarget?: "_self" | "_blank" | "_modal";
    }) => Promise<{
      error?: { message?: string };
      paymentDetails?: unknown;
    }>;
  };

  export function load(options: {
    mode: CashfreeMode;
  }): Promise<CashfreeInstance>;
}
