import type { FC, ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Gift,
  UserCheck,
} from "lucide-react";
import { ShimmerButton } from "../ui/ShimmerButton";
import { DOCTORS } from "../../data/clinicData";
import { sendTelegramLead } from "../../lib/telegram";
import { saveCrmLead } from "../../lib/crmStorage";

interface SmileQuizProps {
  onOpenBooking: (service?: string, doctor?: string) => void;
}

interface QuizOption {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  iconText: string;
  suggestedService: string;
  suggestedDoctorId: string;
  priceRange: string;
}

const GOALS: QuizOption[] = [
  {
    id: "implant",
    title: "Відсутній один або декілька зубів",
    subtitle: "Відновлення зубного ряду за 1–3 візити без обточування сусідніх зубів",
    badge: "Імплантація",
    iconText: "🦷",
    suggestedService: "Імплантація Straumann / NeoDent",
    suggestedDoctorId: "gnatenko",
    priceRange: "від 16 000 грн (або від 5 330 грн/міс у 3 платежі)",
  },
  {
    id: "pain",
    title: "Гострий біль або лікування карієсу",
    subtitle: "Швидке знеболення, порятунок складних каналів під мікроскопом",
    badge: "Терапія та Ендодонтія",
    iconText: "⚡",
    suggestedService: "Лікування під мікроскопом / Пломбування",
    suggestedDoctorId: "sribnyak",
    priceRange: "від 1 500 до 4 500 грн",
  },
  {
    id: "aesthetic",
    title: "Ідеальна білосніжна усмішка",
    subtitle: "Апаратне відбілювання Beyond або керамічні вініри E-max преміум-класу",
    badge: "Естетика",
    iconText: "✨",
    suggestedService: "Керамічні вініри E-max / Відбілювання",
    suggestedDoctorId: "kostenko",
    priceRange: "від 4 500 грн (відбілювання) до 14 000 грн (вінір)",
  },
  {
    id: "braces",
    title: "Вирівнювання зубів та прикус",
    subtitle: "Сучасні брекет-системи Damon або прозорі елайнери для дорослих та підлітків",
    badge: "Ортодонтія",
    iconText: "📐",
    suggestedService: "Брекет-системи Damon / Консультація ортодонта",
    suggestedDoctorId: "sheremet",
    priceRange: "від 18 000 грн (розстрочка на 3 платежі без банку)",
  },
  {
    id: "hygiene",
    title: "Профілактична чистка та 3D огляд",
    subtitle: "Швейцарський протокол EMS Air Flow, зняття каменю та полірування",
    badge: "Гігієна",
    iconText: "🛡️",
    suggestedService: "Професійна гігієна EMS Air Flow",
    suggestedDoctorId: "purlo",
    priceRange: "1 800 грн за повний комплекс",
  },
];

const TIMELINES = [
  {
    id: "urgent",
    title: "Терміново (сьогодні або найближчі 24–48 годин)",
    desc: "Пріоритетний запис у графіку чергового лікаря",
  },
  {
    id: "week",
    title: "Протягом 1–2 тижнів",
    desc: "Підбір найзручнішого дня та часу (ранок / вечір / субота)",
  },
  {
    id: "month",
    title: "Планую спокійно, хочу спочатку розрахувати бюджет",
    desc: "Детальний попередній кошторис та консультація",
  },
];

const PAYMENT_PREFERENCES = [
  {
    id: "installments",
    title: "Цікавить оплата у 3 платежі (0% переплат)",
    desc: "Внутрішня розстрочка клініки без участі банків",
  },
  {
    id: "full",
    title: "Оплата повністю за фактом виконаних робіт",
    desc: "Готівка або банківська картка",
  },
];

