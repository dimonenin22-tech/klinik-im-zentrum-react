export type LeadStatus = "new" | "confirmed" | "followup" | "archived";

export interface CrmLead {
  id: string;
  name: string;
  phone: string;
  service: string;
  doctor: string;
  preferredDate?: string;
  notes?: string;
  source: string;
  status: LeadStatus;
  createdAt: string;
}

const STORAGE_KEY = "kiz_crm_leads_v1";
const STATUS_OVERRIDES_KEY = "kiz_crm_status_overrides_v1";

export function getStatusOverrides(): Record<string, LeadStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STATUS_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStatusOverride(id: string, status: LeadStatus): void {
  if (typeof window === "undefined") return;
  try {
    const overrides = getStatusOverrides();
    overrides[id] = status;
    localStorage.setItem(STATUS_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch (e) {
    console.warn("Помилка збереження статусу:", e);
  }
}

export function removeStatusOverride(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const overrides = getStatusOverrides();
    delete overrides[id];
    localStorage.setItem(STATUS_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {}
}

const INITIAL_DEMO_LEADS: CrmLead[] = [
  {
    id: "lead-101",
    name: "Оксана Мельник",
    phone: "+380 67 452-11-89",
    service: "Керамічні вініри E-max",
    doctor: "Гнатенко Євген Валерійович (Головний лікар)",
    preferredDate: "Четвер, 15:00",
    notes: "Консультація щодо зони посмішки (6 передніх зубів). Бажає природний колір BL3.",
    source: "Смайл-квіз",
    status: "new",
    createdAt: "2026-09-20 14:15",
  },
  {
    id: "lead-102",
    name: "Андрій Коваленко",
    phone: "+380 50 338-90-12",
    service: "Імплантація Straumann BLX",
    doctor: "Срібняк Олексій Богданович (Хірург-імплантолог)",
    preferredDate: "Субота ранок",
    notes: "Втрата 46 зуба, потрібна консультація під седацією. Знижка 3D КТ 300 грн.",
    source: "Модальне вікно запису",
    status: "confirmed",
    createdAt: "2026-09-19 18:40",
  },
  {
    id: "lead-103",
    name: "Вікторія Дмитренко",
    phone: "+380 63 771-24-55",
    service: "Самолігуючі брекети Damon Q",
    doctor: "Костенко Світлана Сергіївна (Ортодонт)",
    preferredDate: "Пн, 16:30",
    notes: "Скупченість нижнього зубного ряду. Цікавить оплата у 3 платежі 0%.",
    source: "Смайл-квіз",
    status: "followup",
    createdAt: "2026-09-19 11:20",
  },
  {
    id: "lead-104",
    name: "Михайло Савченко",
    phone: "+380 97 882-01-44",
    service: "Лікування каналів під мікроскопом",
    doctor: "Пурло Яна Ігорівна (Ендодонтист)",
    preferredDate: "Терміново",
    notes: "Нічний пульсуючий біль у 25 зубі. Проліковано 2 канали, стан стабільний.",
    source: "Прямий дзвінок рецепції",
    status: "archived",
    createdAt: "2026-09-18 09:15",
  },
  {
    id: "lead-105",
    name: "Тетяна Бондар",
    phone: "+380 93 115-40-77",
    service: "Відбілювання Beyond Polus + EMS",
    doctor: "Шеремет Юлія Валентинівна (Терапевт-ортопед)",
    preferredDate: "Пт, 12:00",
    notes: "Освітлення перед весіллям. Проведено чистку та 3 цикли відбілювання (+7 тонів).",
    source: "Модальне вікно запису",
    status: "archived",
    createdAt: "2026-09-17 16:00",
  },
];

export function getCrmLeads(): CrmLead[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_LEADS));
      return INITIAL_DEMO_LEADS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Помилка читання CRM бази:", e);
    return INITIAL_DEMO_LEADS;
  }
}

export function saveCrmLead(
  data: Omit<CrmLead, "id" | "status" | "createdAt">
): CrmLead {
  const leads = getCrmLeads();
  const now = new Date();
  const formattedDate = now.toLocaleDateString("uk-UA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const newLead: CrmLead = {
    id: "lead-" + Date.now().toString().slice(-6),
    name: data.name || "Новий пацієнт",
    phone: data.phone,
    service: data.service || "Загальна консультація",
    doctor: data.doctor || "Черговий фахівець",
    preferredDate: data.preferredDate || "Найближчий вільний час",
    notes: data.notes || "",
    source: data.source || "Сайт",
    status: "new",
    createdAt: formattedDate,
  };

  const updated = [newLead, ...leads];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Помилка збереження заявки в CRM:", e);
  }

  return newLead;
}

export function updateCrmLeadStatus(id: string, status: LeadStatus): boolean {
  // Always save status override for any lead (including Google Sheets leads like gs-1)
  saveStatusOverride(id, status);

  const leads = getCrmLeads();
  const index = leads.findIndex((l) => l.id === id);
  if (index !== -1) {
    leads[index].status = status;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    } catch (e) {
      console.error("Помилка оновлення статусу:", e);
    }
  }
  return true;
}

export function deleteCrmLead(id: string): boolean {
  removeStatusOverride(id);
  const leads = getCrmLeads();
  const filtered = leads.filter((l) => l.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error("Помилка видалення заявки:", e);
    return false;
  }
}

export function exportCrmLeadsToCsv(): void {
  const leads = getCrmLeads();
  const headers = [
    "ID",
    "Дата і час",
    "ПІБ Пацієнта",
    "Телефон",
    "Послуга",
    "Лікар",
    "Бажаний час",
    "Джерело",
    "Статус",
    "Коментар",
  ];

  const rows = leads.map((l) => [
    l.id,
    l.createdAt,
    `"${l.name.replace(/"/g, '""')}"`,
    `"${l.phone}"`,
    `"${l.service.replace(/"/g, '""')}"`,
    `"${l.doctor.replace(/"/g, '""')}"`,
    `"${(l.preferredDate || "").replace(/"/g, '""')}"`,
    `"${l.source}"`,
    l.status,
    `"${(l.notes || "").replace(/"/g, '""')}"`,
  ]);

  const csvContent =
    "\uFEFF" +
    [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `Klinik_Im_Zentrum_Leads_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
