import { OrderItem, Employee, AttendanceRecord, PayrollSlip, LocationItem, MenuItem, ChickenOption, SauceOption, AddonOption, AdminUser, RoleSetting, WaNotificationSettings, StoreBrandingSettings, InventoryItem, PromoVoucher, CashierShiftRecord, ReviewItem, Supplier, PurchaseOrder, PettyCashExpense, MenuRecipe, StockOpnameLog, StockTransfer, PaymentMethodSettings, ReceiptSettings, AuditLogItem, StockMutation, Customer, WaGatewayConfig, WorkShiftTemplate, EmployeeSchedule, EmployeeLoan, MonthlyDeductionItem } from './types';
import {
  DEFAULT_ORDERS,
  DEFAULT_GAS_URL,
  DEFAULT_EMPLOYEES,
  DEFAULT_ATTENDANCE,
  DEFAULT_PAYROLL,
  LOCATIONS,
  MENU_ITEMS,
  DEFAULT_MENU_CATEGORIES,
  CHICKEN_OPTIONS,
  SAUCE_OPTIONS,
  ADDON_OPTIONS,
  DEFAULT_ADMINS,
  DEFAULT_ROLE_SETTINGS,
  DEFAULT_WA_SETTINGS,
  DEFAULT_BRANDING,
  DEFAULT_INVENTORY,
  DEFAULT_PROMOS,
  DEFAULT_CASHIER_SHIFTS,
  REVIEWS,
  DEFAULT_SUPPLIERS,
  DEFAULT_PURCHASE_ORDERS,
  DEFAULT_EXPENSES,
  DEFAULT_RECIPES,
  DEFAULT_STOCK_OPNAMES,
  DEFAULT_STOCK_TRANSFERS,
  DEFAULT_AUDIT_LOGS,
  DEFAULT_STOCK_MUTATIONS,
  DEFAULT_CUSTOMERS,
  DEFAULT_WA_GATEWAY_CONFIG,
  DEFAULT_SHIFT_TEMPLATES,
  DEFAULT_EMPLOYEE_LOANS
} from './data/initialData';
import {
  syncUserDataToFirestore,
  syncAllMenuItemsToFirebase,
  syncAllRacikOptionsToFirebase,
  syncAllCategoriesToFirebase,
  syncEntireMenuDataToFirebase,
  syncAllOrdersToFirebase,
  syncAllAttendanceToFirebase,
  syncAllCustomersToFirebase,
  syncAllEmployeesToFirebase,
  syncAllAdminsToFirebase,
  syncAllPayrollToFirebase,
  syncAllInventoryToFirebase,
  syncAllExpensesToFirebase,
  syncAllPromosToFirebase,
  syncAllReviewsToFirebase,
  syncAllSuppliersToFirebase,
  syncAllPurchaseOrdersToFirebase,
  syncAllLocationsToFirebase,
  pushAllLocalDataToFirestore
} from './lib/firebaseServices';

export const SYSTEM_ALL_TABS = [
  { id: 'dashboard', name: 'Dashboard Utama' },
  { id: 'kasir', name: 'Kasir POS' },
  { id: 'pesanan', name: 'Daftar Pesanan' },
  { id: 'analytics', name: 'Analisis Keuangan' },
  { id: 'menu', name: 'Daftar Menu' },
  { id: 'racik', name: 'Racikan' },
  { id: 'inventory', name: 'Manajemen Stok' },
  { id: 'suppliers', name: 'Pemasok & Supplier' },
  { id: 'purchase_orders', name: 'Purchase Order (PO)' },
  { id: 'reviews', name: 'Ulasan Pelanggan' },
  { id: 'promos', name: 'Voucher & Kode Promo' },
  { id: 'karyawan', name: 'Data Karyawan' },
  { id: 'absensi', name: 'Rekap Presensi Digital' },
  { id: 'presensi_kamera', name: 'Presensi Kamera Selfie' },
  { id: 'jadwal', name: 'Jadwal Shift Kerja' },
  { id: 'penggajian', name: 'Penggajian' },
  { id: 'shifts', name: 'Audit Closing Shift' },
  { id: 'expenses', name: 'Laporan Keuangan' },
  { id: 'outlets', name: 'Outlet & Shift Rules' },
  { id: 'admin', name: 'Admin System' },
  { id: 'wa', name: 'Notifikasi WhatsApp' },
  { id: 'branding', name: 'Identitas & Branding' },
  { id: 'system', name: 'Integrasi & System' },
  { id: 'payment_receipt_settings', name: 'Pembayaran & Struk' },
  { id: 'audit_logs', name: 'Audit Log Aktivitas' },
  { id: 'customers', name: 'Data Pelanggan & WA' },
  { id: 'pengunjung', name: 'Data Pengunjung' },
  { id: 'sop', name: 'SOP' },
  { id: 'user_guide', name: 'Panduan Penggunaan' },
];

export function getTabDisplayName(tabId: string): string {
  const match = SYSTEM_ALL_TABS.find((t) => t.id === tabId);
  return match ? match.name : tabId;
}

export function formatRupiah(val: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val);
}

// --- MENU ITEMS STORAGE ---
export function getStoredMenuItems(): MenuItem[] {
  const stored = localStorage.getItem('steak11_menu_items');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return MENU_ITEMS;
}

export function saveMenuItems(items: MenuItem[]): void {
  localStorage.setItem('steak11_menu_items', JSON.stringify(items));
  window.dispatchEvent(new Event('menu_items_updated'));
  syncAllMenuItemsToFirebase(items);
}

