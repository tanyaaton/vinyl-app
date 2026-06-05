'use client'
import Link from 'next/link'
import Header from '@/components/ui/Header'
import VinylDisc from '@/components/vinyl/VinylDisc'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main
        className="flex-1 flex flex-col items-center justify-center gap-12"
        style={{ backgroundColor: '#8B1A1A' }}
      >
        {/* Subtle wood-grain texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.02' numOctaves='4' seed='5' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='600' height='600' filter='url(%23grain)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative">
          <VinylDisc size={448} />
        </div>

        <Link href="/create">
          <button className="btn-tape text-2xl px-16 py-4">Create a vinyl</button>
        </Link>
      </main>
    </div>
  )
}
