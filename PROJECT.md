# Project: Circle Wishes Short Video Support (Memoria / loves-edition)

## Architecture
The feature enables contributors to submit short videos (1–15s, <=20MB) as an alternative to photos for Circle Wishes. The implementation spans 4 modules:
1. **Contributor Submission Module (`src/app/c/[slug]/ContributorForm.jsx` & API endpoints)**:
   - Unified media file input accepting `image/*,video/mp4,video/webm,video/quicktime`.
   - Client-side validation for file size (<=20MB) and video duration (1–15.9s via HTML5 video `loadedmetadata` with WebKit `Infinity` guard).
   - Dual-mode preview: compressed image preview vs muted looping `<video>` preview.
   - Post-submission success screen rendering video or photo appropriately.
   - Backend upload endpoint (`POST /api/upload-public`) enforces server-side 20MB limit and stores files to Cloudflare R2 / filesystem.
   - Circle wishes endpoint (`POST /api/circle-wishes/[slug]` & `src/lib/wishes.js`) stores both `photoUrl` and `mediaUrl` with optional `mediaType` for 100% backward compatibility.
2. **Gift Display & Bento Grid Module (`src/components/CircleWishesSection.jsx`)**:
   - Live-photo style video card rendering: `<video autoPlay loop muted playsInline webkit-playsinline="" preload="metadata">` with `pointer-events-none` inside `aspect-[4/3]` container.
   - 100% clean visual design with NO badges or icons on cards.
   - Wish detail modal with interactive audio toggle (`"🔊 Dengarkan dengan Suara"` / `"🔇 Bisukan Video"` and click-to-unmute on video element).
   - Elevated modal backdrop z-index to `z-[100]` to blanket floating `MusicPlayer`.
   - Decoupled lifecycle effects: unmount cleanup calls `onVideoAudioChange(false)` while state resets only when a new wish opens.
3. **Gift Audio Coordination Module (`src/app/[slug]/GiftPage.jsx`)**:
   - `onVideoAudioChange(isActive)` callback coordination between `CircleWishesSection` and `GiftPage`.
   - Pauses gift background music (`audioRef`) when video sound is active; safely resumes music on video mute, pause, or modal dismissal (via ESC, backdrop click, or close button) only if music was previously playing.
   - Avoids restarting background music if user manually paused music prior to opening the modal.
4. **Studio Moderation Module (`src/app/studio/page.jsx` & `src/app/studio/[slug]/edit/page.jsx`)**:
   - Studio Dashboard "View Details" modal renders interactive `<video controls playsInline preload="metadata">` for video submissions so Aldo can review video and sound.
   - Fixes data-loss bug in `handleSaveEditedWish` by preserving `photoUrl` / `mediaUrl`.
   - Studio Editor Tab "Circle Wishes" displays video player, supports editing media URL, and allows deleting video wishes without affecting photo or text-only wishes.

