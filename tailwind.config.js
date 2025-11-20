module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e9a3a',
          600: '#198433',
          700: '#14682a'
        },
        accent: {
          DEFAULT: '#8fc76e',
          100: '#e8f7e8'
        },
        bg: {
          page: '#f6fff8',
          hero: '#f6fff8'
        },
        surface: '#ffffff',
        text: {
          DEFAULT: '#07211a',
          muted: '#5b6b60'
        }
      },
      fontFamily: {
        heading: ['Poppins', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto']
      },
      borderRadius: {
        md: '14px',
        sm: '10px'
      },
      boxShadow: {
        card: '0 12px 32px rgba(6, 24, 15, 0.08)',
        cardLg: '0 18px 44px rgba(6, 24, 15, 0.12)'
      },
      keyframes: {
        slideUp: { 
          '0%': { transform: 'translateY(16px)', opacity: 0 }, 
          '100%': { transform: 'translateY(0)', opacity: 1 } 
        }
      },
      animation: {
        slideUp: 'slideUp 500ms cubic-bezier(0.34, 1.56, 0.64, 1) both'
      }
    }
  },
  plugins: []
}
