# Manasik

A hotel booking platform built for Hajj and Umrah pilgrims. It surfaces pilgrim-specific data — proximity to the Haram, elderly/wheelchair suitability, and family facilities — through a transparent weighted scoring system called the **Manasik Score**.

## Table of Contents

- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Manasik Score System](#manasik-score-system)
  - [Scoring Model](#scoring-model)
  - [Calculation](#calculation)
  - [Auto-derivation](#auto-derivation-for-existing-hotels)
  - [Configuring Weights](#configuring-category-weights)
  - [Manager Input Flow](#hotel-manager-input-flow)
  - [API Reference](#api-reference)
- [Database Migrations](#database-migrations)
- [Project Structure](#project-structure)

---

## Architecture

| Service | Tech | Port |
|---|---|---|
| `service/` | Node.js + Koa + TypeScript | 3001 |
| `frontend/` | Next.js 14 | 3000 |
| `management/` | Next.js 14 (admin panel) | 3002 |
| MySQL 8 | Docker | 3306 |

## Getting Started

```bash
# Start all services
docker compose up -d

# Apply any new migrations manually (see Database Migrations below)
# The frontend hot-reloads from ./frontend/src
# The API and management panel require a rebuild after source changes:
docker compose build api management && docker compose up -d api management
```

---

## Manasik Score System

Every hotel is assigned a **Manasik Score** (0–10) derived from 12 manager-entered characteristics spread across 5 weighted categories. The score is transparent to pilgrims and fully configurable by platform admins.

### Scoring Model

| # | Category | Default weight | Characteristics |
|---|---|---|---|
| 1 | **Location** | 35% | Walking time to Haram / Masjid Nabawi, Gate proximity, Route ease |
| 2 | **Pilgrim Suitability** | 25% | Elderly friendliness, Wheelchair friendliness, Family suitability, Room practicality |
| 3 | **Hotel Quality** | 20% | Cleanliness, Room comfort, Service consistency |
| 4 | **Experience Friction** | 10% | Lift delays, Crowding at peak times, Check-in smoothness |
| 5 | **User Reviews** | 10% | Derived automatically from verified guest average rating |

> **User Reviews** is read-only — managers cannot edit it. It is always computed from the hotel's `average_rating` field.

### Calculation

Characteristic inputs are on a **1–3 scale** entered by the hotel manager:

| Input | Meaning | Normalised (0–10) |
|---|---|---|
| 1 | Poor | 0 |
| 2 | Average | 5 |
| 3 | Good | 10 |

Normalisation formula: `(input - 1) / 2 × 10`

Each **category score** is the average of its normalised characteristics.

The **overall Manasik Score** is the weighted sum of all 5 category scores, divided by the total weight:

```
overall = (
  locationScore     × weightLocation     +
  pilgrimScore      × weightPilgrim      +
  qualityScore      × weightQuality      +
  frictionScore     × weightFriction     +
  reviewScore       × weightReviews
) ÷ totalWeight
```

The computed overall is rounded to one decimal place (e.g. `6.2`).

### Auto-derivation for existing hotels

When a hotel has no manager-entered `scoring_data`, the system automatically derives scores from existing DB fields:

| Characteristic | Source field |
|---|---|
| Walking time to Haram | `walking_time_to_haram` (minutes → 1–3 via thresholds) |
| Gate proximity | `distance_to_haram_meters` (≤200 m → 3, ≤600 m → 2, else → 1) |
| Elderly friendliness | `is_elderly_friendly` (true → 3, false → 1) |
| Wheelchair friendliness | `is_elderly_friendly` (true → 2, false → 1) |
| Family suitability | `has_family_rooms` (true → 3, false → 1) |
| Hotel quality characteristics | `star_rating` (≥4 → 3, ≥3 → 2, else → 1) |

Derived breakdowns are flagged with `scoringBreakdown.derived: true` in API responses so UIs can distinguish estimated from verified scores.

The computed `manasik_score` is also **cached back** to the `hotels.manasik_score` column on first view, so search sorting by Manasik Score works immediately for all hotels.

### Configuring category weights

Weights are stored as a single row in the `scoring_weights` table and managed via the admin panel.

**Admin panel** (`http://localhost:3002` → Settings → Manasik Score Weights):

- Shows all 5 categories with their current percentages
- Displays a running total that must equal 100 before saving
- Changes take effect immediately for all future score calculations

**Via API** (admin role required):

```bash
# Read current weights
curl http://localhost:3001/api/hotels/scoring-weights

# Update weights (must sum to 100)
curl -X PUT http://localhost:3001/api/hotels/scoring-weights \
  -H 'Authorization: Bearer <admin-token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "location": 35,
    "pilgrimSuitability": 25,
    "hotelQuality": 20,
    "experienceFriction": 10,
    "userReviews": 10
  }'
```

**Via DB** (emergency/seed):

```sql
UPDATE scoring_weights
SET location_weight = 35,
    pilgrim_suitability_weight = 25,
    hotel_quality_weight = 20,
    experience_friction_weight = 10,
    user_reviews_weight = 10
WHERE id = 1;
```

### Hotel manager input flow

1. Hotel manager opens their hotel via **Dashboard → Listings → [Hotel] → Edit Hotel**
2. The **Manasik Score** section at the bottom shows 4 categories (User Reviews is read-only)
3. Each characteristic has **1 · Poor**, **2 · Average**, **3 · Good** toggle buttons
4. An overall score preview updates live as inputs change
5. On save, `scoring_data` (JSON) and the recomputed `manasik_score` are persisted to the DB
6. The public hotel detail page and search cards update immediately

> On first edit, the **Walking Time to Haram** characteristic auto-populates from the hotel's existing `walking_time_to_haram` value using the walking-time thresholds.

### API reference

#### Public

```
GET  /api/hotels                    List/search hotels (includes manasikScore + scoringBreakdown)
GET  /api/hotels/search             Advanced search with filters + sorting (sortBy=manasik_score)
GET  /api/hotels/:id                Hotel detail (includes scoringData + scoringBreakdown)
GET  /api/hotels/scoring-weights    Current global category weights
```

#### Hotel manager (authenticated)

```
PUT  /api/hotels/:id                Update hotel; pass scoringData to update characteristics
```

**Scoring data payload shape:**

```json
{
  "scoringData": {
    "location": {
      "walkingTimeToHaram": 3,
      "gateProximity": 2,
      "routeEase": 2
    },
    "pilgrimSuitability": {
      "elderlyFriendliness": 3,
      "wheelchairFriendliness": 2,
      "familySuitability": 3,
      "roomPracticality": 2
    },
    "hotelQuality": {
      "cleanliness": 3,
      "roomComfort": 3,
      "serviceConsistency": 2
    },
    "experienceFriction": {
      "liftDelays": 3,
      "crowdingAtPeakTimes": 2,
      "checkinSmoothness": 3
    }
  }
}
```

**Response shape (GET /hotels/:id):**

```json
{
  "hotel": {
    "manasikScore": 7.8,
    "scoringData": { ... },
    "scoringBreakdown": {
      "overall": 7.8,
      "derived": false,
      "categories": {
        "location":           { "score": 8.3, "weight": 35 },
        "pilgrimSuitability": { "score": 8.8, "weight": 25 },
        "hotelQuality":       { "score": 8.3, "weight": 20 },
        "experienceFriction": { "score": 8.3, "weight": 10 },
        "userReviews":        { "score": 6.0, "weight": 10 }
      }
    }
  }
}
```

#### Admin only

```
PUT  /api/hotels/scoring-weights    Update category percentages (must sum to 100)
```

---

## Database Migrations

Migrations live in `service/database/migrations/`. They are **not auto-applied** — run them manually against the running MySQL container:

```bash
docker exec -i booking_mysql mysql -u root -proot booking_platform < service/database/migrations/016-add-scoring-system.sql
```

| File | Purpose |
|---|---|
| `000-consolidated-schema.sql` | Full baseline schema |
| `011-add-hajj-umrah-hotel-features.sql` | Hajj-specific columns (walking time, view type, manasik_score, etc.) |
| `014-create-messaging-tables.sql` | Conversations, messages, participants |
| `016-add-scoring-system.sql` | `scoring_data JSON` column on hotels; `scoring_weights` table |

---

## Project Structure

```
Manasik/
├── service/                          # Koa API
│   ├── src/
│   │   ├── features/hotel/
│   │   │   ├── routes/hotel.routes.ts          # All hotel endpoints
│   │   │   ├── services/scoring.service.ts     # Scoring calculation engine
│   │   │   ├── services/hotel-search.service.ts
│   │   │   └── repositories/hotel.repository.ts
│   │   └── routes/user.routes.ts               # /me/bookings etc.
│   └── database/migrations/
│
├── frontend/                         # Next.js customer-facing app (port 3000)
│   └── src/
│       ├── types/scoring.ts                    # Shared scoring types + helpers
│       ├── components/
│       │   ├── Stay/HotelCard.tsx              # Listing card with 5-dot indicator
│       │   ├── StayDetails/
│       │   │   ├── StayDetailsContent.tsx      # Hotel detail page
│       │   │   └── ManasikScoreBreakdown.tsx   # Public score card (no weights)
│       │   └── Dashboard/
│       │       ├── DashboardHotelDetailsContent.tsx
│       │       └── HotelScoringEditor.tsx      # Manager 1-3 input UI
│       └── app/
│
└── management/                       # Next.js admin panel (port 3002)
    └── src/app/admin/
        └── settings/page.tsx         # Category weights configuration
```
