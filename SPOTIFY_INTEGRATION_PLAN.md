# Spotify Integration Plan

## Overview
This document outlines the complete action plan for integrating Spotify API into the vinyl creation application. The integration will allow users to authenticate with Spotify, select playlists, and automatically populate vinyl details with real playlist data.

---

## Current Application Flow
**Existing Steps:**
1. **Step 1**: Enter vinyl details (name, playlist name)
2. **Step 2**: Design vinyl cover (upload image)
3. **Step 3**: Add decorative stickers
4. **Step 4**: View final vinyl and share

---

## New Application Flow with Spotify Integration

### Step 1: Landing/Welcome (Unchanged)
- User starts the vinyl creation process

### Step 2: Spotify Authentication (NEW)
- **Purpose**: Authenticate user with Spotify and fetch their profile
- **UI Components**:
  - Same background and styling as other steps
  - "Connect to Spotify" button with Spotify branding
  - Loading state during authentication
  - Success message with user's Spotify profile name
- **Data Retrieved**:
  - User profile (display name, user ID)
  - User's playlists

### Step 3: Playlist Selection (NEW)
- **Purpose**: Display user's playlists and allow selection
- **UI Components**:
  - Grid/list view of user's playlists
  - Each playlist shows: name, image, track count
  - Selection mechanism (radio buttons or cards)
  - Search/filter functionality for users with many playlists
- **Data Retrieved**:
  - Selected playlist details
  - Playlist tracks (first 12 tracks)

### Step 4: Enter Vinyl Details (MODIFIED - Previously Step 2)
- **Purpose**: Confirm/edit vinyl details with pre-filled Spotify data
- **Changes**:
  - **Pre-filled fields**:
    - Name: User's Spotify display name
    - Playlist Name: Selected playlist name (truncated to 8 characters if longer)
  - **Editable**: User can modify both fields
  - **Playlist name truncation logic**: If playlist name > 8 chars, truncate and add "..."

### Step 5: Design Vinyl Cover (Previously Step 3)
- **Purpose**: Upload cover image
- **Changes**: None to functionality, just step number update

### Step 6: Add Stickers (Previously Step 4)
- **Purpose**: Decorate vinyl case
- **Changes**:
  - **Track list on cover**: Replace mock data (song1, song2, etc.) with actual track names from selected Spotify playlist
  - **Display**: First 12 tracks from playlist
  - **Format**: Side A (tracks 1-6), Side B (tracks 7-12)

### Step 7: Final View & Share (Previously Step 5)
- **Purpose**: View completed vinyl and share
- **Changes**:
  - **New button**: "Open in Spotify" - Direct link to the original Spotify playlist
  - **Position**: Above the share vinyl link
  - **Functionality**: Opens Spotify playlist in new tab/Spotify app

---

## Technical Implementation Plan

### 1. Environment Setup
**Files to create/modify:**
- `.env.local` - Store Spotify credentials
  ```
  NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id
  SPOTIFY_CLIENT_SECRET=your_client_secret
  NEXT_PUBLIC_REDIRECT_URI=http://127.0.0.1:3000/api/auth/callback
  ```

**Required values:**
- Spotify Client ID (from Spotify Developer Dashboard)
- Spotify Client Secret (from Spotify Developer Dashboard)
- Redirect URI (must match Spotify app settings)

### 2. Spotify Authentication Service
**File to create:** `lib/spotify/auth.ts`

**Responsibilities:**
- Generate PKCE code verifier and challenge
- Build authorization URL with required scopes
- Handle authorization code exchange for access token
- Implement token refresh logic
- Store tokens securely (sessionStorage/localStorage)

**Required Scopes:**
- `user-read-private` - Read user profile
- `user-read-email` - Read user email
- `playlist-read-private` - Read private playlists
- `playlist-read-collaborative` - Read collaborative playlists

**Authentication Flow:**
- Use Authorization Code with PKCE flow (recommended for client-side apps)
- Reference: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow

### 3. Spotify API Service
**File to create:** `lib/spotify/api.ts`

**Functions to implement:**
```typescript
// Get current user profile
getUserProfile(accessToken: string): Promise<SpotifyUser>

// Get user's playlists (paginated)
getUserPlaylists(accessToken: string, limit?: number, offset?: number): Promise<SpotifyPlaylist[]>

// Get playlist details including tracks
getPlaylistTracks(accessToken: string, playlistId: string): Promise<SpotifyTrack[]>

// Refresh access token
refreshAccessToken(refreshToken: string): Promise<TokenResponse>
```

**API Endpoints to use:**
- `GET /v1/me` - User profile
- `GET /v1/me/playlists` - User playlists
- `GET /v1/playlists/{playlist_id}/tracks` - Playlist tracks