// --- RACIK STEAK OPTIONS STORAGE ---
export function getStoredChickenOptions(): ChickenOption[] {
  const stored = localStorage.getItem('steak11_chicken_options');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return CHICKEN_OPTIONS;
}

export function saveChickenOptions(items: ChickenOption[]): void {
  localStorage.setItem('steak11_chicken_options', JSON.stringify(items));
  window.dispatchEvent(new Event('racik_options_updated'));
  syncAllRacikOptionsToFirebase(items, getStoredSauceOptions(), getStoredAddonOptions());
}

export function getStoredSauceOptions(): SauceOption[] {
  const stored = localStorage.getItem('steak11_sauce_options');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return SAUCE_OPTIONS;
}

export function saveSauceOptions(items: SauceOption[]): void {
  localStorage.setItem('steak11_sauce_options', JSON.stringify(items));
  window.dispatchEvent(new Event('racik_options_updated'));
  syncAllRacikOptionsToFirebase(getStoredChickenOptions(), items, getStoredAddonOptions());
}

export function getStoredAddonOptions(): AddonOption[] {
  const stored = localStorage.getItem('steak11_addon_options');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return ADDON_OPTIONS;
}

export function saveAddonOptions(items: AddonOption[]): void {
  localStorage.setItem('steak11_addon_options', JSON.stringify(items));
  window.dispatchEvent(new Event('racik_options_updated'));
  syncAllRacikOptionsToFirebase(getStoredChickenOptions(), getStoredSauceOptions(), items);
}

// --- LOCATIONS & SHIFT RULES STORAGE ---
export function getStoredLocations(): LocationItem[] {
  const stored = localStorage.getItem('steak11_locations');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return LOCATIONS;
}

export function saveLocations(locations: LocationItem[]): void {
  localStorage.setItem('steak11_locations', JSON.stringify(locations));
  window.dispatchEvent(new Event('locations_updated'));
  syncAllLocationsToFirebase(locations);
}

export function getStoredOrders(): OrderItem[] {
  const stored = localStorage.getItem('steak11_orders');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return DEFAULT_ORDERS;
}

export function saveOrders(orders: OrderItem[]): void {
  localStorage.setItem('steak11_orders', JSON.stringify(orders));
  window.dispatchEvent(new Event('orders_updated'));
  syncAllOrdersToFirebase(orders);
}

export function getStoredGasUrl(): string {
  const url = localStorage.getItem('steak11_gas_url');
  if (!url || url.includes('AKfycbylN78TAa_yPOGuEdC1HNDxn67s4uTkW5aOe5oTMdOAUDcVFPrujYInKQC8-6H36C8')) {
    return DEFAULT_GAS_URL;
  }
  return url;
}

export function saveStoredGasUrl(url: string): void {
  localStorage.setItem('steak11_gas_url', url);
  window.dispatchEvent(new Event('gas_url_updated'));
  syncUserDataToFirestore('gas_url', url);
}

// --- EMPLOYEE MANAGEMENT STORAGE ---
export function getStoredEmployees(): Employee[] {
  const stored = localStorage.getItem('steak11_employees');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return DEFAULT_EMPLOYEES;
}

export function saveEmployees(employees: Employee[]): void {
  localStorage.setItem('steak11_employees', JSON.stringify(employees));
  window.dispatchEvent(new Event('employees_updated'));
  syncAllEmployeesToFirebase(employees);
}

