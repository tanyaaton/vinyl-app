'use client'
import { useRef } from 'react'
import { useVinylStore } from '@/lib/vinylStore'
import VinylCover from '@/components/vinyl/VinylCover'

interface Props {
  onBack: () => void
  onNext: () => void
}

export default function Step2Cover({ onBack, onNext }: Props) {
  const { coverImagePreviewUrl, setCoverImage } = useVinylStore()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setCoverImage(file)
    // reset so re-selecting same file triggers onChange
    e.target.value = ''
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="font-pixel text-xs text-gray-700 mb-6 tracking-wider">Decorate your vinyl case</h2>

      <VinylCover coverImageUrl={coverImagePreviewUrl} size={320} />

      <button
        className="font-pixel text-[10px] text-gray-500 mt-4 hover:text-gray-800 transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        + add image
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      <div className="flex gap-8 mt-12">
        <button className="btn-tape text-lg px-10 py-3" onClick={onBack}>Back</button>
        <button className="btn-tape text-lg px-10 py-3" onClick={onNext}>Next</button>
      </div>
    </div>
  )
}
