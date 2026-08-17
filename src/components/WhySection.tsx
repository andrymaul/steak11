import React from 'react';
import { ShieldCheck, Flame, UtensilsCrossed, Leaf } from 'lucide-react';

export const WhySection: React.FC = () => {
  return (
    <section id="why" className="py-20 bg-white dark:bg-[#180B24] border-b border-slate-200 dark:border-purple-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative">
            <div className="bg-[#2D0D42] rounded-2xl p-8 text-white shadow-xl border border-purple-800/50 relative z-10 space-y-6">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-purple-950 text-xs font-extrabold uppercase tracking-wider font-baloo">
                STEAK 11
              </span>
              <h3 className="text-3xl font-extrabold font-baloo text-white leading-tight">
                Kelezatan Otentik di Setiap Gigitan Steak Ayam
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed">
                Steak 11 lahir dari dedikasi menciptakan steak ayam paha panggang juicy berkualitas tinggi dengan harga bersahabat.
              </p>
              <div className="pt-4 border-t border-purple-800/40 grid grid-cols-2 gap-4 text-center">
                <div className="bg-purple-950/80 p-4 rounded-xl border border-purple-800/40">
                  <div className="text-3xl font-extrabold text-amber-400 font-baloo">11</div>
                  <div className="text-xs text-slate-200 mt-1 font-medium">Rempah Rahasia</div>
                </div>
                <div className="bg-purple-950/80 p-4 rounded-xl border border-purple-800/40">
                  <div className="text-3xl font-extrabold text-amber-400 font-baloo">100%</div>
                  <div className="text-xs text-slate-200 mt-1 font-medium">Halal & Fresh</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-purple-800 dark:text-amber-300 uppercase tracking-widest bg-purple-50 dark:bg-purple-950 px-3 py-1 rounded-full border border-purple-100 dark:border-purple-800">
                Keunggulan Steak 11
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-baloo tracking-tight">
                Mengapa Steak 11 Selalu Jadi Pilihan Favorit?
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#1f0e30] border border-slate-200 dark:border-purple-900/50 shadow-sm space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-purple-950 flex items-center justify-center text-xl text-emerald-600">
                  <Leaf className="w-5 h-5 text-emerald-500" />
                </div>
                <h4 className="font-bold text-base text-slate-900 dark:text-amber-300 font-baloo">
                  11 Rempah Rahasia
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed">
                  Dimarinasi khusus dengan racikan 11 bumbu otentik pilihan yang meresap hingga ke serat daging terdalam.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#1f0e30] border border-slate-200 dark:border-purple-900/50 shadow-sm space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-purple-950 flex items-center justify-center text-xl text-amber-500">
                  <Flame className="w-5 h-5 text-amber-500" />
                </div>
                <h4 className="font-bold text-base text-slate-900 dark:text-amber-300 font-baloo">
                  100% Fresh Thigh Meat
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed">
                  Hanya menggunakan paha ayam segar tanpa tulang kualitas terbaik untuk tekstur paling juicy, soft & crunchy.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#1f0e30] border border-slate-200 dark:border-purple-900/50 shadow-sm space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-purple-950 flex items-center justify-center text-xl text-purple-600">
                  <UtensilsCrossed className="w-5 h-5 text-purple-500" />
                </div>
                <h4 className="font-bold text-base text-slate-900 dark:text-amber-300 font-baloo">
                  Saus Homemade Signature
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed">
                  Creamy Garlic Herb, Spicy Mythic Black Pepper & Smoky Legend BBQ dimasak segar setiap hari.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#1f0e30] border border-slate-200 dark:border-purple-900/50 shadow-sm space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-purple-950 flex items-center justify-center text-xl text-emerald-600">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </div>
                <h4 className="font-bold text-base text-slate-900 dark:text-amber-300 font-baloo">
                  Sertifikasi 100% Halal
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed">
                  Seluruh bahan baku, rempah marinasi, dan pengolahan dijamin 100% Halal & higienis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