// --- DATE HELPERS ---
export function getLocalDateStr(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// --- ATTENDANCE STORAGE ---
export function getStoredAttendance(): AttendanceRecord[] {
  const stored = localStorage.getItem('steak11_attendance');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
}

export function saveAttendance(records: AttendanceRecord[]): void {
  const sorted = [...records].sort((a, b) => {
    const dateA = `${a.date} ${a.clockInTime || '00:00:00'}`;
    const dateB = `${b.date} ${b.clockInTime || '00:00:00'}`;
    return dateB.localeCompare(dateA);
  });

  try {
    localStorage.setItem('steak11_attendance', JSON.stringify(sorted));
    localStorage.setItem('steak11_attendance_save_time', Date.now().toString());
  } catch (err) {
    console.warn('LocalStorage quota warning for attendance, trimming large selfies:', err);
    try {
      // If quota exceeded, preserve the last 10 selfies and strip older heavy base64 strings from local storage
      const lightweight = sorted.map((rec, idx) => ({
        ...rec,
        selfieUrl: idx < 10 ? rec.selfieUrl : undefined,
        clockOutSelfieUrl: idx < 10 ? rec.clockOutSelfieUrl : undefined
      }));
      localStorage.setItem('steak11_attendance', JSON.stringify(lightweight));
    } catch {}
  }
  window.dispatchEvent(new Event('attendance_updated'));
  syncAllAttendanceToFirebase(sorted);
}

// --- PAYROLL STORAGE ---
export function getStoredPayroll(): PayrollSlip[] {
  const stored = localStorage.getItem('steak11_payroll');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return DEFAULT_PAYROLL;
}

export function savePayroll(slips: PayrollSlip[]): void {
  localStorage.setItem('steak11_payroll', JSON.stringify(slips));
  window.dispatchEvent(new Event('payroll_updated'));
  syncAllPayrollToFirebase(slips);
}

/**
 * Calculates start, end, payment date and human labels for a payroll cutoff cycle.
 * Default mode: 'CUTOFF_25' (25th of previous month to 24th of current month, pay day on 25th)
 */
export function getPayrollCutoffDates(
  periodMonth: string,
  mode: 'CUTOFF_25' | 'CALENDAR_MONTH' | 'CUSTOM' = 'CUTOFF_25',
  customStart?: string,
  customEnd?: string,
  customPayDate?: string
): {
  startDate: string;
  endDate: string;
  paymentDate: string;
  periodLabel: string;
  cutoffRangeLabel: string;
  monthName: string;
} {
  const [yearStr, monthStr] = (periodMonth || new Date().toISOString().substring(0, 7)).split('-');
  const year = parseInt(yearStr, 10) || new Date().getFullYear();
  const month = parseInt(monthStr, 10) || (new Date().getMonth() + 1); // 1-12

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const shortMonthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  const currentMonthName = monthNames[month - 1] || 'Bulan';

  if (mode === 'CUSTOM' && customStart && customEnd) {
    return {
      startDate: customStart,
      endDate: customEnd,
      paymentDate: customPayDate || customEnd,
      periodLabel: `${currentMonthName} ${year} (Custom)`,
      cutoffRangeLabel: `${customStart} s/d ${customEnd}`,
      monthName: currentMonthName
    };
  }

  if (mode === 'CALENDAR_MONTH') {
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;
    const paymentDate = endDate;
    return {
      startDate,
      endDate,
      paymentDate,
      periodLabel: `${currentMonthName} ${year}`,
      cutoffRangeLabel: `01 ${shortMonthNames[month - 1]} - ${lastDayOfMonth} ${shortMonthNames[month - 1]} ${year}`,
      monthName: currentMonthName
    };
  }

  // CUTOFF_25: 25th of previous month to 24th of current month
  let prevYear = year;
  let prevMonth = month - 1;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear = year - 1;
  }

  const startDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-25`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-24`;
  const paymentDate = `${year}-${String(month).padStart(2, '0')}-25`;

  const prevMonthShort = shortMonthNames[prevMonth - 1];
  const curMonthShort = shortMonthNames[month - 1];

  return {
    startDate,
    endDate,
    paymentDate,
    periodLabel: `${currentMonthName} ${year} (Cut-off 25)`,
    cutoffRangeLabel: `${prevYear !== year ? `25 ${prevMonthShort} ${prevYear}` : `25 ${prevMonthShort}`} – 24 ${curMonthShort} ${year}`,
    monthName: currentMonthName
  };
}

// --- MENU CATEGORIES STORAGE ---
export function getStoredMenuCategories(): { id: string; name: string; description: string }[] {
  const stored = localStorage.getItem('steak11_menu_categories');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return DEFAULT_MENU_CATEGORIES;
}

export function saveMenuCategories(categories: { id: string; name: string; description: string }[]): void {
  localStorage.setItem('steak11_menu_categories', JSON.stringify(categories));
  window.dispatchEvent(new Event('menu_categories_updated'));
  syncAllCategoriesToFirebase(categories);
}

export async function syncAllLocalMenuToFirebase(): Promise<void> {
  await pushAllLocalDataToFirestore().catch(() => {});
}

// --- ADMIN USERS STORAGE ---
export function getStoredAdmins(): AdminUser[] {
  const stored = localStorage.getItem('steak11_admins');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return [];
    }
  }
  return DEFAULT_ADMINS;
}

export function saveAdmins(admins: AdminUser[]): void {
  localStorage.setItem('steak11_admins', JSON.stringify(admins));
  window.dispatchEvent(new Event('admins_updated'));
  syncAllAdminsToFirebase(admins);
}

// --- ROLE & JABATAN MENU SETTINGS STORAGE ---
export function getStoredRoleSettings(): RoleSetting[] {
  const stored = localStorage.getItem('steak11_role_settings');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return [];
    }
  }
  return DEFAULT_ROLE_SETTINGS;
}

export function saveRoleSettings(roles: RoleSetting[]): void {
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  const uniqueRoles: RoleSetting[] = [];

  for (const role of roles) {
    if (!role || !role.id || !role.name) continue;
    const cleanId = role.id.trim();
    const cleanName = role.name.trim().toLowerCase();

    if (!seenIds.has(cleanId) && !seenNames.has(cleanName)) {
      seenIds.add(cleanId);
      seenNames.add(cleanName);
      uniqueRoles.push({
        ...role,
        name: role.name.trim()
      });
    }
  }

  localStorage.setItem('steak11_role_settings', JSON.stringify(uniqueRoles));
  window.dispatchEvent(new Event('role_settings_updated'));
  syncUserDataToFirestore('role_settings', uniqueRoles);
}

// --- UNIFIED USER & AUTH ACCOUNTS STORAGE (1 DATA MODEL) ---
export interface UnifiedUser {
  id: string;
  name: string;
  username: string;
  role: string;
  outlet: string;
  phone: string;
  pinOrPass: string;
  type: 'employee' | 'admin';
  allowedTabs?: string[];
  status: 'Aktif' | 'Non-Aktif';
}

