import type { FC } from "react";
import { useState, useEffect } from "react";
import { Phone, Menu, X } from "lucide-react";
import { ShimmerButton } from "../ui/ShimmerButton";

interface HeaderProps {
  onOpenBooking: (service?: string, doctor?: string) => void;
}

export const Header: FC<HeaderProps> = ({ onOpenBooking }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const sectionIds = [
      "services",
      "technologies",
      "cases",
      "quiz",
      "team",
      "reviews",
      "installment",
      "faq",
    ];

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const scrollPosition = window.scrollY + 140;
      let current = "";
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            current = `#${id}`;
            break;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Послуги та ціни", href: "#services" },
    { label: "Технології", href: "#technologies" },
    { label: "Результати", href: "#cases" },
    { label: "Квіз", href: "#quiz" },
    { label: "Лікарі", href: "#team" },
    { label: "Відгуки", href: "#reviews" },
    { label: "3 платежі", href: "#installment" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3"
          : "bg-white/80 backdrop-blur-sm border-b border-slate-200/40 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#hero" className="flex items-center gap-3 group">
          <img
            src="assets/logo.svg"
            alt="Klinik Im Zentrum Логотип"
            className="h-9 w-auto transition-transform duration-300 group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
              Klinik Im Zentrum
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Стоматологія Одеса
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6" aria-label="Головне меню">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-all relative py-1 px-0.5 ${
                  isActive
                    ? "text-[#d8476c] font-bold"
                    : "text-slate-600 hover:text-[#d8476c]"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#d8476c] rounded-full animate-in fade-in duration-200" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <a
            href="tel:+380634670867"
            className="hidden sm:flex items-center gap-2 text-sm font-bold text-slate-800 hover:text-[#d8476c] px-3 py-2 rounded-full hover:bg-pink-50 transition-colors"
            aria-label="Зателефонувати в клініку"
          >
            <Phone className="w-4 h-4 text-[#d8476c]" />
            <span>+38 063 467 08 67</span>
          </a>

          <ShimmerButton
            onClick={() => onOpenBooking()}
            className="h-10 px-5 text-sm font-bold shadow-md"
          >
            Записатися
          </ShimmerButton>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            aria-label={mobileMenuOpen ? "Закрити меню" : "Відкрити меню"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-5 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base font-semibold py-2 px-3 rounded-lg border-b border-slate-100 flex items-center justify-between transition-colors ${
                    isActive
                      ? "bg-pink-50 text-[#d8476c] font-bold"
                      : "text-slate-800 hover:text-[#d8476c]"
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-[#d8476c]" />}
                </a>
              );
            })}
            <a
              href="tel:+380634670867"
              className="flex items-center gap-2 text-base font-bold text-[#d8476c] py-2 px-3 mt-2"
            >
              <Phone className="w-5 h-5" />
              +38 063 467 08 67
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};
