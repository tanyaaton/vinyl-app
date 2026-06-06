import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getVinyl } from '@/lib/vinylService'
import Header from '@/components/ui/Header'
import VinylPreview from '@/components/vinyl/VinylPreview'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const vinyl = await getVinyl(params.id)
  if (!vinyl) return { title: 'Vinyl not found' }
  return {
    title: `${vinyl.playlistName} by ${vinyl.name} — get your vinyl`,
    description: `${vinyl.name} created a vinyl for their playlist "${vinyl.playlistName}". Create yours!`,
    openGraph: {
      title: `${vinyl.playlistName} by ${vinyl.name}`,
      description: 'Create your own personalised vinyl record',
      images: vinyl.coverImageUrl ? [vinyl.coverImageUrl] : [],
    },
  }
}

export default async function SharePage({ params }: Props) {
  const vinyl = await getVinyl(params.id)
  if (!vinyl) notFound()

  return (
    <div className="flex flex-col min-h-screen paper-texture">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center py-8 sm:py-12 px-4">
        <h2 className="font-jacquarda text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 tracking-wider">
          {vinyl.name}'s vinyl
        </h2>

        <div className="w-full flex justify-center overflow-visible">
          <div className="sm:hidden">
            <VinylPreview
              name={vinyl.name}
              playlistName={vinyl.playlistName}
              coverImageUrl={vinyl.coverImageUrl}
              coverImageLayout={vinyl.coverImageLayout}
              vinylColor={vinyl.vinylColor}
              stickers={vinyl.stickers}
              tracks={vinyl.tracks}
              coverSize={240}
              interactive={true}
            />
          </div>
          <div className="hidden sm:block">
            <VinylPreview
              name={vinyl.name}
              playlistName={vinyl.playlistName}
              coverImageUrl={vinyl.coverImageUrl}
              coverImageLayout={vinyl.coverImageLayout}
              vinylColor={vinyl.vinylColor}
              stickers={vinyl.stickers}
              tracks={vinyl.tracks}
              coverSize={320}
              interactive={true}
            />
          </div>
        </div>

        <p className="font-sheppards text-gray-500 text-xl sm:text-2xl mt-6 sm:mt-10 text-center px-4">
          {vinyl.playlistName} · by {vinyl.name}
        </p>

        {vinyl.spotifyPlaylistUrl && (
          <a
            href={vinyl.spotifyPlaylistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-tape text-sm sm:text-base px-8 sm:px-10 py-2 sm:py-3 mt-6 sm:mt-8 inline-block"
          >
            ♫ open in spotify
          </a>
        )}

        <a
          href="/"
          className="btn-tape text-sm sm:text-base px-8 sm:px-10 py-2 sm:py-3 mt-4 sm:mt-6 inline-block"
        >
          Create yours
        </a>
      </main>
    </div>
  )
}

// Made with Bob
