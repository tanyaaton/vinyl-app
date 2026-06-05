'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useVinylStore } from '@/lib/vinylStore'
import { saveVinyl } from '@/lib/vinylService'
import VinylPreview from '@/components/vinyl/VinylPreview'

export default function Step4Final() {
  const router = useRouter()
  const store = useVinylStore()
  const [shareUrl, setShareUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const hasSaved = useRef(false)

  useEffect(() => {
    if (hasSaved.current) return
    hasSaved.current = true

    async function save() {
      setSaving(true)
      try {
        const id = await saveVinyl({
          name: store.name,
          playlistName: store.playlistName,
          coverImageFile: store.coverImageFile,
          stickers: store.stickers,
        })
        store.setVinylId(id)
        setShareUrl(`${window.location.origin}/vinyl/${id}`)
      } catch (e) {
        setError('Could not save your vinyl. Please check your Firebase config.')
        console.error(e)
      } finally {
        setSaving(false)
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
      <h2 className="font-jacquarda text-xl text-gray-700 mb-6 tracking-wider">{"Here's your vinyl"}</h2>

      {saving ? (
        <div className="font-jacquarda text-lg text-gray-500 my-16">Saving your vinyl…</div>
      ) : (
        <>
          <VinylPreview
            name={store.name}
            playlistName={store.playlistName}
            coverImageUrl={store.coverImagePreviewUrl}
            stickers={store.stickers}
            coverSize={300}
          />

          {error && (
            <p className="font-courier text-xs text-red-600 mt-4 max-w-sm text-center">{error}</p>
          )}

          {shareUrl && (
            <div className="flex items-center gap-3 mt-10">
              <span className="font-jacquarda text-xl text-gray-600 whitespace-nowrap">Share this vinyl</span>
              <input
                readOnly
                value={shareUrl}
                className="vinyl-input w-64 text-sm"
              />
              <button className="btn-tape px-5 py-2 text-base" onClick={handleCopy}>
                {copied ? 'copied!' : 'copy'}
              </button>
            </div>
          )}

          <button
            className="font-jacquarda text-base text-gray-400 hover:text-gray-700 mt-8 transition-colors"
            onClick={handleStartOver}
          >
            ↩ start over
          </button>
        </>
      )}
    </div>
  )
}
