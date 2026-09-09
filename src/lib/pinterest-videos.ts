import "server-only";

import axios from "axios";
import https from "https";

export type PinterestVideoResult = {
  id: string;
  url: string;
  pinUrl?: string;
  thumbnail?: string;
  title?: string;
};

type PinVideoCandidate = {
  url: string;
  pinUrl?: string;
  thumbnail?: string;
  title?: string;
  quality: number;
};

const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const VIDEO_REFINE = "Video|guide|word|12";

function qualityScore(keyOrUrl: string) {
  const value = keyOrUrl.toLowerCase();
  if (value.includes("720p") || value.includes("v_exp7")) return 100;
  if (value.includes("expm4") || value.includes("v_exp")) return 70;
  if (value.endsWith(".mp4") || value.includes(".mp4")) return 90;
  if (value.includes("hls") || value.includes(".m3u8")) return 10;
  return 40;
}

function mp4FromHls(hlsUrl: string): string | null {
  // https://v1.pinimg.com/videos/iht/hls/aa/bb/cc/hash.m3u8
  // https://v1.pinimg.com/videos/mc/hls/aa/bb/cc/hash.m3u8
  // -> https://v1.pinimg.com/videos/mc/720p/aa/bb/cc/hash.mp4
  const match = hlsUrl.match(
    /\/videos\/(?:iht|mc)\/hls\/([a-f0-9]{2}\/[a-f0-9]{2}\/[a-f0-9]{2}\/[a-f0-9]+)\.m3u8/i,
  );
  if (!match) return null;
  return `https://v1.pinimg.com/videos/mc/720p/${match[1]}.mp4`;
}

function pickBestVideoUrl(
  videoList: Record<
    string,
    { url?: string; thumbnail?: string; width?: number; height?: number }
  >,
) {
  let best: { url: string; score: number; thumbnail?: string } | null = null;

  for (const [key, value] of Object.entries(videoList)) {
    let url = value?.url;
    if (!url || !/^https?:\/\//i.test(url)) continue;

    if (/\.m3u8(\?|$)/i.test(url)) {
      const derived = mp4FromHls(url);
      if (derived) url = derived;
      else continue; // skip pure HLS for download/playback in our player
    }

    if (!/\.mp4(\?|$)/i.test(url)) continue;

    const score = qualityScore(`${key} ${url}`);
    if (!best || score > best.score) {
      best = {
        url,
        score,
        thumbnail:
          typeof value.thumbnail === "string" ? value.thumbnail : undefined,
      };
    }
  }

  return best;
}

function pinPageUrl(record: Record<string, unknown>): string | undefined {
  // Only real pin entities have working /pin/{id}/ pages. Nested video
  // objects also expose numeric ids that 404 with "We can’t find that idea."
  if (record.type !== "pin") return undefined;

  const id = record.id;
  if (typeof id === "string" || typeof id === "number") {
    const value = String(id).trim();
    if (/^\d{10,}$/.test(value)) {
      return `https://www.pinterest.com/pin/${value}/`;
    }
  }
  return undefined;
}

function collectVideos(root: unknown): PinterestVideoResult[] {
  const byUrl = new Map<string, PinVideoCandidate>();

  function addCandidate(candidate: PinVideoCandidate) {
    const existing = byUrl.get(candidate.url);
    if (!existing || candidate.quality > existing.quality) {
      byUrl.set(candidate.url, candidate);
    } else if (existing && !existing.pinUrl && candidate.pinUrl) {
      byUrl.set(candidate.url, { ...existing, pinUrl: candidate.pinUrl });
    }
  }

  function visit(
    obj: unknown,
    depth: number,
    parentTitle?: string,
    parentPinUrl?: string,
  ) {
    if (depth > 24 || obj == null) return;

    if (typeof obj === "string") {
      if (/\.mp4(\?|$)/i.test(obj) && obj.startsWith("http")) {
        addCandidate({
          url: obj,
          pinUrl: parentPinUrl,
          title: parentTitle,
          quality: qualityScore(obj),
        });
      } else if (/\.m3u8(\?|$)/i.test(obj) && obj.startsWith("http")) {
        const mp4 = mp4FromHls(obj);
        if (mp4) {
          addCandidate({
            url: mp4,
            pinUrl: parentPinUrl,
            title: parentTitle,
            quality: 85,
          });
        }
      }
      return;
    }

    if (Array.isArray(obj)) {
      for (const item of obj) visit(item, depth + 1, parentTitle, parentPinUrl);
      return;
    }

    if (typeof obj !== "object") return;
    const record = obj as Record<string, unknown>;

    const title =
      (typeof record.title === "string" && record.title) ||
      (typeof record.grid_title === "string" && record.grid_title) ||
      (typeof record.description === "string" && record.description) ||
      parentTitle;

    const pinUrl = pinPageUrl(record) || parentPinUrl;

    const videos = record.videos as
      | {
          video_list?: Record<
            string,
            { url?: string; thumbnail?: string }
          >;
        }
      | undefined;

    if (videos?.video_list && typeof videos.video_list === "object") {
      const best = pickBestVideoUrl(videos.video_list);
      if (best) {
        const thumbFromList = Object.values(videos.video_list).find(
          (v) => typeof v?.thumbnail === "string",
        )?.thumbnail;
        addCandidate({
          url: best.url,
          pinUrl,
          thumbnail:
            best.thumbnail ||
            (typeof thumbFromList === "string" ? thumbFromList : undefined) ||
            (typeof record.image_url === "string"
              ? record.image_url
              : undefined),
          title,
          quality: best.score,
        });
      }
    }

    if (record.video_list && typeof record.video_list === "object") {
      const best = pickBestVideoUrl(
        record.video_list as Record<string, { url?: string; thumbnail?: string }>,
      );
      if (best) {
        addCandidate({
          url: best.url,
          pinUrl,
          thumbnail: best.thumbnail,
          title,
          quality: best.score,
        });
      }
    }

    for (const value of Object.values(record)) {
      visit(value, depth + 1, title, pinUrl);
    }
  }

  visit(root, 0);

  return [...byUrl.values()]
    .sort((a, b) => b.quality - a.quality)
    .slice(0, 48)
    .map((item, index) => ({
      id: `pinterest-video-${index}`,
      url: item.url,
      pinUrl: item.pinUrl,
      thumbnail: item.thumbnail,
      title: item.title,
    }));
}

function parseSearchInput(input: string): {
  query: string;
  sourceUrl: string;
  pageUrl: string;
} {
  const trimmed = input.trim();

  if (/^https?:\/\/([a-z]+\.)?pinterest\./i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const q = url.searchParams.get("q")?.trim() || "";
      if (!q) throw new Error("Pinterest URL is missing a search query");

      if (!url.searchParams.get("add_refine")) {
        url.searchParams.set("add_refine", VIDEO_REFINE);
      }
      if (!url.searchParams.get("rs")) {
        url.searchParams.set("rs", "guide");
      }
      if (!url.searchParams.get("journey_depth")) {
        url.searchParams.set("journey_depth", "1");
      }

      const sourceUrl = `${url.pathname}?${url.searchParams.toString()}`;
      return {
        query: q,
        sourceUrl,
        pageUrl: `https://in.pinterest.com${sourceUrl}`,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("missing")) {
        throw error;
      }
      // fall through to plain query handling
    }
  }

  const query = trimmed;
  const sourceUrl = `/search/pins/?q=${encodeURIComponent(query)}&rs=guide&journey_depth=1&add_refine=${encodeURIComponent(VIDEO_REFINE)}`;
  return {
    query,
    sourceUrl,
    pageUrl: `https://in.pinterest.com${sourceUrl}`,
  };
}

