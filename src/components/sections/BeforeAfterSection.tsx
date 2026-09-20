import type { FC } from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import { CASES } from "../../data/clinicData";
import { ShimmerButton } from "../ui/ShimmerButton";

interface BeforeAfterSectionProps {
  onOpenBooking: (service?: string) => void;
}

export const BeforeAfterSection: FC<BeforeAfterSectionProps> = ({ onOpenBooking }) => {
  const [activeCaseId, setActiveCaseId] = useState(CASES[0].id);
  const [sliderPos, setSliderPos] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const activeCase = CASES.find((c) => c.id === activeCaseId) || CASES[0];

  useEffect(() => {
    const handleGlobalPointerUp = () => {
      isDragging.current = false;
    };
    window.addEventListener("pointerup", handleGlobalPointerUp);
    window.addEventListener("pointercancel", handleGlobalPointerUp);
    return () => {
      window.removeEventListener("pointerup", handleGlobalPointerUp);
      window.removeEventListener("pointercancel", handleGlobalPointerUp);
    };
  }, []);

  const handlePointerMove = useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPos(percent);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // fallback
    }
    handlePointerMove(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging.current) {
      isDragging.current = false;
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // fallback
      }
    }
  };

  const handlePointerMoveEvent = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging.current) {
      handlePointerMove(e.clientX);
    }
  };

  return (
    <section id="cases" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-500/20 border border-pink-400/30 text-xs font-bold text-pink-300 mb-3">
            Клінічні результати До та Після
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Реальні посмішки наших пацієнтів
          </h2>
          <p className="text-base text-slate-300 leading-relaxed">
            Ювелірна точність та естетика. Рухайте повзунок вліво-вправо, щоб порівняти стан зубів до та після процедур.
          </p>
        </div>

        {/* Case Switcher Tabs */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 mb-8 gap-2.5 scrollbar-none px-2">
          {CASES.map((item) => {
            const isActive = item.id === activeCaseId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveCaseId(item.id);
                  setSliderPos(50);
                }}
                className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                  isActive
                    ? "bg-[#d8476c] text-white shadow-lg shadow-pink-500/30 scale-105"
                    : "bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50"
                }`}
              >
                <span>{item.tabLabel || item.title}</span>
                {item.resultMetric && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-700 text-slate-300"
                  }`}>
                    {item.resultMetric}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Slider Card */}
        <div className="max-w-4xl mx-auto bg-slate-800/80 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
          {/* Strict Anti-Stretch Slider Container with clip-path */}
          <div
            ref={sliderRef}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerMove={handlePointerMoveEvent}
            className="relative w-full aspect-16/9 bg-slate-950 select-none overflow-hidden touch-none cursor-ew-resize"
          >
            {/* Layer 2: AFTER IMAGE (Background) */}
            <img
              src={activeCase.afterImg}
              alt="Результат Після"
              className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
            />

            {/* Layer 1: BEFORE IMAGE (Masked with CSS clip-path) */}
            <div
              className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
              style={{
                clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
                WebkitClipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
              }}
            >
              <img
                src={activeCase.beforeImg}
                alt="Стан До лікування"
                className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
              />
            </div>

            {/* Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-[3px] bg-white pointer-events-none z-10 shadow-[0_0_12px_rgba(0,0,0,0.6)]"
              style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
            >
              {/* Handle Button */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center text-xs font-black">
                ↔
              </div>
            </div>

            {/* Badges */}
            <span className="absolute bottom-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-md border border-slate-700 pointer-events-none">
              ДО
            </span>
            <span className="absolute bottom-4 right-4 z-10 bg-[#d8476c]/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-md border border-pink-400/40 pointer-events-none">
              ПІСЛЯ
            </span>
          </div>

          {/* Case Metadata */}
          <div className="p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-t border-slate-700 bg-slate-800">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  {activeCase.service}
                </span>
                {activeCase.duration && (
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-slate-700/80 text-slate-300">
                    ⏱️ {activeCase.duration}
                  </span>
                )}
                {activeCase.doctor && (
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-slate-700/80 text-slate-300">
                    👨‍⚕️ Лікар: {activeCase.doctor}
                  </span>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">{activeCase.title}</h3>
              <p className="text-sm text-pink-300 font-semibold mb-2">{activeCase.subtitle}</p>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                {activeCase.description}
              </p>
            </div>

            <ShimmerButton
              onClick={() => onOpenBooking(activeCase.service)}
              className="h-12 px-7 text-sm font-bold shrink-0 self-stretch sm:self-auto shadow-lg"
            >
              Хочу такий результат
            </ShimmerButton>
          </div>
        </div>
      </div>
    </section>
  );
};
