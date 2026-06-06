# Vinyl App

A Next.js application for creating custom vinyl records with personalized covers and stickers.

## Prerequisites

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun
- Firebase account with Firestore and Storage enabled

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vinyl-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase + Spotify**

   Create a `.env.local` file in the root directory with your Firebase credentials and Spotify Client ID:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
   NEXT_PUBLIC_REDIRECT_URI=http://127.0.0.1:3000/api/auth/callback
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**

   Navigate to [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser. **Do not use `localhost`** — browsers treat `localhost` and `127.0.0.1` as different origins, so the Spotify auth cookies set against `127.0.0.1` won't be visible from a `localhost` tab. The dev server is pinned to `127.0.0.1` via `next dev -H 127.0.0.1`.

## Spotify Integration

The app's first step requires the user to connect a Spotify account and pick a playlist; the rest of the flow pre-fills vinyl details from the playlist and shows the playlist's first 12 real tracks on the cover.

### Spotify Developer Setup

1. Create an app at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard).
2. Copy the **Client ID** into `NEXT_PUBLIC_SPOTIFY_CLIENT_ID`.
3. Add `http://127.0.0.1:3000/api/auth/callback` as a redirect URI in the app's settings. Per Spotify's policy this is the only HTTP redirect URI allowed for local development; `http://localhost` is rejected.

### Scopes requested

- `user-read-private` — read user profile
- `user-read-email` — read user email
- `playlist-read-private` — read private playlists
- `playlist-read-collaborative` — read collaborative playlists

Auth uses Authorization Code with PKCE — no client secret is held client-side. Access and refresh tokens are stored in HTTP-only cookies; refresh is handled automatically by `getValidAccessToken()` in `lib/spotify/auth.ts` with a 5-minute expiry buffer.

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Firebase (Firestore & Storage)
- Zustand (State Management)

## Project Structure

- `/app` - Next.js app router pages
- `/components` - React components
- `/lib` - Utilities and services
- `/public` - Static assets (images, fonts, stickers)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
