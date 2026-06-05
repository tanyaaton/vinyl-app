'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useVinylStore } from '@/lib/vinylStore'
import { saveVinyl } from '@/lib/vinylService'
import VinylPreview from '@/components/vinyl/VinylPreview'

type SaveState = 'saving' | 'done' | 'error'

export default function Step4Final() {
  const router = useRouter()
  const store = useVinylStore()
  const [shareUrl, setShareUrl] = useState('')
  const [saveState, setSaveState] = useState<SaveState>('saving')
  const [copied, setCopied] = useState(false)
  const hasSaved = useRef(false)

  useEffect(() => {
    if (hasSaved.current) return
    hasSaved.current = true

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Save timed out')), 15_000)
    )

    async function save() {
      try {
        const id = await Promise.race([
          saveVinyl({
            name: store.name,
            playlistName: store.playlistName,
            coverImageFile: store.coverImageFile,
            stickers: store.stickers,
          }),
          timeout,
        ])
        store.setVinylId(id)
        setShareUrl(`${window.location.origin}/vinyl/${id}`)
        setSaveState('done')
      } catch (e) {
        console.error('Save failed:', e)
        setSaveState('error')
      }
    }

    save()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleStartOver() {
    store.reset()
    router.push('/')
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="font-jacquarda text-xl text-gray-700 mb-6 tracking-wider">
        {"Here's your vinyl"}
      </h2>

      {/* Vinyl preview — always visible */}
      <VinylPreview
        name={store.name}
        playlistName={store.playlistName}
        coverImageUrl={store.coverImagePreviewUrl}
        stickers={store.stickers}
        coverSize={380}
      />

      {/* Save status row */}
      <div className="mt-10 flex flex-col items-center gap-3 w-full max-w-lg">
        {saveState === 'saving' && (
          <p className="font-jacquarda text-sm text-gray-400 animate-pulse">
            saving your vinyl…
          </p>
        )}

        {saveState === 'error' && (
          <p className="font-courier text-xs text-amber-700 text-center max-w-sm">
            ⚠ Could not save — Firebase is not configured yet. Fill in{' '}
            <code>.env.local</code> with your Firebase keys to enable share links.
          </p>
        )}

        {saveState === 'done' && shareUrl && (
          <div className="flex items-center gap-3 w-full">
            <span className="font-jacquarda text-xl text-gray-600 whitespace-nowrap">
              Share this vinyl
            </span>
            <input readOnly value={shareUrl} className="vinyl-input flex-1 text-sm" />
            <button className="btn-tape px-5 py-2 text-base" onClick={handleCopy}>
              {copied ? 'copied!' : 'copy'}
            </button>
          </div>
        )}
      </div>

      <button
        className="font-jacquarda text-base text-gray-400 hover:text-gray-700 mt-8 transition-colors"
        onClick={handleStartOver}
      >
        ↩ start over
      </button>
    </div>
  )
}
