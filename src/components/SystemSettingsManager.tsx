import React, { useState } from 'react';
import {
  MapPin,
  Users,
  Shield,
  MessageSquare,
  Sparkles,
  Percent,
  Sliders,
  HardDrive,
  Download,
  Upload,
  RefreshCw,
  Edit,
  Trash2,
  Plus,
  Save,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Code,
  Globe,
  RotateCcw,
  Package,
  ShieldCheck,
  Activity,
  X,
  Clock,
  ShoppingBag,
  Info
} from 'lucide-react';
import {
  Location,
  AdminUser,
  RoleSetting,
  WASettings,
  BrandingSettings,
  PromoCode,
  AuditLog,
  Employee,
  AttendanceRecord,
  PayrollSlip,
  OrderItem,
  MenuItem
} from '../types';
import { isRegisteredAdmin, formatRupiah, SYSTEM_ALL_TABS } from '../utils';

export interface SystemSettingsManagerProps {
  activeTab: 'outlets' | 'pengguna' | 'pengunjung' | 'wa' | 'branding' | 'promos' | 'system' | 'audit' | 'firebase' | string;
  locations: Location[];
  setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
  saveLocations: (data: Location[]) => void;
  adminUsers: AdminUser[];
  setAdminUsers: React.Dispatch<React.SetStateAction<AdminUser[]>>;
  saveAdminUsers: (data: AdminUser[]) => void;
  roleSettings: RoleSetting[];
  setRoleSettings: React.Dispatch<React.SetStateAction<RoleSetting[]>>;
  saveRoleSettings: (data: RoleSetting[]) => void;
  waSettings: WASettings;
  setWaSettings: React.Dispatch<React.SetStateAction<WASettings>>;
  saveWaSettings: (data: WASettings) => void;
  brandingSettings: BrandingSettings;
  setBrandingSettings: React.Dispatch<React.SetStateAction<BrandingSettings>>;
  saveBrandingSettings: (data: BrandingSettings) => void;
  promos: PromoCode[];
  setPromos: React.Dispatch<React.SetStateAction<PromoCode[]>>;
  savePromos: (data: PromoCode[]) => void;
  currentUser?: { name?: string; fullName?: string; role?: string; allowedTabs?: string[] } | AdminUser | null;
  showToast: (msg: string) => void;
  loadAllData?: () => void;
}

