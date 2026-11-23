/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // Desactiva el modo oscuro automático por media query para evitar conflictos con las paletas de Ionic
  darkMode: 'class',
  theme: {
    extend: {
      // Paleta brutalista: colores planos y saturados sobre negro puro
      colors: {
        ink: '#000000',
        paper: '#F4F1EA',
        acid: '#FFE600',
        alarm: '#FF5C5C',
        signal: '#00E5FF',
        go: '#00F07F',
        electric: '#0047FF',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Arial Black', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
      },
      // Sombras duras sin desenfoque (rasgo clave del brutalismo)
      boxShadow: {
        brutal: '6px 6px 0 0 #000',
        'brutal-sm': '3px 3px 0 0 #000',
        'brutal-lg': '10px 10px 0 0 #000',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 18s linear infinite',
      },
    },
  },
  plugins: [],
};