export function getUnifiedUsers(): UnifiedUser[] {
  const employees = getStoredEmployees() || [];
  const admins = getStoredAdmins() || [];

  const unifiedList: UnifiedUser[] = [];

  // Add Employees
  employees.forEach((emp) => {
    unifiedList.push({
      id: emp.id,
      name: emp.name,
      username: (emp.username || emp.id).toLowerCase(),
      role: emp.role,
      outlet: emp.outlet || 'Steak 11, Kalisari',
      phone: emp.phone || '',
      pinOrPass: emp.pin,
      type: 'employee',
      allowedTabs: emp.allowedTabs || ['kasir', 'pesanan', 'shifts', 'inventory', 'absensi', 'presensi_kamera', 'jadwal'],
      status: emp.status || 'Aktif'
    });
  });

  // Add Admins (if not matching existing ID/name)
  admins.forEach((adm) => {
    const exists = unifiedList.some(
      (u) => u.id === adm.id || u.name.toLowerCase() === adm.fullName.toLowerCase()
    );
    if (!exists) {
      const isSuperAdmin = (adm.role || '').toLowerCase() === 'super admin';
      unifiedList.push({
        id: adm.id,
        name: adm.fullName,
        username: adm.username,
        role: adm.role,
        outlet: 'Semua Outlet (HQ)',
        phone: adm.phone || '',
        pinOrPass: adm.passwordPin,
        type: 'admin',
        allowedTabs: isSuperAdmin
          ? SYSTEM_ALL_TABS.map((t) => t.id)
          : (adm.allowedTabs || [
              'dashboard', 'kasir', 'pesanan', 'analytics', 'menu', 'racik', 'inventory',
              'suppliers', 'purchase_orders', 'reviews', 'promos', 'karyawan', 'absensi',
              'presensi_kamera', 'jadwal', 'penggajian', 'shifts', 'expenses', 'outlets', 'admin', 'wa',
              'branding', 'system', 'payment_receipt_settings', 'audit_logs', 'customers', 'pengunjung', 'user_guide'
            ]),
        status: adm.status === 'Non-Aktif' ? 'Non-Aktif' : 'Aktif'
      });
    }
  });

  return unifiedList;
}

export function isRegisteredAdmin(user?: { name?: string; role?: string; username?: string; id?: string } | null): boolean {
  if (!user || !user.role) return false;
  const roleLower = user.role.trim().toLowerCase();

  // Explicitly deny non-admin roles
  if (
    roleLower === 'pengunjung' ||
    roleLower.includes('pengunjung') ||
    roleLower === 'kasir' ||
    roleLower === 'waitress' ||
    roleLower === 'barista' ||
    roleLower === 'chef' ||
    roleLower.includes('cook') ||
    roleLower.includes('dapur')
  ) {
    return false;
  }

  // Admin roles allowed: Super Admin, Owner, Admin, Manager Outlet
  if (
    roleLower.includes('super') ||
    roleLower.includes('owner') ||
    roleLower.includes('admin') ||
    roleLower.includes('manager')
  ) {
    return true;
  }

  return false;
}

// --- WA NOTIFICATION SETTINGS STORAGE ---
export function getStoredWaSettings(): WaNotificationSettings {
  const stored = localStorage.getItem('steak11_wa_settings');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch {
      return DEFAULT_WA_SETTINGS;
    }
  }
  return DEFAULT_WA_SETTINGS;
}

export function saveWaSettings(settings: WaNotificationSettings): void {
  localStorage.setItem('steak11_wa_settings', JSON.stringify(settings));
  window.dispatchEvent(new Event('wa_settings_updated'));
  syncUserDataToFirestore('wa_settings', settings);
}

// --- STORE BRANDING SETTINGS STORAGE ---
export function getStoredBranding(): StoreBrandingSettings {
  const stored = localStorage.getItem('steak11_branding');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_BRANDING, ...parsed };
      }
    } catch {
      return DEFAULT_BRANDING;
    }
  }
  return DEFAULT_BRANDING;
}

export function saveBranding(branding: StoreBrandingSettings): void {
  localStorage.setItem('steak11_branding', JSON.stringify(branding));
  localStorage.setItem('steak11_branding_save_time', Date.now().toString());
  window.dispatchEvent(new Event('branding_updated'));
  syncUserDataToFirestore('branding', branding);
}

// --- LATE PENALTY THRESHOLD SETTINGS STORAGE ---
export function getStoredLatePenaltyThreshold(): number {
  const stored = localStorage.getItem('steak11_late_penalty_threshold');
  if (stored !== null) {
    const val = Number(stored);
    if (!isNaN(val) && val >= 0) return val;
  }
  return 30; // Default 30 minutes threshold
}

export function saveLatePenaltyThreshold(minutes: number): void {
  localStorage.setItem('steak11_late_penalty_threshold', String(minutes));
  window.dispatchEvent(new Event('late_penalty_threshold_updated'));
  syncUserDataToFirestore('late_penalty_threshold', minutes);
}

export const getMonthlyLatePenaltyThreshold = getStoredLatePenaltyThreshold;

export function calculateLateDeduction(lateMinutes: number, penaltyPerDay: number = 15000, thresholdMinutes: number = 15): number {
  return lateMinutes > thresholdMinutes ? penaltyPerDay : 0;
}

// --- OVERTIME RATE SETTINGS STORAGE ---
export function getStoredOvertimeRate(): number {
  const stored = localStorage.getItem('steak11_default_overtime_rate');
  if (stored !== null) {
    const val = Number(stored);
    if (!isNaN(val) && val >= 0) return val;
  }
  return 15000; // Default Rp 15.000 / jam
}

export function saveOvertimeRate(rate: number): void {
  localStorage.setItem('steak11_default_overtime_rate', String(rate));
  window.dispatchEvent(new Event('overtime_rate_updated'));
  syncUserDataToFirestore('overtime_rate', rate);
}

// --- INVENTORY STORAGE ---
export function getStoredInventory(): InventoryItem[] {
  const stored = localStorage.getItem('steak11_inventory');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return DEFAULT_INVENTORY;
}

