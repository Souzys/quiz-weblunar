/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigoDark: '#0D0E1F',
        indigoSurface: '#12142E',
        indigoBorder: '#1e214a',
        emeraldCta: '#22C55E',
        emeraldCtaHover: '#16a34a',
        skyTrust: '#38BDF8',
      },
      backgroundImage: {
        'violet-magenta': 'linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)',
        'indigo-gradient': 'linear-gradient(180deg, #0D0E1F 0%, #12142E 100%)',
        'emerald-gradient': 'linear-gradient(135deg, #22C55E 0%, #16a34a 100%)',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2.5s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.025)' },
        }
      }
    },
  },
  plugins: [],
}
