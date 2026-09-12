import { useEffect, useRef, useState } from "react";

/**
 * ScrollReveal adds a gentle fade and slight upward slide when an element enters the viewport.
 * Uses IntersectionObserver with once: true so elements stay visible and don't re-trigger abruptly.
 * Automatically respects prefers-reduced-motion.
 */
export const ScrollReveal = ({
  children,
  className = "",
  delay = 0,
  duration = 450,
  direction = "up"
}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Respect user's motion preferences
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -30px 0px"
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const translateClass = direction === "up"
    ? (isVisible ? "translate-y-0" : "translate-y-3.5")
    : "";

  return (
    <div
      ref={ref}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)"
      }}
      className={`transition-all ${
        isVisible ? "opacity-100" : "opacity-0"
      } ${translateClass} ${className}`}
    >
      {children}
    </div>
  );
};
