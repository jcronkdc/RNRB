# Light Theme Implementation Guide

## Quick Start - Color Mapping

Based on the NextRecord theme analysis, here's how to map colors to your CronkWaters app:

### CSS Variables to Update

```css
:root {
  /* Primary Brand Color */
  --primary: #ff6600; /* Orange - for buttons, links, accents */
  --primary-foreground: #ffffff; /* White text on orange */

  /* Backgrounds */
  --background: #ffffff; /* Main background */
  --card: #ffffff; /* Card backgrounds */
  --popover: #ffffff; /* Popover backgrounds */
  --modal: #ffffff; /* Modal backgrounds */

  /* Text Colors */
  --foreground: #1c1b1f; /* Primary text (near black) */
  --muted-foreground: #888888; /* Secondary text (gray) */
  --tertiary-foreground: #b1b1b1; /* Tertiary text (light gray) */

  /* Borders & Dividers */
  --border: #e5e5e5; /* Light borders */
  --border-strong: #383838; /* Stronger borders */

  /* Secondary/Accent Colors */
  --secondary: #fcbc45; /* Light orange for subtle accents */
  --secondary-foreground: #1c1b1f;

  /* Muted Elements */
  --muted: #f5f5f5; /* Very light gray for muted backgrounds */

  /* Destructive/Error */
  --destructive: #dc2626; /* Keep existing or adjust */
  --destructive-foreground: #ffffff;

  /* Ring/Focus */
  --ring: #ff6600; /* Orange focus rings */
}
```

### Component-Specific Colors

#### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #ff6600;
  color: #ffffff;
}
.btn-primary:hover {
  background: #e55a00; /* Slightly darker orange */
}

/* Secondary/Outline Button */
.btn-secondary {
  background: #ffffff;
  color: #ff6600;
  border: 1px solid #ff6600;
}
.btn-secondary:hover {
  background: #ff6600;
  color: #ffffff;
}
```

#### Links

```css
a {
  color: #ff6600;
}
a:hover {
  color: #e55a00;
}
```

#### Cards

```css
.card {
  background: #ffffff;
  border: 1px solid #e5e5e5;
}
```

#### Icons

```css
/* Default icon color */
.icon {
  color: #ff6600;
}

/* Icon on dark background */
.icon-on-dark {
  color: #ffffff;
}
```

#### Navigation

```css
/* Light navigation */
.nav {
  background: #ffffff;
  border-bottom: 1px solid #e5e5e5;
}

.nav-link {
  color: #1c1b1f;
}

.nav-link:hover,
.nav-link.active {
  color: #ff6600;
}
```

#### Forms

```css
input,
textarea,
select {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  color: #1c1b1f;
}

input:focus,
textarea:focus,
select:focus {
  border-color: #ff6600;
  outline: 2px solid rgba(255, 102, 0, 0.1);
}

input::placeholder {
  color: #b1b1b1;
}

label {
  color: #1c1b1f;
}
```

### Tailwind CSS Configuration

If using Tailwind, update `tailwind.config.ts`:

```typescript
export default {
  theme: {
    extend: {
      colors: {
        // Primary orange
        primary: {
          DEFAULT: '#FF6600',
          50: '#FFF5ED',
          100: '#FFEAD6',
          200: '#FFD5AD',
          300: '#FFBB80',
          400: '#FF9647',
          500: '#FF6600',
          600: '#E55A00',
          700: '#B84700',
          800: '#8A3500',
          900: '#5C2300',
        },

        // Grayscale
        gray: {
          50: '#F5F5F5',
          100: '#E5E5E5',
          200: '#DADADA',
          300: '#B1B1B1',
          400: '#888888',
          500: '#666666',
          600: '#4A4A4A',
          700: '#383838',
          800: '#1C1B1F',
          900: '#121212',
        },

        // Semantic colors
        background: '#FFFFFF',
        foreground: '#1C1B1F',
        card: '#FFFFFF',
        'card-foreground': '#1C1B1F',
        border: '#E5E5E5',
        muted: '#F5F5F5',
        'muted-foreground': '#888888',
      },
    },
  },
};
```

## Dark Mode (For Reference)

The NextRecord theme uses these dark mode colors:

```css
[data-theme='dark'] {
  --background: #121212;
  --foreground: #ffffff;
  --card: #1c1b1f;
  --muted: #383838;
  --muted-foreground: #b1b1b1;
  --border: #383838;
}
```

## Typography

```css
:root {
  /* Headings */
  --font-heading: 'Oswald', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  /* Body text */
  --font-body: 'Heebo', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: var(--font-heading);
  color: #1c1b1f;
  font-weight: 700;
}

body {
  font-family: var(--font-body);
  color: #1c1b1f;
}
```

## Implementation Checklist

- [ ] Update CSS variables in `globals.css` or theme file
- [ ] Update Tailwind config if using Tailwind
- [ ] Update button components
- [ ] Update link styles
- [ ] Update form components
- [ ] Update navigation
- [ ] Update card components
- [ ] Update icon colors
- [ ] Test contrast ratios for accessibility
- [ ] Verify hover states
- [ ] Test on all pages
- [ ] Update any custom SVG icons to use `#FF6600`

## Notes

- The orange `#FF6600` is the signature color - use it consistently
- Maintain high contrast between text and backgrounds
- Use the color inversion pattern (orange ↔ white) for interactive elements
- Keep the color palette minimal - grayscale + orange works best
- Icons should be outline style in orange for the authentic NextRecord look
