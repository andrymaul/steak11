import React, { useState, useEffect } from 'react';
import { Star, Plus, Sparkles, Tag } from 'lucide-react';
import { MenuItem } from '../types';
import { getStoredMenuItems, getStoredMenuCategories, formatRupiah } from '../utils';

interface MenuSectionProps {
  onAddToCart: (itemId: string) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ onAddToCart }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(getStoredMenuItems());
  const [menuCategories, setMenuCategories] = useState<{ id: string; name: string; description?: string }[]>(getStoredMenuCategories());
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    const handleUpdate = () => {
      setMenuItems(getStoredMenuItems());
      setMenuCategories(getStoredMenuCategories());
    };
    window.addEventListener('menu_items_updated', handleUpdate);
    window.addEventListener('menu_categories_updated', handleUpdate);
    return () => {
      window.removeEventListener('menu_items_updated', handleUpdate);
      window.removeEventListener('menu_categories_updated', handleUpdate);
    };
  }, []);

  // Filter items matching active category
  const filteredItems = (menuItems || [])
    .filter((item) => {
      if (activeTab === 'all') return true;
      if (activeTab === 'signature') return item.isSignature || item.category === 'signature';
      if (activeTab === 'addon') return (!item.isSignature && item.category === 'addon') || item.category === 'addon';

      const targetCat = menuCategories.find((c) => c.id === activeTab || c.name.toLowerCase() === activeTab.toLowerCase());
      if (targetCat) {
        return (
          item.category === targetCat.id ||
          item.category === targetCat.name ||
          (item.category || '').toLowerCase() === targetCat.id.toLowerCase() ||
          (item.category || '').toLowerCase() === targetCat.name.toLowerCase()
        );
      }
      return (item.category || '').toLowerCase() === activeTab.toLowerCase();
    })
    .sort((a, b) => {
      const aAddon = a.category === 'addon' ? 1 : 0;
      const bAddon = b.category === 'addon' ? 1 : 0;
      return aAddon - bAddon;
    });

  // Helper to get printable category label for a menu item
  const getCategoryLabel = (catVal: string) => {
    const found = menuCategories.find((c) => c.id === catVal || c.name.toLowerCase() === (catVal || '').toLowerCase());
    if (found) return found.name;
    if (catVal === 'signature') return 'Signature Steak';
    if (catVal === 'addon') return 'Add On & Sides';
    return catVal || 'Menu';
  };

  return (
    <section id="menu" className="py-20 bg-slate-50 dark:bg-[#180B24] border-b border-slate-200 dark:border-purple-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
          <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-400/30 text-amber-900 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Pilihan Terfavorit
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3D1259] dark:text-amber-400 tracking-tight font-baloo mb-4">
            Menu Steak 11 Special
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
            Dibuat segar sesuai pesanan dari daging ayam paha tanpa tulang pilihan, disajikan dengan saus rahasia dan pendamping lezat.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-center overflow-x-auto pb-4 mb-10 gap-2 max-w-full px-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-slate-900 dark:bg-amber-400 text-white dark:text-purple-950 shadow-sm'
                : 'bg-white dark:bg-[#1f0e30] text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-purple-900/50 hover:bg-slate-100 dark:hover:bg-purple-900/50'
            }`}
          >
            Semua Menu ({menuItems?.length || 0})
          </button>

          {/* Dynamic Stored Categories */}
          {menuCategories.map((cat) => {
            const count = (menuItems || []).filter((item) => {
              if (cat.id === 'signature') return item.isSignature || item.category === 'signature';
              if (cat.id === 'addon') return (!item.isSignature && item.category === 'addon') || item.category === 'addon';
              return (
                item.category === cat.id ||
                item.category === cat.name ||
                (item.category || '').toLowerCase() === cat.id.toLowerCase() ||
                (item.category || '').toLowerCase() === cat.name.toLowerCase()
              );
            }).length;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === cat.id
                    ? 'bg-slate-900 dark:bg-amber-400 text-white dark:text-purple-950 shadow-sm'
                    : 'bg-white dark:bg-[#1f0e30] text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-purple-900/50 hover:bg-slate-100 dark:hover:bg-purple-900/50'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}

          {/* Any additional unlisted category tags */}
          {Array.from(new Set((menuItems || []).map((item) => String(item.category || ''))))
            .filter(
              (itemCat: string) =>
                itemCat &&
                !menuCategories.some(
                  (c) => c.id === itemCat || c.name.toLowerCase() === itemCat.toLowerCase()
                )
            )
            .map((extraCat) => {
              const count = (menuItems || []).filter((item) => item.category === extraCat).length;
              return (
                <button
                  key={extraCat}
                  onClick={() => setActiveTab(extraCat)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === extraCat
                      ? 'bg-slate-900 dark:bg-amber-400 text-white dark:text-purple-950 shadow-sm'
                      : 'bg-white dark:bg-[#1f0e30] text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-purple-900/50 hover:bg-slate-100 dark:hover:bg-purple-900/50'
                  }`}
                >
                  {extraCat} ({count})
                </button>
              );
            })}
        </div>

        {/* Grid Menu */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#1f0e30] rounded-2xl border border-dashed border-slate-300 dark:border-purple-900">
            <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">
              Belum ada menu di kategori ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative bg-white dark:bg-[#1f0e30] rounded-2xl p-5 border border-slate-200 dark:border-purple-900/50 hover:border-amber-400 transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-amber-50 dark:bg-purple-950/40 mb-4 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">🍽️</span>
                    )}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                      {item.isPopular && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-400 text-purple-950 font-extrabold text-[10px] uppercase shadow-xs">
                          Best Seller
                        </span>
                      )}
                      {item.isSpicy && (
                        <span className="px-2.5 py-1 rounded-full bg-red-600 text-white font-extrabold text-[10px] uppercase shadow-xs">
                          Pedas
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-sm text-white font-extrabold text-xs px-3 py-1.5 rounded-full">
                      {formatRupiah(item.price)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-amber-300 border border-purple-200 dark:border-purple-800/80 uppercase tracking-wide flex items-center gap-1">
                      <Tag className="w-3 h-3 text-amber-500" />
                      {getCategoryLabel(item.category)}
                    </span>
                    {item.koreanName && (
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        {item.koreanName}
                      </span>
                    )}
                    <span className="text-amber-500 font-bold text-xs ml-auto flex items-center gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {item.rating}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-lg text-[#3D1259] dark:text-amber-400 font-baloo mb-2">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-purple-900/40 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {(item.tags || []).map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium bg-slate-100 dark:bg-purple-950 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-purple-800"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => onAddToCart(item.id)}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-full font-bold text-xs bg-slate-900 dark:bg-amber-400 text-white dark:text-purple-950 hover:bg-slate-800 dark:hover:bg-amber-300 transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Pesan
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

