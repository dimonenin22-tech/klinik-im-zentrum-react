import type { FC } from "react";
import { Scan, Cpu, ShieldCheck, Microscope, Smile, CheckCircle2 } from "lucide-react";
import { ShimmerButton } from "../ui/ShimmerButton";

interface PatientJourneySectionProps {
  onOpenBooking: (service?: string) => void;
}

interface JourneyStep {
  number: string;
  title: string;
  desc: string;
  tag: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
}

const STEPS: JourneyStep[] = [
  {
    number: "01",
    title: "3D КЛКТ Сканування",
    desc: "14-секундний комп'ютерний знімок обох щелеп з точністю до 0.1 мм прямо в кабінеті.",
    tag: "Діагностика",
    icon: Scan,
    iconColor: "text-[#d8476c]",
    bgColor: "bg-pink-50 border-pink-100",
  },
  {
    number: "02",
    title: "Цифровий 3D Дизайн",
    desc: "Комп'ютерне планування положення кожного зуба та друк індивідуального шаблону.",
    tag: "CAD/CAM",
    icon: Cpu,
    iconColor: "text-sky-600",
    bgColor: "bg-sky-50 border-sky-100",
  },
  {
    number: "03",
    title: "Швейцарська точність",
    desc: "Установка імпланта Straumann за 20 хвилин без розрізів та болю за 3D шаблоном.",
    tag: "Хірургія",
    icon: ShieldCheck,
    iconColor: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-100",
  },
  {
    number: "04",
    title: "Контроль під мікроскопом",
    desc: "Фіксація коронки чи вініра з оптичним 20-кратним наближенням для ідеального крайового прилягання.",
    tag: "Ортопедія",
    icon: Microscope,
    iconColor: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-100",
  },
  {
    number: "05",
    title: "Довічна гарантія",
    desc: "Здорова, білосніжна та природна усмішка з офіційним міжнародним паспортом лікування.",
    tag: "Результат",
    icon: Smile,
    iconColor: "text-[#d8476c]",
    bgColor: "bg-pink-50 border-pink-100",
  },
];

export const PatientJourneySection: FC<PatientJourneySectionProps> = ({ onOpenBooking }) => {
  return (
    <section id="journey" className="py-20 bg-white relative overflow-hidden">
      {/* Background ambient light */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#d8476c]/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-50 border border-pink-200 text-xs font-bold text-[#d8476c] mb-3">
            <span className="w-2 h-2 rounded-full bg-[#d8476c] animate-pulse" />
            Цифровий протокол 2026
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Шлях пацієнта: від першого дзвінка до сяючої усмішки
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Повний цикл лікування без несподіванок. Кожен крок оцифрований, узгоджений заздалегідь і проходить під контролем провідних лікарів.
          </p>
        </div>

        {/* Steps Grid with Connecting Beams */}
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-1 -translate-y-6 z-0">
            {/* Base track */}
            <div className="w-full h-full bg-slate-100 rounded-full" />
            {/* Animated Laser Beam */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d8476c] to-transparent rounded-full opacity-75 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
            {STEPS.map((step, idx) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Header with step number and badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-extrabold text-slate-400 group-hover:text-[#d8476c] transition-colors">
                        КРОК {step.number}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {step.tag}
                      </span>
                    </div>

                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-2xl ${step.bgColor} border flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 shadow-2xs`}
                    >
                      <IconComponent className={`w-6 h-6 ${step.iconColor}`} />
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-base font-bold text-slate-900 leading-snug mb-2 group-hover:text-[#d8476c] transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  {/* Bottom indicator */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Прозорий етап</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Strip */}
        <div className="mt-14 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-2 sm:p-2.5 rounded-2xl sm:rounded-full bg-slate-50 border border-slate-200">
            <span className="text-xs sm:text-sm font-semibold text-slate-700 px-4">
              Готові розпочати свій шлях до здорової усмішки?
            </span>
            <ShimmerButton
              onClick={() => onOpenBooking("Шлях пацієнта: 3D консультація")}
              className="h-10 px-6 text-xs font-bold w-full sm:w-auto"
            >
              Записатися на крок 01 (300 грн)
            </ShimmerButton>
          </div>
        </div>
      </div>
    </section>
  );
};
