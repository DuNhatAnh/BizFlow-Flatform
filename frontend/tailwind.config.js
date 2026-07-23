/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        'on-background': '#191c1e',
        primary: {
          DEFAULT: '#1e40af', // Blue-800
          foreground: '#ffffff',
          container: '#dbeafe',
          'on-container': '#1e3a8a',
          tint: '#2563eb',
          fixed: '#bfdbfe',
          'fixed-dim': '#93c5fd',
        },
        secondary: {
          DEFAULT: '#3b82f6', // Blue-500
          foreground: '#ffffff',
          container: '#eff6ff',
          'on-container': '#1d4ed8',
          fixed: '#dbeafe',
          'fixed-dim': '#bfdbfe',
        },
        tertiary: {
          DEFAULT: '#d97706', // Amber-600 (Accent/CTA)
          foreground: '#ffffff',
          container: '#fef3c7',
          'on-container': '#92400e',
          fixed: '#fde68a',
          'fixed-dim': '#fcd34d',
        },
        surface: {
          DEFAULT: '#ffffff',
          dim: '#f1f5f9',
          bright: '#f8fafc',
          variant: '#e2e8f0',
          'on-variant': '#334155',
          container: {
            lowest: '#ffffff',
            low: '#f8fafc',
            DEFAULT: '#f1f5f9',
            high: '#e2e8f0',
            highest: '#cbd5e1',
          }
        },
        error: {
          DEFAULT: '#dc2626', // Destructive
          foreground: '#ffffff',
          container: '#fee2e2',
          'on-container': '#991b1b',
        },
        outline: {
          DEFAULT: '#94a3b8',
          variant: '#cbd5e1',
        },
        'on-surface': '#1e293b',
        'inverse-surface': '#0f172a',
        'inverse-on-surface': '#f8fafc',
        'inverse-primary': '#60a5fa',
        border: '#dbeafe',
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        'fira-sans': ['"Fira Sans"', 'sans-serif'],
        'fira-code': ['"Fira Code"', 'monospace'],
      },
      boxShadow: {
        card: '0px 4px 20px rgba(0, 0, 0, 0.05)',
      },
      spacing: {
        'sidebar': '260px',
        'sidebar-collapsed': '80px',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
