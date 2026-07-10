# 🎨 Vibecode Design System Reference

## Color Palette (STRICTLY ENFORCED)

```css
/* Primary Colors - ONLY THESE TWO */
--vibe-black: #050505;   /* Background - Almost black grey */
--vibe-gold: #f6b012;    /* Accent/Primary - Golden yellow */

/* Text Colors */
--text-primary: #ffffff;      /* Pure white */
--text-secondary: rgba(255, 255, 255, 0.6);  /* 60% white */
--text-tertiary: rgba(255, 255, 255, 0.4);   /* 40% white */
```

### ❌ FORBIDDEN
- NO blur effects (`backdrop-filter: blur()`)
- NO transparency on backgrounds (only on text)
- NO gradients (except subtle gold gradients for emphasis)
- NO glowing shadows (`box-shadow: 0 0 20px rgba()`)
- NO glassmorphism
- NO other colors (blue, green, red for UI elements)

### ✅ ALLOWED
- Solid backgrounds (`bg-vibe-black`, `bg-vibe-gold`)
- Text transparency (`text-white/60`)
- Subtle gradients for emphasis (`from-vibe-gold/20 to-vibe-gold/5`)
- Clean shadows for depth (`shadow-lg`)

---

## Typography

### Font Family
```css
font-family: 'Varela Round', sans-serif;
```

**Apply to:** Everything. No exceptions.

**Load from:**
```html
<link href="https://fonts.googleapis.com/css2?family=Varela+Round&display=swap" rel="stylesheet">
```

**Tailwind:**
```js
fontFamily: {
  'varela': ['"Varela Round"', 'sans-serif'],
}
```

### Font Sizes
```css
/* Headings */
h1: text-3xl (30px) - Page titles
h2: text-2xl (24px) - Section headers
h3: text-xl (20px) - Card titles
h4: text-lg (18px) - List items

/* Body */
body: text-base (16px) - Default text
small: text-sm (14px) - Metadata
tiny: text-xs (12px) - Timestamps
```

---

## Spacing & Layout

### Border Radius (Bubbly!)
```css
/* Use these ONLY */
rounded-xl: 12px   /* Small elements (buttons, inputs) */
rounded-2xl: 16px  /* Medium elements (cards) */
rounded-3xl: 24px  /* Large elements (player, modals) */
rounded-full: 9999px  /* Circular (Play button) */
```

### Touch Targets
```css
/* MINIMUM sizes for all interactive elements */
min-height: 44px;
min-width: 44px;
padding: 12px;  /* p-3 */
```

### Safe Areas (Mobile)
```css
/* For notched devices */
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);

/* Tailwind: pt-safe, pb-safe */
```

---

## Component Patterns

### Buttons

**Primary Button (Gold):**
```jsx
<button className="px-6 py-3 rounded-2xl bg-vibe-gold text-vibe-black 
                   font-semibold hover:bg-vibe-gold/90 transition-colors">
  Action
</button>
```

**Secondary Button (Outlined):**
```jsx
<button className="px-6 py-3 rounded-2xl bg-vibe-gold/20 text-white 
                   hover:bg-vibe-gold/30 transition-colors">
  Action
</button>
```

**Icon Button:**
```jsx
<button className="p-3 rounded-xl bg-white/5 text-white 
                   hover:bg-white/10 transition-colors">
  <Icon className="w-5 h-5" />
</button>
```

**Active State:**
```jsx
<button className="p-3 rounded-xl bg-vibe-gold text-vibe-black">
  <Icon className="w-5 h-5" />
</button>
```

### Cards

**Standard Card:**
```jsx
<div className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 
                transition-colors cursor-pointer">
  {/* Content */}
</div>
```

**Emphasis Card (with gold gradient):**
```jsx
<div className="p-6 rounded-3xl bg-gradient-to-br 
                from-vibe-gold/20 to-vibe-gold/5">
  {/* Content */}
</div>
```

### Inputs

**Text Input:**
```jsx
<input 
  type="text"
  className="w-full px-4 py-3 rounded-2xl bg-white/10 text-white 
             placeholder-white/40 border-2 border-transparent 
             focus:border-vibe-gold focus:outline-none transition-colors"
/>
```

**Range Slider:**
```jsx
<input 
  type="range"
  className="w-full h-2 rounded-full appearance-none bg-white/10 
             cursor-pointer"
  style={{
    background: `linear-gradient(to right, 
                 #f6b012 0%, #f6b012 ${progress}%, 
                 rgba(255,255,255,0.1) ${progress}%, 
                 rgba(255,255,255,0.1) 100%)`
  }}
/>
```

### Lists

