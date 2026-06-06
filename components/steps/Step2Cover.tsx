'use client'
import { useRef, useState } from 'react'
import { useVinylStore } from '@/lib/vinylStore'
import VinylCover from '@/components/vinyl/VinylCover'

interface Props {
  onBack: () => void
  onNext: () => void
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif']
const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.heic', '.heif']

export default function Step2Cover({ onBack, onNext }: Props) {
  const { coverImagePreviewUrl, coverImageLayout, setCoverImage, setCoverImageLayout, tracks } = useVinylStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null)
    const file = e.target.files?.[0]
    if (file) {
      // Some browsers don't fill in a MIME type for HEIC, fall back to extension.
      const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
      const ok =
        ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.includes(ext)
      if (ok) {
        setCoverImage(file)
      } else {
        setFileError('Please pick a JPG, PNG, or HEIC image.')
      }
    }
    e.target.value = ''
  }

  return (
    <div className="flex flex-col items-center w-full px-4">
      <h2 className="font-jacquarda text-lg sm:text-xl text-gray-700 mb-4 sm:mb-6 tracking-wider">Decorate your vinyl case</h2>

      <div className="w-full flex justify-center">
        <div className="sm:hidden">
          <VinylCover coverImageUrl={coverImagePreviewUrl} coverImageLayout={coverImageLayout} tracks={tracks} size={280} />
        </div>
        <div className="hidden sm:block">
          <VinylCover coverImageUrl={coverImagePreviewUrl} coverImageLayout={coverImageLayout} tracks={tracks} size={420} />
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
        accept={ACCEPTED_TYPES.concat(ACCEPTED_EXTENSIONS).join(',')}
        className="hidden"
        onChange={handleFile}
      />

      {fileError && (
        <p className="font-courier text-xs text-red-700 mt-2">{fileError}</p>
      )}

      {coverImagePreviewUrl && (
        <div className="flex items-center gap-3 mt-3 sm:mt-4">
          <button
            type="button"
            onClick={() => setCoverImageLayout('full')}
            className={`font-jacquarda text-sm sm:text-base transition-colors ${
              coverImageLayout === 'full'
                ? 'text-gray-800 underline underline-offset-4'
                : 'text-gray-400 hover:text-gray-800'
            }`}
          >
            full cover
          </button>
          <span className="font-jacquarda text-sm text-gray-300">/</span>
          <button
            type="button"
            onClick={() => setCoverImageLayout('top-right')}
            className={`font-jacquarda text-sm sm:text-base transition-colors ${
              coverImageLayout === 'top-right'
                ? 'text-gray-800 underline underline-offset-4'
                : 'text-gray-400 hover:text-gray-800'
            }`}
          >
            top right
          </button>
        </div>
      )}

      <div className="flex gap-4 sm:gap-8 mt-8 sm:mt-12">
        <button className="btn-tape text-base sm:text-lg px-6 sm:px-10 py-2 sm:py-3" onClick={onBack}>Back</button>
        <button className="btn-tape text-base sm:text-lg px-6 sm:px-10 py-2 sm:py-3" onClick={onNext}>Next</button>
      </div>
    </div>
  )
}
