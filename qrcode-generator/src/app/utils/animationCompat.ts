/**
 * Cross-Browser Animation Compatibility Utilities
 *
 * Provides optimized animations with:
 * - Reduced motion preference support
 * - Hardware acceleration
 * - Cross-browser compatible Framer Motion variants
 * - Performance-optimized animation configurations
 */

import { Variants, Transition } from "framer-motion";

// ==================== Type Definitions ====================

/** Animation props type for hover/focus effects */
interface AnimationPropsCustom {
  style?: React.CSSProperties;
  whileHover?: { scale?: number };
  whileTap?: { scale?: number };
  whileFocus?: { scale?: number };
  transition?: Transition;
}

/** Generic function type for debounce/throttle */
type GenericFunction = (...args: unknown[]) => unknown;

/** Legacy window with vendor-prefixed animation frame methods */
interface LegacyWindow {
  webkitRequestAnimationFrame?: (callback: FrameRequestCallback) => number;
  mozRequestAnimationFrame?: (callback: FrameRequestCallback) => number;
  webkitCancelAnimationFrame?: (id: number) => void;
  mozCancelAnimationFrame?: (id: number) => void;
}

// ==================== Reduced Motion Detection ====================

/**
 * Check if user prefers reduced motion
 * Works across all modern browsers
 */
export const prefersReducedMotion = (): boolean => {
  if (globalThis.window === undefined) return false;

  return globalThis.window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Create a media query listener for reduced motion preference changes
 */
export const watchReducedMotion = (callback: (prefers: boolean) => void): (() => void) => {
  if (globalThis.window === undefined) return () => {};

  const mediaQuery = globalThis.window.matchMedia("(prefers-reduced-motion: reduce)");

  const handler = (event: MediaQueryListEvent) => {
    callback(event.matches);
  };

  // Modern API
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }

  // Legacy API for older Safari
  const legacyAdd = (
    mediaQuery as { addListener?: (cb: (event: MediaQueryListEvent) => void) => void }
  ).addListener;
  if (legacyAdd) {
    legacyAdd.call(mediaQuery, handler);
  }
  return () => {
    const legacyRemove = (
      mediaQuery as { removeListener?: (cb: (event: MediaQueryListEvent) => void) => void }
    ).removeListener;
    if (legacyRemove) {
      legacyRemove.call(mediaQuery, handler);
    }
  };
};

// ==================== Transition Configurations ====================

/**
 * Base transition that respects reduced motion
 */
export const getBaseTransition = (duration: number = 0.3): Transition => {
  if (prefersReducedMotion()) {
    return { duration: 0.01 };
  }
  return { duration, ease: "easeOut" };
};

/**
 * Spring transition that respects reduced motion
 */
export const getSpringTransition = (stiffness: number = 300, damping: number = 24): Transition => {
  if (prefersReducedMotion()) {
    return { duration: 0.01 };
  }
  return {
    type: "spring",
    stiffness,
    damping,
  };
};

/**
 * Tween transition that respects reduced motion
 */
export const getTweenTransition = (
  duration: number = 0.5,
  ease: "easeIn" | "easeOut" | "easeInOut" | "linear" = "easeInOut",
): Transition => {
  if (prefersReducedMotion()) {
    return { duration: 0.01 };
  }
  return {
    type: "tween",
    duration,
    ease,
  };
};

// ==================== Animation Variants ====================

/**
 * Fade in/out variants
 */
export const getFadeVariants = (duration: number = 0.5): Variants => {
  const reducedMotion = prefersReducedMotion();

  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: reducedMotion ? { duration: 0.01 } : { duration },
    },
    exit: {
      opacity: 0,
      transition: reducedMotion ? { duration: 0.01 } : { duration: duration * 0.5 },
    },
  };
};

/**
 * Slide up variants
 */
