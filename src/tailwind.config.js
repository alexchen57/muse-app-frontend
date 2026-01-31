/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a',
        card: '#1e293b',
        border: '#334155',
        muted: '#64748b',
        'muted-foreground': '#94a3b8',
        primary: '#3b82f6',
        'primary-foreground': '#ffffff',
        accent: '#8b5cf6',
        state: {
          stressed: '#F44336',
          calm: '#4CAF50',
          productive: '#2196F3',
          distracted: '#FFC107',
        },
      },
    },
  },
  plugins: [],
};