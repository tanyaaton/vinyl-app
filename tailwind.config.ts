import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        crimson: '#8B1A1A',
        'crimson-dark': '#6B1010',
        'vinyl-yellow': '#F5C518',
        'vinyl-label-text': '#7B1818',
        'paper-bg': '#EDE9E3',
        kraft: '#C4A882',
        'kraft-dark': '#A8906A',
      },
      fontFamily: {
        // Jacquarda: general UI, buttons, labels, name on vinyl
        jacquarda: ['"Jacquarda"', 'cursive'],
        // Mrs Sheppards: playlist name (big script on vinyl label)
        sheppards: ['"MrsSheppards"', 'cursive'],
        // Courier Prime: user input fields
        courier: ['"CourierPrime"', '"Courier New"', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
