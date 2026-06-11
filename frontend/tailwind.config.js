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
        background: '#f7f9fb',
        'on-background': '#191c1e',
        primary: {
          DEFAULT: '#00685f',
          foreground: '#ffffff',
          container: '#008378',
          'on-container': '#f4fffc',
          tint: '#006a61',
          fixed: '#89f5e7',
          'fixed-dim': '#6bd8cb',
        },
        secondary: {
          DEFAULT: '#0058be',
          foreground: '#ffffff',
          container: '#2170e4',
          'on-container': '#fefcff',
          fixed: '#d8e2ff',
          'fixed-dim': '#adc6ff',
        },
        tertiary: {
          DEFAULT: '#924628',
          foreground: '#ffffff',
          container: '#b05e3d',
          'on-container': '#fffbff',
          fixed: '#ffdbce',
          'fixed-dim': '#ffb59a',
        },
        surface: {
          DEFAULT: '#ffffff',
          dim: '#d8dadc',
          bright: '#f7f9fb',
          variant: '#e0e3e5',
          'on-variant': '#3d4947',
          container: {
            lowest: '#ffffff',
            low: '#f2f4f6',
            DEFAULT: '#eceef0',
            high: '#e6e8ea',
            highest: '#e0e3e5',
          }
        },
        error: {
          DEFAULT: '#ba1a1a',
          foreground: '#ffffff',
          container: '#ffdad6',
          'on-container': '#93000a',
        },
        outline: {
          DEFAULT: '#6d7a77',
          variant: '#bcc9c6',
        },
        'on-surface': '#191c1e',
        'inverse-surface': '#2d3133',
        'inverse-on-surface': '#eff1f3',
        'inverse-primary': '#6bd8cb',
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
  plugins: [],
}
