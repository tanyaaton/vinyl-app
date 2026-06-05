import { collection, doc, getDoc, setDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './firebase'
import type { VinylData, StickerPlacement } from './types'

export async function saveVinyl(params: {
  name: string
  playlistName: string
  coverImageFile: File | null
  stickers: StickerPlacement[]
  tracks: string[]
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
  }

  await setDoc(doc(collection(db, 'vinyls'), id), vinyl)
  return id
}

export async function getVinyl(id: string): Promise<VinylData | null> {
  const snap = await getDoc(doc(collection(db, 'vinyls'), id))
  if (!snap.exists()) return null
  return snap.data() as VinylData
}