## Feature Inventory
| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|--------|
| F1 | Unified Media Input | Single file input accepting images and videos (`image/*,video/mp4,video/webm,video/quicktime`) with drag-and-drop | M1 | ORIGINAL_REQUEST §R1 | DONE |
| F2 | Client-Side 20MB Limit | Reject files > 20MB before upload with friendly Indonesian error message | M1 | ORIGINAL_REQUEST §R1 | DONE |
| F3 | Client-Side Duration Validation | Reject videos < 1s or > 15.9s using HTML5 `loadedmetadata` before upload | M1 | ORIGINAL_REQUEST §R1 | DONE |
| F4 | Contributor Form Preview | Dual-mode preview: image compression info vs HTML5 looping muted video preview with duration/size badge | M1 | ORIGINAL_REQUEST §R1 | DONE |
| F5 | Contributor Success View Video Support | Render video preview if submitted wish media is a video on success screen | M1 | Survey Explorer 1 | DONE |
| F6 | Server API & Storage Compatibility | Store both `photoUrl` and `mediaUrl` in `POST /api/circle-wishes/[slug]` & `src/lib/wishes.js` | M1 | Survey Explorer 1 | DONE |
| F7 | Bento Grid Live-Photo Video Card | `<video autoPlay loop muted playsInline webkit-playsinline="" preload="metadata">` filling frame, `pointer-events-none`, 100% clean without badges | M1 | ORIGINAL_REQUEST §R2 | DONE |
| F8 | Modal Video Player | Modal renders video in high resolution with muted autoplay initial state and interactive sound toggle | M1 | ORIGINAL_REQUEST §R3 | DONE |
| F9 | Modal Audio Sync & Background Music Control | `onVideoAudioChange` pauses background music when video unmuted, resumes on mute/pause/modal close | M1 | ORIGINAL_REQUEST §R3 | DONE |
| F10 | Leak-Proof Modal Dismissal & Stacking | ESC key, backdrop click, close button, and unmount hook all restore audio state; modal z-index `z-[100]` | M1 | Survey Explorer 2 | DONE |
| F11 | Studio Dashboard Video Preview & Edit Fix | Render video player with controls in View Details modal; fix `handleSaveEditedWish` data-loss bug | M1 | ORIGINAL_REQUEST §R4 | DONE |
| F12 | Studio Editor Circle Wishes Video Tab | Display video player in editor tab, support URL editing and deletion without photo/text regressions | M1 | ORIGINAL_REQUEST §R4 | DONE |
| F13 | Build Verification & Non-Regression | Clean `npm run build` exit code 0; existing wishes, photos, and texts function 100% normally | M1 | ORIGINAL_REQUEST §Criteria | DONE |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Circle Wishes Video Upload & Playback Integration | Implement R1, R2, R3, R4 across ContributorForm, CircleWishesSection, GiftPage, Studio Dashboard & Editor, and verify clean build | none | DONE |

## Interface Contracts
### `ContributorForm` ↔ `POST /api/upload-public`
- Input: `FormData` with field `file` (File object)
- Validation: Server checks `file.size <= 20MB`; returns HTTP 400 if exceeded.
- Output: `{ ok: true, url: "https://..." }` or `{ ok: false, error: "..." }`

### `ContributorForm` ↔ `POST /api/circle-wishes/[slug]`
- Payload: `{ name: string, message: string, photoUrl: string, mediaUrl: string, mediaType?: "video"|"photo" }`
- Output: `{ ok: true, wish: { id, name, message, photoUrl, mediaUrl, createdAt } }`

### `CircleWishesSection` ↔ `GiftPage`
- Prop: `onVideoAudioChange?: (isActive: boolean) => void`
- Trigger: Called with `true` when video in modal is unmuted and playing sound; called with `false` when video is muted, paused, ended, or modal is closed.
- Expected behavior in `GiftPage`:
  - When `isActive === true`: record `wasMusicPlayingBeforeWishVideoRef.current = isPlaying`, pause `audioRef.current`.
  - When `isActive === false`: if `wasMusicPlayingBeforeWishVideoRef.current && isPlaying`, resume `audioRef.current.play()`.

### Media Detection Helper
- Standard regex: `const isVideoMedia = (url) => typeof url === 'string' && /\.(mp4|webm|mov)(\?.*)?$/i.test(url.split('#')[0]);`

## Code Layout
- `src/lib/videoValidation.js`: Helper functions `isVideoMedia(url)` and `checkVideoMetadata(file, minDuration, maxDuration)` with iOS NaN guard.
- `src/app/c/[slug]/ContributorForm.jsx`: Unified upload, client-side validation, dual preview, success view.
- `src/app/api/upload-public/route.js`: Server-side size validation and public upload handler.
- `src/app/api/circle-wishes/[slug]/route.js`: Dual field handling (`photoUrl` & `mediaUrl`).
- `src/lib/wishes.js`: Backend wish persistence ensuring backward compatibility.
- `src/components/CircleWishesSection.jsx`: Bento grid video cards, modal video player, audio toggle, decoupled lifecycle effects.
- `src/app/[slug]/GiftPage.jsx`: Background music coordination with `CircleWishesSection`.
- `src/app/studio/page.jsx`: View details video preview player and wish edit data-loss fix.
- `src/app/studio/[slug]/edit/page.jsx`: TabCircleWishes video preview and URL editing.
