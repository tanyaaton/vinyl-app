# Spotify Integration Action Plan

## Overview
This document outlines the complete action plan for integrating Spotify API into the vinyl creation application. The integration prepends a single new step to the original 4-step flow (resulting in 5 steps) that combines Spotify authentication and playlist selection, then threads the selected playlist's data through the remaining steps (pre-filled vinyl details, real track list on the cover, "Open in Spotify" button on the share screen).

---

## Flow Transformation

### Original Flow (4 Steps)
1. **Step 1**: Enter vinyl details (artist name, album name)
2. **Step 2**: Decorate vinyl cover
3. **Step 3**: Add stickers to vinyl case
4. **Step 4**: Share vinyl

### New Flow (5 Steps)
1. **Step 1 (NEW)**: Spotify Connect + Playlist Selection — single page
   - Matches the visual style of the other step screens (background, typography, buttons)
   - User logs in via Spotify's OAuth flow
   - App reads the user's profile (display name) and full playlist list
   - Playlists render in a grid; user picks one
2. **Step 2** (was old Step 1, MODIFIED): Enter vinyl details
   - Artist name pre-filled with the Spotify display name
   - Album name pre-filled with the selected playlist name, truncated to the first 8 characters when longer
   - Both fields remain editable
3. **Step 3** (was old Step 2, MODIFIED): Decorate vinyl cover
   - Track list on the cover renders the first 12 real tracks from the selected playlist instead of the `song1`…`song12` mock
4. **Step 4** (was old Step 3): Add stickers
   - No functional change — renumbering only
5. **Step 5** (was old Step 4, MODIFIED): Share vinyl
   - "Open in Spotify" button rendered directly above the share link, linking to the selected playlist's Spotify page

---

## Implementation Phases

### Phase 1: Setup & Authentication ✅ (Complete)
**Status**: Backend infrastructure complete, end-to-end auth verified on the test page (profile + playlists fetched successfully).

#### Task 1: Setup Spotify Developer Account ✅
- [x] Register application at https://developer.spotify.com/dashboard
- [x] Configure redirect URI: `http://127.0.0.1:3000/api/auth/callback`
- [x] Note Client ID for environment variables

#### Task 2: Configure Environment Variables ✅
- [x] Create/update `.env.local` with:
  ```
  NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id
  NEXT_PUBLIC_REDIRECT_URI=http://127.0.0.1:3000/api/auth/callback
  ```

#### Task 3: Create Authentication Module ✅
- [x] Create `lib/spotify/auth.ts`
- [x] Implement PKCE flow functions:
  - `generateCodeVerifier()` - Generate random string
  - `generateCodeChallenge()` - SHA-256 hash of verifier
  - `initiateSpotifyAuth(testMode)` - Start OAuth flow with state parameter
  - `exchangeCodeForToken()` - Exchange code for tokens
  - `getValidAccessToken()` - Fetch token from API endpoint with auto-refresh
  - `refreshAccessToken()` - Refresh expired tokens
  - `clearTokens()` - Clear authentication state

#### Task 4: Create API Service ✅
- [x] Create `lib/spotify/api.ts`
- [x] Implement API functions:
  - `getUserProfile()` - Get user's Spotify profile (`GET /me`)
  - `getAllUserPlaylists()` - Fetch all playlists with pagination (`GET /me/playlists`)
  - `getVinylTrackList(playlistId)` - Get exactly 12 formatted tracks (uses non-deprecated `GET /playlists/{id}/items`)
  - `formatTrackForVinyl(track)` - Format as "Artist - Track Name"
- [x] Implement error handling with `SpotifyAPIError` class
- [x] Add rate limiting support (429 handling with Retry-After)

#### Task 5: Add Type Definitions ✅
- [x] Update `lib/types.ts` with:
  - `SpotifyUser` interface
  - `SpotifyPlaylist` interface
  - `SpotifyTrack` interface
  - `SpotifyTokens` interface
