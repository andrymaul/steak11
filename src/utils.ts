import { OrderItem, Employee, AttendanceRecord, PayrollSlip, LocationItem, MenuItem, ChickenOption, SauceOption, AddonOption, AdminUser, RoleSetting, WaNotificationSettings, StoreBrandingSettings, InventoryItem, PromoVoucher, CashierShiftRecord, ReviewItem, Supplier, PurchaseOrder, PettyCashExpense, MenuRecipe, StockOpnameLog, StockTransfer, PaymentMethodSettings, ReceiptSettings, AuditLogItem, StockMutation, Customer, WaGatewayConfig, WorkShiftTemplate, EmployeeSchedule, EmployeeLoan } from './types';
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
  syncAllLocationsToFirebase
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
  { id: 'shifts', name: 'Laporan Keuangan' },
  { id: 'outlets', name: 'Outlet & Shift Rules' },
  { id: 'admin', name: 'Admin System' },
  { id: 'wa', name: 'Notifikasi WhatsApp' },
  { id: 'branding', name: 'Identitas & Branding' },
  { id: 'system', name: 'Integrasi & System' },
  { id: 'firebase', name: 'Firebase Firestore' },
  { id: 'payment_receipt_settings', name: 'Pembayaran & Struk' },
  { id: 'audit_logs', name: 'Audit Log Aktivitas' },
  { id: 'customers', name: 'Data Pelanggan & WA' },
  { id: 'pengunjung', name: 'Data Pengunjung' },
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
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return MENU_ITEMS;
    }
  }
  saveMenuItems(MENU_ITEMS);
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
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return CHICKEN_OPTIONS;
    }
  }
  saveChickenOptions(CHICKEN_OPTIONS);
  return CHICKEN_OPTIONS;
}

export function saveChickenOptions(items: ChickenOption[]): void {
  localStorage.setItem('steak11_chicken_options', JSON.stringify(items));
  window.dispatchEvent(new Event('racik_options_updated'));
  syncAllRacikOptionsToFirebase(items, getStoredSauceOptions(), getStoredAddonOptions());
}

export function getStoredSauceOptions(): SauceOption[] {
  const stored = localStorage.getItem('steak11_sauce_options');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return SAUCE_OPTIONS;
    }
  }
  saveSauceOptions(SAUCE_OPTIONS);
  return SAUCE_OPTIONS;
}

export function saveSauceOptions(items: SauceOption[]): void {
  localStorage.setItem('steak11_sauce_options', JSON.stringify(items));
  window.dispatchEvent(new Event('racik_options_updated'));
  syncAllRacikOptionsToFirebase(getStoredChickenOptions(), items, getStoredAddonOptions());
}

export function getStoredAddonOptions(): AddonOption[] {
  const stored = localStorage.getItem('steak11_addon_options');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return ADDON_OPTIONS;
    }
  }
  saveAddonOptions(ADDON_OPTIONS);
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
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return LOCATIONS;
    }
  }
  saveLocations(LOCATIONS);
  return LOCATIONS;
}

export function saveLocations(locations: LocationItem[]): void {
  localStorage.setItem('steak11_locations', JSON.stringify(locations));
  window.dispatchEvent(new Event('locations_updated'));
  syncAllLocationsToFirebase(locations);
}

export function getStoredOrders(): OrderItem[] {
  const stored = localStorage.getItem('steak11_orders');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return DEFAULT_ORDERS;
    }
  }
  saveOrders(DEFAULT_ORDERS);
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
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return DEFAULT_EMPLOYEES;
    }
  }
  saveEmployees(DEFAULT_EMPLOYEES);
  return DEFAULT_EMPLOYEES;
}

export function saveEmployees(employees: Employee[]): void {
  localStorage.setItem('steak11_employees', JSON.stringify(employees));
  window.dispatchEvent(new Event('employees_updated'));
  syncAllEmployeesToFirebase(employees);
}

