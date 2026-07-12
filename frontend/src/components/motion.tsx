"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Transition,
  type Variants,
} from "motion/react";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

// ---- Shared variants ----
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: 24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: -24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

const directionVariant: Record<
  NonNullable<RevealProps["direction"]>,
  Variants
> = {
  up: fadeUp,
  down: fadeDown,
  left: fadeLeft,
  right: fadeRight,
  scale: scaleIn,
};

/** Tuned spring shared by every hover/tap micro-interaction in the app. */
export const hoverSpring: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 28,
};

/**
 * Reveals its children with a staggered fade-up as they scroll into view
 * (or immediately on mount). Reduced-motion safe.
 */
export function Stagger({
  children,
  className,
  once = true,
  trigger = "scroll",
}: {
  children: ReactNode;
  className?: string;
  once?: boolean;
  /** See `Reveal`'s `trigger` prop — use "mount" for above-the-fold content. */
  trigger?: "scroll" | "mount";
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  const viewProps =
    trigger === "mount"
      ? { animate: "show" as const }
      : { whileInView: "show" as const, viewport: { once, margin: "-40px" } };
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      {...viewProps}
    >
      {children}
    </motion.div>
  );
}

interface RevealProps {
  children: ReactNode;
  className?: string;
  variant?: Variants;
  /** Convenience alternative to `variant` — picks a direction-based fade. Ignored if `variant` is set. */
  direction?: "up" | "down" | "left" | "right" | "scale";
  /** Adds a soft focus-pull blur on entry, on top of the fade/slide. */
  blur?: boolean;
  delay?: number;
  /**
   * "scroll" (default) reveals via whileInView — appropriate for content
   * below the fold. "mount" animates immediately via initial/animate instead
   * — required for anything always visible without scrolling (page headers,
   * hero cards), since whileInView's IntersectionObserver callback doesn't
   * fire synchronously and can be caught mid-fade on first paint.
   */
  trigger?: "scroll" | "mount";
}

/** A single staggered/standalone reveal item. */
export function Reveal({
  children,
  className,
  variant,
  direction = "up",
  blur = false,
  delay = 0,
  trigger = "scroll",
}: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  const resolved = variant ?? directionVariant[direction];
  const withBlur: Variants = blur
    ? {
        hidden: { ...resolved.hidden, filter: "blur(6px)" },
        show: {
          ...resolved.show,
          filter: "blur(0px)",
        },
      }
    : resolved;
  const viewProps =
    trigger === "mount"
      ? { animate: "show" as const }
      : {
          whileInView: "show" as const,
          viewport: { once: true, margin: "-40px" },
        };
  return (
    <motion.div
      className={className}
      variants={withBlur}
      initial="hidden"
      {...viewProps}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

/** Count-up number that animates when it scrolls into view. */
export function AnimatedNumber({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 90, damping: 20 });

  useEffect(() => {
    if (reduce) return;
    if (inView) mv.set(value);
  }, [inView, value, mv, reduce]);

  useEffect(() => {
    if (reduce) return;
    return spring.on("change", (v) => {
      if (ref.current) ref.current.textContent = String(Math.round(v));
    });
  }, [spring, reduce]);

  return (
    <span ref={ref} className={className}>
      {reduce ? value : 0}
    </span>
  );
}

/**
 * Wraps a decorative background element (glow orb, texture) and translates
 * it against scroll progress for a subtle parallax drift. Use sparingly —
 * 1-2 instances per page. Reduced-motion renders a static, unmoving layer.
 */
export function ParallaxLayer({
  children,
  className,
  speed = 0.3,
}: {
  children: ReactNode;
  className?: string;
  /** Positive = drifts down slower than scroll (background feel); negative = drifts up. */
  speed?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`${-speed * 100}px`, `${speed * 100}px`]);

  if (reduce) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }
  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}

/**
 * Thin scroll-progress bar bound to the page's vertical scroll position.
 * Intended for a single long-scrolling page (e.g. issue detail), not global.
 */
export function ScrollProgress({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  if (reduce) return null;
  return (
    <motion.div
      className={`fixed left-0 top-0 z-50 h-[3px] origin-left bg-[var(--color-primary)] ${className}`}
      style={{ scaleX: scrollYProgress, width: "100%" }}
    />
  );
}

/**
 * Progressive, sequenced reveal for ordered content (asset history,
 * maintenance records). Unlike `Stagger` (all children animate together once
 * the container enters view), each `TimelineReveal.Step` reveals
 * independently as the user scrolls past it — appropriate for long lists.
 * Optionally draws an animated connector line down the left edge.
 */
const TimelineContext = createContext<{ showConnector: boolean }>({
  showConnector: false,
});

function TimelineRevealRoot({
  children,
  className = "",
  showConnector = false,
}: {
  children: ReactNode;
  className?: string;
  showConnector?: boolean;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.4"],
  });

  return (
    <TimelineContext.Provider value={{ showConnector }}>
      <div ref={ref} className={`relative ${className}`}>
        {showConnector && !reduce && (
          <motion.span
            aria-hidden
            className="absolute left-[15px] top-1 w-px bg-[var(--color-border-strong)]"
            style={{ height: "100%", scaleY: scrollYProgress, originY: 0 }}
          />
        )}
        {showConnector && reduce && (
          <span
            aria-hidden
            className="absolute left-[15px] top-1 h-full w-px bg-[var(--color-border-strong)]"
          />
        )}
        {children}
      </div>
    </TimelineContext.Provider>
  );
}

function TimelineStep({
  children,
  className = "",
  index = 0,
}: {
  children: ReactNode;
  className?: string;
  index?: number;
}) {
  const reduce = useReducedMotion();
  const { showConnector } = useContext(TimelineContext);
  if (reduce) {
    return (
      <div className={`relative ${showConnector ? "pl-9" : ""} ${className}`}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      className={`relative ${showConnector ? "pl-9" : ""} ${className}`}
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.05, 0.3) }}
    >
      {children}
    </motion.div>
  );
}

export const TimelineReveal = Object.assign(TimelineRevealRoot, {
  Step: TimelineStep,
});

/** Shared hover-lift wrapper — consistent spring physics for any card/row. */
export function HoverLift({
  children,
  className,
  lift = -4,
}: {
  children: ReactNode;
  className?: string;
  lift?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      whileHover={{ y: lift }}
      whileTap={{ scale: 0.99 }}
      transition={hoverSpring}
    >
      {children}
    </motion.div>
  );
}

export { motion };
