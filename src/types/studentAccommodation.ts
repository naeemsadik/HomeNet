export type AccommodationCategory = 'student_accommodation';

export type StudentSubtype =
  | 'hostel'
  | 'mess'
  | 'dormitory'
  | 'shared_flat'
  | 'single_room'
  | 'sublet';

export type GenderPolicy = 'male' | 'female' | 'mixed';

export type MediaLabel = 'room' | 'washroom' | 'building' | 'kitchen' | 'common_area';

export type SmokingPolicy = 'allowed' | 'not_allowed' | 'balcony_only';
export type MealSystem = 'included' | 'self_managed' | 'catering' | 'none';
export type GuestPolicy = 'allowed' | 'day_only' | 'no_guests';

export interface AccommodationMediaItem {
  id: string;
  url: string;
  label: MediaLabel;
  is_primary?: boolean;
}

export interface UniversityProximity {
  university_id: string;
  university_name: string;
  walking_time_minutes: number;
  distance_meters: number;
  is_approximate?: boolean;
}

export interface AccommodationSafetyFeatures {
  floor_level: number;
  has_lift: boolean;
  has_security_guard: boolean;
  has_cctv: boolean;
  has_generator: boolean;
  has_wifi: boolean;
}

export interface AccommodationGovernance {
  rent: number;
  security_deposit: number;
  advance_months: number;
  notice_period_days: number;
  currency: 'BDT';
}

export interface AccommodationRules {
  smoking_policy: SmokingPolicy;
  quiet_hours_start?: string; // HH:mm
  quiet_hours_end?: string;   // HH:mm
  guest_policy: GuestPolicy;
  meal_system: MealSystem;
}

export interface StudentAccommodationCardItem {
  id: string;
  title: string;
  category: AccommodationCategory;
  subtype: StudentSubtype;
  gender_policy: GenderPolicy;
  total_rent: number;
  currency: 'BDT';
  primary_image_url: string;
  nearest_campus: UniversityProximity;
  available_seats: number;
  total_seats: number;
  is_saved?: boolean;
  updated_at: string;
}

export interface StudentAccommodationDetail extends StudentAccommodationCardItem {
  description: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  media: AccommodationMediaItem[];
  safety: AccommodationSafetyFeatures;
  governance: AccommodationGovernance;
  rules: AccommodationRules;
  // NOTE: Contact info is strictly hidden from the public payload.
  // Contact must be resolved via the authorized contact reveal route.
  contact_revealed?: boolean;
  contact_channels?: {
    allows_call: boolean;
    allows_whatsapp: boolean;
    masked_phone?: string;
  };
}

export interface StudentAccommodationSearchParams {
  university_id?: string;
  max_walking_time?: number;
  gender_policy?: GenderPolicy;
  subtype?: StudentSubtype;
  min_rent?: number;
  max_rent?: number;
  has_lift?: boolean;
  has_meal?: boolean;
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface StudentAccommodationSearchResponse {
  items: StudentAccommodationCardItem[];
  total: number;
  next_cursor?: string;
  has_more: boolean;
}

export interface CreateAccommodationDraftPayload {
  category: AccommodationCategory;
  subtype: StudentSubtype;
  gender_policy: GenderPolicy;
  title: string;
  description: string;
  rent: number;
  total_seats: number;
  available_seats: number;
  safety: AccommodationSafetyFeatures;
  governance: Omit<AccommodationGovernance, 'currency'>;
  rules: AccommodationRules;
  university_id: string;
  latitude: number;
  longitude: number;
}

