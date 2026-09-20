import type { FC, ElementType } from "react";
import { useState } from "react";
import { SERVICE_CATEGORIES } from "../../data/clinicData";
import { Scan, Sparkles, Activity, Smile, ShieldCheck, Check } from "lucide-react";
import { ShimmerButton } from "../ui/ShimmerButton";

interface ServicesSectionProps {
  onOpenBooking: (service?: string) => void;
}

const ICONS_MAP: Record<string, ElementType> = {
  Scan,
  Sparkles,
  Activity,
  Smile,
  ShieldCheck,
};

export const ServicesSection: FC<ServicesSectionProps> = ({ onOpenBooking }) => {
  const [activeTab, setActiveTab] = useState(SERVICE_CATEGORIES[0].id);

  const currentCategory = SERVICE_CATEGORIES.find((c) => c.id === activeTab) || SERVICE_CATEGORIES[0];
  const IconComponent = ICONS_MAP[currentCategory.icon] || Sparkles;

  return (
    <section id="services" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-50 border border-pink-200 text-xs font-bold text-[#d8476c] mb-3">
            Офіційний прайс 2026
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Послуги та чесні ціни без доплат
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Попередній прорахунок вартості до початку лікування. Можливість оплати у 3 рівні частини без комісій.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 mb-10 gap-2 scrollbar-none">
          {SERVICE_CATEGORIES.map((cat) => {
            const TabIcon = ICONS_MAP[cat.icon] || Sparkles;
            const isActive = cat.id === activeTab;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-[#d8476c] text-white shadow-md shadow-pink-500/25 scale-105"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>

        {/* Category Description & Price Table */}
        <div className="bg-slate-50/80 rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-pink-100/80 text-[#d8476c] flex items-center justify-center">
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{currentCategory.title}</h3>
                <p className="text-sm text-slate-500">{currentCategory.description}</p>
              </div>
            </div>

            <ShimmerButton
              onClick={() => onOpenBooking(currentCategory.title)}
              className="h-10 px-5 text-sm font-bold self-start sm:self-auto"
            >
              Записатися за прайсом
            </ShimmerButton>
          </div>

          {/* Grid of Price Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentCategory.items.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-2xs hover:border-pink-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <span className="text-base font-bold text-slate-800 leading-snug">
                    {item.name}
                  </span>
                  <span className="text-lg font-extrabold text-[#d8476c] whitespace-nowrap">
                    {item.price}
                  </span>
                </div>
                {item.note && (
                  <p className="text-xs text-slate-500 mb-3">{item.note}</p>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Фіксована ціна
                  </span>
                  <button
                    onClick={() => onOpenBooking(item.name)}
                    className="text-xs font-bold text-[#d8476c] hover:text-[#c03558] hover:underline"
                  >
                    Обрати для запису →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
