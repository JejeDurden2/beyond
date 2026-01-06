# Design System - Beyond

## Philosophy

**Refined and premium** while keeping a serious, trustworthy tone. Think private banking, not startup.

### Design Principles

- **Quiet confidence**: Navy and gold convey trust and heritage
- **Depth through subtlety**: Soft shadows, fine borders, layered surfaces
- **Intentional whitespace**: Generous padding, content breathes
- **Micro-interactions**: Smooth transitions that feel expensive

---

## Brand Color Palette

### Primary Colors (CSS Variables in `globals.css`)

```css
:root {
  /* Beyond Brand Colors */
  --navy-deep: 213 54% 24%; /* #1a365d - textes, headers */
  --navy-light: 213 52% 34%; /* #2c5282 - liens, textes secondaires */
  --gold-heritage: 43 86% 38%; /* #B8860B - accents, CTAs, bordures actives */
  --gold-soft: 43 64% 56%; /* #D4A84B - hovers, highlights */
  --cream: 43 50% 98%; /* #FDFBF7 - background principal */
  --warm-gray: 40 22% 96%; /* #F7F5F2 - cards, sections alternees */
  --slate: 215 16% 47%; /* #64748b - texte body */
}
```

### Semantic Mappings

| Semantic Token       | Maps To       | Usage                 |
| -------------------- | ------------- | --------------------- |
| `primary`            | navy-deep     | Main text, headers    |
| `primary-foreground` | cream         | Text on primary bg    |
| `secondary`          | warm-gray     | Secondary backgrounds |
| `accent`             | gold-heritage | CTAs, active states   |
| `background`         | cream         | Main background       |
| `foreground`         | navy-deep     | Body text             |
| `muted`              | warm-gray     | Muted backgrounds     |
| `muted-foreground`   | slate         | Muted text            |

### Tailwind Usage

```tsx
// Primary button (gold CTA)
<button className="bg-gold-heritage text-cream hover:bg-gold-soft">

// Links
<a className="text-navy-light hover:text-gold-heritage">

// Cards
<div className="bg-warm-gray border-border/50">

// Headings
<h1 className="text-navy-deep font-serif-brand">
```

---

## Typography

### Fonts

- **Serif (headings)**: Georgia, 'Times New Roman', serif - via `font-serif-brand`
- **Sans (body)**: Inter via `--font-sans`
- **Display**: Fraunces via `--font-display` (alternate for special headings)

### Font Sizes (Tailwind)

```typescript
fontSize: {
  'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
  'display': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
  'display-sm': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
}
```

### Usage

```tsx
<h1 className="font-serif-brand text-display-lg text-navy-deep">Hero Title</h1>
<h2 className="font-serif-brand text-display-sm text-navy-deep">Section Title</h2>
<p className="text-slate text-lg leading-relaxed">Body text</p>
```

---

## Logo

The `Logo` component in `components/ui/Logo.tsx` supports three variants:

```tsx
import { Logo } from '@/components/ui';

<Logo variant="full" />     // Full logo with symbol + text (default)
<Logo variant="symbol" />   // Symbol only (for mobile/favicon)
<Logo variant="text" />     // Text only with underline
```

---

## Shadows

```typescript
boxShadow: {
  'soft': '0 2px 8px -2px rgba(0,0,0,0.05), 0 4px 16px -4px rgba(0,0,0,0.05)',
  'soft-md': '0 4px 12px -4px rgba(0,0,0,0.08), 0 8px 24px -8px rgba(0,0,0,0.06)',
  'soft-lg': '0 8px 24px -8px rgba(0,0,0,0.1), 0 16px 48px -16px rgba(0,0,0,0.08)',
  'inner-soft': 'inset 0 2px 4px 0 rgba(0,0,0,0.02)',
}
```

---

## Border Radius

```typescript
borderRadius: {
  xl: '1rem',
  '2xl': '1.25rem',
}
```

---

## Animations

```typescript
animation: {
  'fade-in': 'fadeIn 0.5s ease-out',
  'slide-up': 'slideUp 0.5s ease-out',
}
```

All interactive elements use `transition-all duration-200 ease-out`.

---

## Component Patterns

### Cards

```tsx
<div className="bg-warm-gray rounded-2xl border border-border/50 shadow-soft p-8 transition-shadow duration-200 ease-out hover:shadow-soft-md">
  {/* content */}
</div>
```

### Primary Button (Gold CTA)

```tsx
<button className="bg-gold-heritage text-cream hover:bg-gold-soft rounded-xl px-8 py-4 font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md">
  Get Started
</button>
```

### Secondary Button

```tsx
<button className="border border-border/60 text-foreground rounded-xl px-8 py-4 font-medium transition-colors duration-200 ease-out hover:bg-muted/50">
  Learn More
</button>
```

### Links

```tsx
<a className="text-navy-light hover:text-gold-heritage transition-colors duration-200 ease-out">
  Click here
</a>
```

### Inputs

```tsx
<input className="rounded-xl border-border/60 bg-background px-4 py-3 shadow-inner-soft focus:border-gold-heritage focus:ring-gold-heritage/50 transition-colors" />
```

### Section Spacing

```tsx
<section className="py-24 px-6">
  <div className="max-w-4xl mx-auto space-y-16">{/* content */}</div>
</section>
```

### Header/Navbar

```tsx
<header className="border-b border-warm-gray bg-cream/80 backdrop-blur-sm sticky top-0 z-50">
```

---

## Selection Styling

```css
::selection {
  @apply bg-gold-heritage/20 text-foreground;
}
```

---

## Focus Rings

```css
focus:ring-gold-heritage/50
focus:border-gold-heritage
```

---

## Key Rules

1. **Headings**: Always use `font-serif-brand` for h1, h2
2. **CTAs**: Use `bg-gold-heritage` with `text-cream`
3. **Links**: Use `text-navy-light hover:text-gold-heritage`
4. **Cards**: Use `bg-warm-gray` with subtle border
5. **Transitions**: Always `duration-200 ease-out`
6. **Borders**: Use `border-border/50` or `border-warm-gray` for subtlety
7. **Shadows**: Replace harsh shadows with `shadow-soft` variants
8. **Spacing**: Generous - sections get `py-24`, cards get `p-8`
9. **Focus states**: Use `ring-gold-heritage/50`
