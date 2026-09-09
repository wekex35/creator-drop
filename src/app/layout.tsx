import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { SITE_NAME, SITE_URL } from "@/data/contact";
import "./globals.css";

const heading = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} – Premium Digital Packs for Creators`,
  description:
    "CreatorDrop offers reel bundles, AI content packs, and ready-to-post creator resources to help you grow faster.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${heading.variable} ${body.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bg-primary text-text-primary">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
