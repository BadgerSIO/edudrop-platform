# EduDrop Frontend — Design System & Engineering Invariants

This file is the single source of truth for UI/UX design tokens, component architecture, theme generation, and Next.js 16 / Tailwind CSS v4 technical guardrails in `frontend/`. Always follow these specifications when creating new pages, components, or themes.

---

## 1. Three-Tier Design Token Architecture

Our design system uses a **3-tier token architecture** (Primitive RGB Channels → Semantic Tailwind Utilities → Component Recipes) so the entire application can be themed or re-skinned from a single file (`app/globals.css`) while supporting Tailwind's `/opacity` modifiers (e.g., `bg-surface-forest/95`).

### Tier 1 & 2: Semantic Color Tokens (`app/globals.css` & `tailwind.config.ts`)

| CSS Variable (`:root`) | RGB Value | Default Hex | Tailwind Utility (`bg-*`, `text-*`, `border-*`) | Semantic Role & Usage Rules |
| :--- | :--- | :--- | :--- | :--- |
| `--surface-forest` | `10 60 40` | `#0A3C28` | `surface-forest` | Primary dark brand surface (Navbar, Hero backgrounds, dark Bento cards, primary dark badges). |
| `--surface-forest-light` | `14 77 52` | `#0E4D34` | `surface-forest-light` | Hover state for dark forest buttons and elevated dark surface accents. |
| `--surface-canvas` | `255 255 255` | `#FFFFFF` | `surface-canvas` | Primary light page background and elevated white card surface. |
| `--surface-bento` | `244 245 246` | `#F4F5F6` | `surface-bento` | Soft neutral gray surface for secondary Bento cards, input wells, and alternating section backgrounds (`bg-surface-bento/60`). |
| `--brand-lime` | `158 240 26` | `#9EF01A` | `brand-lime` | High-contrast primary CTA accent, active nav indicator, icon highlights on dark surfaces, and verification badges. **Always pair with `text-surface-forest` text for WCAG contrast.** |
| `--brand-lime-hover` | `139 216 18` | `#8BD812` | `brand-lime-hover` | Hover state for `brand-lime` buttons and interactive pills. |
| `--brand-amber` | `245 158 11` | `#F59E0B` | `brand-amber` | Progress bars, funding meters, and warm highlight accents. |
| `--text-ink` | `15 31 24` | `#0F1F18` | `text-ink` (or `ink`) | Primary high-contrast heading and label color on light surfaces. |
| `--text-body` | `74 89 82` | `#4A5952` | `text-body` (or `body`) | Secondary body copy, descriptions, and muted metadata on light surfaces. |
| `--text-on-forest` | `248 250 249` | `#F8FAF9` | `text-on-forest` (or `on-forest`) | Primary headline and body text color on `surface-forest` backgrounds. |
| `--text-on-forest-muted` | `194 214 205` | `#C2D6CD` | `text-on-forest-muted` | Subtitles and supporting copy on `surface-forest` backgrounds. |
| `--border-subtle` | `228 232 230` | `#E4E8E6` | `border-subtle` | Hairline 1px border for light Bento cards, search bars, dividers, and form inputs. |
| `--border-glass` | `rgba(255,255,255,0.16)` | `16% White` | `border-glass` | Translucent border for dark glassmorphic overlays. |

---

## 2. Typography & Hierarchy Scale

- **Primary Font Family**: `Hanken Grotesk` (loaded in `app/layout.tsx`, geometric humanist sans-serif).
- **Fluid Typography Tokens (`tailwind.config.ts`)**:
  - `text-display`: `clamp(2.5rem, 1.6rem + 3.8vw, 4.5rem)` (`line-height: 1.06`, `letter-spacing: -0.03em`) — Landing page main hero headline only.
  - `text-h2`: `clamp(1.875rem, 1.35rem + 2.2vw, 3rem)` (`line-height: 1.12`, `letter-spacing: -0.025em`) — Section titles and subpage hero headlines.
  - `text-lead`: `clamp(1.2rem, 1.05rem + 0.7vw, 1.6rem)` (`line-height: 1.38`, `letter-spacing: -0.015em`) — Large editorial mission statements.
