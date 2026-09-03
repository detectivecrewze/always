# Project: Circle Wishes (Kado Keroyokan Ulang Tahun) in Memoria

## Architecture
- **Overview**: 100% backward-compatible, strictly additive extension to Memoria (`loves-edition`) that enables collective group birthday wishes ("Kado Keroyokan") alongside existing couple/solo gifts.
- **Data Flow**:
  1. Organizer distributes Contributor Portal link `/c/[slug]`.
  2. Friends submit name, message, and 1 memory photo from mobile or desktop.
  3. Client-side HTML5 Canvas automatically compresses high-res mobile photos (>5MB–10MB) down to <1MB before uploading.
  4. Photo uploaded via `/api/upload-public` (backed by Cloudflare R2 / local fallback).
  5. Submission saved via discrete append-only key `wish:${slug}:${wishId}` in Cloudflare KV / `data/wishes/${slug}/${wishId}.json` in local filesystem, ensuring 0 race conditions.
  6. Organizer reviews, edits typos, removes spam, and reorders wishes in Studio Editor (`/studio/[slug]/edit`).
  7. Final curated array stored inside `gift:${slug}.circleWishes`.
  8. `GiftPage.jsx` renders `CircleWishesSection.jsx` alongside `ReasonCards` when `circleWishes` exists, styled using active theme CSS variables.

## Feature Inventory
| # | Feature | Description | Milestone | Status | Source |
|---|---------|-------------|-----------|--------|--------|
| 1 | Backward-Compatible Schema & Guards | Existing gifts without `circleWishes` run 100% unaffected with zero DOM changes | M4 | DONE | R1, survey |
| 2 | Anti-Collision Discrete Storage | Cloudflare KV & local filesystem storage using `wish:${slug}:${wishId}` preventing race condition overwrites | M2 | DONE | R3, survey |
| 3 | Wishes Ingestion & Fetch APIs | Endpoints `/api/circle-wishes/[slug]` for submitting wishes and syncing into studio | M2 | DONE | R3, survey |
| 4 | Client-Side Canvas Image Compression | `src/lib/imageCompression.js` downscales and compresses >5MB photos to <1MB with 2-pass safety | M2 | DONE | R2, survey |
| 5 | Mobile-First Contributor Portal | Clean, elegant submission page at `/c/[slug]` (with `/contribute/[slug]` alias) with privacy isolation | M3 | DONE | R2, survey |
| 6 | Contributor UI Feedback & States | Live image preview, compression badge, upload progress, and celebratory success state | M3 | DONE | R2, survey |
| 7 | Interactive CircleWishesSection Component | Bento/polaroid card layout in `src/components/CircleWishesSection.jsx` using theme CSS variables | M4 | DONE | R4, survey |
| 8 | Expandable Modal with Framer Motion | Smooth spring modal dialog, backdrop blur, ESC key dismiss, and scroll lock | M4 | DONE | R4, survey |
| 9 | GiftPage.jsx Integration | Placed after ReasonCards/SeasonsSection and before Gallery, guarded by double checks | M4 | DONE | R4, survey |
| 10 | Studio Editor Circle Wishes Tab | Tab `'Circle Wishes'` in `src/app/studio/[slug]/edit/page.jsx` for managing submissions | M5 | DONE | R5, survey |
| 11 | Studio Review, Edit & Reorder | Ability to edit typos, delete inappropriate cards, reorder with `↑`/`↓`, and add manual wishes | M5 | DONE | R5, survey |
| 12 | Contributor Link Sharing in Studio | 1-click copy button for `/c/[slug]` link in Studio Editor | M5 | DONE | R5, survey |
| 13 | Build & Regression Hardening | `npm run build` exits 0; legacy gifts and order forms verified intact | M6 | DONE | Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Survey & Architecture Mapping | Full codebase investigation, schema analysis, theme review | none | DONE |
| M2 | Ingestion Backend & Image Compression | KV anti-collision storage, `/api/circle-wishes/[slug]` API, `imageCompression.js` | M1 | DONE |
| M3 | Mobile-First Contributor Portal | Route `/c/[slug]`, `/contribute/[slug]` redirect, form UI, compression integration | M2 | DONE |
| M4 | CircleWishesSection & GiftPage | `src/components/CircleWishesSection.jsx`, integration in `GiftPage.jsx`, theme harmony | M3 | DONE |
| M5 | Studio Editor Management | `TabCircleWishes` in `edit/page.jsx`, sync, edit, reorder, delete, copy portal link | M4 | DONE |
| M6 | Verification, Non-Regression & Quality Gate | Automated build, multi-agent audit (Reviewers, Challengers, Auditor), backward compatibility | M5 | DONE |

## Interface Contracts

### Contributor Submission Payload (POST `/api/circle-wishes/[slug]`)
```json
{
  "name": "Sarah Jenkins",
  "message": "Happy 21st Birthday! So grateful for all our memories together! ✨",
  "photoUrl": "https://pub-...r2.dev/uploads/...jpg",
  "createdAt": "2026-09-04T03:55:00.000Z"
}
```

### Stored Wish Object (`wish:${slug}:${wishId}` & in `gift.circleWishes`)
```json
{
  "id": "1725410001234-7a8f9c2d",
  "name": "Sarah Jenkins",
  "message": "Happy 21st Birthday! So grateful for all our memories together! ✨",
  "photoUrl": "https://pub-...r2.dev/uploads/...jpg",
  "createdAt": "2026-09-04T03:55:00.000Z"
}
```

### `CircleWishesSection` Component Props
```javascript
<CircleWishesSection
  wishes={data.circleWishes} // Array of wish objects
  recipient={data.recipient}  // string (e.g. "Nadia")
  moment={data.moment}        // string (e.g. "Ultah")
/>
```

## Code Layout
- `src/lib/imageCompression.js` — Client-side HTML5 canvas image compression utility.
- `src/lib/wishes.js` — Storage abstraction for Circle Wishes (Cloudflare KV & local filesystem fallback with path traversal protection).
- `src/app/api/circle-wishes/[slug]/route.js` — Ingestion & listing API endpoint with strict regex whitelisting and 404 gift verification.
- `src/app/c/[slug]/page.jsx` — Contributor Portal page with privacy isolation.
- `src/app/c/[slug]/ContributorForm.jsx` — Interactive mobile-first submission form with live compression feedback.
- `src/app/contribute/[slug]/page.jsx` — Canonical redirect to `/c/[slug]`.
- `src/components/CircleWishesSection.jsx` — Interactive showcase component in GiftPage with Framer Motion modal.
- `src/app/[slug]/GiftPage.jsx` — Main gift renderer (incorporating CircleWishesSection alongside ReasonCards).
- `src/app/studio/[slug]/edit/page.jsx` — Studio Editor with TabCircleWishes (link copy, sync, edit, reorder, delete).