export const SmileQuizSection: FC<SmileQuizProps> = ({ onOpenBooking }) => {
  const [step, setStep] = useState<number>(1);
  const [selectedGoal, setSelectedGoal] = useState<QuizOption>(GOALS[0]);
  const [selectedTimeline, setSelectedTimeline] = useState<string>(TIMELINES[0].id);
  const [selectedPayment, setSelectedPayment] = useState<string>(PAYMENT_PREFERENCES[0].id);

  // Quick form state for result screen
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("+380 ");
  const [isSent, setIsSent] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    let digits = raw;
    if (digits.startsWith("380")) digits = digits.slice(3);
    else if (digits.startsWith("0")) digits = digits.slice(1);
    digits = digits.slice(0, 9);

    let formatted = "+380";
    if (digits.length > 0) formatted += " (" + digits.slice(0, 2);
    if (digits.length >= 2) formatted += ") " + digits.slice(2, 5);
    if (digits.length >= 5) formatted += "-" + digits.slice(5, 7);
    if (digits.length >= 7) formatted += "-" + digits.slice(7, 9);
    setPatientPhone(formatted);
    setPhoneError("");
  };

  const handleQuickSubmit = (e: FormEvent) => {
    e.preventDefault();
    const digits = patientPhone.replace(/\D/g, "");
    if (digits.length < 12) {
      setPhoneError("Введіть коректний номер (+380 XX XXX-XX-XX)");
      return;
    }

    const timelineText = TIMELINES.find((t) => t.id === selectedTimeline)?.title || selectedTimeline;
    const paymentText = PAYMENT_PREFERENCES.find((p) => p.id === selectedPayment)?.title || selectedPayment;

    const leadPayload = {
      name: patientName.trim() || "Пацієнт (з квізу)",
      phone: patientPhone.trim(),
      service: selectedGoal.suggestedService || selectedGoal.title,
      doctor: doctorMatch.name,
      notes: `Терміни: ${timelineText}. Оплата: ${paymentText}. Закріплено бонус: 3D КТ за 300 грн.`,
      source: `Смайл-квіз (Бюджет: ${selectedGoal.priceRange})`,
    };

    // Save to CRM archive & auto-dispatch to Google Sheets
    const savedLead = saveCrmLead(leadPayload);

    // Dispatch to Telegram
    sendTelegramLead(savedLead);

    setIsSent(true);
  };

  const handleReset = () => {
    setStep(1);
    setSelectedGoal(GOALS[0]);
    setIsSent(false);
    setPatientName("");
    setPatientPhone("+380 ");
  };

  const doctorMatch =
    DOCTORS.find((d) => d.id === selectedGoal.suggestedDoctorId) || DOCTORS[0];

  return (
    <section id="quiz" className="py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute top-1/2 -left-32 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 -right-32 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-50 border border-pink-200 text-xs font-bold text-[#d8476c] mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Смарт-діагностика за 45 секунд
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Розрахуйте орієнтовний план лікування
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Дайте відповіді на 3 прості запитання, щоб отримати попередній кошторис, закріпити профільного лікаря та зафіксувати знижку на 3D комп'ютерну томограму.
          </p>
        </div>

        {/* Quiz Container Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-6 sm:p-10 relative overflow-hidden">
          {/* Progress Bar (visible on steps 1-3) */}
          {step <= 3 && (
            <div className="mb-8">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                <span>
                  Крок {step} з 3:{" "}
                  {step === 1 && "Що саме вас турбує?"}
                  {step === 2 && "Бажані терміни лікування"}
                  {step === 3 && "Зручний спосіб оплати"}
                </span>
                <span className="text-[#d8476c]">{Math.round((step / 3) * 100)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#d8476c] to-[#be185d] transition-all duration-300 rounded-full"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* STEP 1: Select Main Goal */}
          {step === 1 && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-4">
                Оберіть основне завдання, яке потрібно вирішити:
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {GOALS.map((g) => {
                  const isSelected = selectedGoal.id === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelectedGoal(g)}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                        isSelected
                          ? "bg-pink-50/50 border-[#d8476c] shadow-sm shadow-pink-500/10 ring-2 ring-[#d8476c]/20"
                          : "bg-white hover:bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <span className="text-2xl sm:text-3xl shrink-0 select-none">
                          {g.iconText}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                              {g.title}
                            </span>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {g.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {g.subtitle}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-1 transition-colors ${
                          isSelected
                            ? "bg-[#d8476c] border-[#d8476c] text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="h-11 px-7 rounded-xl bg-[#d8476c] hover:bg-[#be185d] text-white font-bold text-sm flex items-center gap-2 transition-all shadow-md shadow-pink-600/20 cursor-pointer"
                >
                  Далі <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Timeline */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-4">
                Коли вам зручно розпочати консультацію чи лікування?
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {TIMELINES.map((t) => {
                  const isSelected = selectedTimeline === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTimeline(t.id)}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                        isSelected
                          ? "bg-pink-50/50 border-[#d8476c] shadow-sm shadow-pink-500/10 ring-2 ring-[#d8476c]/20"
                          : "bg-white hover:bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
                          {t.title}
                        </h4>
                        <p className="text-xs text-slate-500">{t.desc}</p>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-[#d8476c] border-[#d8476c] text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-11 px-5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Назад
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="h-11 px-7 rounded-xl bg-[#d8476c] hover:bg-[#be185d] text-white font-bold text-sm flex items-center gap-2 transition-all shadow-md shadow-pink-600/20 cursor-pointer"
                >
                  Далі <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Format */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-4">
                Якому формату фінансового розрахунку ви віддаєте перевагу?
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {PAYMENT_PREFERENCES.map((p) => {
                  const isSelected = selectedPayment === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPayment(p.id)}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                        isSelected
                          ? "bg-pink-50/50 border-[#d8476c] shadow-sm shadow-pink-500/10 ring-2 ring-[#d8476c]/20"
                          : "bg-white hover:bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
                          {p.title}
                        </h4>
                        <p className="text-xs text-slate-500">{p.desc}</p>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-[#d8476c] border-[#d8476c] text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="h-11 px-5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Назад
                </button>

                <ShimmerButton
                  onClick={() => setStep(4)}
                  className="h-11 px-8 text-sm font-bold shadow-lg"
                >
                  Отримати персональний розрахунок →
                </ShimmerButton>
              </div>
            </div>
          )}

          {/* STEP 4: Personal Result Screen */}
          {step === 4 && (
            <div className="animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6 flex-wrap gap-3">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Попередній клінічний розрахунок сформовано!</span>
                </div>

                <button
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Пройти знову
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                {/* Result Breakdown (Col 7) */}
                <div className="md:col-span-7 bg-slate-50/80 rounded-2xl p-5 sm:p-6 border border-slate-200/80 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <span className="text-[11px] font-bold text-[#d8476c] uppercase tracking-wider">
                        Рекомендований план:
                      </span>
                      <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                        {selectedGoal.suggestedService}
                      </h4>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Орієнтовний бюджет:</span>
                        <strong className="text-slate-900">{selectedGoal.priceRange}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Формат оплати:</span>
                        <strong className="text-[#d8476c]">
                          {selectedPayment === "installments"
                            ? "3 платежі (0% переплат)"
                            : "За фактом робіт"}
                        </strong>
                      </div>
                    </div>

                    {/* Matched Doctor Card */}
                    <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white border border-slate-200/70">
                      <img
                        src={doctorMatch.image}
                        alt={doctorMatch.name}
                        className="w-12 h-12 rounded-xl object-cover object-top border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-[#d8476c]" />
                          <span className="text-xs font-bold text-slate-900">{doctorMatch.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{doctorMatch.role}</p>
                      </div>
                    </div>

                    {/* Bonus Voucher Badge */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-pink-500/10 to-amber-500/10 border border-pink-300/60 flex items-center gap-3 text-xs text-slate-800">
                      <Gift className="w-5 h-5 text-[#d8476c] shrink-0" />
                      <div>
                        <strong>За вами закріплено бонус:</strong> Комплексний первинний огляд лікаря + консиліум 3D КТ усього за <strong className="text-[#d8476c]">300 грн</strong>.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Action / Lead Capture (Col 5) */}
                <div className="md:col-span-5 bg-gradient-to-br from-[#d8476c]/5 via-white to-pink-50/40 rounded-2xl p-5 sm:p-6 border border-pink-200 flex flex-col justify-between">
                  {isSent ? (
                    <div className="text-center py-6 animate-in zoom-in-95 duration-200 my-auto">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h5 className="text-base font-bold text-slate-900 mb-1">
                        Дякуємо, {patientName || "пацієнте"}!
                      </h5>
                      <p className="text-xs text-slate-600 mb-4">
                        Ваш розрахунок зафіксовано. Адміністратор зв'яжеться з вами протягом 10 хв.
                      </p>
                      <button
                        onClick={handleReset}
                        className="text-xs font-bold text-[#d8476c] hover:underline"
                      >
                        Закрити квіз
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleQuickSubmit} className="space-y-3 my-auto">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                          Зафіксувати розрахунок та бонус
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Залиште телефон — адміністратор зателефонує для узгодження зручного часу.
                        </p>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          placeholder="Ваше ім'я"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#d8476c]/40"
                        />
                      </div>

                      <div>
                        <input
                          type="tel"
                          value={patientPhone}
                          onChange={handlePhoneChange}
                          placeholder="+380 (XX) XXX-XX-XX"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#d8476c]/40"
                        />
                        {phoneError && (
                          <p className="text-[11px] text-red-500 mt-1">{phoneError}</p>
                        )}
                      </div>

                      <ShimmerButton type="submit" className="w-full py-2.5 text-xs font-bold shadow-md">
                        Підтвердити консультацію (300 грн)
                      </ShimmerButton>

                      <div className="pt-2 text-center">
                        <span className="text-[10px] text-slate-400">або запишіться через</span>
                        <div className="flex items-center justify-center gap-2 mt-1.5">
                          <a
                            href="https://t.me/+380634670867"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
                          >
                            Telegram
                          </a>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={() => onOpenBooking(selectedGoal.suggestedService, doctorMatch.name)}
                            className="text-xs font-bold text-[#d8476c] hover:underline"
                          >
                            Повна форма
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
