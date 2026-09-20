export const DEFAULT_GOOGLE_SHEETS_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbxUZ6A2Daz-4VJuJi1J1jSJblCukJR-lBwSOibdFbsWinO-WZhbjnR8QiWCJncbFt7jdQ/exec";

const PREVIOUS_URLS = [
  "https://script.google.com/macros/s/AKfycbz9LswxdNR8nhAegROl_LNY4v1jWFep3Hg2F4cFy5H9WTtCtGYgIN1C2OgawVsMaJ6-/exec",
  "https://script.google.com/macros/s/AKfycbyYrk1u-RaBYQgxy3ecgkg37UrQVmZzXt4uvtrb3LelmzN-Ql632261BcjHl2qjacvV/exec",
  "https://script.google.com/macros/s/AKfycbwIwXUyB0kI-K7T8uB0zxina7m381SHfhZcdK_QJ49haqPA13R3iZcVArX9DSZ8rIDdYA/exec",
];

const STORAGE_KEY = "kiz_google_sheets_webhook_url";

export function getGoogleSheetsWebhookUrl(): string {
  if (typeof window === "undefined") return DEFAULT_GOOGLE_SHEETS_WEBHOOK_URL;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved || PREVIOUS_URLS.includes(saved)) {
    return DEFAULT_GOOGLE_SHEETS_WEBHOOK_URL;
  }
  return saved;
}

export function setGoogleSheetsWebhookUrl(url: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, url.trim());
}

export interface GoogleSheetsLeadPayload {
  id?: string;
  createdAt?: string;
  name: string;
  phone: string;
  service?: string;
  doctor?: string;
  preferredDate?: string;
  source?: string;
  notes?: string;
  status?: "new" | "confirmed" | "followup" | "archived";
}

export async function sendLeadToGoogleSheets(
  lead: GoogleSheetsLeadPayload
): Promise<boolean> {
  const webhookUrl = getGoogleSheetsWebhookUrl();
  if (!webhookUrl) return false;

  try {
    const payload = {
      action: "append",
      id:
        lead.id ||
        `lead-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt:
        lead.createdAt ||
        new Date().toLocaleString("uk-UA", { timeZone: "Europe/Kyiv" }),
      name: lead.name,
      phone: lead.phone && lead.phone.startsWith("+") ? `'${lead.phone}` : lead.phone,
      service: lead.service || "Загальна консультація",
      doctor: lead.doctor || "Черговий фахівець",
      preferredDate: lead.preferredDate || "Найближчий вільний",
      source: lead.source || "Сайт",
      notes: lead.notes || "",
      status: lead.status || "new",
    };

    // Use mode: 'no-cors' and text/plain to avoid CORS preflight rejection from Google Apps Script
    await fetch(webhookUrl, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify(payload),
    });

    return true;
  } catch (err) {
    console.warn("Помилка відправки в Google Таблицю:", err);
    return false;
  }
}

export async function fetchLeadsFromGoogleSheets(): Promise<GoogleSheetsLeadPayload[]> {
  const webhookUrl = getGoogleSheetsWebhookUrl();
  if (!webhookUrl) return [];

  try {
    const separator = webhookUrl.includes("?") ? "&" : "?";
    const freshUrl = `${webhookUrl}${separator}_t=${Date.now()}`;
    const res = await fetch(freshUrl, {
      cache: "no-store",
      headers: {
        "Accept": "application/json",
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (err) {
    console.warn("Помилка читання з Google Таблиці:", err);
    return [];
  }
}

/** Оновлює існуючий рядок у Google Таблиці за id (або phone як фолбек).
 *  Використовує той самий no-cors підхід — відповідь опакована, але запис пройде. */
export async function updateLeadInGoogleSheets(
  id: string,
  fields: Partial<Omit<GoogleSheetsLeadPayload, "id">>,
  phone?: string
): Promise<boolean> {
  const webhookUrl = getGoogleSheetsWebhookUrl();
  if (!webhookUrl) return false;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action: "update", id, phone, ...fields }),
    });
    return true;
  } catch (err) {
    console.warn("Помилка оновлення в Google Таблиці:", err);
    return false;
  }
}

/** Видаляє рядок у Google Таблиці за id або phone. */
export async function deleteLeadFromGoogleSheets(
  id: string,
  phone?: string
): Promise<boolean> {
  const webhookUrl = getGoogleSheetsWebhookUrl();
  if (!webhookUrl) return false;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action: "delete", id, phone }),
    });
    return true;
  } catch (err) {
    console.warn("Помилка видалення з Google Таблиці:", err);
    return false;
  }
}