export function saveInventory(items: InventoryItem[]): void {
  localStorage.setItem('steak11_inventory', JSON.stringify(items));
  window.dispatchEvent(new Event('inventory_updated'));
  syncAllInventoryToFirebase(items);
}

// --- PROMOS STORAGE ---
export function getStoredPromos(): PromoVoucher[] {
  const stored = localStorage.getItem('steak11_promos');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return DEFAULT_PROMOS;
}

export function savePromos(promos: PromoVoucher[]): void {
  localStorage.setItem('steak11_promos', JSON.stringify(promos));
  window.dispatchEvent(new Event('promos_updated'));
  syncAllPromosToFirebase(promos);
}

// --- CASHIER SHIFTS STORAGE ---
export function getStoredCashierShifts(): CashierShiftRecord[] {
  const stored = localStorage.getItem('steak11_cashier_shifts');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.filter((s: CashierShiftRecord) => s.id !== 'SHF-20260810-01');
      }
    } catch {
      return [];
    }
  }
  return DEFAULT_CASHIER_SHIFTS;
}

export function saveCashierShifts(shifts: CashierShiftRecord[]): void {
  localStorage.setItem('steak11_cashier_shifts', JSON.stringify(shifts));
  window.dispatchEvent(new Event('cashier_shifts_updated'));
  syncUserDataToFirestore('cashier_shifts', shifts);
}

// --- REVIEWS & TESTIMONIALS STORAGE ---
export function getStoredReviews(): ReviewItem[] {
  const stored = localStorage.getItem('steak11_reviews');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const seen = new Set<string>();
        const unique: ReviewItem[] = [];
        for (const item of parsed) {
          const key = item.id || `${item.name}-${item.comment}`;
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(item);
          }
        }
        return unique;
      }
    } catch {
      return [];
    }
  }
  return REVIEWS;
}

export function saveReviews(reviews: ReviewItem[]): void {
  localStorage.setItem('steak11_reviews', JSON.stringify(reviews));
  window.dispatchEvent(new Event('reviews_updated'));
  syncAllReviewsToFirebase(reviews);
}

// --- SUPPLIERS STORAGE ---
export function getStoredSuppliers(): Supplier[] {
  const stored = localStorage.getItem('steak11_suppliers');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return DEFAULT_SUPPLIERS;
}

export function saveSuppliers(suppliers: Supplier[]): void {
  localStorage.setItem('steak11_suppliers', JSON.stringify(suppliers));
  window.dispatchEvent(new Event('suppliers_updated'));
  syncAllSuppliersToFirebase(suppliers);
}

// --- PURCHASE ORDERS STORAGE ---
export function getStoredPurchaseOrders(): PurchaseOrder[] {
  const stored = localStorage.getItem('steak11_purchase_orders');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return DEFAULT_PURCHASE_ORDERS;
}

export function savePurchaseOrders(orders: PurchaseOrder[]): void {
  localStorage.setItem('steak11_purchase_orders', JSON.stringify(orders));
  window.dispatchEvent(new Event('purchase_orders_updated'));
  syncAllPurchaseOrdersToFirebase(orders);
}

// --- PETTY CASH EXPENSES STORAGE ---
export function getStoredExpenses(): PettyCashExpense[] {
  const stored = localStorage.getItem('steak11_expenses');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (e: PettyCashExpense) =>
            e.id !== 'EXP-20260810-001' &&
            e.id !== 'EXP-20260810-002' &&
            e.shiftId !== 'SHF-20260810-01'
        );
      }
    } catch {
      return [];
    }
  }
  return DEFAULT_EXPENSES;
}

export function saveExpenses(expenses: PettyCashExpense[]): void {
  localStorage.setItem('steak11_expenses', JSON.stringify(expenses));
  window.dispatchEvent(new Event('expenses_updated'));
  syncAllExpensesToFirebase(expenses);
}

// --- MENU RECIPES (BOM) STORAGE ---
export function getStoredRecipes(): MenuRecipe[] {
  const stored = localStorage.getItem('steak11_menu_recipes') ?? localStorage.getItem('steak11_recipes');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return DEFAULT_RECIPES;
}

export function saveRecipes(recipes: MenuRecipe[]): void {
  localStorage.setItem('steak11_menu_recipes', JSON.stringify(recipes));
  localStorage.setItem('steak11_recipes', JSON.stringify(recipes));
  window.dispatchEvent(new Event('recipes_updated'));
  syncUserDataToFirestore('recipes', recipes);
}


// --- STOCK OPNAME LOGS STORAGE ---
export function getStoredStockOpnames(): StockOpnameLog[] {
  const stored = localStorage.getItem('steak11_stock_opnames');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return DEFAULT_STOCK_OPNAMES;
}

export function saveStockOpnames(logs: StockOpnameLog[]): void {
  localStorage.setItem('steak11_stock_opnames', JSON.stringify(logs));
  window.dispatchEvent(new Event('stock_opnames_updated'));
  syncUserDataToFirestore('stock_opnames', logs);
}

// --- STOCK TRANSFERS STORAGE ---
export function getStoredStockTransfers(): StockTransfer[] {
  const stored = localStorage.getItem('steak11_stock_transfers');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return DEFAULT_STOCK_TRANSFERS;
}

export function saveStockTransfers(transfers: StockTransfer[]): void {
  localStorage.setItem('steak11_stock_transfers', JSON.stringify(transfers));
  window.dispatchEvent(new Event('stock_transfers_updated'));
  syncUserDataToFirestore('stock_transfers', transfers);
}

