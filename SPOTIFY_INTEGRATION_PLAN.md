# Spotify Integration Action Plan

## Overview
This document outlines the complete action plan for integrating Spotify API into the vinyl creation application. The integration expands the original 4-step flow to a 7-step flow that includes Spotify authentication, playlist selection, and automatic population of vinyl details with real Spotify data.

---

## Flow Transformation

### Original Flow (4 Steps)
1. **Step 1**: Enter vinyl details (artist name, album name)
2. **Step 2**: Decorate vinyl cover
3. **Step 3**: Add stickers to vinyl case
4. **Step 4**: Share vinyl

### New Flow (7 Steps)
1. **Step 1**: Enter vinyl details (artist name, album name) - *unchanged*
2. **Step 2 (NEW)**: Spotify Authentication
   - User logs into their Spotify account
   - Application requests access to profile and playlists
3. **Step 3 (NEW)**: Playlist Selection
   - Display user's playlists in a grid/list
   - User selects which playlist to create as vinyl
4. **Step 4 (MODIFIED)**: Enter vinyl details
   - Pre-filled with Spotify user's name and playlist name
   - Playlist name truncated to 8 characters if longer
   - User can edit both fields
5. **Step 5**: Decorate vinyl cover - *same as old Step 2*
   - Track list now shows real tracks from selected playlist (first 12 songs)
6. **Step 6**: Add stickers to vinyl case - *same as old Step 3*
7. **Step 7 (MODIFIED)**: Share vinyl
   - Added "Open in Spotify" button above share link
   - Links directly to the selected playlist

---

## Implementation Phases

### Phase 1: Setup & Authentication ✅ (In Progress - Debugging)
**Status**: Backend infrastructure complete, debugging cookie issue

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
  - `getUserProfile()` - Get user's Spotify profile
  - `getAllUserPlaylists()` - Fetch all playlists with pagination
  - `getVinylTrackList(playlistId)` - Get exactly 12 formatted tracks
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

#### Task 9: Test Authentication Flow ⏳ (In Progress)
- [x] Create test page at `/test-spotify`
- [x] Test login flow with test mode
- [x] Verify token storage in cookies
- [ ] **DEBUG**: Fix cookie reading issue in token endpoint
- [ ] Verify profile retrieval works
- [ ] Verify playlist retrieval works
- [ ] Test token refresh mechanism

**Current Issue**: Cookies are being set in callback but not readable in token endpoint. Added logging to debug.

---

### Phase 2: State Management (Pending)

#### Task 10: Update Vinyl Store
- [ ] Update `lib/vinylStore.ts` with Spotify state:
  ```typescript
  spotifyUser: SpotifyUser | null
  selectedPlaylist: SpotifyPlaylist | null
  isSpotifyAuthenticated: boolean
  spotifyError: string | null
  ```

#### Task 11: Add Spotify Actions
- [ ] `setSpotifyUser(user: SpotifyUser)`
- [ ] `setSelectedPlaylist(playlist: SpotifyPlaylist)`
- [ ] `clearSpotifyData()`
- [ ] `setSpotifyError(error: string)`

#### Task 12: Implement Token Management
- [ ] Add token refresh logic to store
- [ ] Handle token expiration gracefully
- [ ] Clear tokens on logout

---

### Phase 3: UI Components (Pending)

#### Task 13: Create Spotify Authentication Component
- [ ] Create `components/steps/SpotifyAuth.tsx`
- [ ] Design matching background and style from other steps
- [ ] Add "Connect to Spotify" button
- [ ] Show loading state during authentication
- [ ] Display error messages if authentication fails
- [ ] Show success message and user info after login

#### Task 14: Create Playlist Selection Component
- [ ] Create `components/steps/PlaylistSelection.tsx`
- [ ] Fetch user's playlists on mount
- [ ] Display playlists in grid layout with:
  - Playlist cover image
  - Playlist name
  - Track count
  - Creator name
- [ ] Add search/filter functionality
- [ ] Handle empty playlist state
- [ ] Show loading skeleton while fetching
- [ ] Highlight selected playlist
- [ ] Add "Continue" button (disabled until selection)

#### Task 15: Add Playlist Grid Styling
- [ ] Match vinyl app aesthetic
- [ ] Responsive grid (1 col mobile, 2-3 cols tablet, 3-4 cols desktop)
- [ ] Hover effects on playlist cards
- [ ] Selected state styling
- [ ] Loading states with skeleton screens

---

### Phase 4: Modify Existing Steps (Pending)

