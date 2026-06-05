'use client'
import Link from 'next/link'
import Header from '@/components/ui/Header'
import VinylDisc from '@/components/vinyl/VinylDisc'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Header />
      <main
        className="flex-1 flex flex-col items-center justify-center gap-8 sm:gap-12 px-4 relative"
        style={{ backgroundColor: '#830E0E' }}
      >
        {/* Paper effect overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'url(/paper-effect.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        <div className="relative z-10">
          <div className="sm:hidden">
            <VinylDisc size={300} landing />
          </div>
          <div className="hidden sm:block">
            <VinylDisc size={520} landing />
          </div>
        </div>

        <Link href="/create" className="relative z-10">
          <button className="btn-tape text-lg sm:text-2xl px-10 sm:px-16 py-3 sm:py-4">Create a vinyl</button>
        </Link>
      </main>
    </div>
  )
}
