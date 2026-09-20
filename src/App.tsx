import { useState } from "react";
import { Header } from "./components/sections/Header";
import { HeroSection } from "./components/sections/HeroSection";
import { PartnersMarquee } from "./components/sections/PartnersMarquee";
import { BentoFeatures } from "./components/sections/BentoFeatures";
import { PatientJourneySection } from "./components/sections/PatientJourneySection";
import { ServicesSection } from "./components/sections/ServicesSection";
import { BeforeAfterSection } from "./components/sections/BeforeAfterSection";
import { SmileQuizSection } from "./components/sections/SmileQuizSection";
import { DoctorsSection } from "./components/sections/DoctorsSection";
import { ReviewsSection } from "./components/sections/ReviewsSection";
import { SafetySection } from "./components/sections/SafetySection";
import { FaqSection } from "./components/sections/FaqSection";
import { FinalCtaSection } from "./components/sections/FinalCtaSection";
import { Footer } from "./components/sections/Footer";
import { AppointmentModal } from "./components/sections/AppointmentModal";
import { FloatingDock } from "./components/ui/FloatingDock";
import { CrmMiniApp } from "./components/crm/CrmMiniApp";
import { ScheduleAdminPanel } from "./components/admin/ScheduleAdminPanel";

export function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingService, setBookingService] = useState<string | undefined>(undefined);
  const [bookingDoctor, setBookingDoctor] = useState<string | undefined>(undefined);

  // Check if opened as Admin Panel
  const isAdminView =
    typeof window !== "undefined" &&
    (window.location.search.includes("view=admin") ||
      window.location.hash === "#admin" ||
      window.location.hash.includes("admin"));

  // Check if opened as Telegram Mini App CRM
  const isCrmView =
    typeof window !== "undefined" &&
    (window.location.search.includes("view=crm") ||
      window.location.hash === "#crm" ||
      window.location.hash.includes("crm"));

  if (isAdminView) {
    return (
      <ScheduleAdminPanel
        onBackToSite={() => {
          window.location.href = window.location.pathname;
        }}
        onOpenCrm={() => {
          window.location.search = "?view=crm";
        }}
      />
    );
  }

  if (isCrmView) {
    return <CrmMiniApp />;
  }

  const handleOpenBooking = (service?: string, doctor?: string) => {
    setBookingService(service);
    setBookingDoctor(doctor);
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    setBookingService(undefined);
    setBookingDoctor(undefined);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-pink-100 selection:text-[#d8476c] font-sans antialiased">
      {/* Sticky Header with Navigation & Quick Call */}
      <Header onOpenBooking={handleOpenBooking} />

      {/* Main Page Flow */}
      <main>
        {/* Hero Section with 3D Tooth & Key Stats */}
        <HeroSection onOpenBooking={handleOpenBooking} />

        {/* Global Medical Partners Ticker: Straumann, Zeiss, EMS, Dentsply */}
        <PartnersMarquee />

        {/* Bento Grid: 3D CBCT, Straumann, Sedation, Microscope, 3 Installments */}
        <BentoFeatures onOpenBooking={handleOpenBooking} />

        {/* Patient Journey: 5-Stage Connected Protocol */}
        <PatientJourneySection onOpenBooking={handleOpenBooking} />

        {/* Transparent Price Catalog: 5 Categories + USD/UAH */}
        <ServicesSection onOpenBooking={handleOpenBooking} />

        {/* Interactive Before/After Cases with Strict Anti-Stretch Clip-Path */}
        <BeforeAfterSection onOpenBooking={handleOpenBooking} />

        {/* Interactive Smile Diagnostic Quiz */}
        <SmileQuizSection onOpenBooking={handleOpenBooking} />

        {/* Expert Medical Team Dossiers */}
        <DoctorsSection onOpenBooking={handleOpenBooking} />

        {/* Social Proof: Infinite Marquee of Verified Reviews */}
        <ReviewsSection />

        {/* Safety Protocol: Class B Autoclaves, MOH License & Installment Calculator */}
        <SafetySection onOpenBooking={handleOpenBooking} />

        {/* FAQ Accordion: Anesthesia, Guarantee, MOH License & Installments */}
        <FaqSection onOpenBooking={handleOpenBooking} />

        {/* Final Conversion Action Banner */}
        <FinalCtaSection onOpenBooking={handleOpenBooking} />
      </main>

      {/* Structured SEO Footer */}
      <Footer />

      {/* Interactive Booking Modal with Ukrainian Phone Mask */}
      <AppointmentModal
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
        initialService={bookingService}
        initialDoctor={bookingDoctor}
      />

      {/* Floating Multi-Channel Contact Dock */}
      <FloatingDock onOpenBooking={() => handleOpenBooking()} />
    </div>
  );
}

export default App;