export const getSlideUpVariants = (distance: number = 20, duration: number = 0.5): Variants => {
  const reducedMotion = prefersReducedMotion();

  return {
    hidden: {
      opacity: 0,
      y: reducedMotion ? 0 : distance,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: reducedMotion
        ? { duration: 0.01 }
        : { type: "spring", stiffness: 300, damping: 24 },
    },
    exit: {
      opacity: 0,
      y: reducedMotion ? 0 : -distance / 2,
      transition: reducedMotion ? { duration: 0.01 } : { duration: duration * 0.5 },
    },
  };
};

/**
 * Slide in from side variants
 */
export const getSlideInVariants = (
  direction: "left" | "right" = "left",
  distance: number = 50,
): Variants => {
  const reducedMotion = prefersReducedMotion();
  const x = direction === "left" ? -distance : distance;

  return {
    hidden: {
      opacity: 0,
      x: reducedMotion ? 0 : x,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: reducedMotion
        ? { duration: 0.01 }
        : { type: "spring", stiffness: 300, damping: 24 },
    },
    exit: {
      opacity: 0,
      x: reducedMotion ? 0 : x * 0.5,
      transition: reducedMotion ? { duration: 0.01 } : { duration: 0.3 },
    },
  };
};

/**
 * Scale variants
 */
export const getScaleVariants = (initialScale: number = 0.95, duration: number = 0.3): Variants => {
  const reducedMotion = prefersReducedMotion();

  return {
    hidden: {
      opacity: 0,
      scale: reducedMotion ? 1 : initialScale,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: reducedMotion ? { duration: 0.01 } : { duration, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: reducedMotion ? 1 : initialScale,
      transition: reducedMotion ? { duration: 0.01 } : { duration: duration * 0.5 },
    },
  };
};

/**
 * Container variants with staggered children
 */
export const getContainerVariants = (
  staggerDelay: number = 0.05,
  delayChildren: number = 0,
): Variants => {
  const reducedMotion = prefersReducedMotion();

  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reducedMotion ? 0 : staggerDelay,
        delayChildren: reducedMotion ? 0 : delayChildren,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: reducedMotion ? 0 : staggerDelay * 0.5,
        staggerDirection: -1,
      },
    },
  };
};

/**
 * Item variants for use with container stagger
 */
export const getItemVariants = (): Variants => {
  const reducedMotion = prefersReducedMotion();

  return {
    hidden: {
      opacity: 0,
      y: reducedMotion ? 0 : 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: reducedMotion
        ? { duration: 0.01 }
        : { type: "spring", stiffness: 300, damping: 24 },
    },
    exit: {
      opacity: 0,
      y: reducedMotion ? 0 : -10,
      transition: reducedMotion ? { duration: 0.01 } : { duration: 0.2 },
    },
  };
};

/**
 * Modal/popup variants
 */
export const getModalVariants = (): Variants => {
  const reducedMotion = prefersReducedMotion();

  return {
    hidden: {
      opacity: 0,
      scale: reducedMotion ? 1 : 0.95,
      y: reducedMotion ? 0 : 10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: reducedMotion
        ? { duration: 0.01 }
        : {
            type: "spring",
            stiffness: 400,
            damping: 25,
          },
    },
    exit: {
      opacity: 0,
      scale: reducedMotion ? 1 : 0.95,
      y: reducedMotion ? 0 : 10,
      transition: reducedMotion ? { duration: 0.01 } : { duration: 0.15 },
    },
  };
};

/**
 * Backdrop/overlay variants
 */
export const getBackdropVariants = (): Variants => {
  const reducedMotion = prefersReducedMotion();

  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: reducedMotion ? { duration: 0.01 } : { duration: 0.2 },
    },
    exit: {
      opacity: 0,
      transition: reducedMotion ? { duration: 0.01 } : { duration: 0.15 },
    },
  };
};

// ==================== Animation Props Helpers ====================

/**
 * Get animation props with hardware acceleration
 * Forces GPU rendering for smoother animations
 */
export const getHardwareAcceleratedProps = (): AnimationPropsCustom => ({
  style: {
    willChange: "transform, opacity",
    transform: "translateZ(0)",
  },
});

/**
 * Hover animation props (button, card interactions)
 */
