'use client'
import { useRef } from 'react'
import { useVinylStore } from '@/lib/vinylStore'
import VinylCover from '@/components/vinyl/VinylCover'

interface Props {
  onBack: () => void
  onNext: () => void
}

export default function Step2Cover({ onBack, onNext }: Props) {
  const { coverImagePreviewUrl, setCoverImage, tracks } = useVinylStore()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setCoverImage(file)
    // reset so re-selecting same file triggers onChange
    e.target.value = ''
  }

  return (
    <div className="flex flex-col items-center w-full px-4">
      <h2 className="font-jacquarda text-lg sm:text-xl text-gray-700 mb-4 sm:mb-6 tracking-wider">Decorate your vinyl case</h2>

      <div className="w-full flex justify-center">
        <div className="sm:hidden">
          <VinylCover coverImageUrl={coverImagePreviewUrl} tracks={tracks} size={280} />
        </div>
        <div className="hidden sm:block">
          <VinylCover coverImageUrl={coverImagePreviewUrl} tracks={tracks} size={420} />
        </div>
      </div>

      <button
        className="font-jacquarda text-base sm:text-lg text-gray-500 mt-3 sm:mt-4 hover:text-gray-800 transition-colors"
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

      <div className="flex gap-4 sm:gap-8 mt-8 sm:mt-12">
        <button className="btn-tape text-base sm:text-lg px-6 sm:px-10 py-2 sm:py-3" onClick={onBack}>Back</button>
        <button className="btn-tape text-base sm:text-lg px-6 sm:px-10 py-2 sm:py-3" onClick={onNext}>Next</button>
      </div>
    </div>
  )
}
