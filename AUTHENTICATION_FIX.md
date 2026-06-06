# Spotify Authentication Cookie Fix

## Problem
Cookies were not persisting after OAuth callback, causing 401 errors when trying to retrieve tokens.

## Root Cause
In Next.js 13+ App Router, the `cookies()` function from `next/headers` is **read-only** in route handlers when used with redirects. Setting cookies via `cookieStore.set()` does not persist them when followed by `NextResponse.redirect()`.

## Solution
Set cookies directly on the `NextResponse` object before returning it:

```typescript
// ❌ WRONG - Cookies won't persist with redirect
const cookieStore = cookies();
cookieStore.set('token', value, options);
return NextResponse.redirect(url);

// ✅ CORRECT - Set cookies on response object
const response = NextResponse.redirect(url);
response.cookies.set('token', value, options);
return response;
```

## Changes Made

### app/api/auth/callback/route.ts
- Changed from using `cookies().set()` to `response.cookies.set()`
- Create the redirect response first, then set cookies on it
- This ensures cookies are properly included in the redirect response headers

## Testing
1. Clear all cookies in browser
2. Navigate to `/test-spotify`
3. Click "Login with Spotify"
4. Complete OAuth flow
5. Verify cookies are set: `spotify_access_token`, `spotify_refresh_token`, `spotify_token_expires_at`
6. Verify `/api/auth/token` returns tokens successfully

## Cookie Configuration
All cookies use these settings:
- `httpOnly: true` - Prevents JavaScript access (security)
- `secure: true` in production - HTTPS only
- `sameSite: 'lax'` - CSRF protection
- `path: '/'` - Available across entire app
- `maxAge`: Token-specific expiration times

## References
- [Next.js Cookies Documentation](https://nextjs.org/docs/app/api-reference/functions/cookies)
- [NextResponse API](https://nextjs.org/docs/app/api-reference/functions/next-response)