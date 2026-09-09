import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/LegalPage";
import {
  SITE_NAME,
  SITE_URL,
  SUPPORT_EMAIL,
} from "@/data/contact";

export const metadata: Metadata = {
  title: `Terms of Service – ${SITE_NAME}`,
  description: `Terms of Service for purchasing and using ${SITE_NAME} digital products.`,
};

export default function TermsOfServicePage() {
  return (
    <LegalPage title="Terms of Service" updated="September 9, 2026">
      <p>
        Welcome to {SITE_NAME}. The terms &quot;we&quot;, &quot;us&quot; and
        &quot;our&quot; refer to {SITE_NAME}. We operate this store and website,
        including all related information, content, features, tools, products
        and services, to provide you with a curated shopping experience (the
        &quot;Services&quot;).
      </p>
      <p>
        These Terms of Service, together with our{" "}
        <Link
          href="/privacy-policy"
          className="font-semibold text-accent hover:text-accent-soft"
        >
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link
          href="/refund-policy"
          className="font-semibold text-accent hover:text-accent-soft"
        >
          Refund Policy
        </Link>
        , describe your rights and responsibilities when you use the Services.
        By visiting or using our Services, you agree to be bound by these Terms.
        If you do not agree, do not use the Services.
      </p>

      <LegalSection title="1. Access and Account">
        <p>
          By agreeing to these Terms, you represent that you are at least the
          age of majority in your state or province of residence. To purchase
          digital products, you may be asked to provide information such as your
          name, email address, phone number, and payment details. You represent
          that all information provided is accurate, current, and complete.
        </p>
      </LegalSection>

      <LegalSection title="2. Digital Products and Services">
        <p>
          {SITE_NAME} sells digital creative assets, reel packs, templates, and
          related digital resources. We make every effort to describe products
          accurately. Because products are downloadable and accessible upon
          purchase, please review descriptions before buying. Product
          descriptions may change at any time without notice.
        </p>
      </LegalSection>

      <LegalSection title="3. Orders and Access">
        <p>
          When you place an order, you offer to purchase digital access. We must
          receive and process payment before the order is accepted and access is
          granted. Upon successful payment, download links or access
          instructions are shown on the confirmation screen and/or sent to the
          email you provided. Purchases are for your personal or commercial
          creator use under the license granted, not for unauthorized
          redistribution or resale.
        </p>
      </LegalSection>

      <LegalSection title="4. Prices and Payment">
        <p>
          Prices are listed in INR (Indian Rupees) and may change without
          notice. The price charged is the price in effect when the order is
          placed. Payments are processed through our payment partner. You
          represent that you are authorized to use the payment method provided.
        </p>
      </LegalSection>

      <LegalSection title="5. Delivery (Digital Goods Only)">
        <p>
          {SITE_NAME} provides digital products only. There is no physical
          shipment. Products are delivered electronically via download link on
          the confirmation screen and/or email after successful payment.
        </p>
      </LegalSection>

      <LegalSection title="6. Intellectual Property">
        <p>
          Digital assets, text, images, graphics, and branding available on this
          site may be owned by their respective rights holders, not necessarily
          by {SITE_NAME}. We do not claim ownership of third-party
          intellectual property. If you are a rights holder and believe content
          on this site infringes your rights, contact us and we will review the
          request and remove the content as appropriate.
        </p>
        <p>
          Your purchase grants a personal license to use the delivered assets
          for your creative projects. You may not redistribute, sub-license,
          share, or resell the raw digital files to third parties.
        </p>
      </LegalSection>

      <LegalSection title="7. Third-Party Tools">
        <p>
          Mentions of third-party software or platforms (such as CapCut, VN, or
          Premiere) are for compatibility guidance only. All trademarks belong
          to their respective owners. {SITE_NAME} is not affiliated with,
          endorsed by, or sponsored by those providers.
        </p>
      </LegalSection>

      <LegalSection title="8. Privacy">
        <p>
          Personal information collected in connection with your order is
          handled in accordance with our Privacy Policy.
        </p>
      </LegalSection>

      <LegalSection title="9. Refund and Cancellation">
        <p>
          Due to the nature of immediate digital downloads, all sales are
          governed by our{" "}
          <Link
            href="/refund-policy"
            className="font-semibold text-accent hover:text-accent-soft"
          >
            Refund Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="10. Governing Law">
        <p>
          These Terms shall be governed by the laws of India. Disputes arising
          out of these Terms are subject to the exclusive jurisdiction of the
          courts of India.
        </p>
      </LegalSection>

      <LegalSection title="11. Contact">
        <p>
          Questions about these Terms of Service:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Store: {SITE_NAME}</li>
          <li>
            Email:{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-semibold text-accent hover:text-accent-soft"
            >
              {SUPPORT_EMAIL}
            </a>
          </li>
          <li>
            Website:{" "}
            <a
              href={SITE_URL}
              className="font-semibold text-accent hover:text-accent-soft"
            >
              {SITE_URL}
            </a>
          </li>
          <li>Country: India</li>
        </ul>
      </LegalSection>
    </LegalPage>
  );
}
