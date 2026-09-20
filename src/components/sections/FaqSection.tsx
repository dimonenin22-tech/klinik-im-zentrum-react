import type { FC } from "react";
import { useState } from "react";
import { ChevronDown, HelpCircle, Phone } from "lucide-react";
import { ShimmerButton } from "../ui/ShimmerButton";

interface FaqSectionProps {
  onOpenBooking: (service?: string) => void;
}

interface FaqItem {
  question: string;
  answer: string;
  badge: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    badge: "Знеболення",
    question: "Чи боляче встановлювати дентальний імплант або видаляти зуби?",
    answer:
      "Абсолютно ні. Ми використовуємо сучасну комп'ютерну анестезію зі швейцарськими препаратами ультракаїнового ряду, яка миттєво та на 100% блокує больові імпульси. Для пацієнтів із дентофобією (страхом стоматолога) ми проводимо лікування у медикаментозному сні (седації) під безперервним моніторингом ліцензованого анестезіолога: ви засинаєте, а прокидаєтеся вже з готовим результатом.",
  },
  {
    badge: "Гарантії",
    question: "Що якщо зубний імплант не приживеться?",
    answer:
      "Наша статистика приживлюваності за швейцарським протоколом Straumann та NeoDent становить 99.4%. Виробник надає офіційну міжнародну довічну гарантію на імплантати. Якщо у винятковому випадку виникне відторгнення, клініка безкоштовно повторить установку за умовами офіційного договору.",
  },
  {
    badge: "Оплата",
    question: "Як працює оплата у 3 платежі і чи потрібні довідки з банку?",
    answer:
      "Це власна внутрішня розстрочка клініки без жодних банків, перевірок кредитної історії чи довідок про доходи. Загальний узгоджений кошторис розбивається на 3 рівні частини: 1-й платіж вноситься у день старту процедури, 2-й — рівно через місяць, 3-й — через два місяці. Переплата становить рівно 0%.",
  },
  {
    badge: "Діагностика",
    question: "Що входить у первинну консультацію лікаря за 300 грн?",
    answer:
      "Повноцінний клінічний огляд двома фахівцями, фотопротокол усмішки з виведенням на екран, детальний консиліум за результатами вашого 3D КТ-знімка та складання прозорого кошторису лікування з кількома варіантами бюджету без нав'язування зайвих послуг.",
  },
  {
    badge: "Ліцензія",
    question: "Чи є у вас офіційна ліцензія МОЗ України?",
    answer:
      "Так, медична практика ведеться юридичною особою ТОВ «КЛІНІК ІМ ЦЕНТРУМ» (код ЄДРПОУ 38437521) за безстроковою ліцензією МОЗ України. Інструменти проходять 5-ступеневу стерилізацію в автоклавах класу B з індивідуальними крафт-пакетами, які розкриваються виключно у вашій присутності.",
  },
  {
    badge: "Мікроскоп",
    question: "Скільки візитів потрібно для лікування каналів під мікроскопом?",
    answer:
      "Завдяки 20-кратному оптичному наближенню та цифровому контролю довжини каналів у 85% клінічних випадків лікування кореневих каналів та герметизація завершуються всього за 1 візит тривалістю 60–90 хвилин.",
  },
];

export const FaqSection: FC<FaqSectionProps> = ({ onOpenBooking }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="py-20 bg-slate-50 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-50 border border-pink-200 text-xs font-bold text-[#d8476c] mb-3">
            <HelpCircle className="w-3.5 h-3.5" /> Відповіді експертів
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Поширені запитання пацієнтів
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Чесно та прозоро про процес лікування, гарантії безпеки та фінансові умови клініки в центрі Одеси.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-white border-[#d8476c]/40 shadow-md shadow-pink-900/5"
                    : "bg-white/80 hover:bg-white border-slate-200/80 shadow-xs"
                }`}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  aria-expanded={isOpen}
                  className="w-full text-left px-5 sm:px-7 py-5 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-colors shrink-0 ${
                        isOpen
                          ? "bg-pink-100 text-[#d8476c]"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.badge}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {item.question}
                    </span>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 shrink-0 ${
                      isOpen
                        ? "bg-pink-50 text-[#d8476c] rotate-180"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-7 pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in-50 duration-200">
                    <p className="pt-2">{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions Card */}
        <div className="mt-12 bg-gradient-to-r from-white via-pink-50/30 to-white rounded-3xl p-6 sm:p-8 border border-pink-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
              Залишилися індивідуальні запитання?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Задайте їх черговому лікарю особисто або запишіться на консультацію.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:+380634670867"
              className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#d8476c]" />
              Подзвонити
            </a>
            <ShimmerButton
              onClick={() => onOpenBooking("Запитання щодо лікування")}
              className="h-10 px-5 text-xs font-bold"
            >
              Задати запитання
            </ShimmerButton>
          </div>
        </div>
      </div>
    </section>
  );
};
