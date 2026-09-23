import apiClient from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";
import { CURATED_PROPERTY_GUIDES } from "@/content/curatedGuides";
import type {
  FetchPropertyGuidesParams,
  GuideCategory,
  PropertyGuide,
  PropertyGuideList,
} from "../types/news";
import { resolveGuideImage } from "../utils/guideImageStrategy";

/**
 * Normalizes category string to TitleCase GuideCategory enum.
 */
function normalizeCategory(rawCat?: string | null): GuideCategory {
  if (!rawCat) return "Market";
  const map: Record<string, GuideCategory> = {
    market: "Market",
    buying: "Buying",
    renting: "Renting",
    selling: "Selling",
    legal: "Legal",
    ownership: "Ownership",
    investment: "Investment",
    developments: "Developments",
  };
  return map[rawCat.toLowerCase()] || "Market";
}

/**
 * Normalizes backend snake_case guide payload to the frontend PropertyGuide interface.
 */
function normalizeGuide(raw: any): PropertyGuide {
  const sourceType = (raw.source_type || raw.sourceType || "internal") as "internal" | "rss";
  const id = String(raw.id);
  const slug = String(raw.slug || raw.id);
  const category = normalizeCategory(raw.category);
  const title = raw.title || "";
  const tags = Array.isArray(raw.tags) ? raw.tags : [];
  const rawImageUrl = raw.image_url || raw.imageUrl || null;

  // Resolve editorial photography separate from content:
  // - external RSS never scrapes publisher images (uses reliable category/topic editorial photos)
  // - in-house guides use explicit imageUrl if present, otherwise resolve tailored photo
  const imageUrl = resolveGuideImage({
    id,
    slug,
    category,
    title,
    tags,
    sourceType,
    imageUrl: sourceType === "rss" ? null : rawImageUrl,
  });

  const author = raw.author
    ? {
        name: raw.author.name || raw.author.full_name,
        role: raw.author.role,
        avatarUrl: raw.author.avatar_url || raw.author.avatarUrl,
      }
    : raw.author_name
      ? {
          name: raw.author_name,
          role: raw.author_role || undefined,
          avatarUrl: null,
        }
      : null;

  return {
    id,
    slug,
    category,
    title,
    excerpt: raw.excerpt || "",
    readTime: raw.read_time || raw.readTime || "4 min read",
    imageUrl,
    publishedAt: raw.published_at || raw.publishedAt || null,
    href:
      raw.href ||
      (sourceType === "rss"
        ? raw.source_url || raw.sourceUrl || "#"
        : `/guides/${slug}`),
    sourceType,
    sourceName: raw.source_name ?? raw.sourceName ?? null,
    sourceUrl: raw.source_url ?? raw.sourceUrl ?? null,
    tags,
    contentMarkdown: raw.content_markdown ?? raw.contentMarkdown ?? null,
    author,
  };
}

/**
 * Filters the in-memory curated guides for zero-latency local fallback.
 */
function filterCuratedGuides(params: FetchPropertyGuidesParams): PropertyGuideList {
  let filtered = CURATED_PROPERTY_GUIDES.map(normalizeGuide);

  if (params.category && params.category !== "All") {
    filtered = filtered.filter(
      (item) => item.category.toLowerCase() === params.category!.toLowerCase(),
    );
  }

  if (params.sourceType) {
    filtered = filtered.filter((item) => item.sourceType === params.sourceType);
  }

  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.excerpt.toLowerCase().includes(q) ||
        item.tags?.some((t) => t.toLowerCase().includes(q)),
    );
  }

  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, params.limit || 10);
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const items = filtered.slice(startIndex, startIndex + limit);

  return {
    items,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Fetches the property guides and news feed.
 *
 * Tries the backend `/v1/guides` endpoint first. If the backend module is not yet deployed,
 * encounters a network issue, or returns empty, it falls back seamlessly to the curated guides.
 */
export async function fetchPropertyGuides(
  options?: FetchPropertyGuidesParams | number,
): Promise<PropertyGuideList> {
  const params: FetchPropertyGuidesParams =
    typeof options === "number" ? { limit: options } : options || {};

  try {
    const apiParams: Record<string, any> = {
      limit: params.limit || 10,
      page: params.page || 1,
    };

    if (params.category && params.category !== "All") {
      apiParams.category = params.category;
    }
    if (params.sourceType) {
      apiParams.source_type = params.sourceType;
    }
    if (params.search) {
      apiParams.search = params.search;
    }

    const { data } = await apiClient.get<ApiResponse<any>>("/v1/guides", {
      params: apiParams,
      timeout: 5000,
    });

    if (data?.data && Array.isArray(data.data.items) && data.data.items.length > 0) {
      return {
        items: data.data.items.map(normalizeGuide),
        total: data.data.total ?? data.data.items.length,
        page: data.data.page ?? params.page ?? 1,
        limit: data.data.limit ?? params.limit ?? 10,
        totalPages: data.data.total_pages ?? data.data.totalPages ?? 1,
      };
    }

    // Fall back if response data is null or empty
    return filterCuratedGuides(params);
  } catch {
    // Graceful offline fallback
    return filterCuratedGuides(params);
  }
}

/**
 * Fetches a single property guide by its slug.
 */
export async function fetchPropertyGuideBySlug(
  slug: string,
): Promise<PropertyGuide | null> {
  if (!slug) return null;

  try {
    const { data } = await apiClient.get<ApiResponse<any>>(`/v1/guides/${slug}`, {
      timeout: 5000,
    });

    if (data?.data) {
      return normalizeGuide(data.data);
    }
  } catch {
    // Ignore and check curated fallback
  }

  const fallback = CURATED_PROPERTY_GUIDES.find((g) => g.slug === slug);
  return fallback ? normalizeGuide(fallback) : null;
}

