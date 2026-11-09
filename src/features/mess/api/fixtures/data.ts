/**
 * Demo data for the mess fixture backend. DEVELOPMENT ONLY.
 *
 * Everything here is made up: the listings, the people, the phone numbers. The
 * campus coordinates are rough positions for demos and are NOT the production
 * seed, which needs each campus gate checked on a map (PRD 2.2.5).
 */
import type { MessDetail, MessDetailsInput, Seat, University, UtilityCharge } from "../../types/mess";

export const FIXTURE_UNIVERSITIES: University[] = [
  {
    id: "fx-uni-uiu",
    name: "United International University",
    short_name: "UIU",
    city: "Dhaka",
    campuses: [{ id: "fx-campus-uiu", university_id: "fx-uni-uiu", name: "United City, Satarkul", area_id: null, lat: 23.7979, lng: 90.4497, is_primary: true }],
  },
  {
    id: "fx-uni-bracu",
    name: "BRAC University",
    short_name: "BRACU",
    city: "Dhaka",
    campuses: [{ id: "fx-campus-bracu", university_id: "fx-uni-bracu", name: "Merul Badda campus", area_id: null, lat: 23.7728, lng: 90.4255, is_primary: true }],
  },
  {
    id: "fx-uni-nsu",
    name: "North South University",
    short_name: "NSU",
    city: "Dhaka",
    campuses: [{ id: "fx-campus-nsu", university_id: "fx-uni-nsu", name: "Bashundhara campus", area_id: null, lat: 23.8151, lng: 90.4256, is_primary: true }],
  },
  {
    id: "fx-uni-iub",
    name: "Independent University, Bangladesh",
    short_name: "IUB",
    city: "Dhaka",
    campuses: [{ id: "fx-campus-iub", university_id: "fx-uni-iub", name: "Bashundhara campus", area_id: null, lat: 23.8155, lng: 90.4279, is_primary: true }],
  },
  {
    id: "fx-uni-aiub",
    name: "American International University-Bangladesh",
    short_name: "AIUB",
    city: "Dhaka",
    campuses: [{ id: "fx-campus-aiub", university_id: "fx-uni-aiub", name: "Kuratoli campus", area_id: null, lat: 23.8221, lng: 90.4275, is_primary: true }],
  },
  {
    id: "fx-uni-du",
    name: "University of Dhaka",
    short_name: "DU",
    city: "Dhaka",
    campuses: [
      { id: "fx-campus-du-tsc", university_id: "fx-uni-du", name: "TSC gate", area_id: null, lat: 23.7319, lng: 90.3958, is_primary: true },
      { id: "fx-campus-du-curzon", university_id: "fx-uni-du", name: "Curzon Hall gate", area_id: null, lat: 23.7266, lng: 90.4012, is_primary: false },
    ],
  },
];

