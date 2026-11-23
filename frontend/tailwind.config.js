export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: {
      navy: '#262320', gold: '#D97757', clay: '#B5532F',
      slate: { 50: '#F5F4ED', 100: '#EEECE2', 200: '#E2DFD2', 300: '#CFCBBB', 400: '#9B9686', 500: '#6E6A5E', 600: '#55524A', 700: '#3E3C36', 800: '#2B2A26', 900: '#1F1E1B' },
    },
    fontFamily: {
      serif: ['Newsreader', 'Georgia', 'Cambria', 'serif'],
      sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
    },
  } },
  plugins: [],
};
