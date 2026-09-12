import { useEffect, useRef, useState } from "react";

/**
 * AnimatedCounter gently counts up from 0 to target value when the element scrolls into view.
 * Runs only once, smooth cubic ease-out, respects prefers-reduced-motion.
 */
export const AnimatedCounter = ({
  value,
  duration = 1100,
  prefix = "",
  suffix = ""
}) => {
  const ref = useRef(null);
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Extract numeric part and any suffix (like %)
  const strVal = String(value ?? "");
  const numericTarget = typeof value === "number"
    ? value
    : parseInt(strVal.replace(/[^0-9]/g, ""), 10) || 0;
  const inferredSuffix = suffix || (strVal.includes("%") ? "%" : "");

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayValue(numericTarget);
      setHasAnimated(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          observer.unobserve(element);

          let startTimestamp = null;
          const startValue = 0;

          const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const elapsed = timestamp - startTimestamp;
            const progress = Math.min(elapsed / duration, 1);
            // Cubic ease out
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(startValue + (numericTarget - startValue) * easeOut);
            setDisplayValue(current);

            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setDisplayValue(numericTarget);
            }
          };

          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [numericTarget, duration, hasAnimated]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {hasAnimated || (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        ? displayValue
        : 0}
      {inferredSuffix}
    </span>
  );
};