- [x] Update `VinylData` interface with optional Spotify fields:
  - `spotifyPlaylistId?: string`
  - `spotifyPlaylistName?: string`
  - `spotifyUserId?: string`
  - `spotifyUserName?: string`

#### Task 6: Create OAuth Callback Route ✅
- [x] Create `app/api/auth/callback/route.ts`
- [x] Extract code verifier from state parameter
- [x] Exchange authorization code for tokens
- [x] Store tokens in HTTP-only cookies
- [x] Support test mode flag in state parameter
- [x] Redirect to appropriate page based on mode

#### Task 7: Create Token Refresh Route ✅
- [x] Create `app/api/auth/refresh/route.ts`
- [x] Read refresh token from HTTP-only cookie
- [x] Call Spotify token refresh endpoint
- [x] Update cookies with new tokens
- [x] Return new access token to client

#### Task 8: Create Token Retrieval Route ✅
- [x] Create `app/api/auth/token/route.ts`
- [x] Read tokens from HTTP-only cookies
- [x] Return tokens to client-side code
- [x] Handle missing token cases
- [x] Add comprehensive logging for debugging

#### Task 9: Test Authentication Flow ✅
- [x] Create test page at `/test-spotify`
- [x] Test login flow with test mode
- [x] Verify token storage in cookies
- [x] Fix cookie reading issue in token endpoint (see "Cookie Issue — Root Cause & Fix" below)
- [x] Verify profile retrieval works
- [x] Verify playlist retrieval works
- [ ] Test token refresh mechanism (deferred — will exercise during longer sessions in Phase 9)

---

#### Cookie Issue — Root Cause & Fix

**Symptom**: After a successful Spotify OAuth exchange, the callback logged `Cookies set on response object`, but the very next request to `/api/auth/token` logged `All cookies: []` and returned 401. Profile and playlist fetches all failed.

**Wrong initial hypothesis (now corrected)**: We assumed `response.cookies.set()` on a `NextResponse.redirect()` was failing to emit Set-Cookie headers. It wasn't — the headers were being sent, just to a different origin than the one the test page later made fetches from.

**Actual root cause — `localhost` vs `127.0.0.1` origin mismatch**:
- `next dev` binds to both `localhost:3000` and `127.0.0.1:3000` by default.
- Per Spotify policy (and `spotify-api-guideline.md`), the redirect URI in `.env.local` must be `http://127.0.0.1:3000/...` — `http://localhost` is not allowed.
- The user opened the test page on `http://localhost:3000/test-spotify`, but the OAuth callback fired on `http://127.0.0.1:3000/api/auth/callback` and set cookies on the `127.0.0.1` origin.
- Browsers treat `localhost` and `127.0.0.1` as **different origins** even though they resolve to the same IP. Once the user's tab landed back on `localhost`, the cookies stored against `127.0.0.1` were invisible — hence the empty cookie jar on `/api/auth/token`.

**Fix — applied changes**:
1. `package.json` → `"dev": "next dev -H 127.0.0.1"`. The dev server only binds the canonical origin Spotify redirects to, eliminating the `localhost`/`127.0.0.1` split for new sessions.
2. `lib/spotify/auth.ts` → added `ensureMatchingOrigin()` helper. Before initiating OAuth (and on `/test-spotify` mount), the client compares `window.location.origin` to the origin of `NEXT_PUBLIC_REDIRECT_URI` and `window.location.replace()`s to the matching origin if they differ. This makes the app self-correcting if a user lands on the wrong host.
3. `app/api/auth/callback/route.ts` → rewritten to:
   - use `request.nextUrl.origin` to build absolute redirect URLs (no chance of relative-URL ambiguity);
   - attach each cookie via `response.headers.append('Set-Cookie', …)` instead of `response.cookies.set()`, which sidesteps any quirks with cookie attachment on 307 redirect responses;
   - keep `HttpOnly`, `Path=/`, `SameSite=Lax`, `Max-Age=<expires_in>`, and `Secure` only in production.
