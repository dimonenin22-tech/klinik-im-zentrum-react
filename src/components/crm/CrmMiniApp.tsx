import type { FC, FormEvent } from "react";
import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Phone,
  Calendar,
  Plus,
  Download,
  CheckCircle2,
  Clock,
  Archive,
  AlertCircle,
  X,
  Stethoscope,
  Sparkles,
  ArrowLeft,
  FileSpreadsheet,
  RefreshCw,
  Settings,
} from "lucide-react";
import {
  getCrmLeads,
  saveCrmLead,
  updateCrmLeadStatus,
  deleteCrmLead,
  exportCrmLeadsToCsv,
  getStatusOverrides,
  type CrmLead,
  type LeadStatus,
} from "../../lib/crmStorage";
import { DOCTORS } from "../../data/clinicData";
import {
  getGoogleSheetsWebhookUrl,
  setGoogleSheetsWebhookUrl,
  sendLeadToGoogleSheets,
  fetchLeadsFromGoogleSheets,
  updateLeadInGoogleSheets,
  deleteLeadFromGoogleSheets,
} from "../../lib/googleSheets";
import {
  bookDoctorSlot,
  cancelDoctorSlot,
  getDoctorAvailableSlots,
  formatDateToYMD,
  ALLOWED_SLOT_DURATIONS,
} from "../../lib/scheduleStorage";

