/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          blue: '#00f0ff',
          green: '#39ff14',
          orange: '#ff6a00',
          purple: '#bf00ff',
          red: '#ff003c'
        }
      },
      boxShadow: {
        'neon-blue': '0 0 10px #00f0ff, 0 0 30px #00f0ff33',
        'neon-green': '0 0 10px #39ff14, 0 0 30px #39ff1433',
        'neon-orange': '0 0 10px #ff6a00, 0 0 30px #ff6a0033',
        'neon-purple': '0 0 10px #bf00ff, 0 0 30px #bf00ff33',
        'neon-red': '0 0 10px #ff003c, 0 0 30px #ff003c33'
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"Inter"', 'sans-serif']
      },
      animation: {
        'pulse-neon': 'pulse 1.5s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
}