- **Micro-Typography (Labels & Eyebrows)**:
  - Form labels & metadata headers: `text-xs font-semibold uppercase tracking-wider text-text-ink`
  - Supporting descriptions: `text-sm sm:text-base leading-relaxed text-text-body`
- **Copywriting & Messaging Tone**:
  - Use easy-to-understand, precise, and short sentences for public and dashboard UI copy. Avoid overly warm, chatty, or filler phrasing.

---

## 3. Layout, Spacing & Bento Surface Recipes

### Container & Grid Standards
- **Max Container Width**: `mx-auto max-w-[1320px] px-5 sm:px-8`
- **Vertical Section Rhythm**:
  - Primary landing sections: `py-16 sm:py-20 lg:py-24`
  - Subpage compact heroes (`/schools`, `/products`, `/checkout`): `py-10 sm:py-12 lg:py-14`
  - Catalog / form body sections: `py-10 sm:py-14 lg:py-16`

### Border Radius & Shadow Scale
- **Outer Bento Cards & Containers**: `rounded-3xl` (`1.75rem`) with `shadow-bento` (`0px 2px 8px rgba(15,31,24,0.04), 0px 12px 24px -4px rgba(15,31,24,0.06)`).
- **Interactive Card Hover State**: `transition-all duration-300 hover:-translate-y-1 hover:border-surface-forest/30 hover:shadow-bento-hover`
- **Nested Inner Media / Stat Boxes**: `rounded-2xl` (`1.25rem`)
- **Form Inputs, Selects & Textareas**: `rounded-xl` (`0.75rem`)
- **Buttons, Badges & Eyebrow Pills**: `rounded-full`

### Standard Form Input Recipe
```tsx
<input
  className="w-full rounded-xl border border-border-subtle bg-white px-4 py-3 text-sm text-text-ink outline-none transition-all placeholder:text-text-body/40 focus:border-surface-forest focus:ring-1 focus:ring-surface-forest"
/>
```

---

## 4. Canonical UI Primitives (Reuse Before Creating New Elements)

Always import and compose these primitives from `app/sharedComponents/ui/` instead of writing ad-hoc buttons, cards, or headers:

