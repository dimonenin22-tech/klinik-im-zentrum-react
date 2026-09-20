import type { FC, ChangeEvent, FormEvent } from "react";
import { useState, useEffect } from "react";
import { X, CheckCircle2, Phone, User, Calendar, Shield } from "lucide-react";
import { DOCTORS, SERVICE_CATEGORIES } from "../../data/clinicData";
import { ShimmerButton } from "../ui/ShimmerButton";
import { sendTelegramLead } from "../../lib/telegram";
import { sendLeadToGoogleSheets } from "../../lib/googleSheets";
import { saveCrmLead } from "../../lib/crmStorage";
import { getDoctorLiveBadge } from "../../lib/scheduleStorage";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
  initialDoctor?: string;
}

export const AppointmentModal: FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  initialService = "",
  initialDoctor = "",
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+380 ");
  const [selectedService, setSelectedService] = useState(initialService);
  const [selectedDoctor, setSelectedDoctor] = useState(initialDoctor);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  useEffect(() => {
    if (initialService) setSelectedService(initialService);
    if (initialDoctor) setSelectedDoctor(initialDoctor);
  }, [initialService, initialDoctor]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setIsSuccess(false);
      setErrors({});
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Phone input mask for Ukraine (+380 (XX) XXX-XX-XX)
  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    let digits = input.replace(/\D/g, "");

    if (digits.startsWith("380")) digits = digits.slice(3);
    else if (digits.startsWith("80")) digits = digits.slice(2);
    else if (digits.startsWith("0")) digits = digits.slice(1);
    digits = digits.slice(0, 9); // 9 digits after +380

    let formatted = "+380";
    if (digits.length > 0) formatted += " (" + digits.slice(0, 2);
    if (digits.length >= 2) formatted += ") " + digits.slice(2, 5);
    if (digits.length >= 5) formatted += "-" + digits.slice(5, 7);
    if (digits.length >= 7) formatted += "-" + digits.slice(7, 9);

    setPhone(formatted);
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; phone?: string } = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = "Будь ласка, вкажіть ваше ім'я (мінімум 2 символи)";
    }

    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 12) {
      newErrors.phone = "Введіть коректний номер телефону (+380 XX XXX-XX-XX)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const doctorObj = DOCTORS.find((d) => d.id === selectedDoctor);
      const doctorName = doctorObj ? `${doctorObj.name} (${doctorObj.role})` : selectedDoctor;

      const leadPayload = {
        name: name.trim(),
        phone: phone.trim(),
        service: selectedService,
        doctor: doctorName,
        notes: comment.trim(),
        source: "Модальне вікно запису",
      };

      // 1. Зберегти в локальну CRM
      const savedLead = saveCrmLead(leadPayload);

      // 2. Гарантовано надіслати в Google Таблицю та в Telegram-бот
      await Promise.allSettled([
        sendLeadToGoogleSheets(savedLead),
        sendTelegramLead(savedLead),
      ]);
    } finally {
      setIsSubmitting(false);
      setIsSuccess(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
        {/* Header gradient banner */}
        <div className="bg-gradient-to-r from-[#d8476c] via-[#be185d] to-[#881337] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 id="modal-title" className="text-lg font-bold leading-tight">
                Запис на прийом
              </h3>
              <p className="text-xs text-pink-100">м. Одеса, вул. Успенська, 17</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Закрити вікно"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 sm:p-8">
          {isSuccess ? (
            <div className="text-center py-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-5 shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-extrabold text-slate-900 mb-2">
                Заявку прийнято!
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed max-w-sm mx-auto mb-6">
                Дякуємо, <strong className="text-slate-900">{name}</strong>! Адміністратор Klinik Im Zentrum зателефонує вам на номер{" "}
                <strong className="text-slate-900">{phone}</strong> протягом 10 хвилин для підтвердження зручного часу візиту.
              </p>

              <div className="p-4 rounded-2xl bg-pink-50/60 border border-pink-100 text-left text-xs space-y-2 mb-6 text-slate-700">
                {selectedService && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Послуга:</span>
                    <span className="font-semibold text-slate-900">{selectedService}</span>
                  </div>
                )}
                {selectedDoctor && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Лікар:</span>
                    <span className="font-semibold text-slate-900">
                      {DOCTORS.find((d) => d.id === selectedDoctor)?.name || selectedDoctor}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Адреса:</span>
                  <span className="font-semibold text-slate-900">м. Одеса, вул. Успенська, 17</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="tel:+380634670867"
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-800 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#d8476c]" />
                  Зателефонувати зараз
                </a>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#d8476c] text-white text-sm font-bold hover:bg-[#be185d] transition-colors shadow-md"
                >
                  Зрозуміло
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ваше ім'я <span className="text-[#d8476c]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder="Олена Коваленко"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d8476c]/40 transition-colors ${
                      errors.name ? "border-red-400 bg-red-50/30" : "border-slate-200 bg-white"
                    }`}
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Номер телефону <span className="text-[#d8476c]">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="+380 (63) 000-00-00"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#d8476c]/40 transition-colors ${
                      errors.phone ? "border-red-400 bg-red-50/30" : "border-slate-200 bg-white"
                    }`}
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Оберіть послугу (опціонально)
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#d8476c]/40 transition-colors"
                >
                  <option value="">Первинна консультація + 3D огляд</option>
                  {SERVICE_CATEGORIES.map((cat) => (
                    <optgroup key={cat.id} label={cat.title}>
                      {cat.items.map((item, idx) => (
                        <option key={idx} value={item.name}>
                          {item.name} ({item.price})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Doctor Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Бажаний лікар (опціонально)
                </label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#d8476c]/40 transition-colors"
                >
                  <option value="">Черговий фахівець / Первинний огляд</option>
                  {DOCTORS.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} — {doc.role}
                    </option>
                  ))}
                </select>
                {(() => {
                  const matchedDoc = DOCTORS.find((d) => d.id === selectedDoctor || d.name === selectedDoctor);
                  if (!matchedDoc) return null;
                  const liveBadge = getDoctorLiveBadge(matchedDoc.id);
                  return (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-xs font-semibold text-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Найближчий прийом: {liveBadge}
                    </div>
                  );
                })()}
              </div>

              {/* Comment / Time preferences */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Коментар або зручний час
                </label>
                <textarea
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Наприклад: зручно у четвер після 16:00, турбує зуб мудрості..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#d8476c]/40 transition-colors resize-none"
                />
              </div>

              {/* Privacy badge */}
              <div className="flex items-start gap-2 pt-1 pb-1">
                <Shield className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-500 leading-tight">
                  Ваші контактні дані захищені лікарською таємницею та не передаються третім особам.
                </p>
              </div>

              {/* Submit button */}
              <ShimmerButton
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 text-base font-bold shadow-lg"
              >
                {isSubmitting ? "Надсилаємо заявку..." : "Підтвердити запис на прийом"}
              </ShimmerButton>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
