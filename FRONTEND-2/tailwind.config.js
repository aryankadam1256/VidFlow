/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Ant Design Color System - Professional Blue Theme
        'primary': {
          50: '#e6f7ff',
          100: '#bae7ff',
          200: '#91d5ff',
          300: '#69c0ff',
          400: '#40a9ff',
          500: '#1890ff',  // Ant Design Primary Blue
          600: '#096dd9',
          700: '#0050b3',
          800: '#003a8c',
          900: '#002766',
        },

        // Neutral/Gray Scale (Ant Design)
        'neutral': {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e8e8e8',
          300: '#d9d9d9',
          400: '#bfbfbf',
          500: '#8c8c8c',
          600: '#595959',
          700: '#434343',
          800: '#262626',
          900: '#1f1f1f',
        },

        // Semantic Colors (Ant Design)
        'success': '#52c41a',
        'warning': '#faad14',
        'error': '#ff4d4f',
        'info': '#1890ff',

        // Surface & Background
        'surface': {
          DEFAULT: '#ffffff',
          dark: '#141414',
          card: '#fafafa',
          hover: '#f5f5f5',
        },
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
      },
      spacing: {
        'navbar': '64px',
        'sidebar': '256px',
      },
      borderRadius: {
        'ant': '2px',      // Ant Design default
        'ant-lg': '4px',   // Large
        'ant-xl': '8px',   // Extra large
      },
      boxShadow: {
        'ant-sm': '0 2px 8px rgba(0, 0, 0, 0.15)',
        'ant-md': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'ant-lg': '0 8px 16px rgba(0, 0, 0, 0.15)',
        'ant-xl': '0 12px 24px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'ant-fade': 'fadeIn 0.3s ease-in-out',
        'ant-slide': 'slideIn 0.3s ease-in-out',
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
      },
    },
  },
  plugins: [],
}