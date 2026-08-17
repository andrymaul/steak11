import React, { useState, useEffect } from 'react';
import { ShieldCheck, Star, Flame, ArrowRight, Sparkles, Plus } from 'lucide-react';
import { formatRupiah, getStoredBranding } from '../utils';
import { StoreBrandingSettings } from '../types';

interface HeroProps {
  onAddToCartDirect: (name: string, price: number) => void;
}

export const Hero: React.FC<HeroProps> = ({ onAddToCartDirect }) => {
  const [branding, setBranding] = useState<StoreBrandingSettings>(() => getStoredBranding());

  useEffect(() => {
    const handleBrandingUpdate = () => {
      setBranding(getStoredBranding());
    };
    window.addEventListener('branding_updated', handleBrandingUpdate);
    return () => window.removeEventListener('branding_updated', handleBrandingUpdate);
  }, []);

  return (
    <section
      id="hero"
      className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden bg-slate-50 dark:bg-[#150A21] border-b border-slate-200 dark:border-purple-900/40"
    >
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-slate-100/80 dark:from-purple-950/40 to-transparent -z-10 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-400/20 border border-amber-400/50 text-[#3D1259] dark:text-amber-300 rounded-full text-xs font-extrabold uppercase tracking-wider">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{branding.tagline || 'Mythic Chicken Taste'}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#3D1259] dark:text-amber-400 leading-[1.15] font-baloo">
              {branding.brandName} <br className="hidden sm:inline" />
              <span className="text-purple-800 dark:text-amber-300">Juicy, Soft & Crunchy</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-200 leading-relaxed max-w-xl">
              {branding.subTagline || 'Disajikan hangat dari panggangan! Nikmati kelezatan potongan daging paha ayam pilihan tanpa tulang yang dipadukan saus racikan homemade premium, potato wedges krispi, dan sayuran segar.'}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#menu"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-amber-400 text-[#3D1259] font-extrabold text-sm hover:bg-amber-300 shadow-md transition-all hover:-translate-y-0.5"
              >
                <span>Pesan Steak Sekarang</span> <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#builder"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white dark:bg-purple-950/80 border-2 border-[#3D1259] dark:border-amber-400 text-[#3D1259] dark:text-amber-300 font-bold text-sm hover:bg-amber-50 transition-all shadow-xs hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4 text-amber-500" /> Racik Steak Kreasimu
              </a>
            </div>
            <div className="grid grid-cols-3 gap-4 w-full max-w-lg pt-4 border-t border-slate-200/80 dark:border-purple-900/40">
              <div className="flex flex-col">
                <span className="font-bold text-sm text-slate-900 dark:text-amber-300 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> {branding.halalCertified ? '100% Halal' : 'Higienis'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sertifikasi Higienis</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-slate-900 dark:text-amber-300 flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {branding.ratingScore || '4.9 / 5.0'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{branding.reviewCountText || '1,200+ Ulasan'}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-slate-900 dark:text-amber-300 flex items-center gap-1">
                  <Flame className="w-4 h-4 text-amber-500" /> Fresh Grilled
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Dimasak Fresh</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="bg-white dark:bg-[#1f0e30] p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-purple-900/50 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-purple-950 font-extrabold text-[11px]">
                    BEST SELLER NO. 1
                  </span>
                  <span className="bg-purple-950 text-white font-extrabold text-xs px-3 py-1 rounded-full">
                    {formatRupiah(20000)}
                  </span>
                </div>
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-amber-100 mb-4 flex items-center justify-center shadow-inner">
                  <img
                    src={branding.heroBannerUrl || "https://i.ibb.co/zWhxV6Bp/Gemini-Generated-Image-vvqchqvvqchqvvqc.png"}
                    alt={branding.brandName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-amber-400 font-baloo">
                      Creamy Garlic Herb Steak
                    </h3>
                    <span className="text-amber-500 font-bold text-xs flex items-center gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> 4.9
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-300 mb-4 line-clamp-2">
                    Paha ayam juicy panggang disiram saus krim bawang gurih, disajikan dengan potato wedges, carrot, and green beans segar.
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-purple-900/40">
                    <span className="text-xs font-semibold text-[#3D1259] dark:text-amber-300 bg-amber-50 dark:bg-purple-900/40 px-2.5 py-1 rounded-md">
                      Asin Gurih
                    </span>
                    <button
                      onClick={() => onAddToCartDirect('Creamy Garlic Herb Steak', 20000)}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-400 text-white dark:text-purple-950 font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Pesanan
                    </button>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-slate-200 dark:border-purple-800/40 rounded-2xl z-0 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
