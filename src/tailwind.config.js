/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light Mode (Warm Theme)
        coral: '#E07A5F',
        'coral-light': '#F4A261',
        'soft-blue': '#A8DADC',
        'soft-blue-dark': '#7FBFC1',
        cream: '#FAF7F5',
        beige: '#E8DDD4',
        'beige-light': '#F5F0EB',
        'text-dark': '#3D3D3D',
        'text-muted': '#8A8A8A',
        
        // State Colors
        state: {
          stressed: '#E07A5F',
          calm: '#81B29A',
          productive: '#A8DADC',
          distracted: '#F4A261',
        },
        
        // CSS Variable based colors
        background: 'var(--cream)',
        card: 'var(--card)',
        border: 'var(--beige)',
        muted: 'var(--text-muted)',
        'muted-foreground': 'var(--text-muted)',
        primary: '#E07A5F',
        'primary-foreground': '#ffffff',
        accent: '#A8DADC',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'warm': '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        'warm-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};
