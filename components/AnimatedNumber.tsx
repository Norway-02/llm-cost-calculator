'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface AnimatedNumberProps {
  value: number;
  formatFn: (val: number) => string;
  durationMs?: number;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  formatFn,
  durationMs = 320,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value);
  const startValueRef = useRef<number>(value);
  const targetValueRef = useRef<number>(value);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (targetValueRef.current === value) return;

    startValueRef.current = displayValue;
    targetValueRef.current = value;
    let startTime: number | null = null;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const easeOutCubic = (t: number): number => {
      const p = 1 - t;
      return 1 - p * p * p;
    };

    const animate = (timestamp: number) => {
      if (prefersReducedMotion) {
        setDisplayValue(targetValueRef.current);
        return;
      }

      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const easedProgress = easeOutCubic(progress);

      const current =
        startValueRef.current + (targetValueRef.current - startValueRef.current) * easedProgress;

      setDisplayValue(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValueRef.current);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [value, durationMs, displayValue]);

  return <span className={className}>{formatFn(displayValue)}</span>;
};
