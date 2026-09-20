import type { FC } from "react";
import { REVIEWS } from "../../data/clinicData";
import { Marquee } from "../ui/Marquee";
import { Star, MessageSquare } from "lucide-react";

export const ReviewsSection: FC = () => {
  return (
    <section id="reviews" className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-50 border border-pink-200 text-xs font-bold text-[#d8476c] mb-3">
            Соціальний доказ
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Відгуки пацієнтів про наш підхід
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Повна довіра та відсутність болю. Середня оцінка <strong className="text-slate-900">4.7 із 5</strong> за результатами понад 1 500 пацієнтів.
          </p>

          {/* Rating Summary Pill */}
          <div className="inline-flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-6 py-2.5 rounded-full mt-6 shadow-2xs">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
              ))}
            </div>
            <span className="text-sm font-extrabold text-slate-900">4.7 / 5</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-600">Google Maps Відгуки</span>
          </div>
        </div>
      </div>

      {/* Infinite Marquee of Reviews */}
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
        <Marquee pauseOnHover className="[--duration:40s]">
          {REVIEWS.map((rev, idx) => (
            <div
              key={idx}
              className="relative w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-pink-300 hover:shadow-md transition-all mx-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-pink-100 text-[#d8476c] font-bold text-xs flex items-center justify-center">
                      {rev.author[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{rev.author}</h4>
                      <span className="text-[11px] text-slate-400">{rev.date}</span>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-pink-50 text-[#d8476c] border border-pink-100">
                    {rev.tag}
                  </span>
                </div>

                <div className="flex text-amber-400 mb-2">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  "{rev.text}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-medium text-slate-500">
                  <MessageSquare className="w-3 h-3 text-[#d8476c]" /> Верифікований відгук
                </span>
                <span>{rev.source}</span>
              </div>
            </div>
          ))}
        </Marquee>

        {/* Gradient Fades on edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
      </div>
    </section>
  );
};
