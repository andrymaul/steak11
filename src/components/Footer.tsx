import React, { useState, useEffect } from 'react';
import { ShieldCheck, Instagram, Youtube, MapPin, Phone, MessageCircle } from 'lucide-react';
import { getStoredBranding } from '../utils';
import { StoreBrandingSettings } from '../types';

interface FooterProps {
  onOpenAdminLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdminLogin }) => {
  const [branding, setBranding] = useState<StoreBrandingSettings>(() => getStoredBranding());

  useEffect(() => {
    const handleBrandingUpdate = () => {
      setBranding(getStoredBranding());
    };
    window.addEventListener('branding_updated', handleBrandingUpdate);
    return () => window.removeEventListener('branding_updated', handleBrandingUpdate);
  }, []);

  const cleanIg = (branding.instagramHandle || 'steak11.id').replace('@', '');
  const cleanTt = (branding.tiktokHandle || 'steak11.id').replace('@', '');
  const cleanYt = (branding.youtubeHandle || 'steak11id').replace('@', '');

  return (
    <footer className="bg-[#180526] text-white border-t border-purple-800/40 pt-12 pb-12">
      {/* Running Announcement Banner in Footer */}
      {branding.footerRunningText && (
        <div className="bg-white border-y border-slate-200 py-2.5 overflow-hidden mb-10 text-[#3D1259]">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-md bg-[#3D1259] text-white font-black text-[10px] uppercase shrink-0">INFO UTAMA</span>
            <div className="text-xs font-sans text-[#3D1259] font-black tracking-wide overflow-hidden whitespace-nowrap">
              <span className="inline-block animate-marquee">{branding.footerRunningText}</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-purple-800/40">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-amber-400 bg-amber-400 flex items-center justify-center">
                <img
                  src={branding.logoUrl || "https://i.ibb.co/cSnHx8HC/Logo-PNG-01-2.png"}
                  alt={`Logo ${branding.brandName}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-2xl tracking-tight text-white font-baloo uppercase">
                  {branding.brandName}
                </span>
                <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase">
                  {branding.tagline}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              {branding.aboutDescription || 'Bukan sekadar steak ayam biasa, ini rasa yang MYTHIC. Terbuat dari 100% daging paha ayam segar pilihan bertabur 11 rempah rahasia.'}
            </p>
            <div className="flex items-center gap-3 pt-1">
              {cleanIg && (
                <a
                  href={`https://www.instagram.com/${cleanIg}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-purple-900/60 border border-amber-400/40 flex items-center justify-center text-amber-300 hover:bg-amber-400 hover:text-purple-950 transition-colors shadow-xs"
                  title={`Instagram ${branding.brandName}`}
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {cleanTt && (
                <a
                  href={`https://www.tiktok.com/@${cleanTt}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-purple-900/60 border border-amber-400/40 flex items-center justify-center text-amber-300 hover:bg-amber-400 hover:text-purple-950 transition-colors shadow-xs"
                  title={`TikTok ${branding.brandName}`}
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.883 2.892 2.896 2.896 0 0 1-2.893-2.892 2.896 2.896 0 0 1 2.893-2.893c.273 0 .537.042.788.118v-3.53a6.38 6.38 0 0 0-.788-.05c-3.535 0-6.4 2.865-6.4 6.4 0 3.536 2.865 6.4 6.4 6.4 3.536 0 6.4-2.864 6.4-6.4V9.018a8.212 8.212 0 0 0 4.773 1.52V7.075a4.84 4.84 0 0 1-1.085-.389z"/>
                  </svg>
                </a>
              )}
              {cleanYt && (
                <a
                  href={`https://www.youtube.com/@${cleanYt}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-purple-900/60 border border-amber-400/40 flex items-center justify-center text-amber-300 hover:bg-amber-400 hover:text-purple-950 transition-colors shadow-xs"
                  title={`YouTube ${branding.brandName}`}
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
            {branding.halalCertified && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-900/60 to-emerald-800/40 text-emerald-300 text-xs font-extrabold border border-emerald-500/50 shadow-inner">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% HALAL CERTIFIED & HIGIENIS</span>
              </div>
            )}
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="font-extrabold text-sm text-amber-400 font-baloo tracking-wider uppercase">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <a href="#hero" className="hover:text-amber-400 transition-colors">
                  Beranda Utama
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-amber-400 transition-colors">
                  Daftar Menu Steak
                </a>
              </li>
              <li>
                <a href="#builder" className="hover:text-amber-400 transition-colors">
                  Flavor Builder (Racik)
                </a>
              </li>
              <li>
                <a href="#why" className="hover:text-amber-400 transition-colors">
                  Keunggulan
                </a>
              </li>
              <li>
                <a href="#locations" className="hover:text-amber-400 transition-colors">
                  Cabang Outlet
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h4 className="font-extrabold text-sm text-amber-400 font-baloo tracking-wider uppercase">
              Layanan Outlets Steak 11
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <a
                href="#locations"
                className="group flex items-start gap-2.5 p-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/40 hover:border-amber-400/50 transition-all duration-200 cursor-pointer text-slate-300 hover:text-amber-300"
                title="Lihat Lokasi Cabang"
              >
                <div className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400 group-hover:bg-amber-400 group-hover:text-purple-950 transition-all duration-200 shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                </div>
                <span className="leading-relaxed font-medium">
                  Cibubur, Kalisari, Cilangkap, Kuningan, Jatisampurna
                </span>
              </a>

              <a
                href="https://wa.me/6281223233299"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5 p-2 rounded-xl bg-purple-950/40 hover:bg-emerald-950/60 border border-purple-800/40 hover:border-emerald-500/50 transition-all duration-200 cursor-pointer text-slate-300 hover:text-emerald-300"
                title="Hubungi WhatsApp / Katering"
              >
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-200 shrink-0">
                  <Phone className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                </div>
                <span className="font-mono font-bold tracking-wide">
                  +62 812-2323-3299
                </span>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-4">
          <p>{branding.footerCopyrightText || `© 2026 ${branding.brandName || 'STEAK 11'} — MYTHIC CHICKEN TASTE. ALL RIGHTS RESERVED.`}</p>
        </div>
      </div>
    </footer>
  );
};
