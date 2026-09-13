# HomeNet Property Types & Classifications Specification

> **Target Audience:** Frontend Developers & UI/UX Engineers  
> **Source of Truth:** Backend Database Schema (`schema.prisma`) & API Contracts (`api.ts`, `upsert-property.dto.ts`)  
> **Generated:** September 2026

---

## 1. Primary Property Types (`type`)

The primary property type is governed by the backend database enum `PropertyType`. It must be one of the four exact lowercase string values:

| Key / API Value | Display Label | Description | UI Recommended Icon / Visual |
| :--- | :--- | :--- | :--- |
| `residential` | **Residential** | Residential living spaces (apartments, houses, villas, etc.) | Home / Building |
| `commercial` | **Commercial** | Business and retail spaces (offices, shops, floors, plazas) | Briefcase / Building2 |
| `land` | **Land** | Empty plots, residential/commercial plots, development sites | Map / LandPlot |
| `parking` | **Parking** | Dedicated garage, vehicle bays, or parking slot rentals | Car / CircleParking |

### TypeScript Definition:
```typescript
export type PropertyType = "residential" | "commercial" | "land" | "parking";
```

---

## 2. Property Subtypes (`subtype`)

The database stores `subtype` as an open string (`String?`), allowing flexible categorization. Across the application's search filters, navigation bar, cards, and wizards, the following values and cases are standard:

### 2.1 Residential Subtypes
* **`apartment`** — Standard flat / residential unit *(default card fallback)*
* **`house`** — Independent house, bungalow, or villa
* **`duplex`** — Two-story independent or semi-detached residential unit
* **`condo`** — Condominium unit
* **`short-let`** — Short-term, serviced apartments *(linked to `/rent?subtype=short-let`)*
* **`penthouse`** — Top floor luxury suite
* **`studio`** — Single-room open-plan living unit

### 2.2 Commercial Subtypes
* **`office`** — Corporate office or workplace unit
* **`office-floor`** — Entire commercial floor
* **`shop`** / **`retail`** — Retail store, showroom, or market stall
* **`warehouse`** — Storage or logistics depot
* **`building`** — Full commercial building

### 2.3 Land Subtypes
* **`residential-plot`** — Land for residential building construction
* **`commercial-plot`** — Land zoned for commercial activities
* **`plot`** — General land plot
* **`agricultural`** — Farming or rural land

### 2.4 Parking Subtypes
* **`covered`** — Covered or basement parking space
* **`open`** — Open-air parking lot slot
* **`garage`** — Enclosed private garage

---

## 3. Listing Types (`listing_type`)

Governed by enum `ListingType`:

| Value | Display Label | Typical URL Route / Filter | Notes |
| :--- | :--- | :--- | :--- |
| `sale` | **For Sale** | `/buy`, `/sell` | Default. Price is total asset value. |
| `rent` | **For Rent** | `/rent` | Price is recurring monthly rent. |

```typescript
export type ListingType = "sale" | "rent";
```

---

## 4. Property Statuses (`status`)

Governed by enum `PropertyStatus`:

| Status | Meaning & UI Behavior |
| :--- | :--- |
| `draft` | Listing is in progress or unsubmitted. Only visible to the listing owner. |
| `active` | Published, public, and searchable on feeds and browse screens. |
| `pending` | Submitted and awaiting verification or moderation review. |
| `sold` | Completed transaction; property marked as sold or rented out. |
| `archived`| Soft-deleted or hidden by the user / admin. |

```typescript
export type PropertyStatus = "draft" | "active" | "pending" | "sold" | "archived";
```

---

## 5. Type-Specific Amenity Options (`amenities`)

When users select a primary property type in the Creation Wizard or filter screens, the application exposes specific amenity chips:

### Residential Amenities:
* `parking` (Parking Space)
* `lift` (Elevator)
* `generator` (Standby Generator / Backup Power)
* `security` (24/7 Guard / Security)
* `gas` (Titas Gas / LPG Line)
* `pool` (Swimming Pool)
* `gym` (Fitness Center / Gym)
* `rooftop` (Rooftop Access)
* *Attributes:* `bedrooms` (number), `bathrooms` (number), `balconies` (number)

### Commercial Amenities:
* `parking` (Dedicated Customer/Tenant Parking)
* `lift` (Passenger & Service Lifts)
* `generator` (Full Backup Generator)
* `security` (Guard & Access Control)
* `loading_dock` (Loading Bay / Dock)
* `cctv` (Surveillance Cameras)

### Land Amenities:
* `road_access` (Paved / Wide Road Access)
* `electricity` (Grid Power Connection)
* `water` (Water Supply / Deep Tubewell)
* `gas` (Gas Connection Availability)

### Parking Amenities:
* `covered` (Covered / Indoor Slot)
* `security` (Guarded Compound)
* `cctv` (Security Camera Monitored)
* `ev_charging` (Electric Vehicle Charger)

---

## 6. Frontend TypeScript Interfaces Reference

```typescript
export interface AmenityRecord {
  [key: string]: boolean | number | string | undefined;
  bedrooms?: number;
  bathrooms?: number;
}

export interface PropertyPayload {
  title: string;
  description?: string;
  type: PropertyType;
  subtype?: string;
  listing_type: ListingType;
  price: number;
  price_currency?: string; // Default: "BDT"
  area_size?: number;
  area_unit?: "sqft" | "katha" | "bigha" | "sqm"; // Default: "sqft"
  area_id?: string;
  address?: string;
  location_lat?: number;
  location_lng?: number;
  amenities?: AmenityRecord;
  virtual_tour_url?: string;
  status?: PropertyStatus;
}
```
