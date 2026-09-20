import type { FC } from "react";
import { useState } from "react";
import { Phone, Calendar, MessageCircle, X } from "lucide-react";

interface FloatingDockProps {
  onOpenBooking: () => void;
}

export const FloatingDock: FC<FloatingDockProps> = ({ onOpenBooking }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside
      aria-label="Швидкий зв'язок з клінікою"
      className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2"
    >
      {/* Floating Dock Body */}
      {isOpen && (
        <div className="flex items-center gap-1.5 p-1.5 sm:p-2 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xl shadow-slate-900/15 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* Telegram */}
          <a
            href="https://t.me/+380634670867"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Написати адміністратору в Telegram"
            className="group relative w-11 h-11 rounded-full bg-sky-50 text-sky-600 hover:bg-[#229ED9] hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xs"
          >
            <svg
              className="w-5 h-5 fill-currentColor"
              viewBox="0 0 24 24"
              role="img"
              aria-hidden="true"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
            <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 hidden sm:block">
              Telegram чат
            </span>
          </a>

          {/* Viber */}
          <a
            href="viber://chat?number=%2B380634670867"
            aria-label="Написати адміністратору у Viber"
            className="group relative w-11 h-11 rounded-full bg-purple-50 text-purple-600 hover:bg-[#7360F2] hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xs"
          >
            <svg
              className="w-5 h-5 fill-currentColor"
              viewBox="0 0 24 24"
              role="img"
              aria-hidden="true"
            >
              <path d="M19.78 14.86c-.44-.27-.88-.54-1.32-.82-.44-.27-.88-.55-1.32-.82-.42-.26-.88-.13-1.16.27-.3.43-.61.85-.92 1.28-.15.21-.35.25-.57.14-.94-.48-1.8-1.08-2.55-1.81-.71-.69-1.31-1.51-1.78-2.43-.12-.23-.08-.43.12-.6.4-.34.8-.68 1.2-1.03.35-.31.43-.72.24-1.12-.22-.47-.46-.93-.7-1.39-.24-.46-.49-.92-.74-1.37-.23-.42-.64-.53-1.07-.4-.36.11-.71.27-1.04.47-.64.39-1.04.97-1.19 1.7-.22 1.05.02 2.05.44 3.02 1.05 2.45 2.59 4.47 4.63 6.08 1.57 1.24 3.32 2.07 5.3 2.37.95.14 1.86-.01 2.67-.62.46-.35.81-.8.97-1.37.13-.48.06-.9-.37-1.18zM15.5 3c-1.1 0-2 .9-2 2s.9 2 2 2c3.31 0 6 2.69 6 6 0 1.1.9 2 2 2s2-.9 2-2c0-5.52-4.48-10-10-10zm0 4c-.55 0-1 .45-1 1s.45 1 1 1c1.65 0 3 1.35 3 3 0 .55.45 1 1 1s1-.45 1-1c0-2.76-2.24-5-5-5z" />
            </svg>
            <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 hidden sm:block">
              Viber чат
            </span>
          </a>

          {/* Direct Phone Call */}
          <a
            href="tel:+380634670867"
            aria-label="Зателефонувати в клініку: +380634670867"
            className="group relative w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xs"
          >
            <Phone className="w-5 h-5" />
            <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 hidden sm:block">
              +38 063 467 08 67
            </span>
          </a>

          {/* Quick Appointment Modal Trigger */}
          <button
            onClick={onOpenBooking}
            aria-label="Відкрити форму запису на прийом"
            className="group relative h-11 px-4 rounded-full bg-gradient-to-r from-[#d8476c] to-[#be185d] text-white flex items-center gap-2 font-bold text-xs shadow-md shadow-pink-600/30 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Запис</span>
            <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 hidden sm:block">
              Швидкий запис на прийом
            </span>
          </button>

          {/* Minimize Button */}
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Згорнути панель швидкого зв'язку"
            className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors ml-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Collapsed Reopen Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Розгорнути швидкий зв'язок"
          className="w-13 h-13 rounded-full bg-[#d8476c] hover:bg-[#be185d] text-white flex items-center justify-center shadow-xl shadow-pink-600/40 hover:scale-110 transition-all duration-300 animate-in zoom-in-75 cursor-pointer relative"
        >
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
    </aside>
  );
};