**Error Handling:**
- Handle 401 (unauthorized) - trigger token refresh
- Handle 429 (rate limit) - implement exponential backoff
- Handle network errors gracefully

### 4. Type Definitions
**File to modify:** `lib/types.ts`

**New types to add:**
```typescript
// Spotify user profile
export interface SpotifyUser {
  id: string
  display_name: string
  email?: string
  images?: Array<{ url: string }>
}

// Spotify playlist
export interface SpotifyPlaylist {
  id: string
  name: string
  description?: string
  images: Array<{ url: string }>
  tracks: {
    total: number
  }
  owner: {
    display_name: string
  }
}

// Spotify track
export interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: {
    name: string
    images: Array<{ url: string }>
  }
  duration_ms: number
}

// Spotify auth tokens
export interface SpotifyTokens {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
}
```

**Modify existing VinylData interface:**
```typescript
export interface VinylData {
  id: string
  name: string
  playlistName: string
  coverImageUrl: string | null
  stickers: StickerPlacement[]
  tracks: string[]
  createdAt: string
  // NEW FIELDS:
  spotifyPlaylistId?: string  // Link to original Spotify playlist
  spotifyUserId?: string      // User who created it
}
```

### 5. State Management
**File to modify:** `lib/vinylStore.ts`

**New state fields:**
```typescript
interface VinylStore {
  // Existing fields...
  name: string
  playlistName: string
  coverImageFile: File | null
  coverImagePreviewUrl: string | null
  stickers: StickerPlacement[]
  tracks: string[]
  vinylId: string | null
  
  // NEW SPOTIFY FIELDS:
  spotifyAccessToken: string | null
  spotifyRefreshToken: string | null
  spotifyUser: SpotifyUser | null
  spotifyPlaylists: SpotifyPlaylist[]
  selectedPlaylist: SpotifyPlaylist | null
  spotifyPlaylistId: string | null
  
  // NEW ACTIONS:
  setSpotifyTokens: (access: string, refresh?: string) => void
  setSpotifyUser: (user: SpotifyUser) => void
  setSpotifyPlaylists: (playlists: SpotifyPlaylist[]) => void
  setSelectedPlaylist: (playlist: SpotifyPlaylist) => void
  setTracks: (tracks: string[]) => void
  clearSpotifyData: () => void
}
```

**Track handling logic:**
- When playlist is selected, extract first 12 track names
- Format: "Artist Name - Track Name"
- Store in `tracks` array
- Ensure exactly 12 tracks (pad with empty if needed)

### 6. API Routes
**Files to create:**

#### `app/api/auth/callback/route.ts`
- Handle OAuth callback from Spotify
- Exchange authorization code for access token
- Store tokens securely
- Redirect to create page

#### `app/api/auth/refresh/route.ts`
- Handle token refresh requests
- Exchange refresh token for new access token
- Return new tokens to client

### 7. New Step Components

#### **File to create:** `components/steps/SpotifyAuth.tsx`
**Props:**
```typescript
interface Props {
  onBack: () => void
  onNext: () => void
}
```

**Features:**
- "Connect to Spotify" button with Spotify green branding
- Loading spinner during authentication
- Error handling and retry mechanism
- Display user profile after successful auth
- Automatic progression to next step after auth

**UI Elements:**
- Spotify logo/branding
- Clear explanation of what data will be accessed
- Privacy notice
- Same paper texture background as other steps

#### **File to create:** `components/steps/PlaylistSelection.tsx`
**Props:**
```typescript
interface Props {
  onBack: () => void
  onNext: () => void
}
```

**Features:**
- Grid layout of playlist cards
- Each card shows:
  - Playlist cover image
  - Playlist name
  - Track count
  - Owner name
- Search/filter input
- Pagination for users with many playlists
- Loading states
- Empty state if no playlists found
- Selected state highlighting

**UI Elements:**
- Responsive grid (1-3 columns based on screen size)
- Hover effects on playlist cards
- Selected playlist highlighted with border/background
- "Continue" button enabled only when playlist selected

#### **File to modify:** `components/steps/Step1Form.tsx`
**Changes:**
- Pre-fill name field with Spotify user's display name
- Pre-fill playlist name with selected playlist name
- Implement 8-character truncation for playlist name
- Keep fields editable
- Add visual indicator that data is from Spotify (optional)

### 8. Component Updates

#### **File to modify:** `components/vinyl/VinylCover.tsx`
**Changes:**
- Already displays tracks array from props
- No code changes needed
- Will automatically show real track names when tracks array is updated

