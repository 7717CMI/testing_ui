// Animation easing presets and utilities
export const easingPresets = {
  gentle: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  elastic: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number],
  bounce: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
  smooth: [0.4, 0, 0.2, 1] as [number, number, number, number],
}

export const springConfigs = {
  gentle: { type: 'spring' as const, stiffness: 200, damping: 25, mass: 1 },
  bouncy: { type: 'spring' as const, stiffness: 400, damping: 25, mass: 0.5 },
  snappy: { type: 'spring' as const, stiffness: 500, damping: 30, mass: 0.8 },
  smooth: { type: 'spring' as const, stiffness: 300, damping: 30, mass: 1 },
}

// Tooltip animation variants
export const tooltipVariants = {
  enter: (custom: { width?: number; height?: number } = {}) => ({
    opacity: [0, 1],
    scale: [0.8, 1],
    rotate: [-10, 0],
    x: custom.width ? [-custom.width / 2, 0] : [-20, 0],
    y: custom.height ? [-custom.height / 2, 0] : [-20, 0],
    transition: {
      duration: 0.6,
      type: 'spring',
      stiffness: 400,
      damping: 25,
      mass: 0.5,
    },
  }),
  exit: {
    opacity: [1, 0],
    scale: [1, 0.8],
    rotate: [0, -5],
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

// Content stagger variants
export const contentVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
      },
    },
  },
}

// Element highlight variants
export const highlightVariants = {
  enter: {
    scale: [1, 1.08],
    boxShadow: [
      '0 0 0 0px rgba(59, 130, 246, 0)',
      '0 0 0 8px rgba(59, 130, 246, 0.2)',
    ],
    transition: {
      duration: 0.6,
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
  pulse: {
    scale: [1.02, 1.05],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse",
      ease: 'easeInOut',
    },
  },
}




