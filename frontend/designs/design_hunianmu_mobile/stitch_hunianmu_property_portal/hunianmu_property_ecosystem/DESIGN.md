---
name: HunianMu Property Ecosystem
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#44474d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#75777d'
  outline-variant: '#c4c6cd'
  surface-tint: '#505f77'
  primary: '#000c1f'
  on-primary: '#ffffff'
  primary-container: '#132338'
  on-primary-container: '#7b8ba4'
  inverse-primary: '#b8c7e3'
  secondary: '#006d2f'
  on-secondary: '#ffffff'
  secondary-container: '#5dfd8a'
  on-secondary-container: '#007232'
  tertiary: '#00092a'
  on-tertiary: '#ffffff'
  tertiary-container: '#001d59'
  on-tertiary-container: '#5482ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#b8c7e3'
  on-primary-fixed: '#0b1c31'
  on-primary-fixed-variant: '#38485e'
  secondary-fixed: '#66ff8e'
  secondary-fixed-dim: '#3de273'
  on-secondary-fixed: '#002109'
  on-secondary-fixed-variant: '#005322'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#003ea8'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system establishes a high-trust, tech-forward real estate marketplace tailored for urban dwellers, students, young professionals, and property owners seeking kos, rental homes, houses, and land. The brand voice balances architectural authority with warm Indonesian hospitality.

The design style synthesizes Modern Clean Minimalism with delicate Glassmorphism accents:
- **Structural Trust:** Anchored by geometric clarity, ample whitespace, and architectural confidence derived from deep navy/slate hues.
- **Glassmorphism Accents:** Floating frosted-glass navigation bars, translucent search widgets, and backdrop-blur filter sheets that create depth without visual noise.
- **Action-Driven Vibrancy:** Strategic deployment of WhatsApp emerald green for instant, high-trust peer-to-peer and agent conversations.
- **Approachable Modernity:** Balanced typography and pill-shaped badges that soften the corporate weight of traditional property portals.

## Colors

The palette is engineered around high contrast, legal-grade trust, and instantaneous transaction actions:

- **Primary (`#132338`)**: HunianMu Deep Slate Navy drawn directly from the corporate identity. Used for primary typography, authoritative brand markers, headers, and active state highlights.
- **Secondary (`#25D366`)**: Direct-response WhatsApp Emerald. Reserved strictly for conversion milestones: "Chat Pemilik", "Hubungi via WhatsApp", instant booking prompts, and verified verification badges.
- **Tertiary (`#2563EB`)**: Electric Cobalt Blue. Utilized for search triggers, secondary links, map pins, and analytical badge accents.
- **Neutral (`#64748B`)**: Slate neutral scale. Canvas surfaces utilize soft off-white (`#F8FAFC` to `#FFFFFF`) with crisp light borders (`#E2E8F0`) to ensure property photography remains the hero.

## Typography

The type system blends the contemporary geometric personality of **Plus Jakarta Sans** with the utilitarian precision of **Inter**.

- **Display & Headings:** Rendered in Plus Jakarta Sans with tighter letter-spacing to deliver confident editorial presentation for property titles, landing value propositions, and price tags.
- **Body:** Plus Jakarta Sans provides friendly legibility across dense spec sheets (room dimensions, facilities, lease terms).
- **Labels, Metrics, & Badges:** Inter provides condensed, neutral readability for numeric specifications (sqm, bed/bath count), status tags ("Tersedia", "Disewa"), and input field placeholders.

## Layout & Spacing

The layout is built on a responsive 12-column fluid grid system on desktop and tablet, collapsing to a single or 2-column flow on mobile viewports:

- **Desktop (≥1200px):** 12 columns, `gutter: 1.5rem` (24px), maximum content container of 1280px centered with `margin: 2rem` (32px).
- **Tablet (768px - 1199px):** 8 columns, `gutter: 1.25rem` (20px), `margin: 1.5rem` (24px).
- **Mobile (<768px):** 4 columns or single-column stack, `gutter-mobile: 1rem` (16px), outer edge padding `margin-mobile: 1rem` (16px).