// --- ATTENDANCE STORAGE ---
export function getStoredAttendance(): AttendanceRecord[] {
  const stored = localStorage.getItem('steak11_attendance');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return DEFAULT_ATTENDANCE;
    }
  }
  saveAttendance(DEFAULT_ATTENDANCE);
  return DEFAULT_ATTENDANCE;
}

export function saveAttendance(records: AttendanceRecord[]): void {
  localStorage.setItem('steak11_attendance', JSON.stringify(records));
  window.dispatchEvent(new Event('attendance_updated'));
  syncAllAttendanceToFirebase(records);
}

// --- PAYROLL STORAGE ---
export function getStoredPayroll(): PayrollSlip[] {
  const stored = localStorage.getItem('steak11_payroll');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return DEFAULT_PAYROLL;
    }
  }
  savePayroll(DEFAULT_PAYROLL);
  return DEFAULT_PAYROLL;
}

export function savePayroll(slips: PayrollSlip[]): void {
  localStorage.setItem('steak11_payroll', JSON.stringify(slips));
  window.dispatchEvent(new Event('payroll_updated'));
  syncAllPayrollToFirebase(slips);
}

// --- MENU CATEGORIES STORAGE ---
export function getStoredMenuCategories(): { id: string; name: string; description: string }[] {
  const stored = localStorage.getItem('steak11_menu_categories');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return DEFAULT_MENU_CATEGORIES;
    }
  }
  saveMenuCategories(DEFAULT_MENU_CATEGORIES);
  return DEFAULT_MENU_CATEGORIES;
}

export function saveMenuCategories(categories: { id: string; name: string; description: string }[]): void {
  localStorage.setItem('steak11_menu_categories', JSON.stringify(categories));
  window.dispatchEvent(new Event('menu_categories_updated'));
  syncAllCategoriesToFirebase(categories);
}

export async function syncAllLocalMenuToFirebase(): Promise<void> {
  const menuItems = getStoredMenuItems();
  const chickenOpts = getStoredChickenOptions();
  const sauceOpts = getStoredSauceOptions();
  const addonOpts = getStoredAddonOptions();
  const categories = getStoredMenuCategories();
  await syncEntireMenuDataToFirebase(menuItems, chickenOpts, sauceOpts, addonOpts, categories);
}

// --- ADMIN USERS STORAGE ---
export function getStoredAdmins(): AdminUser[] {
  const stored = localStorage.getItem('steak11_admins');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.map((admin) => {
          if (
            admin.allowedTabs &&
            !admin.allowedTabs.includes('firebase') &&
            (admin.role?.includes('Admin') || admin.role?.includes('Owner') || admin.role?.includes('Super'))
          ) {
            return { ...admin, allowedTabs: [...admin.allowedTabs, 'firebase'] };
          }
          return admin;
        });
      }
    } catch {
      return DEFAULT_ADMINS;
    }
  }
  saveAdmins(DEFAULT_ADMINS);
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
  let rawRoles: RoleSetting[] = DEFAULT_ROLE_SETTINGS;
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        rawRoles = parsed;
      }
    } catch {
      rawRoles = DEFAULT_ROLE_SETTINGS;
    }
  }

  const existingNames = new Set(rawRoles.map((r) => (r.name || '').trim().toLowerCase()));
  const missingDefaults = DEFAULT_ROLE_SETTINGS.filter(
    (def) => !existingNames.has((def.name || '').trim().toLowerCase())
  );
  const combined = [...rawRoles, ...missingDefaults];

  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  const uniqueRoles: RoleSetting[] = [];

  for (const role of combined) {
    if (!role || !role.id || !role.name) continue;
    const cleanId = role.id.trim();
    const cleanName = role.name.trim().toLowerCase();

    if (!seenIds.has(cleanId) && !seenNames.has(cleanName)) {
      seenIds.add(cleanId);
      seenNames.add(cleanName);

      // Merge new default tabs if matching a default role definition
      const defaultMatch = DEFAULT_ROLE_SETTINGS.find(
        (d) => d.name.trim().toLowerCase() === cleanName
      );
      let mergedTabs = role.allowedTabs || [];
      if (defaultMatch && defaultMatch.allowedTabs) {
        const combinedTabs = Array.from(new Set([...mergedTabs, ...defaultMatch.allowedTabs]));
        mergedTabs = combinedTabs;
      }
      if (cleanName === 'super admin') {
        mergedTabs = SYSTEM_ALL_TABS.map((t) => t.id);
      }

      uniqueRoles.push({
        ...role,
        name: role.name.trim(),
        allowedTabs: mergedTabs,
      });
    }
  }

  saveRoleSettings(uniqueRoles);
  return uniqueRoles;
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
              'presensi_kamera', 'jadwal', 'penggajian', 'shifts', 'outlets', 'admin', 'wa',
              'branding', 'system', 'payment_receipt_settings', 'audit_logs', 'customers', 'pengunjung', 'user_guide'
            ]),
        status: adm.status === 'Non-Aktif' ? 'Non-Aktif' : 'Aktif'
      });
    }
  });

  return unifiedList;
}

