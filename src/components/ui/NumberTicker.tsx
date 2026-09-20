import type { FC } from "react";
import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

interface NumberTickerProps {
  value: number;
  direction?: "up" | "down";
  className?: string;
  delay?: number; // in seconds
  decimalPlaces?: number;
}

export const NumberTicker: FC<NumberTickerProps> = ({
  value,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
}) => {
  const [currentValue, setCurrentValue] = useState(direction === "down" ? value : 0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 2000; // 2s

    const timeout = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // easeOutExpo
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

        if (direction === "up") {
          setCurrentValue(easeProgress * value);
        } else {
          setCurrentValue(value - easeProgress * value);
        }

        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };

      window.requestAnimationFrame(step);
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [value, direction, delay]);

  return (
    <span
      className={cn(
        "inline-block tabular-nums text-black dark:text-white tracking-normal",
        className
      )}
    >
      {Intl.NumberFormat("uk-UA", {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      }).format(currentValue)}
    </span>
  );
};
