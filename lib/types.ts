export type StickerCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export type StickerId = 'stars' | 'stamp' | 'psilove' | 'bow' | 'lips' | 'moon' | 'bluestamp' | 'tulips'

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
  stickers: StickerPlacement[]
  tracks: string[]
  createdAt: string
  // v2: themeColor?: string; fontFamily?: string; spotifyPlaylistId?: string
}