export const SystemSettingsManager: React.FC<SystemSettingsManagerProps> = ({
  activeTab,
  locations,
  setLocations,
  saveLocations,
  adminUsers,
  setAdminUsers,
  saveAdminUsers,
  roleSettings,
  setRoleSettings,
  saveRoleSettings,
  waSettings,
  setWaSettings,
  saveWaSettings,
  brandingSettings,
  setBrandingSettings,
  saveBrandingSettings,
  promos,
  setPromos,
  savePromos,
  currentUser,
  showToast,
  loadAllData
}) => {
  const isAdmin = isRegisteredAdmin(currentUser);

  // Outlet State
  const [showOutletModal, setShowOutletModal] = useState(false);
  const [editingOutletId, setEditingOutletId] = useState<string | null>(null);
  const [outletName, setOutletName] = useState('');
  const [outletAddress, setOutletAddress] = useState('');
  const [outletCity, setOutletCity] = useState('');
  const [outletPhone, setOutletPhone] = useState('');
  const [outletHours, setOutletHours] = useState('10:00 - 22:00 WIB');
  const [outletMapUrl, setOutletMapUrl] = useState('');
  const [outletStartWorkTime, setOutletStartWorkTime] = useState('14:00');
  const [outletEndWorkTime, setOutletEndWorkTime] = useState('23:00');
  const [outletDineIn, setOutletDineIn] = useState(true);
  const [outletTakeaway, setOutletTakeaway] = useState(true);
  const [outletDelivery, setOutletDelivery] = useState(true);
  const [outletIsGofoodActive, setOutletIsGofoodActive] = useState(false);
  const [outletGofoodUrl, setOutletGofoodUrl] = useState('');
  const [outletIsGrabfoodActive, setOutletIsGrabfoodActive] = useState(false);
  const [outletGrabfoodUrl, setOutletGrabfoodUrl] = useState('');
  const [outletIsShopeefoodActive, setOutletIsShopeefoodActive] = useState(false);
  const [outletShopeefoodUrl, setOutletShopeefoodUrl] = useState('');
  const [outletIsMaximActive, setOutletIsMaximActive] = useState(false);
  const [outletMaximUrl, setOutletMaximUrl] = useState('');

  // Admin User Modal
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [adminName, setAdminName] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminRole, setAdminRole] = useState<'Super Admin' | 'Admin' | 'Manager Outlet' | 'Kasir'>('Admin');
  const [adminOutlet, setAdminOutlet] = useState('Semua Outlet');

  // Role Settings Modal
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [roleAllowedTabs, setRoleAllowedTabs] = useState<string[]>(['kasir', 'pesanan', 'inventory', 'absensi']);

  // Promo Modal
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoDesc, setPromoDesc] = useState('');
  const [promoDiscountType, setPromoDiscountType] = useState<'percentage' | 'nominal'>('nominal');
  const [promoDiscountValue, setPromoDiscountValue] = useState(5000);
  const [promoMinOrder, setPromoMinOrder] = useState(30000);
  const [promoExpiry, setPromoExpiry] = useState('2026-12-31');

  // GAS System
  const [gasUrlInput, setGasUrlInput] = useState('');
  const [isTestingGas, setIsTestingGas] = useState(false);
  const [gasTestResult, setGasTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Restore DB preview
  const [restorePreviewData, setRestorePreviewData] = useState<any | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSuccessMsg, setRestoreSuccessMsg] = useState<string | null>(null);

  // Delete Confirm Target
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'outlet' | 'admin' | 'role' | 'promo';
    id: string;
    desc: string;
  } | null>(null);

  const checkAdminPermission = (actionName: string = 'melakukan tindakan ini'): boolean => {
    if (!isAdmin) {
      showToast(`🔒 Akses Ditolak: Hanya Admin Terdaftar yang memiliki izin untuk ${actionName}.`);
      return false;
    }
    return true;
  };

  // =========================================================================
  // OUTLET HANDLERS
  // =========================================================================
  const handleOpenAddOutlet = () => {
    if (!checkAdminPermission('menambah outlet baru')) return;
    setEditingOutletId(null);
    setOutletName('');
    setOutletAddress('');
    setOutletCity('');
    setOutletPhone('081223233299');
    setOutletHours('10:00 - 22:00 WIB');
    setOutletMapUrl('');
    setOutletStartWorkTime('14:00');
    setOutletEndWorkTime('23:00');
    setOutletDineIn(true);
    setOutletTakeaway(true);
    setOutletDelivery(true);
    setOutletIsGofoodActive(false);
    setOutletGofoodUrl('');
    setOutletIsGrabfoodActive(false);
    setOutletGrabfoodUrl('');
    setOutletIsShopeefoodActive(false);
    setOutletShopeefoodUrl('');
    setOutletIsMaximActive(false);
    setOutletMaximUrl('');
    setShowOutletModal(true);
  };

  const handleOpenEditOutlet = (loc: Location) => {
    if (!checkAdminPermission('mengedit outlet')) return;
    setEditingOutletId(loc.id);
    setOutletName(loc.name);
    setOutletAddress(loc.address);
    setOutletCity(loc.city);
    setOutletPhone(loc.phone);
    setOutletHours(loc.operationalHours);
    setOutletMapUrl(loc.mapUrl || '');
    setOutletStartWorkTime(loc.startWorkTime || '14:00');
    setOutletEndWorkTime(loc.endWorkTime || '23:00');
    setOutletDineIn(loc.serviceOptions?.dineIn ?? true);
    setOutletTakeaway(loc.serviceOptions?.takeaway ?? true);
    setOutletDelivery(loc.serviceOptions?.delivery ?? true);
    setOutletIsGofoodActive(loc.onlineDeliveries?.gofood?.isActive ?? false);
    setOutletGofoodUrl(loc.onlineDeliveries?.gofood?.url ?? '');
    setOutletIsGrabfoodActive(loc.onlineDeliveries?.grabfood?.isActive ?? false);
    setOutletGrabfoodUrl(loc.onlineDeliveries?.grabfood?.url ?? '');
    setOutletIsShopeefoodActive(loc.onlineDeliveries?.shopeefood?.isActive ?? false);
    setOutletShopeefoodUrl(loc.onlineDeliveries?.shopeefood?.url ?? '');
    setOutletIsMaximActive(loc.onlineDeliveries?.maxim?.isActive ?? false);
    setOutletMaximUrl(loc.onlineDeliveries?.maxim?.url ?? '');
    setShowOutletModal(true);
  };

  const handleSaveOutlet = () => {
    if (!checkAdminPermission('menyimpan data outlet')) return;
    if (!outletName.trim() || !outletCity.trim()) {
      showToast('Nama dan Kota Outlet wajib diisi!');
      return;
    }

    const newLocData: Location = {
      id: editingOutletId || `loc-${Date.now().toString().slice(-4)}`,
      name: outletName.trim(),
      address: outletAddress.trim(),
      city: outletCity.trim(),
      phone: outletPhone.trim(),
      hours: outletHours.trim() || '10:00 - 22:00',
      operationalHours: outletHours.trim(),
      mapUrl: outletMapUrl.trim(),
      startWorkTime: outletStartWorkTime,
      endWorkTime: outletEndWorkTime,
      serviceOptions: {
        dineIn: outletDineIn,
        takeaway: outletTakeaway,
        delivery: outletDelivery
      },
      onlineDeliveries: {
        gofood: { isActive: outletIsGofoodActive, url: outletGofoodUrl.trim() },
        grabfood: { isActive: outletIsGrabfoodActive, url: outletGrabfoodUrl.trim() },
        shopeefood: { isActive: outletIsShopeefoodActive, url: outletShopeefoodUrl.trim() },
        maxim: { isActive: outletIsMaximActive, url: outletMaximUrl.trim() }
      }
    };

    if (editingOutletId) {
      const updated = locations.map((l) => (l.id === editingOutletId ? newLocData : l));
      setLocations(updated);
      saveLocations(updated);
      showToast(`Outlet "${outletName}" berhasil diperbarui!`);
    } else {
      const updated = [...locations, newLocData];
      setLocations(updated);
      saveLocations(updated);
      showToast(`Outlet baru "${outletName}" berhasil ditambahkan!`);
    }

    setShowOutletModal(false);
  };

  // =========================================================================
  // ADMIN USERS & ROLE PERMISSION
  // =========================================================================
  const handleOpenAddAdmin = () => {
    if (!checkAdminPermission('menambah user admin baru')) return;
    setEditingAdminId(null);
    setAdminName('');
    setAdminUsername('');
    setAdminPassword('');
    setAdminRole('Admin');
    setAdminOutlet('Semua Outlet');
    setShowAdminModal(true);
  };

  const handleSaveAdminUser = () => {
    if (!checkAdminPermission('menyimpan akun admin')) return;
    if (!adminName.trim() || !adminUsername.trim() || (!editingAdminId && !adminPassword.trim())) {
      showToast('Nama, Username, dan Password wajib diisi!');
      return;
    }

    if (editingAdminId) {
      const updated = adminUsers.map((a) =>
        a.id === editingAdminId
          ? {
              ...a,
              name: adminName.trim(),
              username: adminUsername.trim(),
              password: adminPassword ? adminPassword : a.password,
              role: adminRole,
              outlet: adminOutlet
            }
          : a
      );
      setAdminUsers(updated);
      saveAdminUsers(updated);
      showToast(`Akun admin "${adminName}" berhasil diperbarui!`);
    } else {
      const newAdmin: AdminUser = {
        id: `ADM-${Date.now().toString().slice(-4)}`,
        name: adminName.trim(),
        username: adminUsername.trim(),
        password: adminPassword,
        role: adminRole,
        outlet: adminOutlet
      };
      const updated = [...adminUsers, newAdmin];
      setAdminUsers(updated);
      saveAdminUsers(updated);
      showToast(`Akun admin "${adminName}" berhasil ditambahkan!`);
    }

    setShowAdminModal(false);
  };

  // =========================================================================
  // PROMO HANDLERS
  // =========================================================================
  const handleOpenAddPromo = () => {
    if (!checkAdminPermission('menambah kode promo')) return;
    setEditingPromoId(null);
    setPromoCode('');
    setPromoDesc('');
    setPromoDiscountType('nominal');
    setPromoDiscountValue(5000);
    setPromoMinOrder(30000);
    setPromoExpiry('2026-12-31');
    setShowPromoModal(true);
  };

  const handleSavePromo = () => {
    if (!checkAdminPermission('menyimpan kode promo')) return;
    if (!promoCode.trim()) {
      showToast('Kode promo wajib diisi!');
      return;
    }

    const cleanCode = promoCode.trim().toUpperCase();
    if (editingPromoId) {
      const updated = promos.map((p) =>
        p.id === editingPromoId
          ? {
              ...p,
              code: cleanCode,
              description: promoDesc.trim(),
              discountType: promoDiscountType,
              discountValue: Number(promoDiscountValue),
              minOrder: Number(promoMinOrder),
              expiryDate: promoExpiry
            }
          : p
      );
      setPromos(updated);
      savePromos(updated);
      showToast(`Promo "${cleanCode}" berhasil diperbarui!`);
    } else {
      const newPromo: PromoCode = {
        id: `PROMO-${Date.now().toString().slice(-4)}`,
        code: cleanCode,
        description: promoDesc.trim(),
        discountType: promoDiscountType,
        discountValue: Number(promoDiscountValue),
        minOrderAmount: Number(promoMinOrder),
        minOrder: Number(promoMinOrder),
        status: 'Aktif',
        usageCount: 0,
        expiryDate: promoExpiry
      };
      const updated = [...promos, newPromo];
      setPromos(updated);
      savePromos(updated);
      showToast(`Promo baru "${cleanCode}" berhasil ditambahkan!`);
    }

    setShowPromoModal(false);
  };

  // =========================================================================
  // BACKUP & RESTORE DATABASE JSON
  // =========================================================================
  const handleExportFullBackup = () => {
    try {
      const backupObj = {
        app: 'Steak 11 System',
        version: '2.0',
        exportedAt: new Date().toISOString(),
        locations,
        adminUsers,
        roleSettings,
        waSettings,
        brandingSettings,
        promos
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupObj, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `Steak11_FullBackup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast('✅ Berhasil mengunduh file cadangan database JSON!');
    } catch (err) {
      showToast('Gagal membuat file backup.');
    }
  };

  // Execution delete handler
  const executeDelete = () => {
    if (!deleteConfirmTarget || !checkAdminPermission('menghapus data')) return;
    const { type, id, desc } = deleteConfirmTarget;

    if (type === 'outlet') {
      const updated = locations.filter((l) => l.id !== id);
      setLocations(updated);
      saveLocations(updated);
      showToast(`🗑️ Outlet "${desc}" berhasil dihapus.`);
    } else if (type === 'admin') {
      const updated = adminUsers.filter((a) => a.id !== id);
      setAdminUsers(updated);
      saveAdminUsers(updated);
      showToast(`🗑️ Akun admin "${desc}" berhasil dihapus.`);
    } else if (type === 'promo') {
      const updated = promos.filter((p) => p.id !== id);
      setPromos(updated);
      savePromos(updated);
      showToast(`🗑️ Promo "${desc}" berhasil dihapus.`);
    }

    setDeleteConfirmTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* TAB: OUTLET & CABANG */}
      {/* ========================================================================= */}
      {activeTab === 'outlets' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                Manajemen Lokasi Outlet Cabang Steak 11
              </h3>
              <p className="text-xs text-slate-500">
                Atur alamat outlet, jam kerja operasional shift, dan tautan resto pengiriman online (GoFood, GrabFood, ShopeeFood).
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={handleOpenAddOutlet}
                className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-black text-xs hover:bg-amber-300 shadow-md flex items-center gap-1.5 cursor-pointer shrink-0 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" /> <span>Tambah Outlet</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-400 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100 font-baloo">{loc.name}</h4>
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">{loc.city}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Buka
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{loc.address}</p>

                  <div className="p-3 bg-purple-50/60 dark:bg-purple-950/40 rounded-xl space-y-1 text-[11px]">
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span>🕒 Jam Operasional:</span>
                      <span className="font-bold">{loc.operationalHours}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span>⏰ Batas Shift Kerja:</span>
                      <span className="font-bold text-purple-900 dark:text-amber-300">
                        {loc.startWorkTime || '14:00'} - {loc.endWorkTime || '23:00'} WIB
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-slate-100 dark:border-purple-900/40">
                  {isAdmin && (
                    <button
                      onClick={() => handleOpenEditOutlet(loc)}
                      className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 cursor-pointer"
                      title="Edit Outlet"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {isAdmin && locations.length > 1 && (
                    <button
                      onClick={() => setDeleteConfirmTarget({ type: 'outlet', id: loc.id, desc: loc.name })}
                      className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 cursor-pointer"
                      title="Hapus Outlet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: ADMIN & ROLE PENGGUNA */}
      {/* ========================================================================= */}
      {activeTab === 'pengguna' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                Manajemen Akun Admin &amp; Hak Akses Role
              </h3>
              <p className="text-xs text-slate-500">
                Kelola kredensial akun admin, manager, dan izin akses fitur sistem.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={handleOpenAddAdmin}
                className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-black text-xs hover:bg-amber-300 shadow-md flex items-center gap-1.5 cursor-pointer shrink-0 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" /> <span>Tambah Akun Admin</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminUsers.map((adm) => (
              <div
                key={adm.id}
                className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{adm.name}</h4>
                    <span className="text-[11px] font-mono text-purple-700 dark:text-amber-400">@{adm.username}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300">
                    {adm.role}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500">
                  <span>Outlet: <strong>{adm.outlet || 'Semua Outlet'}</strong></span>
                </div>

                {isAdmin && adm.role !== 'Super Admin' && (
                  <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-purple-900/40">
                    <button
                      onClick={() => setDeleteConfirmTarget({ type: 'admin', id: adm.id, desc: `${adm.name} (@${adm.username})` })}
                      className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 cursor-pointer"
                      title="Hapus Akun Admin"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: PROMO & VOUCHER */}
      {/* ========================================================================= */}
      {activeTab === 'promos' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                <Percent className="w-5 h-5 text-rose-500" />
                Manajemen Kode Promo &amp; Voucher Diskon
              </h3>
              <p className="text-xs text-slate-500">
                Terbitkan kode voucher potongan harga untuk meningkatkan omzet dan transaksi pelanggan.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={handleOpenAddPromo}
                className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-black text-xs hover:bg-amber-300 shadow-md flex items-center gap-1.5 cursor-pointer shrink-0 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" /> <span>Tambah Promo</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promos.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-black text-lg text-purple-950 dark:text-amber-300 font-mono block">
                      {p.code}
                    </span>
                    <span className="text-[11px] text-slate-500">{p.description}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-700">
                    {p.discountType === 'nominal' ? formatRupiah(p.discountValue) : `${p.discountValue}%`} OFF
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 space-y-0.5">
                  <div>• Min. Belanja: {formatRupiah(p.minOrder)}</div>
                  <div>• Berlaku s/d: {p.expiryDate || 'Selamanya'}</div>
                </div>

                {isAdmin && (
                  <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-purple-900/40">
                    <button
                      onClick={() => setDeleteConfirmTarget({ type: 'promo', id: p.id, desc: p.code })}
                      className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 cursor-pointer"
                      title="Hapus Promo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: SISTEM & BACKUP */}
      {/* ========================================================================= */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1f0e30] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-cyan-500" />
              Pusat Cadangan &amp; Pemulihan Basis Data (Full Backup &amp; Restore)
            </h3>
            <p className="text-xs text-slate-500">
              Cadangkan seluruh konfigurasi sistem, data outlet, menu, dan akun pengguna ke file JSON lokal secara aman.
            </p>

            <div className="pt-2">
              <button
                onClick={handleExportFullBackup}
                className="px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> <span>Download Cadangan Basis Data (JSON)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL ADD / EDIT OUTLET */}
      {/* ========================================================================= */}
      {showOutletModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-purple-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg my-auto max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1a0c28] text-slate-800 dark:text-slate-100 rounded-2xl p-5 sm:p-6 shadow-2xl border border-purple-900/50 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-purple-900 pb-3">
              <h3 className="font-extrabold text-lg text-[#3D1259] dark:text-amber-400 font-baloo">
                {editingOutletId ? 'Edit Data Outlet' : 'Tambah Outlet Baru'}
              </h3>
              <button onClick={() => setShowOutletModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="font-bold block mb-1">Nama Outlet:</label>
                <input
                  type="text"
                  value={outletName}
                  onChange={(e) => setOutletName(e.target.value)}
                  placeholder="Steak 11, Cibubur"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Kota:</label>
                <input
                  type="text"
                  value={outletCity}
                  onChange={(e) => setOutletCity(e.target.value)}
                  placeholder="Jakarta Timur"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">No. Telepon / WA:</label>
                <input
                  type="text"
                  value={outletPhone}
                  onChange={(e) => setOutletPhone(e.target.value)}
                  placeholder="081223233299"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-bold block mb-1">Alamat Lengkap:</label>
                <input
                  type="text"
                  value={outletAddress}
                  onChange={(e) => setOutletAddress(e.target.value)}
                  placeholder="Jl. Lapangan Tembak No. 11..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-purple-900">
              <button
                type="button"
                onClick={() => setShowOutletModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveOutlet}
                className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md cursor-pointer"
              >
                Simpan Outlet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL ADD / EDIT ADMIN */}
      {/* ========================================================================= */}
      {showAdminModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-purple-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md my-auto bg-white dark:bg-[#1a0c28] text-slate-800 dark:text-slate-100 rounded-2xl p-5 sm:p-6 shadow-2xl border border-purple-900/50 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-purple-900 pb-3">
              <h3 className="font-extrabold text-lg text-[#3D1259] dark:text-amber-400 font-baloo">
                {editingAdminId ? 'Edit Akun Admin' : 'Tambah Akun Admin'}
              </h3>
              <button onClick={() => setShowAdminModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Andry Maulana"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Username Login:</label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="andry_admin"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-mono font-bold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Password:</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder={editingAdminId ? '(Biarkan kosong jika tidak diubah)' : '••••••••'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-mono"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Role / Peran:</label>
                <select
                  value={adminRole}
                  onChange={(e) => setAdminRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold"
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager Outlet">Manager Outlet</option>
                  <option value="Kasir">Kasir</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-purple-900">
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveAdminUser}
                className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md cursor-pointer"
              >
                Simpan Akun
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL ADD / EDIT PROMO */}
      {/* ========================================================================= */}
      {showPromoModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-purple-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md my-auto bg-white dark:bg-[#1a0c28] text-slate-800 dark:text-slate-100 rounded-2xl p-5 sm:p-6 shadow-2xl border border-purple-900/50 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-purple-900 pb-3">
              <h3 className="font-extrabold text-lg text-[#3D1259] dark:text-amber-400 font-baloo">
                {editingPromoId ? 'Edit Kode Promo' : 'Tambah Promo Baru'}
              </h3>
              <button onClick={() => setShowPromoModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Kode Voucher (Kapital):</label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="STEAK11MANTAP"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-mono font-black"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Deskripsi:</label>
                <input
                  type="text"
                  value={promoDesc}
                  onChange={(e) => setPromoDesc(e.target.value)}
                  placeholder="Diskon Rp 5.000..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Tipe Diskon:</label>
                  <select
                    value={promoDiscountType}
                    onChange={(e) => setPromoDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold"
                  >
                    <option value="nominal">Nominal Rp</option>
                    <option value="percentage">Persentase %</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Nilai Diskon:</label>
                  <input
                    type="number"
                    value={promoDiscountValue}
                    onChange={(e) => setPromoDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold text-rose-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-purple-900">
              <button
                type="button"
                onClick={() => setShowPromoModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSavePromo}
                className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md cursor-pointer"
              >
                Simpan Promo
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
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">Hapus Data</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{deleteConfirmTarget.desc}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-purple-950/50 p-3 rounded-xl border border-slate-200 dark:border-purple-900">
              Tindakan ini tidak dapat dibatalkan.
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