export const CrmMiniApp: FC = () => {
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LeadStatus>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Google Sheets settings state
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [sheetsUrlInput, setSheetsUrlInput] = useState("");
  const [sheetsSaveMessage, setSheetsSaveMessage] = useState("");
  const [isTestingSheets, setIsTestingSheets] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(true);

  // New Lead Form state
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("+380 ");
  const [newService, setNewService] = useState("");
  const [newDoctor, setNewDoctor] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Telegram User detection
  const [tgUser, setTgUser] = useState<{ id: number; first_name: string; username?: string } | null>(null);

  // Booking confirmation modal state
  const [bookingLead, setBookingLead] = useState<CrmLead | null>(null);
  const [bookingDoctorId, setBookingDoctorId] = useState<string>(DOCTORS[0].id);
  const [bookingDateOffset, setBookingDateOffset] = useState<number>(0);
  const [bookingTime, setBookingTime] = useState<string>("");
  const [bookingDuration, setBookingDuration] = useState<number>(60);

  const bookingDays = useMemo(() => {
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
      return { offset: idx, dateStr: ymd, label };
    });
  }, []);

  const currentBookingDateStr = bookingDays[bookingDateOffset]?.dateStr || bookingDays[0].dateStr;

  const availableSlotsForBooking = useMemo(() => {
    if (!bookingDoctorId || !currentBookingDateStr) return [];
    return getDoctorAvailableSlots(bookingDoctorId, currentBookingDateStr);
  }, [bookingDoctorId, currentBookingDateStr]);

  const loadLeads = async () => {
    const overrides = getStatusOverrides();

    // 1. Initial quick load from local cache with overrides applied
    const local = getCrmLeads();
    if (local && local.length > 0) {
      setLeads(local.map((l) => ({ ...l, status: overrides[l.id] || l.status })));
    }

    // 2. Fetch live data from Google Sheets
    setIsLoadingCloud(true);
    try {
      const cloudLeads = await fetchLeadsFromGoogleSheets();
      if (cloudLeads && cloudLeads.length > 0) {
        setIsCloudConnected(true);
        const formatted: CrmLead[] = cloudLeads.map((c, idx) => {
          const leadId = c.id || `gs-${idx + 1}`;
          const currentStatus = overrides[leadId] || (c.status as LeadStatus) || "new";
          return {
            id: leadId,
            name: c.name || "Пацієнт",
            phone: c.phone ? String(c.phone).replace(/^'/, "") : "",
            service: c.service || "Загальна консультація",
            doctor: c.doctor || "Черговий фахівець",
            preferredDate: c.preferredDate || "",
            source: c.source || "Сайт",
            notes: c.notes || "",
            status: currentStatus,
            createdAt: c.createdAt ? String(c.createdAt).slice(0, 24) : "",
          };
        });
        setLeads(formatted);
      } else {
        const localLeads = getCrmLeads();
        if (localLeads && localLeads.length > 0) {
          setLeads(localLeads.map((l) => ({ ...l, status: overrides[l.id] || l.status })));
        }
      }
    } catch (e) {
      console.warn("Помилка синхронізації з Google Sheets:", e);
      setIsCloudConnected(false);
      const localLeads = getCrmLeads();
      if (localLeads && localLeads.length > 0) {
        setLeads(localLeads.map((l) => ({ ...l, status: overrides[l.id] || l.status })));
      }
    } finally {
      setIsLoadingCloud(false);
    }
  };

  useEffect(() => {
    loadLeads();
    setSheetsUrlInput(getGoogleSheetsWebhookUrl());

    // Telegram Web App API initialization
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      tg.expand();
      try {
        if (tg.initDataUnsafe?.user) {
          setTgUser(tg.initDataUnsafe.user);
        }
      } catch (e) {
        console.warn("Telegram WebApp initData parse error:", e);
      }
    }
  }, []);

  const refreshLeads = () => {
    loadLeads();
  };

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp?.HapticFeedback) {
      try {
        (window as any).Telegram.WebApp.HapticFeedback.impactOccurred("medium");
      } catch {}
    }
  };

  const handleOpenBookingModal = (lead: CrmLead) => {
    triggerHaptic();
    setBookingLead(lead);
    const matchedDoc = DOCTORS.find(
      (d) =>
        lead.doctor &&
        (lead.doctor.toLowerCase().includes(d.name.toLowerCase()) ||
          lead.doctor.toLowerCase().includes(d.id.toLowerCase()))
    );
    setBookingDoctorId(matchedDoc ? matchedDoc.id : DOCTORS[0].id);
    setBookingDateOffset(0);
    setBookingTime("");
  };

  const handleConfirmAppointment = () => {
    if (!bookingLead || !bookingTime) {
      alert("Будь ласка, оберіть час прийому");
      return;
    }

    triggerHaptic();
    const docObj = DOCTORS.find((d) => d.id === bookingDoctorId) || DOCTORS[0];
    const appointmentDateFormatted = `${currentBookingDateStr} о ${bookingTime}`;

    // 1. Бронюємо слот у сховищі розкладу
    bookDoctorSlot({
      doctorId: bookingDoctorId,
      date: currentBookingDateStr,
      time: bookingTime,
      durationMinutes: bookingDuration,
      leadId: bookingLead.id,
      patientName: bookingLead.name,
      patientPhone: bookingLead.phone,
      service: bookingLead.service,
      status: "confirmed",
      notes: bookingLead.notes,
    });

    // 2. Оновлюємо стан ліда у CRM
    setLeads((prev) =>
      prev.map((l) =>
        l.id === bookingLead.id
          ? {
              ...l,
              status: "confirmed",
              doctor: `${docObj.name} (${docObj.role})`,
              preferredDate: appointmentDateFormatted,
            }
          : l
      )
    );

    // 3. Зберігаємо статус у сховищі
    updateCrmLeadStatus(bookingLead.id, "confirmed");

    // 4. Оновлюємо існуючий рядок у Google Таблиці (UPDATE, не INSERT)
    updateLeadInGoogleSheets(bookingLead.id, {
      doctor: `${docObj.name} (${docObj.role})`,
      preferredDate: appointmentDateFormatted,
      status: "confirmed",
      notes: `Підтверджено запис на: ${appointmentDateFormatted}. ${bookingLead.notes || ""}`.trim(),
    }).catch((e) => console.warn("Google Sheets sync error:", e));

    // 5. Закриваємо модалку
    setBookingLead(null);
    setBookingTime("");
    setBookingDuration(60);
  };

  const handleStatusChange = (id: string, newStatus: LeadStatus) => {
    triggerHaptic();
    const targetLead = leads.find((l) => l.id === id);

    if (newStatus === "confirmed" && targetLead) {
      handleOpenBookingModal(targetLead);
      return;
    }

    // Якщо переносимо зі статусу "confirmed" в інший — звільняємо слот
    if (targetLead?.status === "confirmed" && newStatus !== "confirmed") {
      cancelDoctorSlot(id);
    }

    // 1. Миттєво оновлюємо картку на екрані та всі лічильники
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );
    // 2. Зберігаємо оверрайд статусу для сесії
    updateCrmLeadStatus(id, newStatus);
    // 3. Синхронізуємо статус у Google Таблиці (UPDATE)
    updateLeadInGoogleSheets(id, { status: newStatus }).catch((e) =>
      console.warn("Google Sheets status sync error:", e)
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Ви дійсно бажаєте видалити цей запис?")) {
      triggerHaptic();
      cancelDoctorSlot(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      deleteCrmLead(id);
      deleteLeadFromGoogleSheets(id).catch((e) =>
        console.warn("Google Sheets delete error:", e)
      );
    }
  };

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newPhone.replace(/\D/g, "").length < 10) {
      alert("Будь ласка, заповніть ім'я та телефон");
      return;
    }

    triggerHaptic();
    saveCrmLead({
      name: newName.trim(),
      phone: newPhone.trim(),
      service: newService || "Консультація лікаря",
      doctor: newDoctor || "Черговий фахівець",
      notes: newNotes.trim(),
      source: "Створено вручну в CRM",
    });

    setIsAddModalOpen(false);
    setNewName("");
    setNewPhone("+380 ");
    setNewService("");
    setNewDoctor("");
    setNewNotes("");
    refreshLeads();
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter((l) => l.status === "new").length;
    const confirmedCount = leads.filter((l) => l.status === "confirmed").length;
    const followupCount = leads.filter((l) => l.status === "followup").length;
    const archivedCount = leads.filter((l) => l.status === "archived").length;
    return { total, newCount, confirmedCount, followupCount, archivedCount };
  }, [leads]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        lead.name.toLowerCase().includes(query) ||
        lead.phone.toLowerCase().includes(query) ||
        lead.service.toLowerCase().includes(query) ||
        lead.doctor.toLowerCase().includes(query) ||
        (lead.notes && lead.notes.toLowerCase().includes(query));

      return matchesStatus && matchesQuery;
    });
  }, [leads, statusFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 antialiased selection:bg-pink-500 selection:text-white">
      {/* Top App Header */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/10 border border-rose-500/30 flex items-center justify-center shrink-0 shadow-inner">
              <svg className="w-5 h-5 text-[#d8476c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.5 2 6 4.5 6 8c0 4 2 8 4 12 1-2 2-5 2-8 0 3 1 6 2 8 2-4 4-8 4-12 0-3.5-2.5-6-6-6z" />
                <path d="M9 9h6" />
                <path d="M12 6v6" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-white tracking-tight leading-none">
                Klinik Im Zentrum
              </h1>
              <span className="text-[11px] text-pink-400 font-semibold tracking-wide">
                CRM • Архів записів
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                triggerHaptic();
                window.location.search = "?view=admin";
              }}
              title="Керування графіком лікарів (Адмінка)"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700/80 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Графік</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic();
                setSheetsUrlInput(getGoogleSheetsWebhookUrl());
                setSheetsSaveMessage("");
                setTestResult(null);
                setIsSheetsModalOpen(true);
              }}
              title="Налаштування Google Таблиць"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-slate-700/80 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Таблиця</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic();
                loadLeads();
              }}
              title="Оновити з Google Таблиці"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCloud ? "animate-spin text-emerald-400" : ""}`} />
              <span className="hidden sm:inline">Оновити</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic();
                exportCrmLeadsToCsv();
              }}
              title="Завантажити базу в CSV (Excel)"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Експорт</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic();
                setIsAddModalOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-[#d8476c] hover:bg-[#be185d] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-pink-600/30 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Запис</span>
            </button>
          </div>
        </div>

        {/* Admin Verified Status Bar */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {tgUser ? `Адмін: ${tgUser.first_name}` : "Адміністратор"}
            </span>
            <span className="text-slate-600">•</span>
            <span className={isLoadingCloud ? "text-amber-400" : isCloudConnected ? "text-emerald-400" : "text-slate-400"}>
              {isLoadingCloud ? "Синхронізація..." : "Google Таблиця: 🟢 Онлайн"}
            </span>
          </div>
          <span className="text-slate-400 font-medium">Заявок: <strong className="text-white">{metrics.total}</strong></span>
        </div>
      </header>

      <main className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* KPI Counter Pills */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => {
              triggerHaptic();
              setStatusFilter("new");
            }}
            className={`p-2.5 rounded-2xl border text-center transition-all ${
              statusFilter === "new"
                ? "bg-rose-500/20 border-rose-500 text-white shadow-sm"
                : "bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300"
            }`}
          >
            <div className="text-lg font-black text-rose-400">{metrics.newCount}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Нові</div>
          </button>

          <button
            onClick={() => {
              triggerHaptic();
              setStatusFilter("confirmed");
            }}
            className={`p-2.5 rounded-2xl border text-center transition-all ${
              statusFilter === "confirmed"
                ? "bg-emerald-500/20 border-emerald-500 text-white shadow-sm"
                : "bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300"
            }`}
          >
            <div className="text-lg font-black text-emerald-400">{metrics.confirmedCount}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Записані</div>
          </button>

          <button
            onClick={() => {
              triggerHaptic();
              setStatusFilter("followup");
            }}
            className={`p-2.5 rounded-2xl border text-center transition-all ${
              statusFilter === "followup"
                ? "bg-amber-500/20 border-amber-500 text-white shadow-sm"
                : "bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300"
            }`}
          >
            <div className="text-lg font-black text-amber-400">{metrics.followupCount}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Дзвінок</div>
          </button>

          <button
            onClick={() => {
              triggerHaptic();
              setStatusFilter("archived");
            }}
            className={`p-2.5 rounded-2xl border text-center transition-all ${
              statusFilter === "archived"
                ? "bg-slate-700/40 border-slate-500 text-white shadow-sm"
                : "bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300"
            }`}
          >
            <div className="text-lg font-black text-slate-300">{metrics.archivedCount}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Архів</div>
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Пошук за прізвищем, телефоном, лікарем..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Badges Bar with Touch Scroll & Controls */}
        <div className="relative w-full flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              document.getElementById("category-scroll-bar")?.scrollBy({ left: -140, behavior: "smooth" });
            }}
            className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center shrink-0 active:scale-95 transition-all text-base font-bold shadow-xs"
            aria-label="Прокрутити категорії вліво"
          >
            ‹
          </button>

          <div
            id="category-scroll-bar"
            className="flex items-center gap-2 overflow-x-auto py-1 px-1 text-xs scroll-smooth whitespace-nowrap touch-pan-x scrollbar-none w-full"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <button
              onClick={() => {
                triggerHaptic();
                setStatusFilter("all");
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold shrink-0 transition-all ${
                statusFilter === "all"
                  ? "bg-white text-slate-950 shadow-md scale-105"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Всі ({metrics.total})
            </button>
            <button
              onClick={() => {
                triggerHaptic();
                setStatusFilter("new");
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold shrink-0 transition-all ${
                statusFilter === "new"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-105"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              🔥 Нові ({metrics.newCount})
            </button>
            <button
              onClick={() => {
                triggerHaptic();
                setStatusFilter("confirmed");
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold shrink-0 transition-all ${
                statusFilter === "confirmed"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              🟢 Записані ({metrics.confirmedCount})
            </button>
            <button
              onClick={() => {
                triggerHaptic();
                setStatusFilter("followup");
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold shrink-0 transition-all ${
                statusFilter === "followup"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30 scale-105"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              ⏳ Передзвонити ({metrics.followupCount})
            </button>
            <button
              onClick={() => {
                triggerHaptic();
                setStatusFilter("archived");
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold shrink-0 transition-all ${
                statusFilter === "archived"
                  ? "bg-slate-600 text-white shadow-md scale-105"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              📁 Архів ({metrics.archivedCount})
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              document.getElementById("category-scroll-bar")?.scrollBy({ left: 140, behavior: "smooth" });
            }}
            className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center shrink-0 active:scale-95 transition-all text-base font-bold shadow-xs"
            aria-label="Прокрутити категорії вправо"
          >
            ›
          </button>
        </div>

        {/* Patient Leads List */}
        <div className="space-y-3">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-3xl bg-slate-900/60 border border-slate-800">
              <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">Записів не знайдено</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                За вказаними критеріями пошуку або фільтрами заявок немає. Спробуйте змінити фільтр або додайте запис вручну.
              </p>
            </div>
          ) : (
            filteredLeads.map((lead) => {
              const statusConfig = {
                new: { label: "Нова заявка", color: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
                confirmed: { label: "Записано на прийом", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
                followup: { label: "Потрібно передзвонити", color: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
                archived: { label: "В архіві", color: "bg-slate-700/20 text-slate-400 border-slate-700/50" },
              }[lead.status];

              return (
                <div
                  key={lead.id}
                  className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-sm hover:border-slate-700 transition-all space-y-3"
                >
                  {/* Card Top Row: Name + Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white tracking-tight leading-snug">
                          {lead.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">#{lead.id}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-500" /> {lead.createdAt} • {lead.source}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusConfig.color} shrink-0`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Medical Details */}
                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#d8476c]" /> Послуга:
                      </span>
                      <strong className="text-white text-right max-w-[65%] truncate">
                        {lead.service}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-sky-400" /> Лікар:
                      </span>
                      <span className="text-slate-300 text-right max-w-[65%] truncate">
                        {lead.doctor}
                      </span>
                    </div>

                    {lead.preferredDate && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" /> Час візиту:
                        </span>
                        <span className="text-pink-300 font-medium text-right">
                          {lead.preferredDate}
                        </span>
                      </div>
                    )}

                    {lead.notes && (
                      <div className="pt-1.5 border-t border-slate-800/60 text-slate-400 text-[11px] leading-relaxed">
                        <strong className="text-slate-500">Коментар: </strong>
                        <i>{lead.notes}</i>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    {/* Call Direct */}
                    <a
                      href={`tel:${lead.phone.replace(/\s+/g, "")}`}
                      onClick={triggerHaptic}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{lead.phone}</span>
                    </a>

                    {/* Status Toggle Menu */}
                    <div className="flex items-center gap-1 text-xs">
                      {lead.status !== "confirmed" && (
                        <button
                          onClick={() => handleStatusChange(lead.id, "confirmed")}
                          title="Підтвердити запис"
                          className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 font-bold"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}

                      {lead.status !== "followup" && (
                        <button
                          onClick={() => handleStatusChange(lead.id, "followup")}
                          title="Передзвонити пізніше"
                          className="p-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 font-bold"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      )}

                      {lead.status !== "archived" ? (
                        <button
                          onClick={() => handleStatusChange(lead.id, "archived")}
                          title="Перемістити в архів"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 font-bold"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(lead.id, "new")}
                          title="Відновити з архіву"
                          className="p-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 font-bold"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(lead.id)}
                        title="Видалити назавжди"
                        className="p-2 rounded-xl text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Manual Lead Entry Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#d8476c]" /> Додати запис вручну
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">ПІБ Пацієнта *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Олена Мельник"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Номер телефону *</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+380 (XX) XXX-XX-XX"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Послуга</label>
                <select
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="">Оберіть послугу...</option>
                  <option value="Первинна 3D діагностика">Первинна 3D діагностика</option>
                  <option value="Імплантація Straumann">Імплантація Straumann</option>
                  <option value="Керамічні вініри E-max">Керамічні вініри E-max</option>
                  <option value="Брекет-системи">Брекет-системи</option>
                  <option value="Професійна гігієна EMS">Професійна гігієна EMS</option>
                  <option value="Лікування під мікроскопом">Лікування під мікроскопом</option>
                  <option value="Седація (сон)">Седація (сон)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Призначити лікаря</label>
                <select
                  value={newDoctor}
                  onChange={(e) => setNewDoctor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="">Будь-який вільний лікар</option>
                  {DOCTORS.map((d) => (
                    <option key={d.id} value={`${d.name} (${d.role})`}>
                      {d.name} — {d.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Коментар або зручний час</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Запис на суботу 14:00..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#d8476c] text-white font-bold hover:bg-[#be185d] shadow-md shadow-pink-600/30"
                >
                  Зберегти в архів
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Sheets Settings Modal */}
      {isSheetsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 text-sm text-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Google Таблиці (Авто-синхронізація)</h3>
                  <p className="text-[11px] text-slate-400">Автоматичний запис нових пацієнтів у Google Таблицю</p>
                </div>
              </div>
              <button
                onClick={() => setIsSheetsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5 text-xs">
                  Webhook URL (Google Apps Script Web App):
                </label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={sheetsUrlInput}
                  onChange={(e) => {
                    setSheetsUrlInput(e.target.value);
                    setSheetsSaveMessage("");
                    setTestResult(null);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                />
              </div>

              {sheetsSaveMessage && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{sheetsSaveMessage}</span>
                </div>
              )}

              {testResult && (
                <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>{testResult}</span>
                </div>
              )}

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
                <div className="font-bold text-slate-300 flex items-center gap-1.5">
                  <span>💡 Як це працює:</span>
                </div>
                <p>1. Створіть Google Таблицю ➔ меню <strong>Розширення ➔ Apps Script</strong>.</p>
                <p>2. Вставте скрипт <code>doPost(e)</code> та натисніть <strong>Розгорнути ➔ Нове розгортання (Веб-додаток)</strong>.</p>
                <p>3. Надайте доступ: <strong>«Усі» (Anyone)</strong> та скопіюйте посилання сюди.</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  disabled={!sheetsUrlInput.trim() || isTestingSheets}
                  onClick={async () => {
                    triggerHaptic();
                    setIsTestingSheets(true);
                    setTestResult(null);
                    setGoogleSheetsWebhookUrl(sheetsUrlInput.trim());
                    const ok = await sendLeadToGoogleSheets({
                      name: "Тестовий пацієнт (CRM)",
                      phone: "+380 99 000-00-00",
                      service: "Тест Google Таблиць",
                      doctor: "Головний лікар",
                      preferredDate: "Найближчий час",
                      source: "CRM Тест",
                      notes: "Перевірка автоматичного додавання рядка в таблицю",
                    });
                    setIsTestingSheets(false);
                    if (ok) {
                      setTestResult("✅ Тестовий рядок надіслано в Google Таблицю! Перевірте її.");
                    } else {
                      setTestResult("❌ Помилка відправки. Перевірте посилання на Web App.");
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs disabled:opacity-50 transition-colors"
                >
                  {isTestingSheets ? "Надсилання..." : "🧪 Надіслати тестовий рядок"}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSheetsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
                  >
                    Закрити
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      setGoogleSheetsWebhookUrl(sheetsUrlInput.trim());
                      setSheetsSaveMessage("Збережено! Тепер кожна нова заявка автоматично летить у вашу таблицю.");
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30"
                  >
                    Зберегти URL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Confirmation Modal (Вибір лікаря, дати та слоту при записі) */}
      {bookingLead && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 text-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Запис на прийом</h3>
                  <p className="text-[11px] text-pink-400">Вибір лікаря та точного часу візиту</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setBookingLead(null);
                  setBookingTime("");
                }}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Patient summary badge */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-sm block">{bookingLead.name}</span>
                <span className="text-emerald-400 font-mono text-xs">{bookingLead.phone}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Послуга</span>
                <span className="text-slate-300 font-semibold text-xs truncate max-w-[150px] inline-block">
                  {bookingLead.service}
                </span>
              </div>
            </div>

            {/* Doctor Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-sky-400" />
                Призначити лікаря
              </label>
              <select
                value={bookingDoctorId}
                onChange={(e) => {
                  setBookingDoctorId(e.target.value);
                  setBookingTime("");
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#d8476c]"
              >
                {DOCTORS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.role}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection Tabs */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Дата прийому
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                {bookingDays.map((d) => {
                  const isSelected = d.offset === bookingDateOffset;
                  return (
                    <button
                      key={d.offset}
                      type="button"
                      onClick={() => {
                        triggerHaptic();
                        setBookingDateOffset(d.offset);
                        setBookingTime("");
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/30 scale-105"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slots Grid */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#d8476c]" />
                  Вільні слоти лікаря
                </label>
                {bookingTime && (
                  <span className="text-xs font-bold text-emerald-400">
                    Обрано: {bookingTime}
                  </span>
                )}
              </div>

              {availableSlotsForBooking.length === 0 ? (
                <div className="p-6 text-center text-slate-500 bg-slate-950 rounded-2xl border border-slate-800/80 text-xs">
                  У цей день у лікаря немає прийомних годин або це вихідний. Оберіть іншу дату або іншого лікаря.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                  {availableSlotsForBooking.map((slot) => {
                    const isSelected = bookingTime === slot.time;
                    if (!slot.isAvailable) {
                      return (
                        <div
                          key={slot.time}
                          className="py-2 px-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-600 text-xs font-mono text-center opacity-60 cursor-not-allowed"
                          title="Слот уже зайнято"
                        >
                          {slot.time}
                          <span className="block text-[9px] text-rose-500/70">Зайнято</span>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => {
                          triggerHaptic();
                          setBookingTime(slot.time);
                        }}
                        className={`py-2 px-2.5 rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/30 scale-105"
                            : "bg-slate-950 border-emerald-900/60 text-emerald-400 hover:bg-emerald-950/40 hover:border-emerald-700"
                        }`}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Duration selector + Modal Actions */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 whitespace-nowrap">Тривалість прийому:</label>
                <select
                  value={bookingDuration}
                  onChange={(e) => setBookingDuration(Number(e.target.value))}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {ALLOWED_SLOT_DURATIONS.map((d) => (
                    <option key={d} value={d}>{d} хв</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBookingLead(null);
                    setBookingTime("");
                    setBookingDuration(60);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  Скасувати
                </button>
                <button
                  type="button"
                  disabled={!bookingTime}
                  onClick={handleConfirmAppointment}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 disabled:opacity-40 transition-all cursor-pointer"
                >
                  {bookingTime ? `Підтвердити запис на ${bookingTime}` : "Оберіть час візиту"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
