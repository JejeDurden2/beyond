# Design System - Beyond

## Philosophy

**Refined and premium** while keeping a serious, trustworthy tone. Think private banking, not startup.

### Design Principles

- **Quiet confidence**: No flashy colors, let typography and spacing do the work
- **Depth through subtlety**: Soft shadows, fine borders, layered surfaces
- **Intentional whitespace**: Generous padding, content breathes
- **Micro-interactions**: Smooth transitions that feel expensive

---

## Color Palette

### Light Mode (CSS Variables in `globals.css`)

```css
:root {
  --background: 40 20% 99%; /* Warm off-white */
  --foreground: 220 20% 14%; /* Deep charcoal */
  --muted: 40 15% 96%;
  --muted-foreground: 220 10% 40%;
  --accent: 35 30% 50%; /* Muted gold */
  --accent-foreground: 40 20% 99%;
  --border: 40 15% 90%;
  --ring: 35 30% 50%;
  --card: 0 0% 100%;
  --card-foreground: 220 20% 14%;
}
```

### Dark Mode

```css
.dark {
  --background: 220 20% 10%;
  --foreground: 40 15% 96%;
  --muted: 220 15% 15%;
  --muted-foreground: 220 10% 60%;
  --accent: 35 30% 50%;
  --border: 220 15% 20%;
  --card: 220 20% 12%;
}
```

---

## Typography

### Fonts

- **Sans (body)**: Inter via `--font-sans`
- **Display (headings)**: Fraunces via `--font-display` - elegant serif

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
<h1 className="font-display text-display-lg text-foreground">Hero Title</h1>
<h2 className="font-display text-display-sm text-foreground">Section Title</h2>
<p className="text-muted-foreground text-lg leading-relaxed">Body text</p>
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
<div className="bg-card rounded-2xl border border-border/50 shadow-soft p-8 transition-shadow duration-200 ease-out hover:shadow-soft-md">
  {/* content */}
</div>
```

### Primary Button

```tsx
<button className="bg-foreground text-background hover:bg-foreground/90 rounded-xl px-8 py-4 font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md">
  Get Started
</button>
```

### Secondary Button

```tsx
<button className="border border-border/60 text-foreground rounded-xl px-8 py-4 font-medium transition-colors duration-200 ease-out hover:bg-muted/50">
  Learn More
</button>
```

### Inputs

```tsx
<input className="rounded-xl border-border/60 bg-background px-4 py-3 shadow-inner-soft focus:border-accent focus:ring-accent/20 transition-colors" />
```

### Section Spacing

```tsx
<section className="py-24 px-6">
  <div className="max-w-4xl mx-auto space-y-16">{/* content */}</div>
</section>
```

---

## Selection Styling

```css
::selection {
  @apply bg-accent/20 text-foreground;
}
```

---

## Key Rules

1. **Headings**: Always use `font-display` for h1, h2
2. **Transitions**: Always `duration-200 ease-out`
3. **Borders**: Use `border-border/50` or `border-border/60` for subtlety
4. **Shadows**: Replace harsh shadows with `shadow-soft` variants
5. **Spacing**: Generous - sections get `py-24`, cards get `p-8`
6. **Colors**: No saturated colors, warm neutrals only
