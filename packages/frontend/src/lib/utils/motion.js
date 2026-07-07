// Shared motion variants — single source of truth for section-entry animation.
// Consuming components should stay declarative: import a variant, hand it to
// <motion.*>, done. Respecting prefers-reduced-motion is handled once, globally,
// via <MotionConfig reducedMotion="user"> in MainLayout — not per component.

export const easeStandard = [0.16, 1, 0.3, 1];

export const staggerContainer = (stagger = 0.15, delayChildren = 0) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeStandard },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: easeStandard } },
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 90, damping: 16 },
  },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 90, damping: 16 },
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: easeStandard },
  },
};

// Standard viewport trigger for scroll-reveals — one config, reused everywhere,
// so tuning "how early sections reveal" happens in one place.
export const viewportOnce = { once: true, amount: 0.2 };