#### Task 16: Update Step 1 Form (Now Step 4)
- [ ] Modify `components/steps/Step1Form.tsx`
- [ ] Pre-fill artist name with Spotify user's name
- [ ] Pre-fill album name with playlist name (truncated to 8 chars)
- [ ] Implement truncation logic:
  ```typescript
  const truncatePlaylistName = (name: string): string => {
    return name.length > 8 ? name.substring(0, 8) : name;
  }
  ```
- [ ] Keep fields editable
- [ ] Show "(from Spotify)" indicator for pre-filled fields

#### Task 17: Update Final Step (Now Step 7)
- [ ] Modify `components/steps/Step4Final.tsx`
- [ ] Add "Open in Spotify" button above share link
- [ ] Button should link to: `https://open.spotify.com/playlist/${playlistId}`
- [ ] Style button to match app theme
- [ ] Only show if vinyl was created from Spotify playlist

#### Task 18: Update Vinyl Cover Component
- [ ] Modify `components/vinyl/VinylCover.tsx`
- [ ] Replace mock track list with real tracks
- [ ] Display first 12 tracks from selected playlist
- [ ] Format tracks as "Artist - Track Name"
- [ ] Handle playlists with fewer than 12 tracks
- [ ] Maintain existing styling and layout

---

### Phase 5: Update Main Flow (Pending)

#### Task 19: Update Create Page
- [ ] Modify `app/create/page.tsx`
- [ ] Update step routing to support 7 steps
- [ ] Add step 2 (SpotifyAuth) route
- [ ] Add step 3 (PlaylistSelection) route
- [ ] Adjust step numbers for existing components
- [ ] Update navigation logic between steps

#### Task 20: Update Step Indicator
- [ ] Modify `components/ui/StepIndicator.tsx`
- [ ] Update step labels:
  1. "Details"
  2. "Connect Spotify"
  3. "Select Playlist"
  4. "Edit Details"
  5. "Design Cover"
  6. "Add Stickers"
  7. "Share"
- [ ] Adjust styling for 7 steps
- [ ] Ensure responsive layout

---

### Phase 6: Track List Integration (Pending)

#### Task 21: Implement Track Extraction
- [ ] Create utility function to extract tracks from playlist
- [ ] Ensure exactly 12 tracks are selected (first 12)
- [ ] Format tracks for vinyl cover display
- [ ] Handle edge cases:
  - Playlists with < 12 tracks (repeat or show available)
  - Playlists with no tracks (show error)
  - Very long track/artist names (truncate)

#### Task 22: Update Vinyl Data Storage
- [ ] Store track list in vinyl data
- [ ] Include Spotify playlist ID for reference
- [ ] Save formatted track strings
- [ ] Ensure data persists through all steps

---

### Phase 7: Database & Persistence (Pending)

#### Task 23: Update Vinyl Service
- [ ] Modify `lib/vinylService.ts`
- [ ] Update `saveVinyl()` to include Spotify fields
- [ ] Update `getVinyl()` to retrieve Spotify data
- [ ] Ensure Firebase schema supports new fields

#### Task 24: Test Data Persistence
- [ ] Create vinyl with Spotify data
- [ ] Verify data saves to Firebase
- [ ] Retrieve vinyl and verify Spotify data intact
- [ ] Test vinyl sharing with Spotify link

---

### Phase 8: Error Handling & Edge Cases (Pending)

#### Task 25: Implement Comprehensive Error Handling
- [ ] Handle authentication failures gracefully
- [ ] Show user-friendly error messages
- [ ] Provide retry mechanisms
- [ ] Handle network errors
- [ ] Handle API rate limiting (429 responses)
- [ ] Implement exponential backoff

#### Task 26: Handle Edge Cases
- [ ] User has no playlists → Show empty state with instructions
- [ ] Playlist has no tracks → Show error, prevent selection
- [ ] Playlist has < 12 tracks → Show warning, allow selection
- [ ] Token expires during flow → Auto-refresh transparently
- [ ] User cancels Spotify auth → Return to previous step
- [ ] Spotify API is down → Show maintenance message

#### Task 27: Add Loading States
- [ ] Loading spinner during authentication
- [ ] Skeleton screens while fetching playlists
- [ ] Loading indicator while fetching tracks
- [ ] Disable buttons during async operations

---

### Phase 9: Testing & Polish (Pending)

#### Task 28: End-to-End Testing
- [ ] Test complete flow from start to finish
- [ ] Test with multiple Spotify accounts
- [ ] Test with various playlist sizes
- [ ] Test token refresh during long sessions
- [ ] Test error recovery flows
- [ ] Test on different browsers

