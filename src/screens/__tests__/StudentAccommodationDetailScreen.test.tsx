import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { StudentAccommodationDetailScreen } from "@/screens/StudentAccommodationDetailScreen";
import { useAuthStore } from "@/stores/authStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import { useLanguageStore } from "@/i18n";
import { revealContact } from "@/api/studentAccommodationApi";
import type { StudentAccommodationDetail } from "@/types/studentAccommodation";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/api/studentAccommodationApi", () => ({
  getAccommodationDetail: jest.fn(),
  revealContact: jest.fn(),
  toggleSave: jest.fn().mockResolvedValue({ is_saved: true }),
}));

jest.mock("@/components/icons", () => ({
  AlertCircle: () => "AlertCircleIcon",
  ArrowLeft: () => "ArrowLeftIcon",
  Building: () => "BuildingIcon",
  Check: () => "CheckIcon",
  Clock: () => "ClockIcon",
  Heart: () => "HeartIcon",
  MapPin: () => "MapPinIcon",
  MessageSquare: () => "MessageSquareIcon",
  Phone: () => "PhoneIcon",
  ShieldCheck: () => "ShieldCheckIcon",
  X: () => "XIcon",
}));

describe("StudentAccommodationDetailScreen", () => {
  let container: HTMLDivElement;

  const mockDetail: StudentAccommodationDetail = {
    id: "acc-101",
    title: "Green Hall Student Mess",
    category: "student_accommodation",
    subtype: "mess",
    gender_policy: "male",
    total_rent: 6500,
    currency: "BDT",
    primary_image_url: "https://example.com/mess.jpg",
    description: "Modern mess near DU campus with daily meals and WiFi.",
    address: "House 12, Road 4, Dhanmondi, Dhaka",
    coordinates: {
      latitude: 23.746,
      longitude: 90.374,
    },
    nearest_campus: {
      university_id: "du",
      university_name: "Dhaka University",
      walking_time_minutes: 8,
      distance_meters: 600,
      is_approximate: false,
    },
    available_seats: 3,
    total_seats: 8,
    is_saved: false,
    updated_at: "2026-11-04T00:00:00Z",
    media: [
      { id: "m1", url: "https://example.com/room.jpg", label: "room", is_primary: true },
      { id: "m2", url: "https://example.com/washroom.jpg", label: "washroom" },
      { id: "m3", url: "https://example.com/kitchen.jpg", label: "kitchen" },
    ],
    governance: {
      rent: 6500,
      security_deposit: 10000,
      advance_months: 1,
      notice_period_days: 30,
      currency: "BDT",
    },
    rules: {
      smoking_policy: "not_allowed",
      guest_policy: "day_only",
      meal_system: "included",
      quiet_hours_start: "23:00",
      quiet_hours_end: "07:00",
    },
    safety: {
      floor_level: 4,
      has_lift: true,
      has_security_guard: true,
      has_cctv: true,
      has_generator: true,
      has_wifi: true,
    },
    contact_revealed: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useLanguageStore.getState().setLanguage("en");
    useAuthStore.setState({
      user: {
        id: "user-1",
        full_name: "Student User",
        email: "student@homenet.com",
        avatar_url: null,
      },
    });
    useAuthModalStore.setState({ visible: false });

    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    useLanguageStore.getState().setLanguage("en");
  });

  it("1. Renders all key sections: gallery tags, proximity badge, financial breakdown, rules, and safety amenities", async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(<StudentAccommodationDetailScreen accommodation={mockDetail} />);
    });

    const text = container.textContent || "";

    // Header & Title
    expect(text).toContain("Green Hall Student Mess");

    // Gallery Category Pills
    expect(text).toContain("All Photos");
    expect(text).toContain("Bed / Room");
    expect(text).toContain("Washroom");
    expect(text).toContain("Kitchen");

    // Core Overview
    expect(text).toContain("8 min walk to Dhaka University");
    expect(text).toContain("3/8 seats available");
    expect(text).toContain("Male Students");

    // Financial Breakdown
    expect(text).toContain("Financial Breakdown");
    expect(text).toContain("6,500");
    expect(text).toContain("10,000");
    expect(text).toContain("1 months");
    expect(text).toContain("30 days");

    // Rules
    expect(text).toContain("Rules & Policies");
    expect(text).toContain("Non-Smoking");
    expect(text).toContain("Day Guests Only");
    expect(text).toContain("Meal Included");
    expect(text).toContain("Quiet Hours: 23:00 - 07:00");

    // Safety & Amenities
    expect(text).toContain("Safety & Amenities");
    expect(text).toContain("Floor 4");
    expect(text).toContain("Lift");
    expect(text).toContain("Security Guard");
    expect(text).toContain("CCTV");
    expect(text).toContain("Generator");
    expect(text).toContain("High-speed WiFi");

    await act(async () => root.unmount());
  });

  it("2. Initial render does NOT contain raw unmasked phone numbers or emails (Zero Leakage Rule)", async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(<StudentAccommodationDetailScreen accommodation={mockDetail} />);
    });

    const text = container.textContent || "";

    // No phone number formats allowed
    expect(text).not.toMatch(/(?:\+?880|0)1[3-9]\d{8}/);
    // No email addresses allowed
    expect(text).not.toMatch(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

    // Call and WhatsApp buttons must not exist yet
    expect(container.querySelector(`[aria-label="Call Host"]`)).toBeNull();
    expect(container.querySelector(`[aria-label="Chat on WhatsApp"]`)).toBeNull();

    // CTA must be present
    expect(
      container.querySelector(`[aria-label="Show Contact Details"]`),
    ).toBeTruthy();

    await act(async () => root.unmount());
  });

  it("3. Clicking 'Show Contact Details' requests contact reveal and displays contact channels", async () => {
    const mockRevealedChannels = {
      allows_call: true,
      allows_whatsapp: true,
      masked_phone: "+88017****5678",
    };

    (revealContact as jest.Mock).mockResolvedValueOnce({
      contact_revealed: true,
      contact_channels: mockRevealedChannels,
    });

    const onContactRevealedMock = jest.fn();
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <StudentAccommodationDetailScreen
          accommodation={mockDetail}
          onContactRevealed={onContactRevealedMock}
        />,
      );
    });

    const ctaButton = container.querySelector(
      `[aria-label="Show Contact Details"]`,
    );
    expect(ctaButton).toBeTruthy();

    await act(async () => {
      ctaButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(revealContact).toHaveBeenCalledTimes(1);
    expect(revealContact).toHaveBeenCalledWith("acc-101");
    expect(onContactRevealedMock).toHaveBeenCalledWith(mockRevealedChannels);

    // Now contact details and action buttons must be visible
    expect(container.textContent).toContain("+88017****5678");
    expect(container.querySelector(`[aria-label="Call Host"]`)).toBeTruthy();
    expect(container.querySelector(`[aria-label="Chat on WhatsApp"]`)).toBeTruthy();

    await act(async () => root.unmount());
  });

  it("4. Handles 429 rate-limit responses gracefully with a readable warning message", async () => {
    (revealContact as jest.Mock).mockRejectedValueOnce({
      status: 429,
      message: "Too Many Requests",
    });

    const root = createRoot(container);
    await act(async () => {
      root.render(<StudentAccommodationDetailScreen accommodation={mockDetail} />);
    });

    const ctaButton = container.querySelector(
      `[aria-label="Show Contact Details"]`,
    );

    await act(async () => {
      ctaButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(revealContact).toHaveBeenCalledTimes(1);

    // Warning message must be displayed
    expect(container.textContent).toContain(
      "You have viewed several contacts recently. Please wait a moment before trying again.",
    );

    // And contact details must still be protected
    expect(container.querySelector(`[aria-label="Call Host"]`)).toBeNull();

    await act(async () => root.unmount());
  });
});