4. `app/api/auth/token/route.ts` → read cookies from `request.cookies` (matches the working refresh route pattern), mark the route `export const dynamic = 'force-dynamic'`, and return `Cache-Control: no-store` so dev caching can't serve a stale 401.
5. `lib/spotify/auth.ts` → both client fetches to `/api/auth/token` and `/api/auth/refresh` now use `cache: 'no-store'`.

**Verification**: After restarting the dev server and opening `http://127.0.0.1:3000/test-spotify`, the OAuth flow completes, `Incoming cookies:` lists all three Spotify cookies, and the profile + playlists render correctly.

---

### Phase 2: New Step 1 — Spotify Connect + Playlist Selection (Pending)

Builds the single new screen the user sees first. Handles auth on cold visits, profile + playlist fetch on warm visits, and writes the selected playlist into the vinyl store so the rest of the flow can read it.

**Scope guardrail**: token lifecycle is owned by `getValidAccessToken()` in `lib/spotify/auth.ts` (cookie read + 5-minute expiry buffer + auto-refresh). The new screen and the Zustand store must *consume* it, never duplicate it.

**Reference**: `app/test-spotify/page.tsx` proves the working data-fetching pattern (`getUserProfile()` → `getAllUserPlaylists()`). Reuse the pattern, not the page — the test page stays as a debug harness.

#### Task 10: Extend the vinyl store with Spotify state
- [ ] Add to `lib/vinylStore.ts`:
  ```typescript
  spotifyUser: SpotifyUser | null
  selectedPlaylist: SpotifyPlaylist | null
  ```
- [ ] Add actions: `setSpotifyUser`, `setSelectedPlaylist`, `clearSpotifyData`.
- [ ] Add both to `partialize` so they persist across step navigation via sessionStorage, and clear them in `reset()`.
- [ ] Do **not** add `isSpotifyAuthenticated` (derive it via `!!spotifyUser`) or `spotifyError` (keep error UI component-local).
- [ ] `clearSpotifyData()` must also call the new `/api/auth/logout` route (Task 11). Without it, the HTTP-only cookies live for an hour.

#### Task 11: Logout API route + auth.ts cleanup
- [ ] Create `app/api/auth/logout/route.ts` returning 200 with `Max-Age=0` on `spotify_access_token`, `spotify_refresh_token`, and `spotify_token_expires_at`.
- [ ] Delete the dead `sessionStorage`-based helpers from `lib/spotify/auth.ts`: `storeTokens`, `getAccessToken`, `getRefreshToken`, `isTokenExpired`, `clearTokens`. Tokens live in HTTP-only cookies — these functions are unused and misleading.

#### Task 12: Create `components/steps/SpotifyConnect.tsx`
This single component handles both the auth state and the playlist grid — they are one page in the user-facing flow.
- [ ] Style matches other step screens (background, typography, buttons).
- [ ] On mount, attempt `getUserProfile()`:
  - On success: `setSpotifyUser(profile)`, then fetch `getAllUserPlaylists()` into local state.
  - On 401: render a "Connect to Spotify" button that calls `initiateSpotifyAuth(false)` (production mode — see Task 13).
  - On other error (network, rate limit): show inline error + retry.
- [ ] Once playlists are loaded, render a grid of cards: cover image, playlist name, track count, owner display name.
- [ ] Filter input wired to existing `searchPlaylists()` from `lib/spotify/api.ts`.
- [ ] Loading skeleton while fetching.
- [ ] Empty state if the user has zero playlists (with a link to Spotify to create one).
- [ ] Selected card highlight; clicking a card sets local "pending selection" state.
- [ ] "Continue" button (disabled until a selection): calls `setSelectedPlaylist(playlist)`, then `getVinylTrackList(playlist.id)` (already in `lib/spotify/api.ts`) and writes the 12 formatted strings into the store's `tracks` field, then advances to Step 2.
  - This is the only place the track list is fetched. Doing it here means the cover step (new Step 3) doesn't need to know about Spotify — it just renders `tracks` as it always has.

