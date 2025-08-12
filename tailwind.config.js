/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
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
        // Premium Design System Colors
        primary: {
          DEFAULT: '#0073EA', // Professional blue
          50: '#E6F3FF',
          100: '#CCE7FF',
          200: '#99CFFF',
          300: '#66B7FF',
          400: '#339FFF',
          500: '#0073EA', // Main
          600: '#0056B3',
          700: '#003D7A',
          800: '#002952',
          900: '#001429',
          light: '#4A9EFF',
          dark: '#0056B3',
          foreground: '#FFFFFF',
        },
        
        // Premium Background System
        workspace: '#F6F7FB', // Light gray workspace
        header: '#323338', // Dark header
        surface: '#FFFFFF', // White cards/surfaces
        overlay: 'rgba(0, 0, 0, 0.4)', // Modal overlays
        
        // Status Color System
        status: {
          success: '#00CA72', // Green - completed/done
          progress: '#F0D000', // Yellow - in progress/waiting
          blocked: '#E2445C', // Red - blocked/canceled
          planning: '#9D4EDD', // Purple - planning/someday
          todo: '#C4C4C4', // Light gray - not started
          next: '#FF9500', // Orange - ready to work on
          waiting: '#F0D000', // Yellow - blocked/waiting
          done: '#00CA72', // Green - completed
          someday: '#9D9D9D', // Medium gray - someday/maybe
          canceled: '#E2445C', // Red - canceled
        },
        
        // Priority System
        priority: {
          high: '#E2445C', // Red - Priority A
          medium: '#FF9500', // Orange - Priority B
          low: '#0073EA', // Blue - Priority C
          none: '#676879', // Neutral gray - No priority
          a: '#E2445C',
          b: '#FF9500',
          c: '#0073EA',
        },
        
        // Context Colors
        context: {
          work: '#0073EA', // Work context - blue
          home: '#9D4EDD', // Home context - purple
        },
        
        // Semantic Colors
        border: '#E1E5E9',
        input: '#F8F9FB',
        ring: '#0073EA',
        background: '#FFFFFF',
        foreground: '#1A1D29',
        secondary: {
          DEFAULT: '#F8F9FB',
          foreground: '#676879',
        },
        destructive: {
          DEFAULT: '#E2445C',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F8F9FB',
          foreground: '#676879',
        },
        accent: {
          DEFAULT: '#F8F9FB',
          foreground: '#1A1D29',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#1A1D29',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1A1D29',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        'slide-down': {
          from: { opacity: 0, transform: 'translateY(-4px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: 0, transform: 'translateY(4px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        'scale-in': {
          from: { opacity: 0, transform: 'scale(0.95)' },
          to: { opacity: 1, transform: 'scale(1)' },
        },
        'glassmorphism': {
          '0%': { 
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.1)'
          },
          '100%': { 
            backdropFilter: 'blur(20px)',
            background: 'rgba(255, 255, 255, 0.2)'
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'slide-down': 'slide-down 0.2s ease-out',
        'slide-up': 'slide-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'glassmorphism': 'glassmorphism 0.3s ease-in-out',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      minWidth: {
        '64': '16rem',
        '80': '20rem',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'premium': '0 4px 20px rgba(0, 115, 234, 0.1)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.15)',
        'glassmorphic': '0 8px 32px rgba(31, 38, 135, 0.15)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}