# The Social Game

Next.js recreation of [thesocialgame.in](https://thesocialgame.in/) — a premium digital-product storefront for creators.

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- TypeScript
- Outfit + Inter (matching live brand fonts)

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What’s included

- Homepage parity with the live Shopify store: hero, trust pillars, featured bundles, tools, shop filters, comparison, how-it-works, testimonials, FAQ, WhatsApp CTA, email capture
- Real product imagery from the live CDN
- Client-side cart drawer (demo checkout)
- Purchase social-proof toast
- Catalog in `src/data/products.ts`

## Next steps to go live

1. Connect Shopify Storefront API / Checkout for real payments
2. Wire email capture to Mailchimp / ConvertKit / Klaviyo
3. Add product detail pages under `/products/[id]`
4. Host and point `thesocialgame.in` (or a staging domain) at this app
