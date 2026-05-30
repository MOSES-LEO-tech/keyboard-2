# UI/UX Rules

## Design System

### Color Modes
- Always support light and dark mode
- Use CSS variables for theming — never hardcode colors
- Dark mode: prefer dark grays over pure black (#0a0a0a to #1a1a1a)
- Light mode: prefer warm whites (#fafafa to #ffffff)

### Typography
- Sans-serif: Geist (headings), Geist Mono (code)
- No default font stacks (Inter, Roboto, Arial)
- Base size: 16px, scale: 1.25 major third
- Line height: 1.5 body, 1.2 headings

### Spacing
- Base unit: 4px (Tailwind default)
- Page gutters: 16px mobile, 24px tablet, 32px desktop
- Section gaps: 32px mobile, 48px tablet, 64px desktop
- Card padding: 16px mobile, 24px desktop

### Layout
- Max content width: 1200px (contained), 1400px (full-width areas)
- Sidebar: 260px collapsed, 280px expanded
- Modal max-width: 520px small, 640px default, 800px large

### Components (shadcn/ui)
- Use shadcn/ui primitives — don't build custom from scratch
- Custom Components extend shadcn/ui with composition
- Buttons: always have hover, active, focus, disabled states
- Inputs: always have label, placeholder, error, disabled states
- No custom scrollbars unless subtle and accessible

### Responsive Breakpoints
- Mobile: < 640px (sm)
- Tablet: 640px - 1024px (md)
- Desktop: 1024px - 1280px (lg)
- Wide: > 1280px (xl, 2xl)

### Accessibility
- All interactive elements: focus-visible ring
- All images: alt text (decorative: alt="")
- Forms: labels linked to inputs via htmlFor
- Color contrast ratio: 4.5:1 minimum
- Keyboard navigation: Tab order logical, Esc closes modals

### Avoid
- Purple-on-white defaults
- Flat single-color backgrounds
- Default system fonts
- Cluttered interfaces
- Oversized modals
- Inconsistent spacing

### Prefer
- Intentional visual direction per project
- Subtle gradients, patterns, or textures for depth
- Expressive typography
- Meaningful micro-animations
- Clean visual hierarchy