The spacing cadence follows an 8pt modular rhythm (`space-xs` through `space-xl`) to align image aspect ratios (4:3 and 16:9) with adjacent descriptive text boxes.

## Elevation & Depth

Visual hierarchy leverages a combination of layered glassmorphism and subtle atmospheric shadows:

- **Glassmorphic Navigation & Floats:** The main header and floating sticky action bars feature translucent white backgrounds (`rgba(255, 255, 255, 0.72)` or dark mode `rgba(19, 35, 56, 0.75)`), backed by `backdrop-filter: blur(16px)` and a whisper-thin outline (`border: 1px solid rgba(255, 255, 255, 0.25)` or `rgba(226, 232, 240, 0.8)`).
- **Card Depth:** Property listing cards sit on pure white containers with an ambient diffuse shadow (`0 4px 20px -2px rgba(19, 35, 56, 0.06)`).
- **Interactive Hover:** On hover, cards lift subtly with `box-shadow: 0 12px 28px -4px rgba(19, 35, 56, 0.12)` accompanied by a smooth 200ms ease-out transition.
- **Search Dock Elevation:** Floating multi-facet filter bars rest at level-3 elevation (`0 16px 32px -8px rgba(19, 35, 56, 0.14)`) to clearly delineate system controls from underlying catalog photography.

## Shapes

The design system adopts a balanced rounded style (`roundedness: 2`, base radius 8px / 0.5rem) combined with intentional full-pill treatments for specific micro-components:

- **Base Cards & Modals:** Standardized on `rounded-lg` (16px / 1rem) for listing cards, search boxes, and dialogue sheets.
- **Interactive Pills:** Category selectors, property tags ("Kos Putri", "Furnished", "SHM"), search filter capsules, and CTA buttons utilize full circular pill borders (`rounded-full` / 9999px) for an approachable, tactile touch feel.
- **Media Previews:** Property thumbnail images carry an 8px (0.5rem) top-radius to conform seamlessly with parent card contours.

## Components

### Buttons
- **Primary Action (Listing Search / Pasang Iklan):** Solid Navy (`#132338`), white text, bold `label-lg`, pill-shaped or 8px rounded, subtle navy drop shadow.
- **WhatsApp Direct Connect:** Vibrant Emerald Green (`#25D366`), white bold label with official WhatsApp icon, high elevation on mobile bottom sticky bars.
- **Secondary / Ghost:** Transparent background, 1px solid slate border (`#CBD5E1`), navy text, light hover state (`#F1F5F9`).

### Navigation Bar
- Modern floating pill or edge-to-edge glass container with 16px backdrop blur.
- Left-aligned HunianMu lockup, centered pill segmented links ("Sewa Kos", "Kontrakan", "Beli Rumah", "Tanah"), right-aligned "Pasang Iklan Gratis" CTA button.

### Property Listing Cards
- 16:9 photography ratio with top-left pill status tags ("Putri", "Diskon Sewa") and top-right wishlist floating heart icon.
- Lower container contains: Price (in Indonesian Rupiah format, e.g., `Rp 1.850.000 / bln`), property title (`headline-sm`), localized address subline with pin icon, and a horizontal spec tray (e.g., 🛏 1 KT · 🚿 1 KM · ⚡ Termasuk Listrik).
- Bottom edge features a quick-action "Chat WA" pill icon button alongside card link trigger.

### Filter & Search Capsule
- Sticky segmented bar featuring tabs for *Tipe Properti*, *Lokasi/Kampus*, and *Rentang Harga*.
- Utilizes pill chips with active filled states and light grey inactive states (`#F1F5F9`).

### Form Inputs & Dropdowns
- 48px standard touch targets with rounded-lg geometry.
- Focused state highlights a 2px outline in Primary Navy or Tertiary Cobalt with subtle glow.