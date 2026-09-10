import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/LegalPage";
import {
  BUSINESS_ADDRESS,
  SITE_NAME,
  SUPPORT_EMAIL,
} from "@/data/contact";

export const metadata: Metadata = {
  title: `Privacy Policy – ${SITE_NAME}`,
  description: `How ${SITE_NAME} collects, uses, and protects your personal information.`,
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="September 9, 2026">
      <p>
        {SITE_NAME} operates this store and website, including all related
        information, content, features, tools, products and services, in order
        to provide you with a curated shopping experience (the
        &quot;Services&quot;). This Privacy Policy describes how we collect,
        use, and disclose your personal information when you visit, use, or
        make a purchase using the Services or otherwise communicate with us.
      </p>
      <p>
        By using and accessing any of the Services, you acknowledge that you
        have read this Privacy Policy and understand the collection, use, and
        disclosure of your information as described here.
      </p>

      <LegalSection title="Personal Information We Collect">
        <p>
          Depending on how you interact with the Services, we may collect or
          process:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Contact details including your name, phone number, and email
            address
          </li>
          <li>
            Payment-related details processed by our payment provider (we do
            not store full card numbers on our servers)
          </li>
          <li>
            Transaction information including items purchased, order IDs, and
            payment status
          </li>
          <li>
            Communications with us, including WhatsApp or email support
            inquiries
          </li>
          <li>
            Device and usage information such as IP address, browser type, and
            how you navigate the site
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Personal Information Sources">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Directly from you when you checkout, contact support, or submit
            forms
          </li>
          <li>
            Automatically through the Services via cookies and similar
            technologies
          </li>
          <li>
            From service providers such as our payment gateway and hosting
            providers acting on our behalf
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="How We Use Your Personal Information">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Provide, fulfill, and improve the Services — process payments,
            deliver digital downloads, and manage orders
          </li>
          <li>
            Communicate with you about orders, access issues, and support
            requests
          </li>
          <li>
            Marketing and promotional messages (you may unsubscribe at any
            time)
          </li>
          <li>Security, fraud prevention, and abuse detection</li>
          <li>Comply with legal obligations and enforce our policies</li>
        </ul>
      </LegalSection>

      <LegalSection title="How We Disclose Personal Information">
        <p>
          We may share personal information with trusted third parties who help
          us operate the Services, including:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Payment processors (for example, Cashfree)</li>
          <li>Hosting, database, and infrastructure providers</li>
          <li>Analytics or email delivery tools we may use</li>
          <li>
            Authorities when required by law or to protect our rights and users
          </li>
        </ul>
        <p>
          We do not sell your personal information. Service providers may only
          process data as needed to perform services for us.
        </p>
      </LegalSection>

      <LegalSection title="Children&apos;s Data">
        <p>
          The Services are not intended for children, and we do not knowingly
          collect personal information from children under the age of majority
          in your jurisdiction. If you believe a child has provided us data,
          contact us using the details below to request deletion.
        </p>
      </LegalSection>

      <LegalSection title="Security and Retention">
        <p>
          We use reasonable technical and organizational measures to protect
          your information. No method of transmission or storage is fully
          secure. We retain personal information only as long as needed to
          fulfill orders, provide support, meet legal obligations, resolve
          disputes, and enforce our agreements.
        </p>
      </LegalSection>

      <LegalSection title="Your Rights and Choices">
        <p>
          Depending on where you live, you may have rights to access, correct,
          delete, or obtain a copy of your personal information, and to opt out
          of marketing communications. To exercise these rights, email{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-semibold text-accent hover:text-accent-soft"
          >
            {SUPPORT_EMAIL}
          </a>
          . You can also unsubscribe from promotional emails using the link in
          those messages.
        </p>
      </LegalSection>

      <LegalSection title="International Transfers">
        <p>
          We may transfer, store, and process your personal information outside
          the country you live in, including where our service providers
          operate.
        </p>
      </LegalSection>

      <LegalSection title="Changes to This Privacy Policy">
        <p>
          We may update this Privacy Policy from time to time. We will post the
          revised version on this page and update the &quot;Last updated&quot;
          date.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about this Privacy Policy or your data? Contact {SITE_NAME}{" "}
          at{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-semibold text-accent hover:text-accent-soft"
          >
            {SUPPORT_EMAIL}
          </a>{" "}
          or write to {BUSINESS_ADDRESS}.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
