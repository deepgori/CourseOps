/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#F6F1E8',
        panel: '#FFFDF9',
        panelAlt: '#F7EFE3',
        elevated: '#FFFFFF',
        border: '#E5D9C8',
        copy: '#201B16',
        copyMuted: '#6E665C',
        copySoft: '#A39887',
        brand: '#3B5BDB',
        brandHover: '#2947C7',
        success: '#2FA97A',
        warning: '#D99A4A',
        danger: '#D66E5E',
        draft: '#B692F6'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      },
      borderRadius: {
        card: '8px',
        control: '6px',
        modal: '12px'
      },
      animation: {
        'fade-in': 'fadeIn 180ms ease-out',
        'scale-in': 'scaleIn 180ms ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        scaleIn: {
          '0%': { opacity: 0, transform: 'scale(0.96)' },
          '100%': { opacity: 1, transform: 'scale(1)' }
        }
      },
      boxShadow: {
        none: 'none',
        panel: '0 24px 80px -38px rgba(120, 94, 57, 0.28)',
        float: '0 28px 90px -42px rgba(59, 91, 219, 0.34)'
      }
    }
  },
  plugins: []
};