#### Task 13: Point the OAuth callback at new Step 1
- [ ] In `app/api/auth/callback/route.ts`, change the non-test-mode redirect target from `/create?step=3` to `/create?step=1`. Test mode (`/test-spotify?auth=success`) stays the same.

---

### Phase 3: New Step 2 — Pre-filled vinyl details (Pending)

#### Task 14: Modify `components/steps/Step1Form.tsx`
- [ ] On mount, read `spotifyUser` and `selectedPlaylist` from the store.
- [ ] Pre-fill the artist field with `spotifyUser?.display_name ?? ''`.
- [ ] Pre-fill the album field with `selectedPlaylist?.name` truncated to 8 characters:
  ```typescript
  const truncate8 = (s: string) => (s.length > 8 ? s.slice(0, 8) : s)
  ```
- [ ] Both fields stay editable (no `disabled`, no `readOnly`).
- [ ] If neither piece of Spotify data is present (e.g. user navigated here directly), pre-fill stays empty — must not crash.
- [ ] Use the store's existing `setName` / `setPlaylistName` actions on initial pre-fill so downstream steps see the values immediately (don't rely on local form state alone).

---

### Phase 4: New Steps 3 & 4 — Real tracks on the cover (Pending)

The track list is already loaded into the store by Task 12, so Step 3 (cover) renders the real tracks "for free". This phase is mostly verification + a small render guard.

#### Task 15: Verify `components/vinyl/VinylCover.tsx`
- [ ] Confirm it sources tracks from the store's `tracks` field (no change expected — the field is already the source of truth).
- [ ] Handle empty strings gracefully — `getVinylTrackList()` pads short playlists with `''`. The cover should render those slots as blank, not show literal empty strings or break layout.
- [ ] No formatting change needed — `formatTrackForVinyl()` already returns "Artist - Track Name".

#### Task 16: Stickers step (new Step 4)
- [ ] No functional change. Only the step number in routing/indicator changes. Verify the existing `components/steps/Step3Stickers.tsx` works untouched under the new step number.

---

### Phase 5: New Step 5 — "Open in Spotify" on the share screen (Pending)

#### Task 17: Modify `components/steps/Step4Final.tsx`
- [ ] Read `selectedPlaylist` from the store.
- [ ] When `selectedPlaylist` is present, render an "Open in Spotify" link **above** the existing share link:
  - `href = selectedPlaylist.external_urls.spotify` (the canonical URL Spotify returns — do not construct manually). Fall back to `https://open.spotify.com/playlist/${selectedPlaylist.id}` only if `external_urls.spotify` is missing.
  - `target="_blank" rel="noopener noreferrer"`.
  - Style consistent with the existing share button.
- [ ] When `selectedPlaylist` is absent (legacy vinyl, or user reached this screen without going through Step 1), hide the button — do not render a broken link.

---

### Phase 6: Step routing + indicator (Pending)

#### Task 18: Update `app/create/page.tsx`
- [ ] Switch from 4-step routing to 5-step routing:
  1. `SpotifyConnect` (new)
  2. `Step1Form` (now pre-filled)
  3. `Step2Cover`
  4. `Step3Stickers`
  5. `Step4Final`
- [ ] Make sure the OAuth callback's `?step=1` lands on `SpotifyConnect`.
- [ ] Allow "Back" from Step 2 to return to Step 1 so users can pick a different playlist (this re-fetches the new playlist's tracks via Task 12's "Continue" logic).

#### Task 19: Update `components/ui/StepIndicator.tsx`
- [ ] Update labels for 5 steps:
  1. "Pick playlist"
  2. "Details"
  3. "Cover"
  4. "Stickers"
  5. "Share"