// --- WA NOTIFICATION SETTINGS STORAGE ---
export function getStoredWaSettings(): WaNotificationSettings {
  const stored = localStorage.getItem('steak11_wa_settings');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_WA_SETTINGS;
    }
  }
  saveWaSettings(DEFAULT_WA_SETTINGS);
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
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_BRANDING;
    }
  }
  saveBranding(DEFAULT_BRANDING);
  return DEFAULT_BRANDING;
}

export function saveBranding(branding: StoreBrandingSettings): void {
  localStorage.setItem('steak11_branding', JSON.stringify(branding));
  window.dispatchEvent(new Event('branding_updated'));
  syncUserDataToFirestore('branding', branding);
}

// --- INVENTORY STORAGE ---
export function getStoredInventory(): InventoryItem[] {
  const stored = localStorage.getItem('steak11_inventory');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return DEFAULT_INVENTORY;
    }
  }
  saveInventory(DEFAULT_INVENTORY);
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
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return DEFAULT_PROMOS;
    }
  }
  savePromos(DEFAULT_PROMOS);
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
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return DEFAULT_CASHIER_SHIFTS;
    }
  }
  saveCashierShifts(DEFAULT_CASHIER_SHIFTS);
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
  if (stored) {
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
      return REVIEWS;
    }
  }
  saveReviews(REVIEWS);
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
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return DEFAULT_SUPPLIERS;
    }
  }
  saveSuppliers(DEFAULT_SUPPLIERS);
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
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return DEFAULT_PURCHASE_ORDERS;
    }
  }
  savePurchaseOrders(DEFAULT_PURCHASE_ORDERS);
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
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return DEFAULT_EXPENSES;
    }
  }
  saveExpenses(DEFAULT_EXPENSES);
  return DEFAULT_EXPENSES;
}

export function saveExpenses(expenses: PettyCashExpense[]): void {
  localStorage.setItem('steak11_expenses', JSON.stringify(expenses));
  window.dispatchEvent(new Event('expenses_updated'));
  syncAllExpensesToFirebase(expenses);
}

// --- MENU RECIPES (BOM) STORAGE ---
export function getStoredRecipes(): MenuRecipe[] {
  const stored = localStorage.getItem('steak11_menu_recipes');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return DEFAULT_RECIPES;
    }
  }
  saveRecipes(DEFAULT_RECIPES);
  return DEFAULT_RECIPES;
}

export function saveRecipes(recipes: MenuRecipe[]): void {
  localStorage.setItem('steak11_menu_recipes', JSON.stringify(recipes));
  window.dispatchEvent(new Event('recipes_updated'));
  syncUserDataToFirestore('recipes', recipes);
}