export const getHoverProps = (scale: number = 1.02): AnimationPropsCustom => {
  const reducedMotion = prefersReducedMotion();

  if (reducedMotion) {
    return {};
  }

  return {
    whileHover: { scale },
    whileTap: { scale: scale - 0.04 },
    transition: { type: "spring", stiffness: 400, damping: 17 },
  };
};

/**
 * Focus animation props for accessibility
 */
export const getFocusProps = (): AnimationPropsCustom => {
  const reducedMotion = prefersReducedMotion();

  if (reducedMotion) {
    return {};
  }

  return {
    whileFocus: { scale: 1.02 },
    transition: { type: "spring", stiffness: 400, damping: 17 },
  };
};

// ==================== Performance Utilities ====================

/**
 * Debounce function for animation callbacks
 */
export const debounce = <T extends GenericFunction>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for scroll/resize animations
 */
export const throttle = <T extends GenericFunction>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * RequestAnimationFrame wrapper with polyfill fallback
 */
export const raf = (callback: FrameRequestCallback): number => {
  if (globalThis.window === undefined) {
    return 0;
  }

  const legacyWindow = globalThis.window as Window & LegacyWindow;
  const rafFn =
    globalThis.window.requestAnimationFrame ||
    legacyWindow.webkitRequestAnimationFrame ||
    legacyWindow.mozRequestAnimationFrame ||
    ((cb: FrameRequestCallback) => globalThis.window.setTimeout(cb, 1000 / 60));

  return rafFn(callback);
};

/**
 * Cancel animation frame with polyfill fallback
 */
export const cancelRaf = (id: number): void => {
  if (globalThis.window === undefined) return;

  const legacyWindow = globalThis.window as Window & LegacyWindow;
  const cancelFn =
    globalThis.window.cancelAnimationFrame ||
    legacyWindow.webkitCancelAnimationFrame ||
    legacyWindow.mozCancelAnimationFrame ||
    ((i: number) => globalThis.window.clearTimeout(i));

  cancelFn(id);
};

// ==================== CSS Animation Helpers ====================

/**
 * Apply will-change property optimally
 * Should be called just before animation and cleaned up after
 */
export const prepareForAnimation = (element: HTMLElement, properties: string[]): void => {
  element.style.willChange = properties.join(", ");
};

/**
 * Clean up will-change after animation completes
 */
export const cleanupAfterAnimation = (element: HTMLElement): void => {
  element.style.willChange = "auto";
};

/**
 * Force browser to acknowledge style changes before animation
 * Triggers a reflow to ensure animations start from the correct state
 */
export const forceReflow = (element: HTMLElement): void => {
  // Reading offsetHeight forces a reflow - assign to unused variable to suppress linter
  const _forceReflow = element.offsetHeight;
  // Prevent unused variable warning
  if (_forceReflow < 0) {
    // This will never execute, just prevents the variable from being optimized away
  }
};

// ==================== Intersection Observer for Animations ====================

/**
 * Create an intersection observer for triggering animations on scroll
 */
export const createAnimationObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit,
): IntersectionObserver | null => {
  if (globalThis.window === undefined || !("IntersectionObserver" in globalThis.window)) {
    // eslint-disable-next-line no-console
    console.warn("IntersectionObserver not supported - animations will trigger immediately");
    return null;
  }

  return new IntersectionObserver(callback, {
    threshold: 0.1,
    rootMargin: "50px",
    ...options,
  });
};

// ==================== Export Default Configurations ====================

/**
 * Default animation configuration for the app
 */
export const defaultAnimationConfig = {
  // Transitions
  defaultTransition: getBaseTransition(),
  springTransition: getSpringTransition(),
  tweenTransition: getTweenTransition(),

  // Variants
  fadeVariants: getFadeVariants(),
  slideUpVariants: getSlideUpVariants(),
  scaleVariants: getScaleVariants(),
  containerVariants: getContainerVariants(),
  itemVariants: getItemVariants(),
  modalVariants: getModalVariants(),
  backdropVariants: getBackdropVariants(),

  // Feature detection
  prefersReducedMotion: prefersReducedMotion(),
};