- [ ] Adjust spacing/styling for 5 segments instead of 4. Ensure mobile layout still fits.

---

### Phase 7: Persistence (Pending)

#### Task 20: Save Spotify fields with the vinyl
- [ ] Update `lib/vinylService.ts` `saveVinyl()` to include:
  - `spotifyPlaylistId: selectedPlaylist?.id ?? null`
  - `spotifyPlaylistUrl: selectedPlaylist?.external_urls.spotify ?? null`
  - `spotifyUserId: spotifyUser?.id ?? null`
- [ ] Update `getVinyl()` to read those fields back so a saved vinyl can still show the "Open in Spotify" button after a fresh load.
- [ ] No Firestore schema change required (these are optional string fields on the existing document). Per the Spotify Developer Terms, do not persist track metadata (titles, artist names, cover images) beyond what's needed for immediate display — the formatted track strings already in `tracks` are fine for the cover, but do not cache richer Spotify content.

---

### Phase 8: Error handling & edge cases (Pending)

Carry over Phase 1's centralized handling (`SpotifyAPIError`, retry-with-backoff, 429 + Retry-After, 401). The new surface to cover:

- [ ] Step 1: user cancels Spotify auth → callback returns to `/create?step=1` with `?error=...`. Render the error and re-show the connect button.
- [ ] Step 1: zero playlists → empty state with a link to Spotify.
- [ ] Step 1: selected playlist has 0 tracks → disable "Continue" with inline message.
- [ ] Step 1: selected playlist has < 12 tracks → still selectable. `getVinylTrackList()` pads with `''`; the cover renders blank slots (Task 15).
- [ ] Token refresh during the flow → already handled silently by `getValidAccessToken()`. No new code, but confirm it during testing.
- [ ] Step 5: a saved vinyl that has no Spotify URL → hide the button instead of erroring.

---

### Phase 9: Testing & polish (Pending)

#### Task 21: End-to-end run-through
- [ ] Cold start: open `http://127.0.0.1:3000/create`, expect Step 1 to show the connect button.
- [ ] Authenticate, verify playlists load, pick one with > 12 tracks, continue.
- [ ] Step 2 details: artist matches Spotify display name, album is the first 8 characters of the playlist name. Both editable.
- [ ] Step 3 cover: tracks shown are the playlist's first 12 in "Artist - Track Name" form, not `song1`…`song12`.
- [ ] Step 4: stickers untouched.
- [ ] Step 5: "Open in Spotify" link present, opens the correct playlist in a new tab.
- [ ] Edge runs: playlist with < 12 tracks; very long playlist name (verify 8-char truncation); zero-playlist account.
- [ ] Logout via `clearSpotifyData()` — verify cookies cleared, fresh connect works.

#### Task 22: Mobile + accessibility pass
- [ ] Playlist grid responsive (1 col mobile, 2–3 tablet, 3–4 desktop).
- [ ] Keyboard nav across the playlist grid; ARIA labels on cards.
- [ ] Focus indicators visible.
- [ ] Color contrast on the connect button and selected-card highlight.

---

### Phase 10: Documentation (Pending)

#### Task 23: README updates
- [ ] Add a "Spotify integration" section explaining the 5-step flow.
- [ ] Document the env vars `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` and `NEXT_PUBLIC_REDIRECT_URI`.
- [ ] Call out that the redirect URI **must** be `http://127.0.0.1:3000/...` (not `localhost`) per Spotify policy, and that `npm run dev` binds to `127.0.0.1` via `next dev -H 127.0.0.1`.
- [ ] Link to the Spotify Developer dashboard for setting up the redirect URI.
- [ ] List required scopes (`user-read-private`, `user-read-email`, `playlist-read-private`, `playlist-read-collaborative`).

---

## Technical Specifications

