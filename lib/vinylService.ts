import { collection, doc, getDoc, setDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './firebase'
import type { VinylData, StickerPlacement } from './types'

// Firestore rejects writes with any `undefined` value anywhere in the tree
// ("Unsupported field value: undefined"). Recursively drop them so optional
// fields on stickers / Spotify metadata never trip the writer.
function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(stripUndefined) as unknown as T
  }
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined) continue
      out[k] = stripUndefined(v)
    }
    return out as T
  }
  return value
}

export async function saveVinyl(params: {
  name: string
  playlistName: string
  coverImageFile: File | null
  stickers: StickerPlacement[]
  tracks: string[]
  spotifyPlaylistId?: string | null
  spotifyPlaylistUrl?: string | null
  spotifyUserId?: string | null
}): Promise<string> {
  const id = crypto.randomUUID()

  let coverImageUrl: string | null = null
  if (params.coverImageFile) {
    const storageRef = ref(storage, `covers/${id}`)
    await uploadBytes(storageRef, params.coverImageFile)
    coverImageUrl = await getDownloadURL(storageRef)
  }

  const vinyl: VinylData = {
    id,
    name: params.name,
    playlistName: params.playlistName,
    coverImageUrl,
    stickers: params.stickers,
    tracks: params.tracks,
    createdAt: new Date().toISOString(),
    ...(params.spotifyPlaylistId ? { spotifyPlaylistId: params.spotifyPlaylistId } : {}),
    ...(params.spotifyPlaylistUrl ? { spotifyPlaylistUrl: params.spotifyPlaylistUrl } : {}),
    ...(params.spotifyUserId ? { spotifyUserId: params.spotifyUserId } : {}),
  }

  await setDoc(doc(collection(db, 'vinyls'), id), stripUndefined(vinyl))
  return id
}

export async function getVinyl(id: string): Promise<VinylData | null> {
  const snap = await getDoc(doc(collection(db, 'vinyls'), id))
  if (!snap.exists()) return null
  return snap.data() as VinylData
}