#### **File to modify:** `components/steps/Step4Final.tsx`
**Changes:**
- Add "Open in Spotify" button
- Position above share link
- Button styling: Spotify green (#1DB954)
- Opens playlist URL: `https://open.spotify.com/playlist/{playlistId}`
- Handle case where spotifyPlaylistId is null (hide button)

### 9. Page Flow Updates

#### **File to modify:** `app/create/page.tsx`
**Changes:**
- Update step count from 4 to 7
- Add new step components:
  ```typescript
  {step === 1 && <Step1Form onBack={() => router.push('/')} onNext={() => setStep(2)} />}
  {step === 2 && <SpotifyAuth onBack={() => setStep(1)} onNext={() => setStep(3)} />}
  {step === 3 && <PlaylistSelection onBack={() => setStep(2)} onNext={() => setStep(4)} />}
  {step === 4 && <Step1Form onBack={() => setStep(3)} onNext={() => setStep(5)} />}
  {step === 5 && <Step2Cover onBack={() => setStep(4)} onNext={() => setStep(6)} />}
  {step === 6 && <Step3Stickers onBack={() => setStep(5)} onNext={() => setStep(7)} />}
  {step === 7 && <Step4Final />}
  ```

#### **File to modify:** `components/ui/StepIndicator.tsx`
**Changes:**
- Update total steps from 4 to 7
- Update step labels:
  1. "Start"
  2. "Connect Spotify"
  3. "Select Playlist"
  4. "Vinyl Details"
  5. "Cover Design"
  6. "Decorate"
  7. "Share"

### 10. Database Schema Updates

#### **File to modify:** `lib/vinylService.ts`
**Changes:**
- Update `saveVinyl` function to include Spotify fields
- Store `spotifyPlaylistId` and `spotifyUserId` in Firestore
- Update `getVinyl` function to retrieve Spotify fields

**Firestore document structure:**
```typescript
{
  id: string
  name: string
  playlistName: string
  coverImageUrl: string
  stickers: StickerPlacement[]
  tracks: string[]  // Now contains real track names
  createdAt: Timestamp
  spotifyPlaylistId?: string
  spotifyUserId?: string
}
```

---

## Implementation Checklist

### ⚠️ IMPORTANT: Testing Protocol
**After completing each phase, STOP and wait for user testing before proceeding to the next phase.**

The implementation will follow this workflow:
1. Complete all tasks in a phase
2. **STOP** - Wait for user to test on localhost:3000
3. User will report test results
4. Fix any issues found during testing
5. Only proceed to next phase after user confirms everything works

This ensures each component is verified before building on top of it.

---

### Phase 1: Setup & Authentication
- [ ] Register app in Spotify Developer Dashboard
- [ ] Configure redirect URIs in Spotify app settings
- [ ] Add environment variables to `.env.local`
- [ ] Create `lib/spotify/auth.ts` with PKCE flow
- [ ] Create `lib/spotify/api.ts` with API functions
- [ ] Add Spotify types to `lib/types.ts`
- [ ] Create API routes for OAuth callback and token refresh
- [ ] Test authentication flow end-to-end
- [ ] **🛑 STOP - Wait for user testing on localhost:3000**

### Phase 2: State Management
- [ ] Update `lib/vinylStore.ts` with Spotify fields
- [ ] Add Spotify-related actions to store
- [ ] Implement token storage and retrieval
- [ ] Add token refresh logic
- [ ] Test state persistence across page reloads
- [ ] **🛑 STOP - Wait for user testing on localhost:3000**

### Phase 3: New Step Components
- [ ] Create `components/steps/SpotifyAuth.tsx`
- [ ] Implement Spotify login button and flow
- [ ] Add loading and error states
- [ ] **🛑 STOP - Wait for user testing of SpotifyAuth component on localhost:3000**
- [ ] Create `components/steps/PlaylistSelection.tsx`
- [ ] Implement playlist grid/list view
- [ ] Add search/filter functionality
- [ ] Implement playlist selection logic
- [ ] Test both components with real Spotify data
- [ ] **🛑 STOP - Wait for user testing of PlaylistSelection component on localhost:3000**

### Phase 4: Modify Existing Components
- [ ] Update `components/steps/Step1Form.tsx` for pre-filled data
- [ ] Implement 8-character truncation for playlist names
- [ ] **🛑 STOP - Wait for user testing of Step1Form modifications on localhost:3000**
- [ ] Update `components/steps/Step4Final.tsx` with Spotify button
- [ ] Style "Open in Spotify" button
- [ ] Test pre-filled data flow
- [ ] **🛑 STOP - Wait for user testing of Step4Final modifications on localhost:3000**

### Phase 5: Update Application Flow
- [ ] Modify `app/create/page.tsx` for 7-step flow
- [ ] Update `components/ui/StepIndicator.tsx` labels
- [ ] Update step navigation logic
- [ ] Test complete flow from start to finish
- [ ] **🛑 STOP - Wait for user testing of complete 7-step flow on localhost:3000**

### Phase 6: Track Integration
- [ ] Update track extraction logic in playlist selection
- [ ] Format tracks as "Artist - Song Name"
- [ ] Ensure exactly 12 tracks are stored
- [ ] Verify tracks display correctly on vinyl cover
- [ ] Test with playlists of various sizes
- [ ] **🛑 STOP - Wait for user testing of track display on localhost:3000**

### Phase 7: Database & Persistence
- [ ] Update `lib/vinylService.ts` to save Spotify fields
- [ ] Test saving vinyl with Spotify data
- [ ] Test retrieving vinyl with Spotify data
- [ ] Verify Spotify playlist link works on shared vinyls
- [ ] **🛑 STOP - Wait for user testing of database persistence on localhost:3000**

### Phase 8: Error Handling & Edge Cases
- [ ] Handle authentication failures
- [ ] Handle token expiration and refresh
- [ ] Handle API rate limiting (429 errors)
- [ ] Handle users with no playlists
- [ ] Handle playlists with < 12 tracks
- [ ] Handle network errors gracefully
- [ ] Add user-friendly error messages
- [ ] **🛑 STOP - Wait for user testing of error scenarios on localhost:3000**

### Phase 9: Testing & Polish
- [ ] Test with various Spotify accounts
- [ ] Test with different playlist sizes
- [ ] Test token refresh flow
- [ ] Test error recovery
- [ ] Verify mobile responsiveness
- [ ] Check accessibility
- [ ] Performance optimization
- [ ] Add loading skeletons where appropriate
- [ ] **🛑 STOP - Wait for user final testing and approval on localhost:3000**

### Phase 10: Documentation
- [ ] Update README with Spotify setup instructions
- [ ] Document environment variables
- [ ] Add troubleshooting guide
- [ ] Document API rate limits and handling
- [ ] Add user guide for Spotify features
- [ ] **✅ COMPLETE - All phases tested and approved**

---

## Security Considerations

1. **Token Storage**
   - Store access tokens in sessionStorage (cleared on tab close)
   - Never expose client secret in client-side code
   - Implement token refresh before expiration

2. **API Security**
   - Use HTTPS for all API calls
   - Validate redirect URIs match registered URIs
   - Implement CSRF protection in OAuth flow

3. **Data Privacy**
   - Request minimum required scopes
   - Clear explanation of data usage to users
   - Comply with Spotify Developer Terms of Service
   - Don't cache Spotify content beyond immediate use

4. **Error Handling**
   - Don't expose sensitive error details to users
   - Log errors securely for debugging
   - Implement rate limiting on client side

---

## Spotify Developer Terms Compliance

1. **Attribution**
   - Display Spotify branding on authentication button
   - Attribute playlist data to Spotify
   - Include "Powered by Spotify" where appropriate

2. **Data Usage**
   - Only cache data needed for immediate use
   - Don't use data for ML training
   - Respect user privacy

3. **Content Guidelines**
   - Don't modify Spotify content
   - Don't create derivative works from Spotify data
   - Link back to Spotify for full playlist experience

---

## Reference Documentation

- **Spotify Web API**: https://developer.spotify.com/documentation/web-api
- **OpenAPI Spec**: https://developer.spotify.com/reference/web-api/open-api-schema.yaml
- **Authorization Code with PKCE**: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
- **Scopes**: https://developer.spotify.com/documentation/web-api/concepts/scopes
- **Rate Limiting**: https://developer.spotify.com/documentation/web-api/concepts/rate-limits
- **Developer Terms**: https://developer.spotify.com/terms

---

## Sample Code Reference

The `spotify-api-sample` folder contains a simple authentication project that demonstrates:
- PKCE flow implementation
- Token management
- Basic API calls
- Error handling patterns

Review this sample code for implementation guidance, particularly for:
- Generating code verifier and challenge
- Building authorization URLs
- Exchanging authorization codes for tokens
- Making authenticated API requests

---

## Timeline Estimate

- **Phase 1-2** (Setup & State): 2-3 days
- **Phase 3-4** (Components): 3-4 days
- **Phase 5-6** (Flow & Tracks): 2-3 days
- **Phase 7-8** (Database & Errors): 2-3 days
- **Phase 9-10** (Testing & Docs): 2-3 days

**Total Estimated Time**: 11-16 days

---

## Success Criteria

✅ Users can authenticate with Spotify successfully
✅ Users can view and select their playlists
✅ Vinyl details are pre-filled with Spotify data
✅ Real track names appear on vinyl cover (first 12 tracks)
✅ "Open in Spotify" button works correctly
✅ Token refresh works seamlessly
✅ Error handling provides good user experience
✅ Application complies with Spotify Developer Terms
✅ All existing functionality remains intact
✅ Mobile responsive design maintained
