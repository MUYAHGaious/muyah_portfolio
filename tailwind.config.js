/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'primary': 'var(--color-primary)',
        'primary-foreground': 'var(--color-primary-foreground)',
        'secondary': 'var(--color-secondary)',
        'secondary-foreground': 'var(--color-secondary-foreground)',
        'accent': 'var(--color-accent)',
        'accent-foreground': 'var(--color-accent-foreground)',
        'background': 'var(--color-background)',
        'surface': 'var(--color-surface)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'success': 'var(--color-success)',
        'success-foreground': 'var(--color-success-foreground)',
        'warning': 'var(--color-warning)',
        'warning-foreground': 'var(--color-warning-foreground)',
        'error': 'var(--color-error)',
        'error-foreground': 'var(--color-error-foreground)',
        'border': 'var(--color-border)',
        'border-input': 'var(--color-border-input)',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
        'heading': ['Inter', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'caption': ['JetBrains Mono', 'monospace'],
        'data': ['JetBrains Mono', 'monospace'],
      },
      fontWeight: {
        'light': '300',
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
      },
      boxShadow: {
        'floating': '0 4px 20px rgba(0, 102, 255, 0.1)', // floating-elements
        'elevated': '0 2px 8px rgba(0, 0, 0, 0.3)', // elevated-surfaces
        'glow': '0 0 20px rgba(0, 102, 255, 0.3)', // hover-glow
        'text-glow': '0 0 10px rgba(0, 102, 255, 0.5)', // text-shadow-glow
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in': 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        'glow-pulse': 'glowPulse 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 102, 255, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 102, 255, 0.5)' },
        },
      },
      transitionTimingFunction: {
        'neo': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
      },
      backdropBlur: {
        'nav': '12px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
  ],
}