1. **[`ActionPillButton`](file:///home/saad/Downloads/projects/naptech/sips/frontend/app/sharedComponents/ui/ActionPillButton.tsx)**:
   - Signature pill CTA with an embedded circular trailing `ArrowRight` badge that shifts right on hover.
   - Props: `variant?: "lime" | "dark" | "outline-glass" | "outline-dark"`, `size?: "sm" | "md" | "lg"`, `href?: string`, `onClick?: () => void`, `type?: "button" | "submit"`.
2. **[`BentoCard`](file:///home/saad/Downloads/projects/naptech/sips/frontend/app/sharedComponents/ui/BentoCard.tsx)**:
   - Standardized `rounded-3xl` container with responsive padding (`p-6 sm:p-8 lg:p-10`).
   - Props: `variant?: "bento" | "white" | "forest" | "glass"`, `className?: string`.
3. **[`SectionHeader`](file:///home/saad/Downloads/projects/naptech/sips/frontend/app/sharedComponents/ui/SectionHeader.tsx)**:
   - Standardized section top block with eyebrow pill, `text-h2` heading, optional subtitle, and right-aligned action slot.
   - Props: `eyebrow?: string`, `title: string`, `subtitle?: string`, `action?: React.ReactNode`, `align?: "left" | "center"`, `theme?: "light" | "dark"`.
4. **[`SectionEyebrow`](file:///home/saad/Downloads/projects/naptech/sips/frontend/app/sharedComponents/ui/SectionEyebrow.tsx)**:
   - Pill-shaped category/section tag (`variant?: "light" | "dark" | "lime"`).
5. **[`FloatingPillTags`](file:///home/saad/Downloads/projects/naptech/sips/frontend/app/sharedComponents/ui/FloatingPillTags.tsx)**:
   - Frosted glass or solid pill tags overlaid on photography.
6. **[`BrandLogo`](file:///home/saad/Downloads/projects/naptech/sips/frontend/app/sharedComponents/ui/BrandLogo.tsx)**:
   - Surface-aware brand lockup (`variant="on-dark"` for `#0A3C28` Navbar/Footer/Auth surfaces without white capsule wrappers; `variant="on-light"` for white/Bento surfaces; `compactBelowLg` in sidebars). Verify >= 4.5:1 contrast against the underlying surface.
7. **[`StatusBadge`](file:///home/saad/Downloads/projects/naptech/sips/frontend/app/sharedComponents/ui/StatusBadge.tsx) & [`StatusChangeDialog`](file:///home/saad/Downloads/projects/naptech/sips/frontend/app/sharedComponents/ui/StatusChangeDialog.tsx)**:
   - Table `Status` columns must render a strictly read-only `<StatusBadge>` (`<span>`, never a 1-click mutating toggle button).
   - Trigger status changes explicitly from row `⋮` Actions menus or detail headers via `<StatusChangeDialog>` (displaying `Current Status -> Target Status` + impact), with modal open state lifted *outside* `<DropdownMenuContent>`.

---

## 5. Playbook: Creating or Switching Themes

When asked to create a new theme, color scheme, or seasonal/partner re-skin:

1. **Never Hardcode Hex Colors in Components**: All components must exclusively reference semantic classes (`bg-surface-forest`, `bg-brand-lime`, `text-text-ink`, `border-border-subtle`, etc.).
2. **Update Channel Values in `app/globals.css`**:
   - To replace the global theme, update the RGB triplets inside `:root` in `app/globals.css`.
   - To support multi-theme switching, add a scoped attribute selector (e.g., `[data-theme="ocean"]` or `.theme-terracotta`) in `app/globals.css` overriding the 12 semantic variables:
     - `--surface-forest` (Primary dark brand anchor)
     - `--surface-forest-light` (10–15% lighter than primary dark anchor)
     - `--brand-lime` (High-luminance accent that achieves $\ge 4.5:1$ contrast against `--surface-forest`)
     - `--brand-lime-hover` (Slightly deeper/saturated variant of accent)
     - `--surface-canvas`, `--surface-bento`, `--text-ink`, `--text-body`, `--text-on-forest`, `--text-on-forest-muted`, `--border-subtle`.
3. **Contrast Verification Invariant**:
   - `--text-on-forest` on `--surface-forest` must maintain $\ge 7:1$ AAA contrast.
   - `--surface-forest` text inside a `--brand-lime` button must maintain $\ge 4.5:1$ AA contrast.

---

## 6. Framework & CSS Technical Invariants

### A. Next.js 16 Image Optimization & Local Media
- **Localhost Media SSRF Protection**: In local development where the frontend consumes media served by the Express backend on `localhost` or `127.0.0.1`, `next.config.js` **must** include `images.dangerouslyAllowLocalIP: true` alongside `remotePatterns`.
- **Remote Patterns**: Ensure `remotePatterns` entries include `protocol: "http"`, `hostname: "localhost"`, `port: "5000"`, and `pathname: "/**"`.
- **Upload Validation, Optimization & URLs**: Validate raster uploads client-side via [`validateImageFile`](file:///home/saad/Downloads/projects/naptech/sips/frontend/app/utility/validateImageFile.ts) (`JPEG`, `PNG`, `WebP`, `AVIF` <= 5MB; never allow `.svg` in user/school/product uploads), resolve backend media paths via [`handleBuildImage`](file:///home/saad/Downloads/projects/naptech/sips/frontend/app/utility/handleBuildImage.ts), and pass explicit `sizes` on every `<Image fill />`.

### B. Next.js 16 Asynchronous APIs
- **Dynamic Route `params`**: In Next.js 15+, dynamic route `params` (and `searchParams`) in Page components, Layouts, and `generateMetadata` are asynchronous Promises (`params: Promise<{ slug: string }>`). Never access `params.slug` synchronously. Always unwrap using `const { slug } = await params;`.
- **Asynchronous Cookies**: Next.js 16 treats `cookies()` as asynchronous. Always `await cookies()` before calling `.get()`, `.set()`, or `.delete()` in server actions or route handlers.
- **Cache Tag Revalidation**: When calling `revalidateTag(tag, profile)`, always pass the profile argument (e.g., `revalidateTag(tag, "default")`) to satisfy the two-argument signature.
- **Router Cache, Prefetching & Read-on-GET Routes**:
  - Never let `DataTable` or `<Link>` prefetch routes whose Server Components trigger read/state side effects (pass `enablePrefetch={false}` on `<DataTable>` and `prefetch={false}` on links in inbox directories).
  - Layout Server Components (such as sidebar wrappers) do not re-run on child navigation or browser Back (`popstate`). Synchronize persistent counters (inbox unread counts, bell notifications) via custom events + `cache: "no-store"` endpoints and `router.refresh()` on dirty return.

### C. Tailwind CSS v4 & Cascade Layers Invariants
- **Layer Encapsulation**: Never place global CSS element selectors (e.g., `*`, `body`, `html`) unlayered in `globals.css`.
- **Cascade Priority**: In CSS Cascade Layers, unlayered styles override layered styles (`@layer utilities`). All global resets (such as default `border-color: hsl(var(--border))`) must strictly reside inside `@layer base { ... }` so utility classes like `border-white/10`, `border-transparent`, and `border-border-subtle` take effect.
- **Interactive Cursors & Anti-Flicker Dropdowns**:
  - Keep `@layer base` cursor rules (`button:not(:disabled), [role="button"]:not([aria-disabled="true"]), summary { cursor: pointer; }`) intact.
  - Style Radix dropdown panels with compositor-safe `.dropdown-menu-panel` (avoid `zoom-in-*`), explicit resting `bg-white`, scoped `group/<name>` wrappers, synchronized `hover:`, `focus:`, and `data-[highlighted]:` colors, and avoid `transition-all` on animated child icons inside menu items.

### D. Dark Header & Hero Visual Continuity
- **Header Rest State**: When the navbar header sits atop a dark background (`bg-surface-forest`), keep the header border transparent (`border-b border-transparent`) at rest to prevent jarring boundary lines cutting across the hero.
- **Header Scrolled State**: Transition to subtle frosted glass borders (`border-b border-white/10` with `backdrop-blur-md`) only when scrolling over light-themed page sections.
- **Button & Pill Outlines**: For glass buttons and pills on dark backgrounds, use soft opacity borders (`border-white/15` with `hover:border-white/25`) rather than opaque or bright white borders.

### E. Authentication, Admin Protection & Notifications
- **Unadvertised Private Portals**: Never expose direct links or navigation buttons to restricted administration or school bursar interfaces (`/admin-login`, `/bursar-login`) on public authentication pages (`/login`, `/register`).
- **Protected Admin Self-Account Controls**: `/dashboard/profile` is strictly read-only for Admins (no self profile edits or self password changes), and Admins cannot suspend, reset passwords on, or archive their own or other admin accounts in `manage-users`.
- **Notifications Behavior**: Notification clicks must mark read via `PATCH` (retaining recent history) and navigate immediately; explicit dismissal uses `DELETE`. Never call `DELETE` directly on click.

### F. Banned Legacy Patterns
- Do **not** use legacy cyan/navy hex classes (`#64CDF4`, `#02263C`, `#0E76BC`, `#EDFAFF`) in any new or redesigned UI.
- Do **not** place `Dashboard` or `Logout` as raw inline links inside the primary content `<nav>` bar; user account actions belong exclusively inside [`UserMenu.tsx`](file:///home/saad/Downloads/projects/naptech/sips/frontend/app/sharedComponents/UserMenu.tsx).
