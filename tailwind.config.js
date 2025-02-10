/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Professional dark theme palette
        brand: {
          50: '#f0f7ff',
          100: '#e0f0ff',
          200: '#b9ddff',
          300: '#7cc1ff',
          400: '#3aa1ff',
          500: '#1a7fd5',
          600: '#0c66b5',
          700: '#0a558c',
          800: '#0a446f',
          900: '#0a3356'
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        accent: {
          primary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
          },
          secondary: {
            50: '#fdf4ff',
            100: '#fae8ff',
            500: '#d946ef',
            600: '#c026d3',
            700: '#a21caf',
          },
          tertiary: {
            50: '#f0fdf4',
            100: '#dcfce7',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
          }
        }
      },
      boxShadow: {
        'glass': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'glass-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'glass-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'elegant': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.14)',
        'elegant-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
        'elegant-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};