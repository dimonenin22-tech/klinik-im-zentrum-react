const TELEGRAM_BOT_TOKEN = "8916085460:AAHiR2JcJzicZhMeyjzx1P1CaY_WqpZd_J4";
const TELEGRAM_CHAT_ID = "661590737";

export interface LeadData {
  name: string;
  phone: string;
  service?: string;
  doctor?: string;
  preferredDate?: string;
  source?: string;
  notes?: string;
}

export async function sendTelegramLead(lead: LeadData): Promise<boolean> {
  const text = `
🦷 <b>Нова заявка з сайту Klinik Im Zentrum!</b>

👤 <b>Пацієнт:</b> ${lead.name}
📞 <b>Телефон:</b> <code>${lead.phone}</code>
🦷 <b>Послуга:</b> ${lead.service || "Загальна консультація"}
👨‍⚕️ <b>Бажаний лікар:</b> ${lead.doctor || "Не вказано (будь-який вільний)"}
📅 <b>Зручний час:</b> ${lead.preferredDate || "Найближчий вільний"}
📍 <b>Джерело:</b> ${lead.source || "Форма запису"}
${lead.notes ? `💬 <b>Деталі:</b> <i>${lead.notes}</i>` : ""}

⏰ <i>Час: ${new Date().toLocaleString("uk-UA")}</i>
`.trim();

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: text,
          parse_mode: "HTML",
        }),
      }
    );

    const data = await response.json();
    return data.ok;
  } catch (error) {
    console.error("Помилка відправки заявки в Telegram:", error);
    return false;
  }
}
