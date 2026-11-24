/**
 * Lightweight, non-blocking conversion and engagement event tracking.
 * Safe across web (SSR, static export, browser) and React Native mobile.
 * Dispatches to GA4 (window.gtag), Vercel Analytics (window.va), and Google Tag Manager (window.dataLayer).
 */

export interface PropertyViewParams {
  id: string;
  title?: string;
  price?: number | string | null;
  area?: string | null;
  listingType?: string | null;
  propertyType?: string | null;
}

export interface ContactOwnerParams {
  propertyId: string;
  method: "call" | "whatsapp" | "message";
}

export interface ListPropertySubmitParams {
  propertyId?: string | null;
  purpose?: string | null;
  propertyType?: string | null;
  area?: string | null;
  price?: number | null;
}

export interface SearchFilterParams {
  purpose?: string | null;
  location?: string | null;
  minPrice?: number | string | null;
  maxPrice?: number | string | null;
  beds?: number | string | null;
  propertyType?: string | null;
}

declare global {
  interface Window {
    gtag?: (command: string, action: string, params?: Record<string, unknown>) => void;
    va?: (action: string, payload?: { name: string; data?: Record<string, unknown> }) => void;
    dataLayer?: Record<string, unknown>[];
  }
}

/** Generic non-blocking event dispatcher */
export function trackEvent(eventName: string, params?: Record<string, unknown>): void {
  try {
    if (typeof window === "undefined") return;

    // GA4 (gtag.js)
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params);
    }

    // Vercel Analytics (va)
    if (typeof window.va === "function") {
      window.va("event", { name: eventName, data: params });
    }

    // Google Tag Manager / dataLayer fallback
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: eventName, ...params });
    }
  } catch {
    // Fail silently: analytics must never block or crash user interaction
  }
}

/** Track when a user views a property details page */
export function trackPropertyView(params: PropertyViewParams): void {
  trackEvent("property_view", {
    property_id: params.id,
    property_title: params.title,
    price: params.price != null ? String(params.price) : undefined,
    area: params.area,
    listing_type: params.listingType,
    property_type: params.propertyType,
  });
}

/** Track when a user clicks to contact the property owner (call, whatsapp, message) */
export function trackContactOwner(params: ContactOwnerParams): void {
  // No owner name and no phone number. Both identify a private individual,
  // and Google Analytics' terms forbid sending personal data. The property id
  // answers every question this event exists to answer.
  trackEvent("contact_owner_click", {
    property_id: params.propertyId,
    contact_method: params.method,
  });
}

/** Track when a seller submits a new property listing */
export function trackListPropertySubmit(params: ListPropertySubmitParams): void {
  trackEvent("list_property_submit", {
    property_id: params.propertyId,
    purpose: params.purpose,
    property_type: params.propertyType,
    area: params.area,
    price: params.price,
  });
}

/** Track when a user applies search filters or searches for properties */
export function trackSearchFilter(params: SearchFilterParams): void {
  trackEvent("property_search_filter", {
    search_purpose: params.purpose ?? undefined,
    search_location: params.location ?? undefined,
    min_price: params.minPrice != null && params.minPrice !== "" ? String(params.minPrice) : undefined,
    max_price: params.maxPrice != null && params.maxPrice !== "" ? String(params.maxPrice) : undefined,
    bedrooms: params.beds != null && params.beds !== "" ? String(params.beds) : undefined,
    property_type: params.propertyType ?? undefined,
  });
}
