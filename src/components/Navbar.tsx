import React, { useState, useEffect } from 'react';
import { ShoppingCart, Lock, Moon, Sun, Menu as MenuIcon, X, UserCheck } from 'lucide-react';
import { getStoredBranding } from '../utils';
import { StoreBrandingSettings } from '../types';

interface NavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenCart: () => void;
  onOpenAdminLogin: () => void;
  onOpenEmployeePortal?: () => void;
  cartCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDark,
  onToggleTheme,
  onOpenCart,
  onOpenAdminLogin,
  onOpenEmployeePortal,
  cartCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [branding, setBranding] = useState<StoreBrandingSettings>(() => getStoredBranding());

  useEffect(() => {
    const handleBrandingUpdate = () => {
      setBranding(getStoredBranding());
    };
    window.addEventListener('branding_updated', handleBrandingUpdate);
    return () => window.removeEventListener('branding_updated', handleBrandingUpdate);
  }, []);

  const toggleMobile = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Top Announcement Bar */}
      {branding.showAnnouncementBar && branding.announcementText && (
        <div className="bg-[#3D1259] text-white font-extrabold text-[11px] sm:text-xs py-1.5 px-4 text-center border-b border-purple-800/60 flex items-center justify-center gap-2 shadow-xs">
          <span className="truncate">{branding.announcementText}</span>
          {branding.announcementLink && (
            <a
              href={branding.announcementLink}
              className="underline hover:text-amber-300 font-black text-[10px] sm:text-[11px] bg-white/10 text-white px-2 py-0.5 rounded-full shrink-0"
            >
              Lihat Detail &rarr;
            </a>
          )}
        </div>
      )}

      <div className="bg-white/90 dark:bg-[#180B24]/90 backdrop-blur-md shadow-sm py-3 border-b border-slate-200 dark:border-purple-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo & Name */}
          <a href="#hero" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden shadow-sm group-hover:scale-105 transition-transform border border-amber-400 bg-amber-400 flex items-center justify-center">
              <img
                src={branding.logoUrl || "https://i.ibb.co/cSnHx8HC/Logo-PNG-01-2.png"}
                alt={`Logo ${branding.brandName}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-tight text-[#3D1259] dark:text-amber-400 font-baloo uppercase">
                  {branding.brandName}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-300 tracking-wider uppercase">
                {branding.tagline}
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 dark:bg-purple-950/60 p-1.5 rounded-full border border-slate-200 dark:border-purple-800/50">
            <a
              href="#hero"
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-amber-300 hover:bg-white dark:hover:bg-purple-900/60 rounded-full transition-all"
            >
              Beranda
            </a>
            <a
              href="#menu"
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-amber-300 hover:bg-white dark:hover:bg-purple-900/60 rounded-full transition-all"
            >
              Menu Steak
            </a>
            <a
              href="#builder"
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-amber-300 hover:bg-white dark:hover:bg-purple-900/60 rounded-full transition-all"
            >
              Racik Steak
            </a>
            <a
              href="#why"
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-amber-300 hover:bg-white dark:hover:bg-purple-900/60 rounded-full transition-all"
            >
              Keunggulan
            </a>
            <a
              href="#locations"
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-amber-300 hover:bg-white dark:hover:bg-purple-900/60 rounded-full transition-all"
            >
              Lokasi Outlets
            </a>
            <a
              href="#reviews"
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-amber-300 hover:bg-white dark:hover:bg-purple-900/60 rounded-full transition-all"
            >
              Testimoni
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Unified Portal Login Trigger */}
            <button
              onClick={onOpenAdminLogin}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#3D1259] text-amber-300 hover:bg-purple-900 transition-all border border-amber-400/40 text-xs font-extrabold shadow-sm cursor-pointer"
              title="Login"
            >
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-[11px]">Login</span>
            </button>


            {/* Dark / Light Mode Toggle */}
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-100 dark:bg-amber-400/20 text-slate-800 dark:text-amber-300 hover:bg-slate-200 dark:hover:bg-amber-400/30 transition-all border border-slate-200 dark:border-amber-400/40 text-xs font-bold"
              aria-label="Toggle Dark/Light Mode"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline text-[11px] font-bold">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-purple-900" />
                  <span className="hidden sm:inline text-[11px] font-bold">Dark</span>
                </>
              )}
            </button>

            {/* Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 dark:bg-amber-400 text-white dark:text-purple-950 hover:bg-slate-800 dark:hover:bg-amber-300 transition-all shadow-sm font-semibold text-xs cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Pesanan Saya</span>
              <span className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-amber-400 dark:bg-purple-950 text-purple-950 dark:text-amber-300 font-extrabold text-[11px]">
                {cartCount}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobile}
              className="md:hidden p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-purple-900/50 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#1A0C27] border-b border-slate-200 dark:border-purple-900/50 shadow-xl px-4 pt-3 pb-6 space-y-3 mt-2">
          <div className="flex flex-col space-y-1">
            <a
              href="#hero"
              onClick={toggleMobile}
              className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-amber-50 dark:hover:bg-purple-900/50"
            >
              Beranda
            </a>
            <a
              href="#menu"
              onClick={toggleMobile}
              className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-amber-50 dark:hover:bg-purple-900/50"
            >
              Menu Steak
            </a>
            <a
              href="#builder"
              onClick={toggleMobile}
              className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-amber-50 dark:hover:bg-purple-900/50"
            >
              Racik Steak
            </a>
            <a
              href="#why"
              onClick={toggleMobile}
              className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-amber-50 dark:hover:bg-purple-900/50"
            >
              Keunggulan
            </a>
            <a
              href="#locations"
              onClick={toggleMobile}
              className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-amber-50 dark:hover:bg-purple-900/50"
            >
              Lokasi Outlets
            </a>
            <a
              href="#reviews"
              onClick={toggleMobile}
              className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-amber-50 dark:hover:bg-purple-900/50"
            >
              Testimoni
            </a>
            <button
              onClick={() => {
                toggleMobile();
                onOpenAdminLogin();
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold text-amber-300 bg-[#3D1259] flex items-center gap-2"
            >
              <Lock className="w-4 h-4 text-amber-400" /> Login
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
