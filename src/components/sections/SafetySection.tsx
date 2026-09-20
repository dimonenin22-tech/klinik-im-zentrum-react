import type { FC } from "react";
import { useState } from "react";
import { ShieldAlert, Sparkles, FileCheck, CheckCircle2, Calculator } from "lucide-react";
import { ShimmerButton } from "../ui/ShimmerButton";

interface SafetySectionProps {
  onOpenBooking: (service?: string) => void;
}

export const SafetySection: FC<SafetySectionProps> = ({ onOpenBooking }) => {
  const [calcAmount, setCalcAmount] = useState<number>(15000);

  const installmentPart = Math.round(calcAmount / 3);

  return (
    <section id="safety" className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Safety Cards */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-50 border border-pink-200 text-xs font-bold text-[#d8476c] mb-3">
            Безпека та гарантії
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Європейські стандарти стерильності
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Повний захист пацієнта. Багаторівнева стерилізація інструментів та офіційна медична ліцензія МОЗ України.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#d8476c] flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Автоклави класу «B»</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Стерилізація в індивідуальних крафт-пакетах за європейським стандартом EN 13060 з хімічним контролем якості.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 text-xs font-bold text-[#d8476c] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> 100% герметичність до прийому
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">АнтиСНІД / АнтиГепатит</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Суворий п'ятиступеневий дезінфекційний регламент. Усі контактні матеріали та насадки — суворо одноразові.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 text-xs font-bold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Повний захист від інфекцій
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-6">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Ліцензія МОЗ України</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Офіційна медична діяльність ТОВ «КЛІНІК ІМ ЦЕНТРУМ» (ЄДРПОУ 38437521). Договір та юридичні гарантії на лікування.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 text-xs font-bold text-sky-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Фіксований план лікування
            </div>
          </div>
        </div>

        {/* Installment Calculator Block */}
        <div id="installment" className="bg-gradient-to-br from-white via-pink-50/40 to-pink-100/30 rounded-3xl p-8 sm:p-12 border border-pink-200/80 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d8476c] text-white text-xs font-bold mb-4">
                <Calculator className="w-3.5 h-3.5" /> Внутрішня розстрочка клініки
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                Оплата лікування у 3 платежі без переплат
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                Ми розуміємо, що ортодонтія чи імплантація — це важливі інвестиції. Тому розбиваємо загальний кошторис на 3 рівні платежі без участі банків, відсотків та прихованих комісій.
              </p>

              {/* Slider Input */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm font-bold text-slate-800">
                  <span>Орієнтовна сума лікування:</span>
                  <span className="text-base text-[#d8476c]">{calcAmount.toLocaleString()} грн</span>
                </div>
                <input
                  type="range"
                  min="6000"
                  max="60000"
                  step="3000"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value))}
                  className="w-full accent-[#d8476c] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>6 000 грн</span>
                  <span>30 000 грн</span>
                  <span>60 000 грн</span>
                </div>
              </div>
            </div>

            {/* Breakdown Result Card */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-pink-200 shadow-md flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Ваш щомісячний внесок:
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#d8476c] mt-2 mb-4">
                  {installmentPart.toLocaleString()} грн <span className="text-xs font-normal text-slate-500">/ місяць</span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>1-й платіж: у день початку лікування</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>2-й платіж: через 30 днів</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>3-й платіж: через 60 днів</span>
                  </div>
                </div>
              </div>

              <ShimmerButton
                onClick={() => onOpenBooking("Оплата у 3 платежі")}
                className="w-full h-11 text-sm font-bold"
              >
                Оформити план лікування
              </ShimmerButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
