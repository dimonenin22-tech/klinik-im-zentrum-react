import type { FC } from "react";
import { Phone, MapPin, Clock, Send } from "lucide-react";

export const Footer: FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs sm:text-sm pt-16 pb-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/10 border border-rose-500/30 flex items-center justify-center shrink-0 shadow-inner">
                <svg className="w-6 h-6 text-[#d8476c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C8.5 2 6 4.5 6 8c0 4 2 8 4 12 1-2 2-5 2-8 0 3 1 6 2 8 2-4 4-8 4-12 0-3.5-2.5-6-6-6z" />
                  <path d="M9 9h6" />
                  <path d="M12 6v6" />
                </svg>
              </div>
              <div>
                <h4 className="text-base font-bold text-white leading-none mb-1">Klinik Im Zentrum</h4>
                <span className="text-xs text-slate-400 font-medium">Стоматологія Одеса</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Приватна стоматологічна клініка повного циклу в історичному центрі Одеси. Офіційна медична ліцензія МОЗ України. ТОВ «КЛІНІК ІМ ЦЕНТРУМ», ЄДРПОУ 38437521.
            </p>
          </div>

          {/* Col 2: Services Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Послуги</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#services" className="hover:text-white transition-colors">3D КЛКТ Діагностика</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Професійна гігієна EMS</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Лікування карієсу</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Ендодонтія під мікроскопом</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Брекет-системи</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Керамічні вініри E-max</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Імплантація Straumann</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Седація (сон)</a></li>
            </ul>
          </div>

          {/* Col 3: Navigation */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Навігація</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#cases" className="hover:text-white transition-colors">Результати До та Після</a></li>
              <li><a href="#team" className="hover:text-white transition-colors">Команда лікарів</a></li>
              <li><a href="#technologies" className="hover:text-white transition-colors">Технології клініки</a></li>
              <li><a href="#reviews" className="hover:text-white transition-colors">Відгуки пацієнтів</a></li>
              <li><a href="#safety" className="hover:text-white transition-colors">Стандарти стерильності</a></li>
              <li><a href="#installment" className="hover:text-white transition-colors">Оплата у 3 платежі 0%</a></li>
            </ul>
          </div>

          {/* Col 4: Contacts & Socials */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Контакти</h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#d8476c] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">вул. Успенська, 17, м. Одеса</strong>
                  <p className="text-slate-500">Приморський район, 65000</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#d8476c] shrink-0" />
                <div>
                  <a href="tel:+380634670867" className="text-white font-bold hover:text-pink-400 block">
                    +38 (063) 467-08-67
                  </a>
                  <a href="tel:+380687706177" className="text-slate-400 hover:text-white text-xs">
                    +38 (068) 770-61-77
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#d8476c] shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-300">Пн–Пт: 09:00 – 20:00</p>
                  <p className="text-slate-400">Сб: 09:00 – 19:00</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/_kzentrum_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-800/90 border border-slate-700 text-pink-400 hover:text-white hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/KlinikImZentrumOdessa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-800/90 border border-slate-700 text-blue-400 hover:text-white hover:bg-[#1877F2] flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>

                {/* Telegram */}
                <a
                  href="https://t.me/+380634670867"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-800/90 border border-slate-700 text-sky-400 hover:text-white hover:bg-[#229ED9] flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm"
                  aria-label="Telegram"
                >
                  <Send className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>© 2024–2026 Стоматологічна клініка Klinik Im Zentrum. Усі права захищено.</div>
          <div>м. Одеса, Приморський район, вул. Успенська, 17</div>
        </div>
      </div>
    </footer>
  );
};
