import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './admin-pwa/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // BLACKSITE_AMBER design tokens — SafetyNews Pro
      colors: {
        // shadcn/ui semantic tokens mapped to BLACKSITE_AMBER
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

        // BLACKSITE_AMBER palette — direct colour tokens
        charcoal: {
          DEFAULT: '#0A0A0B',
          50: '#1a1a1c',
          100: '#141416',
          200: '#0e0e10',
          300: '#0A0A0B',
        },
        amber: {
          DEFAULT: '#FFA51F',
          dim: '#CC8419',
          glow: 'rgba(255, 165, 31, 0.15)',
          border: 'rgba(255, 165, 31, 0.3)',
        },
        paper: {
          DEFAULT: '#F2EFEA',
          muted: '#E8E4DC',
          dim: '#C8C2B6',
        },

        // Editorial UI colours
        ink: '#1A1612',
        rule: 'rgba(242, 239, 234, 0.08)',

        // H&S severity (enforcement-grade, not consumer-friendly)
        severity: {
          critical: '#E53E3E',
          high: '#DD6B20',
          medium: '#D69E2E',
          low: '#38A169',
        },

        // Sector accents (secondary only — amber remains primary)
        sector: {
          construction: '#F6AD55',
          manufacturing: '#68D391',
          healthcare: '#76E4F7',
          hospitality: '#F687B3',
          food: '#FBD38D',
          agriculture: '#9AE6B4',
          logistics: '#90CDF4',
          office: '#B794F4',
        },
      },

      fontFamily: {
        // Newsreader: editorial body copy, drop caps, pull quotes
        serif: ['var(--font-newsreader)', 'Georgia', 'serif'],
        // Inter: UI chrome, navigation, labels
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        // IBM Plex Mono: case numbers, fines, regulation citations, data
        mono: ['var(--font-ibm-plex-mono)', 'Menlo', 'monospace'],
      },

      fontSize: {
        // Typographic scale — editorial weight matters
        'display': ['clamp(2.5rem, 5vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'headline': ['clamp(1.75rem, 3.5vw, 2.5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'subhead': ['clamp(1.25rem, 2vw, 1.5rem)', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7' }],   // 18px — optimal reading size
        'body': ['1rem', { lineHeight: '1.65' }],
        'caption': ['0.8125rem', { lineHeight: '1.5' }],   // 13px
        'data': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.01em' }],  // mono data labels
      },

      borderRadius: {
        // SafetyNews Pro — minimal radius, editorial not consumer
        lg: '2px',
        md: '1px',
        sm: '0',
        DEFAULT: '1px',
      },

      spacing: {
        // Reading measure constraints
        'measure': '68ch',
        'measure-wide': '80ch',
      },

      keyframes: {
        // shadcn/ui base
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },

        // Solari flip — split-flap character rotation
        'solari-flip': {
          '0%': { transform: 'rotateX(0deg)' },
          '50%': { transform: 'rotateX(-90deg)' },
          '100%': { transform: 'rotateX(0deg)' },
        },

        // Amber glow decay on new prosecution entry
        'amber-glow': {
          '0%': { boxShadow: '0 0 0 2px #FFA51F', opacity: '1' },
          '100%': { boxShadow: '0 0 0 0 transparent', opacity: '1' },
        },

        // Digit-only pulse (active readers counter — trailing digit only)
        'digit-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },

        // Candle flicker (fatality clock glyph)
        'candle': {
          '0%, 100%': { opacity: '0.6', transform: 'scaleY(1)' },
          '50%': { opacity: '0.9', transform: 'scaleY(1.04)' },
        },

        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },

      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'solari-flip': 'solari-flip 0.12s ease-in-out',
        'amber-glow': 'amber-glow 3s ease-out forwards',
        'digit-pulse': 'digit-pulse 2s ease-in-out infinite',
        'candle': 'candle 3s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        // No gradient-brand — BLACKSITE_AMBER doesn't do gradients as brand
        'scanline': 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,165,31,0.02) 2px, rgba(255,165,31,0.02) 4px)',
      },

      boxShadow: {
        'amber': '0 0 0 1px rgba(255, 165, 31, 0.3)',
        'amber-strong': '0 0 0 2px #FFA51F',
        'amber-glow': '0 0 20px rgba(255, 165, 31, 0.2)',
        'editorial': '0 1px 0 0 rgba(242, 239, 234, 0.08)',
        'inset-rule': 'inset 0 -1px 0 rgba(242, 239, 234, 0.08)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
}

export default config