async function getCsrfAndCookies(pageUrl: string) {
  const initialResponse = await axios.get(pageUrl, {
    responseType: "text",
    timeout: 30_000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
    },
    httpsAgent,
  });

  let csrfToken = "";
  const csrfMatch =
    initialResponse.data.match(
      /name=["']csrfToken["']\s+value=["']([^"']+)["']/,
    ) ||
    initialResponse.data.match(/["']csrfToken["']\s*:\s*["']([^"']+)["']/) ||
    initialResponse.data.match(/csrftoken=([^;]+)/);
  if (csrfMatch) csrfToken = csrfMatch[1];

  const setCookieHeaders = initialResponse.headers["set-cookie"];
  const cookies: string[] = [];
  if (setCookieHeaders) {
    const list = Array.isArray(setCookieHeaders)
      ? setCookieHeaders
      : [String(setCookieHeaders)];
    for (const cookie of list) cookies.push(cookie.split(";")[0]);
  }

  if (!csrfToken) {
    for (const cookie of cookies) {
      const match = cookie.match(/csrftoken=([^;]+)/);
      if (match) {
        csrfToken = match[1];
        break;
      }
    }
  }

  return { csrfToken, cookieString: cookies.join("; ") };
}

export async function searchPinterestVideos(
  input: string,
): Promise<PinterestVideoResult[]> {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Search query is required");

  const { query, sourceUrl, pageUrl } = parseSearchInput(trimmed);
  const { csrfToken, cookieString } = await getCsrfAndCookies(pageUrl);
  const apiUrl = "https://in.pinterest.com/resource/BaseSearchResource/get/";

  const dataPayload = {
    options: {
      query,
      scope: "pins",
      appliedProductFilters: "---",
      domains: null,
      user: null,
      seoDrawerEnabled: false,
      applied_unified_filters: null,
      auto_correction_disabled: false,
      journey_depth: 1,
      source_id: null,
      source_module_id: null,
      source_url: sourceUrl,
      static_feed: false,
      selected_one_bar_modules: null,
      query_pin_sigs: null,
      page_size: 50,
      price_max: null,
      price_min: null,
      request_params: null,
      top_pin_ids: null,
      article: null,
      corpus: null,
      customized_rerank_type: null,
      filters: null,
      rs: "guide",
      redux_normalize_feed: true,
      bookmarks: [],
    },
    context: {},
  };

  const requestData = new URLSearchParams();
  requestData.append("source_url", sourceUrl);
  requestData.append("data", JSON.stringify(dataPayload));

  const apiResponse = await axios.post(apiUrl, requestData.toString(), {
    responseType: "json",
    timeout: 30_000,
    headers: {
      accept: "application/json, text/javascript, */*, q=0.01",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "content-type": "application/x-www-form-urlencoded",
      origin: "https://in.pinterest.com",
      referer: pageUrl,
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
      "x-requested-with": "XMLHttpRequest",
      "x-pinterest-pws-handler": "www/search/[scope].js",
      "x-pinterest-source-url": sourceUrl,
      ...(csrfToken ? { "x-csrftoken": csrfToken } : {}),
      ...(cookieString ? { Cookie: cookieString } : {}),
    },
    httpsAgent,
  });

  const videos = collectVideos(apiResponse.data);
  if (videos.length === 0) {
    throw new Error(
      "No Pinterest videos found for that query. Try adding “video” or paste a Video-filtered Pinterest search URL.",
    );
  }
  return videos;
}
