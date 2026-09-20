import { DOCTORS } from "../data/clinicData";

export interface DoctorSchedule {
  doctorId: string;
  workingDays: number[]; // 1 = Пн, 2 = Вт, 3 = Ср, 4 = Чт, 5 = Пт, 6 = Сб, 7 = Нд
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  slotDurationMinutes: number; // 30, 45, 60, 75, 90, 105, 120
  manualBadgeOverride?: string;
  isAutoBadge: boolean;
}

export interface BookedSlot {
  id: string;
  doctorId: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
  durationMinutes: number;
  leadId?: string;
  patientName?: string;
  patientPhone?: string;
  service?: string;
  notes?: string;
  status: "confirmed" | "blocked" | "completed";
  createdAt: string;
}

export const ALLOWED_SLOT_DURATIONS = [30, 45, 60, 75, 90, 105, 120];

const PIN_STORAGE_KEY = "kiz_admin_pin_v1";
const SCHEDULES_STORAGE_KEY = "kiz_doctor_schedules_v1";
const BOOKINGS_STORAGE_KEY = "kiz_booked_slots_v1";
const DEFAULT_PIN = "1911";

// --- PIN Management ---
export function getAdminPin(): string {
  if (typeof window === "undefined") return DEFAULT_PIN;
  try {
    const saved = localStorage.getItem(PIN_STORAGE_KEY);
    return saved && saved.trim().length >= 4 ? saved.trim() : DEFAULT_PIN;
  } catch {
    return DEFAULT_PIN;
  }
}

export function verifyAdminPin(entered: string): boolean {
  return entered.trim() === getAdminPin();
}

export function changeAdminPin(
  currentPin: string,
  newPin: string
): { success: boolean; message: string } {
  if (!verifyAdminPin(currentPin)) {
    return { success: false, message: "Невірний поточний пароль" };
  }
  const cleanNew = newPin.trim();
  if (cleanNew.length < 4 || cleanNew.length > 8) {
    return { success: false, message: "Новий PIN повинен містити від 4 до 8 символів" };
  }
  try {
    localStorage.setItem(PIN_STORAGE_KEY, cleanNew);
    return { success: true, message: "Пароль успішно змінено!" };
  } catch (e) {
    return { success: false, message: "Помилка збереження нового пароля" };
  }
}

// --- Default Schedules ---
const DEFAULT_SCHEDULES: Record<string, DoctorSchedule> = {
  gnatenko: {
    doctorId: "gnatenko",
    workingDays: [1, 2, 3, 4, 5],
    startTime: "09:00",
    endTime: "18:00",
    slotDurationMinutes: 60,
    isAutoBadge: true,
  },
  sribnyak: {
    doctorId: "sribnyak",
    workingDays: [2, 4, 6],
    startTime: "10:00",
    endTime: "18:00",
    slotDurationMinutes: 90,
    isAutoBadge: true,
  },
  kostenko: {
    doctorId: "kostenko",
    workingDays: [1, 3, 5],
    startTime: "10:00",
    endTime: "19:00",
    slotDurationMinutes: 45,
    isAutoBadge: true,
  },
  sheremet: {
    doctorId: "sheremet",
    workingDays: [1, 2, 3, 4, 5],
    startTime: "09:30",
    endTime: "18:30",
    slotDurationMinutes: 60,
    isAutoBadge: true,
  },
  purlo: {
    doctorId: "purlo",
    workingDays: [2, 3, 4, 5, 6],
    startTime: "10:00",
    endTime: "18:00",
    slotDurationMinutes: 60,
    isAutoBadge: true,
  },
};

// --- Schedule Operations ---
export function getDoctorSchedules(): Record<string, DoctorSchedule> {
  if (typeof window === "undefined") return DEFAULT_SCHEDULES;
  try {
    const raw = localStorage.getItem(SCHEDULES_STORAGE_KEY);
    if (!raw) return DEFAULT_SCHEDULES;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SCHEDULES, ...parsed };
  } catch {
    return DEFAULT_SCHEDULES;
  }
}

export function saveDoctorSchedule(
  doctorId: string,
  partial: Partial<DoctorSchedule>
): void {
  if (typeof window === "undefined") return;
  try {
    const current = getDoctorSchedules();
    const existing = current[doctorId] || {
      doctorId,
      workingDays: [1, 2, 3, 4, 5],
      startTime: "09:00",
      endTime: "18:00",
      slotDurationMinutes: 60,
      isAutoBadge: true,
    };
    current[doctorId] = { ...existing, ...partial };
    localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn("Помилка збереження графіка лікаря:", e);
  }
}

