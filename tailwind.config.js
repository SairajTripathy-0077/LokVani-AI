/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background:  'rgb(var(--background) / <alpha-value>)',
        foreground:  'rgb(var(--foreground) / <alpha-value>)',
        card: {
          DEFAULT:    'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT:    'rgb(var(--popover) / <alpha-value>)',
          foreground: 'rgb(var(--popover-foreground) / <alpha-value>)',
        },
        primary: {
          DEFAULT:    'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT:    'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT:    'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT:    'rgb(var(--accent) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT:    'rgb(var(--destructive) / <alpha-value>)',
        },
        border:  'rgb(var(--border) / <alpha-value>)',
        input:   'rgb(var(--input) / <alpha-value>)',
        ring:    'rgb(var(--ring) / <alpha-value>)',
        sidebar: {
          DEFAULT:               'rgb(var(--sidebar) / <alpha-value>)',
          foreground:            'rgb(var(--sidebar-foreground) / <alpha-value>)',
          primary:               'rgb(var(--sidebar-primary) / <alpha-value>)',
          'primary-foreground':  'rgb(var(--sidebar-primary-foreground) / <alpha-value>)',
          accent:                'rgb(var(--sidebar-accent) / <alpha-value>)',
          'accent-foreground':   'rgb(var(--sidebar-accent-foreground) / <alpha-value>)',
          border:                'rgb(var(--sidebar-border) / <alpha-value>)',
          ring:                  'rgb(var(--sidebar-ring) / <alpha-value>)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        heading: ['Roboto Condensed', 'Tiro Devanagari Hindi', 'sans-serif'],
        body:    ['Roboto Condensed', 'Noto Sans Devanagari', 'ui-sans-serif', '-apple-system', 'sans-serif'],
        condensed: ['Roboto Condensed', 'Noto Sans Devanagari', 'Arial Narrow', 'sans-serif'],
        sans: ['Roboto Condensed', 'Noto Sans Devanagari', 'ui-sans-serif', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up':   { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
