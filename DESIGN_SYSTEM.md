# Design System - Dark Theme with Yellow Accents

## Color Palette

### Primary Colors
```css
Background Primary: #000000 (Black)
Background Secondary: #111827 (Gray-900)
Background Tertiary: #1F2937 (Gray-800)
```

### Accent Colors
```css
Yellow Primary: #FACC15 (Yellow-400)
Yellow Secondary: #EAB308 (Yellow-500)
Yellow Dark: #CA8A04 (Yellow-600)
```

### Text Colors
```css
Heading: #FFFFFF (White)
Body Primary: #D1D5DB (Gray-300)
Body Secondary: #9CA3AF (Gray-400)
Muted: #6B7280 (Gray-500)
```

### Border Colors
```css
Default: #374151 (Gray-700)
Subtle: #1F2937 (Gray-800)
Accent: #FACC15 with opacity (Yellow-400/30)
```

## Component Patterns

### Cards
```css
Background: gradient from gray-800 to gray-900
Border: gray-700
Hover Border: yellow-500/50
Shadow: shadow-2xl
Hover Shadow: shadow-yellow-500/20
```

### Buttons (Primary)
```css
Background: gradient from yellow-400 to yellow-600
Text: black (for contrast)
Hover: gradient from yellow-500 to yellow-700
Shadow: shadow-yellow-500/30
Hover Shadow: shadow-yellow-500/50
Transform: scale-105 on hover
```

### Buttons (Secondary)
```css
Background: gray-800
Text: gray-300
Hover Background: gray-700
Hover Text: white
```

### Form Inputs
```css
Background: gray-900
Border: gray-700
Text: white
Placeholder: gray-500
Focus Border: yellow-500
Focus Ring: yellow-500/20
```

### Badges
```css
Background: yellow-400/10
Text: yellow-400
Border: yellow-400/20
```

## Typography Scale

### Headings
```css
H1: text-4xl to text-6xl, font-black (900)
H2: text-3xl to text-5xl, font-black (900)
H3: text-xl to text-2xl, font-bold (700)
```

### Body Text
```css
Large: text-lg to text-xl
Regular: text-base
Small: text-sm
Extra Small: text-xs
```

### Font Weights
```css
Black: 900 (for headings)
Bold: 700 (for subheadings)
Semibold: 600 (for labels)
Regular: 400 (for body)
```

## Spacing System

### Section Padding
```css
Mobile: py-16 (4rem)
Tablet: py-20 (5rem)
Desktop: py-24 (6rem)
```

### Component Spacing
```css
Gap Small: gap-4 (1rem)
Gap Medium: gap-6 (1.5rem)
Gap Large: gap-8 (2rem)
```

### Container Max Width
```css
max-w-7xl (1280px)
```

## Animation Guidelines

### Transitions
```css
Duration: 300ms (standard)
Easing: ease-in-out
```

### Hover Effects
```css
Scale: scale-105 (5% increase)
Translate Y: -translate-y-1 or -translate-y-2
Opacity: Fade between 0 and 1
```

### Loading States
```css
Pulse: animate-pulse for accent elements
Bounce: animate-bounce for scroll indicators
```

## Shadow System

### Elevation Levels
```css
Low: shadow-lg
Medium: shadow-xl
High: shadow-2xl
Glow: shadow-yellow-500/30 (default)
Glow Hover: shadow-yellow-500/50
```

## Border Radius

### Standard Sizes
```css
Small: rounded-lg (0.5rem)
Medium: rounded-xl (0.75rem)
Large: rounded-2xl (1rem)
Extra Large: rounded-3xl (1.5rem)
Full: rounded-full (9999px)
```

## Responsive Breakpoints

```css
xs: 475px (custom)
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

## Gradient Patterns

### Background Gradients
```css
Dark Vertical: from-black via-gray-900 to-black
Dark Diagonal: from-gray-800 to-gray-900
```

### Accent Gradients
```css
Yellow: from-yellow-400 to-yellow-600
Yellow Hover: from-yellow-500 to-yellow-700
Text Gradient: from-yellow-400 via-yellow-500 to-yellow-600
```

## Accessibility

### Color Contrast
- All text meets WCAG AA standards
- Yellow on black: 12.6:1 ratio
- White on black: 21:1 ratio
- Gray-300 on black: 11.5:1 ratio

### Focus States
```css
Ring: ring-2 ring-yellow-500/20
Border: border-yellow-500
Outline: outline-none (custom focus styles)
```

### Interactive Elements
- Minimum touch target: 44x44px
- Clear hover states
- Keyboard navigation support
- ARIA labels where needed

## Usage Examples

### Section Header
```tsx
<div className="inline-flex items-center px-4 py-2 bg-yellow-400/10 text-yellow-400 rounded-full text-sm font-semibold mb-6 border border-yellow-400/20">
  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
  Section Title
</div>
<h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6">
  Main Heading with <span className="txt">Yellow Accent</span>
</h2>
```

### Card Component
```tsx
<div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-yellow-500/50 shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300 transform hover:scale-105">
  {/* Card content */}
</div>
```

### Primary Button
```tsx
<button className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-full shadow-lg shadow-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105">
  Button Text
</button>
```

### Form Input
```tsx
<input className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white placeholder-gray-500 border border-gray-700 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all" />
```

## Best Practices

1. Always use gradients for backgrounds to add depth
2. Yellow accents should be used sparingly for emphasis
3. Maintain consistent spacing using Tailwind's spacing scale
4. Use transform and shadow for hover effects
5. Ensure all interactive elements have clear hover states
6. Test color contrast for accessibility
7. Use backdrop-blur for overlays and modals
8. Animate with GPU-accelerated properties (transform, opacity)
9. Keep animations subtle and purposeful
10. Use semantic HTML for better accessibility
