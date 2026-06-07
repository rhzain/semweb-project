import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  once?: boolean;
  rootMargin?: string;
  y?: number;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  duration = 650,
  once = true,
  rootMargin = "0px 0px -12% 0px",
  y = 28,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (prefersReducedMotion.matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(entry.target);
          }
          return;
        }

        if (!once) {
          setIsVisible(false);
        }
      },
      {
        rootMargin,
        threshold: 0.16,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [once, rootMargin]);

  return (
    <div
      className={cn(
        "transition-[opacity,transform] ease-out will-change-[opacity,transform] motion-reduce:transition-none motion-reduce:will-change-auto",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-[var(--scroll-reveal-y)] opacity-0",
        className,
      )}
      ref={ref}
      style={
        {
          "--scroll-reveal-y": `${y}px`,
          transitionDelay: isVisible ? `${delay}ms` : "0ms",
          transitionDuration: `${duration}ms`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
