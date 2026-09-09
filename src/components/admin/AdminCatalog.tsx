"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { formatINR } from "@/lib/money";
import { extractPinId, pinEmbedSrc } from "@/lib/sample-media";

export type CatalogProduct = {
  id: string;
  title: string;
  tagline: string;
  headline: string;
  price: number;
  compareAt: number;
  category: "templates" | "ebooks" | "presets" | "audits";
  badge: string;
  rating: number;
  reviews: number;
  accent: string;
  image: string;
  featured?: boolean;
  includes: string[];
  proof: string;
  proofName: string;
  countLabel: string;
  samples: string[];
  deliveryUrl: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  id: string;
  title: string;
  tagline: string;
  headline: string;
  price: string;
  compareAt: string;
  category: CatalogProduct["category"];
  badge: string;
  rating: string;
  reviews: string;
  accent: string;
  image: string;
  featured: boolean;
  includes: string;
  proof: string;
  proofName: string;
  countLabel: string;
  samples: string;
  deliveryUrl: string;
  active: boolean;
};

const MIN_REVIEWS = 850;

const DEFAULT_INCLUDES = [
  "Ready-to-post HD reels",
  "No watermarks — brand with your logo",
  "Works on Instagram, YouTube Shorts & TikTok",
  "Instant Drive delivery",
  "Lifetime updates",
  "Commercial use for your pages & clients",
];

