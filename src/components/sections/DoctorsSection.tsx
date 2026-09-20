import type { FC } from "react";
import { DOCTORS } from "../../data/clinicData";
import { Award, GraduationCap, CalendarCheck } from "lucide-react";
import { SpotlightCard } from "../ui/SpotlightCard";
import { getDoctorLiveBadge } from "../../lib/scheduleStorage";

interface DoctorsSectionProps {
  onOpenBooking: (service?: string, doctor?: string) => void;
}

export const DoctorsSection: FC<DoctorsSectionProps> = ({ onOpenBooking }) => {
  return (
    <section id="team" className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-50 border border-pink-200 text-xs font-bold text-[#d8476c] mb-3">
            Експертна команда
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Лікарі вищої кваліфікації
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Постійні учасники міжнародних стоматологічних симпозіумів у Швейцарії, Німеччині та США. Власні клінічні протоколи та понад 15 000 годин практики.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {DOCTORS.map((doc) => {
            const liveBadge = getDoctorLiveBadge(doc.id);

            return (
              <SpotlightCard
                key={doc.id}
                tilt={true}
                maxTilt={4}
                className="group flex flex-col justify-between"
              >
                <div>
                  {/* Doctor Photo */}
                  <div className="relative aspect-4/5 w-full overflow-hidden bg-slate-100">
                    <img
                      src={doc.image}
                      alt={doc.name}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                      <span className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
                        <Award className="w-3.5 h-3.5 text-[#d8476c]" /> {doc.experience}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <div className="mb-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-700 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {liveBadge}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug mb-1 group-hover:text-[#d8476c] transition-colors">
                      {doc.name}
                    </h3>
                  <p className="text-xs font-semibold text-[#d8476c] mb-3">{doc.role}</p>

                  <div className="flex items-start gap-2 text-xs text-slate-500 mb-2">
                    <GraduationCap className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{doc.education}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {doc.specialization}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => onOpenBooking(undefined, doc.name)}
                  className="w-full h-10 rounded-xl bg-slate-100 hover:bg-[#d8476c] text-slate-700 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <CalendarCheck className="w-4 h-4" />
                  Записатися до лікаря
                </button>
              </div>
            </SpotlightCard>
          );
        })}
        </div>
      </div>
    </section>
  );
};
