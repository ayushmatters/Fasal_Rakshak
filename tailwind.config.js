module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        /* Dark Green Theme */
        'primary-bg': '#0d2b1a',
        'primary-dark': '#051f10',
        'primary-light': '#0f3d2a',
        'accent': '#8fc76e',
        'accent-light': '#b8e5a0',
        'accent-dark': '#6fa850',
        'text-neutral': '#e9f5ea',
        'text-muted': '#9bb49b',
        'text-strong': '#ffffff',
        
        /* Legacy colors for compatibility */
        primary: '#18A558',
        brand: {
          500: '#18A558',
          700: '#0F6B3C'
        },
        leaf: '#C8E6C9',
        muted: '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial']
      },
      borderRadius: {
        md: '12px',
        sm: '8px'
      },
      boxShadow: {
        card: '0 6px 18px rgba(0, 0, 0, 0.15)'
      },
      keyframes: {
        slideUp: { 
          '0%': { transform: 'translateY(16px)', opacity: 0 }, 
          '100%': { transform: 'translateY(0)', opacity: 1 } 
        },
        slideIn: {
          '0%': { transform: 'translateX(-8px)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 }
        }
      },
      animation: {
        fadeIn: 'fadeIn 420ms ease-out both',
        slideUp: 'slideUp 500ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        slideIn: 'slideIn 400ms ease-out both',
        'pulse-soft': 'pulse 3s ease-in-out infinite'
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(180deg, #0d2b1a, #051f10)'
      }
    }
  },
  plugins: []
}
