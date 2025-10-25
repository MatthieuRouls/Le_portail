/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette harmonisée pour Le Portail
        portal: {
          // Backgrounds
          bg: {
            darkest: '#0a0a0f',
            dark: '#111118',
            DEFAULT: '#1a1a24',
            light: '#242430',
          },
          // Accent principal - Cyan électrique (énergie du portail)
          primary: {
            DEFAULT: '#00d4ff',
            light: '#33ddff',
            dark: '#0099cc',
            glow: 'rgba(0, 212, 255, 0.3)',
          },
          // Accent secondaire - Violet mystique
          secondary: {
            DEFAULT: '#8b5cf6',
            light: '#a78bfa',
            dark: '#6d28d9',
            glow: 'rgba(139, 92, 246, 0.3)',
          },
          // Danger / Altérés - Rouge orangé
          danger: {
            DEFAULT: '#ff4d6d',
            light: '#ff6b88',
            dark: '#c9184a',
            glow: 'rgba(255, 77, 109, 0.3)',
          },
          // Succès / Humains - Vert cyan
          success: {
            DEFAULT: '#00ffaa',
            light: '#33ffbb',
            dark: '#00cc88',
            glow: 'rgba(0, 255, 170, 0.3)',
          },
          // Texte
          text: {
            primary: '#f0f0f5',
            secondary: '#a0a0b0',
            muted: '#707080',
          },
        },
      },
      fontFamily: {
        mono: ['Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(0, 212, 255, 0.5)',
        'glow-secondary': '0 0 20px rgba(139, 92, 246, 0.5)',
        'glow-danger': '0 0 20px rgba(255, 77, 109, 0.5)',
        'glow-success': '0 0 20px rgba(0, 255, 170, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': {
            boxShadow: '0 0 5px currentColor, 0 0 10px currentColor',
          },
          '100%': {
            boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
          },
        },
      },
    },
  },
  plugins: [],
}
