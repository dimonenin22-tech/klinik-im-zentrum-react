import type { FC, FormEvent } from "react";
import { useState, useEffect, useMemo } from "react";
import {
  Lock,
  Key,
  Clock,
  Calendar,
  X,
  RefreshCw,
  ExternalLink,
  Settings,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  ArrowLeft,
  Sparkles,
  LogOut,
  UserCheck,
  Ban,
} from "lucide-react";
import { DOCTORS } from "../../data/clinicData";
import {
  verifyAdminPin,
  changeAdminPin,
  getDoctorSchedules,
  saveDoctorSchedule,
  bookDoctorSlot,
  cancelDoctorSlot,
  getDoctorAvailableSlots,
  getDoctorLiveBadge,
  formatDateToYMD,
  ALLOWED_SLOT_DURATIONS,
  type DoctorSchedule,
  type BookedSlot,
} from "../../lib/scheduleStorage";

interface ScheduleAdminPanelProps {
  onBackToSite?: () => void;
  onOpenCrm?: () => void;
}

const GOOGLE_SHEET_VIEW_URL_KEY = "kiz_google_sheet_view_url";
const DEFAULT_SHEETS_VIEW_URL = "https://docs.google.com/spreadsheets/u/0/";

export const ScheduleAdminPanel: FC<ScheduleAdminPanelProps> = ({
  onBackToSite,
  onOpenCrm,
}) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState("");

  // Change PIN modal state
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState("");
  const [newPinInput, setNewPinInput] = useState("");
  const [confirmPinInput, setConfirmPinInput] = useState("");
  const [changePinMessage, setChangePinMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  // Selected doctor state
  const [selectedDoctorId, setSelectedDoctorId] = useState(DOCTORS[0].id);
  const [schedules, setSchedules] = useState<Record<string, DoctorSchedule>>({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Active day for slots inspection (0 = today, 1 = tomorrow, ..., 6)
  const [activeDayOffset, setActiveDayOffset] = useState(0);

  // Manual block slot modal state
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [slotToBlock, setSlotToBlock] = useState<{ time: string; dateStr: string } | null>(
    null
  );
  const [blockReason, setBlockReason] = useState("Перерва / Зайнято");
  const [blockDuration, setBlockDuration] = useState(60);

  // Google Sheet Link state
  const [sheetUrl, setSheetUrl] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem(GOOGLE_SHEET_VIEW_URL_KEY) || DEFAULT_SHEETS_VIEW_URL
      );
    }
    return DEFAULT_SHEETS_VIEW_URL;
  });
  const [isEditingSheetUrl, setIsEditingSheetUrl] = useState(false);
  const [newSheetUrlInput, setNewSheetUrlInput] = useState("");

  // Toast / feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Reload schedules
  useEffect(() => {
    setSchedules(getDoctorSchedules());
  }, [refreshTrigger]);

  const currentSchedule: DoctorSchedule = useMemo(() => {
    const defaultItem: DoctorSchedule = {
      doctorId: selectedDoctorId,
      workingDays: [1, 2, 3, 4, 5],
      startTime: "09:00",
      endTime: "18:00",
      slotDurationMinutes: 60,
      isAutoBadge: true,
    };
    return schedules[selectedDoctorId] || defaultItem;
  }, [schedules, selectedDoctorId]);

  // Selected doctor object
  const currentDoctor = useMemo(() => {
    return DOCTORS.find((d) => d.id === selectedDoctorId) || DOCTORS[0];
  }, [selectedDoctorId]);

  // PIN login submit
  const handlePinSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (verifyAdminPin(enteredPin)) {
      setIsAuthenticated(true);
      setPinError("");
      setEnteredPin("");
    } else {
      setPinError("Невірний PIN-код. Спробуйте ще раз.");
    }
  };

  // Change PIN submit
  const handleChangePinSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newPinInput !== confirmPinInput) {
      setChangePinMessage({ text: "Нові паролі не співпадають", isError: true });
      return;
    }
    const res = changeAdminPin(currentPinInput, newPinInput);
    if (res.success) {
      setChangePinMessage({ text: res.message, isError: false });
      setTimeout(() => {
        setIsChangePinOpen(false);
        setCurrentPinInput("");
        setNewPinInput("");
        setConfirmPinInput("");
        setChangePinMessage(null);
        showToast("PIN-код успішно оновлено!");
      }, 1200);
    } else {
      setChangePinMessage({ text: res.message, isError: true });
    }
  };

  // Toggle Working Day
  const handleToggleDay = (dayNum: number) => {
    const days = currentSchedule.workingDays || [];
    const updated = days.includes(dayNum)
      ? days.filter((d) => d !== dayNum)
      : [...days, dayNum].sort((a, b) => a - b);

    if (updated.length === 0) {
      alert("У лікаря має бути хоча б один робочий день");
      return;
    }

    saveDoctorSchedule(selectedDoctorId, { workingDays: updated });
    setRefreshTrigger((prev) => prev + 1);
    showToast("Робочі дні оновлено");
  };

  // Change working hours or duration
  const handleUpdateSchedule = (partial: Partial<DoctorSchedule>) => {
    saveDoctorSchedule(selectedDoctorId, partial);
    setRefreshTrigger((prev) => prev + 1);
    showToast("Налаштування збережено");
  };

  // Days list for the 7-day inspector
  const inspectionDays = useMemo(() => {
    const now = new Date();
    const dayNames = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
    return Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(now);
      d.setDate(now.getDate() + idx);
      const ymd = formatDateToYMD(d);
      let label = `${dayNames[d.getDay()]} (${String(d.getDate()).padStart(2, "0")}.${String(
        d.getMonth() + 1
      ).padStart(2, "0")})`;
      if (idx === 0) label = `Сьогодні (${label})`;
      else if (idx === 1) label = `Завтра (${label})`;
      return { offset: idx, dateStr: ymd, label, dayOfWeek: d.getDay() || 7 };
    });
  }, []);

  const activeDateObj = inspectionDays[activeDayOffset] || inspectionDays[0];

  // Available slots for active day
  const activeDaySlots = useMemo(() => {
    if (!activeDateObj) return [];
    return getDoctorAvailableSlots(selectedDoctorId, activeDateObj.dateStr);
  }, [selectedDoctorId, activeDateObj, refreshTrigger]);

  // Handle manual slot blocking
  const handleConfirmBlock = (e: FormEvent) => {
    e.preventDefault();
    if (!slotToBlock) return;

    bookDoctorSlot({
      doctorId: selectedDoctorId,
      date: slotToBlock.dateStr,
      time: slotToBlock.time,
      durationMinutes: blockDuration,
      patientName: blockReason.trim() || "Зайнято",
      status: "blocked",
      notes: "Заблоковано вручну з адмін-панелі",
    });

    setIsBlockModalOpen(false);
    setSlotToBlock(null);
    setBlockReason("Перерва / Зайнято");
    setBlockDuration(currentSchedule.slotDurationMinutes || 60);
    setRefreshTrigger((prev) => prev + 1);
    showToast(`Слот ${slotToBlock.time} заблоковано`);
  };

  // Handle freeing up a booked slot
  const handleFreeSlot = (slot: BookedSlot) => {
    if (window.confirm(`Звільнити слот ${slot.time} (${slot.patientName || "Бронь"})?`)) {
      cancelDoctorSlot(slot.id);
      setRefreshTrigger((prev) => prev + 1);
      showToast(`Слот ${slot.time} звільнено`);
    }
  };

  // --- PIN Screen ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-white font-sans selection:bg-pink-500 selection:text-white">
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#d8476c] to-pink-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-pink-500/20">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Klinik Im Zentrum
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Адмін-панель • Графіки лікарів
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 text-center">
                Введіть PIN-код доступу
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={8}
                value={enteredPin}
                onChange={(e) => {
                  setEnteredPin(e.target.value);
                  setPinError("");
                }}
                autoFocus
                placeholder="••••"
                className="w-full text-center tracking-widest text-2xl font-mono py-3 px-4 rounded-xl bg-slate-800/90 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-[#d8476c] transition-all"
              />
              {pinError && (
                <p className="text-xs text-rose-400 text-center mt-2 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {pinError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d8476c] to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-sm shadow-lg shadow-pink-500/25 transition-all cursor-pointer"
            >
              Увійти в панель
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <button
              onClick={() => {
                if (onBackToSite) onBackToSite();
                else window.location.href = window.location.pathname;
              }}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> На сайт
            </button>
            <span className="text-[11px] text-slate-500">За замовчуванням: 1911</span>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Admin Dashboard ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 antialiased selection:bg-pink-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/10 border border-rose-500/30 flex items-center justify-center shrink-0 shadow-inner">
              <Settings className="w-5 h-5 text-[#d8476c]" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-white tracking-tight leading-none flex items-center gap-2">
                Klinik Im Zentrum
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  Адмінка
                </span>
              </h1>
              <span className="text-[11px] text-pink-400 font-semibold tracking-wide">
                Керування розкладом та вільними слотами
              </span>
            </div>
          </div>

          {/* Quick Hub: CRM + Google Sheets + PIN + Exit */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {/* Direct CRM Link */}
            <button
              onClick={() => {
                if (onOpenCrm) onOpenCrm();
                else window.location.search = "?view=crm";
              }}
              title="Перейти до CRM заявок"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-pink-400 hover:text-pink-300 border border-slate-700/80 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>CRM Заявки</span>
            </button>

            {/* Direct Google Sheets Link */}
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Відкрити Google Таблицю"
              className="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 hover:text-emerald-300 border border-emerald-800/80 font-bold flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Google Таблиця</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>

            {/* Change PIN button */}
            <button
              onClick={() => setIsChangePinOpen(true)}
              title="Змінити PIN-код"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700/80 font-bold transition-colors cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
            </button>

            {/* Back to site / Logout */}
            <button
              onClick={() => {
                if (onBackToSite) onBackToSite();
                else window.location.href = window.location.pathname;
              }}
              title="Повернутися на сайт"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Doctor Selector Carousel / Tabs */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#d8476c]" />
              Оберіть лікаря для налаштування
            </h2>
            <span className="text-[11px] text-slate-500">
              Всього фахівців: {DOCTORS.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {DOCTORS.map((doc) => {
              const isSelected = doc.id === selectedDoctorId;
              const liveBadge = getDoctorLiveBadge(doc.id);

              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoctorId(doc.id)}
                  className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? "bg-slate-900 border-[#d8476c] ring-2 ring-[#d8476c]/30 shadow-lg shadow-pink-500/10"
                      : "bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2.5">
                    <img
                      src={doc.image}
                      alt={doc.name}
                      className="w-11 h-11 rounded-xl object-cover object-top border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <h3
                        className={`text-xs font-bold leading-tight truncate ${
                          isSelected ? "text-white" : "text-slate-200"
                        }`}
                      >
                        {doc.name}
                      </h3>
                      <p className="text-[10px] text-pink-400 truncate mt-0.5">
                        {doc.role}
                      </p>
                    </div>
                  </div>

                  {/* Live Status Badge preview */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="inline-block text-[10px] font-semibold text-emerald-400 truncate max-w-full">
                      {liveBadge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Doctor Configuration & 7-Day Inspector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Doctor Schedule Config (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    {currentDoctor.name}
                  </h3>
                  <p className="text-xs text-pink-400 mt-0.5">{currentDoctor.role}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">Статус на сайті</span>
                  <span className="text-xs font-bold text-emerald-400">
                    {getDoctorLiveBadge(selectedDoctorId)}
                  </span>
                </div>
              </div>

              {/* Working Days Config */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Робочі дні прийому
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {[
                    { num: 1, label: "Пн" },
                    { num: 2, label: "Вт" },
                    { num: 3, label: "Ср" },
                    { num: 4, label: "Чт" },
                    { num: 5, label: "Пт" },
                    { num: 6, label: "Сб" },
                    { num: 7, label: "Нд" },
                  ].map((d) => {
                    const isWorking = currentSchedule.workingDays.includes(d.num);
                    return (
                      <button
                        key={d.num}
                        type="button"
                        onClick={() => handleToggleDay(d.num)}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          isWorking
                            ? "bg-[#d8476c] border-[#d8476c] text-white shadow-md shadow-pink-500/20"
                            : "bg-slate-800 border-slate-700/80 text-slate-400 hover:text-white"
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Working Hours Config */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#d8476c]" /> Початок прийому
                  </label>
                  <input
                    type="time"
                    value={currentSchedule.startTime}
                    onChange={(e) =>
                      handleUpdateSchedule({ startTime: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#d8476c]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#d8476c]" /> Кінець прийому
                  </label>
                  <input
                    type="time"
                    value={currentSchedule.endTime}
                    onChange={(e) =>
                      handleUpdateSchedule({ endTime: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#d8476c]"
                  />
                </div>
              </div>

              {/* Slot Duration Selector (30 to 120 min by 15 min steps) */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300">
                    Тривалість одного прийому (слоту)
                  </label>
                  <span className="text-xs font-bold text-pink-400">
                    {currentSchedule.slotDurationMinutes || 60} хв
                  </span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {ALLOWED_SLOT_DURATIONS.map((dur) => {
                    const isSelected =
                      (currentSchedule.slotDurationMinutes || 60) === dur;
                    return (
                      <button
                        key={dur}
                        type="button"
                        onClick={() =>
                          handleUpdateSchedule({ slotDurationMinutes: dur })
                        }
                        className={`py-2 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-gradient-to-r from-[#d8476c] to-pink-600 border-pink-500 text-white shadow-md shadow-pink-500/20"
                            : "bg-slate-800 border-slate-700/80 text-slate-300 hover:text-white"
                        }`}
                      >
                        {dur}хв
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Badge Override vs Auto Mode */}
              <div className="pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                    Авто-розрахунок вікна на сайті
                  </label>
                  <input
                    type="checkbox"
                    checked={currentSchedule.isAutoBadge}
                    onChange={(e) =>
                      handleUpdateSchedule({ isAutoBadge: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#d8476c] cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                  Коли увімкнено: плашка на сайті автоматично знаходить перше вільне вікно в
                  графіку лікаря та оновлюється при кожному записі.
                </p>

                {!currentSchedule.isAutoBadge && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Ручний текст плашки
                    </label>
                    <input
                      type="text"
                      value={currentSchedule.manualBadgeOverride || ""}
                      onChange={(e) =>
                        handleUpdateSchedule({ manualBadgeOverride: e.target.value })
                      }
                      placeholder="Наприклад: 🟢 Прийом у Чт о 15:00"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#d8476c]"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Quick Google Sheets URL Settings */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  Посилання на таблицю
                </span>
                <button
                  onClick={() => {
                    setIsEditingSheetUrl(!isEditingSheetUrl);
                    setNewSheetUrlInput(sheetUrl);
                  }}
                  className="text-pink-400 hover:text-pink-300 font-bold cursor-pointer"
                >
                  {isEditingSheetUrl ? "Скасувати" : "Змінити"}
                </button>
              </div>
              {isEditingSheetUrl ? (
                <div className="space-y-2 mt-2">
                  <input
                    type="url"
                    value={newSheetUrlInput}
                    onChange={(e) => setNewSheetUrlInput(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#d8476c]"
                  />
                  <button
                    onClick={() => {
                      if (newSheetUrlInput.trim()) {
                        localStorage.setItem(
                          GOOGLE_SHEET_VIEW_URL_KEY,
                          newSheetUrlInput.trim()
                        );
                        setSheetUrl(newSheetUrlInput.trim());
                        setIsEditingSheetUrl(false);
                        showToast("Посилання на таблицю оновлено");
                      }
                    }}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Зберегти
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 truncate">{sheetUrl}</p>
              )}
            </div>
          </div>

          {/* Right Column: 7-Day Interactive Slot Inspector (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#d8476c]" />
                      Слоти прийому на 7 днів
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Натисніть на вільний слот, щоб заблокувати його (перерва/зайнято), або
                      звільніть заброньований слот.
                    </p>
                  </div>
                  <button
                    onClick={() => setRefreshTrigger((prev) => prev + 1)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Оновити слоти"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Day selector tabs */}
                <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none">
                  {inspectionDays.map((d) => {
                    const isSelected = d.offset === activeDayOffset;
                    const isWorking = currentSchedule.workingDays.includes(d.dayOfWeek);

                    return (
                      <button
                        key={d.offset}
                        onClick={() => setActiveDayOffset(d.offset)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-[#d8476c] border-[#d8476c] text-white shadow-md shadow-pink-500/20"
                            : isWorking
                            ? "bg-slate-800 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-750"
                            : "bg-slate-800/40 border-slate-800 text-slate-500"
                        }`}
                      >
                        {d.label}
                        {!isWorking && (
                          <span className="block text-[9px] text-rose-400/80 font-normal">
                            Вихідний
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Slots Grid */}
                {activeDaySlots.length === 0 ? (
                  <div className="py-16 text-center text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800/60">
                    <Ban className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="text-xs font-bold text-slate-400">
                      У цей день прийому немає
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      День вимкнено у списку робочих днів або години прийому не задано.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {activeDaySlots.map((slot) => {
                      if (slot.isAvailable) {
                        return (
                          <button
                            key={slot.time}
                            onClick={() => {
                              setSlotToBlock({
                                time: slot.time,
                                dateStr: activeDateObj.dateStr,
                              });
                              setIsBlockModalOpen(true);
                            }}
                            className="p-3 rounded-2xl bg-emerald-950/30 hover:bg-emerald-900/50 border border-emerald-800/50 text-left transition-all group cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold font-mono text-emerald-400">
                                {slot.time}
                              </span>
                              <span className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
                            </div>
                            <span className="text-[10px] text-emerald-300/80 font-semibold block mt-1">
                              🟢 Вільний слот
                            </span>
                          </button>
                        );
                      }

                      // Booked slot
                      const b = slot.booking;
                      const isBlocked = b?.status === "blocked";

                      return (
                        <div
                          key={slot.time}
                          className="p-3 rounded-2xl bg-rose-950/30 border border-rose-800/50 text-left relative group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold font-mono text-rose-300">
                              {slot.time}
                            </span>
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                          </div>
                          <p className="text-[11px] font-bold text-white truncate mt-1">
                            {b?.patientName || "Зайнято"}
                          </p>
                          <p className="text-[10px] text-rose-300/80 truncate">
                            {isBlocked ? "Блокування" : b?.patientPhone || "Запис CRM"}
                          </p>

                          {b && (
                            <button
                              onClick={() => handleFreeSlot(b)}
                              className="mt-2 w-full py-1 text-[10px] font-bold rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <X className="w-3 h-3" /> Звільнити
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Grid Legend */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 mt-6">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Вільні години
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Зайняті / Бронь
                  </span>
                </div>
                <span>Крок: {currentSchedule.slotDurationMinutes || 60} хв</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Manual Slot Block Modal */}
      {isBlockModalOpen && slotToBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Ban className="w-4 h-4 text-amber-400" />
                Заблокувати слот {slotToBlock.time}
              </h3>
              <button
                onClick={() => setIsBlockModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBlock} className="space-y-4">
              <p className="text-xs text-slate-400">
                Лікар: <strong className="text-white">{currentDoctor.name}</strong>
                <br />
                Дата: <strong className="text-white">{slotToBlock.dateStr}</strong>
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Причина блокування
                </label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Перерва, особистий прийом, консиліум..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#d8476c]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Тривалість блокування
                </label>
                <select
                  value={blockDuration}
                  onChange={(e) => setBlockDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#d8476c] cursor-pointer"
                >
                  {ALLOWED_SLOT_DURATIONS.map((d) => (
                    <option key={d} value={d}>{d} хв</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-lg cursor-pointer"
                >
                  Заблокувати
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change PIN Modal */}
      {isChangePinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                Зміна PIN-коду адмінки
              </h3>
              <button
                onClick={() => setIsChangePinOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePinSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Поточний PIN-код
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  value={currentPinInput}
                  onChange={(e) => setCurrentPinInput(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#d8476c]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Новий PIN-код (4-8 символів)
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  placeholder="Новий PIN"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#d8476c]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Підтвердіть новий PIN-код
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value)}
                  placeholder="Повторіть PIN"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#d8476c]"
                />
              </div>

              {changePinMessage && (
                <p
                  className={`text-xs p-2.5 rounded-xl ${
                    changePinMessage.isError
                      ? "bg-rose-950/60 text-rose-300 border border-rose-800"
                      : "bg-emerald-950/60 text-emerald-300 border border-emerald-800"
                  }`}
                >
                  {changePinMessage.text}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangePinOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#d8476c] hover:bg-pink-600 text-white font-bold text-xs transition-colors shadow-lg cursor-pointer"
                >
                  Зберегти новий PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