### Spotify API Endpoints Used
1. **Authorization**: `https://accounts.spotify.com/authorize`
2. **Token Exchange**: `https://accounts.spotify.com/api/token`
3. **User Profile**: `GET https://api.spotify.com/v1/me`
4. **User Playlists**: `GET https://api.spotify.com/v1/me/playlists`
5. **Playlist Items**: `GET https://api.spotify.com/v1/playlists/{id}/items` (use `/items`, not the deprecated `/tracks`)

### Required Scopes
- `user-read-private` - Access user profile
- `user-read-email` - Access user email
- `playlist-read-private` - Access private playlists
- `playlist-read-collaborative` - Access collaborative playlists

### Authentication Flow (PKCE)
1. Generate code verifier (random string)
2. Generate code challenge (SHA-256 hash of verifier)
3. Redirect to Spotify authorization with challenge
4. User approves access
5. Spotify redirects back with authorization code
6. Exchange code + verifier for access token
7. Store tokens in HTTP-only cookies
8. Use access token for API requests
9. Refresh token when expired

### Security Considerations
- ✅ Use PKCE flow (no client secret exposure)
- ✅ Store tokens in HTTP-only cookies (not localStorage)
- ✅ Use HTTPS in production
- ✅ Implement token refresh before expiration
- ✅ Handle rate limiting with exponential backoff
- ✅ Validate redirect URIs
- ✅ Request minimum required scopes

---

## File Structure

```
lib/
├── spotify/
│   ├── auth.ts          ✅ PKCE flow, getValidAccessToken, ensureMatchingOrigin
│   │                       ⏳ remove dead sessionStorage helpers (Phase 2 Task 11)
│   └── api.ts           ✅ Spotify API service functions
├── types.ts             ✅ Spotify types + VinylData Spotify fields
├── vinylStore.ts        ⏳ Add spotifyUser, selectedPlaylist + actions (Phase 2 Task 10)
└── vinylService.ts      ⏳ Save/load Spotify fields (Phase 7 Task 20)

app/
├── api/
│   └── auth/
│       ├── callback/
│       │   └── route.ts ✅ OAuth callback (⏳ redirect to /create?step=1 — Phase 2 Task 13)
│       ├── refresh/
│       │   └── route.ts ✅ Token refresh endpoint
│       ├── token/
│       │   └── route.ts ✅ Token retrieval endpoint
│       └── logout/
│           └── route.ts ⏳ To be created (Phase 2 Task 11)
├── test-spotify/
│   └── page.tsx         ✅ Auth debug harness — not part of the production flow
└── create/
    └── page.tsx         ⏳ 5-step routing (Phase 6 Task 18)

components/
├── steps/
│   ├── SpotifyConnect.tsx ⏳ NEW — auth + playlist grid + track fetch (Phase 2 Task 12)
│   ├── Step1Form.tsx      ⏳ Pre-fill artist/album from Spotify (Phase 3 Task 14)
│   ├── Step2Cover.tsx     — unchanged
│   ├── Step3Stickers.tsx  — unchanged
│   └── Step4Final.tsx     ⏳ "Open in Spotify" button (Phase 5 Task 17)
├── vinyl/
│   └── VinylCover.tsx     ⏳ Verify it renders real tracks gracefully (Phase 4 Task 15)
└── ui/
    └── StepIndicator.tsx  ⏳ 5-step labels (Phase 6 Task 19)
```

---

## Current Status

### ✅ Completed
- Spotify Developer account setup
- Environment configuration
- Authentication module with PKCE flow
- API service with error handling (uses non-deprecated `/playlists/{id}/items`)
- Type definitions
- OAuth callback route with cookie storage (Set-Cookie headers attached explicitly)
- Token refresh route
- Token retrieval route (reads from `request.cookies`, `force-dynamic`, `no-store`)
- Origin guard (`ensureMatchingOrigin`) that auto-redirects `localhost` → `127.0.0.1`
- Dev server pinned to `127.0.0.1` via `next dev -H 127.0.0.1`
- Test page for authentication — end-to-end verified (login → profile → playlists)

