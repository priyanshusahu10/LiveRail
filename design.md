# LiveRail Design System

## 1. Brand & Philosophy
- **Identity**: LiveRail — Intelligent Live Train Tracking & Journey Companion.
- **Design Philosophy**: *Apple Maps × Linear × Stripe × Notion*
  - **Apple Maps**: Immersive spatial awareness, clean navigation controls, smooth camera motion, elevation profile, contextual geography.
  - **Linear**: High information density without clutter, keyboard-first interactions, sleek dark mode, micro-badges, precise typography, smooth 150–250ms transitions.
  - **Stripe**: Pristine card elevation, subtle borders (`border-neutral-200` / `border-neutral-800`), crisp tabular data, reliable financial-grade clarity for timing and delays.
  - **Notion**: Distraction-free content hierarchy, intuitive timeline blocks, clean typography, human-readable breadcrumbs and states.

---

## 2. Typography
- **Primary Font Family**: `-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif`
- **Monospace Font Family**: `ui-monospace, "SF Mono", "Fira Code", monospace` (used for train numbers, platform tags, timestamps, coordinates, delay badges)
- **Scale**:
  - Display / Hero: `2.25rem - 3rem (36px - 48px)`, font-weight 700 / 800, tracking `-0.03em`
  - H1 / Train Title: `1.5rem - 1.875rem (24px - 30px)`, font-weight 700, tracking `-0.02em`
  - H2 / Section Heading: `1.125rem - 1.25rem (18px - 20px)`, font-weight 600, tracking `-0.01em`
  - Body Text: `0.875rem - 1rem (14px - 16px)`, font-weight 400 / 500, line-height 1.5
  - Subtext & Captions: `0.75rem - 0.8125rem (12px - 13px)`, font-weight 500, tracking `0.01em`
  - Micro / Badges: `0.6875rem (11px)`, font-weight 600, tracking `0.05em`, uppercase or tabular

---

## 3. Color Palette

### Light Theme (Default Interface)
- **Background**: `#F9FAFB` (neutral-50)
- **Surface / Card**: `#FFFFFF`
- **Surface Muted**: `#F3F4F6` (neutral-100)
- **Border**: `#E5E7EB` (neutral-200)
- **Text Primary**: `#111827` (neutral-900)
- **Text Secondary**: `#4B5563` (neutral-600)
- **Text Tertiary**: `#9CA3AF` (neutral-400)

### Dark Theme & Map Environment
- **Map Base**: `#0F172A` (slate-900 / dark night)
- **Map Surface**: `#1E293B` (slate-800)
- **Completed Route Glow**: `#06B6D4` (cyan-500) to `#10B981` (emerald-500)
- **Remaining Route**: `#475569` (slate-600) with dashed neon pulse
- **Train Marker Pulse**: `#38BDF8` (sky-400) with animated radar beacon
- **Station Dots**: `#FFFFFF` with glowing border

### Semantic Colors
- **On Time / Success**: `#10B981` (emerald-500), bg `#ECFDF5`
- **Minor Delay (1–15m)**: `#F59E0B` (amber-500), bg `#FFFBEB`
- **Major Delay (>15m)**: `#EF4444` (rose-500), bg `#FEF2F2`
- **Live Beacon**: `#3B82F6` (blue-500) / `#06B6D4` (cyan-500) with pulsing ping
- **Elevation / Terrain**: `#8B5CF6` (violet-500) and `#6366F1` (indigo-500)

---

## 4. Layout & Spacing
- **Base Grid**: 8px (increments of 4px, 8px, 12px, 16px, 24px, 32px, 48px).
- **Border Radii**:
  - Badges & Buttons: `8px - 10px`
  - Cards & Panels: `14px - 18px`
  - Modals & Sheets: `20px - 24px`
- **Card Shadows**:
  - Flat / Default: `0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)`
  - Elevated / Hover: `0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)`
  - Map Overlay: `0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)`

---

## 5. Interactions & Motion
- **Transitions**: `150ms - 250ms cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo)
- **Train GPS Interpolation**: Smooth bearing and coordinate lerp between updates
- **Radar Beacon**: Continuous 2s ping animation around the train marker
- **Counters**: Smooth numbers incrementing for speed (km/h) and distance (km)
- **Reduced Motion**: Respect `prefers-reduced-motion: reduce` by dampening marker oscillations and transitions

---

## 6. Maps Specification
- **Engine**: MapLibre GL JS
- **Tile Styling**: Dark high-contrast cartography optimized for railway route visibility
- **Route Layers**:
  - Base railway line (solid casing)
  - Completed segment (glowing cyan gradient)
  - Remaining segment (dashed active line)
- **Markers**:
  - Live Train Marker: Directional train chevron, speed tag, animated pulse ring
  - Station Nodes: Circular nodes scaled by significance (Major Junction, Regular Halt)
  - Geographic POIs: Minimalist badges for rivers (Yamuna, Ganga), mountain ghats, iconic bridges
- **Controls**: Camera follow toggle, 3D pitch (45° tilt), bearing reset, zoom +/-

---

## 7. Responsive Breakpoints
- **Mobile (< 768px)**: Bottom drawer for live status, full-bleed interactive map with quick switcher, swipeable station cards.
- **Tablet (768px - 1024px)**: 2-column layout with responsive map viewport.
- **Desktop (≥ 1024px)**: 12-column master-detail layout: 65% immersive map & timeline, 35% live telemetry, journey analytics, companion weather & POI panels.