**Track List Item:**
```jsx
<div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 
                hover:bg-white/10 transition-colors cursor-pointer">
  {/* Cover */}
  <img className="w-14 h-14 rounded-xl object-cover" />
  
  {/* Info */}
  <div className="flex-1 min-w-0">
    <h4 className="text-white font-semibold truncate">Title</h4>
    <p className="text-white/60 text-sm truncate">Artist</p>
  </div>
  
  {/* Action */}
  <button className="p-2 rounded-xl bg-vibe-gold/20 text-vibe-gold">
    <Plus className="w-5 h-5" />
  </button>
</div>
```

---

## Icons

**Library:** Lucide React

**Sizing:**
```jsx
/* Standard */
<Icon className="w-5 h-5" />  /* 20px - Default */

/* Large */
<Icon className="w-6 h-6" />  /* 24px - Navigation */

/* Extra Large */
<Icon className="w-8 h-8" />  /* 32px - Play button */

/* Massive */
<Icon className="w-12 h-12" />  /* 48px - Empty states */
```

**Fill:**
```jsx
/* Filled icons (play, pause, etc.) */
<Icon className="w-6 h-6 fill-current" />
```

---

## Animations

**Transitions:**
```css
/* Standard */
transition-colors  /* For color changes */
transition-all     /* For multiple properties */

/* Duration: 150ms (default) */
```

**Hover States:**
```css
/* Brightness change */
hover:bg-vibe-gold/90

/* Opacity change */
hover:bg-white/10

/* Scale (subtle) */
active:scale-98
```

**Loading Spinner:**
```jsx
<Loader2 className="w-8 h-8 text-vibe-gold animate-spin" />
```

---

## Layout Structure

### Page Layout
```jsx
<div className="min-h-screen bg-vibe-black pb-32">
  {/* Header - Sticky */}
  <div className="sticky top-0 bg-vibe-black z-10 pt-safe">
    <div className="p-4">
      <h1 className="text-3xl font-bold text-vibe-gold">Title</h1>
    </div>
  </div>
  
  {/* Content */}
  <div className="px-4">
    {/* Content here */}
  </div>
</div>
```

### Grid Layouts
```jsx
/* Two columns */
<div className="grid grid-cols-2 gap-4">
  {/* Items */}
</div>

/* Responsive three columns */
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {/* Items */}
</div>
```

---

## Player "Deck" Design

```
┌─────────────────────────────────────────────────────┐
│  Cover Art    Title                          [🎤]   │
│               Artist                                 │
├─────────────────────────────────────────────────────┤
│  ──────●───────────────────────────────────         │
│  0:00                                  3:45         │
├─────────────────────────────────────────────────────┤
│  [🔁] [⏮️] [⏪]  ((▶️))  [⏩] [⏭️] [🔀]            │
└─────────────────────────────────────────────────────┘
```

**Center Button:** 64px circle, golden background
**Side Buttons:** 44px square, gold/20 background
**Progress Bar:** Full width, gold fill
**Spacing:** Equal gaps between all controls

---

## Responsive Breakpoints

```css
/* Mobile First - No breakpoint needed */
default: 320px+

/* Tablet */
md: 768px+

/* Desktop */
lg: 1024px+

/* Large Desktop */
xl: 1280px+
```

**Strategy:** Design for mobile, enhance for larger screens.

---

## Accessibility

### Touch Targets
✅ **Minimum:** 44x44px (Apple HIG standard)
✅ **Optimal:** 48x48px or larger

### Contrast Ratios
✅ White on #050505: 20.42:1 (AAA)
✅ #f6b012 on #050505: 8.23:1 (AAA)
✅ White/60 on #050505: 7.26:1 (AA)

### Focus States
```css
focus:border-vibe-gold
focus:outline-none
```

---

## Mobile Optimizations

### Viewport
```html
<meta name="viewport" 
      content="width=device-width, initial-scale=1.0, 
               maximum-scale=1.0, user-scalable=no, 
               viewport-fit=cover" />
```

### Prevent Bounce
```css
body {
  overscroll-behavior-y: contain;
}
```

### Tap Highlight
```css
button, a {
  -webkit-tap-highlight-color: transparent;
}
```

### Safe Areas
```css
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
padding-left: env(safe-area-inset-left);
padding-right: env(safe-area-inset-right);
```

---

## Don'ts ❌

1. ❌ Don't use any color other than black, white, and gold
2. ❌ Don't use blur or transparency on backgrounds
3. ❌ Don't use sharp corners (min `rounded-xl`)
4. ❌ Don't use small touch targets (min 44px)
5. ❌ Don't use fonts other than Varela Round
6. ❌ Don't use gradients as primary backgrounds
7. ❌ Don't use glowing shadows
8. ❌ Don't break the bubbly, friendly vibe

---

## Examples

### ✅ Good
```jsx
<button className="p-3 rounded-2xl bg-vibe-gold text-vibe-black">
  Play
</button>
```

### ❌ Bad
```jsx
<button className="px-2 py-1 rounded bg-blue-500 text-white 
                   shadow-xl backdrop-blur">
  Play
</button>
```

---

*This is the law. Follow it. 🎨*
