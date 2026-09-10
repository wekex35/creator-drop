import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/LegalPage";
import {
  SITE_NAME,
  SUPPORT_EMAIL,
} from "@/data/contact";

export const metadata: Metadata = {
  title: `Refund Policy – ${SITE_NAME}`,
  description: `${SITE_NAME} refund policy for digital product purchases.`,
};

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund Policy" updated="September 9, 2026">
      <p>
        At {SITE_NAME}, we sell digital products, including reel bundles, AI
        content packs, templates, guides, and other downloadable or
        online-access products.
      </p>

      <LegalSection title="All Sales Are Final">
        <p>
          Due to the digital nature of our products, all purchases made through{" "}
          {SITE_NAME} are final and non-refundable.
        </p>
        <p>
          Once an order has been successfully placed, we do not offer refunds,
          returns, cancellations, exchanges, or credits, regardless of whether
          the digital product has been downloaded, accessed, or used.
        </p>
        <p>This includes, but is not limited to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Change of mind</li>
          <li>Accidental purchases</li>
          <li>Incorrect purchases</li>
          <li>Duplicate purchases</li>
          <li>Dissatisfaction with the product</li>
          <li>Failure to use the purchased product</li>
          <li>Personal circumstances</li>
          <li>Lack of expected results</li>
        </ul>
      </LegalSection>

      <LegalSection title="Digital Product Access">
        <p>
          After successful payment, your digital product may be delivered
          immediately or access may be provided shortly after purchase via the
          thank-you screen and email.
        </p>
        <p>
          If you experience a technical issue that prevents you from receiving
          or accessing your purchased product, please contact us at{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-semibold text-accent hover:text-accent-soft"
          >
            {SUPPORT_EMAIL}
          </a>
          . We will make reasonable efforts to help you access the product you
          purchased.
        </p>
        <p>Technical support does not constitute a refund or return.</p>
      </LegalSection>

      <LegalSection title="Results Disclaimer">
        <p>
          {SITE_NAME} does not guarantee any specific results from using its
          digital products, including views, followers, engagement, sales,
          revenue, income, or other outcomes. Individual results may vary
          depending on how the product is used.
        </p>
      </LegalSection>

      <LegalSection title="Unauthorized Sharing">
        <p>
          Customers are not permitted to copy, share, redistribute, or resell
          purchased digital products as raw files to third parties. Rights in
          those materials remain with their respective owners. If a rights
          holder requests removal of content from our store, we will review the
          request and remove it as appropriate.
        </p>
      </LegalSection>

      <LegalSection title="Exceptions Required by Law">
        <p>
          Nothing in this Refund Policy is intended to exclude or limit any
          rights or remedies that cannot legally be excluded or limited under
          applicable law.
        </p>
      </LegalSection>

      <LegalSection title="Contact Us">
        <p>
          Questions about your purchase or access issues? Reach {SITE_NAME} at{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-semibold text-accent hover:text-accent-soft"
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
