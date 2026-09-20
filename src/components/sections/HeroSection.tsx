import type { FC } from "react";
import { Shield, Moon } from "lucide-react";
import { ShimmerButton } from "../ui/ShimmerButton";
import { BorderBeam } from "../ui/BorderBeam";
import { NumberTicker } from "../ui/NumberTicker";
import { DotPattern } from "../ui/DotPattern";

interface HeroSectionProps {
  onOpenBooking: (service?: string) => void;
}

export const HeroSection: FC<HeroSectionProps> = ({ onOpenBooking }) => {
  return (
    <section
      id="hero"
      className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden bg-gradient-to-b from-white via-pink-50/20 to-slate-50"
    >
      {/* Background Dot Pattern with radial fade */}
      <DotPattern
        width={28}
        height={28}
        cx={1.2}
        cy={1.2}
        cr={1.2}
        className="[mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_75%)] opacity-60"
      />

      {/* Ambient background glows */}
      <div className="pointer-events-none absolute top-1/4 -right-20 w-96 h-96 bg-[#d8476c]/15 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 -left-20 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Content Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Location & Schedule Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 border border-pink-200/80 shadow-xs mb-6">
              <span className="w-2 h-2 rounded-full bg-[#d8476c] animate-pulse" />
              <span className="text-xs sm:text-sm font-bold text-[#d8476c]">
                м. Одеса, вул. Успенська, 17 • Пн–Сб 09:00–20:00
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-6">
              Сучасна цифрова стоматологія{" "}
              <span className="bg-gradient-to-r from-[#d8476c] via-[#be185d] to-[#881337] bg-clip-text text-transparent">
                без болю та страху
              </span>{" "}
              в центрі Одеси
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl">
              Власна 3D КЛКТ діагностика, швейцарські протоколи імплантації Straumann, точні мікроскопи та лікування уві сні (седація). Офіційний прайс без прихованих платежів з оплатою у 3 платежі без переплат.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
              <ShimmerButton
                onClick={() => onOpenBooking("Первинна консультація лікаря")}
                className="h-12 px-8 text-base font-bold shadow-lg shadow-pink-500/20"
              >
                Записатися на консультацію
              </ShimmerButton>

              <a
                href="#services"
                className="h-12 px-6 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-sm flex items-center justify-center transition-all hover:-translate-y-0.5"
              >
                Дивитися послуги та ціни
              </a>
            </div>

            {/* Stats Grid with NumberTicker */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-200/80 w-full">
              <div className="p-3 bg-white/70 backdrop-blur-xs rounded-xl border border-slate-200/60 shadow-2xs">
                <div className="text-2xl font-extrabold text-[#d8476c] flex items-center">
                  <NumberTicker value={1500} />
                  <span>+</span>
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5 leading-snug">
                  пацієнтів у 2024 р.
                </div>
              </div>

              <div className="p-3 bg-white/70 backdrop-blur-xs rounded-xl border border-slate-200/60 shadow-2xs">
                <div className="text-2xl font-extrabold text-[#d8476c] flex items-center">
                  <NumberTicker value={4.7} decimalPlaces={1} />
                  <span className="text-amber-500 ml-1">★</span>
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5 leading-snug">
                  рейтинг Google Maps
                </div>
              </div>

              <div className="p-3 bg-white/70 backdrop-blur-xs rounded-xl border border-slate-200/60 shadow-2xs">
                <div className="text-2xl font-extrabold text-[#d8476c] flex items-center">
                  <NumberTicker value={3} />
                  <span className="text-sm font-bold text-slate-700 ml-1">платежі</span>
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5 leading-snug">
                  розстрочка 0% переплат
                </div>
              </div>

              <div className="p-3 bg-white/70 backdrop-blur-xs rounded-xl border border-slate-200/60 shadow-2xs">
                <div className="text-2xl font-extrabold text-[#d8476c] flex items-center">
                  <span className="text-lg">💤</span>
                  <span className="text-lg font-bold text-slate-800 ml-1">Седація</span>
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5 leading-snug">
                  сон без болю та стресу
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual 3D Component with BorderBeam */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-full max-w-md bg-gradient-to-br from-white/95 to-pink-50/80 p-8 sm:p-10 rounded-3xl border border-pink-200/60 shadow-2xl shadow-pink-500/10 flex flex-col items-center justify-center min-h-[380px] overflow-hidden">
              {/* BorderBeam Animated Trail */}
              <BorderBeam size={250} duration={12} delay={0} colorFrom="#d8476c" colorTo="#0284c7" />

              {/* Glowing Orb */}
              <div className="animate-orb-pulse absolute w-60 h-60 rounded-full bg-radial from-[#d8476c]/25 to-transparent blur-xl pointer-events-none" />

              {/* Animated 3D Tooth SVG */}
              <div className="animate-float-tooth relative z-10 filter drop-shadow-[0_20px_25px_rgba(216,71,108,0.25)]">
                <svg
                  className="w-40 sm:w-48 h-auto"
                  viewBox="0 0 200 240"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="reactToothGrad" x1="20" y1="20" x2="180" y2="220" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ffffff" />
                      <stop offset="0.35" stopColor="#fff5f7" />
                      <stop offset="0.75" stopColor="#fce7ec" />
                      <stop offset="1" stopColor="#f5c2cd" />
                    </linearGradient>
                    <linearGradient id="reactShineGrad" x1="50" y1="30" x2="85" y2="120" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ffffff" stopOpacity="0.95" />
                      <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                    </linearGradient>
                    <filter id="reactGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#d8476c" floodOpacity="0.3" />
                    </filter>
                  </defs>
                  <path
                    d="M100 25C135 25 170 38 175 75C178 98 165 125 155 155C148 178 145 208 132 215C122 220 115 200 110 175C108 165 104 150 100 150C96 150 92 165 90 175C85 200 78 220 68 215C55 208 52 178 45 155C35 125 22 98 25 75C30 38 65 25 100 25Z"
                    fill="url(#reactToothGrad)"
                    filter="url(#reactGlow)"
                  />
                  <path
                    d="M50 65C50 48 70 38 100 38C108 38 116 39 124 42C110 40 92 42 78 52C65 62 58 78 55 98C52 82 50 72 50 65Z"
                    fill="url(#reactShineGrad)"
                  />
                  <path d="M145 45L148 53L156 56L148 59L145 67L142 59L134 56L142 53L145 45Z" fill="#d8476c" />
                  <path d="M48 115L50 121L56 123L50 125L48 131L46 125L40 123L46 121L48 115Z" fill="#e85d7f" opacity="0.85" />
                </svg>
              </div>

              {/* Floating Pill Badges */}
              <div className="absolute top-4 left-4 sm:-left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-lg flex items-center gap-2 z-20">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800">Власний 3D КЛКТ</span>
              </div>

              <div className="absolute bottom-6 right-4 sm:-right-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-lg flex items-center gap-2 z-20">
                <Shield className="w-3.5 h-3.5 text-[#d8476c]" />
                <span className="text-xs font-bold text-slate-800">Straumann Swiss Protocol</span>
              </div>

              <div className="hidden sm:flex absolute bottom-2 left-6 bg-pink-50/90 backdrop-blur-md px-3.5 py-1 rounded-full border border-pink-200/80 items-center gap-1.5 z-20">
                <Moon className="w-3 h-3 text-[#d8476c]" />
                <span className="text-xs font-bold text-[#d8476c]">Седація • Без болю</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
