import type { FC } from "react";
import { Marquee } from "../ui/Marquee";
import { ShieldCheck } from "lucide-react";

export const PARTNERS = [
  { name: "Straumann®", country: "Швейцарія 🇨🇭", specialty: "№1 Дентальні імпланти" },
  { name: "Carl Zeiss®", country: "Німеччина 🇩🇪", specialty: "Дентальні мікроскопи" },
  { name: "EMS Dental®", country: "Швейцарія 🇨🇭", specialty: "Оригінальний Air-Flow" },
  { name: "Dentsply Sirona®", country: "США 🇺🇸", specialty: "3D КЛКТ томографія" },
  { name: "KaVo Kerr®", country: "Німеччина 🇩🇪", specialty: "Хірургічні установки" },
  { name: "Beyond Polus®", country: "США 🇺🇸", specialty: "Апаратне відбілювання" },
  { name: "Ivoclar E-max®", country: "Ліхтенштейн 🇱🇮", specialty: "Керамічні вініри" },
  { name: "3M ESPE®", country: "США 🇺🇸", specialty: "Нанокомпозити емалі" },
];

export const PartnersMarquee: FC = () => {
  return (
    <section className="py-7 bg-slate-900 border-y border-slate-800 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <ShieldCheck className="w-4 h-4 text-[#d8476c]" />
          <span>Оригінальне сертифіковане обладнання та матеріали світових лідерів</span>
        </div>
        <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2.5 py-0.5 rounded-full">
          100% Оригінал
        </span>
      </div>

      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
        <Marquee pauseOnHover className="[--duration:30s]">
          {PARTNERS.map((p, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-pink-500/50 hover:bg-slate-800 transition-all shrink-0 cursor-default"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-white tracking-tight">{p.name}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{p.country}</span>
                </div>
                <span className="text-[11px] text-pink-300 font-medium block">{p.specialty}</span>
              </div>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
};
