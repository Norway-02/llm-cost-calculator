/**
 * Centralized Motion Tokens & Transition Presets
 * Inspired by Linear, Vercel & Stripe design systems.
 */

export const motion = {
  fast: '150ms',
  normal: '220ms',
  medium: '320ms',
  slow: '500ms',

  easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
} as const;

export const transitionStyle = {
  transitionProperty: 'transform, opacity, background-color, border-color, box-shadow, color',
  transitionDuration: motion.normal,
  transitionTimingFunction: motion.easing,
};
