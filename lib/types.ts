export type StickerCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export type StickerId = 'stars' | 'stamp' | 'psilove' | 'bow' | 'lips' | 'moon' | 'bluestamp' | 'tulips'

export type CoverImageLayout = 'full' | 'top-right'

export type VinylColor = 'default' | 'red' | 'pink' | 'blue'

export interface StickerPlacement {
  stickerId: StickerId
  corner: StickerCorner
  // Random positioning (percentage of cover area)
  x?: number  // 0-100 (percentage from left)
  y?: number  // 0-100 (percentage from top)
  rotation?: number  // -60 to +60 degrees
}

export interface VinylData {
  id: string
  name: string
  playlistName: string
  coverImageUrl: string | null
  coverImageLayout?: CoverImageLayout
  vinylColor?: VinylColor
  stickers: StickerPlacement[]
  tracks: string[]
  createdAt: string
  // Spotify integration fields
  spotifyPlaylistId?: string
  spotifyUserId?: string
  spotifyPlaylistUrl?: string
}

// Spotify-related types
export interface SpotifyUser {
  id: string
  display_name: string
  email?: string
  images?: Array<{ url: string; height?: number; width?: number }>
  followers?: { total: number }
  country?: string
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description?: string
  images: Array<{ url: string; height?: number; width?: number }>
  tracks: {
    total: number
    href: string
  }
  owner: {
    id: string
    display_name: string
  }
  public: boolean
  collaborative: boolean
  external_urls: {
    spotify: string
  }
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{
    id: string
    name: string
  }>
  album: {
    id: string
    name: string
    images: Array<{ url: string; height?: number; width?: number }>
  }
  duration_ms: number
  explicit: boolean
  external_urls: {
    spotify: string
  }
}

export interface SpotifyTokens {
  access_token: string
  refresh_token: string
  expires_in: number
  expires_at: number
  token_type: string
}
