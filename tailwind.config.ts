import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        crimson: '#8B1A1A',
        'crimson-dark': '#6B1010',
        'vinyl-yellow': '#F5C518',
        'vinyl-label-text': '#7B1818',
        'paper-bg': '#E8E3DC',
        kraft: '#C4A882',
        'kraft-dark': '#A8906A',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        gothic: ['"UnifrakturMaguntia"', 'cursive'],
        script: ['"Dancing Script"', 'cursive'],
      },
    },
  },
  plugins: [],
}

export default config
