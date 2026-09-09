import { SUPPORT_EMAIL, SUPPORT_PHONE } from "@/data/contact";

export type ProductCategory =
  | "all"
  | "templates"
  | "ebooks"
  | "presets"
  | "audits";

export type Product = {
  id: string;
  title: string;
  tagline: string;
  price: number;
  compareAt: number;
  category: Exclude<ProductCategory, "all">;
  badge: string;
  rating: number;
  reviews: number;
  accent: string;
  image: string;
  featured?: boolean;
  headline: string;
  includes: string[];
  proof: string;
  proofName: string;
  countLabel: string;
  samples: string[];
};

const MEDIA_BASE =
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
  "https://store.creatordrop.in";

const pack = (id: string) =>
  `${MEDIA_BASE}/creatordrop/products/${id}.png`;
const samples = (id: string) =>
  [1, 2, 3, 4, 5, 6, 7, 8].map(
    (n) => `${MEDIA_BASE}/creatordrop/samples/${id}/sample-${n}.mp4`,
  );

export const products: Product[] = [
  {
    id: "ai-baby",
    title: "650+ AI Baby & Kids Reels Bundle",
    tagline: "Cute, funny AI baby clips ready to post — no filming needed.",
    headline: "Launch a viral kids page without ever showing your face.",
    price: 199,
    compareAt: 2999,
    category: "templates",
    badge: "Reel Bundle",
    rating: 4.9,
    reviews: 3840,
    accent: "#FF7A00",
    image: pack("ai-baby"),
    featured: true,
    countLabel: "650+",
    samples: samples("ai-baby"),
    includes: [
      "650+ AI baby & kids comedy/podcast-style reels",
      "No watermarks — brand with your logo fast",
      "High-retention cute formats built for shares",
      "Instant Drive access + lifetime updates",
      "Perfect for faceless theme pages",
      "Commercial use for your pages & clients",
    ],
    proof:
      "Kids niche page start kiya — clips ready the, growth fast hua. Best decision.",
    proofName: "Rohan Pal",
  },
  {
    id: "mahadev-reels",
    title: "1000+ Mahadev Reels Bundle",
    tagline: "Devotional Mahadev content that keeps devotees watching.",
    headline: "Premium Mahadev reels for spiritual & Sanatan pages.",
    price: 249,
    compareAt: 3999,
    category: "templates",
    badge: "Devotional",
    rating: 4.9,
    reviews: 5120,
    accent: "#F59E0B",
    image: pack("mahadev-reels"),
    featured: true,
    countLabel: "1000+",
    samples: samples("mahadev-reels"),
    includes: [
      "1000+ Mahadev best-collection reels",
      "Clean, unbranded HD clips",
      "Built for Instagram Reels & YouTube Shorts",
      "Instant download access",
      "Lifetime free updates",
      "Commercial use for your pages & clients",
    ],
    proof:
      "Mahadev page pe daily posting easy ho gayi. Audience saves bohot aate hain.",
    proofName: "Ankit Sharma",
  },
  {
    id: "nature-cinematic",
    title: "1000+ Cinematic Nature Reels Bundle",
    tagline: "Waterfalls, wildlife & serene landscapes — cinematic and ready.",
    headline: "Make any aesthetic page look expensive with nature clips.",
    price: 149,
    compareAt: 2499,
    category: "presets",
    badge: "Nature",
    rating: 4.9,
    reviews: 2210,
    accent: "#10B981",
    image: pack("nature-cinematic"),
    featured: true,
    countLabel: "1000+",
    samples: samples("nature-cinematic"),
    includes: [
      "1000+ cinematic nature & landscape reels",
      "4K-feel visuals, no watermarks",
      "Ideal for aesthetic / calm / travel pages",
      "Instant Drive delivery",
      "Lifetime updates",
      "Commercial use for your pages & clients",
    ],
    proof:
      "Aesthetic page finally looks cinematic. Best nature pack I’ve bought.",
    proofName: "Isha Verma",
  },
  {
    id: "yb-tools",
    title: "2200+ YB Tools & Viral Reels Mega Pack",
    tagline: "Massive ready-to-post library for daily viral volume.",
    headline: "Never run out of content — 2200+ tools-style viral reels.",
    price: 299,
    compareAt: 4999,
    category: "templates",
    badge: "Mega Pack",
    rating: 4.9,
    reviews: 4680,
    accent: "#EF4444",
    image: pack("yb-tools"),
    featured: true,
    countLabel: "2200+",
    samples: samples("yb-tools"),
    includes: [
      "2200+ YB tools & viral-format reels",
      "Cross-platform ready (IG, TikTok, Shorts)",
      "No watermarks",
      "Instant Drive access",
      "Lifetime updates",
      "Commercial use for your pages & clients",
    ],
    proof:
      "Volume pack that pays for itself. Calendar kabhi empty nahi hota.",
    proofName: "Dev Patel",
  },
  {
    id: "ghibli-videos",
    title: "500+ Ghibli-Style AI Videos Bundle",
    tagline: "Dreamy anime-inspired clips that stop the scroll instantly.",
    headline: "Soft cinematic AI aesthetics for unique niche pages.",
    price: 229,
    compareAt: 3499,
    category: "templates",
    badge: "AI Art",
    rating: 4.9,
    reviews: 1980,
    accent: "#34D399",
    image: pack("ghibli-videos"),
    featured: true,
    countLabel: "500+",
    samples: samples("ghibli-videos"),
    includes: [
      "500+ Ghibli-style AI video clips",
      "Soft, painterly aesthetic for Reels/Shorts",
      "Unbranded files ready to caption",
      "Instant download",
      "Lifetime updates",
      "Commercial use for your pages & clients",
    ],
    proof:
      "Content bilkul alag lagta hai market se. Saves aur shares dono badhe.",
    proofName: "Neha Kapoor",
  },
  {
    id: "aesthetic-reels",
    title: "500+ Aesthetic Lifestyle Reels Bundle",
    tagline: "Soft lifestyle moments built for calm, pretty feeds.",
    headline: "Fill your aesthetic page with scroll-stopping lifestyle clips.",
    price: 179,
    compareAt: 2499,
    category: "templates",
    badge: "Aesthetic",
    rating: 4.9,
    reviews: 2560,
    accent: "#EC4899",
    image: pack("aesthetic-reels"),
    featured: true,
    countLabel: "500+",
    samples: samples("aesthetic-reels"),
    includes: [
      "500+ aesthetic lifestyle reels",
      "Clean visuals, no watermarks",
      "Great for IG aesthetic / mood pages",
      "Instant Drive access",
      "Lifetime updates",
      "Commercial use for your pages & clients",
    ],
    proof:
      "Mood page pe consistency aa gayi. Editing time almost zero.",
    proofName: "Priya Verma",
  },
  {
    id: "luxury-reels",
    title: "500+ Ultimate Luxury Reels Bundle",
    tagline: "Cars, travel & high-end lifestyle that make pages look rich.",
    headline: "Luxury lifestyle clips that elevate any motivation feed.",
    price: 197,
    compareAt: 3499,
    category: "templates",
    badge: "Luxury",
    rating: 4.9,
    reviews: 5021,
    accent: "#D4A017",
    image: pack("luxury-reels"),
    featured: true,
    countLabel: "500+",
    samples: samples("luxury-reels"),
    includes: [
      "500+ luxury lifestyle reels",
      "No watermark · premium look",
      "Drop into CapCut / VN in minutes",
      "Instant download",
      "Lifetime updates",
      "Commercial use for your pages & clients",
    ],
    proof:
      "My luxury page finally looks premium. Views jumped in week one.",
    proofName: "Arjun Mehta",
  },
  {
    id: "ai-god-reels",
    title: "500+ AI God & Divine Reels Bundle",
    tagline: "Divine AI visuals for spiritual storytelling pages.",
    headline: "God-themed AI reels built for devotion & watch time.",
    price: 199,
    compareAt: 2999,
    category: "templates",
    badge: "Spiritual",
    rating: 4.9,
    reviews: 1740,
    accent: "#A78BFA",
    image: pack("ai-god-reels"),
    featured: true,
    countLabel: "500+",
    samples: samples("ai-god-reels"),
    includes: [
      "500+ AI god / divine-themed reels",
      "HD, unbranded, ready to post",
      "Ideal for spiritual niches",
      "Instant Drive delivery",
      "Lifetime updates",
      "Commercial use for your pages & clients",
    ],
    proof:
      "Divine content niche mein ye pack perfect hai. Daily post easy.",
    proofName: "Suresh Yadav",
  },
  {
    id: "ai-english-reels",
    title: "400+ AI English Learning Reels Bundle",
    tagline: "English learning clips that educate and go viral.",
    headline: "Grow an English-education page with ready AI reels.",
    price: 179,
    compareAt: 2499,
    category: "templates",
    badge: "Education",
    rating: 4.9,
    reviews: 1320,
    accent: "#3B82F6",
    image: pack("ai-english-reels"),
    featured: true,
    countLabel: "400+",
    samples: samples("ai-english-reels"),
    includes: [
      "400+ AI English learning reels",
      "Faceless education formats",
      "No watermarks",
      "Instant download",
      "Lifetime updates",
      "Commercial use for your pages & clients",
    ],
    proof:
      "Students page pe trust build hua. Content consistent aur clean.",
    proofName: "Meera Joshi",
  },
  {
    id: "yb-reels",
    title: "300+ YB Reels Starter Pack (500–1000)",
    tagline: "Curated viral starter set for fast posting momentum.",
    headline: "A focused viral pack to kickstart daily Reels.",
    price: 129,
    compareAt: 1999,
    category: "templates",
    badge: "Starter",
    rating: 4.9,
    reviews: 980,
    accent: "#F97316",
    image: pack("yb-reels"),
    countLabel: "300+",
    samples: samples("yb-reels"),
    includes: [
      "300+ curated YB viral reels",
      "Ready-to-post HD files",
      "No watermarks",
      "Instant Drive access",
      "Lifetime updates",
      "Commercial use for your pages & clients",
    ],
    proof:
      "Starter pack se page jaldi consistent ho gaya. Worth it.",
    proofName: "Kabir Singh",
  },
  {
    id: "sanatan-reels",
    title: "250+ Sanatan Dharma Reels Bundle",
    tagline: "Sanatan storytelling clips for culture & faith pages.",
    headline: "Share Sanatan stories with ready-to-post divine reels.",
    price: 149,
    compareAt: 2299,
    category: "templates",
    badge: "Sanatan",
    rating: 4.9,
    reviews: 1560,
    accent: "#FB923C",
    image: pack("sanatan-reels"),
    countLabel: "250+",
    samples: samples("sanatan-reels"),
    includes: [
      "250+ Sanatan / cultural reels",
      "Clean HD, no watermarks",
      "Great for faith & culture niches",
      "Instant download",
      "Lifetime updates",
      "Commercial use for your pages & clients",
    ],
    proof:
      "Sanatan page audience ko connect feel hota hai. Soft + powerful visuals.",
    proofName: "Pooja Sharma",
  },
  {
    id: "car-crash",
    title: "240+ Car Crash & Action Reels Bundle",
    tagline: "High-adrenaline crash & action clips for male niches.",
    headline: "Action-packed car crash reels that spike watch time.",
    price: 159,
    compareAt: 2499,
    category: "templates",
    badge: "Action",
    rating: 4.9,
    reviews: 2104,
    accent: "#DC2626",
    image: pack("car-crash"),
    countLabel: "240+",
    samples: samples("car-crash"),
    includes: [
      "240+ car crash / action reels",
      "High-retention adrenaline formats",
      "Unbranded HD files",
      "Instant Drive access",
      "Lifetime updates",
      "Commercial use for your pages & clients",
    ],
    proof:
      "Action niche pe CTR strong. Posting stress khatam.",
    proofName: "Harsh Malhotra",
  },
  {
    id: "ai-story-reels",
    title: "170+ AI Story Reels Bundle",
    tagline: "Story-driven AI clips built for binge watch time.",
    headline: "Narrative AI stories that keep viewers till the end.",
    price: 149,
    compareAt: 2299,
    category: "templates",
    badge: "Stories",
    rating: 4.9,
    reviews: 890,
    accent: "#8B5CF6",
    image: pack("ai-story-reels"),
    countLabel: "170+",
    samples: samples("ai-story-reels"),
    includes: [
      "170+ AI story reels",
      "Narrative hooks for high watch time",
      "No watermarks",
      "Instant download",
      "Lifetime updates",
      "Commercial use for your pages & clients",
    ],
    proof:
      "Story format ne average watch time lift kiya. Solid pack.",
    proofName: "Sana Qureshi",
  },
  {
    id: "business-tips-hindi",
    title: "120+ Business Tips Hindi Reels Bundle",
    tagline: "Hindi business tips for authority & growth pages.",
    headline: "Build a Hindi business page with ready tip reels.",
    price: 129,
    compareAt: 1999,
    category: "ebooks",
    badge: "Business",
    rating: 4.9,
    reviews: 1120,
    accent: "#0EA5E9",
    image: pack("business-tips-hindi"),
    countLabel: "120+",
    samples: samples("business-tips-hindi"),
    includes: [
      "120+ Hindi business tip reels",
      "Authority-building educational clips",
      "Unbranded, ready to caption",
      "Instant Drive delivery",
      "Lifetime updates",
      "Commercial use for your pages & clients",
    ],
    proof:
      "Hindi business page ke liye perfect. Clients ko value dikhta hai.",
    proofName: "Vikram Shah",
  },
  {
    id: "2d-animation",
    title: "120+ 2D Animation Reels Bundle",
    tagline: "Animated story & moral clips ready for Shorts growth.",
    headline: "2D animated reels for story, moral & family niches.",
    price: 119,
    compareAt: 1899,
    category: "templates",
    badge: "Animation",
    rating: 4.9,
    reviews: 760,
    accent: "#22D3EE",
    image: pack("2d-animation"),
    countLabel: "120+",
    samples: samples("2d-animation"),
    includes: [
      "120+ 2D animation reels",
      "Story / moral friendly formats",
      "No watermarks",
      "Instant download",
      "Lifetime updates",
      "Commercial use for your pages & clients",
    ],
    proof:
      "Animation niche fresh lagta hai. Bachchon + family audience dono connect.",
    proofName: "Ananya Rao",
  },
  {
    id: "timelapse",
    title: "85+ Viral AI Timelapse Reel Bundle",
    tagline: "Mesmerizing timelapses that rack up watch time fast.",
    headline: "Loopable timelapse reels for calm viral growth.",
    price: 99,
    compareAt: 1499,
    category: "templates",
    badge: "Timelapse",
    rating: 4.9,
    reviews: 1340,
    accent: "#6366F1",
    image: pack("timelapse"),
    countLabel: "85+",
    samples: samples("timelapse"),
    includes: [
      "85+ AI / cinematic timelapse reels",
      "No watermark · HD feel",
      "Perfect loops for Shorts/Reels",
      "Instant download",
      "Lifetime updates",
      "Commercial use for your pages & clients",
    ],
    proof:
      "Watch time went up immediately. Easy daily posts.",
    proofName: "Siddharth Kapoor",
  },
];

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function discountPercent(product: Product) {
  if (product.compareAt <= product.price) return 0;
  return Math.round(
    ((product.compareAt - product.price) / product.compareAt) * 100,
  );
}