// --- STOCK OPNAME LOGS STORAGE ---
export function getStoredStockOpnames(): StockOpnameLog[] {
  const stored = localStorage.getItem('steak11_stock_opnames');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return DEFAULT_STOCK_OPNAMES;
    }
  }
  saveStockOpnames(DEFAULT_STOCK_OPNAMES);
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
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return DEFAULT_STOCK_TRANSFERS;
    }
  }
  saveStockTransfers(DEFAULT_STOCK_TRANSFERS);
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
  if (stored) {
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
  savePaymentSettings(DEFAULT_PAYMENT_SETTINGS);
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
  if (stored) {
    try {
      return { ...DEFAULT_RECEIPT_SETTINGS, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_RECEIPT_SETTINGS;
    }
  }
  saveReceiptSettings(DEFAULT_RECEIPT_SETTINGS);
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
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return DEFAULT_AUDIT_LOGS;
    }
  }
  saveAuditLogs(DEFAULT_AUDIT_LOGS);
  return DEFAULT_AUDIT_LOGS;
}

export function saveAuditLogs(logs: AuditLogItem[]): void {
  localStorage.setItem('steak11_audit_logs', JSON.stringify(logs));
  window.dispatchEvent(new Event('audit_logs_updated'));
  syncUserDataToFirestore('audit_logs', logs);
}

export function recordAuditLog(log: Omit<AuditLogItem, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): void {
  const existing = getStoredAuditLogs();
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0];
  const dateStr = now.toISOString().split('T')[0];
  const idStr = `AUD-${dateStr.replace(/-/g, '')}-${String(existing.length + 1).padStart(3, '0')}`;

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

  const updated = [newLog, ...existing];
  saveAuditLogs(updated);
}

// --- STOCK MUTATION / KARTU STOK STORAGE ---
export function getStoredStockMutations(): StockMutation[] {
  const stored = localStorage.getItem('steak11_stock_mutations');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return DEFAULT_STOCK_MUTATIONS;
    }
  }
  saveStockMutations(DEFAULT_STOCK_MUTATIONS);
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
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return DEFAULT_CUSTOMERS;
    }
  }
  saveCustomers(DEFAULT_CUSTOMERS);
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
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch {
      return DEFAULT_WA_GATEWAY_CONFIG;
    }
  }
  saveWaGatewayConfig(DEFAULT_WA_GATEWAY_CONFIG);
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
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return DEFAULT_SHIFT_TEMPLATES;
    }
  }
  return DEFAULT_SHIFT_TEMPLATES;
}

export function saveShiftTemplates(data: WorkShiftTemplate[]): void {
  localStorage.setItem('steak11_shift_templates', JSON.stringify(data));
}

export function getStoredSchedules(): EmployeeSchedule[] {
  const stored = localStorage.getItem('steak11_employee_schedules');
  if (stored) {
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
}

export function getStoredEmployeeLoans(): EmployeeLoan[] {
  const stored = localStorage.getItem('steak11_employee_loans');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return DEFAULT_EMPLOYEE_LOANS;
    }
  }
  return DEFAULT_EMPLOYEE_LOANS;
}

export function saveEmployeeLoans(data: EmployeeLoan[]): void {
  localStorage.setItem('steak11_employee_loans', JSON.stringify(data));
}

// --- CURRENT USER SESSION STORAGE ---
export function getStoredCurrentUser(): { name: string; role: string; allowedTabs?: string[] } | null {
  const stored = localStorage.getItem('steak11_current_user');
  if (stored) {
    try {
      const user = JSON.parse(stored);
      if (user && user.allowedTabs) {
        let changed = false;
        const isPengunjungOnly = user.role === 'Pengunjung';
        if (isPengunjungOnly) {
          user.allowedTabs = SYSTEM_ALL_TABS.map((t) => t.id).filter((id) => id !== 'admin');
          changed = true;
        } else {
          if (!user.allowedTabs.includes('pengunjung')) {
            user.allowedTabs.push('pengunjung');
            changed = true;
          }
          if (!user.allowedTabs.includes('jadwal')) {
            user.allowedTabs.push('jadwal');
            changed = true;
          }
          if (!user.allowedTabs.includes('firebase')) {
            user.allowedTabs.push('firebase');
            changed = true;
          }
        }
        if (changed) {
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