// --- PAYMENT METHOD SETTINGS STORAGE ---
export const DEFAULT_PAYMENT_SETTINGS: PaymentMethodSettings = {
  qris: {
    enabled: true,
    merchantName: 'Steak 11 Official QRIS',
    nmid: 'ID10200300405011',
    qrisImageUrl: 'https://i.ibb.co/zWhxV6Bp/Gemini-Generated-Image-vvqchqvvqchqvvqc.png',
    instructions: 'Scan QRIS menggunakan BCA, Mandiri, GoPay, OVO, ShopeePay, DANA, atau LinkAja.',
  },
  transfer: {
    enabled: true,
    bankName: 'BCA',
    accountNumber: '8830-1122-33',
    accountHolder: 'PT STEAK SEBELAS NUSANTARA',
    instructions: 'Transfer tepat sesuai nominal dan tunjukkan bukti transfer ke kasir.',
  },
  debit: {
    enabled: true,
    bankName: 'BCA / Mandiri / BRI',
    terminalId: 'TID-88192301',
    instructions: 'Gesek atau Tap Kartu Debit / Kredit pada Mesin EDC Kasir.',
  },
  cash: {
    enabled: true,
    defaultStartingCash: 200000,
    quickCashPresets: [10000, 20000, 50000, 100000],
  },
};

export function getStoredPaymentSettings(): PaymentMethodSettings {
  const stored = localStorage.getItem('steak11_payment_settings');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') {
        return {
          qris: { ...DEFAULT_PAYMENT_SETTINGS.qris, ...(parsed.qris || {}) },
          transfer: { ...DEFAULT_PAYMENT_SETTINGS.transfer, ...(parsed.transfer || {}) },
          debit: { ...DEFAULT_PAYMENT_SETTINGS.debit, ...(parsed.debit || {}) },
          cash: { ...DEFAULT_PAYMENT_SETTINGS.cash, ...(parsed.cash || {}) },
        };
      }
    } catch {
      return DEFAULT_PAYMENT_SETTINGS;
    }
  }
  return DEFAULT_PAYMENT_SETTINGS;
}

export function savePaymentSettings(settings: PaymentMethodSettings): void {
  localStorage.setItem('steak11_payment_settings', JSON.stringify(settings));
  window.dispatchEvent(new Event('payment_settings_updated'));
  syncUserDataToFirestore('payment_settings', settings);
}

// --- THERMAL RECEIPT SETTINGS STORAGE ---
export const DEFAULT_RECEIPT_SETTINGS: ReceiptSettings = {
  brandTitle: 'STEAK 11',
  tagline: 'MYTHIC CHICKEN TASTE - STEAK AYAM 20K',
  address: 'Jl. Raya Cibubur No. 11 / Transyogi, Jakarta Timur',
  phone: '0812-1111-1111',
  paperWidth: '58mm',
  logoSize: 'large',
  showOutletLocation: true,
  receiptPrefix: 'ORD-',
  receiptNextNumber: 1,
  showDateInReceiptNo: false,
  showCashierName: true,
  showCustomerName: true,
  showTableNumber: true,
  showServiceType: true,
  showTax: true,
  showDiscount: true,
  showFooterPromo: true,
  footerThankYouMessage: 'TERIMA KASIH ATAS KUNJUNGAN ANDA!',
  footerPromoText: 'Simpan Struk Ini Untuk Promo Diskon 10% Kunjungan Berikutnya!',
  socialMediaText: 'Instagram & TikTok: @steak11.official',
  showWifiInfo: false,
  wifiName: 'Steak11_FreeWifi',
  wifiPassword: 'steak11lezat',
  showCustomNotes: false,
  customNotesText: '*Struk ini adalah bukti pembayaran yang sah.',
  printerConnectionType: 'system_dialog',
  connectedBluetoothName: '',
  connectedBluetoothDeviceId: '',
  connectedUsbName: '',
  networkPrinterIp: '192.168.1.200',
  networkPrinterPort: 9100,
  autoCutPaper: true,
  openCashDrawer: false,
  printCopies: 1,
};