// --- Booked Slots Store ---
export function getBookedSlots(): BookedSlot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function bookDoctorSlot(
  booking: Omit<BookedSlot, "id" | "createdAt">
): BookedSlot {
  const slots = getBookedSlots();
  const newSlot: BookedSlot = {
    ...booking,
    id: "slot-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
    createdAt: new Date().toISOString(),
  };

  // Видаляємо старий запис для цього ж ліда (якщо переноситься час)
  const filtered = booking.leadId
    ? slots.filter((s) => s.leadId !== booking.leadId)
    : slots;

  const updated = [newSlot, ...filtered];
  try {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Помилка збереження броні слота:", e);
  }
  return newSlot;
}

export function cancelDoctorSlot(slotIdOrLeadId: string): boolean {
  try {
    const slots = getBookedSlots();
    const updated = slots.filter(
      (s) => s.id !== slotIdOrLeadId && s.leadId !== slotIdOrLeadId
    );
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

// --- Helper Time Calculations ---
export function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function formatMinutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatDateToYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// --- Get Available Slots for a Given Date ---
export function getDoctorAvailableSlots(
  doctorId: string,
  dateStr: string // "YYYY-MM-DD"
): { time: string; isAvailable: boolean; booking?: BookedSlot }[] {
  const schedules = getDoctorSchedules();
  const schedule = schedules[doctorId];
  if (!schedule) return [];

  // Перевірка чи день тижня є робочим для лікаря
  const dateObj = new Date(dateStr + "T00:00:00");
  let dayOfWeek = dateObj.getDay(); // 0 = Нд, 1 = Пн ...
  if (dayOfWeek === 0) dayOfWeek = 7; // Приводимо до ISO: 1..7

  if (!schedule.workingDays.includes(dayOfWeek)) {
    return [];
  }

  const startMin = parseTimeToMinutes(schedule.startTime);
  const endMin = parseTimeToMinutes(schedule.endTime);
  const step = schedule.slotDurationMinutes || 60;

  const allBookings = getBookedSlots().filter(
    (b) => b.doctorId === doctorId && b.date === dateStr && b.status !== "completed"
  );

  const slots: { time: string; isAvailable: boolean; booking?: BookedSlot }[] = [];
  const now = new Date();
  const isToday = formatDateToYMD(now) === dateStr;
  const currentMinutesToday = now.getHours() * 60 + now.getMinutes();

  for (let m = startMin; m + step <= endMin; m += step) {
    const timeFormatted = formatMinutesToTime(m);
    // Якщо сьогодні, перевіряємо чи час ще не минув (плюс 30 хв буфер)
    const isPastToday = isToday && m <= currentMinutesToday + 30;

    const matchedBooking = allBookings.find((b) => {
      const bStart = parseTimeToMinutes(b.time);
      const bEnd = bStart + b.durationMinutes;
      // Чи перетинається слот із бронею
      return m < bEnd && m + step > bStart;
    });

    slots.push({
      time: timeFormatted,
      isAvailable: !isPastToday && !matchedBooking,
      booking: matchedBooking,
    });
  }

  return slots;
}

// --- Dynamic Live Badge for Doctor Cards ---
export function getDoctorLiveBadge(doctorId: string): string {
  const schedules = getDoctorSchedules();
  const schedule = schedules[doctorId];

  // Якщо встановлено ручний бейдж і вимкнено авто-розрахунок
  if (schedule && !schedule.isAutoBadge && schedule.manualBadgeOverride?.trim()) {
    return schedule.manualBadgeOverride.trim();
  }

  const now = new Date();
  const dayNames = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

  // Шукаємо найближчий доступний слот на наступні 7 днів
  for (let offset = 0; offset <= 7; offset++) {
    const checkDate = new Date(now);
    checkDate.setDate(now.getDate() + offset);
    const dateStr = formatDateToYMD(checkDate);

    const slots = getDoctorAvailableSlots(doctorId, dateStr);
    const firstFree = slots.find((s) => s.isAvailable);

    if (firstFree) {
      if (offset === 0) {
        return `🟢 Сьогодні о ${firstFree.time}`;
      } else if (offset === 1) {
        return `🟢 Завтра о ${firstFree.time}`;
      } else {
        const dayName = dayNames[checkDate.getDay()];
        const dayNum = String(checkDate.getDate()).padStart(2, "0");
        const monthNum = String(checkDate.getMonth() + 1).padStart(2, "0");
        return `🟢 ${dayName} (${dayNum}.${monthNum}) о ${firstFree.time}`;
      }
    }
  }

  // Якщо в найближчі 7 днів вільних вікон немає
  const doc = DOCTORS.find((d) => d.id === doctorId);
  return doc?.scheduleBadge || "🟢 Запис за узгодженням";
}
