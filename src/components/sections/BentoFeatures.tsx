import type { FC } from "react";
import { BentoGrid, BentoCard } from "../ui/BentoGrid";
import { Scan, ShieldCheck, Moon, Microscope, CreditCard } from "lucide-react";

interface BentoFeaturesProps {
  onOpenBooking: (service?: string) => void;
}

export const BentoFeatures: FC<BentoFeaturesProps> = ({ onOpenBooking }) => {
  return (
    <section id="technologies" className="py-20 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-100/70 border border-pink-200 text-xs font-bold text-[#d8476c] mb-3">
            Цифровий стандарт 2026
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Технологічна архітектура клініки
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Повний спектр сучасного обладнання безпосередньо у клініці на Успенській, 17. Не потрібно їздити містом за знімками чи аналізами.
          </p>
        </div>

        <BentoGrid className="lg:grid-rows-2">
          {/* Card 1: 3D КЛКТ Томограф (Span 2) */}
          <BentoCard
            name="Власний томограф 3D КЛКТ"
            className="md:col-span-2 bg-gradient-to-br from-white via-white to-pink-50/40"
            Icon={Scan}
            description="Високоточний комп'ютерний томограф безпосередньо в кабінеті. Знімки 1 та 2 щелеп, суглобів СНЩС та ТРГ за 14 секунд з мінімальним променевим навантаженням."
            cta="Записатися на КЛКТ (від 700 грн)"
            onClick={() => onOpenBooking("3D КЛКТ Діагностика")}
            background={
              <div className="absolute right-4 top-4 w-44 h-44 rounded-full bg-[#d8476c]/5 border border-pink-200/40 flex items-center justify-center opacity-70 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                <div className="w-28 h-28 rounded-full border border-dashed border-[#d8476c]/30 animate-spin-slow" />
              </div>
            }
          />

          {/* Card 2: Straumann Swiss Implants */}
          <BentoCard
            name="Імплантація Straumann"
            className="md:col-span-1 bg-gradient-to-br from-white to-sky-50/40"
            Icon={ShieldCheck}
            description="Швейцарський золотий стандарт приживлюваності 99.4%. Встановлення за надрукованими 3D навігаційними шаблонами."
            cta="Консультація імплантолога"
            onClick={() => onOpenBooking("Дентальна імплантація")}
          />

          {/* Card 3: Седація (сон) */}
          <BentoCard
            name="Лікування уві сні (Седація)"
            className="md:col-span-1 bg-gradient-to-br from-white to-indigo-50/40"
            Icon={Moon}
            description="Повна відсутність стресу та болю. Працюємо з ліцензованою анестезіологічною бригадою для дітей та дорослих."
            cta="Дізнатися про сон"
            onClick={() => onOpenBooking("Лікування уві сні (Седація)")}
          />

          {/* Card 4: Дентальний мікроскоп */}
          <BentoCard
            name="Мікроскопічна ендодонтія"
            className="md:col-span-1 bg-gradient-to-br from-white to-emerald-50/40"
            Icon={Microscope}
            description="Оптичне 20-кратне збільшення для порятунку складних каналів, видалення уламків інструментів та реставрації."
            cta="Врятувати зуб під мікроскопом"
            onClick={() => onOpenBooking("Лікування каналів під мікроскопом")}
          />

          {/* Card 5: Оплата у 3 платежі (Span 1) */}
          <BentoCard
            name="Оплата у 3 платежі 0%"
            className="md:col-span-1 bg-gradient-to-br from-white via-pink-50/30 to-pink-100/40 border-pink-200/80"
            Icon={CreditCard}
            description="Внутрішня чесна розстрочка: ділимо вартість лікування на 3 частини без банків, прихованих комісій та переплат."
            cta="Розрахувати 3 платежі"
            onClick={() => onOpenBooking("Оплата у 3 платежі")}
          />
        </BentoGrid>
      </div>
    </section>
  );
};
