/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2563eb',
          darkblue: '#1d4ed8',
          lightblue: '#3b82f6',
          gold: '#d97706',
          amber: '#f59e0b',
          cyan: '#0284c7',
        },
        slate: {
          main: '#f8fafc',
          surface: '#ffffff',
          border: '#e2e8f0',
          hover: '#f1f5f9',
          text: '#0f172a',
          muted: '#475569',
          dim: '#64748b',
        }
      },
      fontFamily: {
        heading: ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        body: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(0,0,0,0.04)',
        card: '0 10px 30px rgba(0,0,0,0.06)',
        glow: '0 4px 20px rgba(37, 99, 235, 0.25)',
      }
    },
  },
  plugins: [],
}
