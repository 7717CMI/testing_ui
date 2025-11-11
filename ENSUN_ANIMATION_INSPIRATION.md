# 🎨 Animation Inspiration from Ensun.io

## Overview
This document captures animation and dynamic interaction patterns from [ensun.io](https://ensun.io/en) that can be implemented in our healthcare data platform.

## Key Animation Patterns Observed

### 1. **Smooth Scroll Animations**
- **Pattern**: Content fades in and slides up as user scrolls
- **Implementation**: Use `framer-motion` with `useInView` hook
- **Use Cases**: 
  - Landing page sections
  - Feature cards
  - Statistics counters

```tsx
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}
```

### 2. **Interactive Search Interface**
- **Pattern**: Real-time search with smooth transitions
- **Features**:
  - Input field with animated placeholder
  - Search button with hover effects
  - Results appear with fade-in animation
- **Implementation**: Already have search, enhance with animations

### 3. **Animated Statistics/Counters**
- **Pattern**: Numbers count up from 0 to target value
- **Current Status**: We have `AnimatedCounter` component
- **Enhancement**: Add stagger effect for multiple counters

```tsx
// Enhanced counter with stagger
{stats.map((stat, index) => (
  <motion.div
    key={stat.id}
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.1 }}
  >
    <AnimatedCounter value={stat.value} />
  </motion.div>
))}
```

### 4. **Card Hover Effects**
- **Pattern**: Cards lift and scale on hover with smooth transitions
- **Implementation**: Add to facility cards, insight cards

```tsx
<motion.div
  whileHover={{ scale: 1.02, y: -4 }}
  transition={{ type: "spring", stiffness: 300 }}
  className="card"
>
  {/* Card content */}
</motion.div>
```

### 5. **Smooth Section Transitions**
- **Pattern**: Sections fade in as they enter viewport
- **Implementation**: Use intersection observer with framer-motion

### 6. **Dynamic Content Loading**
- **Pattern**: Content appears with staggered animations
- **Use Cases**:
  - Search results
  - Facility listings
  - Insights feed

### 7. **Interactive Elements**
- **Pattern**: Buttons and links have subtle hover animations
- **Current Status**: Basic hover states exist
- **Enhancement**: Add scale and shadow effects

## Implementation Plan

### Phase 1: Landing Page Enhancements
- [ ] Add scroll-triggered animations to hero section
- [ ] Animate feature cards on scroll
- [ ] Add counter animations to statistics
- [ ] Implement smooth section transitions

### Phase 2: Search & Results
- [ ] Add fade-in animations to search results
- [ ] Implement staggered card animations
- [ ] Add loading skeleton animations
- [ ] Enhance filter interactions

### Phase 3: Data Catalog
- [ ] Add hover effects to category cards
- [ ] Implement smooth transitions between views
- [ ] Add animated loading states
- [ ] Enhance facility card interactions

### Phase 4: Insights Page
- [ ] Add scroll animations to articles
- [ ] Implement smooth tab transitions
- [ ] Add hover effects to trending topics
- [ ] Enhance article card animations

## Code Examples

### Scroll-Triggered Animation Component
```tsx
"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

interface ScrollRevealProps {
  children: React.ReactNode
  delay?: number
  direction?: "up" | "down" | "left" | "right"
}

export function ScrollReveal({ 
  children, 
  delay = 0,
  direction = "up" 
}: ScrollRevealProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 20 : direction === "down" ? -20 : 0,
      x: direction === "left" ? 20 : direction === "right" ? -20 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: 0.5,
        delay,
        ease: "easeOut"
      }
    }
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
    >
      {children}
    </motion.div>
  )
}
```

### Staggered List Animation
```tsx
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

<motion.div variants={container} initial="hidden" animate="visible">
  {items.map((item) => (
    <motion.div key={item.id} variants={item}>
      {/* Item content */}
    </motion.div>
  ))}
</motion.div>
```

### Enhanced Card Hover
```tsx
<motion.div
  whileHover={{ 
    scale: 1.02, 
    y: -4,
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
  }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
  className="card"
>
  {/* Card content */}
</motion.div>
```

## Performance Considerations

1. **Use `will-change` CSS property** for animated elements
2. **Prefer transform and opacity** over layout properties
3. **Use `triggerOnce`** for scroll animations to avoid re-triggering
4. **Lazy load animations** for below-the-fold content
5. **Reduce motion** for users with `prefers-reduced-motion`

## Accessibility

- Respect `prefers-reduced-motion` media query
- Ensure animations don't interfere with keyboard navigation
- Maintain focus indicators during animations
- Test with screen readers

## Next Steps

1. Review and prioritize animation enhancements
2. Create reusable animation components
3. Implement animations incrementally
4. Test performance impact
5. Gather user feedback

---

**Reference**: [ensun.io](https://ensun.io/en) - AI-based Company Search Platform