export function getStoredReceiptSettings(outletName?: string): ReceiptSettings {
  if (outletName && outletName !== 'ALL') {
    const key = `steak11_receipt_settings_${outletName.replace(/\s+/g, '_')}`;
    const storedOutlet = localStorage.getItem(key);
    if (storedOutlet) {
      try {
        return { ...DEFAULT_RECEIPT_SETTINGS, ...JSON.parse(storedOutlet) };
      } catch {
        // Fallback
      }
    }
  }

  const stored = localStorage.getItem('steak11_receipt_settings');
  if (stored !== null) {
    try {
      return { ...DEFAULT_RECEIPT_SETTINGS, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_RECEIPT_SETTINGS;
    }
  }
  return DEFAULT_RECEIPT_SETTINGS;
}

export function saveReceiptSettings(settings: ReceiptSettings, outletName?: string): void {
  if (outletName && outletName !== 'ALL') {
    const key = `steak11_receipt_settings_${outletName.replace(/\s+/g, '_')}`;
    localStorage.setItem(key, JSON.stringify({ ...settings, outletName }));
  } else {
    localStorage.setItem('steak11_receipt_settings', JSON.stringify(settings));
  }
  window.dispatchEvent(new Event('receipt_settings_updated'));
  syncUserDataToFirestore('receipt_settings', settings);
}

export function getNextReceiptNumber(outletName?: string): string {
  const cfg = getStoredReceiptSettings(outletName);
  const prefix = cfg.receiptPrefix || 'ORD-';
  const currentNum = typeof cfg.receiptNextNumber === 'number' ? cfg.receiptNextNumber : 1;
  const showDate = cfg.showDateInReceiptNo ?? false;

  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const paddedNum = String(currentNum).padStart(4, '0');

  // Increment counter for next time
  const updatedCfg = {
    ...cfg,
    receiptNextNumber: currentNum + 1,
  };
  saveReceiptSettings(updatedCfg, outletName);

  if (showDate) {
    return `${prefix}${todayStr}-${paddedNum}`;
  }
  return `${prefix}${paddedNum}`;
}

// --- AUDIT LOGS STORAGE ---
export function getStoredAuditLogs(): AuditLogItem[] {
  const stored = localStorage.getItem('steak11_audit_logs');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return DEFAULT_AUDIT_LOGS;
}

export function saveAuditLogs(logs: AuditLogItem[]): void {
  try {
    localStorage.setItem('steak11_audit_logs', JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save audit logs to localStorage:', err);
  }
  window.dispatchEvent(new Event('audit_logs_updated'));
  syncUserDataToFirestore('audit_logs', logs);
}

export function recordAuditLog(log: Omit<AuditLogItem, 'id' | 'timestamp' | 'date'> & { id?: string; timestamp?: string; date?: string }): void {
  try {
    const existing = getStoredAuditLogs();
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const dateStr = now.toISOString().split('T')[0];
    const idStr = `AUD-${dateStr.replace(/-/g, '')}-${Date.now().toString().slice(-4)}`;

    const newLog: AuditLogItem = {
      id: log.id || idStr,
      timestamp: log.timestamp || `${dateStr} ${timeStr}`,
      date: log.date || dateStr,
      user: log.user || 'Admin / Kasir',
      role: log.role || 'Kasir',
      outlet: log.outlet || 'Steak 11, Cibubur',
      category: log.category,
      action: log.action,
      details: log.details,
      status: log.status || 'Berhasil',
      ipAddress: log.ipAddress || '127.0.0.1'
    };

    const updated = [newLog, ...existing].slice(0, 500);
    saveAuditLogs(updated);
  } catch (err) {
    console.error('Error recording audit log:', err);
  }
}

// --- STOCK MUTATION / KARTU STOK STORAGE ---
export function getStoredStockMutations(): StockMutation[] {
  const stored = localStorage.getItem('steak11_stock_mutations');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return DEFAULT_STOCK_MUTATIONS;
}

export function saveStockMutations(mutations: StockMutation[]): void {
  localStorage.setItem('steak11_stock_mutations', JSON.stringify(mutations));
  window.dispatchEvent(new Event('stock_mutations_updated'));
  syncUserDataToFirestore('stock_mutations', mutations);
}

// --- CUSTOMERS / DATA PELANGGAN STORAGE ---
export function getStoredCustomers(): Customer[] {
  const stored = localStorage.getItem('steak11_customers');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return DEFAULT_CUSTOMERS;
}

export function saveCustomers(customers: Customer[]): void {
  localStorage.setItem('steak11_customers', JSON.stringify(customers));
  window.dispatchEvent(new Event('customers_updated'));
  syncAllCustomersToFirebase(customers);
}

export function syncCustomersFromOrders(): Customer[] {
  const currentCustomers = getStoredCustomers();
  const currentOrders = getStoredOrders();

  const customerMap = new Map<string, Customer>();
  currentCustomers.forEach((c) => {
    const cleanPhone = (c.phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone) {
      customerMap.set(cleanPhone, {
        ...c,
        totalOrders: 0,
        totalSpent: 0,
        loyaltyPoints: 0,
        lastOrderDate: ''
      });
    }
  });

  currentOrders.forEach((o) => {
    if (!o.phone) return;
    const cleanPhone = o.phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) return;

    const totalAmt = Number(o.total || o.totalPrice || 0);
    const existing = customerMap.get(cleanPhone);

    if (existing) {
      existing.totalOrders += 1;
      existing.totalSpent += totalAmt;
      existing.loyaltyPoints += Math.floor(totalAmt / 1000);
      if (o.date && (!existing.lastOrderDate || o.date > existing.lastOrderDate)) {
        existing.lastOrderDate = o.date;
      }
      if (o.outlet) existing.favoriteOutlet = o.outlet;

      // Tier Calculation
      if (existing.totalSpent >= 500000) existing.tier = 'Platinum';
      else if (existing.totalSpent >= 250000) existing.tier = 'Gold';
      else if (existing.totalSpent >= 100000) existing.tier = 'Silver';
      else existing.tier = 'Bronze';
    } else {
      const newCust: Customer = {
        id: `CUST-${cleanPhone.slice(-4)}-${Math.floor(Math.random() * 8999 + 1000)}`,
        name: o.customerName || 'Pelanggan POS',
        phone: cleanPhone,
        address: o.addressOrTime || '',
        favoriteOutlet: o.outlet || 'Steak 11',
        totalOrders: 1,
        totalSpent: totalAmt,
        lastOrderDate: o.date || new Date().toISOString().split('T')[0],
        loyaltyPoints: Math.floor(totalAmt / 1000),
        tier: totalAmt >= 500000 ? 'Platinum' : totalAmt >= 250000 ? 'Gold' : totalAmt >= 100000 ? 'Silver' : 'Bronze',
        notes: `Tercatat otomatis dari transaksi ID #${o.id}`,
        tags: ['Pelanggan Auto Sync'],
        createdAt: o.date || new Date().toISOString().split('T')[0]
      };
      customerMap.set(cleanPhone, newCust);
    }
  });

  const updatedList = Array.from(customerMap.values());
  saveCustomers(updatedList);
  return updatedList;
}

// --- WA GATEWAY CONFIG STORAGE ---
export function getStoredWaGatewayConfig(): WaGatewayConfig {
  const stored = localStorage.getItem('steak11_wa_gateway_config');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch {
      return DEFAULT_WA_GATEWAY_CONFIG;
    }
  }
  return DEFAULT_WA_GATEWAY_CONFIG;
}

