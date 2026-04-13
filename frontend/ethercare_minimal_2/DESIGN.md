# Design System Specification: Clinical Prestige

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Sanctuary."** In the context of healthcare, we move beyond "utility" into "authority." We are replacing the sterile, grid-locked aesthetic of traditional medical portals with a high-end editorial experience that feels curated, calm, and incredibly intentional.

To achieve this, we break the "template" look. We use **intentional asymmetry** (e.g., staggering content blocks), high-contrast typography scales, and a philosophy of **Tonal Layering** rather than structural containment. The result is a signature visual identity that feels like a premium concierge service—trustworthy, sophisticated, and human-centric.

---

## 2. Colors: The Deep Navy & Tonal Depth
The palette is anchored by the authoritative `primary_container` (#1a2b4b), providing a sophisticated weight to headers and titles.

### The "No-Line" Rule
**Explicit Instruction:** Traditional 1px solid borders for sectioning are strictly prohibited. Boundaries must be defined solely through background color shifts. For example, a `surface_container_low` section sitting on a `surface` background creates a natural, soft boundary that feels architectural rather than mechanical.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine paper.
*   **Base:** `surface` (#f8f9fa)
*   **Level 1 (Subtle Inset):** `surface_container_low` (#f3f4f5)
*   **Level 2 (Active Cards):** `surface_container_lowest` (#ffffff)
*   **Level 3 (Interactive Overlays):** `surface_bright` with Glassmorphism.

### The "Glass & Gradient" Rule
To elevate the "Modern Healthcare" feel, use **Glassmorphism** for floating elements (e.g., navigation bars or modal headers) using `surface_container_lowest` at 80% opacity with a `20px` backdrop-blur. 

### Signature Textures
Avoid flat primary blocks. Use subtle linear gradients for Hero sections or primary CTAs:
*   **Primary Gradient:** From `primary` (#031635) to `primary_container` (#1a2b4b) at a 135-degree angle. This adds a "soul" and depth to the navy blue that flat hex codes cannot achieve.

---

## 3. Typography: Editorial Authority
We utilize a high-contrast pairing between **Manrope** (Display/Headlines) and **Inter** (Body/UI) to establish a clear information hierarchy.

*   **Display (Manrope):** Large, bold, and airy. Use `display-lg` (3.5rem) for hero statements. The generous kerning and geometric curves of Manrope convey modern precision.
*   **Headlines (Manrope):** Set in `primary_container` (#1a2b4b). These are your anchors. Use them to lead the eye through the page.
*   **Titles & Body (Inter):** Inter provides exceptional legibility for medical data. `title-lg` should be used for section headers to maintain a professional, clinical "ledger" feel.
*   **Scale Contrast:** Don't be afraid of the jump between `display-lg` and `body-md`. This gap creates the "Editorial" look that distinguishes this system from a generic dashboard.

---

## 4. Elevation & Depth: Tonal Layering
In this system, depth is a function of color, not just shadow.

*   **The Layering Principle:** Achieve lift by "stacking" tiers. Place a `surface_container_lowest` card on a `surface_container_low` background. This creates a soft, "natural" lift.
*   **Ambient Shadows:** If a floating effect is required (e.g., a primary dropdown), use an **Extra-Diffused Shadow**: `0px 20px 40px rgba(25, 28, 29, 0.06)`. The shadow color is a tinted version of `on_surface`, making it feel like ambient light rather than a "grey drop."
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, it must be a **Ghost Border**: Use the `outline_variant` token at **15% opacity**. Never use a 100% opaque border.
*   **Glassmorphism Depth:** When using glass layers, ensure the `surface_tint` (#4e5e81) is subtly applied to the background to maintain the "Healthcare Blue" DNA throughout the blurred layers.

---

## 5. Components: Refined Interaction

### Buttons
*   **Primary:** Gradient of `primary` to `primary_container`. Roundedness: `lg` (0.5rem). Use `on_primary` (White) text.
*   **Secondary:** `surface_container_high` background with `primary_container` text. No border.
*   **Tertiary:** Ghost style. No background; `primary` text. Transitions to `surface_container_low` on hover.

### Cards & Lists
*   **The Card Rule:** Cards have no borders. Use `surface_container_lowest` on a `surface_container` background.
*   **Lists:** Forbid divider lines. Use `0.75rem` (12px) of vertical white space to separate list items. Use a subtle `surface_container_low` background on hover to indicate interactivity.

### Input Fields
*   **Styling:** Soft-filled. Use `surface_container_high` background with a `Ghost Border` (15% `outline_variant`) that becomes a 2px `primary` bottom-border only on focus. This mimics high-end stationery.

### Healthcare-Specific Components
*   **Status Badges:** Use `secondary_container` for "Positive/Success" and `error_container` for "Urgent." Badges should be pill-shaped (`full` roundedness) with `0.5rem` horizontal padding.
*   **Data Vitals:** Use `display-sm` for numeric values (e.g., Heart Rate) with `label-md` for the unit, creating a clear, readable medical "glance."

---

## 6. Do's and Don'ts

### Do:
*   **DO** use whitespace as a functional tool. If elements feel crowded, increase the margin rather than adding a border.
*   **DO** use `primary_container` (#1a2b4b) for all semantic "Action" text and major headers to reinforce the brand identity.
*   **DO** overlap elements (e.g., an image slightly breaking the container of a text block) to create an asymmetrical, bespoke feel.

### Don't:
*   **DON'T** use 1px solid dividers (hex #CCCCCC, etc.). They "cut" the layout and make it feel templated.
*   **DON'T** use pure black for text. Always use `on_surface` (#191c1d) or `primary_container` for better optical comfort.
*   **DON'T** use heavy drop shadows. If it looks like it's "hovering" more than 5mm off the screen, the shadow is too dark.