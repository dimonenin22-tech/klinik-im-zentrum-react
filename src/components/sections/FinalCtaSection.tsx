import type { FC } from "react";
import { Phone, MapPin, Clock, CreditCard } from "lucide-react";
import { ShimmerButton } from "../ui/ShimmerButton";

interface FinalCtaSectionProps {
  onOpenBooking: (service?: string) => void;
}

export const FinalCtaSection: FC<FinalCtaSectionProps> = ({ onOpenBooking }) => {
  return (
    <section id="consultation" className="py-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#d8476c]/20 rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pink-500/20 border border-pink-400/40 text-xs font-bold text-pink-300 mb-6">
          Простий перший крок
        </span>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
          Зробіть крок до здорової та сяючої усмішки вже сьогодні
        </h2>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
          Запишіться на первинну консультацію та 3D комп'ютерний огляд у центрі Одеси. Лікар відповість на всі запитання та складе персональний кошторис із можливістю розстрочки на 3 платежі.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 max-w-md mx-auto mb-12">
          <ShimmerButton
            onClick={() => onOpenBooking("Первинна консультація лікаря")}
            className="h-12 px-8 text-base font-bold shadow-xl shadow-pink-600/30"
          >
            Записатися на прийом (300 грн)
          </ShimmerButton>

          <a
            href="tel:+380634670867"
            className="h-12 px-6 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 flex items-center justify-center gap-2 transition-all"
          >
            <Phone className="w-4 h-4 text-pink-400" />
            +38 063 467 08 67
          </a>
        </div>

        {/* Contact Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-slate-800 text-xs text-slate-300">
          <div className="flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4 text-[#d8476c]" />
            <span>м. Одеса, вул. Успенська, 17</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-[#d8476c]" />
            <span>Пн–Сб 09:00–20:00</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <CreditCard className="w-4 h-4 text-[#d8476c]" />
            <span>3 платежі • 0% переплат</span>
          </div>
        </div>
      </div>
    </section>
  );
};
