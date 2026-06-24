/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // allbirds-inspired natural palette
        cream: '#F7F5F0',
        paper: '#FFFFFF',
        ink: '#2B2A28',
        muted: '#807A70',
        line: '#E6E1D6',
        sand: '#ECE6DA',
        'sand-dark': '#DED6C6',
        sage: '#7C8A77',
        'sage-dark': '#5E6B5A',
        clay: '#C28E6E',
        'clay-dark': '#A9744F',
      },
      fontFamily: {
        sans: ['Assistant', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(43,42,40,0.04), 0 4px 16px rgba(43,42,40,0.06)',
        pop: '0 8px 30px rgba(43,42,40,0.12)',
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