### ⏳ Next Steps
1. **Phase 2** — Build the new Step 1 (`SpotifyConnect.tsx`): store extension, logout route, auth.ts cleanup, then the connect + playlist grid component, then point the callback at `/create?step=1`.
2. **Phase 3** — Pre-fill `Step1Form` from `spotifyUser` and `selectedPlaylist` (8-char truncation on the album field).
3. **Phase 4** — Verify `VinylCover` renders the real tracks already in the store from Task 12; handle padded blanks.
4. **Phase 5** — Add the "Open in Spotify" button to `Step4Final`.
5. **Phase 6** — Wire up 5-step routing in `app/create/page.tsx` and update `StepIndicator`.
6. **Phases 7–10** — Persistence (save Spotify fields), edge-case handling, E2E + a11y pass, README docs.

---

## Testing Checklist

### Authentication Testing
- [x] Login redirects to Spotify
- [x] User can approve access
- [x] Callback receives authorization code
- [x] Tokens are exchanged successfully
- [x] Tokens stored in HTTP-only cookies (on the `127.0.0.1` origin)
- [x] Token endpoint can read cookies
- [x] Profile data can be fetched
- [x] Playlists can be fetched
- [ ] Token refresh works automatically (deferred — needs a long session to verify)
- [ ] Logout clears all tokens

### Integration Testing
- [ ] Complete 5-step flow works end-to-end
- [ ] Step 1: playlists render and a selection writes `selectedPlaylist` + `tracks` into the store
- [ ] Step 2: artist field = Spotify display name; album field = first 8 chars of playlist name; both editable
- [ ] Step 3: real tracks (first 12, "Artist - Track Name") render on the cover instead of the `song1`…`song12` mock
- [ ] Step 5: "Open in Spotify" button present above the share link, opens the correct playlist in a new tab
- [ ] Saved vinyl persists Spotify fields and re-renders the Spotify button after reload

### Edge Case Testing
- [ ] User with no playlists → empty state with link to Spotify
- [ ] Playlist with 0 tracks → "Continue" disabled with inline message
- [ ] Playlist with < 12 tracks → cover renders blank slots for the missing tracks
- [ ] Very long playlist name → truncated to 8 chars in the album field
- [ ] Token expiration mid-flow → transparent refresh via `getValidAccessToken()`
- [ ] Network errors / 429 rate limiting → handled by `SpotifyAPIError` + retry-with-backoff
- [ ] User cancels Spotify auth → returns to Step 1 with error, can retry
- [ ] User goes back to Step 1 and picks a different playlist → `tracks` re-fetched and overwritten

---

## References

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- [Authorization Code with PKCE Flow](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow)
- [Spotify OpenAPI Specification](https://developer.spotify.com/reference/web-api/open-api-schema.yaml)
- [Spotify Developer Terms](https://developer.spotify.com/terms)
- [OAuth 2.0 PKCE RFC](https://datatracker.ietf.org/doc/html/rfc7636)

---

## Notes

- **Test Mode**: Authentication flow supports test mode flag for isolated testing
- **Cookie Security**: Using HTTP-only cookies prevents XSS attacks
- **Token Refresh**: Automatic refresh with 5-minute buffer before expiration
- **Rate Limiting**: Implements exponential backoff for 429 responses
- **Error Handling**: Comprehensive error messages for debugging
- **Pagination**: Handles large playlist collections with automatic pagination
- **Track Limit**: Exactly 12 tracks displayed on vinyl cover (first 12 from playlist)
- **Name Truncation**: Playlist names truncated to 8 characters for vinyl label

---

*Last Updated: 2026-06-06*
*Status: Phase 1 complete — auth flow verified end-to-end. Ready to start Phase 2.*