export const categoryLabels: Record<ProductCategory, string> = {
  all: "All Products",
  templates: "Templates",
  ebooks: "Ebooks",
  presets: "Presets & Assets",
  audits: "Audits & Strategy",
};

export const testimonials = [
  {
    name: "Abhishek Mourya",
    handle: "@abhishekm.design",
    initials: "AM",
    quote:
      "CreatorDrop packs saved me hours every week. Quality is high and posting is instant.",
  },
  {
    name: "Priya Sharma",
    handle: "@priyasharma.vlog",
    initials: "PS",
    quote:
      "Faceless page growth finally clicked. Ready-to-post clips + captions = consistency.",
  },
  {
    name: "Siddharth Kapoor",
    handle: "@siddharth.fits",
    initials: "SK",
    quote:
      "Best investment this year. Instant delivery and the samples matched what I got.",
  },
];

export const faqs = [
  {
    q: "How do I receive my digital files?",
    a: "Immediately after purchase you get a secure Google Drive link on the thank-you page and by email.",
  },
  {
    q: "Are payments safe and secure?",
    a: "Yes. Checkout supports UPI and cards through a secure payment gateway.",
  },
  {
    q: "Can I brand the clips?",
    a: "Yes. Files are unbranded — add your logo, captions, and music before posting.",
  },
  {
    q: "What is your refund policy?",
    a: "Digital downloads are generally non-refundable. If a file is broken, WhatsApp us and we’ll fix it.",
  },
  {
    q: "How can I contact support?",
    a: `Reach us on WhatsApp ${SUPPORT_PHONE} or email ${SUPPORT_EMAIL}. We typically reply within 24 hours.`,
  },
];

export const tools = [
  {
    title: "CapCut & VN",
    body: "Drop clips into CapCut or VN, add captions, and post in minutes.",
  },
  {
    title: "Instagram Reels",
    body: "Vertical HD formats built for Reels retention and shares.",
  },
  {
    title: "YouTube Shorts",
    body: "Same clips work on Shorts — brand once, publish everywhere.",
  },
  {
    title: "TikTok",
    body: "Unbranded exports ready for TikTok trends and sounds.",
  },
  {
    title: "Premiere & AE",
    body: "Import into pro timelines when you want advanced edits.",
  },
  {
    title: "100% Mobile Ready",
    body: "Download and post from Android or iOS without a desktop.",
  },
];

export const purchaseToasts = [
  { name: "Kavya", city: "Faridabad" },
  { name: "Arjun", city: "Mumbai" },
  { name: "Neha", city: "Delhi" },
  { name: "Rohan", city: "Bengaluru" },
  { name: "Ananya", city: "Pune" },
];
