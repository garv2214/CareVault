# Design System Document: Health-Tech x Web3 Editorial

## 1. Overview & Creative North Star: "The Clinical Sanctuary"

The Creative North Star for this design system is **"The Clinical Sanctuary."** 

In the intersection of decentralized finance (Web3) and healthcare, users often feel a tension between "high-tech" and "human care." This system resolves that tension. We move beyond the "standard SaaS dashboard" by creating a space that feels as sterile and precise as an operating room, yet as soft and calming as a premium wellness retreat. 

To achieve this, we reject the rigid, boxed-in layouts of traditional platforms. We utilize **intentional asymmetry**, **tonal layering**, and **expansive whitespace** to guide the eye. By breaking the "template" look, we signal to the user that this platform is bespoke, secure, and light-years ahead of legacy healthcare systems.

---

## 2. Colors & Surface Philosophy

Our palette utilizes a sophisticated range of blues and teals, anchored by a "Super-White" foundation.

### The "No-Line" Rule
**Borders are a design failure of the past.** In this system, 1px solid borders for sectioning are strictly prohibited. Boundaries are defined exclusively through:
1.  **Background Shifts:** Placing a `surface-container-low` section against a `surface` background.
2.  **Tonal Transitions:** Using subtle color blocks to define areas of interaction.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—stacked sheets of frosted glass.
- **Base Layer:** `surface` (#f7f9fb)
- **Content Zones:** `surface-container-low` (#f2f4f6)
- **Interactive Cards:** `surface-container-lowest` (#ffffff) for maximum "lift" and "purity."
- **Overlays/Modals:** `surface-bright` (#f7f9fb) with high-diffusion shadows.

### The "Glass & Gradient" Rule
To bridge the gap between "Clinical" and "Web3," use Glassmorphism for floating elements (like the 'Connect Wallet' modal). 
- **Glass Spec:** `surface-container-lowest` at 70% opacity with a `24px` backdrop-blur.
- **Signature Gradients:** For primary CTAs and Hero backgrounds, use a linear gradient from `primary` (#0051d5) to `primary-container` (#316bf3) at a 135-degree angle. This adds a "digital soul" to the professional blue.

---

## 3. Typography: The Editorial Voice

We utilize a dual-font strategy to balance authority with technical precision.

*   **Display & Headlines (Manrope):** Chosen for its geometric purity and modern proportions. Use `display-lg` and `headline-md` with tight letter-spacing (-0.02em) to create an authoritative, editorial feel.
*   **Body & UI (Inter):** The workhorse of the system. Inter provides unmatched legibility for complex medical data. 
*   **Hierarchy as Identity:** Use a high contrast between `headline-lg` (32px) and `body-md` (14px). This "Large Title, Small Body" approach mimics high-end medical journals and premium tech brand aesthetics.

---

## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows are too "heavy" for a healthcare context. We achieve depth through light.

*   **The Layering Principle:** Never use a shadow where a color shift will suffice. Place a `surface-container-lowest` card on a `surface-container-low` background to create a "soft lift."
*   **Ambient Shadows:** For floating elements (Modals, Hovered Cards), use a shadow color tinted with our primary hue: `rgba(0, 81, 213, 0.06)` with a `40px` blur and `12px` Y-offset. It should feel like a soft glow, not a shadow.
*   **The "Ghost Border" Fallback:** If a divider is mandatory for accessibility, use `outline-variant` (#c1c6d7) at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### The 'Connect Wallet' Button
This is our signature Web3 touchpoint.
- **Style:** Linear gradient (`primary` to `primary-container`).
- **Rounding:** `full` (9999px) to contrast against the `md` rounding of data cards.
- **Interaction:** On hover, a subtle `surface-tint` inner glow.

### Rounded Cards
- **Tokens:** `surface-container-lowest` background, `xl` (1.5rem) corner radius.
- **Rule:** No dividers. Use `title-sm` for headers and `8px` of extra vertical padding to separate content blocks.

### Healthcare Data Tables
- **Background:** `surface-container-low`.
- **Header:** `label-md` in `on-surface-variant` (all caps, 0.05em tracking).
- **Rows:** Alternating background shifts instead of lines. Every second row uses `surface-container-lowest`.

### Input Fields
- **Background:** `surface-container-highest`.
- **Focus State:** A `2px` "Ghost Border" using `primary` at 40% opacity. No solid heavy outlines.

---

## 6. Do’s and Don’ts

### Do
- **Use "Breathing Room":** If a component feels crowded, add 16px of whitespace. Then add 8px more.
- **Embrace Asymmetry:** Align hero text to the left but offset the primary image/data visualization to the right with "overflowing" edges to break the grid.
- **Use Micro-Gradients:** Apply a 5% vertical gradient to large cards to prevent them from looking "flat" or "cheap."

### Don’t
- **Don't use 100% Black:** Use `on-surface` (#191c1e) for text. True black is too harsh for a "Sanctuary" vibe.
- **Don't use 1px Borders:** As stated, use background color shifts (`surface` tiers) to define containers.
- **Don't use Standard Shadows:** Avoid the default "black/grey" shadows. They muddy the clinical cleanliness of the UI.
- **Don't use Inter for Headlines:** Inter is for reading; Manrope is for making a statement. Keep them distinct.