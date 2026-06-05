'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StickerPlacement, StickerId, StickerCorner } from './types'

const CORNER_ORDER: StickerCorner[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right']

interface VinylStore {
  name: string
  playlistName: string
  coverImageFile: File | null
  coverImagePreviewUrl: string | null
  stickers: StickerPlacement[]
  vinylId: string | null

  setName: (name: string) => void
  setPlaylistName: (name: string) => void
  setCoverImage: (file: File) => void
  toggleSticker: (id: StickerId) => void
  setVinylId: (id: string) => void
  reset: () => void
}

const initialState = {
  name: '',
  playlistName: '',
  coverImageFile: null,
  coverImagePreviewUrl: null,
  stickers: [] as StickerPlacement[],
  vinylId: null,
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
          return item ? JSON.parse(item) : null
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
          stickers: state.stickers,
          vinylId: state.vinylId,
        }) as unknown as VinylStore,
    }
  )
)