export function saveWaGatewayConfig(cfg: WaGatewayConfig): void {
  localStorage.setItem('steak11_wa_gateway_config', JSON.stringify(cfg));
  window.dispatchEvent(new Event('wa_gateway_config_updated'));
  syncUserDataToFirestore('wa_gateway_config', cfg);
}

// --- SHIFT TEMPLATES & SCHEDULES STORAGE ---
export function getStoredShiftTemplates(): WorkShiftTemplate[] {
  const stored = localStorage.getItem('steak11_shift_templates');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (t) => !['shift-1', 'shift-2', 'shift-3'].includes(t.id) &&
                 !['shift pagi', 'shift siang / mid', 'shift siang', 'shift malam'].includes((t.name || '').toLowerCase().trim())
        );
      }
    } catch {
      return [];
    }
  }
  return DEFAULT_SHIFT_TEMPLATES;
}

export function saveShiftTemplates(data: WorkShiftTemplate[]): void {
  localStorage.setItem('steak11_shift_templates', JSON.stringify(data));
  window.dispatchEvent(new Event('shift_templates_updated'));
  syncUserDataToFirestore('shift_templates', data);
}

export function getStoredSchedules(): EmployeeSchedule[] {
  const stored = localStorage.getItem('steak11_employee_schedules') ?? localStorage.getItem('steak11_schedules');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
}

export function saveSchedules(data: EmployeeSchedule[]): void {
  localStorage.setItem('steak11_employee_schedules', JSON.stringify(data));
  localStorage.setItem('steak11_schedules', JSON.stringify(data));
  window.dispatchEvent(new Event('schedules_updated'));
  syncUserDataToFirestore('schedules', data);
}

// --- MONTHLY DEDUCTIONS STORAGE ---
export type { MonthlyDeductionItem };

export function getStoredMonthlyDeductions(): MonthlyDeductionItem[] {
  const stored = localStorage.getItem('steak11_monthly_deductions');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  const todayMonth = new Date().toISOString().substring(0, 7);
  return [
    {
      id: 'DED-202608-01',
      month: todayMonth,
      outlet: 'Steak 11, Cibubur',
      category: 'Sewa Tempat & Gedung',
      name: 'Biaya Sewa Ruko & Lokasi Cabang Cibubur',
      amount: 3500000,
      notes: 'Sewa bulanan ruko operasional',
      createdAt: new Date().toISOString()
    },
    {
      id: 'DED-202608-02',
      month: todayMonth,
      outlet: 'Semua Cabang (Konsolidasi)',
      category: 'Marketing & Promo',
      name: 'Biaya Marketing, Iklan Ads & Konten Medsos',
      amount: 500000,
      notes: 'Budget promosi bulanan',
      createdAt: new Date().toISOString()
    }
  ];
}

export function saveMonthlyDeductions(data: MonthlyDeductionItem[]): void {
  localStorage.setItem('steak11_monthly_deductions', JSON.stringify(data));
  window.dispatchEvent(new Event('monthly_deductions_updated'));
  syncUserDataToFirestore('monthly_deductions', data);
}


export function getStoredEmployeeLoans(): EmployeeLoan[] {
  const stored = localStorage.getItem('steak11_employee_loans');
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.filter((l: any) => l.id !== 'LOAN-1001' && l.id !== 'LOAN-1002');
      }
    } catch {
      return [];
    }
  }
  return [];
}

export function saveEmployeeLoans(data: EmployeeLoan[]): void {
  const cleanData = (data || []).filter((l) => l.id !== 'LOAN-1001' && l.id !== 'LOAN-1002');
  localStorage.setItem('steak11_employee_loans', JSON.stringify(cleanData));
  window.dispatchEvent(new Event('employee_loans_updated'));
  syncUserDataToFirestore('employee_loans', cleanData);
}

// --- CURRENT USER SESSION STORAGE ---
export function getStoredCurrentUser(): { name: string; role: string; allowedTabs?: string[] } | null {
  const stored = localStorage.getItem('steak11_current_user');
  if (stored) {
    try {
      const user = JSON.parse(stored);
      if (user && user.allowedTabs) {
        const isPengunjungOnly = user.role === 'Pengunjung';
        if (isPengunjungOnly) {
          user.allowedTabs = SYSTEM_ALL_TABS.map((t) => t.id).filter((id) => id !== 'admin');
          localStorage.setItem('steak11_current_user', JSON.stringify(user));
        }
      }
      return user;
    } catch {
      return null;
    }
  }
  return null;
}

export function saveStoredCurrentUser(user: { name: string; role: string; allowedTabs?: string[] }): void {
  localStorage.setItem('steak11_current_user', JSON.stringify(user));
}

export function clearStoredCurrentUser(): void {
  localStorage.removeItem('steak11_current_user');
}




