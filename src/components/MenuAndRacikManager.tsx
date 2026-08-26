import React, { useState } from 'react';
import {
  Utensils,
  Plus,
  Folder,
  Sparkles,
  Tag,
  Star,
  Search,
  Edit,
  Trash2,
  ChefHat,
  Upload,
  X,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { MenuItem, MenuCategory, ChickenOption, SauceOption, AddonOption, AdminUser } from '../types';
import { formatRupiah, isRegisteredAdmin } from '../utils';

export interface MenuAndRacikManagerProps {
  activeTab: 'menu' | 'racik' | string;
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  saveMenuItems: (data: MenuItem[]) => void;
  menuCategories: MenuCategory[];
  setMenuCategories: React.Dispatch<React.SetStateAction<MenuCategory[]>>;
  saveMenuCategories: (data: MenuCategory[]) => void;
  chickenOptions: ChickenOption[];
  setChickenOptions: React.Dispatch<React.SetStateAction<ChickenOption[]>>;
  saveChickenOptions: (data: ChickenOption[]) => void;
  sauceOptions: SauceOption[];
  setSauceOptions: React.Dispatch<React.SetStateAction<SauceOption[]>>;
  saveSauceOptions: (data: SauceOption[]) => void;
  addonOptions: AddonOption[];
  setAddonOptions: React.Dispatch<React.SetStateAction<AddonOption[]>>;
  saveAddonOptions: (data: AddonOption[]) => void;
  currentUser?: { name?: string; fullName?: string; role?: string; allowedTabs?: string[] } | AdminUser | null;
  showToast: (msg: string) => void;
}

export const MenuAndRacikManager: React.FC<MenuAndRacikManagerProps> = ({
  activeTab,
  menuItems,
  setMenuItems,
  saveMenuItems,
  menuCategories,
  setMenuCategories,
  saveMenuCategories,
  chickenOptions,
  setChickenOptions,
  saveChickenOptions,
  sauceOptions,
  setSauceOptions,
  saveSauceOptions,
  addonOptions,
  setAddonOptions,
  saveAddonOptions,
  currentUser,
  showToast
}) => {
  const isAdmin = isRegisteredAdmin(currentUser);

  // Search & Filters for Menu
  const [menuSearchTerm, setMenuSearchTerm] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('ALL');

  // Menu Modal State
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingMenuItemId, setEditingMenuItemId] = useState<string | null>(null);
  const [menuName, setMenuName] = useState('');
  const [menuKoreanName, setMenuKoreanName] = useState('');
  const [menuCategory, setMenuCategory] = useState('signature');
  const [menuPrice, setMenuPrice] = useState(25000);
  const [menuCogs, setMenuCogs] = useState(10000);
  const [menuRating, setMenuRating] = useState(5.0);
  const [menuReviewCount, setMenuReviewCount] = useState(10);
  const [menuImageUrl, setMenuImageUrl] = useState('');
  const [menuDescription, setMenuDescription] = useState('');
  const [menuTags, setMenuTags] = useState('Best Seller');
  const [menuIsPopular, setMenuIsPopular] = useState(false);
  const [menuIsSpicy, setMenuIsSpicy] = useState(false);

  // Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Racik Modal State
  const [showRacikModal, setShowRacikModal] = useState(false);
  const [racikType, setRacikType] = useState<'chicken' | 'sauce' | 'addon'>('chicken');
  const [editingRacikId, setEditingRacikId] = useState<string | null>(null);
  const [racikName, setRacikName] = useState('');
  const [racikDescription, setRacikDescription] = useState('');
  const [racikPrice, setRacikPrice] = useState(0);
  const [racikSpiciness, setRacikSpiciness] = useState(0);

  // Delete Confirmation Target
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'menu' | 'chicken' | 'sauce' | 'addon';
    id: string;
    name: string;
  } | null>(null);

  // Helper permission guard
  const checkAdminPermission = (actionName: string = 'melakukan tindakan ini'): boolean => {
    if (!isAdmin) {
      showToast(`🔒 Akses Ditolak: Hanya Admin Terdaftar yang memiliki izin untuk ${actionName}.`);
      return false;
    }
    return true;
  };

  // Menu Handlers
  const handleOpenAddMenu = () => {
    if (!checkAdminPermission('menambah menu baru')) return;
    setEditingMenuItemId(null);
    setMenuName('');
    setMenuKoreanName('');
    setMenuCategory(menuCategories[0]?.id || 'signature');
    setMenuPrice(25000);
    setMenuCogs(10000);
    setMenuRating(5.0);
    setMenuReviewCount(10);
    setMenuImageUrl('');
    setMenuDescription('');
    setMenuTags('Best Seller');
    setMenuIsPopular(false);
    setMenuIsSpicy(false);
    setShowMenuModal(true);
  };

  const handleEditMenu = (item: MenuItem) => {
    if (!checkAdminPermission('mengedit menu')) return;
    setEditingMenuItemId(item.id);
    setMenuName(item.name);
    setMenuKoreanName(item.koreanName || '');
    setMenuCategory(item.category);
    setMenuPrice(item.price);
    setMenuCogs(item.cogs || Math.round(item.price * 0.4));
    setMenuRating(item.rating);
    setMenuReviewCount(item.reviewCount);
    setMenuImageUrl(item.imageUrl || '');
    setMenuDescription(item.description || '');
    setMenuTags((item.tags || []).join(', '));
    setMenuIsPopular(item.isPopular ?? false);
    setMenuIsSpicy(item.isSpicy ?? false);
    setShowMenuModal(true);
  };

  const handleSaveMenu = () => {
    if (!checkAdminPermission('menyimpan menu')) return;
    if (!menuName.trim()) {
      showToast('Nama menu wajib diisi!');
      return;
    }
    if (menuPrice <= 0) {
      showToast('Harga jual harus lebih besar dari 0!');
      return;
    }

    const tagArray = menuTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const safeCogs = menuCogs > 0 ? menuCogs : Math.round(menuPrice * 0.4);

    if (editingMenuItemId) {
      const updated = menuItems.map((item) => {
        if (item.id === editingMenuItemId) {
          return {
            ...item,
            name: menuName.trim(),
            koreanName: menuKoreanName.trim() || undefined,
            category: menuCategory,
            price: Number(menuPrice),
            cogs: safeCogs,
            rating: Number(menuRating) || 5.0,
            reviewCount: Number(menuReviewCount) || 1,
            imageUrl: menuImageUrl.trim() || undefined,
            description: menuDescription.trim(),
            tags: tagArray,
            isPopular: menuIsPopular,
            isSpicy: menuIsSpicy
          };
        }
        return item;
      });
      setMenuItems(updated);
      saveMenuItems(updated);
      showToast(`Menu "${menuName}" berhasil diperbarui!`);
    } else {
      const newItem: MenuItem = {
        id: `MENU-${Date.now().toString().slice(-4)}`,
        name: menuName.trim(),
        koreanName: menuKoreanName.trim() || undefined,
        category: menuCategory,
        price: Number(menuPrice),
        cogs: safeCogs,
        rating: Number(menuRating) || 5.0,
        reviewCount: Number(menuReviewCount) || 1,
        imageUrl: menuImageUrl.trim() || undefined,
        description: menuDescription.trim(),
        tags: tagArray,
        isPopular: menuIsPopular,
        isSpicy: menuIsSpicy
      };
      const updated = [newItem, ...menuItems];
      setMenuItems(updated);
      saveMenuItems(updated);
      showToast(`Menu "${menuName}" berhasil ditambahkan!`);
    }

    setShowMenuModal(false);
  };

  const handleTogglePopular = (id: string) => {
    if (!checkAdminPermission('mengubah status Best Seller')) return;
    const updated = menuItems.map((m) => (m.id === id ? { ...m, isPopular: !m.isPopular } : m));
    setMenuItems(updated);
    saveMenuItems(updated);
    const target = updated.find((m) => m.id === id);
    showToast(target?.isPopular ? `Menu "${target.name}" dijadikan Best Seller!` : `Status Best Seller dicopot.`);
  };

  const handleToggleSpicy = (id: string) => {
    if (!checkAdminPermission('mengubah status Pedas')) return;
    const updated = menuItems.map((m) => (m.id === id ? { ...m, isSpicy: !m.isSpicy } : m));
    setMenuItems(updated);
    saveMenuItems(updated);
    const target = updated.find((m) => m.id === id);
    showToast(target?.isSpicy ? `Menu "${target.name}" ditandai Pedas 🌶️!` : `Tanda Pedas dicopot.`);
  };

  // Racik Handlers
  const handleOpenAddRacik = (type: 'chicken' | 'sauce' | 'addon') => {
    if (!checkAdminPermission('menambah opsi racik')) return;
    setRacikType(type);
    setEditingRacikId(null);
    setRacikName('');
    setRacikDescription('');
    setRacikPrice(type === 'chicken' ? 25000 : type === 'addon' ? 5000 : 0);
    setRacikSpiciness(0);
    setShowRacikModal(true);
  };

  const handleEditRacik = (type: 'chicken' | 'sauce' | 'addon', item: any) => {
    if (!checkAdminPermission('mengedit opsi racik')) return;
    setRacikType(type);
    setEditingRacikId(item.id);
    setRacikName(item.name);
    setRacikDescription(item.description || '');
    setRacikPrice(type === 'chicken' ? item.basePrice : type === 'addon' ? item.price : 0);
    setRacikSpiciness(type === 'sauce' ? item.spiciness || 0 : 0);
    setShowRacikModal(true);
  };

  const handleSaveRacik = () => {
    if (!checkAdminPermission('menyimpan opsi racik')) return;
    if (!racikName.trim()) {
      showToast('Nama opsi wajib diisi!');
      return;
    }

    if (racikType === 'chicken') {
      if (editingRacikId) {
        const updated = chickenOptions.map((c) =>
          c.id === editingRacikId
            ? { ...c, name: racikName.trim(), description: racikDescription.trim(), basePrice: Number(racikPrice) }
            : c
        );
        setChickenOptions(updated);
        saveChickenOptions(updated);
        showToast(`Pilihan Daging "${racikName}" berhasil diperbarui!`);
      } else {
        const newChicken: ChickenOption = {
          id: `chicken-${Date.now().toString().slice(-4)}`,
          name: racikName.trim(),
          description: racikDescription.trim(),
          basePrice: Number(racikPrice)
        };
        const updated = [...chickenOptions, newChicken];
        setChickenOptions(updated);
        saveChickenOptions(updated);
        showToast(`Pilihan Daging "${racikName}" berhasil ditambahkan!`);
      }
    } else if (racikType === 'sauce') {
      if (editingRacikId) {
        const updated = sauceOptions.map((s) =>
          s.id === editingRacikId
            ? { ...s, name: racikName.trim(), description: racikDescription.trim(), spiciness: Number(racikSpiciness) }
            : s
        );
        setSauceOptions(updated);
        saveSauceOptions(updated);
        showToast(`Saus Signature "${racikName}" berhasil diperbarui!`);
      } else {
        const newSauce: SauceOption = {
          id: `sauce-${Date.now().toString().slice(-4)}`,
          name: racikName.trim(),
          description: racikDescription.trim(),
          spiciness: Number(racikSpiciness)
        };
        const updated = [...sauceOptions, newSauce];
        setSauceOptions(updated);
        saveSauceOptions(updated);
        showToast(`Saus Signature "${racikName}" berhasil ditambahkan!`);
      }
    } else if (racikType === 'addon') {
      if (editingRacikId) {
        const updated = addonOptions.map((a) =>
          a.id === editingRacikId
            ? { ...a, name: racikName.trim(), description: racikDescription.trim(), price: Number(racikPrice) }
            : a
        );
        setAddonOptions(updated);
        saveAddonOptions(updated);
        showToast(`Add On "${racikName}" berhasil diperbarui!`);
      } else {
        const newAddon: AddonOption = {
          id: `addon-${Date.now().toString().slice(-4)}`,
          name: racikName.trim(),
          description: racikDescription.trim(),
          price: Number(racikPrice)
        };
        const updated = [...addonOptions, newAddon];
        setAddonOptions(updated);
        saveAddonOptions(updated);
        showToast(`Add On "${racikName}" berhasil ditambahkan!`);
      }
    }

    setShowRacikModal(false);
  };

  const executeDelete = () => {
    if (!deleteConfirmTarget || !checkAdminPermission('menghapus data')) return;
    const { type, id, name } = deleteConfirmTarget;

    if (type === 'menu') {
      const updated = menuItems.filter((m) => m.id !== id);
      setMenuItems(updated);
      saveMenuItems(updated);
      showToast(`🗑️ Menu "${name}" berhasil dihapus.`);
    } else if (type === 'chicken') {
      const updated = chickenOptions.filter((c) => c.id !== id);
      setChickenOptions(updated);
      saveChickenOptions(updated);
      showToast(`🗑️ Pilihan daging "${name}" berhasil dihapus.`);
    } else if (type === 'sauce') {
      const updated = sauceOptions.filter((s) => s.id !== id);
      setSauceOptions(updated);
      saveSauceOptions(updated);
      showToast(`🗑️ Saus "${name}" berhasil dihapus.`);
    } else if (type === 'addon') {
      const updated = addonOptions.filter((a) => a.id !== id);
      setAddonOptions(updated);
      saveAddonOptions(updated);
      showToast(`🗑️ Add on "${name}" berhasil dihapus.`);
    }

    setDeleteConfirmTarget(null);
  };

  // Filter menu items
  const safeMenuItems = menuItems || [];
  const filteredMenuItems = safeMenuItems.filter((item) => {
    const matchesSearch =
      (item.name || '').toLowerCase().includes(menuSearchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(menuSearchTerm.toLowerCase())) ||
      (item.koreanName && item.koreanName.toLowerCase().includes(menuSearchTerm.toLowerCase()));
    const matchesCategory =
      menuCategoryFilter === 'ALL' ||
      item.category === menuCategoryFilter ||
      menuCategories.find((c) => c.id === menuCategoryFilter)?.name === item.category ||
      menuCategories.find((c) => c.id === menuCategoryFilter)?.name.toLowerCase() === (item.category || '').toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const totalSignature = safeMenuItems.filter((m) => m.category === 'signature').length;
  const totalAddon = safeMenuItems.filter((m) => m.category === 'addon').length;
  const totalPopular = safeMenuItems.filter((m) => m.isPopular).length;

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* TAB 1: KELOLA MENU & PRODUK */}
      {/* ========================================================================= */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          {/* Header Info & Add Button */}
          <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-500" />
                Manajemen Katalog Menu & Produk Steak 11
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tambah, ubah, hapus menu, atur harga, foto, serta badge Best Seller & Pedas. Perubahan akan langsung memperbarui tampilan landing page pelanggan!
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCategoryModal(true)}
                className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800 font-extrabold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-all active:scale-95"
              >
                <Folder className="w-3.5 h-3.5" /> <span>Aturan Kategori</span>
              </button>

              {isAdmin && (
                <button
                  onClick={handleOpenAddMenu}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0 transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" /> <span>Tambah Menu</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Menu</span>
                <Utensils className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {(menuItems || []).length} <span className="text-xs font-medium text-slate-500">item</span>
              </p>
            </div>

            <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Signature Steak</span>
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-amber-400" />
              </div>
              <p className="text-2xl font-black text-purple-700 dark:text-amber-400">
                {totalSignature} <span className="text-xs font-medium text-slate-500">item</span>
              </p>
            </div>

            <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Add On & Sides</span>
                <Tag className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {totalAddon} <span className="text-xs font-medium text-slate-500">item</span>
              </p>
            </div>

            <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Best Seller</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {totalPopular} <span className="text-xs font-medium text-slate-500">item</span>
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama menu, deskripsi, atau nama Korea..."
                value={menuSearchTerm}
                onChange={(e) => setMenuSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-500 shrink-0">Kategori:</label>
              <select
                value={menuCategoryFilter}
                onChange={(e) => setMenuCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 cursor-pointer w-full sm:w-auto"
              >
                <option value="ALL">Semua Kategori</option>
                {menuCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Menu Grid */}
          {filteredMenuItems.length === 0 ? (
            <div className="bg-white dark:bg-[#1f0e30] p-12 rounded-2xl border border-dashed border-slate-300 dark:border-purple-900 text-center">
              <p className="text-sm font-semibold text-slate-500">Tidak ada menu yang sesuai pencarian/kategori.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#1f0e30] rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm overflow-hidden flex flex-col justify-between hover:border-amber-400 transition-all"
                >
                  <div>
                    {/* Image Header */}
                    <div className="relative aspect-[16/9] bg-slate-100 dark:bg-purple-950 flex items-center justify-center overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl">🍽️</span>
                      )}
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        <button
                          onClick={() => handleTogglePopular(item.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase cursor-pointer transition-all shadow-xs ${
                            item.isPopular
                              ? 'bg-amber-400 text-purple-950'
                              : 'bg-slate-900/70 text-slate-300 hover:bg-amber-400 hover:text-purple-950'
                          }`}
                          title="Klik untuk toggle status Best Seller"
                        >
                          {item.isPopular ? '★ Best Seller' : '+ Best Seller'}
                        </button>
                        <button
                          onClick={() => handleToggleSpicy(item.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase cursor-pointer transition-all shadow-xs ${
                            item.isSpicy
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-900/70 text-slate-300 hover:bg-red-600 hover:text-white'
                          }`}
                          title="Klik untuk toggle status Pedas"
                        >
                          {item.isSpicy ? '🌶️ Pedas' : '+ Pedas'}
                        </button>
                      </div>

                      <div className="absolute bottom-2 right-2 bg-slate-900/90 backdrop-blur-xs text-white font-black text-xs px-2.5 py-1 rounded-full">
                        {formatRupiah(item.price)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        {item.koreanName ? (
                          <span className="text-[10px] font-bold text-purple-800 dark:text-amber-300 uppercase">
                            {item.koreanName}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {item.category}
                          </span>
                        )}
                        <span className="text-amber-500 font-bold text-xs flex items-center gap-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {item.rating} ({item.reviewCount})
                        </span>
                      </div>

                      <h4 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo">
                        {item.name}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100 dark:border-purple-900/40 text-[11px]">
                        <span className="font-semibold text-slate-500 dark:text-slate-400">
                          HPP: <strong className="text-amber-600 dark:text-amber-400 font-bold">{formatRupiah(item.cogs ?? Math.round(item.price * 0.4))}</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                          Margin {Math.round(((item.price - (item.cogs ?? Math.round(item.price * 0.4))) / item.price) * 100)}%
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.tags?.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-medium bg-slate-100 dark:bg-purple-950 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-purple-800"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-3 bg-slate-50 dark:bg-purple-950/40 border-t border-slate-100 dark:border-purple-900/40 flex items-center justify-end gap-1.5">
                    {isAdmin && (
                      <button
                        onClick={() => handleEditMenu(item)}
                        className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                        title="Edit Menu"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => setDeleteConfirmTarget({ type: 'menu', id: item.id, name: item.name })}
                        className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                        title="Hapus Menu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PENGATURAN RACIK STEAK */}
      {/* ========================================================================= */}
      {activeTab === 'racik' && (
        <div className="space-y-8">
          {/* Header banner */}
          <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-1 rounded-full bg-amber-400 text-purple-950 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <ChefHat className="w-3.5 h-3.5" /> Interactive Flavor Builder
                </span>
              </div>
              <h3 className="font-extrabold text-lg text-[#3D1259] dark:text-amber-400 font-baloo">
                Pengaturan Opsi Racik Steak
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                Ubah, tambah, atau hapus potongan daging paha ayam, varian saus signature, dan opsi add-on. Perubahan akan langsung tersimpan dan tercermin di kalkulator racik steak pelanggan.
              </p>
            </div>
          </div>

          {/* SECTION 1: POTONGAN DAGING PAHA AYAM */}
          <div className="bg-white dark:bg-[#1f0e30] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100 dark:border-purple-900/40">
              <div>
                <h4 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                  🍗 1. Pilihan Potongan Daging Paha Ayam ({(chickenOptions || []).length})
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Opsi porsi daging paha ayam boneless juicy dengan harga dasarnya.
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleOpenAddRacik('chicken')}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> <span>Tambah Daging</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(chickenOptions || []).map((ch) => (
                <div
                  key={ch.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-purple-900/50 bg-slate-50/50 dark:bg-[#180b24] flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-sm text-[#3D1259] dark:text-amber-300 font-baloo">
                        {ch.name}
                      </span>
                      <span className="text-xs font-extrabold text-purple-700 dark:text-amber-300 bg-amber-100 dark:bg-purple-900/80 px-2 py-0.5 rounded">
                        {formatRupiah(ch.basePrice)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {ch.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-200/60 dark:border-purple-900/40">
                    {isAdmin && (
                      <button
                        onClick={() => handleEditRacik('chicken', ch)}
                        className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                        title="Edit Pilihan Daging"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => setDeleteConfirmTarget({ type: 'chicken', id: ch.id, name: ch.name })}
                        className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                        title="Hapus Pilihan Daging"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: SAUS SIGNATURE 11 */}
          <div className="bg-white dark:bg-[#1f0e30] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100 dark:border-purple-900/40">
              <div>
                <h4 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                  🥣 2. Pilihan Saus Signature 11 ({(sauceOptions || []).length})
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Varian resep saus buatan khas Steak 11 beserta indikator tingkat pedasnya.
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleOpenAddRacik('sauce')}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> <span>Tambah Saus</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(sauceOptions || []).map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-purple-900/50 bg-slate-50/50 dark:bg-[#180b24] flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-sm text-[#3D1259] dark:text-amber-300 font-baloo">
                        ✨ {s.name}
                      </span>
                      {s.spiciness > 0 && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded border border-red-200 dark:border-red-900">
                          🔥 Pedas ({s.spiciness})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-200/60 dark:border-purple-900/40">
                    {isAdmin && (
                      <button
                        onClick={() => handleEditRacik('sauce', s)}
                        className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                        title="Edit Saus Signature"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => setDeleteConfirmTarget({ type: 'sauce', id: s.id, name: s.name })}
                        className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                        title="Hapus Saus Signature"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: ADD ON / TAMBAHAN */}
          <div className="bg-white dark:bg-[#1f0e30] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100 dark:border-purple-900/40">
              <div>
                <h4 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                  🧀 3. Pilihan Add On / Tambahan ({(addonOptions || []).length})
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Opsi topping ekstra seperti keju, nasi, telur, kornet, dll.
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleOpenAddRacik('addon')}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> <span>Tambah Add On</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(addonOptions || []).map((a) => (
                <div
                  key={a.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-purple-900/50 bg-slate-50/50 dark:bg-[#180b24] flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-sm text-[#3D1259] dark:text-amber-300 font-baloo">
                        {a.name}
                      </span>
                      <span className="text-xs font-extrabold text-purple-700 dark:text-amber-300 bg-amber-100 dark:bg-purple-900/80 px-2 py-0.5 rounded">
                        +{formatRupiah(a.price)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {a.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-200/60 dark:border-purple-900/40">
                    {isAdmin && (
                      <button
                        onClick={() => handleEditRacik('addon', a)}
                        className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                        title="Edit Add On"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => setDeleteConfirmTarget({ type: 'addon', id: a.id, name: a.name })}
                        className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                        title="Hapus Add On"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL TAMBAH / EDIT MENU */}
      {/* ========================================================================= */}
      {showMenuModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1C0D2B] rounded-2xl max-w-lg w-full border border-purple-900/50 shadow-2xl p-6 space-y-4 my-8 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-purple-900/50 pb-3">
              <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-500" />
                {editingMenuItemId ? 'Edit Item Menu' : 'Tambah Menu Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowMenuModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Menu *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Creamy Garlic Herb Steak"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Sub-Nama Korea (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 크리미 갈릭 스테이크"
                    value={menuKoreanName}
                    onChange={(e) => setMenuKoreanName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Kategori Menu *
                  </label>
                  <select
                    value={menuCategory}
                    onChange={(e) => setMenuCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100 cursor-pointer focus:outline-none focus:border-amber-400"
                  >
                    {menuCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                    {!menuCategories.some((c) => c.id === menuCategory || c.name === menuCategory) && (
                      <option value={menuCategory}>{menuCategory}</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Harga Jual (Rp) *
                  </label>
                  <input
                    type="number"
                    value={menuPrice}
                    onChange={(e) => setMenuPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    HPP / Modal Pokok (Rp) *
                  </label>
                  <input
                    type="number"
                    value={menuCogs}
                    onChange={(e) => setMenuCogs(Number(e.target.value))}
                    placeholder="Contoh: 8000"
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/30 font-bold text-amber-900 dark:text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Rating (1.0 - 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={menuRating}
                    onChange={(e) => setMenuRating(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Jumlah Ulasan
                  </label>
                  <input
                    type="number"
                    value={menuReviewCount}
                    onChange={(e) => setMenuReviewCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Foto / Gambar Menu
                </label>

                {/* Upload File or URL choice */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="https://example.com/image.jpg atau Upload File ▶"
                      value={menuImageUrl}
                      onChange={(e) => setMenuImageUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-medium text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <label className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-all shadow-sm">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 3 * 1024 * 1024) {
                            showToast('Ukuran file terlalu besar! Maksimal 3 MB.');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setMenuImageUrl(reader.result as string);
                            showToast('Foto menu berhasil diunggah!');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Preview Box */}
                {menuImageUrl && (
                  <div className="relative w-24 h-24 rounded-xl border-2 border-dashed border-purple-400/60 overflow-hidden bg-slate-100 dark:bg-purple-950 group mt-1">
                    <img
                      src={menuImageUrl}
                      alt="Preview Menu"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setMenuImageUrl('')}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white text-[10px] font-bold shadow hover:bg-red-700 transition-all"
                      title="Hapus Foto"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-slate-400">
                  Bisa upload file foto langsung dari galeri HP/laptop ATAU tempel URL link gambar dari internet.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Deskripsi Menu *
                </label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan rasa, bahan utama, dan pendamping hidangan ini..."
                  value={menuDescription}
                  onChange={(e) => setMenuDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tags / Label (Pisahkan Koma)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Best Seller, Asin Gurih, Pedas Manis"
                  value={menuTags}
                  onChange={(e) => setMenuTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Badges Toggles */}
              <div className="p-3 bg-amber-50 dark:bg-purple-950/60 rounded-xl border border-amber-200 dark:border-purple-900/60 flex items-center justify-around gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-amber-300">
                  <input
                    type="checkbox"
                    checked={menuIsPopular}
                    onChange={(e) => setMenuIsPopular(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <span>★ Badge Best Seller</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-amber-300">
                  <input
                    type="checkbox"
                    checked={menuIsSpicy}
                    onChange={(e) => setMenuIsSpicy(e.target.checked)}
                    className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                  />
                  <span>🌶️ Badge Pedas</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-purple-900">
              <button
                type="button"
                onClick={() => setShowMenuModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveMenu}
                className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Simpan Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU CATEGORY MANAGEMENT MODAL */}
      {/* ========================================================================= */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C0D2B] rounded-2xl p-6 max-w-md w-full border border-purple-900/50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-purple-900/50">
              <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                <Folder className="w-5 h-5 text-amber-500" />
                Pengaturan Kategori Menu
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List of current categories */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {menuCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-purple-950/60 border border-slate-200 dark:border-purple-900 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-extrabold text-slate-900 dark:text-slate-100">{cat.name}</div>
                    {cat.description && <div className="text-[10px] text-slate-400">{cat.description}</div>}
                  </div>
                  <div className="flex items-center gap-1">
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCatId(cat.id);
                          setCatName(cat.name);
                          setCatDesc(cat.description || '');
                        }}
                        className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg cursor-pointer transition-colors"
                        title="Edit Kategori"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isAdmin && cat.id !== 'signature' && cat.id !== 'addon' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!checkAdminPermission('menghapus kategori')) return;

                          const updatedCats = menuCategories.filter((c) => c.id !== cat.id);
                          setMenuCategories(updatedCats);
                          saveMenuCategories(updatedCats);

                          const updatedMenuItems = menuItems.map((item) => {
                            if (item.category === cat.id || item.category === cat.name) {
                              return { ...item, category: 'signature' };
                            }
                            return item;
                          });
                          setMenuItems(updatedMenuItems);
                          saveMenuItems(updatedMenuItems);

                          if (editingCatId === cat.id) {
                            setEditingCatId(null);
                            setCatName('');
                            setCatDesc('');
                          }
                          showToast(`Kategori "${cat.name}" berhasil dihapus!`);
                        }}
                        className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                        title="Hapus Kategori"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add new category form */}
            {isAdmin && (
              <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-[#3D1259] dark:text-amber-300">
                    {editingCatId ? 'Edit Kategori Menu' : 'Tambah Kategori Baru'}
                  </h4>
                  {editingCatId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCatId(null);
                        setCatName('');
                        setCatDesc('');
                      }}
                      className="text-[10px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-amber-300 underline cursor-pointer"
                    >
                      Batal Edit
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Nama Kategori (contoh: Minuman Segar, Promo)..."
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-white dark:bg-purple-950 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <input
                  type="text"
                  placeholder="Keterangan singkat..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-white dark:bg-purple-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!checkAdminPermission('menyimpan kategori')) return;
                    if (!catName.trim()) {
                      showToast('Nama kategori wajib diisi!');
                      return;
                    }
                    if (editingCatId) {
                      const updated = menuCategories.map((c) =>
                        c.id === editingCatId
                          ? { ...c, name: catName.trim(), description: catDesc.trim() }
                          : c
                      );
                      setMenuCategories(updated);
                      saveMenuCategories(updated);
                      setEditingCatId(null);
                      setCatName('');
                      setCatDesc('');
                      showToast(`Kategori "${catName.trim()}" berhasil diperbarui!`);
                    } else {
                      const newId = catName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                      const newCat = { id: newId || `cat-${Date.now()}`, name: catName.trim(), description: catDesc.trim() };
                      const updated = [...menuCategories, newCat];
                      setMenuCategories(updated);
                      saveMenuCategories(updated);
                      setCatName('');
                      setCatDesc('');
                      showToast(`Kategori "${newCat.name}" berhasil ditambahkan!`);
                    }
                  }}
                  className="w-full py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  {editingCatId ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Simpan Perubahan Kategori
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Tambah Kategori
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL EDIT/ADD RACIK STEAK OPTION */}
      {/* ========================================================================= */}
      {showRacikModal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#180B24] rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-purple-900/60 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-purple-900 pb-3">
              <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-500" />
                {editingRacikId ? 'Edit Opsi Racik Steak' : 'Tambah Opsi Racik Steak'}
              </h3>
              <button
                type="button"
                onClick={() => setShowRacikModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Kategori Opsi
                </label>
                <div className="px-3 py-2 rounded-xl bg-amber-100 dark:bg-purple-950 font-extrabold text-purple-950 dark:text-amber-300">
                  {racikType === 'chicken' && '🍗 Potongan Daging Paha Ayam'}
                  {racikType === 'sauce' && '🥣 Saus Signature 11'}
                  {racikType === 'addon' && '🧀 Add On / Tambahan'}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Opsi *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 3 Potongan Daging Paha / Saus Honey Mustard"
                  value={racikName}
                  onChange={(e) => setRacikName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Deskripsi / Keterangan Singkat
                </label>
                <textarea
                  rows={2}
                  placeholder="Penjelasan porsi, bahan, atau sensasi rasa..."
                  value={racikDescription}
                  onChange={(e) => setRacikDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              {racikType === 'chicken' && (
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Harga Dasar (Rp) *
                  </label>
                  <input
                    type="number"
                    value={racikPrice}
                    onChange={(e) => setRacikPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-extrabold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              {racikType === 'addon' && (
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Harga Tambahan Add On (Rp) *
                  </label>
                  <input
                    type="number"
                    value={racikPrice}
                    onChange={(e) => setRacikPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-extrabold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              {racikType === 'sauce' && (
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Sensasi Pedas
                  </label>
                  <select
                    value={racikSpiciness}
                    onChange={(e) => setRacikSpiciness(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value={0}>Tidak Pedas (Gurih/Manis)</option>
                    <option value={1}>🔥 Pedas Sedang (Level 1)</option>
                    <option value={2}>🔥🔥 Sangat Pedas (Level 2)</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-purple-900">
              <button
                type="button"
                onClick={() => setShowRacikModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveRacik}
                className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Simpan Opsi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C0D2B] rounded-2xl p-6 max-w-md w-full border border-red-500/30 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-3 bg-red-100 dark:bg-red-950/80 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  Hapus {deleteConfirmTarget.type === 'menu' ? 'Menu' : 'Opsi Racik'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Yakin ingin menghapus &quot;{deleteConfirmTarget.name}&quot;?
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-purple-950/50 p-3 rounded-xl border border-slate-200 dark:border-purple-900">
              Tindakan ini tidak dapat dibatalkan. Item ini akan langsung dihapus dari katalog Steak 11.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-300 dark:hover:bg-purple-900"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-extrabold text-xs hover:bg-red-700 shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
