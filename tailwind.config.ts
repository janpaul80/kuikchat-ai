import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // KuikChat brand palette (extracted from logo)
        brand: {
          blue: {
            50: '#EAF3FE',
            100: '#CCDFFB',
            200: '#9DC0F7',
            300: '#6BA0F2',
            400: '#3F84EE',
            500: '#1E5BCB', // primary blue (top-left of logo)
            600: '#1947A8',
            700: '#143885',
            800: '#0F2A63',
            900: '#0B1E47',
          },
          green: {
            50: '#EAFBEF',
            100: '#CFF5D9',
            200: '#A6EAB7',
            300: '#7DDF94',
            400: '#5BC967', // top-right of logo
            500: '#3FAF52',
            600: '#2F8C40',
            700: '#246A31',
            800: '#1B4F25',
            900: '#13371A',
          },
          teal: {
            500: '#1AAFA0', // "blah" text in logo
          },
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #1E5BCB 0%, #5BC967 100%)',
        'brand-gradient-vertical': 'linear-gradient(180deg, #1E5BCB 0%, #5BC967 100%)',
        'brand-gradient-radial': 'radial-gradient(circle at top left, #1E5BCB 0%, #1AAFA0 50%, #5BC967 100%)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(30, 91, 203, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(91, 201, 103, 0.6)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Cal Sans"', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