const QUICK_INCLUDE_CHIPS = [
  "No watermarks",
  "Instant Drive delivery",
  "Lifetime updates",
  "Faceless-friendly",
  "Commercial use",
  "HD ready-to-post",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

function emptyForm(): FormState {
  return {
    id: "",
    title: "",
    tagline: "",
    headline: "",
    price: "129",
    compareAt: "1999",
    category: "templates",
    badge: "Reel Bundle",
    rating: "4.9",
    reviews: String(MIN_REVIEWS),
    accent: "#FF7A00",
    image: "",
    featured: true,
    includes: DEFAULT_INCLUDES.join("\n"),
    proof: "Ready-to-post content that actually performs.",
    proofName: "Verified buyer",
    countLabel: "",
    samples: "",
    deliveryUrl: "",
    active: true,
  };
}

function toForm(p: CatalogProduct): FormState {
  return {
    id: p.id,
    title: p.title,
    tagline: p.tagline,
    headline: p.headline,
    price: String(p.price),
    compareAt: String(p.compareAt),
    category: p.category,
    badge: p.badge,
    rating: String(p.rating),
    reviews: String(p.reviews),
    accent: p.accent,
    image: p.image,
    featured: Boolean(p.featured),
    includes: p.includes.join("\n"),
    proof: p.proof,
    proofName: p.proofName,
    countLabel: p.countLabel,
    samples: p.samples.join("\n"),
    deliveryUrl: p.deliveryUrl,
    active: p.active,
  };
}

function applyTitleDefaults(form: FormState, title: string): FormState {
  const id = form.id.trim() || slugify(title);
  const count = form.countLabel.trim() || "100+";
  const short = title.replace(/\s+bundle.*$/i, "").trim() || title;
  return {
    ...form,
    title,
    id,
    countLabel: form.countLabel || count,
    image: form.image,
    samples: form.samples,
    tagline:
      form.tagline ||
      `${count} ready-to-post clips — no filming needed.`,
    headline:
      form.headline ||
      `Grow faster with ${short} without creating content from scratch.`,
    badge: form.badge || "Reel Bundle",
  };
}

function formToPayload(form: FormState, editingId: string | null) {
  const filled = editingId
    ? form
    : applyTitleDefaults(form, form.title.trim());
  const id = editingId ?? (filled.id.trim() || slugify(filled.title));

  return {
    id,
    title: filled.title.trim(),
    tagline:
      filled.tagline.trim() ||
      `${filled.countLabel || "100+"} ready-to-post clips.`,
    headline:
      filled.headline.trim() ||
      `Launch faster with ${filled.title.trim()}.`,
    price: Number(filled.price),
    compareAt: Number(filled.compareAt),
    category: filled.category,
    badge: filled.badge.trim() || "Reel Bundle",
    rating: Number(filled.rating) || 4.9,
    reviews: Math.max(Number(filled.reviews) || 0, MIN_REVIEWS),
    accent: filled.accent || "#FF7A00",
    image: filled.image.trim().split("?")[0],
    featured: filled.featured,
    includes: filled.includes.trim() || DEFAULT_INCLUDES.join("\n"),
    proof: filled.proof.trim() || "Ready-to-post content that actually performs.",
    proofName: filled.proofName.trim() || "Verified buyer",
    countLabel: filled.countLabel.trim() || "100+",
    samples: filled.samples.trim(),
    deliveryUrl: filled.deliveryUrl.trim(),
    active: filled.active,
  };
}

export function AdminCatalog({
  initialProducts,
}: {
  initialProducts: CatalogProduct[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [cloneId, setCloneId] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [sampleUrl, setSampleUrl] = useState("");
  const [pinQuery, setPinQuery] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const [pinVideos, setPinVideos] = useState<
    Array<{
      id: string;
      url: string;
      pinUrl?: string;
      thumbnail?: string;
      title?: string;
    }>
  >([]);
  const [selectedPinKey, setSelectedPinKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const previewId = useMemo(() => {
    if (editingId) return editingId;
    return form.id.trim() || slugify(form.title) || "new-pack";
  }, [editingId, form.id, form.title]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.badge.toLowerCase().includes(q),
    );
  }, [products, query]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setCloneId("");
    setAiPrompt("");
    setSampleUrl("");
    setPinQuery("");
    setPinVideos([]);
    setSelectedPinKey(null);
    setShowMore(false);
    setError("");
    setOpen(true);
  }

  function openEdit(product: CatalogProduct) {
    setEditingId(product.id);
    setForm(toForm(product));
    setCloneId("");
    setAiPrompt("");
    setSampleUrl("");
    setPinQuery(product.title);
    setPinVideos([]);
    setSelectedPinKey(null);
    setShowMore(false);
    setError("");
    setOpen(true);
  }

  function cloneFrom(id: string) {
    setCloneId(id);
    const source = products.find((p) => p.id === id);
    if (!source) return;
    const next = toForm(source);
    setForm({
      ...next,
      id: "",
      title: `${source.title} (copy)`,
      deliveryUrl: "",
      featured: false,
    });
  }

  function onTitleChange(title: string) {
    setForm((f) => {
      if (editingId) return { ...f, title };
      const autoId = slugify(title);
      return {
        ...f,
        title,
        id: autoId,
      };
    });
  }

  function onCountChange(countLabel: string) {
    setForm((f) => {
      if (editingId) return { ...f, countLabel };
      const title = f.title.trim();
      const short = title.replace(/\s+bundle.*$/i, "").trim() || title || "this pack";
      return {
        ...f,
        countLabel,
        tagline: `${countLabel || "100+"} ready-to-post clips — no filming needed.`,
        headline: `Grow faster with ${short} without creating content from scratch.`,
      };
    });
  }

  function addIncludeChip(chip: string) {
    setForm((f) => {
      const lines = f.includes
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.some((l) => l.toLowerCase().includes(chip.toLowerCase()))) {
        return f;
      }
      return { ...f, includes: [...lines, chip].join("\n") };
    });
  }

  async function generateWithAi() {
    setAiLoading(true);
    setError("");
    setMessage("");
    try {
      if (form.title.trim().length < 3) {
        throw new Error("Enter a product title first");
      }

      const response = await fetch("/api/admin/products/ai-prefill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          prompt: aiPrompt.trim() || undefined,
          price: Number(form.price) || undefined,
          countLabel: form.countLabel.trim() || undefined,
        }),
      });
      const result = (await response.json()) as {
        success: boolean;
        error?: string;
        data?: {
          title: string;
          tagline: string;
          headline: string;
          badge: string;
          countLabel: string;
          category: FormState["category"];
          includes: string[];
          proof: string;
          proofName: string;
          price?: number;
          compareAt?: number;
        };
      };
      if (!result.success || !result.data) {
        throw new Error(result.error || "AI prefill failed");
      }

      const data = result.data;
      setForm((f) => {
        const nextTitle = data.title || f.title;
        const autoId = editingId ? f.id : slugify(nextTitle);
        return {
          ...f,
          title: nextTitle,
          id: editingId ? f.id : autoId,
          tagline: data.tagline || f.tagline,
          headline: data.headline || f.headline,
          badge: data.badge || f.badge,
          countLabel: data.countLabel || f.countLabel,
          category: data.category || f.category,
          includes:
            data.includes?.length > 0
              ? data.includes.join("\n")
              : f.includes,
          proof: data.proof || f.proof,
          proofName: data.proofName || f.proofName,
          reviews: String(
            Math.max(Number(f.reviews) || 0, MIN_REVIEWS),
          ),
          price:
            typeof data.price === "number"
              ? String(data.price)
              : f.price,
          compareAt:
            typeof data.compareAt === "number"
              ? String(data.compareAt)
              : f.compareAt,
          image: f.image,
          samples: f.samples,
        };
      });
      setShowMore(true);
      setMessage("AI filled the listing — review and save.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI prefill failed");
    } finally {
      setAiLoading(false);
    }
  }

  const sampleList = useMemo(
    () =>
      form.samples
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    [form.samples],
  );

  function setSampleList(next: string[]) {
    setForm((f) => ({ ...f, samples: next.join("\n") }));
  }

  async function uploadCover(file: File) {
    setCoverUploading(true);
    setError("");
    try {
      const id = previewId;
      if (!id || id === "new-pack") {
        throw new Error("Set a product title first so we know where to save");
      }
      const body = new FormData();
      body.append("file", file);
      body.append("productId", id);
      const response = await fetch("/api/admin/upload/cover", {
        method: "POST",
        body,
      });
      const result = (await response.json()) as {
        success: boolean;
        error?: string;
        data?: { path: string };
      };
      if (!result.success || !result.data) {
        throw new Error(result.error || "Upload failed");
      }
      setForm((f) => ({ ...f, image: `${result.data!.path}?v=${Date.now()}` }));
      setMessage("Cover uploaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cover upload failed");
    } finally {
      setCoverUploading(false);
    }
  }

  function addExternalSampleUrl(url: string) {
    setError("");
    const trimmed = url.trim();
    const pinId = extractPinId(trimmed);
    const storeUrl = pinId
      ? `https://www.pinterest.com/pin/${pinId}/`
      : trimmed;

    if (!pinId && !/^https?:\/\//i.test(trimmed)) {
      setError("Paste a valid video URL or embed code");
      return;
    }
    if (sampleList.includes(storeUrl)) {
      setError("That URL is already in samples");
      return;
    }
    setSampleList([...sampleList, storeUrl]);
    setSampleUrl("");
    setMessage(
      pinId ? "Sample added." : "Sample URL added.",
    );
  }

  function addPinterestSample(video: {
    id: string;
    url: string;
    pinUrl?: string;
  }) {
    setError("");
    if (!video.pinUrl?.trim()) {
      setError("That clip can’t be added — try another.");
      return;
    }
    const pinId = extractPinId(video.pinUrl);
    if (!pinId) {
      setError("That clip can’t be added — try another.");
      return;
    }
    setSelectedPinKey(video.id);
    const storeUrl = `https://www.pinterest.com/pin/${pinId}/`;
    if (sampleList.includes(storeUrl)) {
      setMessage("Already in samples.");
      return;
    }
    setSampleList([...sampleList, storeUrl]);
    setMessage("Sample added.");
  }

  async function searchPinterest() {
    setPinLoading(true);
    setError("");
    try {
      const query = pinQuery.trim() || form.title.trim();
      if (!query) throw new Error("Enter a video search query");
      const response = await fetch("/api/admin/pinterest/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const result = (await response.json()) as {
        success: boolean;
        error?: string;
        data?: {
          videos: Array<{
            id: string;
            url: string;
            pinUrl?: string;
            thumbnail?: string;
            title?: string;
          }>;
        };
      };
      if (!result.success || !result.data) {
        throw new Error(result.error || "Video search failed");
      }
      setPinVideos(result.data.videos);
      setSelectedPinKey(null);
      if (result.data.videos.length === 0) {
        setMessage("No videos found.");
      } else {
        setMessage(`Found ${result.data.videos.length} videos.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video search failed");
    } finally {
      setPinLoading(false);
    }
  }

  async function refreshList() {
    const response = await fetch("/api/admin/products");
    const payload = (await response.json()) as {
      success: boolean;
      data?: CatalogProduct[];
      error?: string;
    };
    if (!payload.success || !payload.data) {
      throw new Error(payload.error || "Failed to refresh");
    }
    setProducts(payload.data);
  }

  async function saveProduct() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      if (!form.title.trim()) throw new Error("Add a product title");
      if (!form.price || Number(form.price) <= 0) {
        throw new Error("Set a sale price");
      }
      if (!editingId && !form.deliveryUrl.trim()) {
        throw new Error("Paste the Google Drive / download link");
      }

      const payload = formToPayload(form, editingId);
      const response = await fetch(
        editingId
          ? `/api/admin/products/${encodeURIComponent(editingId)}`
          : "/api/admin/products",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = (await response.json()) as {
        success: boolean;
        error?: string;
      };
      if (!result.success) throw new Error(result.error || "Save failed");
      await refreshList();
      setOpen(false);
      setMessage(editingId ? "Product updated." : "Product created.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(product: CatalogProduct) {
    setMessage("");
    const response = await fetch(
      `/api/admin/products/${encodeURIComponent(product.id)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !product.active }),
      },
    );
    const result = (await response.json()) as {
      success: boolean;
      error?: string;
    };
    if (!result.success) {
      setError(result.error || "Update failed");
      return;
    }
    await refreshList();
  }

  async function toggleFeatured(product: CatalogProduct) {
    setMessage("");
    const response = await fetch(
      `/api/admin/products/${encodeURIComponent(product.id)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !product.featured }),
      },
    );
    const result = (await response.json()) as {
      success: boolean;
      error?: string;
    };
    if (!result.success) {
      setError(result.error || "Update failed");
      return;
    }
    await refreshList();
  }

  async function removeProduct(product: CatalogProduct) {
    if (
      !window.confirm(
        `Delete "${product.title}" permanently from the catalog?`,
      )
    ) {
      return;
    }
    setMessage("");
    const response = await fetch(
      `/api/admin/products/${encodeURIComponent(product.id)}`,
      { method: "DELETE" },
    );
    const result = (await response.json()) as {
      success: boolean;
      error?: string;
    };
    if (!result.success) {
      setError(result.error || "Delete failed");
      return;
    }
    await refreshList();
    setMessage("Product deleted.");
  }

  return (
    <div className="section-pad py-8 md:py-12">
      <div className="section-inner space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
              CreatorDrop admin
            </p>
            <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              Catalog
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {products.length} products
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin" className="btn-ghost px-4 py-2 text-sm">
              Analytics
            </Link>
            <button
              type="button"
              onClick={openCreate}
              className="btn-primary px-4 py-2 text-sm"
            >
              Add product
            </button>
          </div>
        </div>

        {message ? (
          <p className="text-sm text-success" role="status">
            {message}
          </p>
        ) : null}
        {error && !open ? (
          <p className="text-sm text-accent-soft" role="alert">
            {error}
          </p>
        ) : null}

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, id, badge…"
          className="w-full max-w-md rounded-xl border border-line bg-bg-secondary px-3 py-2.5 text-sm outline-none focus:border-accent"
        />

        <div className="overflow-hidden rounded-2xl border border-line bg-bg-secondary">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-bg-tertiary text-[11px] uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Flags</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-text-primary">
                        {product.title}
                      </p>
                      <p className="font-mono text-xs text-text-muted">
                        {product.id}
                      </p>
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatINR(product.price)}
                      <span className="ml-2 text-xs text-text-muted line-through">
                        {formatINR(product.compareAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          product.active
                            ? "bg-success/15 text-success"
                            : "bg-white/5 text-text-muted"
                        }`}
                      >
                        {product.active ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      {product.featured ? "Featured" : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold hover:border-accent"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void toggleActive(product)}
                          className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold hover:border-accent"
                        >
                          {product.active ? "Hide" : "Show"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void toggleFeatured(product)}
                          className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold hover:border-accent"
                        >
                          {product.featured ? "Unfeature" : "Feature"}
                        </button>
                        <Link
                          href={`/products/${product.id}?bare=1`}
                          target="_blank"
                          className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold hover:border-accent"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => void removeProduct(product)}
                          className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-accent-soft hover:border-accent"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-text-secondary"
                    >
                      No products match.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <div className="my-4 w-full max-w-6xl rounded-2xl border border-line bg-bg-secondary p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold">
                  {editingId ? "Edit product" : "Add product"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-line px-3 py-1.5 text-sm"
              >
                Close
              </button>
            </div>

            {!editingId ? (
              <div className="mt-4 rounded-xl border border-line bg-bg-tertiary/60 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                  Clone existing pack
                </p>
                <select
                  value={cloneId}
                  onChange={(e) => cloneFrom(e.target.value)}
                  className={`${inputClass} mt-2`}
                >
                  <option value="">Blank product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      Clone: {p.title}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="mt-5 grid gap-5 lg:grid-cols-2 lg:items-start">
              <div className="space-y-3">
                <Field label="Product name *">
                  <input
                    value={form.title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="e.g. 500+ Luxury Lifestyle Reels Bundle"
                    className={inputClass}
                    autoFocus
                  />
                  <p className="mt-1.5 text-xs text-text-muted">
                    ID:{" "}
                    <span className="font-mono text-text-secondary">
                      {previewId}
                    </span>
                  </p>
                </Field>

                <div className="rounded-xl border border-accent/25 bg-accent/5 p-3">
                  <Field label="AI notes">
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      rows={2}
                      placeholder="Optional notes for AI prefill"
                      className={inputClass}
                    />
                  </Field>
                  <button
                    type="button"
                    disabled={aiLoading}
                    onClick={() => void generateWithAi()}
                    className="btn-primary mt-3 w-full py-2.5 text-sm disabled:opacity-50"
                  >
                    {aiLoading ? "Generating…" : "Prefill with AI"}
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Sale price *">
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, price: e.target.value }))
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Old price">
                    <input
                      type="number"
                      value={form.compareAt}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, compareAt: e.target.value }))
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Clip count">
                    <input
                      value={form.countLabel}
                      onChange={(e) => onCountChange(e.target.value)}
                      placeholder="500+"
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field label="Download / Drive link *">
                  <input
                    value={form.deliveryUrl}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, deliveryUrl: e.target.value }))
                    }
                    placeholder="Paste Google Drive or Mega link"
                    className={inputClass}
                  />
                </Field>

                <Field label="What buyers get">
                  <textarea
                    value={form.includes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, includes: e.target.value }))
                    }
                    rows={5}
                    placeholder="One benefit per line"
                    className={inputClass}
                  />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {QUICK_INCLUDE_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => addIncludeChip(chip)}
                        className="rounded-full border border-line px-2.5 py-1 text-[11px] font-semibold text-text-secondary transition hover:border-accent hover:text-accent"
                      >
                        + {chip}
                      </button>
                    ))}
                  </div>
                </Field>

                <div className="flex flex-wrap gap-4 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, active: e.target.checked }))
                      }
                    />
                    Live on storefront
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, featured: e.target.checked }))
                      }
                    />
                    Show in featured
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMore((v) => !v)}
                  className="text-sm font-semibold text-gold hover:text-accent"
                >
                  {showMore ? "Hide extra settings" : "More settings"}
                </button>

                {showMore ? (
                  <div className="grid gap-3 rounded-xl border border-line bg-bg-tertiary/40 p-3 sm:grid-cols-2">
                    <Field label="Short description" wide>
                      <input
                        value={form.tagline}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, tagline: e.target.value }))
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Headline" wide>
                      <input
                        value={form.headline}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, headline: e.target.value }))
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Badge">
                      <input
                        value={form.badge}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, badge: e.target.value }))
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Category">
                      <select
                        value={form.category}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            category: e.target
                              .value as FormState["category"],
                          }))
                        }
                        className={inputClass}
                      >
                        <option value="templates">Templates</option>
                        <option value="ebooks">Ebooks</option>
                        <option value="presets">Presets</option>
                        <option value="audits">Audits</option>
                      </select>
                    </Field>
                    <Field label="Cover image path" wide>
                      <input
                        value={form.image}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, image: e.target.value }))
                        }
                        placeholder="Upload cover or paste URL"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Review quote" wide>
                      <input
                        value={form.proof}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, proof: e.target.value }))
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Reviewer name">
                      <input
                        value={form.proofName}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, proofName: e.target.value }))
                        }
                        className={inputClass}
                      />
                    </Field>
                    {!editingId ? (
                      <Field label="Custom id">
                        <input
                          value={form.id}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, id: e.target.value }))
                          }
                          className={inputClass}
                        />
                      </Field>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-line bg-bg-tertiary/40 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                    Cover image
                  </p>
                  <div className="mt-3 flex items-start gap-3">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-line bg-black/40">
                      {form.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={form.image.split("?")[0]}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-[10px] text-text-muted">
                          No cover
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <label className="btn-ghost inline-flex cursor-pointer px-3 py-2 text-xs">
                        {coverUploading ? "Uploading…" : "Upload cover"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={coverUploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void uploadCover(file);
                            e.target.value = "";
                          }}
                        />
                      </label>
                      <input
                        value={form.image}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, image: e.target.value }))
                        }
                        placeholder="Upload cover or paste URL"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-line bg-bg-tertiary/40 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                    Reviews
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Field label="Rating">
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={form.rating}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, rating: e.target.value }))
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Review count">
                      <input
                        type="number"
                        min={MIN_REVIEWS}
                        value={form.reviews}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            reviews: String(
                              Math.max(
                                Number(e.target.value) || 0,
                                MIN_REVIEWS,
                              ),
                            ),
                          }))
                        }
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>

                <div className="rounded-xl border border-line bg-bg-tertiary/40 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                    Sample videos
                  </p>

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      value={sampleUrl}
                      onChange={(e) => setSampleUrl(e.target.value)}
                      placeholder="Video URL or embed code"
                      className={`${inputClass} flex-1`}
                    />
                    <button
                      type="button"
                      disabled={!sampleUrl.trim()}
                      onClick={() => addExternalSampleUrl(sampleUrl)}
                      className="btn-primary shrink-0 px-4 py-2.5 text-sm disabled:opacity-50"
                    >
                      Add URL
                    </button>
                  </div>

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      value={pinQuery}
                      onChange={(e) => setPinQuery(e.target.value)}
                      placeholder="Search videos"
                      className={`${inputClass} flex-1`}
                    />
                    <button
                      type="button"
                      disabled={pinLoading}
                      onClick={() => void searchPinterest()}
                      className="btn-ghost shrink-0 px-4 py-2.5 text-sm disabled:opacity-50"
                    >
                      {pinLoading ? "Searching…" : "Search videos"}
                    </button>
                  </div>

                  {pinVideos.length > 0 ? (
                    <div className="mt-3 grid max-h-80 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
                      {pinVideos.map((video) => {
                        const canSave = Boolean(video.pinUrl);
                        const pinId = video.pinUrl
                          ? extractPinId(video.pinUrl)
                          : null;
                        const selected = selectedPinKey === video.id;
                        const alreadySaved =
                          pinId != null &&
                          sampleList.includes(
                            `https://www.pinterest.com/pin/${pinId}/`,
                          );
                        return (
                          <button
                            key={video.id}
                            type="button"
                            disabled={!canSave}
                            onClick={() => addPinterestSample(video)}
                            className={`overflow-hidden rounded-xl border bg-black text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
                              selected || alreadySaved
                                ? "border-accent ring-1 ring-accent/40"
                                : "border-line hover:border-accent"
                            }`}
                          >
                            <div className="relative aspect-[9/16] w-full overflow-hidden bg-black">
                              {selected && pinId ? (
                                <iframe
                                  src={pinEmbedSrc(pinId)}
                                  title={video.title || "Sample"}
                                  className="absolute inset-0 h-full w-full border-0"
                                  scrolling="no"
                                  allowFullScreen
                                />
                              ) : video.thumbnail ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={video.thumbnail}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="grid h-full place-items-center text-[10px] text-text-muted">
                                  Video
                                </div>
                              )}
                            </div>
                            <p className="line-clamp-2 px-2 py-1.5 text-[10px] text-text-secondary">
                              {canSave
                                ? video.title || "Add sample"
                                : "Unavailable"}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  {sampleList.length > 0 ? (
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {sampleList.map((src) => {
                        const pinId = extractPinId(src);
                        return (
                          <div
                            key={src}
                            className="overflow-hidden rounded-xl border border-line bg-black"
                          >
                            <div className="relative aspect-[9/16] w-full">
                              {pinId ? (
                                <iframe
                                  src={pinEmbedSrc(pinId)}
                                  title="Sample embed"
                                  className="absolute inset-0 h-full w-full border-0"
                                  loading="lazy"
                                  scrolling="no"
                                  allowFullScreen
                                />
                              ) : (
                                <video
                                  src={src}
                                  className="h-full w-full object-cover"
                                  muted
                                  playsInline
                                  controls
                                  preload="metadata"
                                />
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  setSampleList(
                                    sampleList.filter((s) => s !== src),
                                  )
                                }
                                className="absolute right-1.5 top-1.5 rounded-md bg-black/70 px-2 py-1 text-[10px] font-semibold text-accent-soft backdrop-blur"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-text-muted">
                      No samples yet.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {error ? (
              <p className="mt-3 text-sm text-accent-soft" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveProduct()}
                className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
              >
                {saving
                  ? "Saving…"
                  : editingId
                    ? "Save changes"
                    : "Create product"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-ghost px-5 py-2.5 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  children,
  wide,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-line bg-bg-tertiary px-3 py-2.5 text-sm outline-none focus:border-accent";