const photo = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=70`;
const ROOM = photo("1522708323590-d24dbb6b0267");
const ROOM_2 = photo("1502672260266-1c1ef2d93688");
const WASHROOM = photo("1600607687939-ce8a6c25118c");
const BUILDING = photo("1545324418-cc1a3fa10c00");
const BUILDING_2 = photo("1486406146926-c627a92ad1ab");
const KITCHEN = photo("1600585154340-be6161a56a0c");

const BASE_MESS: MessDetailsInput = {
  gender_policy: "male",
  tenant_type: "students_only",
  managed_by: "resident_manager",
  total_rooms: 2,
  total_seats: 4,
  current_residents: 3,
  washroom_count: 1,
  floor_level: 3,
  has_lift: false,
  has_generator: false,
  has_security_guard: true,
  has_cctv: false,
  gate_open_time: "05:00",
  gate_close_time: "23:00",
  smoking_policy: "not_allowed",
  quiet_hours_start: "23:00",
  quiet_hours_end: "07:00",
  study_friendly: true,
  guest_policy: "day_only",
  meal_system: "meal_manager",
  maid_service: true,
  vibe_tags: ["quiet", "study_focused", "regular_prayer"],
  security_deposit: 5000,
  advance_months: 1,
  notice_period_days: 30,
  rent_last_revised_at: "2026-01-01",
  contact_channels: ["phone", "whatsapp"],
  verified_seekers_only: false,
};

/** Every category answered: the listing earns "All costs declared". */
function charges(overrides: Partial<Record<UtilityCharge["category"], Partial<UtilityCharge>>> = {}): UtilityCharge[] {
  const base: UtilityCharge[] = [
    { category: "electricity", billing: "variable", amount_min: 400, amount_max: 550, note: "Split by meter reading" },
    { category: "gas", billing: "fixed", amount_min: 250, amount_max: null, note: null },
    { category: "water", billing: "included", amount_min: null, amount_max: null, note: null },
    { category: "waste", billing: "fixed", amount_min: 50, amount_max: null, note: null },
    { category: "internet", billing: "fixed", amount_min: 150, amount_max: null, note: "40 Mbps shared" },
    { category: "maid", billing: "fixed", amount_min: 200, amount_max: null, note: "Bua cleans daily" },
    { category: "meal", billing: "not_applicable", amount_min: null, amount_max: null, note: null },
    { category: "service_charge", billing: "not_applicable", amount_min: null, amount_max: null, note: null },
  ];
  return base.map((charge) => ({ ...charge, ...overrides[charge.category] }));
}

function seat(id: string, partial: Partial<Seat>): Seat {
  return {
    id,
    room_label: "Room A",
    seat_type: "shared",
    beds_in_room: 2,
    washroom: "common",
    has_balcony: false,
    rent: 4500,
    available_from: "2026-12-01",
    status: "available",
    ...partial,
  };
}

/** A seeded listing: the detail shape plus who owns it. Derived fields are filled in by the server. */
export interface FixtureSeed {
  owner_id: string;
  owner_phone: string;
  detail: Omit<MessDetail, "mess" | "distances" | "rules"> & { mess: MessDetailsInput & { last_confirmed_at: string } };
}

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

const lister = (id: string, full_name: string) => ({ id, full_name, avatar_url: null });

export function seedListings(): FixtureSeed[] {
  return [
    {
      owner_id: "fx-user-rafi",
      owner_phone: "+8801700000001",
      detail: {
        id: "fx-mess-1",
        title: "Single seat in 4-person mess, Notun Bazar",
        description: "Third-floor mess five minutes from the main road. Quiet study house, meal manager rotates monthly.",
        subtype: "mess",
        status: "active",
        is_verified: true,
        address: "Road 4, Notun Bazar, Badda",
        location_lat: 23.7967,
        location_lng: 90.4405,
        area: { id: "fx-area-notun-bazar", name: "Notun Bazar" },
        lister: lister("fx-user-rafi", "Rafi Ahmed"),
        media: [
          { id: "fx-m1-1", url: ROOM, label: "room", display_order: 0 },
          { id: "fx-m1-2", url: WASHROOM, label: "washroom", display_order: 1 },
          { id: "fx-m1-3", url: BUILDING, label: "building", display_order: 2 },
          { id: "fx-m1-4", url: KITCHEN, label: "kitchen", display_order: 3 },
        ],
        mess: { ...BASE_MESS, last_confirmed_at: daysAgo(2) },
        seats: [
          seat("fx-s1-1", { room_label: "Room B", seat_type: "single", beds_in_room: 1, rent: 5000, available_from: "2026-12-01" }),
          seat("fx-s1-2", { room_label: "Room A", rent: 4200, status: "filled" }),
        ],
        charges: charges(),
        created_at: daysAgo(20),
        updated_at: daysAgo(2),
      },
    },
    {
      owner_id: "fx-user-tanvir",
      owner_phone: "+8801700000002",
      detail: {
        id: "fx-mess-2",
        title: "Shared room in student mess, Satarkul",
        description: "Two minutes from the UIU back gate. Shared bazar, everyone cooks on rotation.",
        subtype: "mess",
        status: "active",
        is_verified: false,
        address: "Satarkul Road, near United City",
        location_lat: 23.7948,
        location_lng: 90.4478,
        area: { id: "fx-area-satarkul", name: "Satarkul" },
        lister: lister("fx-user-tanvir", "Tanvir Hasan"),
        media: [
          { id: "fx-m2-1", url: ROOM_2, label: "room", display_order: 0 },
          { id: "fx-m2-2", url: WASHROOM, label: "washroom", display_order: 1 },
          { id: "fx-m2-3", url: BUILDING_2, label: "building", display_order: 2 },
        ],
        mess: {
          ...BASE_MESS,
          total_rooms: 3,
          total_seats: 6,
          current_residents: 4,
          washroom_count: 2,
          floor_level: 2,
          meal_system: "shared_bazar",
          maid_service: false,
          quiet_hours_start: null,
          quiet_hours_end: null,
          study_friendly: false,
          vibe_tags: ["cook_together", "gamers_welcome", "night_owls"],
          gate_open_time: "06:00",
          gate_close_time: null,
          last_confirmed_at: daysAgo(9),
        },
        seats: [
          seat("fx-s2-1", { room_label: "Room C", rent: 3800, available_from: "2026-11-15" }),
          seat("fx-s2-2", { room_label: "Room C", rent: 3800, available_from: "2026-11-15" }),
        ],
        charges: charges({ maid: { billing: "not_applicable", amount_min: null, note: null }, internet: { amount_min: 120 } }),
        created_at: daysAgo(30),
        updated_at: daysAgo(9),
      },
    },
    {
      owner_id: "fx-user-nusrat",
      owner_phone: "+8801700000003",
      detail: {
        id: "fx-mess-3",
        title: "Single room with attached washroom, Bashundhara",
        description: "Girls' mess run by the landlord's family on the ground floor. Lift, guard and CCTV.",
        subtype: "mess",
        status: "active",
        is_verified: true,
        address: "Block D, Bashundhara R/A",
        location_lat: 23.8186,
        location_lng: 90.4318,
        area: { id: "fx-area-bashundhara", name: "Bashundhara R/A" },
        lister: lister("fx-user-nusrat", "Nusrat Jahan"),
        media: [
          { id: "fx-m3-1", url: ROOM, label: "room", display_order: 0 },
          { id: "fx-m3-2", url: WASHROOM, label: "washroom", display_order: 1 },
          { id: "fx-m3-3", url: BUILDING, label: "building", display_order: 2 },
        ],
        mess: {
          ...BASE_MESS,
          gender_policy: "female",
          managed_by: "landlord",
          total_rooms: 4,
          total_seats: 5,
          current_residents: 4,
          washroom_count: 3,
          floor_level: 6,
          has_lift: true,
          has_generator: true,
          has_cctv: true,
          gate_open_time: "06:00",
          gate_close_time: "22:00",
          guest_policy: "not_allowed",
          meal_system: "cook_provided",
          vibe_tags: ["quiet", "clean_freak", "early_risers"],
          security_deposit: 10000,
          advance_months: 2,
          contact_channels: ["whatsapp", "phone"],
          verified_seekers_only: true,
          last_confirmed_at: daysAgo(1),
        },
        seats: [seat("fx-s3-1", { room_label: "Room 2", seat_type: "single", beds_in_room: 1, washroom: "attached", has_balcony: true, rent: 8500, available_from: "2026-12-01" })],
        charges: charges({
          meal: { billing: "fixed", amount_min: 3500, note: "Three meals a day" },
          service_charge: { billing: "fixed", amount_min: 300, note: "Lift and guard" },
          electricity: { amount_min: 500, amount_max: 800 },
        }),
        created_at: daysAgo(12),
        updated_at: daysAgo(1),
      },
    },
    {
      owner_id: "fx-user-sakib",
      owner_phone: "+8801700000004",
      detail: {
        id: "fx-mess-4",
        title: "Bed in shared room, Merul Badda",
        description: "Cheapest seat on the block, a short walk from BRACU. Self-cook kitchen.",
        subtype: "seat_share",
        status: "active",
        is_verified: false,
        address: "Merul Badda, near DIT project",
        location_lat: 23.7712,
        location_lng: 90.4222,
        area: { id: "fx-area-merul-badda", name: "Merul Badda" },
        lister: lister("fx-user-sakib", "Sakib Rahman"),
        media: [
          { id: "fx-m4-1", url: ROOM_2, label: "room", display_order: 0 },
          { id: "fx-m4-2", url: WASHROOM, label: "washroom", display_order: 1 },
          { id: "fx-m4-3", url: BUILDING_2, label: "building", display_order: 2 },
        ],
        mess: {
          ...BASE_MESS,
          total_rooms: 2,
          total_seats: 6,
          current_residents: 5,
          washroom_count: 1,
          floor_level: 5,
          smoking_policy: "balcony_only",
          meal_system: "self_cook",
          maid_service: false,
          guest_policy: "overnight_with_notice",
          vibe_tags: ["night_owls", "music_ok_with_headphones"],
          security_deposit: null,
          notice_period_days: null,
          rent_last_revised_at: null,
          gate_open_time: null,
          gate_close_time: null,
          last_confirmed_at: daysAgo(4),
        },
        seats: [seat("fx-s4-1", { room_label: "Big room", beds_in_room: 3, rent: 3000, available_from: "2026-11-20" })],
        charges: charges({ maid: { billing: "not_applicable", amount_min: null, note: null } }),
        created_at: daysAgo(8),
        updated_at: daysAgo(4),
      },
    },
    {
      owner_id: "fx-user-arif",
      owner_phone: "+8801700000005",
      detail: {
        id: "fx-mess-5",
        title: "Two seats open in quiet mess, Kuril",
        description: "Walkable to NSU, IUB and AIUB. Prayer room on the roof.",
        subtype: "mess",
        status: "active",
        is_verified: true,
        address: "Kuril Chowrasta, behind the flyover",
        location_lat: 23.8199,
        location_lng: 90.4214,
        area: { id: "fx-area-kuril", name: "Kuril" },
        lister: lister("fx-user-arif", "Arif Hossain"),
        media: [
          { id: "fx-m5-1", url: ROOM, label: "room", display_order: 0 },
          { id: "fx-m5-2", url: WASHROOM, label: "washroom", display_order: 1 },
          { id: "fx-m5-3", url: BUILDING, label: "building", display_order: 2 },
        ],
        mess: {
          ...BASE_MESS,
          total_rooms: 3,
          total_seats: 6,
          current_residents: 4,
          washroom_count: 2,
          has_generator: true,
          gate_open_time: "04:45",
          vibe_tags: ["regular_prayer", "early_risers", "quiet", "study_focused"],
          last_confirmed_at: daysAgo(0),
        },
        seats: [
          seat("fx-s5-1", { room_label: "Room 1", rent: 4800, available_from: "2026-12-01" }),
          seat("fx-s5-2", { room_label: "Room 3", seat_type: "single", beds_in_room: 1, rent: 6200, available_from: "2027-01-01" }),
        ],
        charges: charges(),
        created_at: daysAgo(3),
        updated_at: daysAgo(0),
      },
    },
    {
      owner_id: "fx-user-mitu",
      owner_phone: "+8801700000006",
      detail: {
        id: "fx-mess-6",
        title: "Shared room for women, Aftabnagar",
        description: "Family building, resident manager on the same floor.",
        subtype: "mess",
        status: "active",
        is_verified: false,
        address: "Block G, Aftabnagar",
        location_lat: 23.767,
        location_lng: 90.439,
        area: { id: "fx-area-aftabnagar", name: "Aftabnagar" },
        lister: lister("fx-user-mitu", "Mitu Akter"),
        media: [
          { id: "fx-m6-1", url: ROOM_2, label: "room", display_order: 0 },
          { id: "fx-m6-2", url: WASHROOM, label: "washroom", display_order: 1 },
          { id: "fx-m6-3", url: BUILDING_2, label: "building", display_order: 2 },
        ],
        mess: {
          ...BASE_MESS,
          gender_policy: "female",
          tenant_type: "students_and_jobholders",
          total_seats: 4,
          current_residents: 2,
          washroom_count: 2,
          floor_level: 4,
          has_lift: true,
          meal_system: "meal_manager",
          vibe_tags: ["clean_freak", "cook_together"],
          last_confirmed_at: daysAgo(13),
        },
        seats: [
          seat("fx-s6-1", { room_label: "Room A", rent: 4300, washroom: "attached", available_from: "2026-11-25" }),
          seat("fx-s6-2", { room_label: "Room B", rent: 4300, available_from: "2026-12-10" }),
        ],
        // One unanswered category: shown in search, but without "All costs declared".
        charges: charges().filter((charge) => charge.category !== "service_charge"),
        created_at: daysAgo(40),
        updated_at: daysAgo(13),
      },
    },
  ];
}

/** The account phone numbers the fixture backend reveals for a listing. */
export const FIXTURE_DEFAULT_PHONE = "+8801700000099";