#### Task 29: Mobile Responsiveness
- [ ] Test all new components on mobile
- [ ] Verify playlist grid is responsive
- [ ] Test authentication flow on mobile
- [ ] Ensure buttons are touch-friendly

#### Task 30: Accessibility
- [ ] Add proper ARIA labels
- [ ] Ensure keyboard navigation works
- [ ] Test with screen readers
- [ ] Verify color contrast ratios
- [ ] Add focus indicators

---

### Phase 10: Documentation (Pending)

#### Task 31: Update README
- [ ] Add Spotify integration section
- [ ] Document environment variables
- [ ] Add setup instructions for Spotify Developer account
- [ ] Include screenshots of new steps
- [ ] Document required Spotify scopes

#### Task 32: Create Troubleshooting Guide
- [ ] Common authentication issues
- [ ] Token refresh problems
- [ ] API rate limiting
- [ ] Playlist selection issues
- [ ] Contact information for support

---

## Technical Specifications

### Spotify API Endpoints Used
1. **Authorization**: `https://accounts.spotify.com/authorize`
2. **Token Exchange**: `https://accounts.spotify.com/api/token`
3. **User Profile**: `GET https://api.spotify.com/v1/me`
4. **User Playlists**: `GET https://api.spotify.com/v1/me/playlists`
5. **Playlist Tracks**: `GET https://api.spotify.com/v1/playlists/{id}/tracks`

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
│   ├── auth.ts          ✅ Authentication logic (PKCE flow)
│   └── api.ts           ✅ Spotify API service functions
├── types.ts             ✅ Updated with Spotify types
├── vinylStore.ts        ⏳ To be updated with Spotify state
└── vinylService.ts      ⏳ To be updated for Spotify data

app/
├── api/
│   └── auth/
│       ├── callback/
│       │   └── route.ts ✅ OAuth callback handler
│       ├── refresh/
│       │   └── route.ts ✅ Token refresh endpoint
│       └── token/
│           └── route.ts ✅ Token retrieval endpoint
├── test-spotify/
│   └── page.tsx         ✅ Test page for authentication
└── create/
    └── page.tsx         ⏳ To be updated for 7-step flow

components/
├── steps/
│   ├── SpotifyAuth.tsx        ⏳ To be created
│   ├── PlaylistSelection.tsx  ⏳ To be created
│   ├── Step1Form.tsx          ⏳ To be updated (pre-fill)
│   └── Step4Final.tsx         ⏳ To be updated (Spotify button)
├── vinyl/
│   └── VinylCover.tsx         ⏳ To be updated (real tracks)
└── ui/
    └── StepIndicator.tsx      ⏳ To be updated (7 steps)
```

---

## Current Status

### ✅ Completed
- Spotify Developer account setup
- Environment configuration
- Authentication module with PKCE flow
- API service with error handling
- Type definitions
- OAuth callback route with cookie storage
- Token refresh route
- Token retrieval route
- Test page for authentication

### ⏳ In Progress
- **Debugging cookie issue**: Tokens are being set in callback but not readable in token endpoint
- Added comprehensive logging to identify the issue

### ⏳ Next Steps
1. Fix cookie reading issue in token endpoint
2. Complete authentication flow testing
3. Begin Phase 2: State Management
4. Create UI components for Spotify steps

---

## Testing Checklist

### Authentication Testing
- [x] Login redirects to Spotify
- [x] User can approve access
- [x] Callback receives authorization code
- [x] Tokens are exchanged successfully
- [x] Tokens stored in HTTP-only cookies
- [ ] **DEBUG**: Token endpoint can read cookies
- [ ] Profile data can be fetched
- [ ] Playlists can be fetched
- [ ] Token refresh works automatically
- [ ] Logout clears all tokens

### Integration Testing
- [ ] Complete 7-step flow works end-to-end
- [ ] Vinyl details pre-fill correctly
- [ ] Playlist name truncates to 8 characters
- [ ] Real tracks appear on vinyl cover
- [ ] "Open in Spotify" button works
- [ ] Vinyl saves with Spotify data
- [ ] Shared vinyl includes Spotify link

### Edge Case Testing
- [ ] User with no playlists
- [ ] Playlist with < 12 tracks
- [ ] Playlist with 0 tracks
- [ ] Very long playlist names
- [ ] Token expiration during flow
- [ ] Network errors during API calls
- [ ] Rate limiting (429 responses)
- [ ] User cancels authentication

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
*Status: Phase 1 - Debugging cookie issue*
