/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Premium color palette - elegant, timeless, no blue/purple
        brand: {
          cream: '#FFF8F0',
          beige: '#F5E6D3',
          sand: '#E8D5C4',
          terracotta: '#D4835C',
          rust: '#A8543A',
          copper: '#D97942',
          bronze: '#CD7F32',
        },
        energy: {
          solar: '#F59E0B',    // Amber - sun energy
          gold: '#EAB308',     // Gold - premium feel
          sage: '#84A98C',     // Sage green - eco-friendly
          forest: '#52796F',   // Forest green - sustainability
          mint: '#8FBC8F',     // Mint green - fresh energy
          olive: '#6B8E23',    // Olive - natural
        },
        neutral: {
          charcoal: '#2D3748',
          graphite: '#1A202C',
          slate: '#475569',
          ash: '#64748B',
          silver: '#94A3B8',
          pearl: '#E2E8F0',
        },
        accent: {
          coral: '#FF6B6B',
          peach: '#FFB088',
          sunset: '#FF8C42',
          warm: '#FFAB73',
        },
        glass: {
          light: 'rgba(255, 248, 240, 0.08)',
          medium: 'rgba(255, 248, 240, 0.12)',
          dark: 'rgba(0, 0, 0, 0.3)',
        },
      },
      fontFamily: {
        display: ['Poppins', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-lg': ['4.5rem', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display': ['3.5rem', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        'heading-1': ['3rem', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '-0.01em' }],
        'heading-2': ['2.25rem', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-3': ['1.875rem', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-4': ['1.5rem', { lineHeight: '1.4', fontWeight: '500' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75' }],
        'body': ['1rem', { lineHeight: '1.75' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.05em' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-premium': 'linear-gradient(135deg, #2D3748 0%, #1A202C 50%, #0F1419 100%)',
        'gradient-energy': 'linear-gradient(135deg, #F59E0B 0%, #EAB308 50%, #84A98C 100%)',
        'gradient-warm': 'linear-gradient(135deg, #FFB088 0%, #FF8C42 100%)',
        'mesh-subtle': 'radial-gradient(at 40% 20%, rgba(245, 158, 11, 0.15) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(132, 169, 140, 0.15) 0px, transparent 50%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 8s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'shimmer': 'shimmer 3s linear infinite',
        'energy-flow': 'energyFlow 2.5s ease-in-out infinite',
        'slide-left': 'slideLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-subtle': 'bounceSubtle 1s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(24px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.92)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(245, 158, 11, 0.6), 0 0 60px rgba(245, 158, 11, 0.4)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        energyFlow: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '25%': { opacity: '1' },
          '75%': { opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        'glass-lg': '0 16px 48px 0 rgba(0, 0, 0, 0.4)',
        'glow-amber': '0 0 30px rgba(245, 158, 11, 0.4)',
        'glow-gold': '0 0 30px rgba(234, 179, 8, 0.4)',
        'glow-sage': '0 0 30px rgba(132, 169, 140, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(245, 158, 11, 0.1)',
        'elevated': '0 20px 60px -15px rgba(0, 0, 0, 0.5)',
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}

