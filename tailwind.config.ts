import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'blue-dark':  '#1a3a5c',
        'blue-mid':   '#2a6090',
        'blue-light': '#4a90c4',
        'blue-pale':  '#b8d8ec',
        'blue-bg':    '#eef4fa',
        'wa-green':   '#25d366',
        'wesal-gold': '#c8a96e',
      },
      fontFamily: {
        arabic: ['Tajawal', 'sans-serif'],
        sans:   ['Montserrat', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease both',
        'pulse-dot': 'pulse 2s infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
