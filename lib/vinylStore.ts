'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StickerPlacement, StickerId, StickerCorner, SpotifyUser, SpotifyPlaylist, CoverImageLayout, VinylColor, TrackTextColor } from './types'

const CORNER_ORDER: StickerCorner[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right']

interface VinylStore {
  name: string
  playlistName: string
  coverImageFile: File | null
  coverImagePreviewUrl: string | null
  coverImageLayout: CoverImageLayout
  trackTextColor: TrackTextColor
  vinylColor: VinylColor
  stickers: StickerPlacement[]
  tracks: string[]
  vinylId: string | null
  spotifyUser: SpotifyUser | null
  selectedPlaylist: SpotifyPlaylist | null

  setName: (name: string) => void
  setPlaylistName: (name: string) => void
  setCoverImage: (file: File) => void
  setCoverImageLayout: (layout: CoverImageLayout) => void
  setTrackTextColor: (color: TrackTextColor) => void
  setVinylColor: (color: VinylColor) => void
  toggleSticker: (id: StickerId) => void
  setVinylId: (id: string) => void
  setTracks: (tracks: string[]) => void
  setSpotifyUser: (user: SpotifyUser | null) => void
  setSelectedPlaylist: (playlist: SpotifyPlaylist | null) => void
  clearSpotifyData: () => Promise<void>
  reset: () => void
}

const initialState = {
  name: '',
  playlistName: '',
  coverImageFile: null,
  coverImagePreviewUrl: null,
  coverImageLayout: 'full' as CoverImageLayout,
  trackTextColor: 'gray' as TrackTextColor,
  vinylColor: 'default' as VinylColor,
  stickers: [] as StickerPlacement[],
  tracks: ['song1', 'song2', 'song3', 'song4', 'song5', 'song6', 'song7', 'song8', 'song9', 'song10', 'song11', 'song12'],
  vinylId: null,
  spotifyUser: null as SpotifyUser | null,
  selectedPlaylist: null as SpotifyPlaylist | null,
}

// Ensure tracks array always has 12 items
const ensureTracksLength = (tracks: string[]): string[] => {
  if (tracks.length >= 12) return tracks.slice(0, 12)
  const result = [...tracks]
  while (result.length < 12) {
    result.push(`song${result.length + 1}`)
  }
  return result
}

export const useVinylStore = create<VinylStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setName: (name) => set({ name }),
      setPlaylistName: (playlistName) => set({ playlistName }),

      setCoverImage: (file) => {
        const prev = get().coverImagePreviewUrl
        if (prev) URL.revokeObjectURL(prev)
        set({ coverImageFile: file, coverImagePreviewUrl: URL.createObjectURL(file) })
      },

      setCoverImageLayout: (coverImageLayout) => set({ coverImageLayout }),

      setTrackTextColor: (trackTextColor) => set({ trackTextColor }),

      setVinylColor: (vinylColor) => set({ vinylColor }),

      toggleSticker: (id) => {
        const { stickers } = get()
        const existing = stickers.find((s) => s.stickerId === id)
        if (existing) {
          set({ stickers: stickers.filter((s) => s.stickerId !== id) })
          return
        }
        if (stickers.length >= 4) return
        const usedCorners = new Set(stickers.map((s) => s.corner))
        const corner = CORNER_ORDER.find((c) => !usedCorners.has(c))!
        
        // Generate random position and rotation
        // Position: 20-80% to keep stickers well within bounds (accounting for rotation)
        const x = Math.floor(Math.random() * 60) + 20
        const y = Math.floor(Math.random() * 60) + 20
        // Rotation: -60 to +60 degrees
        const rotation = Math.floor(Math.random() * 121) - 60
        
        set({ stickers: [...stickers, { stickerId: id, corner, x, y, rotation }] })
      },

      setVinylId: (id) => set({ vinylId: id }),

      setTracks: (tracks) => set({ tracks: ensureTracksLength(tracks) }),

      setSpotifyUser: (spotifyUser) => set({ spotifyUser }),

      setSelectedPlaylist: (selectedPlaylist) => set({ selectedPlaylist }),

      clearSpotifyData: async () => {
        set({ spotifyUser: null, selectedPlaylist: null })
        try {
          await fetch('/api/auth/logout', { method: 'POST', cache: 'no-store' })
        } catch {
          // Network failure leaves the cookies in place; they'll expire on their own.
        }
      },

      reset: () => {
        const prev = get().coverImagePreviewUrl
        if (prev) URL.revokeObjectURL(prev)
        set(initialState)
      },
    }),
    {
      name: 'vinyl-wizard',
      storage: {
        getItem: (key) => {
          if (typeof window === 'undefined') return null
          const item = sessionStorage.getItem(key)
          if (!item) return null
          const parsed = JSON.parse(item)
          // Ensure tracks always has 12 items when loading from storage
          if (parsed.state?.tracks) {
            parsed.state.tracks = ensureTracksLength(parsed.state.tracks)
          }
          return parsed
        },
        setItem: (key, value) => {
          if (typeof window !== 'undefined')
            sessionStorage.setItem(key, JSON.stringify(value))
        },
        removeItem: (key) => {
          if (typeof window !== 'undefined') sessionStorage.removeItem(key)
        },
      },
      // File objects can't be serialised — exclude them
      partialize: (state: VinylStore) =>
        ({
          name: state.name,
          playlistName: state.playlistName,
          coverImageLayout: state.coverImageLayout,
          trackTextColor: state.trackTextColor,
          vinylColor: state.vinylColor,
          stickers: state.stickers,
          tracks: ensureTracksLength(state.tracks),
          vinylId: state.vinylId,
          spotifyUser: state.spotifyUser,
          selectedPlaylist: state.selectedPlaylist,
        }) as unknown as VinylStore,
    }
  )
)
