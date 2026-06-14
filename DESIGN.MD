---
name: Intelligent Commerce
colors:
  surface: '#f8fafb'
  surface-dim: '#d8dadb'
  surface-bright: '#f8fafb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f5'
  surface-container: '#eceeef'
  surface-container-high: '#e6e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#3e4949'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#eff1f2'
  outline: '#6e7979'
  outline-variant: '#bdc9c8'
  surface-tint: '#006a6a'
  primary: '#006565'
  on-primary: '#ffffff'
  primary-container: '#008080'
  on-primary-container: '#e3fffe'
  inverse-primary: '#76d6d5'
  secondary: '#50606f'
  on-secondary: '#ffffff'
  secondary-container: '#d1e1f4'
  on-secondary-container: '#556474'
  tertiary: '#5a5a59'
  on-tertiary: '#ffffff'
  tertiary-container: '#727371'
  on-tertiary-container: '#fbf9f7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#93f2f2'
  primary-fixed-dim: '#76d6d5'
  on-primary-fixed: '#002020'
  on-primary-fixed-variant: '#004f4f'
  secondary-fixed: '#d4e4f6'
  secondary-fixed-dim: '#b8c8da'
  on-secondary-fixed: '#0d1d2a'
  on-secondary-fixed-variant: '#394857'
  tertiary-fixed: '#e3e2e0'
  tertiary-fixed-dim: '#c7c6c4'
  on-tertiary-fixed: '#1b1c1b'
  on-tertiary-fixed-variant: '#464746'
  background: '#f8fafb'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
  ai-accent: '#00CED1'
  status-success: '#2D6A4F'
  status-warning: '#D97706'
  status-error: '#DC2626'
  surface-dark: '#1A2E35'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter-mobile: 16px
  gutter-desktop: 24px
  margin-page: 32px
  card-padding: 24px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is engineered for the modern business household, blending the reliability of a **Corporate/Modern** SaaS admin panel with the approachability of **Soft UI**. It targets business owners who require sophisticated AI-driven insights without the steep learning curve of enterprise ERPs.

The brand personality is **professional, trustworthy, and clarifying**. It evokes an emotional response of organized control and forward-thinking intelligence. The focal point is the AI integration, which is treated not as a hidden utility, but as a proactive assistant that illuminates data patterns and automates routine tasks.

Visual cues include:
- **Spaciousness:** Generous whitespace to prevent cognitive overload for users managing complex operations.
- **Clarity:** High-contrast typography and clear visual hierarchies.
- **Intelligence:** Subtle "glow" effects and distinct iconography for AI-powered features to distinguish them from standard data points.

## Colors

The palette is derived from a core of professional teals and metallic silvers. The **Primary Teal** serves as the anchor for action and reliability, while **Silver and Slate** tones provide a sophisticated backdrop for data-heavy environments.

- **Primary Teal (#008080):** Used for primary actions, active navigation states, and brand highlights.
- **AI Accent (#00CED1):** A brighter, more luminous cyan specifically reserved for AI-generated suggestions, insights, and the assistant interface.
- **Neutral Background (#F8FAFB):** A cool-tinted off-white that reduces eye strain during long-form operational use.
- **Surface Dark (#1A2E35):** Used for the sidebar and high-contrast headers to create a clear structural frame for the dashboard content.

Functional colors (Success, Warning, Error) are used sparingly to ensure that when a notification appears, it commands immediate and appropriate attention.

## Typography

This design system utilizes **Inter** for its exceptional legibility and neutral, professional character. The type scale is intentionally generous to accommodate older business owners and high-speed operational scanning.

- **Headlines:** Use Bold and Semi-Bold weights with slight negative letter-spacing for a modern, compact "SaaS" feel.
- **Body Text:** Set at a base of 16px to ensure accessibility.
- **Labels:** Used for table headers, small metadata, and sidebar categories. The `label-lg` uses uppercase styling to provide clear structural breaks without requiring heavy borders.
- **Readability:** High contrast ratios (minimum 4.5:1) are maintained for all body text against card backgrounds.

## Layout & Spacing

The design system employs a **12-column fluid grid** for desktop and a **4-column grid** for mobile. The layout philosophy centers on a "Card-in-Container" model where information is logically grouped into floating surfaces.

- **Sidebar:** Fixed at 280px on desktop to provide ample space for deep navigation and clear icons. Collapses to a hamburger menu on mobile.
- **Main Content:** Centers on the page with a maximum width of 1440px to prevent excessive line lengths on ultra-wide monitors.
- **Gutters:** 24px on desktop provides significant breathing room between KPI cards, preventing the "data-cramped" feel of traditional ERPs.
- **AI Integration Area:** Reserved space on the right-hand side (or via a floating persistent button) for the AI Assistant, ensuring it never overlaps critical data fields.

## Elevation & Depth

To achieve the "Soft UI" aesthetic while maintaining professional clarity, this design system uses **Tonal Layering** combined with **Ambient Shadows**.

- **Level 0 (Background):** The neutral gray background (#F8FAFB) acts as the canvas.
- **Level 1 (Cards):** Pure white (#FFFFFF) cards with a very soft, diffused shadow (12% opacity, 16px blur) create a sense of lift without looking "heavy."
- **Level 2 (Modals/Popovers):** Higher elevation with a slightly sharper shadow to indicate immediate priority.
- **AI Highlight:** Elements generated by AI utilize a subtle cyan outer glow instead of a traditional shadow to signal their "intelligent" nature.
- **Outlines:** Low-contrast 1px borders (#E2E8F0) are used inside cards to separate table rows or section segments, maintaining a flat but structured feel.

## Shapes

The shape language is **Rounded** to evoke friendliness and modern SaaS sensibilities. 

- **Cards:** Use a large `rounded-lg` (16px) radius to create the "Soft UI" feel.
- **Buttons & Inputs:** Use the standard `rounded` (8px) radius for a professional, clickable appearance.
- **AI Components:** Utilize `rounded-xl` (24px) or full pill shapes to distinguish them from standard management tools.
- **Avatars & Status Dots:** Fully circular to contrast against the geometric grid.

## Components

### Buttons
- **Primary:** Solid Teal (#008080) with white text. 8px border radius.
- **Secondary:** Transparent with a Teal border and text.
- **AI Action:** Gradient background (Teal to AI Accent) to visually separate AI-triggering actions from manual ones.

### Cards
- Standard containers for KPI metrics, charts, and lists. 
- Always feature 24px internal padding and 16px border radius.
- AI-driven cards feature a small "Sparkle" icon in the top right corner.

### Input Fields
- Soft gray backgrounds (#F1F5F9) with no border in resting state; focus state adds a 2px Teal border.
- Large tap targets (minimum 44px height) for better mobile and touch-screen usability.

### Chips & Badges
- Used for status (Active, Pending, Alert). 
- Highly rounded (pill-shaped) with low-saturation background tints and high-saturation text for readability.

### Quick Actions
- A dedicated "Action Bar" at the top of the dashboard for high-frequency tasks (Close Shift, Inventory Count). These use prominent icons and bold labels.

### AI Assistant
- A persistent, floating chat interface or a dedicated sidebar panel.
- Uses a distinct glassmorphic effect (backdrop-blur) to appear "on top" of the system, suggesting it is observing and assisting with the data beneath it.
