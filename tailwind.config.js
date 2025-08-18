/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1',
        'primary-foreground': '#FFFFFF',
        secondary: '#EC4899',
        'secondary-foreground': '#FFFFFF',
        accent: '#EC4899',
        'accent-foreground': '#FFFFFF',
        background: '#F9FAFB',
        card: '#FFFFFF',
        foreground: '#111827',
        'muted-foreground': '#6B7280',
        destructive: '#EF4444',
        'whatsapp': '#22C55E',
      },
      boxShadow: {
        card: '0 4px 10px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
}
