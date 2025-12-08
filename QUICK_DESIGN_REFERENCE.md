# 🎨 Quick Design Reference Card

> **Fast lookup guide for developers implementing the new design system**

---

## 🎨 **Colors - Quick Pick**

```jsx
// Primary Actions
className="bg-gradient-to-r from-energy-solar to-energy-gold"

// Success (Energy Surplus)
className="text-energy-sage border-energy-sage/30 bg-energy-sage/20"

// Warning (Balanced)
className="text-energy-solar border-energy-solar/30 bg-energy-solar/20"

// Error (Energy Deficit)
className="text-accent-coral border-accent-coral/30 bg-accent-coral/20"

// Text Colors
className="text-white"          // Primary text
className="text-neutral-silver" // Secondary text
className="text-neutral-ash"    // Muted text
```

---

## ✍️ **Typography - Quick Classes**

```jsx
// Page Title
className="font-display text-heading-1 font-semibold gradient-text"

// Section Header
className="font-display text-heading-2 font-semibold text-white"

// Card Title
className="font-display text-heading-4 font-medium text-white"

// Body Text
className="font-body text-body text-neutral-silver"

// Caption/Label
className="font-body text-caption uppercase text-neutral-ash tracking-wider"

// Large Metric
className="font-display text-4xl font-bold text-energy-solar"
```

---

## 📦 **Components - Ready to Use**

### **Glass Card**
```jsx
<GlassCard glow={false} hover={true}>
  <h3 className="font-display font-semibold mb-4 gradient-text">Title</h3>
  <p className="text-neutral-silver">Content</p>
</GlassCard>
```

### **Animated Metric**
```jsx
<AnimatedMetric
  value={87.5}
  label="Solar Utilization"
  unit="%"
  icon="☀️"
  color="amber"
  trend={2.3}
/>
```

### **Buttons**
```jsx
// Primary
<button className="px-8 py-3 bg-gradient-to-r from-energy-sage to-energy-forest rounded-2xl font-display font-semibold text-white shadow-lg shadow-energy-sage/30 hover:shadow-xl hover:shadow-energy-sage/50 transition-all">
  Start
</button>

// Secondary
<button className="px-8 py-3 glass rounded-2xl font-semibold border border-white/10 hover:bg-white/10 hover:border-energy-solar/30 transition-all">
  Cancel
</button>
```

### **Badges**
```jsx
<span className="px-3 py-1.5 rounded-full text-xs font-medium border bg-energy-sage/20 text-energy-sage border-energy-sage/30">
  Exporting
</span>
```

---

## 📐 **Spacing - Common Patterns**

```jsx
// Card
className="p-6 rounded-3xl gap-4"

// Section
className="px-8 py-8 space-y-6"

// Grid
className="grid grid-cols-12 gap-6"

// Stack
className="space-y-6"
```

---

## 🎬 **Animations - Quick Patterns**

```jsx
// Entrance
<motion.div
  initial={{ opacity: 0, y: 24 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
>

// Hover
whileHover={{ y: -4, scale: 1.01 }}
whileTap={{ scale: 0.98 }}

// Stagger Children
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }}
>
```

---

## 🎨 **Color Reference Table**

| Use Case | Color | Class |
|----------|-------|-------|
| **Primary CTA** | Solar | `bg-energy-solar` |
| **Success** | Sage | `text-energy-sage` |
| **Warning** | Sunset | `text-accent-sunset` |
| **Error** | Coral | `text-accent-coral` |
| **Info** | Silver | `text-neutral-silver` |
| **Highlight** | Gold | `text-energy-gold` |
| **Eco** | Mint | `text-energy-mint` |

---

## 📱 **Responsive Breakpoints**

```jsx
className="px-4 md:px-6 lg:px-8"           // Padding
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" // Grid
className="text-sm md:text-base lg:text-lg" // Text size
```

---

## ✅ **Quick Checklist**

Before pushing code:

- [ ] Used new color palette (no blue/purple)
- [ ] Applied correct typography classes
- [ ] Followed 4px spacing grid
- [ ] Used rounded-2xl or rounded-3xl for borders
- [ ] Added smooth transitions (0.3-0.6s)
- [ ] Tested hover states
- [ ] Checked mobile responsiveness
- [ ] Verified contrast ratios

---

**Full Documentation**: [DESIGN_SYSTEM_COMPLETE.md](./DESIGN_SYSTEM_COMPLETE.md)
