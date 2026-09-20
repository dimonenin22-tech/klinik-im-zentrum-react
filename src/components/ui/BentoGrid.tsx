import type { ReactNode, MouseEvent as ReactMouseEvent } from "react";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";

export const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-1 md:grid-cols-3 gap-4",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  onClick,
}: {
  name: string;
  className: string;
  background?: ReactNode;
  Icon: React.ElementType;
  description: string;
  href?: string;
  cta?: string;
  onClick?: () => void;
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      key={name}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-3xl",
        "bg-white border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#d8476c]/40",
        className
      )}
    >
      {/* Dynamic Cursor Spotlight Radial Overlay */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-1"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(216, 71, 108, 0.12), transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {background}

    <div className="relative z-10 flex flex-col justify-between h-full p-6 sm:p-7">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-2xl bg-pink-50 text-[#d8476c] flex items-center justify-center border border-pink-100/80 shadow-2xs group-hover:scale-105 transition-transform duration-300 shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#d8476c] transition-colors leading-snug">
            {name}
          </h3>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="pt-5 mt-4 border-t border-slate-100 flex items-center">
        {onClick ? (
          <button
            onClick={onClick}
            className="group/btn inline-flex items-center gap-2 text-xs font-bold text-[#d8476c] hover:text-[#be185d] transition-colors cursor-pointer"
          >
            <span>{cta || "Дізнатися більше"}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </button>
        ) : (
          <a
            href={href || "#services"}
            className="group/btn inline-flex items-center gap-2 text-xs font-bold text-[#d8476c] hover:text-[#be185d] transition-colors"
          >
            <span>{cta || "Дізнатися більше"}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </a>
        )}
      </div>
    </div>

    <div className="pointer-events-none absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-pink-50/20 via-transparent to-transparent" />
  </div>
  );
};
