export type StickerCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export type StickerId = 'stars' | 'stamp' | 'psilove' | 'bow'

export interface StickerPlacement {
  stickerId: StickerId
  corner: StickerCorner
}

export interface VinylData {
  id: string
  name: string
  playlistName: string
  coverImageUrl: string | null
  stickers: StickerPlacement[]
  createdAt: string
  // v2: themeColor?: string; fontFamily?: string; spotifyPlaylistId?: string
}
