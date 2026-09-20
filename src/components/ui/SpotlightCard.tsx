import type { FC, ReactNode, MouseEvent } from "react";
import { useState, useRef, useCallback } from "react";
import { cn } from "../../lib/utils";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  tilt?: boolean;
  maxTilt?: number; // degrees
  onClick?: () => void;
}

export const SpotlightCard: FC<SpotlightCardProps> = ({
  children,
  className,
  spotlightColor = "rgba(216, 71, 108, 0.12)",
  tilt = true,
  maxTilt = 5,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [transformStyle, setTransformStyle] = useState("");

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setMousePos({ x, y });

      if (tilt) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = -((y - centerY) / centerY) * maxTilt;
        const rotateY = ((x - centerX) / centerX) * maxTilt;

        setTransformStyle(
          `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`
        );
      }
    },
    [tilt, maxTilt]
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (tilt) {
      setTransformStyle(
        "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)"
      );
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: transformStyle,
        transition: isHovered
          ? "transform 0.1s ease-out"
          : "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "relative rounded-3xl overflow-hidden border border-slate-200/80 bg-white transition-shadow duration-300",
        isHovered && "shadow-xl shadow-pink-950/5 border-pink-300/60",
        className
      )}
    >
      {/* Dynamic Cursor Spotlight Radial Overlay */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-1"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${spotlightColor}, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Card Content */}
      <div className="relative z-10 h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
};
