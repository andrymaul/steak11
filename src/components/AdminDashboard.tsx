import React, { useState, useEffect } from 'react';
import {
  Crown,
  FileCode2,
  LogOut,
  Search,
  RefreshCw,
  CloudDownload,
  FileSpreadsheet,
  FileText,
  Send,
  Users,
  User,
  UserCheck,
  Calculator,
  PlusCircle,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Calendar,
  MapPin,
  Clock,
  Printer,
  Sparkles,
  ShieldCheck,
  PhoneCall,
  Camera,
  Eye,
  Utensils,
  Flame,
  Tag,
  Star,
  Folder,
  ChefHat,
  X,
  Boxes,
  Percent,
  Banknote,
  AlertTriangle,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Database,
  Upload,
  Download,
  Copy,
  Check,
  Globe,
  Sliders,
  RotateCcw,
  FileJson,
  Save,
  ExternalLink,
  Code,
  HardDrive,
  LayoutDashboard,
  ShoppingBag,
  Receipt,
  TrendingUp,
  BarChart3,
  PieChart,
  MessageSquare,
  Lock,
  Shield,
  XCircle,
  Smartphone,
  CreditCard,
  QrCode,
  Building2,
  Package,
  Activity,
  BookOpen
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { OrderItem, Employee, AttendanceRecord, PayrollSlip, LocationItem, MenuItem, ChickenOption, SauceOption, AddonOption, AdminUser, RoleSetting, WaNotificationSettings, StoreBrandingSettings, InventoryItem, PromoVoucher, CashierShiftRecord, ReviewItem, Supplier, PurchaseOrder, PettyCashExpense, WorkShiftTemplate, EmployeeSchedule, EmployeeLoan } from '../types';
import {
  SYSTEM_ALL_TABS,
  getTabDisplayName,
  formatRupiah,
  getStoredOrders,
  saveOrders,
  getStoredGasUrl,
  saveStoredGasUrl,
  getStoredEmployees,
  saveEmployees,
  getStoredAttendance,
  saveAttendance,
  getStoredPayroll,
  savePayroll,
  getStoredLocations,
  saveLocations,
  getStoredMenuItems,
  saveMenuItems,
  getStoredMenuCategories,
  saveMenuCategories,
  getStoredChickenOptions,
  saveChickenOptions,
  getStoredSauceOptions,
  saveSauceOptions,
  getStoredAddonOptions,
  saveAddonOptions,
  getStoredAdmins,
  saveAdmins,
  isRegisteredAdmin,
  getStoredRoleSettings,
  saveRoleSettings,
  getStoredWaSettings,
  saveWaSettings,
  getStoredBranding,
  saveBranding,
  getStoredInventory,
  saveInventory,
  getStoredPromos,
  savePromos,
  getStoredCashierShifts,
  saveCashierShifts,
  getStoredReviews,
  saveReviews,
  getStoredSuppliers,
  saveSuppliers,
  getStoredPurchaseOrders,
  savePurchaseOrders,
  getStoredExpenses,
  saveExpenses,
  getStoredShiftTemplates,
  saveShiftTemplates,
  getStoredSchedules,
  saveSchedules,
  getStoredEmployeeLoans,
  saveEmployeeLoans,
  getStoredPaymentSettings,
  savePaymentSettings,
  getStoredReceiptSettings,
  saveReceiptSettings,
  getNextReceiptNumber,
  getStoredLatePenaltyThreshold,
  saveLatePenaltyThreshold
} from '../utils';
import { REVIEWS } from '../data/initialData';
import { ThermalReceiptModal } from './ThermalReceiptModal';
import { SupplyChainManager } from './SupplyChainManager';
import { FinanceControlManager } from './FinanceControlManager';
import { PaymentAndReceiptSettingsManager } from './PaymentAndReceiptSettingsManager';
import { AuditLogManager } from './AuditLogManager';
import { PresensiKameraManager } from './PresensiKameraManager';
import { CustomerManager } from './CustomerManager';
import { FirebaseSettingsPanel } from './FirebaseSettingsPanel';
import { UserGuideManager } from './UserGuideManager';
import {
  refreshEmployeesFromFirebase,
  pullAllFirestoreDataToLocal,
  pullAttendanceFromFirestore,
  subscribeToAttendance,
  updateAttendanceRecordInCloud,
  deleteAttendanceRecordFromCloud,
  subscribeToEmployees,
  pullEmployeesFromFirestore,
  saveEmployeeDirectToCloud,
  updateEmployeeInCloud,
  deleteEmployeeFromCloud
} from '../lib/firebaseServices';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGasModal: () => void;
  currentUser?: { name: string; role: string; allowedTabs?: string[] } | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  onOpenGasModal,
  currentUser,
}) => {
  // Navigation Tab
  const [activeTab, setActiveTabState] = useState<
    | 'dashboard'
    | 'kasir'
    | 'pesanan'
    | 'menu'
    | 'racik'
    | 'karyawan'
    | 'absensi'
    | 'penggajian'
    | 'analytics'
    | 'reviews'
    | 'outlets'
    | 'admin'
    | 'wa'
    | 'branding'
    | 'inventory'
    | 'promos'
    | 'shifts'
    | 'system'
    | 'suppliers'
    | 'purchase_orders'
    | 'expenses'
    | 'payment_receipt_settings'
    | 'audit_logs'
    | 'presensi_kamera'
    | 'customers'
    | 'firebase'
    | 'jadwal'
    | 'pengunjung'
    | 'user_guide'
  >(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('steak11_active_tab');
      if (saved) return saved as any;
    }
    return 'dashboard';
  });

  const setActiveTab = (tab: any) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('steak11_active_tab', tab);
    }
  };

  if (!isOpen) return null;

  const isReadOnlyVisitor = !isRegisteredAdmin(currentUser);
  const checkReadOnlyPermission = (): boolean => {
    if (isReadOnlyVisitor) {
      showToast('🔒 Akses Ditolak: Hanya Admin Terdaftar yang memiliki izin untuk Edit & Hapus data.');
      return true;
    }
    return false;
  };

  const canAccessTab = (tabId: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.allowedTabs && Array.isArray(currentUser.allowedTabs)) {
      return currentUser.allowedTabs.includes(tabId);
    }
    const roleLower = (currentUser.role || '').toLowerCase();
    if (roleLower.includes('super') || roleLower.includes('owner') || roleLower.includes('admin')) {
      return true;
    }
    return false;
  };

  // Supply Chain & Finance State
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => getStoredSuppliers());
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => getStoredPurchaseOrders());
  const [expenses, setExpenses] = useState<PettyCashExpense[]>(() => getStoredExpenses());

  // ZIP System Update States
  const [isUploadingZipUpdate, setIsUploadingZipUpdate] = useState(false);
  const [zipUpdateProgress, setZipUpdateProgress] = useState('');
  const [zipUpdateResult, setZipUpdateResult] = useState<any>(null);
  const [zipUpdateHistory, setZipUpdateHistory] = useState<any[]>([]);

  const fetchZipUpdateHistory = async () => {
    try {
      const res = await fetch('/api/system/updates-history');
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.success) {
            setZipUpdateHistory(data.history || []);
          }
        }
      }
    } catch (e) {
      console.error("Error fetching update history:", e);
    }
  };

  const handleUploadZipUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.zip')) {
      showToast('❌ Harap pilih file berformat .zip');
      return;
    }

    setIsUploadingZipUpdate(true);
    setZipUpdateProgress('Membaca dan mengunggah file ZIP update...');
    setZipUpdateResult(null);

    const formData = new FormData();
    formData.append('zipFile', file);

    try {
      setZipUpdateProgress('Mengekstrak file & memperbarui paket software...');
      const res = await fetch('/api/system/update-zip', {
        method: 'POST',
        headers: {
          'X-File-Name': encodeURIComponent(file.name),
          'X-File-Size': file.size.toString(),
        },
        body: formData,
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && data.success) {
          setZipUpdateResult(data);
          fetchZipUpdateHistory();
        } else {
          setZipUpdateResult({
            success: false,
            message: data?.message || 'Gagal menerapkan pembaruan sistem.',
          });
        }
      } else {
        setZipUpdateResult({
          success: false,
          message: 'Gagal mengunggah file ZIP: Respon server bukan format JSON yang valid.',
        });
      }
    } catch (err: any) {
      setZipUpdateResult({
        success: false,
        message: `Gagal mengunggah file ZIP: ${err.message || 'Network / Server Error'}`,
      });
    } finally {
      setIsUploadingZipUpdate(false);
      setZipUpdateProgress('');
      e.target.value = '';
    }
  };

  // Sidebar Toggle State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Header Real-time Clock State (Hari, Tanggal, Waktu)
  const [headerDateTime, setHeaderDateTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const dayName = days[now.getDay()];
      const dayNum = now.getDate();
      const monthName = months[now.getMonth()];
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');

      setHeaderDateTime(`${dayName}, ${dayNum} ${monthName} ${year} • ${hours}:${minutes}:${seconds} WIB`);
    };

    updateClock();
    fetchZipUpdateHistory();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Reviews State
  const [reviews, setReviews] = useState<ReviewItem[]>(() => getStoredReviews());
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [revName, setRevName] = useState('');
  const [revRole, setRevRole] = useState('Pelanggan Setia');
  const [revComment, setRevComment] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revFavoriteDish, setRevFavoriteDish] = useState('Creamy Garlic Herb Steak');
  const [revStatus, setRevStatus] = useState<'Disetujui' | 'Pending' | 'Ditolak'>('Disetujui');
  const [revOutlet, setRevOutlet] = useState('Steak 11, Cibubur');
  const [revFilterStatus, setRevFilterStatus] = useState<string>('ALL');

  // Thermal Receipt Modal State
  const [receiptOrder, setReceiptOrder] = useState<OrderItem | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // POS Kasir State
  const [cashierOutlet, setCashierOutlet] = useState<string>('Steak 11, Cibubur');
  const [cashierServiceType, setCashierServiceType] = useState<'Dine In' | 'Takeaway' | 'Delivery'>('Dine In');
  const [cashierTableNum, setCashierTableNum] = useState<string>('Meja 01');
  const [cashierCustomerName, setCashierCustomerName] = useState<string>('Pelanggan Kasir');
  const [cashierCustomerPhone, setCashierCustomerPhone] = useState<string>('08123456789');
  const [cashierCategory, setCashierCategory] = useState<string>('all');
  const [cashierSearch, setCashierSearch] = useState<string>('');
  
  // Cart in POS Kasir
  const [posCart, setPosCart] = useState<{
    id: string;
    item: MenuItem;
    selectedChicken?: string;
    selectedSauce?: string;
    selectedAddons?: string[];
    quantity: number;
    itemPrice: number;
    cogsPrice: number;
    subtotal: number;
  }[]>([]);
  
  // Item Customization Modal in POS
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [posSelectedChicken, setPosSelectedChicken] = useState('Paha Ayam Boneless 90g (Standard)');
  const [posSelectedSauce, setPosSelectedSauce] = useState('Creamy Garlic Herb');
  const [posSelectedAddons, setPosSelectedAddons] = useState<string[]>([]);
  const [posItemQty, setPosItemQty] = useState(1);

  // Payment State in POS
  const [posDiscountCode, setPosDiscountCode] = useState('');
  const [posDiscountAmount, setPosDiscountAmount] = useState(0);
  const [posPaymentMethod, setPosPaymentMethod] = useState<'Cash' | 'QRIS' | 'Transfer' | 'Debit'>('Cash');
  const [posCashPaid, setPosCashPaid] = useState<number>(0);

  // RBAC Allowed Tabs State
  const [empAllowedTabs, setEmpAllowedTabs] = useState<string[]>([
    'kasir', 'pesanan', 'shifts', 'inventory', 'absensi', 'presensi_kamera'
  ]);
  const [adminAllowedTabs, setAdminAllowedTabs] = useState<string[]>([
    'dashboard', 'kasir', 'pesanan', 'analytics', 'menu', 'racik', 'inventory', 'reviews', 'promos', 'karyawan', 'absensi', 'penggajian', 'shifts', 'outlets', 'admin', 'wa', 'branding', 'system', 'payment_receipt_settings', 'audit_logs', 'presensi_kamera', 'customers'
  ]);

  // Admin Management State
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => getStoredAdmins());
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [adminIdInput, setAdminIdInput] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminFullName, setAdminFullName] = useState('');
  const [adminRole, setAdminRole] = useState<string>('Super Admin');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminStatus, setAdminStatus] = useState<'Aktif' | 'Non-Aktif' | string>('Aktif');
  const [adminPasswordPin, setAdminPasswordPin] = useState('');

  // Master Role / Jabatan Settings State
  const [roleSettings, setRoleSettings] = useState<RoleSetting[]>(() => getStoredRoleSettings());
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleTargetType, setRoleTargetType] = useState<'admin' | 'employee' | 'both'>('both');
  const [roleDescription, setRoleDescription] = useState('');
  const [roleAllowedTabs, setRoleAllowedTabs] = useState<string[]>([]);
  const [adminActiveSubTab, setAdminActiveSubTab] = useState<'accounts' | 'roles'>('accounts');

  // Menu Categories State
  const [menuCategories, setMenuCategories] = useState<{ id: string; name: string; description: string }[]>(() => getStoredMenuCategories());
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Attendance Pagination State
  const [attPageSize, setAttPageSize] = useState<number | 'ALL'>(10);
  const [attCurrentPage, setAttCurrentPage] = useState<number>(1);

  // WA Settings State
  const [waSettings, setWaSettings] = useState<WaNotificationSettings>(() => getStoredWaSettings());

  // Store Branding Settings State
  const [brandingSettings, setBrandingSettings] = useState<StoreBrandingSettings>(() => getStoredBranding());

  useEffect(() => {
    const handleBrandingUpdate = () => {
      setBrandingSettings(getStoredBranding());
    };
    window.addEventListener('branding_updated', handleBrandingUpdate);
    return () => window.removeEventListener('branding_updated', handleBrandingUpdate);
  }, []);

  // System & Integration State
  const [gasUrlInput, setGasUrlInput] = useState<string>(() => getStoredGasUrl());
  const [gasCopyStatus, setGasCopyStatus] = useState<boolean>(false);
  const [isTestingGas, setIsTestingGas] = useState<boolean>(false);
  const [gasTestResult, setGasTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Database Backup & Restore State
  const [restoreJsonFile, setRestoreJsonFile] = useState<File | null>(null);
  const [restorePreviewData, setRestorePreviewData] = useState<any | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSuccessMsg, setRestoreSuccessMsg] = useState<string | null>(null);

  // Full Apps Script Code Template
  const fullGasScriptCode = `function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var params = e ? e.parameter : {};
  var type = params.type || "orders";
  
  if (type === "attendance") {
    var sheet = ss.getSheetByName("Absensi") || ss.getActiveSheet();
    var rows = sheet.getDataRange().getValues();
    var attList = [];
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      if (r[0]) {
        attList.push({
          id: String(r[0]),
          employeeId: String(r[1]),
          employeeName: String(r[2]),
          date: String(r[3]),
          outlet: String(r[4]),
          clockInTime: String(r[5]),
          clockInStatus: String(r[6]),
          lateMinutes: Number(r[7]) || 0,
          clockOutTime: String(r[8]),
          clockOutStatus: String(r[9]),
          earlyOutMinutes: Number(r[10]) || 0,
          hoursWorked: Number(r[11]) || 0,
          status: String(r[12]),
          notes: String(r[13])
        });
      }
    }
    return ContentService.createTextOutput(JSON.stringify(attList)).setMimeType(ContentService.MimeType.JSON);
  }
  
  var sheet = ss.getSheetByName("Pesanan") || ss.getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  var orders = [];
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (row[0]) {
      orders.push({
        id: String(row[0]),
        date: String(row[1]),
        customerName: String(row[2]),
        phone: String(row[3]),
        outlet: String(row[4]),
        serviceType: String(row[5]),
        addressOrTime: String(row[6]),
        itemsSummary: String(row[7]),
        total: Number(row[8]) || 0,
        status: String(row[9]) || "Pending"
      });
    }
  }
  return ContentService.createTextOutput(JSON.stringify(orders)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var data = JSON.parse(e.postData.contents);
  
  if (data && data.action === 'sync_payroll' && Array.isArray(data.payroll)) {
    var sheet = ss.getSheetByName("Penggajian") || ss.insertSheet("Penggajian");
    sheet.clear();
    sheet.appendRow(["ID Slip", "ID Karyawan", "Nama Karyawan", "Jabatan", "Outlet", "Periode", "Hari Hadir", "Hari Telat", "Jam Kerja", "Gaji Pokok", "Tunjangan", "Bonus", "Potongan", "Gaji Bersih", "Status Bayar", "Tanggal Bayar", "Catatan"]);
    data.payroll.forEach(function(rec) {
      sheet.appendRow([
        rec.id, rec.employeeId, rec.employeeName, rec.employeeRole, rec.outlet,
        rec.periodLabel, rec.totalDaysPresent, rec.totalDaysLate, rec.totalHoursWorked,
        rec.baseSalary, rec.totalAllowance, rec.bonus, rec.deductions, rec.netSalary,
        rec.paymentStatus, rec.paymentDate || '', rec.note || ''
      ]);
    });
    return ContentService.createTextOutput(JSON.stringify({"status": "success", "message": "Payroll synced successfully", "payroll": data.payroll})).setMimeType(ContentService.MimeType.JSON);
  }

  if (data && data.action === 'sync_attendance' && Array.isArray(data.attendance)) {
    var sheet = ss.getSheetByName("Absensi") || ss.insertSheet("Absensi");
    sheet.clear();
    sheet.appendRow(["ID Absensi", "ID Karyawan", "Nama Karyawan", "Tanggal", "Outlet", "Jam Masuk", "Status Masuk", "Late Min", "Jam Pulang", "Status Pulang", "Early Min", "Jam Kerja", "Status", "Catatan"]);
    data.attendance.forEach(function(rec) {
      sheet.appendRow([
        rec.id, rec.employeeId, rec.employeeName, rec.date, rec.outlet,
        rec.clockInTime, rec.clockInStatus, rec.lateMinutes,
        rec.clockOutTime, rec.clockOutStatus, rec.earlyOutMinutes,
        rec.hoursWorked, rec.status, rec.notes || ''
      ]);
    });
    return ContentService.createTextOutput(JSON.stringify({"status": "success", "message": "Attendance synced successfully"})).setMimeType(ContentService.MimeType.JSON);
  }

  var sheet = ss.getSheetByName("Pesanan") || ss.insertSheet("Pesanan");
  if (data && data.id) {
    sheet.appendRow([
      data.id, data.date, data.customerName, data.phone, data.outlet,
      data.serviceType, data.addressOrTime, data.itemsSummary, data.total,
      data.status || 'Pending'
    ]);
  }
  return ContentService.createTextOutput(JSON.stringify({"status": "success", "data": data})).setMimeType(ContentService.MimeType.JSON);
}`;

  const handleSaveGasUrlInSystem = () => {
    saveStoredGasUrl(gasUrlInput.trim());
    setGasTestResult({
      success: true,
      message: '✅ URL Web App Google Apps Script berhasil disimpan!'
    });
  };

  const handleTestGasConnection = async () => {
    if (!gasUrlInput || !gasUrlInput.trim()) {
      setGasTestResult({
        success: false,
        message: 'Masukkan URL Web App Google Apps Script terlebih dahulu.'
      });
      return;
    }
    setIsTestingGas(true);
    setGasTestResult(null);
    try {
      const res = await fetch(`${gasUrlInput.trim()}?type=orders`, { method: 'GET', mode: 'cors' });
      if (res.ok || res.type === 'opaque') {
        setGasTestResult({
          success: true,
          message: '⚡ Koneksi Sukses! Web App Google Apps Script terhubung dan aktif.'
        });
      } else {
        setGasTestResult({
          success: false,
          message: `Koneksi gagal dengan status: ${res.status}`
        });
      }
    } catch {
      setGasTestResult({
        success: true,
        message: '⚡ Sinyal dikirim ke Apps Script! Jika URL tepat & dikonfigurasi "Anyone", sinkronisasi otomatis aktif.'
      });
    } finally {
      setIsTestingGas(false);
    }
  };

  const handleCopyGasCode = () => {
    navigator.clipboard.writeText(fullGasScriptCode);
    setGasCopyStatus(true);
    setTimeout(() => setGasCopyStatus(false), 2500);
  };

  const handleExportFullBackup = () => {
    const fullBackupPayload = {
      appName: 'Steak 11 Database Backup',
      version: '3.5',
      exportDate: new Date().toISOString(),
      data: {
        orders: getStoredOrders(),
        menuItems: getStoredMenuItems(),
        chickenOptions: getStoredChickenOptions(),
        sauceOptions: getStoredSauceOptions(),
        addonOptions: getStoredAddonOptions(),
        employees: getStoredEmployees(),
        attendance: getStoredAttendance(),
        payrollSlips: getStoredPayroll(),
        locations: getStoredLocations(),
        adminUsers: getStoredAdmins(),
        waSettings: getStoredWaSettings(),
        brandingSettings: getStoredBranding(),
        inventory: getStoredInventory(),
        promos: getStoredPromos(),
        cashierShifts: getStoredCashierShifts(),
        gasUrl: getStoredGasUrl()
      }
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackupPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Steak11_Database_Backup_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileChangeForRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setRestoreError(null);
    setRestoreSuccessMsg(null);
    setRestorePreviewData(null);
    if (!file) return;

    setRestoreJsonFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && (parsed.data || parsed.orders || parsed.menuItems)) {
          setRestorePreviewData(parsed);
        } else {
          setRestoreError('Format file JSON tidak valid. Pastikan file backup berasal dari ekspor aplikasi Steak 11.');
        }
      } catch {
        setRestoreError('Gagal membaca file JSON. File rusak atau bukan format JSON valid.');
      }
    };
    reader.readAsText(file);
  };

  const handleApplyRestoreDatabase = () => {
    if (!restorePreviewData) {
      showToast('Tidak ada data backup valid untuk dipulihkan.');
      return;
    }

    const d = restorePreviewData.data || restorePreviewData;

    if (d.orders) saveOrders(d.orders);
    if (d.menuItems) saveMenuItems(d.menuItems);
    if (d.chickenOptions) saveChickenOptions(d.chickenOptions);
    if (d.sauceOptions) saveSauceOptions(d.sauceOptions);
    if (d.addonOptions) saveAddonOptions(d.addonOptions);
    if (d.employees) saveEmployees(d.employees);
    if (d.attendance) saveAttendance(d.attendance);
    if (d.payrollSlips) savePayroll(d.payrollSlips);
    if (d.locations) saveLocations(d.locations);
    if (d.adminUsers) saveAdmins(d.adminUsers);
    if (d.waSettings) saveWaSettings(d.waSettings);
    if (d.brandingSettings) saveBranding(d.brandingSettings);
    if (d.inventory) saveInventory(d.inventory);
    if (d.promos) savePromos(d.promos);
    if (d.cashierShifts) saveCashierShifts(d.cashierShifts);
    if (d.gasUrl) saveStoredGasUrl(d.gasUrl);

    // Refresh local states
    setMenuItems(getStoredMenuItems());
    setChickenOptions(getStoredChickenOptions());
    setSauceOptions(getStoredSauceOptions());
    setAddonOptions(getStoredAddonOptions());
    setEmployees(getStoredEmployees());
    setAttendance(getStoredAttendance());
    setPayrollSlips(getStoredPayroll());
    setLocations(getStoredLocations());
    setAdminUsers(getStoredAdmins());
    setWaSettings(getStoredWaSettings());
    setBrandingSettings(getStoredBranding());
    setInventory(getStoredInventory());
    setPromos(getStoredPromos());
    setCashierShifts(getStoredCashierShifts());
    setGasUrlInput(getStoredGasUrl());

    setRestoreSuccessMsg('🎉 Basis Data Aplikasi Berhasil Dipulihkan (Restore)!');
    setRestorePreviewData(null);
    setRestoreJsonFile(null);
  };

  // Menu Management State
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => getStoredMenuItems());
  const [menuSearchTerm, setMenuSearchTerm] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('ALL');
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingMenuItemId, setEditingMenuItemId] = useState<string | null>(null);

  // Racik Steak Options State
  const [chickenOptions, setChickenOptions] = useState<ChickenOption[]>(() => getStoredChickenOptions());
  const [sauceOptions, setSauceOptions] = useState<SauceOption[]>(() => getStoredSauceOptions());
  const [addonOptions, setAddonOptions] = useState<AddonOption[]>(() => getStoredAddonOptions());
  const [showRacikModal, setShowRacikModal] = useState(false);
  const [racikType, setRacikType] = useState<'chicken' | 'sauce' | 'addon'>('chicken');
  const [editingRacikId, setEditingRacikId] = useState<string | null>(null);

  // Racik Steak Form State
  const [racikName, setRacikName] = useState('');
  const [racikDescription, setRacikDescription] = useState('');
  const [racikPrice, setRacikPrice] = useState(0);
  const [racikSpiciness, setRacikSpiciness] = useState(0);

  // Menu Form State
  const [menuName, setMenuName] = useState('');
  const [menuKoreanName, setMenuKoreanName] = useState('');
  const [menuCategory, setMenuCategory] = useState<'signature' | 'addon' | string>('signature');
  const [menuPrice, setMenuPrice] = useState(20000);
  const [menuCogs, setMenuCogs] = useState(8000);
  const [menuRating, setMenuRating] = useState(4.9);
  const [menuReviewCount, setMenuReviewCount] = useState(100);
  const [menuDescription, setMenuDescription] = useState('');
  const [menuImageUrl, setMenuImageUrl] = useState('');
  const [menuIsPopular, setMenuIsPopular] = useState(false);
  const [menuIsSpicy, setMenuIsSpicy] = useState(false);
  const [menuTags, setMenuTags] = useState('Best Seller, Steak Ayam');

  // Orders State
  const [orders, setOrders] = useState<OrderItem[]>(() => getStoredOrders());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDate, setFilterDate] = useState('');
  const [filterOutlet, setFilterOutlet] = useState('ALL');
  const [filterServiceType, setFilterServiceType] = useState('ALL');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('ALL');
  const [entriesPerPage, setEntriesPerPage] = useState<number | 'ALL'>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Edit Order Modal State
  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderItem | null>(null);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editOutlet, setEditOutlet] = useState('');
  const [editServiceType, setEditServiceType] = useState('Dine In');
  const [editPaymentMethod, setEditPaymentMethod] = useState('Cash');
  const [editCashierName, setEditCashierName] = useState('Kasir POS');
  const [editStatus, setEditStatus] = useState('Pending');
  const [editTotal, setEditTotal] = useState<number>(0);
  const [editAddressOrNotes, setEditAddressOrNotes] = useState('');
  const [editItemsSummary, setEditItemsSummary] = useState('');

  // Outlets State
  const [locations, setLocations] = useState<LocationItem[]>(() => getStoredLocations());
  const [showOutletModal, setShowOutletModal] = useState(false);
  const [editingOutletId, setEditingOutletId] = useState<string | null>(null);

  // Outlet Form State
  const [outletName, setOutletName] = useState('');
  const [outletCity, setOutletCity] = useState('');
  const [outletAddress, setOutletAddress] = useState('');
  const [outletHours, setOutletHours] = useState('10:00 - 22:00 WIB');
  const [outletPhone, setOutletPhone] = useState('0812345678');
  const [outletMapUrl, setOutletMapUrl] = useState('');
  const [outletStartWorkTime, setOutletStartWorkTime] = useState('15:00');
  const [outletEndWorkTime, setOutletEndWorkTime] = useState('22:00');
  const [outletDineIn, setOutletDineIn] = useState(true);
  const [outletTakeaway, setOutletTakeaway] = useState(true);
  const [outletDelivery, setOutletDelivery] = useState(true);
  const [outletIsGofoodActive, setOutletIsGofoodActive] = useState(true);
  const [outletGofoodUrl, setOutletGofoodUrl] = useState('');
  const [outletIsGrabfoodActive, setOutletIsGrabfoodActive] = useState(true);
  const [outletGrabfoodUrl, setOutletGrabfoodUrl] = useState('');
  const [outletIsShopeefoodActive, setOutletIsShopeefoodActive] = useState(true);
  const [outletShopeefoodUrl, setOutletShopeefoodUrl] = useState('');
  const [outletIsMaximActive, setOutletIsMaximActive] = useState(false);
  const [outletMaximUrl, setOutletMaximUrl] = useState('');

  // Employees State
  const [employees, setEmployees] = useState<Employee[]>(() => getStoredEmployees());
  const [isRefreshingEmployees, setIsRefreshingEmployees] = useState(false);
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);

  // Employee Form State
  const [empCustomId, setEmpCustomId] = useState('');
  const [empName, setEmpName] = useState('');
  const [empUsername, setEmpUsername] = useState('');
  const [empRole, setEmpRole] = useState('Chef / Cook');
  const [empOutlet, setEmpOutlet] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empDailyRate, setEmpDailyRate] = useState(120000);
  const [empHourlyRate, setEmpHourlyRate] = useState(15000);
  const [empDailyAllowance, setEmpDailyAllowance] = useState(25000);
  const [empPunctualityAllowance, setEmpPunctualityAllowance] = useState(15000);
  const [empLatePenaltyPerDay, setEmpLatePenaltyPerDay] = useState(15000);
  const [empOutletBonus, setEmpOutletBonus] = useState(0);
  const [empPin, setEmpPin] = useState('1101');
  const [empStatus, setEmpStatus] = useState<'Aktif' | 'Non-Aktif'>('Aktif');

  // Attendance State
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => getStoredAttendance());
  const [attSearchTerm, setAttSearchTerm] = useState('');
  const [attOutletFilter, setAttOutletFilter] = useState('ALL');
  const [attDateFilter, setAttDateFilter] = useState('');
  const [enlargedSelfie, setEnlargedSelfie] = useState<string | null>(null);

  // Attendance Edit State
  const [showEditAttModal, setShowEditAttModal] = useState(false);
  const [editingAttId, setEditingAttId] = useState<string | null>(null);
  const [attEditEmpName, setAttEditEmpName] = useState('');
  const [attEditDate, setAttEditDate] = useState('');
  const [attEditOutlet, setAttEditOutlet] = useState('');
  const [attEditClockIn, setAttEditClockIn] = useState('');
  const [attEditClockInStatus, setAttEditClockInStatus] = useState<'Tepat Waktu' | 'Terlambat Masuk'>('Tepat Waktu');
  const [attEditLateMinutes, setAttEditLateMinutes] = useState(0);
  const [attEditClockOut, setAttEditClockOut] = useState('');
  const [attEditClockOutStatus, setAttEditClockOutStatus] = useState<'Pulang Tepat Waktu' | 'Pulang Awal'>('Pulang Tepat Waktu');
  const [attEditEarlyOutMinutes, setAttEditEarlyOutMinutes] = useState(0);
  const [attEditHoursWorked, setAttEditHoursWorked] = useState(0);
  const [attEditStatus, setAttEditStatus] = useState<'Hadir' | 'Terlambat' | 'Izin' | 'Sakit' | 'Alpha'>('Hadir');
  const [attEditNotes, setAttEditNotes] = useState('');

  // Payroll State
  const [payrollSlips, setPayrollSlips] = useState<PayrollSlip[]>(() => getStoredPayroll());
  const [payrollPeriod, setPayrollPeriod] = useState('2026-08');
  const [payrollSearchTerm, setPayrollSearchTerm] = useState('');
  const [payrollOutletFilter, setPayrollOutletFilter] = useState('ALL');
  const [editingSlipId, setEditingSlipId] = useState<string | null>(null);
  const [editBaseSalary, setEditBaseSalary] = useState(0);
  const [editAllowance, setEditAllowance] = useState(0);
  const [editPunctualityAllowance, setEditPunctualityAllowance] = useState(0);
  const [editOvertimePay, setEditOvertimePay] = useState(0);
  const [editOutletBonus, setEditOutletBonus] = useState(0);
  const [editBonus, setEditBonus] = useState(0);
  const [editDeductions, setEditDeductions] = useState(0);
  const [editNote, setEditNote] = useState('');
  const [syncToEmployeeMaster, setSyncToEmployeeMaster] = useState(true);

  // Work Schedule & Roster State
  const [shiftTemplates, setShiftTemplates] = useState<WorkShiftTemplate[]>(() => getStoredShiftTemplates());
  const [schedules, setSchedules] = useState<EmployeeSchedule[]>(() => getStoredSchedules());
  const [schedulePeriod, setSchedulePeriod] = useState<string>('2026-08');
  const [scheduleOutletFilter, setScheduleOutletFilter] = useState<string>('ALL');
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [schEmployeeId, setSchEmployeeId] = useState<string>('');
  const [schDate, setSchDate] = useState<string>('2026-08-01');
  const [schShiftId, setSchShiftId] = useState<string>('shift-1');
  const [schNotes, setSchNotes] = useState<string>('');
  const [showShiftTemplateModal, setShowShiftTemplateModal] = useState<boolean>(false);
  const [editingShiftTplId, setEditingShiftTplId] = useState<string | null>(null);
  const [shiftTplName, setShiftTplName] = useState('');
  const [shiftTplStart, setShiftTplStart] = useState('09:00');
  const [shiftTplEnd, setShiftTplEnd] = useState('17:00');
  const [shiftTplColor, setShiftTplColor] = useState('emerald');
  const [shiftTplIsOff, setShiftTplIsOff] = useState<boolean>(false);

  // Employee Kasbon / Loan State
  const [employeeLoans, setEmployeeLoans] = useState<EmployeeLoan[]>(() => getStoredEmployeeLoans());
  const [showLoanModal, setShowLoanModal] = useState<boolean>(false);
  const [showLoanLedgerModal, setShowLoanLedgerModal] = useState<boolean>(false);
  const [editingLoanId, setEditingLoanId] = useState<string | null>(null);
  const [loanEmployeeId, setLoanEmployeeId] = useState<string>('');
  const [loanTotalAmount, setLoanTotalAmount] = useState<number>(500000);
  const [loanMonthlyInstallment, setLoanMonthlyInstallment] = useState<number>(100000);
  const [loanDate, setLoanDate] = useState<string>('2026-08-01');
  const [loanNotes, setLoanNotes] = useState<string>('');
  const [selectedLoanForHistory, setSelectedLoanForHistory] = useState<EmployeeLoan | null>(null);
  const [showManualPaymentModal, setShowManualPaymentModal] = useState<boolean>(false);
  const [manualPayAmount, setManualPayAmount] = useState<number>(100000);
  const [manualPayNotes, setManualPayNotes] = useState<string>('');

  // Payroll Penalty & Deductions State
  const [latePenaltyRate, setLatePenaltyRate] = useState<number>(15000);
  const [latePenaltyThresholdMinutes, setLatePenaltyThresholdMinutes] = useState<number>(() => getStoredLatePenaltyThreshold());
  const [showLatePenaltySettingsModal, setShowLatePenaltySettingsModal] = useState<boolean>(false);
  const [editLatePenalty, setEditLatePenalty] = useState<number>(0);
  const [editLoanDeduction, setEditLoanDeduction] = useState<number>(0);
  const [editOtherDeductions, setEditOtherDeductions] = useState<number>(0);

  // Inventory State
  const [inventory, setInventory] = useState<InventoryItem[]>(() => getStoredInventory());
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [editingInvId, setEditingInvId] = useState<string | null>(null);
  const [invName, setInvName] = useState('');
  const [invCategory, setInvCategory] = useState('Daging Ayam');
  const [invStock, setInvStock] = useState(0);
  const [invMinStock, setInvMinStock] = useState(5);
  const [invUnit, setInvUnit] = useState('Kg');
  const [invUnitPrice, setInvUnitPrice] = useState(0);
  const [invOutlet, setInvOutlet] = useState('Semua Outlet');

  // Promos / Vouchers State
  const [promos, setPromos] = useState<PromoVoucher[]>(() => getStoredPromos());
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoDesc, setPromoDesc] = useState('');
  const [promoDiscountType, setPromoDiscountType] = useState<'percentage' | 'nominal'>('nominal');
  const [promoDiscountValue, setPromoDiscountValue] = useState(5000);
  const [promoMinOrder, setPromoMinOrder] = useState(20000);
  const [promoMaxDiscount, setPromoMaxDiscount] = useState(10000);
  const [promoExpiry, setPromoExpiry] = useState('2026-12-31');
  const [promoStatus, setPromoStatus] = useState<'Aktif' | 'Non-Aktif'>('Aktif');

  // Cashier Shifts / Opname Cash State
  const [cashierShifts, setCashierShifts] = useState<CashierShiftRecord[]>(() => getStoredCashierShifts());
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftName, setShiftName] = useState('Shift Malam (15.00 - 22.00)');
  const [shiftCashier, setShiftCashier] = useState('');
  const [shiftOutlet, setShiftOutlet] = useState('');
  const [shiftStartingCash, setShiftStartingCash] = useState(200000);
  const [shiftCashRev, setShiftCashRev] = useState(0);
  const [shiftQrisRev, setShiftQrisRev] = useState(0);
  const [shiftTransferRev, setShiftTransferRev] = useState(0);
  const [shiftActualCash, setShiftActualCash] = useState(0);
  const [shiftNotes, setShiftNotes] = useState('');

  // Delete Confirmation & Toast State
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'outlet' | 'employee' | 'attendance' | 'menu' | 'order' | 'admin' | 'role' | 'inventory' | 'promo' | 'review' | string;
    id: string;
    title: string;
    description: string;
  } | null>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3000);
  };

  const posCategories = [
    { id: 'signature', name: 'Signature Steak' },
    { id: 'addon', name: 'Add On & Sides' }
  ];

  const loadAllData = () => {
    setOrders(getStoredOrders());
    setMenuItems(getStoredMenuItems());
    setMenuCategories(getStoredMenuCategories());
    setChickenOptions(getStoredChickenOptions());
    setSauceOptions(getStoredSauceOptions());
    setAddonOptions(getStoredAddonOptions());
    const locs = getStoredLocations();
    setLocations(locs);
    if (locs.length > 0 && !empOutlet) {
      setEmpOutlet(locs[0].name);
    }
    setEmployees(getStoredEmployees());
    setAttendance(getStoredAttendance());
    setPayrollSlips(getStoredPayroll());
    setAdminUsers(getStoredAdmins());
    setRoleSettings(getStoredRoleSettings());
    setWaSettings(getStoredWaSettings());
    setBrandingSettings(getStoredBranding());
    setInventory(getStoredInventory());
    setPromos(getStoredPromos());
    setCashierShifts(getStoredCashierShifts());
    setReviews(getStoredReviews());
    setSuppliers(getStoredSuppliers());
    setPurchaseOrders(getStoredPurchaseOrders());
    setExpenses(getStoredExpenses());
    setEmployeeLoans(getStoredEmployeeLoans());
  };

  useEffect(() => {
    let unsubAtt: (() => void) | null = null;
    let unsubEmp: (() => void) | null = null;
    if (isOpen) {
      loadAllData();
      pullEmployeesFromFirestore().then((records) => {
        if (records && records.length > 0) setEmployees(records);
      }).catch(() => {});
      pullAttendanceFromFirestore().then((records) => {
        if (records && records.length > 0) setAttendance(records);
      }).catch(() => {});

      unsubEmp = subscribeToEmployees((liveEmployees) => {
        if (liveEmployees && Array.isArray(liveEmployees)) {
          setEmployees(liveEmployees);
        }
      });

      unsubAtt = subscribeToAttendance((liveRecords) => {
        if (liveRecords && Array.isArray(liveRecords)) {
          setAttendance(liveRecords);
        }
      });
      syncFromSheets(true);
    }
    const handleUpdate = () => {
      loadAllData();
    };
    const events = [
      'orders_updated', 'menu_items_updated', 'menu_categories_updated', 'employees_updated', 'attendance_updated',
      'payroll_updated', 'locations_updated', 'admins_updated', 'inventory_updated',
      'promos_updated', 'cashier_shifts_updated', 'reviews_updated', 'suppliers_updated',
      'purchase_orders_updated', 'expenses_updated', 'employee_loans_updated', 'schedules_updated'
    ];
    events.forEach((evt) => window.addEventListener(evt, handleUpdate));
    return () => {
      if (unsubEmp) unsubEmp();
      if (unsubAtt) unsubAtt();
      events.forEach((evt) => window.removeEventListener(evt, handleUpdate));
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && activeTab === 'absensi') {
      pullAttendanceFromFirestore().then((records) => {
        if (records && records.length > 0) setAttendance(records);
      }).catch(() => {});
    }
    if (isOpen && activeTab === 'karyawan') {
      pullEmployeesFromFirestore().then((records) => {
        if (records && records.length > 0) setEmployees(records);
      }).catch(() => {});
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  // --- GAS Order Sync Function ---
  const syncFromSheets = (silent = false) => {
    const gasUrl = getStoredGasUrl();
    if (!gasUrl) {
      if (!silent) {
        showToast('URL Google Apps Script belum diatur!');
        onOpenGasModal();
      }
      return;
    }

    if (!silent) showToast('Menghubungkan ke Google Sheets untuk sinkronisasi pesanan...');

    // Try posting current local orders first to sync up
    fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'sync_orders', orders: orders })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.orders && Array.isArray(data.orders)) {
          saveOrders(data.orders);
          setOrders(data.orders);
          if (!silent) showToast('Berhasil sinkronisasi pesanan dengan Google Spreadsheet!');
        } else {
          // Fetch latest GET
          return fetch(gasUrl)
            .then((r) => r.json())
            .then((getOrders) => {
              if (Array.isArray(getOrders) && getOrders.length > 0) {
                saveOrders(getOrders);
                setOrders(getOrders);
                if (!silent) showToast('Berhasil sinkronisasi pesanan dari Google Sheets!');
              } else {
                if (!silent) showToast('Pesanan tersinkronisasi dengan Spreadsheet.');
              }
            });
        }
      })
      .catch((err) => {
        console.error('GAS Order Sync Error:', err);
        // Fallback GET fetch
        fetch(gasUrl)
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data) && data.length > 0) {
              saveOrders(data);
              setOrders(data);
              if (!silent) showToast('Berhasil menarik data pesanan dari Google Sheets!');
            } else {
              if (!silent) showToast('Koneksi Google Sheets aktif.');
            }
          })
          .catch(() => {
            if (!silent) showToast('Gagal terhubung ke Google Sheets.');
          });
      });
  };

  // --- Orders Logic ---
  const safeOrders = orders || [];
  const filteredOrders = safeOrders.filter((o) => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch =
      (o.customerName || '').toLowerCase().includes(searchLower) ||
      (o.id || '').toLowerCase().includes(searchLower) ||
      (o.outlet || '').toLowerCase().includes(searchLower) ||
      (o.phone || '').toLowerCase().includes(searchLower) ||
      (o.cashierName || '').toLowerCase().includes(searchLower) ||
      (o.itemsSummary || (typeof o.items === 'string' ? o.items : '')).toLowerCase().includes(searchLower);

    const matchStatus = filterStatus === 'ALL' || o.status === filterStatus;
    const matchDate = !filterDate || o.date === filterDate;
    const matchOutlet = filterOutlet === 'ALL' || o.outlet === filterOutlet;
    const matchServiceType = filterServiceType === 'ALL' || o.serviceType === filterServiceType;
    const matchPaymentMethod = filterPaymentMethod === 'ALL' || o.paymentMethod === filterPaymentMethod;

    return matchSearch && matchStatus && matchDate && matchOutlet && matchServiceType && matchPaymentMethod;
  });

  // Unique Lists for Filter Dropdowns
  const availableOutlets = Array.from(new Set([...(locations || []).map((l) => l.name), ...safeOrders.map((o) => o.outlet).filter(Boolean)]));
  const availableServiceTypes = Array.from(new Set(['Dine In', 'Takeaway', 'Delivery', 'Catering / Katering', ...safeOrders.map((o) => o.serviceType).filter(Boolean)]));
  const availablePaymentMethods = Array.from(new Set(['Cash', 'QRIS', 'Transfer BCA', 'Transfer Mandiri', 'ShopeePay', 'GoPay', 'OVO', ...safeOrders.map((o) => o.paymentMethod).filter(Boolean)]));

  // Pagination Logic
  const totalFilteredCount = filteredOrders.length;
  const totalPages = entriesPerPage === 'ALL' ? 1 : Math.max(1, Math.ceil(totalFilteredCount / entriesPerPage));

  const paginatedOrders =
    entriesPerPage === 'ALL'
      ? filteredOrders
      : filteredOrders.slice((currentPage - 1) * entriesPerPage, (currentPage - 1) * entriesPerPage + entriesPerPage);

  const totalOrders = safeOrders.length;
  const pendingOrders = safeOrders.filter((o) => o.status === 'Pending').length;
  const sentOrders = safeOrders.filter(
    (o) => o.status === 'Terkirim/Diproses' || o.status === 'Selesai'
  ).length;
  const totalRevenue = safeOrders
    .filter((o) => o.status !== 'Pending')
    .reduce((sum, o) => sum + (o.total || o.totalPrice || 0), 0);

  // Edit & Delete Order Handlers
  const handleOpenEditOrder = (ord: OrderItem) => {
    if (checkReadOnlyPermission()) return;
    setEditingOrder(ord);
    setEditCustomerName(ord.customerName || '');
    setEditPhone(ord.phone || '');
    setEditOutlet(ord.outlet || (locations[0]?.name || 'Outlet Steak 11'));
    setEditServiceType(ord.serviceType || 'Dine In');
    setEditPaymentMethod(ord.paymentMethod || 'Cash');
    setEditCashierName(ord.cashierName || 'Kasir POS');
    setEditStatus(ord.status || 'Pending');
    setEditTotal(ord.total || ord.totalPrice || 0);
    setEditAddressOrNotes(ord.addressOrNotes || '');
    setEditItemsSummary(ord.itemsSummary || (typeof ord.items === 'string' ? ord.items : ''));
    setShowEditOrderModal(true);
  };

  const handleSaveEditedOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkReadOnlyPermission()) return;
    if (!editingOrder) return;
    const numTotal = Number(editTotal) || 0;
    const updated = orders.map((o) => {
      if (o.id === editingOrder.id) {
        return {
          ...o,
          customerName: editCustomerName,
          phone: editPhone,
          outlet: editOutlet,
          serviceType: editServiceType as any,
          paymentMethod: editPaymentMethod,
          cashierName: editCashierName,
          status: editStatus as any,
          total: numTotal,
          totalPrice: numTotal,
          subtotal: numTotal,
          addressOrNotes: editAddressOrNotes,
          itemsSummary: editItemsSummary,
          items: Array.isArray(editingOrder.items) ? editingOrder.items : [],
        };
      }
      return o;
    });
    setOrders(updated);
    saveOrders(updated);
    setShowEditOrderModal(false);
    setEditingOrder(null);
    showToast(`Pesanan #${editingOrder.id} berhasil diperbarui!`);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (checkReadOnlyPermission()) return;
    setDeleteConfirmTarget({
      type: 'order',
      id: orderId,
      title: `Hapus Pesanan #${orderId}?`,
      description: `Apakah Anda yakin ingin menghapus pesanan #${orderId}? Data yang dihapus tidak dapat dikembalikan.`
    });
  };

  const handleSendViaWhatsApp = (orderId: string) => {
    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        return { ...o, status: 'Terkirim/Diproses' };
      }
      return o;
    });

    setOrders(updatedOrders);
    saveOrders(updatedOrders);

    const targetOrder = orders.find((o) => o.id === orderId);

    const gasUrl = getStoredGasUrl();
    if (gasUrl) {
      fetch(gasUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOrders),
      }).catch((err) => console.error(err));
    }

    if (targetOrder) {
      const message =
        `Halo Kak *${targetOrder.customerName}*,\n\n` +
        `Pesanan Anda di *Steak 11* dengan ID *${targetOrder.id}* saat ini sudah *TERKIRIM / DIPROSES*!\n\n` +
        `*Detail Pesanan:*\n${targetOrder.itemsSummary}\n` +
        `*Total Biaya:* ${formatRupiah(targetOrder.total)}\n` +
        `*Outlet:* ${targetOrder.outlet}\n` +
        `*Layanan:* ${targetOrder.serviceType} (${targetOrder.addressOrTime})\n\n` +
        `Terima kasih telah memesan di Steak 11 - Mythic Chicken Taste! 🍗✨`;

      const rawPhone = targetOrder.phone;
      const phoneClean = rawPhone.startsWith('62')
        ? rawPhone
        : '62' + rawPhone.replace(/^0+/, '');

      window.open(`https://wa.me/${phoneClean}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const handleDownloadExcel = () => {
    if (orders.length === 0) {
      showToast('Tidak ada data pesanan untuk diunduh.');
      return;
    }

    const dataToExport = orders.map((o) => ({
      'ID Pesanan': o.id,
      Tanggal: o.date,
      'Nama Pelanggan': o.customerName,
      'No WhatsApp': o.phone,
      Outlet: o.outlet,
      'Tipe Layanan': o.serviceType,
      'Catatan/Waktu': o.addressOrTime,
      'Rincian Item': o.itemsSummary,
      'Total (Rp)': o.total,
      Status: o.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Pesanan Steak 11');
    XLSX.writeFile(
      workbook,
      `Laporan_Pesanan_Steak11_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  const handleDownloadPdf = () => {
    if (orders.length === 0) {
      showToast('Tidak ada data pesanan untuk diunduh.');
      return;
    }

    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('STEAK 11 - LAPORAN OPERASIONAL PESANAN', 14, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString('id-ID')}`, 14, 28);

    const tableData = orders.map((o) => [
      o.id,
      o.date,
      o.customerName,
      o.outlet,
      o.serviceType,
      formatRupiah(o.total),
      o.status,
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['ID', 'Tanggal', 'Pelanggan', 'Outlet', 'Layanan', 'Total', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [61, 18, 89] },
      styles: { fontSize: 9 },
    });

    doc.save(`Laporan_Pesanan_Steak11_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleDownloadSingleOrderPdf = (o: any) => {
    const doc = new jsPDF({
      unit: 'mm',
      format: [80, 180]
    });

    const receiptCfg = getStoredReceiptSettings();
    const brand = receiptCfg.brandTitle || 'STEAK 11';
    const tagline = receiptCfg.tagline || 'MYTHIC CHICKEN TASTE';

    const startX = 4;
    let currentY = 8;
    const width = 72;

    doc.setFont('courier', 'bold');
    doc.setFontSize(12);
    doc.text(brand, startX + width / 2, currentY, { align: 'center' });

    currentY += 5;
    doc.setFontSize(8);
    doc.setFont('courier', 'normal');
    doc.text(tagline, startX + width / 2, currentY, { align: 'center' });

    currentY += 4;
    doc.text(o.outlet || 'Steak 11 Outlet', startX + width / 2, currentY, { align: 'center' });

    currentY += 4;
    doc.text('------------------------------------------', startX, currentY);

    currentY += 4;
    doc.text(`ID Struk : ${o.id}`, startX, currentY);
    currentY += 4;
    doc.text(`Tanggal  : ${o.date || o.createdAt || ''}`, startX, currentY);
    currentY += 4;
    doc.text(`Kasir    : ${o.cashierName || 'Kasir POS'}`, startX, currentY);
    currentY += 4;
    doc.text(`Pelanggan: ${o.customerName || 'Walk-in'}`, startX, currentY);
    currentY += 4;
    doc.text(`Layanan  : ${o.serviceType || 'Dine In'}`, startX, currentY);
    currentY += 4;
    doc.text(`Metode   : ${o.paymentMethod || 'Cash'}`, startX, currentY);

    currentY += 4;
    doc.text('------------------------------------------', startX, currentY);

    currentY += 4;
    const itemsText = o.itemsSummary || (typeof o.items === 'string' ? o.items : 'Menu Steak 11');
    doc.text(itemsText, startX, currentY, { maxWidth: width });

    currentY += 10;
    doc.text('------------------------------------------', startX, currentY);

    currentY += 4;
    doc.setFont('courier', 'bold');
    const totalVal = o.total || o.totalPrice || 0;
    doc.text(`TOTAL TAGIHAN : ${formatRupiah(totalVal)}`, startX, currentY);
    doc.setFont('courier', 'normal');

    const netProf = o.netProfit !== undefined ? o.netProfit : Math.round(totalVal * 0.55);
    currentY += 4;
    doc.text(`Laba Bersih   : ${formatRupiah(netProf)}`, startX, currentY);

    currentY += 5;
    doc.text('==========================================', startX, currentY);

    currentY += 5;
    doc.text(receiptCfg.footerThankYouMessage || 'TERIMA KASIH ATAS KUNJUNGAN ANDA!', startX + width / 2, currentY, { align: 'center' });

    doc.save(`Struk_PDF_${o.id}.pdf`);
    showToast(`Struk PDF ${o.id} berhasil diunduh!`);
  };

  // --- Outlet & Shift Rules Actions ---
  const handleOpenAddOutlet = () => {
    setEditingOutletId(null);
    setOutletName('');
    setOutletCity('Jakarta');
    setOutletAddress('');
    setOutletHours('10:00 - 22:00 WIB');
    setOutletPhone('081223233299');
    setOutletMapUrl('https://maps.google.com');
    setOutletStartWorkTime('15:00');
    setOutletEndWorkTime('22:00');
    setOutletDineIn(true);
    setOutletTakeaway(true);
    setOutletDelivery(true);
    setOutletIsGofoodActive(true);
    setOutletGofoodUrl('https://gofood.link');
    setOutletIsGrabfoodActive(true);
    setOutletGrabfoodUrl('https://grab.com/food');
    setOutletIsShopeefoodActive(true);
    setOutletShopeefoodUrl('https://shopee.co.id/food');
    setOutletIsMaximActive(false);
    setOutletMaximUrl('');
    setShowOutletModal(true);
  };

  const handleEditOutlet = (loc: LocationItem) => {
    setEditingOutletId(loc.id);
    setOutletName(loc.name);
    setOutletCity(loc.city);
    setOutletAddress(loc.address);
    setOutletHours(loc.hours);
    setOutletPhone(loc.phone);
    setOutletMapUrl(loc.mapUrl);
    setOutletStartWorkTime(loc.startWorkTime || '15:00');
    setOutletEndWorkTime(loc.endWorkTime || '22:00');
    setOutletDineIn(loc.supportedServiceTypes?.dineIn !== false);
    setOutletTakeaway(loc.supportedServiceTypes?.takeaway !== false);
    setOutletDelivery(loc.supportedServiceTypes?.delivery !== false);
    setOutletIsGofoodActive(loc.onlineDeliveryPartners?.isGofoodActive !== false);
    setOutletGofoodUrl(loc.onlineDeliveryPartners?.gofoodUrl || '');
    setOutletIsGrabfoodActive(loc.onlineDeliveryPartners?.isGrabfoodActive !== false);
    setOutletGrabfoodUrl(loc.onlineDeliveryPartners?.grabfoodUrl || '');
    setOutletIsShopeefoodActive(loc.onlineDeliveryPartners?.isShopeefoodActive !== false);
    setOutletShopeefoodUrl(loc.onlineDeliveryPartners?.shopeefoodUrl || '');
    setOutletIsMaximActive(!!loc.onlineDeliveryPartners?.isMaximActive);
    setOutletMaximUrl(loc.onlineDeliveryPartners?.maximUrl || '');
    setShowOutletModal(true);
  };

  const handleSaveOutlet = () => {
    if (!outletName.trim()) {
      showToast('Nama outlet wajib diisi!');
      return;
    }

    const onlineDeliveryPartners = {
      isGofoodActive: outletIsGofoodActive,
      gofoodUrl: outletGofoodUrl.trim(),
      isGrabfoodActive: outletIsGrabfoodActive,
      grabfoodUrl: outletGrabfoodUrl.trim(),
      isShopeefoodActive: outletIsShopeefoodActive,
      shopeefoodUrl: outletShopeefoodUrl.trim(),
      isMaximActive: outletIsMaximActive,
      maximUrl: outletMaximUrl.trim()
    };

    const supportedServiceTypes = {
      dineIn: outletDineIn,
      takeaway: outletTakeaway,
      delivery: outletDelivery
    };

    let updated: LocationItem[];
    if (editingOutletId) {
      updated = locations.map((loc) =>
        loc.id === editingOutletId
          ? {
              ...loc,
              name: outletName.trim(),
              city: outletCity.trim(),
              address: outletAddress.trim(),
              hours: outletHours.trim(),
              phone: outletPhone.trim(),
              mapUrl: outletMapUrl.trim(),
              startWorkTime: outletStartWorkTime,
              endWorkTime: outletEndWorkTime,
              onlineDeliveryPartners,
              supportedServiceTypes
            }
          : loc
      );
    } else {
      const newLoc: LocationItem = {
        id: `loc-${Date.now()}`,
        name: outletName.trim(),
        city: outletCity.trim(),
        address: outletAddress.trim(),
        hours: outletHours.trim(),
        phone: outletPhone.trim(),
        mapUrl: outletMapUrl.trim() || 'https://maps.google.com',
        startWorkTime: outletStartWorkTime,
        endWorkTime: outletEndWorkTime,
        onlineDeliveryPartners,
        supportedServiceTypes
      };
      updated = [...locations, newLoc];
    }

    setLocations(updated);
    saveLocations(updated);
    window.dispatchEvent(new Event('locations_updated'));
    setShowOutletModal(false);
    showToast('Data Outlet, Layanan, dan Mitra Online berhasil disimpan & diperbarui di Landing Page!');
  };

  const handleDeleteOutlet = (id: string) => {
    if (locations.length <= 1) {
      showToast('Minimal harus ada 1 outlet di sistem!');
      return;
    }
    const targetLoc = locations.find((l) => l.id === id);
    const name = targetLoc ? targetLoc.name : 'Outlet ini';
    setDeleteConfirmTarget({
      type: 'outlet',
      id,
      title: `Hapus Outlet "${name}"?`,
      description: 'Data outlet ini beserta jadwal operasionalnya akan dihapus permanen dari sistem.'
    });
  };

  const executeDeleteConfirm = () => {
    if (!deleteConfirmTarget) return;
    if (checkReadOnlyPermission()) {
      setDeleteConfirmTarget(null);
      return;
    }
    const { type, id } = deleteConfirmTarget;

    if (type === 'outlet') {
      const updated = locations.filter((l) => l.id !== id);
      setLocations(updated);
      saveLocations(updated);
      setShowOutletModal(false);
      setEditingOutletId(null);
      showToast('Data outlet berhasil dihapus!');
    } else if (type === 'employee') {
      deleteEmployeeFromCloud(id).then((updated) => {
        setEmployees(updated);
      });
      setShowAddEmpModal(false);
      showToast('✅ Data karyawan berhasil dihapus dari Cloud Firestore!');
    } else if (type === 'attendance') {
      deleteAttendanceRecordFromCloud(id).then((updated) => {
        setAttendance(updated);
      });
      showToast('Rekam absensi berhasil dihapus dari Cloud Firestore!');
    } else if (type === 'menu') {
      const updated = menuItems.filter((m) => m.id !== id);
      setMenuItems(updated);
      saveMenuItems(updated);
      showToast('Menu berhasil dihapus dari sistem!');
    } else if (type === 'order') {
      const updated = orders.filter((o) => o.id !== id);
      setOrders(updated);
      saveOrders(updated);
      showToast(`Pesanan #${id} berhasil dihapus!`);
    } else if (type === 'racik-chicken') {
      const updated = chickenOptions.filter((c) => c.id !== id);
      setChickenOptions(updated);
      saveChickenOptions(updated);
      showToast('Opsi potongan daging berhasil dihapus.');
    } else if (type === 'racik-sauce') {
      const updated = sauceOptions.filter((s) => s.id !== id);
      setSauceOptions(updated);
      saveSauceOptions(updated);
      showToast('Opsi saus berhasil dihapus.');
    } else if (type === 'racik-addon') {
      const updated = addonOptions.filter((a) => a.id !== id);
      setAddonOptions(updated);
      saveAddonOptions(updated);
      showToast('Opsi add-on berhasil dihapus.');
    } else if (type === 'admin') {
      const target = adminUsers.find((a) => a.id === id);
      const isVisitor = target?.role === 'Pengunjung' || target?.passwordPin?.includes('Google') || target?.role?.toLowerCase().includes('pengunjung');
      const updated = adminUsers.filter((a) => a.id !== id);
      saveAdmins(updated);
      setAdminUsers(updated);
      showToast(`🗑️ Akun ${isVisitor ? 'Pengunjung' : 'Admin'} "${target?.fullName || id}" berhasil dihapus dari sistem & Cloud Firestore!`);
    } else if (type === 'role') {
      const targetRole = roleSettings.find((r) => r.id === id);
      const updatedRoles = roleSettings.filter((r) => r.id !== id);
      saveRoleSettings(updatedRoles);
      setRoleSettings(updatedRoles);

      // Re-assign employees/admins with deleted role to first remaining role
      if (targetRole && updatedRoles.length > 0) {
        const fallbackRole = updatedRoles[0];
        const updatedEmployees = employees.map((emp) => {
          if (emp.role.trim().toLowerCase() === targetRole.name.trim().toLowerCase()) {
            return {
              ...emp,
              role: fallbackRole.name,
              allowedTabs: fallbackRole.allowedTabs || emp.allowedTabs,
            };
          }
          return emp;
        });
        setEmployees(updatedEmployees);
        saveEmployees(updatedEmployees);

        const updatedAdmins = adminUsers.map((adm) => {
          if (adm.role.trim().toLowerCase() === targetRole.name.trim().toLowerCase()) {
            return {
              ...adm,
              role: fallbackRole.name,
              allowedTabs: fallbackRole.allowedTabs || adm.allowedTabs,
            };
          }
          return adm;
        });
        setAdminUsers(updatedAdmins);
        saveAdmins(updatedAdmins);
      }

      showToast(`Master Role "${targetRole?.name || id}" berhasil dihapus.`);
    } else if (type === 'inventory') {
      const item = inventory.find((i) => i.id === id);
      const updated = inventory.filter((i) => i.id !== id);
      saveInventory(updated);
      setInventory(updated);
      showToast(`Bahan baku "${item?.name || id}" telah dihapus.`);
    } else if (type === 'promo') {
      const promo = promos.find((p) => p.id === id);
      const updated = promos.filter((p) => p.id !== id);
      savePromos(updated);
      setPromos(updated);
      showToast(`Kode Promo "${promo?.code || id}" berhasil dihapus.`);
    } else if (type === 'review') {
      const updated = reviews.filter((r) => r.id !== id);
      setReviews(updated);
      saveReviews(updated);
      showToast('Ulasan pelanggan telah dihapus.');
    }

    setDeleteConfirmTarget(null);
  };

  // --- Menu Management Actions ---
  const handleOpenAddMenu = () => {
    if (checkReadOnlyPermission()) return;
    setEditingMenuItemId(null);
    setMenuName('');
    setMenuKoreanName('');
    setMenuCategory('signature');
    setMenuPrice(20000);
    setMenuCogs(8000);
    setMenuRating(4.9);
    setMenuReviewCount(120);
    setMenuDescription('');
    setMenuImageUrl('');
    setMenuIsPopular(false);
    setMenuIsSpicy(false);
    setMenuTags('Steak Ayam, Signature');
    setShowMenuModal(true);
  };

  const handleEditMenu = (item: MenuItem) => {
    if (checkReadOnlyPermission()) return;
    setEditingMenuItemId(item.id);
    setMenuName(item.name);
    setMenuKoreanName(item.koreanName || '');
    setMenuCategory(item.category);
    setMenuPrice(item.price);
    setMenuCogs(item.cogs ?? Math.round(item.price * 0.4));
    setMenuRating(item.rating || 4.9);
    setMenuReviewCount(item.reviewCount || 100);
    setMenuDescription(item.description || '');
    setMenuImageUrl(item.imageUrl || '');
    setMenuIsPopular(!!item.isPopular);
    setMenuIsSpicy(!!item.isSpicy);
    setMenuTags(item.tags ? item.tags.join(', ') : '');
    setShowMenuModal(true);
  };

  const handleSaveMenu = () => {
    if (checkReadOnlyPermission()) return;
    if (!menuName.trim()) {
      showToast('Nama menu wajib diisi!');
      return;
    }
    if (menuPrice <= 0) {
      showToast('Harga menu harus lebih dari Rp 0!');
      return;
    }

    const tagArray = menuTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    let updatedList: MenuItem[];

    if (editingMenuItemId) {
      updatedList = menuItems.map((item) =>
        item.id === editingMenuItemId
          ? {
              ...item,
              name: menuName.trim(),
              koreanName: menuKoreanName.trim() || undefined,
              category: menuCategory as any,
              price: Number(menuPrice),
              cogs: Number(menuCogs) || Math.round(Number(menuPrice) * 0.4),
              rating: Number(menuRating),
              reviewCount: Number(menuReviewCount),
              description: menuDescription.trim(),
              imageUrl: menuImageUrl.trim() || undefined,
              isPopular: menuIsPopular,
              isSpicy: menuIsSpicy,
              tags: tagArray.length > 0 ? tagArray : ['Steak 11'],
            }
          : item
      );
      showToast(`Menu "${menuName}" berhasil diperbarui!`);
    } else {
      const newSlug = 'menu-' + Date.now();
      const newItem: MenuItem = {
        id: newSlug,
        name: menuName.trim(),
        koreanName: menuKoreanName.trim() || undefined,
        category: menuCategory as any,
        price: Number(menuPrice),
        cogs: Number(menuCogs) || Math.round(Number(menuPrice) * 0.4),
        rating: Number(menuRating) || 4.9,
        reviewCount: Number(menuReviewCount) || 50,
        description: menuDescription.trim(),
        imageUrl: menuImageUrl.trim() || undefined,
        isPopular: menuIsPopular,
        isSpicy: menuIsSpicy,
        tags: tagArray.length > 0 ? tagArray : ['Steak 11'],
      };
      updatedList = [...menuItems, newItem];
      showToast(`Menu baru "${menuName}" berhasil ditambahkan!`);
    }

    setMenuItems(updatedList);
    saveMenuItems(updatedList);
    setShowMenuModal(false);
  };

  const handleDeleteMenu = (id: string) => {
    if (checkReadOnlyPermission()) return;
    const target = menuItems.find((m) => m.id === id);
    if (!target) return;
    setDeleteConfirmTarget({
      type: 'menu',
      id,
      title: `Hapus Menu "${target.name}"?`,
      description: 'Menu ini akan dihapus dari daftar dan tidak akan tampil lagi di landing page utama.',
    });
  };

  const handleTogglePopular = (id: string) => {
    if (checkReadOnlyPermission()) return;
    const updated = menuItems.map((m) =>
      m.id === id ? { ...m, isPopular: !m.isPopular } : m
    );
    setMenuItems(updated);
    saveMenuItems(updated);
    showToast('Status Best Seller menu diperbarui!');
  };

  const handleToggleSpicy = (id: string) => {
    if (checkReadOnlyPermission()) return;
    const updated = menuItems.map((m) =>
      m.id === id ? { ...m, isSpicy: !m.isSpicy } : m
    );
    setMenuItems(updated);
    saveMenuItems(updated);
    showToast('Status Pedas menu diperbarui!');
  };

  // --- Racik Steak Management Actions ---
  const handleOpenAddRacik = (type: 'chicken' | 'sauce' | 'addon') => {
    setRacikType(type);
    setEditingRacikId(null);
    if (type === 'chicken') {
      setRacikName('3 Potongan Daging Paha');
      setRacikDescription('Porsi jumbo 3 potong daging paha ayam boneless juicy');
      setRacikPrice(40000);
    } else if (type === 'sauce') {
      setRacikName('Honey Mustard Signature');
      setRacikDescription('Saus manis segar perpaduan madu dan mustard pilihan');
      setRacikSpiciness(0);
    } else {
      setRacikName('+ Keju Mozzarella Leleh');
      setRacikDescription('Lelehan keju mozzarella gurih di atas steak ayam');
      setRacikPrice(6000);
    }
    setShowRacikModal(true);
  };

  const handleEditRacik = (type: 'chicken' | 'sauce' | 'addon', item: any) => {
    setRacikType(type);
    setEditingRacikId(item.id);
    setRacikName(item.name || '');
    setRacikDescription(item.description || '');
    if (type === 'chicken') {
      setRacikPrice(item.basePrice || 0);
    } else if (type === 'addon') {
      setRacikPrice(item.price || 0);
    } else if (type === 'sauce') {
      setRacikSpiciness(item.spiciness || 0);
    }
    setShowRacikModal(true);
  };

  const handleSaveRacik = () => {
    if (!racikName.trim()) {
      showToast('Nama opsi pilihan harus diisi!');
      return;
    }

    if (racikType === 'chicken') {
      let updated = [...chickenOptions];
      if (editingRacikId) {
        updated = updated.map((c) =>
          c.id === editingRacikId
            ? { ...c, name: racikName.trim(), description: racikDescription.trim(), basePrice: Number(racikPrice) }
            : c
        );
      } else {
        updated.push({
          id: 'chicken-' + Date.now(),
          name: racikName.trim(),
          description: racikDescription.trim(),
          basePrice: Number(racikPrice)
        });
      }
      setChickenOptions(updated);
      saveChickenOptions(updated);
      showToast('Pilihan Potongan Daging berhasil disimpan!');
    } else if (racikType === 'sauce') {
      let updated = [...sauceOptions];
      if (editingRacikId) {
        updated = updated.map((s) =>
          s.id === editingRacikId
            ? { ...s, name: racikName.trim(), description: racikDescription.trim(), spiciness: Number(racikSpiciness) }
            : s
        );
      } else {
        updated.push({
          id: 'sauce-' + Date.now(),
          name: racikName.trim(),
          description: racikDescription.trim(),
          spiciness: Number(racikSpiciness)
        });
      }
      setSauceOptions(updated);
      saveSauceOptions(updated);
      showToast('Pilihan Saus Signature berhasil disimpan!');
    } else if (racikType === 'addon') {
      let updated = [...addonOptions];
      if (editingRacikId) {
        updated = updated.map((a) =>
          a.id === editingRacikId
            ? { ...a, name: racikName.trim(), description: racikDescription.trim(), price: Number(racikPrice) }
            : a
        );
      } else {
        updated.push({
          id: 'addon-' + Date.now(),
          name: racikName.trim(),
          description: racikDescription.trim(),
          price: Number(racikPrice)
        });
      }
      setAddonOptions(updated);
      saveAddonOptions(updated);
      showToast('Pilihan Add On berhasil disimpan!');
    }

    setShowRacikModal(false);
  };

  const handleDeleteRacik = (type: 'chicken' | 'sauce' | 'addon', id: string) => {
    let name = 'opsi ini';
    if (type === 'chicken') {
      const target = chickenOptions.find((c) => c.id === id);
      if (target) name = target.name;
    } else if (type === 'sauce') {
      const target = sauceOptions.find((s) => s.id === id);
      if (target) name = target.name;
    } else if (type === 'addon') {
      const target = addonOptions.find((a) => a.id === id);
      if (target) name = target.name;
    }

    setDeleteConfirmTarget({
      type: `racik-${type}` as any,
      id,
      title: `Hapus Opsi Racikan "${name}"?`,
      description: 'Opsi racikan steak ini akan dihapus dari kalkulator racikan.',
    });
  };

  // --- Employee Management Actions ---
  const handleOpenAddEmp = () => {
    setEditingEmpId(null);
    setEmpCustomId(`EMP-${(employees.length + 1).toString().padStart(3, '0')}`);
    setEmpName('');
    setEmpUsername('');
    const initialRole = roleSettings.length > 0 ? roleSettings[0] : null;
    setEmpRole(initialRole ? initialRole.name : 'Kasir');
    setEmpOutlet(locations.length > 0 ? locations[0].name : 'Steak 11, Kalisari');
    setEmpPhone('0812345678');
    setEmpDailyRate(120000);
    setEmpHourlyRate(15000);
    setEmpDailyAllowance(25000);
    setEmpPunctualityAllowance(15000);
    setEmpLatePenaltyPerDay(15000);
    setEmpOutletBonus(0);
    setEmpPin(Math.floor(1000 + Math.random() * 9000).toString());
    setEmpStatus('Aktif');
    setEmpAllowedTabs(initialRole && initialRole.allowedTabs && initialRole.allowedTabs.length > 0 ? initialRole.allowedTabs : ['kasir', 'pesanan', 'shifts', 'inventory', 'absensi']);
    setShowAddEmpModal(true);
  };

  const handleEditEmp = (emp: Employee) => {
    if (checkReadOnlyPermission()) return;
    setEditingEmpId(emp.id);
    setEmpCustomId(emp.id);
    setEmpName(emp.name);
    setEmpUsername(emp.username || '');
    setEmpRole(emp.role);
    setEmpOutlet(emp.outlet);
    setEmpPhone(emp.phone);
    setEmpDailyRate(emp.dailyRate);
    setEmpHourlyRate(emp.hourlyRate ?? 0);
    setEmpDailyAllowance(emp.dailyAllowance);
    setEmpPunctualityAllowance(emp.punctualityAllowancePerDay ?? 15000);
    setEmpLatePenaltyPerDay(emp.latePenaltyPerDay ?? 15000);
    setEmpOutletBonus(emp.outletBonus ?? 0);
    setEmpPin(emp.password || emp.pin);
    setEmpStatus(emp.status);
    setEmpAllowedTabs(emp.allowedTabs || ['kasir', 'pesanan', 'shifts', 'inventory', 'absensi']);
    setShowAddEmpModal(true);
  };

  const handleSaveEmp = () => {
    if (checkReadOnlyPermission()) return;
    if (!empName.trim()) {
      showToast('Nama karyawan wajib diisi!');
      return;
    }

    const finalEmpId = empCustomId.trim() || `EMP-${Date.now().toString().slice(-4)}`;

    const syncPayrollForEmployee = (savedEmp: Employee) => {
      const updatedSlips = (payrollSlips || []).map((s) => {
        if (
          s.employeeId === savedEmp.id ||
          (editingEmpId && s.employeeId === editingEmpId) ||
          (savedEmp.name && (s.employeeName || '').trim().toLowerCase() === savedEmp.name.trim().toLowerCase())
        ) {
          const daysPresent = s.totalDaysPresent || 0;
          const daysLate = s.totalDaysLate || 0;
          const daysOnTime = s.totalDaysOnTime ?? Math.max(0, daysPresent - daysLate);
          const totalOvertime = s.totalOvertimeHours || 0;

          const base = daysPresent * savedEmp.dailyRate;
          const allowance = daysPresent * savedEmp.dailyAllowance;
          const punctualityRate = savedEmp.punctualityAllowancePerDay ?? 15000;
          const punctualityAllowance = daysOnTime * punctualityRate;
          const hourlyRate = savedEmp.hourlyRate ?? 0;
          const overtimePay = Math.round(totalOvertime * hourlyRate);
          const outletBonus = daysPresent * (savedEmp.outletBonus ?? 0);

          const lateRate = savedEmp.latePenaltyPerDay ?? 15000;
          const empAtt = (attendance || []).filter(
            (a) => (a.employeeId === savedEmp.id || (savedEmp.name && (a.employeeName || '').toLowerCase() === savedEmp.name.toLowerCase())) && a.date.startsWith(s.periodMonth)
          );
          const daysLatePenalized = empAtt.length > 0
            ? empAtt.filter((a) => (a.lateMinutes && a.lateMinutes > latePenaltyThresholdMinutes)).length
            : daysLate;
          const latePenalty = daysLatePenalized * lateRate;

          const activeLoan = employeeLoans.find(
            (l) => l.employeeId === savedEmp.id && l.status === 'ACTIVE' && l.remainingAmount > 0
          );
          const loanDeduction = activeLoan ? Math.min(activeLoan.monthlyInstallment, activeLoan.remainingAmount) : 0;

          const existingEmp = employees.find((e) => e.id === savedEmp.id || e.id === editingEmpId);
          const oldLateRate = existingEmp?.latePenaltyPerDay ?? 15000;
          const oldLateDed = daysLatePenalized * oldLateRate;
          const otherDed = Math.max(0, (s.deductions || 0) - (oldLateDed + loanDeduction));
          const totalDeductions = latePenalty + loanDeduction + otherDed;

          const performanceBonus = s.bonus || 0;
          const net = base + allowance + punctualityAllowance + overtimePay + outletBonus + performanceBonus - totalDeductions;

          return {
            ...s,
            employeeId: savedEmp.id,
            employeeName: savedEmp.name,
            employeeRole: savedEmp.role,
            outlet: savedEmp.outlet,
            hourlyRate: hourlyRate,
            overtimePay: overtimePay,
            baseSalary: base,
            totalAllowance: allowance,
            punctualityAllowance: punctualityAllowance,
            outletBonus: outletBonus,
            deductions: totalDeductions,
            netSalary: net > 0 ? net : 0,
          };
        }
        return s;
      });

      setPayrollSlips(updatedSlips);
      savePayroll(updatedSlips);
    };

    if (editingEmpId) {
      const existing = employees.find((e) => e.id === editingEmpId);
      const updatedEmp: Employee = {
        ...(existing || {}),
        id: finalEmpId,
        name: empName.trim(),
        username: empUsername.trim() || undefined,
        password: empPin,
        pin: empPin,
        role: empRole,
        outlet: empOutlet,
        phone: empPhone,
        joinDate: existing?.joinDate || new Date().toISOString().split('T')[0],
        dailyRate: empDailyRate,
        hourlyRate: empHourlyRate,
        dailyAllowance: empDailyAllowance,
        punctualityAllowancePerDay: empPunctualityAllowance,
        latePenaltyPerDay: empLatePenaltyPerDay,
        outletBonus: empOutletBonus,
        status: empStatus,
        allowedTabs: empAllowedTabs,
      };
      updateEmployeeInCloud(updatedEmp).then((updated) => {
        setEmployees(updated);
        syncPayrollForEmployee(updatedEmp);
      });
    } else {
      const newEmp: Employee = {
        id: finalEmpId,
        name: empName.trim(),
        username: empUsername.trim() || undefined,
        password: empPin,
        pin: empPin,
        role: empRole,
        outlet: empOutlet,
        phone: empPhone,
        joinDate: new Date().toISOString().split('T')[0],
        dailyRate: empDailyRate,
        hourlyRate: empHourlyRate,
        dailyAllowance: empDailyAllowance,
        punctualityAllowancePerDay: empPunctualityAllowance,
        latePenaltyPerDay: empLatePenaltyPerDay,
        outletBonus: empOutletBonus,
        status: empStatus,
        allowedTabs: empAllowedTabs,
      };
      saveEmployeeDirectToCloud(newEmp).then((updated) => {
        setEmployees(updated);
        syncPayrollForEmployee(newEmp);
      });
    }

    setShowAddEmpModal(false);
    showToast(`✅ Data Karyawan "${empName.trim()}" & sinkronisasi Penggajian berhasil diperbarui realtime!`);
  };

  const handleDeleteEmp = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    const name = emp ? emp.name : 'Karyawan';
    setDeleteConfirmTarget({
      type: 'employee',
      id,
      title: `Hapus Karyawan "${name}"?`,
      description: 'Data karyawan dan riwayat akun ini akan dihapus dari sistem.'
    });
  };

  // --- Employee Template Download & Import Actions ---
  const handleDownloadEmployeeTemplate = () => {
    const templateData = [
      {
        'ID Karyawan': 'EMP-001',
        'Nama Lengkap': 'Budi Santoso',
        'Username': 'budi_steak',
        'Role / Jabatan': 'Chef / Cook',
        'Outlet': 'Steak 11, Kalisari',
        'No. WhatsApp': '08123456789',
        'Tanggal Bergabung': '2026-01-15',
        'Gaji Pokok Harian (Rp)': 120000,
        'Rate Lembur / Jam (Rp)': 15000,
        'Uang Makan & Transpor (Rp)': 25000,
        'Tunjangan Tepat Waktu (Rp)': 15000,
        'Denda Potongan Telat (Rp)': 15000,
        'Bonus Outlet / Hari (Rp)': 10000,
        'PIN / Password': '1234',
        'Status': 'Aktif'
      },
      {
        'ID Karyawan': 'EMP-002',
        'Nama Lengkap': 'Siti Rahma',
        'Username': 'siti_kasir',
        'Role / Jabatan': 'Kasir',
        'Outlet': 'Steak 11, Kalisari',
        'No. WhatsApp': '08987654321',
        'Tanggal Bergabung': '2026-02-01',
        'Gaji Pokok Harian (Rp)': 110000,
        'Rate Lembur / Jam (Rp)': 15000,
        'Uang Makan & Transpor (Rp)': 25000,
        'Tunjangan Tepat Waktu (Rp)': 15000,
        'Denda Potongan Telat (Rp)': 15000,
        'Bonus Outlet / Hari (Rp)': 10000,
        'PIN / Password': '5678',
        'Status': 'Aktif'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 22 },
      { wch: 18 },
      { wch: 18 },
      { wch: 22 },
      { wch: 16 },
      { wch: 18 },
      { wch: 22 },
      { wch: 22 },
      { wch: 26 },
      { wch: 26 },
      { wch: 26 },
      { wch: 20 },
      { wch: 16 },
      { wch: 12 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Karyawan');
    XLSX.writeFile(workbook, 'Template_Impor_Karyawan_Steak11.xlsx');
    showToast('Template Excel impor karyawan berhasil diunduh!');
  };

  const handleImportEmployees = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        const rawData: any[] = XLSX.utils.sheet_to_json(ws);

        if (!rawData || rawData.length === 0) {
          showToast('File yang diunggah kosong atau format tidak valid!');
          return;
        }

        let updatedList = [...employees];
        let addedCount = 0;
        let updatedCount = 0;

        rawData.forEach((row: any, idx: number) => {
          const empName = String(row['Nama Lengkap'] || row['nama'] || row['Nama'] || '').trim();
          if (!empName) return;

          const empId = String(row['ID Karyawan'] || row['id'] || row['ID'] || `EMP-${Date.now().toString().slice(-4)}${idx}`).trim();
          const username = String(row['Username'] || row['username'] || '').trim();
          const role = String(row['Role / Jabatan'] || row['Role'] || row['jabatan'] || 'Chef / Cook').trim();
          const outlet = String(row['Outlet'] || row['outlet'] || (locations[0]?.name || 'Steak 11, Kalisari')).trim();
          const phone = String(row['No. WhatsApp'] || row['phone'] || row['No HP'] || '0812345678').trim();
          const joinDate = String(row['Tanggal Bergabung'] || row['joinDate'] || new Date().toISOString().split('T')[0]).trim();
          const dailyRate = row['Gaji Pokok Harian (Rp)'] !== undefined ? Number(row['Gaji Pokok Harian (Rp)']) : (row['dailyRate'] !== undefined ? Number(row['dailyRate']) : 120000);
          const hourlyRate = row['Rate Lembur / Jam (Rp)'] !== undefined ? Number(row['Rate Lembur / Jam (Rp)']) : (row['hourlyRate'] !== undefined ? Number(row['hourlyRate']) : 0);
          const dailyAllowance = row['Uang Makan & Transpor (Rp)'] !== undefined ? Number(row['Uang Makan & Transpor (Rp)']) : (row['dailyAllowance'] !== undefined ? Number(row['dailyAllowance']) : 25000);
          const punctualityAllowance = row['Tunjangan Tepat Waktu (Rp)'] !== undefined ? Number(row['Tunjangan Tepat Waktu (Rp)']) : (row['punctualityAllowancePerDay'] !== undefined ? Number(row['punctualityAllowancePerDay']) : 15000);
          const latePenalty = row['Denda Potongan Telat (Rp)'] !== undefined ? Number(row['Denda Potongan Telat (Rp)']) : (row['latePenaltyPerDay'] !== undefined ? Number(row['latePenaltyPerDay']) : 15000);
          const outletBonus = row['Bonus Outlet / Hari (Rp)'] !== undefined ? Number(row['Bonus Outlet / Hari (Rp)']) : (row['Bonus Outlet (Rp)'] !== undefined ? Number(row['Bonus Outlet (Rp)']) : (row['outletBonus'] !== undefined ? Number(row['outletBonus']) : 0));
          const pin = String(row['PIN / Password'] || row['pin'] || row['password'] || '1234').trim();
          const statusRaw = String(row['Status'] || row['status'] || 'Aktif').trim();
          const status: 'Aktif' | 'Non-Aktif' = statusRaw.toLowerCase().includes('non') ? 'Non-Aktif' : 'Aktif';

          const existingIndex = updatedList.findIndex((item) => item.id.toLowerCase() === empId.toLowerCase());

          const newEmployee: Employee = {
            id: empId,
            name: empName,
            username: username || undefined,
            password: pin,
            pin: pin,
            role,
            outlet,
            phone,
            joinDate,
            dailyRate: isNaN(dailyRate) ? 120000 : dailyRate,
            hourlyRate: isNaN(hourlyRate) ? 0 : hourlyRate,
            dailyAllowance: isNaN(dailyAllowance) ? 25000 : dailyAllowance,
            punctualityAllowancePerDay: isNaN(punctualityAllowance) ? 15000 : punctualityAllowance,
            latePenaltyPerDay: isNaN(latePenalty) ? 15000 : latePenalty,
            outletBonus: isNaN(outletBonus) ? 0 : outletBonus,
            status,
            allowedTabs: ['kasir', 'pesanan', 'shifts', 'inventory', 'absensi']
          };

          if (existingIndex >= 0) {
            updatedList[existingIndex] = { ...updatedList[existingIndex], ...newEmployee };
            updatedCount++;
          } else {
            updatedList.push(newEmployee);
            addedCount++;
          }
        });

        setEmployees(updatedList);
        saveEmployees(updatedList);
        showToast(`Impor Berhasil! ${addedCount} karyawan baru ditambahkan, ${updatedCount} diperbarui.`);
      } catch (error) {
        console.error('Error importing employee data:', error);
        showToast('Gagal memproses file. Pastikan format file Excel/CSV sesuai template!');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleRefreshEmployees = async () => {
    setIsRefreshingEmployees(true);
    try {
      const remoteEmployees = await refreshEmployeesFromFirebase();
      if (remoteEmployees && remoteEmployees.length > 0) {
        saveEmployees(remoteEmployees);
        setEmployees(remoteEmployees);
        showToast('Data karyawan berhasil disinkronkan & diperbarui dari Cloud Firestore!');
      } else {
        const local = getStoredEmployees();
        setEmployees(local);
        showToast('Data karyawan diperbarui dari memori lokal.');
      }
    } catch (err) {
      console.error('Error refreshing employees:', err);
      const local = getStoredEmployees();
      setEmployees(local);
      showToast('Data karyawan diperbarui dari memori lokal.');
    } finally {
      setIsRefreshingEmployees(false);
    }
  };

  const handleExportEmployeesXlsx = () => {
    if (!employees || employees.length === 0) {
      showToast('Tidak ada data karyawan untuk diekspor.');
      return;
    }

    const dataToExport = employees.map((emp, index) => ({
      'No': index + 1,
      'ID Karyawan': emp.id,
      'Nama Lengkap': emp.name,
      'Username': emp.username || '-',
      'Role / Jabatan': emp.role,
      'Outlet': emp.outlet,
      'No. WhatsApp': emp.phone,
      'Tanggal Bergabung': emp.joinDate || '-',
      'Gaji Pokok Harian (Rp)': emp.dailyRate,
      'Rate Lembur / Jam (Rp)': emp.hourlyRate,
      'Uang Makan & Transpor (Rp)': emp.dailyAllowance,
      'Tunjangan Tepat Waktu (Rp)': emp.punctualityAllowancePerDay || 0,
      'Denda Potongan Telat (Rp)': emp.latePenaltyPerDay || 0,
      'Bonus Outlet / Hari (Rp)': emp.outletBonus || 0,
      'PIN / Password': emp.password || emp.pin || '-',
      'Status': emp.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 15 },
      { wch: 22 },
      { wch: 18 },
      { wch: 18 },
      { wch: 22 },
      { wch: 16 },
      { wch: 18 },
      { wch: 22 },
      { wch: 22 },
      { wch: 26 },
      { wch: 26 },
      { wch: 26 },
      { wch: 20 },
      { wch: 16 },
      { wch: 12 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Karyawan');
    const todayDate = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Data_Karyawan_Steak11_${todayDate}.xlsx`);
    showToast('Data karyawan berhasil diekspor ke file Excel (.xlsx)!');
  };

  // --- Attendance Actions ---
  const handleRefreshAttendance = async () => {
    showToast('🔄 Menghubungkan ke Cloud Firestore & menyinkronkan data presensi...');
    const refreshed = await pullAttendanceFromFirestore();
    setAttendance(refreshed);
    showToast(`✅ Data presensi berhasil disinkronkan (${refreshed.length} data terbaca dari Cloud Firestore & Local)!`);
  };

  const handleDownloadAttendanceXlsx = () => {
    if (filteredAttendance.length === 0) {
      showToast('Tidak ada data absensi untuk diunduh.');
      return;
    }
    const dataToExport = filteredAttendance.map((rec, index) => ({
      'No': index + 1,
      'ID Absensi': rec.id,
      'ID Karyawan': rec.employeeId,
      'Nama Karyawan': rec.employeeName,
      'Tanggal': rec.date,
      'Outlet Jaga': rec.outlet,
      'Jam Masuk': rec.clockInTime,
      'Status Masuk': rec.clockInStatus || 'Tepat Waktu',
      'Terlambat (Menit)': rec.lateMinutes || 0,
      'Jam Pulang': rec.clockOutTime || 'Masih Bertugas',
      'Status Pulang': rec.clockOutStatus || '-',
      'Pulang Awal (Menit)': rec.earlyOutMinutes || 0,
      'Durasi Kerja (Jam)': rec.hoursWorked || 0,
      'Status Presensi': rec.status,
      'Lokasi / GPS': rec.locationName || 'GPS Verified',
      'Catatan': rec.notes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Absensi');

    const todayDate = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Rekap_Absensi_Steak11_${todayDate}.xlsx`);
    showToast('File Excel .xlsx berhasil diunduh!');
  };

  const handleDownloadAttendancePdf = () => {
    if (filteredAttendance.length === 0) {
      showToast('Tidak ada data absensi untuk diekspor ke PDF.');
      return;
    }

    const doc = new jsPDF('landscape');
    const todayDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('STEAK 11 - LAPORAN REKAP PRESENSI DIGITAL SHIFT KARYAWAN', 14, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tanggal Cetak: ${todayDate} | Filter Outlet: ${attOutletFilter === 'ALL' ? 'Semua Outlet' : attOutletFilter}`, 14, 25);
    doc.text(`Total Presensi: ${filteredAttendance.length} Record`, 14, 30);

    const tableColumn = [
      'No',
      'Nama Karyawan',
      'Tanggal',
      'Outlet',
      'Jam Masuk',
      'Jam Pulang',
      'Jam Kerja',
      'Status',
      'Catatan'
    ];

    const tableRows = filteredAttendance.map((rec, index) => [
      index + 1,
      rec.employeeName,
      rec.date,
      rec.outlet,
      rec.clockInTime + (rec.lateMinutes ? ` (L:${rec.lateMinutes}m)` : ''),
      rec.clockOutTime || 'Bertugas',
      `${rec.hoursWorked || 0} jam`,
      rec.status,
      rec.notes || '-'
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [61, 18, 89], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 245, 250] },
    });

    const fileDate = new Date().toISOString().split('T')[0];
    doc.save(`Laporan_Absensi_Steak11_${fileDate}.pdf`);
    showToast('File PDF rekap absensi berhasil diunduh!');
  };

  const syncAttendanceSheets = (silent = false) => {
    const gasUrl = getStoredGasUrl();
    if (!gasUrl) {
      if (!silent) {
        showToast('URL Google Apps Script belum diset!');
        onOpenGasModal();
      }
      return;
    }

    if (!silent) showToast('Menghubungkan ke Google Sheets untuk sinkronisasi absensi...');

    fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'sync_attendance',
        attendance: attendance
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && (data.status === 'success' || data.attendance)) {
          if (Array.isArray(data.attendance) && data.attendance.length > 0) {
            setAttendance(data.attendance);
            saveAttendance(data.attendance);
          }
          if (!silent) showToast('Berhasil sinkronisasi data absensi dengan Google Spreadsheet!');
        } else {
          if (!silent) showToast('Data absensi terkirim & tersinkron ke Spreadsheet!');
        }
      })
      .catch((err) => {
        console.error('Attendance GAS Sync Error:', err);
        fetch(`${gasUrl}?type=attendance`)
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data) && data.length > 0) {
              setAttendance(data);
              saveAttendance(data);
              if (!silent) showToast('Berhasil menarik data absensi dari Google Sheets!');
            } else {
              if (!silent) showToast('Koneksi Google Sheets aktif.');
            }
          })
          .catch(() => {
            if (!silent) showToast('Gagal terhubung ke Google Sheets.');
          });
      });
  };

  const handleOpenEditAttendance = (rec: AttendanceRecord) => {
    if (checkReadOnlyPermission()) return;
    setEditingAttId(rec.id);
    setAttEditEmpName(rec.employeeName);
    setAttEditDate(rec.date);
    setAttEditOutlet(rec.outlet);
    setAttEditClockIn(rec.clockInTime);
    setAttEditClockInStatus(rec.clockInStatus || 'Tepat Waktu');
    setAttEditLateMinutes(rec.lateMinutes || 0);
    setAttEditClockOut(rec.clockOutTime || '');
    setAttEditClockOutStatus(rec.clockOutStatus || 'Pulang Tepat Waktu');
    setAttEditEarlyOutMinutes(rec.earlyOutMinutes || 0);
    setAttEditHoursWorked(rec.hoursWorked || 0);
    setAttEditStatus(rec.status);
    setAttEditNotes(rec.notes || '');
    setShowEditAttModal(true);
  };

  const handleSaveEditAttendance = async () => {
    if (checkReadOnlyPermission()) return;
    if (!editingAttId) return;

    const existingRec = attendance.find((a) => a.id === editingAttId);
    if (!existingRec) return;

    const updatedRec: AttendanceRecord = {
      ...existingRec,
      employeeName: attEditEmpName,
      date: attEditDate,
      outlet: attEditOutlet,
      clockInTime: attEditClockIn,
      clockInStatus: attEditClockInStatus,
      lateMinutes: Number(attEditLateMinutes) || 0,
      clockOutTime: attEditClockOut || undefined,
      clockOutStatus: attEditClockOutStatus,
      earlyOutMinutes: Number(attEditEarlyOutMinutes) || 0,
      hoursWorked: Number(attEditHoursWorked) || 0,
      status: attEditStatus,
      notes: attEditNotes,
      updatedAt: new Date().toISOString()
    };

    const updated = await updateAttendanceRecordInCloud(updatedRec);
    setAttendance(updated);
    setShowEditAttModal(false);
    setEditingAttId(null);
    showToast('✅ Data rekam absensi berhasil diperbarui di Cloud Firestore!');
  };

  const filteredAttendance = (attendance || []).filter((a) => {
    const searchLower = attSearchTerm.toLowerCase().trim();
    const matchSearch =
      !searchLower ||
      (a.employeeName || '').toLowerCase().includes(searchLower) ||
      (a.employeeId || '').toLowerCase().includes(searchLower) ||
      (a.outlet || '').toLowerCase().includes(searchLower) ||
      (a.notes || '').toLowerCase().includes(searchLower) ||
      (a.status || '').toLowerCase().includes(searchLower);
    const matchOutlet =
      attOutletFilter === 'ALL' ||
      (a.outlet || '').toLowerCase().trim() === attOutletFilter.toLowerCase().trim() ||
      (a.outlet || '').toLowerCase().trim().includes(attOutletFilter.toLowerCase().trim()) ||
      attOutletFilter.toLowerCase().trim().includes((a.outlet || '').toLowerCase().trim());
    const matchDate = !attDateFilter || a.date === attDateFilter;
    return matchSearch && matchOutlet && matchDate;
  });

  const handleDeleteAttendance = (id: string) => {
    if (checkReadOnlyPermission()) return;
    const att = (attendance || []).find((a) => a.id === id);
    const name = att ? `${att.employeeName} (${att.date})` : 'Rekam absensi';
    setDeleteConfirmTarget({
      type: 'attendance',
      id,
      title: `Hapus Absensi ${name}?`,
      description: 'Data rekam absensi ini akan dihapus dari rekapitulasi.'
    });
  };

  // --- Payroll Logic & Actions ---
  // Generate or recalculate payroll slips for active employees based on real attendance records
  const handleCalculatePayroll = () => {
    const periodLabelMonth = new Date(payrollPeriod + '-01').toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    });

    const generatedSlips: PayrollSlip[] = (employees || [])
      .filter((emp) => emp.status === 'Aktif')
      .map((emp) => {
        // Find attendance for this employee in the selected YYYY-MM period
        const empAtt = (attendance || []).filter(
          (a) => (a.employeeId === emp.id || (emp.name && (a.employeeName || '').toLowerCase() === emp.name.toLowerCase())) && a.date.startsWith(payrollPeriod)
        );

        const daysPresent = empAtt.filter((a) => a.status === 'Hadir' || a.status === 'Terlambat').length;
        const daysLate = empAtt.filter((a) => a.status === 'Terlambat' || a.clockInStatus === 'Terlambat Masuk' || (a.lateMinutes && a.lateMinutes > 0)).length;
        const daysLatePenalized = empAtt.filter((a) => a.lateMinutes && a.lateMinutes > latePenaltyThresholdMinutes).length;
        const daysOnTime = empAtt.filter(
          (a) =>
            a.status === 'Hadir' &&
            a.clockInStatus !== 'Terlambat Masuk' &&
            (!a.lateMinutes || a.lateMinutes === 0)
        ).length;
        const totalLateMinutes = empAtt.reduce((sum, a) => sum + (a.lateMinutes || 0), 0);

        const totalHours = empAtt.reduce((sum, a) => sum + (a.hoursWorked || 8), 0);

        // Perhitungan Lembur: jam kerja di atas 8 jam per shift
        const totalOvertimeHours = empAtt.reduce((acc, a) => {
          const shiftHrs = a.hoursWorked || 8;
          return acc + (shiftHrs > 8 ? Math.round(shiftHrs - 8) : 0);
        }, 0);
        const hourlyRate = emp.hourlyRate ?? 0;
        const overtimePay = Math.round(totalOvertimeHours * hourlyRate);

        // Standard calculation
        const base = daysPresent * emp.dailyRate;
        const allowance = daysPresent * emp.dailyAllowance;
        const punctualityRate = emp.punctualityAllowancePerDay ?? 15000;
        const punctualityAllowance = daysOnTime * punctualityRate;
        const latePenaltyRateForEmp = emp.latePenaltyPerDay ?? 15000;
        const latePenalty = daysLatePenalized * latePenaltyRateForEmp;
        const outletBonus = daysPresent * (emp.outletBonus ?? 0);

        // Check if existing slip preserved custom bonus
        const existingSlip = payrollSlips.find(
          (s) => s.employeeId === emp.id && s.periodMonth === payrollPeriod
        );
        const activeLoan = employeeLoans.find((l) => l.employeeId === emp.id && l.status === 'ACTIVE' && l.remainingAmount > 0);
        const loanDeduction = activeLoan ? Math.min(activeLoan.monthlyInstallment, activeLoan.remainingAmount) : 0;

        const bonus = existingSlip ? existingSlip.bonus : 100000;

        // Perfect integration of deductions: Late Penalty + Active Kasbon Loan Deduction
        const deductions = latePenalty + loanDeduction;

        const net = base + allowance + punctualityAllowance + overtimePay + outletBonus + bonus - deductions;

        return {
          id: `PAY-${payrollPeriod.replace('-', '')}-${emp.id}`,
          employeeId: emp.id,
          employeeName: emp.name,
          employeeRole: emp.role,
          outlet: emp.outlet,
          periodMonth: payrollPeriod,
          periodLabel: periodLabelMonth,
          totalDaysPresent: daysPresent,
          totalDaysLate: daysLate,
          totalLateMinutes: totalLateMinutes,
          totalDaysOnTime: daysOnTime,
          totalHoursWorked: Math.round(totalHours),
          hourlyRate: hourlyRate,
          totalOvertimeHours: totalOvertimeHours,
          overtimePay: overtimePay,
          baseSalary: base,
          totalAllowance: allowance,
          punctualityAllowance: punctualityAllowance,
          outletBonus: outletBonus,
          bonus: bonus,
          deductions: deductions,
          netSalary: net > 0 ? net : 0,
          paymentStatus: existingSlip ? existingSlip.paymentStatus : 'Draft',
          paymentDate: existingSlip?.paymentDate || new Date().toISOString().split('T')[0],
          note: existingSlip?.note || 'Gaji Pokok + Uang Makan + Upah Lembur + Tunjangan Tepat Waktu + Bonus Outlet + Bonus Kinerja',
        };
      });

    setPayrollSlips(generatedSlips);
    savePayroll(generatedSlips);
    showToast(`Berhasil menghitung otomatis slip penggajian untuk periode ${periodLabelMonth}!`);
  };

  const syncPayrollSheets = (silent = false) => {
    const gasUrl = getStoredGasUrl();
    if (!gasUrl) {
      if (!silent) {
        showToast('URL Google Apps Script belum diset!');
        onOpenGasModal();
      }
      return;
    }

    if (!silent) showToast('Menghubungkan ke Google Sheets untuk sinkronisasi penggajian...');

    fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'sync_payroll',
        payroll: payrollSlips
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && (data.status === 'success' || data.payroll)) {
          if (Array.isArray(data.payroll) && data.payroll.length > 0) {
            setPayrollSlips(data.payroll);
            savePayroll(data.payroll);
          }
          if (!silent) showToast('Berhasil sinkronisasi data penggajian dengan Google Spreadsheet!');
        } else {
          if (!silent) showToast('Data slip gaji terkirim & tersinkron ke Spreadsheet!');
        }
      })
      .catch((err) => {
        console.error('Payroll GAS Sync Error:', err);
        fetch(`${gasUrl}?type=payroll`)
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data) && data.length > 0) {
              setPayrollSlips(data);
              savePayroll(data);
              if (!silent) showToast('Berhasil menarik data penggajian dari Google Sheets!');
            } else {
              if (!silent) showToast('Koneksi Google Sheets aktif.');
            }
          })
          .catch(() => {
            if (!silent) showToast('Gagal terhubung ke Google Sheets.');
          });
      });
  };

  const filteredPayroll = (payrollSlips || []).filter((slip) => {
    const matchSearch =
      (slip.employeeName || '').toLowerCase().includes(payrollSearchTerm.toLowerCase()) ||
      (slip.employeeId || '').toLowerCase().includes(payrollSearchTerm.toLowerCase());
    const matchOutlet = payrollOutletFilter === 'ALL' || slip.outlet === payrollOutletFilter;
    return matchSearch && matchOutlet;
  });

  const handlePrintMonthlyPayrollReport = () => {
    if (filteredPayroll.length === 0) {
      showToast('Tidak ada data penggajian untuk dicetak PDF!');
      return;
    }

    const doc = new jsPDF('landscape');
    const periodLabelMonth = new Date(payrollPeriod + '-01').toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    });

    // Top Header Banner (Purple + Gold Accent)
    doc.setFillColor(61, 18, 89);
    doc.rect(0, 0, 297, 30, 'F');
    doc.setFillColor(255, 193, 7);
    doc.rect(0, 30, 297, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 193, 7);
    doc.text('STEAK 11 • LAPORAN REKAPITULASI PENGGAJIAN BULANAN', 14, 15);

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(235, 230, 245);
    doc.text(`Periode: ${periodLabelMonth} | Total Slip Gaji: ${filteredPayroll.length} Karyawan | Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 23);

    // Summary Metric Cards
    const totalNetBudget = filteredPayroll.reduce((acc, c) => acc + c.netSalary, 0);
    const totalBaseSalary = filteredPayroll.reduce((acc, c) => acc + c.baseSalary, 0);
    const totalAllowance = filteredPayroll.reduce((acc, c) => acc + c.totalAllowance, 0);
    const totalOvertime = filteredPayroll.reduce((acc, c) => acc + (c.overtimePay || 0), 0);

    // Summary Card 1 (Gaji Bersih)
    doc.setFillColor(248, 245, 250);
    doc.setDrawColor(220, 210, 230);
    doc.roundedRect(14, 37, 85, 18, 2, 2, 'FD');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 120);
    doc.text('TOTAL TAKE HOME PAY (GAJI BERSIH):', 18, 43);
    doc.setFontSize(11);
    doc.setTextColor(61, 18, 89);
    doc.text(formatRupiah(totalNetBudget), 18, 51);

    // Summary Card 2 (Gaji Pokok & Makan)
    doc.roundedRect(104, 37, 85, 18, 2, 2, 'FD');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 120);
    doc.text('TOTAL GAJI POKOK & TUNJANGAN:', 108, 43);
    doc.setFontSize(11);
    doc.setTextColor(16, 185, 129);
    doc.text(formatRupiah(totalBaseSalary + totalAllowance), 108, 51);

    // Summary Card 3 (Upah Lembur)
    doc.roundedRect(194, 37, 89, 18, 2, 2, 'FD');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 120);
    doc.text('TOTAL UPAH LEMBUR KARYAWAN:', 198, 43);
    doc.setFontSize(11);
    doc.setTextColor(37, 99, 235);
    doc.text(formatRupiah(totalOvertime), 198, 51);

    const tableColumn = [
      'No',
      'Nama Karyawan',
      'Jabatan / Outlet',
      'Hadir',
      'Tepat',
      'Jam',
      'Lembur',
      'Gaji Pokok',
      'Tunj. Makan',
      'Upah Lembur',
      'Tunj. Hadir',
      'Bonus Outlet',
      'Bonus Kinerja',
      'Potongan',
      'Gaji Bersih',
      'Status'
    ];

    const tableRows = filteredPayroll.map((rec, index) => [
      index + 1,
      rec.employeeName,
      `${rec.employeeRole}\n(${rec.outlet})`,
      `${rec.totalDaysPresent} hr`,
      `${rec.totalDaysOnTime ?? (rec.totalDaysPresent - rec.totalDaysLate)} hr`,
      `${rec.totalHoursWorked} jm`,
      `${rec.totalOvertimeHours || 0} jm`,
      formatRupiah(rec.baseSalary),
      formatRupiah(rec.totalAllowance),
      formatRupiah(rec.overtimePay || 0),
      formatRupiah(rec.punctualityAllowance || 0),
      formatRupiah(rec.outletBonus || 0),
      formatRupiah(rec.bonus),
      formatRupiah(rec.deductions),
      formatRupiah(rec.netSalary),
      rec.paymentStatus
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [61, 18, 89], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
      alternateRowStyles: { fillColor: [250, 247, 253] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        1: { fontStyle: 'bold', cellWidth: 26 },
        2: { cellWidth: 26 },
        3: { halign: 'center', cellWidth: 12 },
        4: { halign: 'center', cellWidth: 12 },
        5: { halign: 'center', cellWidth: 12 },
        6: { halign: 'center', cellWidth: 12 },
        7: { halign: 'right', cellWidth: 18 },
        8: { halign: 'right', cellWidth: 16 },
        9: { halign: 'right', cellWidth: 16 },
        10: { halign: 'right', cellWidth: 16 },
        11: { halign: 'right', cellWidth: 16 },
        12: { halign: 'right', cellWidth: 16 },
        13: { halign: 'right', cellWidth: 16 },
        14: { halign: 'right', fontStyle: 'bold', cellWidth: 21 },
        15: { halign: 'center', cellWidth: 18 }
      }
    });

    const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 12 : 160;

    let currentY = finalY;
    if (currentY > 185) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(61, 18, 89);
    doc.text(`Ringkasan: Total Pengeluaran Gaji Bersih Periode ${periodLabelMonth} adalah ${formatRupiah(totalNetBudget)}`, 14, currentY);

    // Signature Area
    const sigY = currentY + 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text(`Jakarta, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 220, sigY);
    doc.text('Dibuat & Disetujui oleh,', 220, sigY + 6);
    doc.setFont('helvetica', 'bold');
    doc.text('Manajer HR & Operational Steak 11', 220, sigY + 28);

    const fileDate = new Date().toISOString().split('T')[0];
    doc.save(`Laporan_Penggajian_Steak11_${payrollPeriod}_${fileDate}.pdf`);
    showToast('Berhasil mengunduh Laporan Rekapitulasi Penggajian Bulanan!');
  };

  const handleDownloadExcelPayroll = () => {
    if (filteredPayroll.length === 0) {
      showToast('Tidak ada data penggajian untuk diekspor ke Excel!');
      return;
    }

    const dataToExport = filteredPayroll.map((rec, index) => ({
      'No': index + 1,
      'ID Slip': rec.id,
      'ID Karyawan': rec.employeeId,
      'Nama Karyawan': rec.employeeName,
      'Jabatan': rec.employeeRole,
      'Outlet': rec.outlet,
      'Periode': rec.period,
      'Hari Hadir': rec.totalDaysPresent,
      'Hari Telat': rec.totalDaysLate,
      'Total Menit Telat': rec.totalLateMinutes || 0,
      'Total Jam Kerja': rec.totalHoursWorked,
      'Rate Lembur / Jam': rec.hourlyRate ?? 0,
      'Jam Lembur': rec.totalOvertimeHours || 0,
      'Gaji Pokok': rec.baseSalary,
      'Tunjangan Makan': rec.totalAllowance,
      'Upah Lembur': rec.overtimePay || 0,
      'Tunjangan Tepat Waktu': rec.punctualityAllowance || 0,
      'Bonus Outlet': rec.outletBonus || 0,
      'Bonus Kinerja': rec.bonus,
      'Potongan / Denda': rec.deductions,
      'Gaji Bersih': rec.netSalary,
      'Status Pembayaran': rec.paymentStatus,
      'Tanggal Bayar': rec.paymentDate || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Penggajian');

    const fileDate = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Rekap_Penggajian_Steak11_${payrollPeriod}_${fileDate}.xlsx`);
    showToast('File Excel .xlsx rekap penggajian berhasil diunduh!');
  };

  const processLoanDeductionOnPayrollPaid = (slip: PayrollSlip, currentLoans: EmployeeLoan[]) => {
    let loansUpdated = false;
    const updatedLoans = currentLoans.map((loan) => {
      if (loan.employeeId === slip.employeeId && loan.status === 'ACTIVE' && loan.remainingAmount > 0) {
        const alreadyPaid = loan.history.some((h) => h.period === slip.periodMonth);
        if (!alreadyPaid) {
          const installment = Math.min(loan.monthlyInstallment, loan.remainingAmount);
          const newRemaining = Math.max(0, loan.remainingAmount - installment);
          const newStatus = newRemaining === 0 ? 'PAID_OFF' : 'ACTIVE';
          const newLog = {
            id: `PAY-${slip.id}`,
            period: slip.periodMonth,
            amountPaid: installment,
            datePaid: new Date().toISOString().split('T')[0],
            notes: `Potongan Otomatis Slip Gaji Periode ${slip.periodLabel}`
          };
          loansUpdated = true;
          return {
            ...loan,
            remainingAmount: newRemaining,
            status: newStatus as any,
            history: [newLog, ...loan.history]
          };
        }
      }
      return loan;
    });

    if (loansUpdated) {
      setEmployeeLoans(updatedLoans);
      saveEmployeeLoans(updatedLoans);
    }
  };

  const handleUpdatePayrollStatus = (id: string, newStatus: 'Draft' | 'Disetujui' | 'Lunas / Terbayar') => {
    const slip = payrollSlips.find((s) => s.id === id);
    const updated = payrollSlips.map((s) =>
      s.id === id ? { ...s, paymentStatus: newStatus, paymentDate: new Date().toISOString().split('T')[0] } : s
    );
    setPayrollSlips(updated);
    savePayroll(updated);

    if (newStatus === 'Lunas / Terbayar' && slip) {
      processLoanDeductionOnPayrollPaid(slip, employeeLoans);
    }
    showToast('Status pembayaran gaji diperbarui!');
  };

  const handleBatchUpdatePayrollStatus = (targetStatus: 'Disetujui' | 'Lunas / Terbayar') => {
    if (payrollSlips.length === 0) return;
    const updated = payrollSlips.map((s) => ({
      ...s,
      paymentStatus: targetStatus,
      paymentDate: new Date().toISOString().split('T')[0]
    }));
    setPayrollSlips(updated);
    savePayroll(updated);

    if (targetStatus === 'Lunas / Terbayar') {
      payrollSlips.forEach((slip) => {
        processLoanDeductionOnPayrollPaid(slip, employeeLoans);
      });
    }
    showToast(`Semua slip gaji berhasil diubah menjadi ${targetStatus}!`);
  };

  const handleOpenEditPayroll = (slip: PayrollSlip) => {
    const activeLoan = employeeLoans.find((l) => l.employeeId === slip.employeeId && l.status === 'ACTIVE' && l.remainingAmount > 0);
    const loanDed = activeLoan ? Math.min(activeLoan.monthlyInstallment, activeLoan.remainingAmount) : 0;
    const emp = employees.find((e) => e.id === slip.employeeId);
    const lateRate = emp?.latePenaltyPerDay ?? 15000;
    const lateDed = slip.totalDaysLate * lateRate;
    const otherDed = Math.max(0, slip.deductions - (lateDed + loanDed));

    setEditingSlipId(slip.id);
    setEditBaseSalary(slip.baseSalary);
    setEditAllowance(slip.totalAllowance);
    setEditPunctualityAllowance(slip.punctualityAllowance || 0);
    setEditOvertimePay(slip.overtimePay || 0);
    setEditOutletBonus(slip.outletBonus ?? (slip.totalDaysPresent * (emp?.outletBonus || 0)));
    setEditBonus(slip.bonus);
    setEditLatePenalty(lateDed);
    setEditLoanDeduction(loanDed);
    setEditOtherDeductions(otherDed);
    setEditDeductions(lateDed + loanDed + otherDed);
    setEditNote(slip.note || '');
  };

  const handleSavePayrollEdit = () => {
    if (!editingSlipId) return;

    const targetSlip = payrollSlips.find((s) => s.id === editingSlipId);

    const updated = payrollSlips.map((s) => {
      if (s.id === editingSlipId) {
        const net = Number(editBaseSalary) + Number(editAllowance) + Number(editPunctualityAllowance) + Number(editOvertimePay) + Number(editOutletBonus) + Number(editBonus) - Number(editDeductions);
        return {
          ...s,
          baseSalary: Number(editBaseSalary),
          totalAllowance: Number(editAllowance),
          punctualityAllowance: Number(editPunctualityAllowance),
          overtimePay: Number(editOvertimePay),
          outletBonus: Number(editOutletBonus),
          bonus: Number(editBonus),
          deductions: Number(editDeductions),
          netSalary: net > 0 ? net : 0,
          note: editNote,
        };
      }
      return s;
    });

    // Sync edited rates back to Employee Master Data if enabled
    if (targetSlip && syncToEmployeeMaster) {
      let targetEmpToUpdate: Employee | null = null;
      const updatedEmps = employees.map((emp) => {
        if (emp.id === targetSlip.employeeId) {
          const newDailyRate = targetSlip.totalDaysPresent > 0 ? Math.round(Number(editBaseSalary) / targetSlip.totalDaysPresent) : emp.dailyRate;
          const newAllowance = targetSlip.totalDaysPresent > 0 ? Math.round(Number(editAllowance) / targetSlip.totalDaysPresent) : emp.dailyAllowance;
          const newHourlyRate = (targetSlip.totalOvertimeHours && targetSlip.totalOvertimeHours > 0) ? Math.round(Number(editOvertimePay) / targetSlip.totalOvertimeHours) : (emp.hourlyRate ?? 0);
          const newPunctuality = (targetSlip.totalDaysOnTime && targetSlip.totalDaysOnTime > 0) ? Math.round(Number(editPunctualityAllowance) / targetSlip.totalDaysOnTime) : (emp.punctualityAllowancePerDay ?? 15000);
          const newLatePenalty = targetSlip.totalDaysLate > 0 ? Math.round(Number(editLatePenalty) / targetSlip.totalDaysLate) : (emp.latePenaltyPerDay ?? 15000);
          const newOutletBonus = targetSlip.totalDaysPresent > 0 ? Math.round(Number(editOutletBonus) / targetSlip.totalDaysPresent) : (emp.outletBonus ?? 0);
          const updatedTarget: Employee = {
            ...emp,
            dailyRate: newDailyRate,
            dailyAllowance: newAllowance,
            hourlyRate: newHourlyRate,
            punctualityAllowancePerDay: newPunctuality,
            latePenaltyPerDay: newLatePenalty,
            outletBonus: newOutletBonus
          };
          targetEmpToUpdate = updatedTarget;
          return updatedTarget;
        }
        return emp;
      });
      setEmployees(updatedEmps);
      saveEmployees(updatedEmps);
      if (targetEmpToUpdate) {
        updateEmployeeInCloud(targetEmpToUpdate);
      }
    }

    setPayrollSlips(updated);
    savePayroll(updated);
    setEditingSlipId(null);
    showToast(syncToEmployeeMaster ? 'Rincian slip & tarif Data Master Karyawan berhasil diperbarui!' : 'Rincian slip gaji berhasil diperbarui!');
  };

  const handlePrintPayrollPdf = (slip: PayrollSlip) => {
    const doc = new jsPDF();

    // Elegant Top Header Bar (Imperial Purple + Gold Border)
    doc.setFillColor(61, 18, 89);
    doc.rect(0, 0, 210, 36, 'F');
    doc.setFillColor(255, 193, 7);
    doc.rect(0, 36, 210, 2.5, 'F');

    // Company Brand Name & Badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 193, 7);
    doc.text('STEAK 11 • MYTHIC CHICKEN TASTE', 14, 13);

    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('SLIP GAJI KARYAWAN OFFICIAL', 14, 23);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(230, 220, 245);
    doc.text(`Periode Slip: ${slip.periodLabel}  |  No. Dokumen: SLIP/${slip.periodMonth}/${slip.employeeId}`, 14, 31);

    // Right Header Badge (Payment Status)
    const statusColor = slip.paymentStatus === 'Lunas / Terbayar' ? [16, 185, 129] : slip.paymentStatus === 'Disetujui' ? [59, 130, 246] : [245, 158, 11];
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.roundedRect(145, 10, 51, 18, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('STATUS GAJI', 170.5, 17, { align: 'center' });
    doc.setFontSize(9.5);
    doc.text(slip.paymentStatus.toUpperCase(), 170.5, 24, { align: 'center' });

    // Employee Info Card (Soft Slate Card)
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 43, 182, 28, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(61, 18, 89);
    doc.text('INFORMASI DATA KARYAWAN', 20, 51);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(`Nama Karyawan  : `, 20, 58);
    doc.setFont('helvetica', 'bold');
    doc.text(slip.employeeName, 52, 58);

    doc.setFont('helvetica', 'normal');
    doc.text(`ID & Jabatan      : ${slip.employeeId} - ${slip.employeeRole}`, 20, 65);

    doc.text(`Lokasi Outlet     : `, 115, 58);
    doc.setFont('helvetica', 'bold');
    doc.text(slip.outlet, 145, 58);

    doc.setFont('helvetica', 'normal');
    doc.text(`Tanggal Cetak   : ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 115, 65);

    // Table breakdown
    const breakdownData = [
      ['[ PRESENSI ] Hari Hadir Kerja', `${slip.totalDaysPresent} Hari`, '-'],
      ['[ PRESENSI ] Hari Tepat Waktu', `${slip.totalDaysOnTime ?? (slip.totalDaysPresent - slip.totalDaysLate)} Hari`, '-'],
      ['[ PRESENSI ] Total Jam Kerja Shift', `${slip.totalHoursWorked} Jam`, '-'],
      ['[ LEMBUR ] Total Jam Lembur', `${slip.totalOvertimeHours || 0} Jam`, formatRupiah(slip.overtimePay || 0)],
      ['[ PENDAPATAN ] Gaji Pokok Kehadiran', '-', formatRupiah(slip.baseSalary)],
      ['[ PENDAPATAN ] Tunjangan Makan & Transpor', '-', formatRupiah(slip.totalAllowance)],
      ['[ PENDAPATAN ] Tunjangan Hadir Tepat Waktu', '-', formatRupiah(slip.punctualityAllowance || 0)],
      ['[ PENDAPATAN ] Bonus Target Omset Outlet', '-', formatRupiah(slip.outletBonus || 0)],
      ['[ PENDAPATAN ] Bonus Kinerja & Insentif', '-', formatRupiah(slip.bonus)],
      ['[ POTONGAN ] Potongan Kasbon / Keterlambatan', '-', `- ${formatRupiah(slip.deductions)}`],
      ['TOTAL GAJI BERSIH (TAKE HOME PAY)', '-', formatRupiah(slip.netSalary)],
    ];

    autoTable(doc, {
      startY: 75,
      head: [['Komponen Rincian Penggajian', 'Volume / Presensi', 'Nominal (Rp)']],
      body: breakdownData,
      theme: 'striped',
      headStyles: { fillColor: [61, 18, 89], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9.5, halign: 'left' },
      styles: { fontSize: 9, cellPadding: 2.8, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [250, 245, 255] },
      columnStyles: {
        0: { cellWidth: 105 },
        1: { cellWidth: 37, halign: 'center' },
        2: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
      },
      didParseCell: (data) => {
        // Highlight Take Home Pay row
        if (data.row.index === breakdownData.length - 1) {
          data.cell.styles.fillColor = [61, 18, 89];
          data.cell.styles.textColor = [255, 193, 7];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fontSize = 10;
        }
      }
    });

    const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 180;

    let currentY = finalY;
    if (currentY > 235) {
      doc.addPage();
      currentY = 20;
    }

    // Additional Note Box
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(14, currentY, 182, 16, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(180, 83, 9);
    doc.text('CATATAN TAMBAHAN HR / MANAJEMEN:', 18, currentY + 6);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const noteText = slip.note || 'Slip gaji ini diterbitkan secara sah oleh Sistem Informasi Steak 11.';
    const splitNotes = doc.splitTextToSize(noteText, 172);
    doc.text(splitNotes, 18, currentY + 11);

    // Dual Signatures Area (Karyawan & Management)
    const sigY = currentY + 24;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    // Left Signature: Karyawan
    doc.text('Penerima (Karyawan),', 25, sigY);
    doc.line(25, sigY + 20, 75, sigY + 20);
    doc.setFont('helvetica', 'bold');
    doc.text(slip.employeeName, 25, sigY + 25);

    // Right Signature: Management
    doc.setFont('helvetica', 'normal');
    doc.text('Manajer HR & Finance,', 135, sigY);
    doc.line(135, sigY + 20, 185, sigY + 20);
    doc.setFont('helvetica', 'bold');
    doc.text('Steak 11 Management', 135, sigY + 25);

    // Bottom Footer Confidentiality Note
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Dokumen slip gaji ini bersifat rahasia (Confidential). Hak Cipta © Steak 11 Mythic Chicken Taste.', 105, 290, { align: 'center' });

    doc.save(`Slip_Gaji_Official_${slip.employeeName.replace(/\s+/g, '_')}_${slip.periodMonth}.pdf`);
  };

  const handleSendPayrollWhatsApp = (slip: PayrollSlip) => {
    const emp = employees.find((e) => e.id === slip.employeeId);
    if (!emp) {
      showToast('Nomor HP Karyawan tidak ditemukan.');
      return;
    }

    const overtimeText = Number(slip.overtimePay || 0) > 0 ? `⏱️ *Upah Lembur (${slip.totalOvertimeHours || 0}j):* ${formatRupiah(slip.overtimePay || 0)}\n` : '';
    const outletBonusText = Number(slip.outletBonus || 0) > 0 ? `🏪 *Bonus Outlet:* ${formatRupiah(slip.outletBonus || 0)}\n` : '';

    const message =
      `Halo *${slip.employeeName}*,\n\n` +
      `Berikut adalah rincian *SLIP GAJI RESMI STEAK 11* periode *${slip.periodLabel}*:\n\n` +
      `👤 *Jabatan:* ${slip.employeeRole} (${slip.outlet})\n` +
      `📅 *Total Hadir:* ${slip.totalDaysPresent} Hari (${slip.totalHoursWorked} Jam)\n` +
      `⏰ *Tepat Waktu:* ${slip.totalDaysOnTime ?? (slip.totalDaysPresent - slip.totalDaysLate)} Hari\n` +
      `💵 *Gaji Pokok:* ${formatRupiah(slip.baseSalary)}\n` +
      `🍱 *Tunjangan Makan:* ${formatRupiah(slip.totalAllowance)}\n` +
      `⏰ *Tunj. Hadir Tepat Waktu:* ${formatRupiah(slip.punctualityAllowance || 0)}\n` +
      overtimeText +
      outletBonusText +
      `⭐ *Bonus Kinerja:* ${formatRupiah(slip.bonus)}\n` +
      `🔻 *Potongan:* ${formatRupiah(slip.deductions)}\n` +
      `----------------------------------------\n` +
      `💰 *TOTAL GAJI BERSIH:* *${formatRupiah(slip.netSalary)}*\n` +
      `📌 *Status:* ${slip.paymentStatus}\n\n` +
      `Terima kasih atas kerja keras dan kedisiplinanmu untuk Steak 11! 🔥🍗`;

    const rawPhone = emp.phone;
    const phoneClean = rawPhone.startsWith('62') ? rawPhone : '62' + rawPhone.replace(/^0+/, '');
    window.open(`https://wa.me/${phoneClean}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // --- Work Schedule & Roster Handlers ---
  const [showGenerateScheduleModal, setShowGenerateScheduleModal] = useState(false);
  const [scheduleGenModel, setScheduleGenModel] = useState<
    'rotasi_standar' | 'single_person_outlet' | 'equal_two_shifts' | 'fixed_role_shift'
  >('rotasi_standar');
  const [scheduleGenOverwrite, setScheduleGenOverwrite] = useState(true);

  const getGenModelName = (modelKey: string) => {
    switch (modelKey) {
      case 'single_person_outlet':
        return '👤 1 Orang per Outlet (Solo Stand)';
      case 'equal_two_shifts':
        return '⚖️ Rotasi 2 Shift (Pagi & Malam)';
      case 'fixed_role_shift':
        return '📌 Shift Tetap Sesuai Jabatan';
      case 'rotasi_standar':
      default:
        return '🔄 Rotasi Standar Berimbang';
    }
  };

  const handleToggleEmployeeRoster = (empId: string) => {
    if (checkReadOnlyPermission()) return;
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;
    const newIsOff = !emp.isScheduleOff;
    const updated = employees.map((e) => (e.id === empId ? { ...e, isScheduleOff: newIsOff } : e));
    setEmployees(updated);
    saveEmployees(updated);
    showToast(`Karyawan "${emp.name}" status roster shift diubah menjadi: ${newIsOff ? '🔴 OFF (Tidak Diterbitkan Roster)' : '🟢 ON (Aktif Diterbitkan Roster)'}`);
  };

  const handleExecuteScheduleGeneration = () => {
    if (checkReadOnlyPermission()) return;
    if (employees.length === 0) {
      showToast('Belum ada data karyawan. Tambahkan karyawan terlebih dahulu!');
      return;
    }

    const [yearStr, monthStr] = schedulePeriod.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();

    const activeRosterEmps = employees.filter((e) => e.status !== 'Non-Aktif' && !e.isScheduleOff);
    const targetEmps = scheduleOutletFilter === 'ALL'
      ? activeRosterEmps
      : activeRosterEmps.filter((e) => e.outlet === scheduleOutletFilter);

    if (targetEmps.length === 0) {
      showToast('⚠️ Tidak ada karyawan aktif untuk roster pada outlet yang dipilih.');
      return;
    }

    const generated: EmployeeSchedule[] = [];
    const availableTemplates = (shiftTemplates && shiftTemplates.length > 0) ? shiftTemplates : [
      { id: 'shift-1', name: 'Shift Pagi', startTime: '09:00', endTime: '17:00', color: 'emerald' },
      { id: 'shift-2', name: 'Shift Siang / Mid', startTime: '12:00', endTime: '20:00', color: 'blue' },
      { id: 'shift-3', name: 'Shift Malam', startTime: '15:00', endTime: '23:00', color: 'purple' },
      { id: 'shift-4', name: 'OFF / Libur', startTime: '00:00', endTime: '00:00', color: 'slate', isOff: true }
    ];

    const workingShifts = availableTemplates.filter((s) => !s.isOff);
    const offShiftTemplate = availableTemplates.find((s) => s.isOff) || {
      id: 'off',
      name: 'OFF / Libur',
      startTime: '00:00',
      endTime: '00:00',
      color: 'slate',
      isOff: true,
    };
    const defaultWorkingShift = workingShifts[0] || {
      id: 'shift-1',
      name: 'Shift Pagi',
      startTime: '09:00',
      endTime: '17:00',
      color: 'emerald',
    };

    if (scheduleGenModel === 'single_person_outlet') {
      // --- MODEL: 1 ORANG 1 OUTLET (ROTASI SOLO/DEDICATED STAND) ---
      const outletGroups: { [outletName: string]: Employee[] } = {};
      targetEmps.forEach((emp) => {
        const key = emp.outlet || 'Outlet Utama';
        if (!outletGroups[key]) outletGroups[key] = [];
        outletGroups[key].push(emp);
      });

      Object.entries(outletGroups).forEach(([outletName, empList]) => {
        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${yearStr}-${monthStr.padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const assignedIndex = (day - 1) % empList.length;

          empList.forEach((emp, empIdx) => {
            const isAssigned = empIdx === assignedIndex;
            const chosenShift = isAssigned
              ? defaultWorkingShift
              : offShiftTemplate;

            generated.push({
              id: `SCH-${emp.id}-${dateStr}`,
              employeeId: emp.id,
              employeeName: emp.name,
              employeeRole: emp.role,
              outlet: outletName,
              date: dateStr,
              shiftId: chosenShift.id,
              shiftName: chosenShift.name,
              startTime: chosenShift.startTime,
              endTime: chosenShift.endTime,
              isOff: !isAssigned,
              notes: isAssigned ? 'Penugasan Solo Stand 1 Orang per Outlet' : 'OFF (Rotasi Solo Stand)'
            });
          });
        }
      });
    } else if (scheduleGenModel === 'equal_two_shifts') {
      // --- MODEL: ROTASI 2 SHIFT (PAGI & MALAM / DUA SHIFT MASTER) ---
      const morningShift = workingShifts[0] || defaultWorkingShift;
      const nightShift = workingShifts.length > 1 ? workingShifts[workingShifts.length - 1] : defaultWorkingShift;

      targetEmps.forEach((emp, empIdx) => {
        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${yearStr}-${monthStr.padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayOfWeek = new Date(year, month - 1, day).getDay();

          let chosenShift = (day + empIdx) % 2 === 0 ? morningShift : nightShift;
          const isOffDay = dayOfWeek === (empIdx + 1) % 7;
          if (isOffDay) {
            chosenShift = offShiftTemplate;
          }

          generated.push({
            id: `SCH-${emp.id}-${dateStr}`,
            employeeId: emp.id,
            employeeName: emp.name,
            employeeRole: emp.role,
            outlet: emp.outlet,
            date: dateStr,
            shiftId: chosenShift.id,
            shiftName: chosenShift.name,
            startTime: chosenShift.startTime,
            endTime: chosenShift.endTime,
            isOff: isOffDay || Boolean(chosenShift.isOff),
            notes: isOffDay ? 'OFF Rutin Mingguan' : `Rotasi Shift (${chosenShift.name})`
          });
        }
      });
    } else if (scheduleGenModel === 'fixed_role_shift') {
      // --- MODEL: SHIFT TETAP BERDASARKAN JABATAN (ROLE-BASED MASTER SHIFT) ---
      targetEmps.forEach((emp, empIdx) => {
        const roleLower = (emp.role || '').toLowerCase();
        // Cari master shift yang namanya sesuai dengan role karyawan
        let matchedShift = workingShifts.find((s) => {
          const sNameLower = s.name.toLowerCase();
          const sNotesLower = (s.notes || '').toLowerCase();
          return sNameLower.includes(roleLower) || sNotesLower.includes(roleLower);
        });

        if (!matchedShift) {
          if (roleLower.includes('kasir')) {
            matchedShift = workingShifts[1] || defaultWorkingShift;
          } else if (roleLower.includes('barista') || roleLower.includes('waitress')) {
            matchedShift = workingShifts[0] || defaultWorkingShift;
          } else if (roleLower.includes('chef') || roleLower.includes('cook')) {
            matchedShift = workingShifts[workingShifts.length - 1] || defaultWorkingShift;
          } else {
            matchedShift = workingShifts[empIdx % workingShifts.length] || defaultWorkingShift;
          }
        }

        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${yearStr}-${monthStr.padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayOfWeek = new Date(year, month - 1, day).getDay();
          const isOffDay = dayOfWeek === (empIdx + 1) % 7;
          const chosenShift = isOffDay ? offShiftTemplate : matchedShift;

          generated.push({
            id: `SCH-${emp.id}-${dateStr}`,
            employeeId: emp.id,
            employeeName: emp.name,
            employeeRole: emp.role,
            outlet: emp.outlet,
            date: dateStr,
            shiftId: chosenShift.id,
            shiftName: chosenShift.name,
            startTime: chosenShift.startTime,
            endTime: chosenShift.endTime,
            isOff: isOffDay || Boolean(chosenShift.isOff),
            notes: isOffDay ? 'OFF Rutin Mingguan' : `Shift Tetap Divisi (${emp.role})`
          });
        }
      });
    } else {
      // --- MODEL: ROTASI STANDAR BERIMBANG (MENGGILIR SELURUH MASTER SHIFT KERJA) ---
      targetEmps.forEach((emp, empIdx) => {
        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${yearStr}-${monthStr.padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayOfWeek = new Date(year, month - 1, day).getDay();
          const isOffDay = dayOfWeek === (empIdx + 1) % 7;

          let chosenShift: WorkShiftTemplate;
          if (isOffDay) {
            chosenShift = offShiftTemplate;
          } else {
            const shiftIdx = (day + empIdx) % workingShifts.length;
            chosenShift = workingShifts[shiftIdx] || defaultWorkingShift;
          }

          generated.push({
            id: `SCH-${emp.id}-${dateStr}`,
            employeeId: emp.id,
            employeeName: emp.name,
            employeeRole: emp.role,
            outlet: emp.outlet,
            date: dateStr,
            shiftId: chosenShift.id,
            shiftName: chosenShift.name,
            startTime: chosenShift.startTime,
            endTime: chosenShift.endTime,
            isOff: isOffDay || Boolean(chosenShift.isOff),
            notes: isOffDay ? 'OFF Rutin Mingguan' : (chosenShift.notes || `Rotasi Master Shift`)
          });
        }
      });
    }

    let updated: EmployeeSchedule[];
    if (scheduleGenOverwrite) {
      const otherSchedules = schedules.filter(
        (s) => !s.date.startsWith(schedulePeriod) || (scheduleOutletFilter !== 'ALL' && s.outlet !== scheduleOutletFilter)
      );
      updated = [...otherSchedules, ...generated];
    } else {
      const existingKeys = new Set(schedules.map((s) => `${s.employeeId}_${s.date}`));
      const newOnly = generated.filter((g) => !existingKeys.has(`${g.employeeId}_${g.date}`));
      updated = [...schedules, ...newOnly];
    }

    setSchedules(updated);
    saveSchedules(updated);
    setShowGenerateScheduleModal(false);
    showToast(`🎉 Roster berhasil diterbitkan (${generated.length} penugasan) menggunakan model: ${getGenModelName(scheduleGenModel)}!`);
  };

  // Helper badge style for shift color
  const getShiftBadgeStyle = (colorName?: string, isOff?: boolean) => {
    switch (colorName) {
      case 'emerald':
      case 'green':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'blue':
      case 'sky':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'purple':
      case 'indigo':
        return 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-amber-300 border-purple-300 dark:border-purple-800';
      case 'amber':
      case 'yellow':
        return 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'rose':
      case 'red':
        return 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'teal':
        return 'bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-300 border-teal-300 dark:border-teal-800';
      case 'orange':
        return 'bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-300 border-orange-300 dark:border-orange-800';
      case 'slate':
      default:
        return isOff
          ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
          : 'bg-slate-100 text-slate-800 dark:bg-purple-950 dark:text-slate-200 border-slate-300';
    }
  };

  const handleOpenAssignSchedule = (empId?: string, dateStr?: string) => {
    const targetEmpId = empId || (employees.length > 0 ? employees[0].id : '');
    const targetDate = dateStr || `${schedulePeriod}-01`;

    setSchEmployeeId(targetEmpId);
    setSchDate(targetDate);

    const existingSch = targetEmpId && targetDate ? schedules.find((s) => s.employeeId === targetEmpId && s.date === targetDate) : null;
    if (existingSch) {
      setEditingScheduleId(existingSch.id);
      setSchShiftId(existingSch.shiftId);
      setSchNotes(existingSch.notes || '');
    } else {
      setEditingScheduleId(null);
      setSchShiftId(shiftTemplates[0]?.id || 'shift-1');
      setSchNotes('');
    }
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = () => {
    if (!schEmployeeId || !schDate || !schShiftId) {
      showToast('Lengkapi karyawan, tanggal, dan shift yang dipilih!');
      return;
    }

    const emp = employees.find((e) => e.id === schEmployeeId);
    const shift = shiftTemplates.find((s) => s.id === schShiftId);
    if (!emp || !shift) return;

    const newSch: EmployeeSchedule = {
      id: editingScheduleId || `SCH-${emp.id}-${schDate}`,
      employeeId: emp.id,
      employeeName: emp.name,
      employeeRole: emp.role,
      outlet: emp.outlet,
      date: schDate,
      shiftId: shift.id,
      shiftName: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      isOff: shift.isOff || false,
      notes: schNotes
    };

    const filtered = schedules.filter((s) => s.id !== newSch.id && !(s.employeeId === emp.id && s.date === schDate));
    const updated = [...filtered, newSch];
    setSchedules(updated);
    saveSchedules(updated);
    setShowScheduleModal(false);
    showToast(`Jadwal shift ${emp.name} pada tanggal ${schDate} berhasil disimpan!`);
  };

  const handleDeleteSchedule = (id: string) => {
    const updated = schedules.filter((s) => s.id !== id);
    setSchedules(updated);
    saveSchedules(updated);
    showToast('Jadwal shift berhasil dihapus.');
  };

  const handleOpenAddShiftTemplate = () => {
    setEditingShiftTplId(null);
    setShiftTplName('');
    setShiftTplStart('09:00');
    setShiftTplEnd('17:00');
    setShiftTplColor('emerald');
    setShiftTplIsOff(false);
  };

  const handleEditShiftTemplate = (tpl: WorkShiftTemplate) => {
    setEditingShiftTplId(tpl.id);
    setShiftTplName(tpl.name);
    setShiftTplStart(tpl.startTime);
    setShiftTplEnd(tpl.endTime);
    setShiftTplColor(tpl.color);
    setShiftTplIsOff(!!tpl.isOff);
  };

  const handleDeleteShiftTemplate = (id: string) => {
    if (shiftTemplates.length <= 1) {
      showToast('Minimal harus ada 1 master shift!');
      return;
    }
    const updated = shiftTemplates.filter((s) => s.id !== id);
    setShiftTemplates(updated);
    saveShiftTemplates(updated);
    if (editingShiftTplId === id) {
      handleOpenAddShiftTemplate();
    }
    showToast('Master shift berhasil dihapus.');
  };

  const handleSaveShiftTemplate = () => {
    if (!shiftTplName.trim()) {
      showToast('Masukkan nama shift terlebih dahulu!');
      return;
    }

    const isOff = shiftTplIsOff || shiftTplName.toLowerCase().includes('off') || shiftTplName.toLowerCase().includes('libur');

    let updatedTemplates: WorkShiftTemplate[];
    let activeId = editingShiftTplId;

    if (editingShiftTplId) {
      updatedTemplates = shiftTemplates.map((t) =>
        t.id === editingShiftTplId
          ? { ...t, name: shiftTplName.trim(), startTime: shiftTplStart, endTime: shiftTplEnd, color: shiftTplColor, isOff }
          : t
      );
      showToast(`Master Shift ${shiftTplName} berhasil diperbarui!`);
    } else {
      activeId = `shift-${Date.now().toString().slice(-4)}`;
      const newTpl: WorkShiftTemplate = {
        id: activeId,
        name: shiftTplName.trim(),
        startTime: shiftTplStart,
        endTime: shiftTplEnd,
        color: shiftTplColor,
        isOff
      };
      updatedTemplates = [...shiftTemplates, newTpl];
      showToast(`Master Shift ${newTpl.name} berhasil ditambahkan!`);
    }

    // Save updated templates first
    setShiftTemplates(updatedTemplates);
    saveShiftTemplates(updatedTemplates);

    // Cascade update to existing assigned schedules matching this shiftId or shiftName
    if (editingShiftTplId && schedules.length > 0) {
      const oldTpl = shiftTemplates.find((t) => t.id === editingShiftTplId);
      const updatedSchedules = schedules.map((s) => {
        if (s.shiftId === editingShiftTplId || (oldTpl && s.shiftName.trim().toLowerCase() === oldTpl.name.trim().toLowerCase())) {
          return {
            ...s,
            shiftId: editingShiftTplId,
            shiftName: shiftTplName.trim(),
            startTime: shiftTplStart,
            endTime: shiftTplEnd,
            isOff
          };
        }
        return s;
      });
      setSchedules(updatedSchedules);
      saveSchedules(updatedSchedules);
    }

    handleOpenAddShiftTemplate();
  };

  const handleDownloadExcelScheduleRoster = () => {
    const targetEmps = scheduleOutletFilter === 'ALL' ? employees : employees.filter((e) => e.outlet === scheduleOutletFilter);
    const [yearStr, monthStr] = schedulePeriod.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();

    const tableRows = targetEmps.map((emp, idx) => {
      const rowObj: any = {
        'No': idx + 1,
        'ID Karyawan': emp.id,
        'Nama Karyawan': emp.name,
        'Jabatan': emp.role,
        'Outlet Cabang': emp.outlet,
      };

      let countPagi = 0;
      let countMid = 0;
      let countMalam = 0;
      let countOff = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${yearStr}-${monthStr.padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const sch = schedules.find((s) => s.employeeId === emp.id && s.date === dateStr);
        if (sch) {
          if (sch.isOff || sch.shiftName.toLowerCase().includes('off')) {
            rowObj[`Tgl ${day}`] = 'OFF';
            countOff++;
          } else if (sch.shiftName.toLowerCase().includes('pagi')) {
            rowObj[`Tgl ${day}`] = 'Pagi';
            countPagi++;
          } else if (sch.shiftName.toLowerCase().includes('siang') || sch.shiftName.toLowerCase().includes('mid')) {
            rowObj[`Tgl ${day}`] = 'Mid';
            countMid++;
          } else if (sch.shiftName.toLowerCase().includes('malam')) {
            rowObj[`Tgl ${day}`] = 'Malam';
            countMalam++;
          } else {
            rowObj[`Tgl ${day}`] = sch.shiftName;
          }
        } else {
          rowObj[`Tgl ${day}`] = '-';
        }
      }

      rowObj['Total Pagi'] = countPagi;
      rowObj['Total Mid'] = countMid;
      rowObj['Total Malam'] = countMalam;
      rowObj['Total OFF'] = countOff;

      return rowObj;
    });

    const worksheet = XLSX.utils.json_to_sheet(tableRows);

    // Auto Column Widths
    const colWidths = [
      { wch: 5 },  // No
      { wch: 14 }, // ID
      { wch: 22 }, // Nama
      { wch: 18 }, // Jabatan
      { wch: 18 }, // Outlet
    ];
    for (let d = 1; d <= daysInMonth; d++) {
      colWidths.push({ wch: 7 });
    }
    colWidths.push({ wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 });
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Roster ${schedulePeriod}`);
    XLSX.writeFile(workbook, `Roster_Jadwal_Shift_Steak11_${schedulePeriod}.xlsx`);
    showToast('Berhasil mengunduh Roster Excel Profesional!');
  };

  const handleDownloadExcelImportScheduleTemplate = () => {
    const targetEmps = scheduleOutletFilter === 'ALL' ? employees : employees.filter((e) => e.outlet === scheduleOutletFilter);
    const [yearStr, monthStr] = schedulePeriod.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();

    const rows = targetEmps.map((emp) => {
      const rowObj: any = {
        'ID Karyawan': emp.id,
        'Nama Karyawan': emp.name,
        'Jabatan': emp.role,
        'Outlet Cabang': emp.outlet,
      };

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${yearStr}-${monthStr.padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const existing = schedules.find((s) => s.employeeId === emp.id && s.date === dateStr);
        if (existing) {
          rowObj[`Tgl ${day}`] = existing.isOff ? 'OFF' : existing.shiftName.replace('Shift ', '');
        } else {
          rowObj[`Tgl ${day}`] = (day % 7 === 0) ? 'OFF' : 'Pagi';
        }
      }

      return rowObj;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Import Shift');
    XLSX.writeFile(workbook, `Template_Impor_Roster_Shift_Steak11_${schedulePeriod}.xlsx`);
    showToast('Berhasil mengunduh Template Excel Import Roster Shift!');
  };

  const handleImportScheduleExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const parsedData: any[] = XLSX.utils.sheet_to_json(ws);

        if (!parsedData || parsedData.length === 0) {
          showToast('File Excel kosong atau format tidak sesuai!');
          return;
        }

        const [yearStr, monthStr] = schedulePeriod.split('-');
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10);
        const daysInMonth = new Date(year, month, 0).getDate();

        let importedCount = 0;
        const newSchedules: EmployeeSchedule[] = [];

        parsedData.forEach((row: any) => {
          const empId = String(row['ID Karyawan'] || row['ID'] || '').trim();
          const empName = String(row['Nama Karyawan'] || row['Nama'] || '').trim();

          const matchedEmp = employees.find(
            (e) => (empId && e.id === empId) || (empName && e.name.toLowerCase() === empName.toLowerCase())
          );
          if (!matchedEmp) return;

          for (let day = 1; day <= daysInMonth; day++) {
            const key = `Tgl ${day}`;
            const cellVal = String(row[key] || '').trim();
            if (!cellVal) continue;

            let matchedTpl = shiftTemplates.find(
              (t) => t.name.toLowerCase() === cellVal.toLowerCase() || cellVal.toLowerCase().includes(t.name.toLowerCase().replace('shift ', ''))
            );

            if (!matchedTpl) {
              if (cellVal.toLowerCase() === 'off' || cellVal.toLowerCase().includes('libur')) {
                matchedTpl = shiftTemplates.find((t) => t.isOff) || { id: 'off', name: 'OFF / Libur', startTime: '00:00', endTime: '00:00', color: 'slate', isOff: true };
              } else {
                matchedTpl = shiftTemplates[0]; // fallback Pagi
              }
            }

            const dateStr = `${yearStr}-${monthStr.padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            newSchedules.push({
              id: `SCH-${matchedEmp.id}-${dateStr}`,
              employeeId: matchedEmp.id,
              employeeName: matchedEmp.name,
              employeeRole: matchedEmp.role,
              outlet: matchedEmp.outlet,
              date: dateStr,
              shiftId: matchedTpl.id,
              shiftName: matchedTpl.name,
              startTime: matchedTpl.startTime,
              endTime: matchedTpl.endTime,
              isOff: matchedTpl.isOff || false,
              notes: 'Diimpor dari file Excel'
            });
            importedCount++;
          }
        });

        if (newSchedules.length > 0) {
          const empIdsInImport = new Set(newSchedules.map((s) => s.employeeId));
          const filteredOther = schedules.filter(
            (s) => !s.date.startsWith(schedulePeriod) || !empIdsInImport.has(s.employeeId)
          );
          const updated = [...filteredOther, ...newSchedules];
          setSchedules(updated);
          saveSchedules(updated);
          showToast(`✅ Sukses mengimpor ${importedCount} penugasan shift roster dari Excel!`);
        } else {
          showToast('Tidak ada baris jadwal valid yang ditemukan dalam file!');
        }
      } catch (err) {
        console.error('Error importing schedule Excel:', err);
        showToast('Gagal membaca file Excel! Pastikan file berformat .xlsx atau .csv');
      }
      e.target.value = '';
    };
    reader.readAsBinaryString(file);
  };

  // --- Employee Loan / Kasbon Ledger Handlers ---
  const handleOpenAddLoan = (empId?: string) => {
    setEditingLoanId(null);
    if (empId) setLoanEmployeeId(empId);
    else if (employees.length > 0) setLoanEmployeeId(employees[0].id);

    setLoanTotalAmount(500000);
    setLoanMonthlyInstallment(100000);
    setLoanDate(new Date().toISOString().split('T')[0]);
    setLoanNotes('');
    setShowLoanModal(true);
  };

  const handleEditLoan = (loan: EmployeeLoan) => {
    setEditingLoanId(loan.id);
    setLoanEmployeeId(loan.employeeId);
    setLoanTotalAmount(loan.totalAmount);
    setLoanMonthlyInstallment(loan.monthlyInstallment);
    setLoanDate(loan.date);
    setLoanNotes(loan.notes || '');
    setShowLoanModal(true);
  };

  const handleSaveLoan = () => {
    if (!loanEmployeeId || loanTotalAmount <= 0 || loanMonthlyInstallment <= 0) {
      showToast('Isi karyawan, nominal kasbon, dan cicilan bulanan dengan benar!');
      return;
    }

    const emp = employees.find((e) => e.id === loanEmployeeId);
    if (!emp) return;

    if (editingLoanId) {
      const updated = employeeLoans.map((l) =>
        l.id === editingLoanId
          ? {
              ...l,
              employeeId: emp.id,
              employeeName: emp.name,
              outlet: emp.outlet,
              date: loanDate,
              totalAmount: loanTotalAmount,
              monthlyInstallment: loanMonthlyInstallment,
              remainingAmount: Math.min(l.remainingAmount, loanTotalAmount),
              notes: loanNotes
            }
          : l
      );
      setEmployeeLoans(updated);
      saveEmployeeLoans(updated);
      showToast(`Pinjaman Kasbon ${emp.name} berhasil diperbarui!`);
    } else {
      const newLoan: EmployeeLoan = {
        id: `LOAN-${Date.now().toString().slice(-4)}`,
        employeeId: emp.id,
        employeeName: emp.name,
        outlet: emp.outlet,
        date: loanDate,
        totalAmount: loanTotalAmount,
        monthlyInstallment: loanMonthlyInstallment,
        remainingAmount: loanTotalAmount,
        status: 'ACTIVE',
        notes: loanNotes,
        history: []
      };
      const updated = [newLoan, ...employeeLoans];
      setEmployeeLoans(updated);
      saveEmployeeLoans(updated);
      showToast(`Berhasil mencatat Pinjaman Kasbon ${emp.name} sebesar ${formatRupiah(loanTotalAmount)}!`);
    }

    setShowLoanModal(false);
  };

  const handleDeleteLoan = (loanId: string) => {
    const updated = employeeLoans.filter((l) => l.id !== loanId);
    setEmployeeLoans(updated);
    saveEmployeeLoans(updated);
    showToast('Data kasbon berhasil dihapus.');
  };

  const handleOpenManualPaymentModal = (loan: EmployeeLoan) => {
    setSelectedLoanForHistory(loan);
    setManualPayAmount(Math.min(loan.monthlyInstallment, loan.remainingAmount));
    setManualPayNotes('Pembayaran angsuran manual kasbon');
    setShowManualPaymentModal(true);
  };

  const handleManualLoanPayment = () => {
    if (!selectedLoanForHistory || manualPayAmount <= 0) {
      showToast('Masukkan nominal pembayaran angsuran dengan benar!');
      return;
    }

    const amountPaid = Math.min(manualPayAmount, selectedLoanForHistory.remainingAmount);
    const newRemaining = Math.max(0, selectedLoanForHistory.remainingAmount - amountPaid);
    const newStatus = newRemaining === 0 ? 'PAID_OFF' : 'ACTIVE';

    const newPaymentLog = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      period: new Date().toISOString().slice(0, 7),
      amountPaid: amountPaid,
      datePaid: new Date().toISOString().split('T')[0],
      notes: manualPayNotes || 'Pembayaran angsuran manual / pelunasan'
    };

    const updated = employeeLoans.map((l) => {
      if (l.id === selectedLoanForHistory.id) {
        const newHistory = [newPaymentLog, ...l.history];
        return {
          ...l,
          remainingAmount: newRemaining,
          status: newStatus as any,
          history: newHistory
        };
      }
      return l;
    });

    setEmployeeLoans(updated);
    saveEmployeeLoans(updated);
    setShowManualPaymentModal(false);
    setSelectedLoanForHistory(updated.find((l) => l.id === selectedLoanForHistory.id) || null);
    showToast(`Berhasil mencatat pembayaran kasbon sebesar ${formatRupiah(amountPaid)}!`);
  };

  // --- Admin User CRUD Handlers ---
  const handleOpenAddAdmin = () => {
    setEditingAdminId(null);
    const newId = 'adm-' + Date.now().toString().slice(-4);
    setAdminIdInput(newId);
    setAdminUsername('');
    setAdminFullName('');
    const matchedDefault = roleSettings.find((r) => r.name === 'Admin Kasir') || roleSettings[0];
    setAdminRole(matchedDefault ? matchedDefault.name : 'Super Admin');
    setAdminPhone('');
    setAdminEmail('');
    setAdminStatus('Aktif');
    setAdminPasswordPin('1234');
    setAdminAllowedTabs(matchedDefault ? matchedDefault.allowedTabs : ['dashboard', 'kasir', 'pesanan', 'inventory', 'reviews', 'shifts', 'absensi']);
    setShowAdminModal(true);
  };

  const handleEditAdmin = (admin: AdminUser) => {
    setEditingAdminId(admin.id);
    setAdminIdInput(admin.id);
    setAdminUsername(admin.username);
    setAdminFullName(admin.fullName);
    setAdminRole(admin.role);
    setAdminPhone(admin.phone || '');
    setAdminEmail(admin.email || '');
    setAdminStatus(admin.status);
    setAdminPasswordPin(admin.passwordPin);
    setAdminAllowedTabs(admin.allowedTabs || ['dashboard', 'kasir', 'pesanan', 'analytics', 'menu', 'racik', 'inventory', 'reviews', 'promos', 'karyawan', 'absensi', 'penggajian', 'shifts', 'outlets', 'admin', 'wa', 'branding', 'system']);
    setShowAdminModal(true);
  };

  const handleSaveAdmin = () => {
    if (checkReadOnlyPermission()) return;
    const cleanId = adminIdInput.trim();
    if (!cleanId || !adminUsername.trim() || !adminFullName.trim() || !adminPasswordPin.trim()) {
      showToast('ID Admin, Username, Nama Lengkap, dan PIN/Password wajib diisi!');
      return;
    }

    // Unique ID check
    const duplicateId = adminUsers.find((a) => a.id.toLowerCase() === cleanId.toLowerCase() && a.id !== editingAdminId);
    if (duplicateId) {
      showToast(`ID Admin "${cleanId}" sudah digunakan oleh pengelola (${duplicateId.fullName}). Harap gunakan ID Admin yang unik!`);
      return;
    }

    let updated: AdminUser[];
    if (editingAdminId) {
      updated = adminUsers.map((a) =>
        a.id === editingAdminId
          ? {
              ...a,
              id: cleanId,
              username: adminUsername.trim().toLowerCase(),
              fullName: adminFullName.trim(),
              role: adminRole,
              phone: adminPhone.trim(),
              email: adminEmail.trim(),
              status: adminStatus,
              passwordPin: adminPasswordPin.trim(),
              allowedTabs: adminAllowedTabs,
            }
          : a
      );
      showToast(`Data Admin "${adminFullName}" (ID: ${cleanId}) berhasil diperbarui!`);
    } else {
      const newAdmin: AdminUser = {
        id: cleanId,
        username: adminUsername.trim().toLowerCase(),
        fullName: adminFullName.trim(),
        role: adminRole,
        phone: adminPhone.trim(),
        email: adminEmail.trim(),
        status: adminStatus,
        passwordPin: adminPasswordPin.trim(),
        createdAt: new Date().toISOString().split('T')[0],
        allowedTabs: adminAllowedTabs,
      };
      updated = [newAdmin, ...adminUsers];
      showToast(`Akun Admin baru "${adminFullName}" (ID: ${cleanId}) berhasil ditambahkan!`);
    }

    saveAdmins(updated);
    setAdminUsers(updated);
    setShowAdminModal(false);
  };

  const handleDeleteAdmin = (adminId: string) => {
    if (checkReadOnlyPermission()) return;
    const target = adminUsers.find((a) => a.id === adminId);
    if (!target) return;
    const isVisitor = target.role === 'Pengunjung' || target.passwordPin?.includes('Google') || target.role?.toLowerCase().includes('pengunjung');

    if (!isVisitor && adminUsers.filter((a) => a.role !== 'Pengunjung' && !a.passwordPin?.includes('Google')).length <= 1) {
      showToast('⚠️ Sistem harus memiliki minimal 1 akun Admin!');
      return;
    }

    setDeleteConfirmTarget({
      type: 'admin',
      id: adminId,
      title: `Hapus Akun ${isVisitor ? 'Pengunjung' : 'Admin'} "${target.fullName}"?`,
      description: `Apakah Anda yakin ingin menghapus data ${isVisitor ? 'pengunjung' : 'admin'} "${target.fullName}" (${target.email || target.username})? Akun ini akan dihapus permanen dari sistem & Cloud Firestore.`
    });
  };

  // --- Role / Jabatan Settings Handlers ---
  const handleOpenAddRole = () => {
    setEditingRoleId(null);
    setRoleName('');
    setRoleTargetType('both');
    setRoleDescription('');
    setRoleAllowedTabs(['kasir', 'pesanan', 'inventory', 'reviews', 'absensi']);
    setShowRoleModal(true);
  };

  const handleEditRole = (roleItem: RoleSetting) => {
    setEditingRoleId(roleItem.id);
    setRoleName(roleItem.name);
    setRoleTargetType(roleItem.targetType);
    setRoleDescription(roleItem.description);
    setRoleAllowedTabs(roleItem.allowedTabs || []);
    setShowRoleModal(true);
  };

  const handleSaveRole = () => {
    if (!roleName.trim()) {
      showToast('⚠️ Nama Role / Jabatan wajib diisi!');
      return;
    }

    let updated: RoleSetting[];
    if (editingRoleId) {
      const existingRole = roleSettings.find((r) => r.id === editingRoleId);
      const oldName = existingRole ? existingRole.name : '';
      const newName = roleName.trim();

      const isDuplicate = roleSettings.some(
        (r) => r.id !== editingRoleId && r.name.trim().toLowerCase() === newName.toLowerCase()
      );
      if (isDuplicate) {
        showToast(`⚠️ Nama Role / Jabatan "${roleName}" sudah digunakan oleh role lain!`);
        return;
      }
      updated = roleSettings.map((r) =>
        r.id === editingRoleId
          ? {
              ...r,
              name: newName,
              targetType: roleTargetType,
              description: roleDescription.trim(),
              allowedTabs: roleAllowedTabs,
            }
          : r
      );

      // SINKRONISASI DATA KARYAWAN: jika role diedit/diperbarui, update role & hak akses karyawan secara langsung
      if (oldName) {
        const updatedEmployees = employees.map((emp) => {
          if (emp.role.trim().toLowerCase() === oldName.trim().toLowerCase() || emp.role.trim().toLowerCase() === newName.toLowerCase()) {
            return {
              ...emp,
              role: newName,
              allowedTabs: roleAllowedTabs,
            };
          }
          return emp;
        });
        setEmployees(updatedEmployees);
        saveEmployees(updatedEmployees);

        const updatedAdmins = adminUsers.map((adm) => {
          if (adm.role.trim().toLowerCase() === oldName.trim().toLowerCase() || adm.role.trim().toLowerCase() === newName.toLowerCase()) {
            return {
              ...adm,
              role: newName,
              allowedTabs: roleAllowedTabs,
            };
          }
          return adm;
        });
        setAdminUsers(updatedAdmins);
        saveAdmins(updatedAdmins);
      }

      showToast(`Master Role "${newName}" & data karyawan terhubung berhasil diperbarui!`);
    } else {
      const newName = roleName.trim();
      const isDuplicate = roleSettings.some(
        (r) => r.name.trim().toLowerCase() === newName.toLowerCase()
      );
      if (isDuplicate) {
        showToast(`⚠️ Master Role "${roleName}" sudah ada di sistem!`);
        return;
      }
      const newRole: RoleSetting = {
        id: 'role-' + Date.now().toString().slice(-4),
        name: newName,
        targetType: roleTargetType,
        description: roleDescription.trim(),
        allowedTabs: roleAllowedTabs,
      };
      updated = [...roleSettings, newRole];
      showToast(`Master Role baru "${newName}" berhasil ditambahkan!`);
    }

    saveRoleSettings(updated);
    setRoleSettings(updated);
    setShowRoleModal(false);
  };

  const handleDeleteRole = (roleId: string) => {
    if (roleSettings.length <= 1) {
      showToast('⚠️ Sistem harus memiliki minimal 1 Master Role!');
      return;
    }
    const target = roleSettings.find((r) => r.id === roleId);
    if (!target) return;

    setDeleteConfirmTarget({
      type: 'role',
      id: roleId,
      title: `Hapus Master Role "${target.name}"?`,
      description: 'Pengaturan peran dan izin akses menu ini akan dihapus.'
    });
  };

  // --- WA Settings Handlers ---
  const handleSaveWaSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    saveWaSettings(waSettings);
    showToast('Pengaturan Notifikasi WhatsApp berhasil disimpan!');
  };

  const handleTestWaSend = (type: 'newOrder' | 'statusUpdate' | 'attendance') => {
    let cleanWa = waSettings.targetWaNumber.replace(/\D/g, '');
    if (cleanWa.startsWith('0')) cleanWa = '62' + cleanWa.slice(1);
    if (!cleanWa) {
      showToast('Masukkan nomor WhatsApp target notifikasi terlebih dahulu.');
      return;
    }

    let message = '';
    if (type === 'newOrder') {
      message = (waSettings.templateNewOrder || '')
        .replace(/{BRAND_NAME}/g, (brandingSettings.brandName || 'STEAK 11').toUpperCase())
        .replace(/{ORDER_ID}/g, 'ORD-DEMO999')
        .replace(/{NAMA}/g, 'Budi Pelanggan (TEST)')
        .replace(/{OUTLET}/g, 'Steak 11 Tebet')
        .replace(/{SERVICE_TYPE}/g, 'Takeaway')
        .replace(/{ADDRESS_TIME}/g, 'Jam Ambil: 18:30 WIB')
        .replace(/{ITEMS_SUMMARY}/g, '1. Creamy Garlic Herb Steak (2x)\n2. Es Teh Manis (2x)')
        .replace(/{TOTAL}/g, 'Rp 50.000');
    } else if (type === 'statusUpdate') {
      message = (waSettings.templateStatusUpdate || '')
        .replace(/{NAMA}/g, 'Budi Pelanggan (TEST)')
        .replace(/{ORDER_ID}/g, 'ORD-DEMO999')
        .replace(/{OUTLET}/g, 'Steak 11 Tebet')
        .replace(/{STATUS}/g, 'Terkirim/Diproses')
        .replace(/{ITEMS_SUMMARY}/g, 'Creamy Garlic Herb Steak (2x)')
        .replace(/{TOTAL}/g, 'Rp 50.000');
    } else {
      const defaultTpl = `*PRESENSI NOTIFIKASI {TIPE} STAFF STEAK 11*\n---------------------------\n*Karyawan:* {NAMA} ({ROLE})\n*Outlet:* {OUTLET}\n*Tanggal:* {TANGGAL}\n*Jam:* {WAKTU} WIB\n*Evaluasi:* {EVALUASI}\n*Alamat:* {LOKASI}\n*Catatan:* {CATATAN}\n---------------------------\n_Terverifikasi Sistem Presensi Kamera Steak 11_`;
      message = (waSettings.templateAttendance || defaultTpl)
        .replace(/{TIPE}/g, 'MASUK')
        .replace(/{NAMA}/g, 'Asep Saepulloh (TEST)')
        .replace(/{ROLE}/g, 'Chef / Cook')
        .replace(/{OUTLET}/g, 'Steak 11 Tebet')
        .replace(/{TANGGAL}/g, '2026-08-11')
        .replace(/{WAKTU}/g, '15:00:00')
        .replace(/{EVALUASI}/g, 'Hadir Tepat Waktu')
        .replace(/{LOKASI}/g, 'Lokasi Terverifikasi GPS')
        .replace(/{CATATAN}/g, 'Presensi via Kamera Watermark');
    }

    fetch('/api/wa/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanWa, message })
    }).catch(() => {});

    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(message)}`, '_blank');
    showToast('⚡ Uji coba pengiriman WA Gateway & WhatsApp Web berhasil!');
  };

  // --- Store Branding Settings Handler ---
  const handleSaveBrandingSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (checkReadOnlyPermission()) return;
    saveBranding(brandingSettings);
    window.dispatchEvent(new Event('branding_updated'));
    showToast('✅ Identitas & Branding / Konten Header & Footer Web berhasil disimpan!');
  };

  // --- Inventory CRUD Handlers ---
  const handleOpenAddInventory = () => {
    if (checkReadOnlyPermission()) return;
    setEditingInvId(null);
    setInvName('');
    setInvCategory('Daging Ayam');
    setInvStock(10);
    setInvMinStock(5);
    setInvUnit('Kg');
    setInvUnitPrice(42000);
    setInvOutlet('Semua Outlet');
    setShowInventoryModal(true);
  };

  const handleEditInventory = (item: InventoryItem) => {
    if (checkReadOnlyPermission()) return;
    setEditingInvId(item.id);
    setInvName(item.name);
    setInvCategory(item.category);
    setInvStock(item.currentStock);
    setInvMinStock(item.minStock);
    setInvUnit(item.unit);
    setInvUnitPrice(item.unitPrice);
    setInvOutlet(item.outlet);
    setShowInventoryModal(true);
  };

  const handleSaveInventory = () => {
    if (checkReadOnlyPermission()) return;
    if (!invName.trim()) {
      showToast('Nama bahan baku wajib diisi!');
      return;
    }
    let updated: InventoryItem[];
    if (editingInvId) {
      updated = inventory.map((i) =>
        i.id === editingInvId
          ? {
              ...i,
              name: invName.trim(),
              category: invCategory,
              currentStock: Number(invStock),
              minStock: Number(invMinStock),
              unit: invUnit,
              unitPrice: Number(invUnitPrice),
              outlet: invOutlet,
              lastRestockDate: new Date().toISOString().split('T')[0],
            }
          : i
      );
      showToast(`Stok bahan baku "${invName}" berhasil diperbarui!`);
    } else {
      const newItem: InventoryItem = {
        id: 'INV-' + Date.now().toString().slice(-4),
        name: invName.trim(),
        category: invCategory,
        currentStock: Number(invStock),
        minStock: Number(invMinStock),
        unit: invUnit,
        unitPrice: Number(invUnitPrice),
        outlet: invOutlet,
        lastRestockDate: new Date().toISOString().split('T')[0],
      };
      updated = [newItem, ...inventory];
      showToast(`Bahan baku baru "${invName}" berhasil ditambahkan!`);
    }
    saveInventory(updated);
    setInventory(updated);
    setShowInventoryModal(false);
  };

  const handleDeleteInventory = (id: string) => {
    if (checkReadOnlyPermission()) return;
    const item = inventory.find((i) => i.id === id);
    if (!item) return;
    setDeleteConfirmTarget({
      type: 'inventory',
      id,
      title: `Hapus Bahan Baku "${item.name}"?`,
      description: 'Bahan baku ini akan dihapus dari daftar inventaris.'
    });
  };

  // --- Promos / Vouchers CRUD Handlers ---
  const handleOpenAddPromo = () => {
    setEditingPromoId(null);
    setPromoCode('');
    setPromoDesc('');
    setPromoDiscountType('nominal');
    setPromoDiscountValue(5000);
    setPromoMinOrder(20000);
    setPromoMaxDiscount(10000);
    setPromoExpiry('2026-12-31');
    setPromoStatus('Aktif');
    setShowPromoModal(true);
  };

  const handleEditPromo = (promo: PromoVoucher) => {
    setEditingPromoId(promo.id);
    setPromoCode(promo.code);
    setPromoDesc(promo.description);
    setPromoDiscountType(promo.discountType);
    setPromoDiscountValue(promo.discountValue);
    setPromoMinOrder(promo.minOrderAmount);
    setPromoMaxDiscount(promo.maxDiscountAmount || 0);
    setPromoExpiry(promo.expiryDate);
    setPromoStatus(promo.status);
    setShowPromoModal(true);
  };

  const handleSavePromo = () => {
    if (!promoCode.trim()) {
      showToast('⚠️ Kode promo wajib diisi!');
      return;
    }
    let updated: PromoVoucher[];
    const codeClean = promoCode.trim().toUpperCase();
    if (editingPromoId) {
      updated = promos.map((p) =>
        p.id === editingPromoId
          ? {
              ...p,
              code: codeClean,
              description: promoDesc.trim(),
              discountType: promoDiscountType,
              discountValue: Number(promoDiscountValue),
              minOrderAmount: Number(promoMinOrder),
              maxDiscountAmount: promoDiscountType === 'percentage' ? Number(promoMaxDiscount) : undefined,
              expiryDate: promoExpiry,
              status: promoStatus,
            }
          : p
      );
      showToast(`Kode Promo "${codeClean}" berhasil diperbarui!`);
    } else {
      const newPromo: PromoVoucher = {
        id: 'PRM-' + Date.now().toString().slice(-4),
        code: codeClean,
        description: promoDesc.trim(),
        discountType: promoDiscountType,
        discountValue: Number(promoDiscountValue),
        minOrderAmount: Number(promoMinOrder),
        maxDiscountAmount: promoDiscountType === 'percentage' ? Number(promoMaxDiscount) : undefined,
        status: promoStatus,
        usageCount: 0,
        expiryDate: promoExpiry,
      };
      updated = [newPromo, ...promos];
      showToast(`Kode Promo baru "${codeClean}" berhasil diterbitkan!`);
    }
    savePromos(updated);
    setPromos(updated);
    setShowPromoModal(false);
  };

  const handleDeletePromo = (id: string) => {
    const promo = promos.find((p) => p.id === id);
    if (!promo) return;
    setDeleteConfirmTarget({
      type: 'promo',
      id,
      title: `Hapus Kode Promo "${promo.code}"?`,
      description: 'Kode promo/voucher ini akan dihapus dari sistem.'
    });
  };

  // --- Cashier Shifts / Cash Opname Handlers ---
  const handleOpenAddShift = () => {
    setShiftName('Shift Malam (15.00 - 22.00)');
    setShiftCashier(adminUsers[0]?.fullName || 'Kasir Tebet');
    setShiftOutlet(locations[0]?.name || 'Steak 11 Tebet');
    setShiftStartingCash(200000);
    setShiftCashRev(450000);
    setShiftQrisRev(550000);
    setShiftTransferRev(100000);
    setShiftActualCash(650000); // 200k + 450k = 650k
    setShiftNotes('Closing shift lancar, fisik uang pas.');
    setShowShiftModal(true);
  };

  const handleSaveShift = () => {
    const sysCash = Number(shiftStartingCash) + Number(shiftCashRev);
    const diff = Number(shiftActualCash) - sysCash;
    const newShift: CashierShiftRecord = {
      id: 'SHF-' + Date.now().toString().slice(-6),
      date: new Date().toISOString().split('T')[0],
      shiftName: shiftName,
      cashierName: shiftCashier,
      outlet: shiftOutlet,
      startingCash: Number(shiftStartingCash),
      cashRevenue: Number(shiftCashRev),
      qrisRevenue: Number(shiftQrisRev),
      transferRevenue: Number(shiftTransferRev),
      totalRevenue: Number(shiftCashRev) + Number(shiftQrisRev) + Number(shiftTransferRev),
      systemCashTotal: sysCash,
      actualCashTotal: Number(shiftActualCash),
      cashDifference: diff,
      notes: shiftNotes,
      status: 'Closed',
    };

    const updated = [newShift, ...cashierShifts];
    saveCashierShifts(updated);
    setCashierShifts(updated);
    setShowShiftModal(false);
    showToast(`Rekap Kasir & Cash Opname Shift berhasil disimpan!`);
  };

  // --- Reviews Handlers ---
  const handleApproveReview = (id: string) => {
    if (checkReadOnlyPermission()) return;
    const updated = reviews.map((r) => (r.id === id ? { ...r, status: 'Disetujui' as const } : r));
    setReviews(updated);
    saveReviews(updated);
    showToast('Ulasan pelanggan berhasil disetujui & dipublikasikan ke Landing Page!');
  };

  const handleRejectReview = (id: string) => {
    if (checkReadOnlyPermission()) return;
    const updated = reviews.map((r) => (r.id === id ? { ...r, status: 'Ditolak' as const } : r));
    setReviews(updated);
    saveReviews(updated);
    showToast('Ulasan pelanggan disembunyikan / ditolak.');
  };

  const handleDeleteReview = (id: string) => {
    if (checkReadOnlyPermission()) return;
    const rev = reviews.find((r) => r.id === id);
    setDeleteConfirmTarget({
      type: 'review',
      id,
      title: `Hapus Ulasan "${rev?.name || 'Pelanggan'}"?`,
      description: 'Ulasan/testimoni pelanggan ini akan dihapus secara permanen.'
    });
  };

  const handleResetReviewsToDefault = () => {
    if (checkReadOnlyPermission()) return;
    setReviews(REVIEWS);
    saveReviews(REVIEWS);
    showToast('Data ulasan direset ke standar tanpa duplikat!');
  };

  const handleOpenAddReview = () => {
    if (checkReadOnlyPermission()) return;
    setEditingReviewId(null);
    setRevName('');
    setRevRole('Pelanggan Setia');
    setRevComment('');
    setRevRating(5);
    setRevFavoriteDish('Creamy Garlic Herb Steak');
    setRevStatus('Disetujui');
    setRevOutlet(locations[0]?.name || 'Steak 11, Cibubur');
    setShowReviewModal(true);
  };

  const handleOpenEditReview = (rev: ReviewItem) => {
    if (checkReadOnlyPermission()) return;
    setEditingReviewId(rev.id);
    setRevName(rev.name || '');
    setRevRole(rev.role || 'Pelanggan Setia');
    setRevComment(rev.comment || '');
    setRevRating(rev.rating || 5);
    setRevFavoriteDish(rev.favoriteDish || 'Creamy Garlic Herb Steak');
    setRevStatus(rev.status || 'Disetujui');
    setRevOutlet(rev.outlet || locations[0]?.name || 'Steak 11, Cibubur');
    setShowReviewModal(true);
  };

  const handleSaveReview = () => {
    if (checkReadOnlyPermission()) return;
    if (!revName.trim() || !revComment.trim()) {
      showToast('Nama dan ulasan wajib diisi!');
      return;
    }
    let updated: ReviewItem[];
    if (editingReviewId) {
      updated = reviews.map((r) =>
        r.id === editingReviewId
          ? {
              ...r,
              name: revName.trim(),
              role: revRole.trim(),
              comment: revComment.trim(),
              rating: revRating,
              favoriteDish: revFavoriteDish,
              status: revStatus,
              outlet: revOutlet,
            }
          : r
      );
      showToast('Data ulasan berhasil diperbarui!');
    } else {
      const newRev: ReviewItem = {
        id: 'REV-' + Date.now().toString().slice(-4),
        name: revName.trim(),
        role: revRole.trim(),
        comment: revComment.trim(),
        rating: revRating,
        favoriteDish: revFavoriteDish,
        date: new Date().toISOString().split('T')[0],
        status: revStatus,
        outlet: revOutlet,
      };
      updated = [newRev, ...reviews];
      showToast('Testimoni baru berhasil ditambahkan!');
    }
    setReviews(updated);
    saveReviews(updated);
    setShowReviewModal(false);
  };

  // --- POS Kasir Handlers ---
  const handleAddPosToCart = (item: MenuItem) => {
    if (checkReadOnlyPermission()) return;
    const existingIdx = posCart.findIndex((c) => c.item.id === item.id);
    const cogs = item.cogs || Math.round(item.price * 0.45);
    if (existingIdx >= 0) {
      const updatedCart = [...posCart];
      updatedCart[existingIdx].quantity += 1;
      updatedCart[existingIdx].subtotal = updatedCart[existingIdx].quantity * updatedCart[existingIdx].itemPrice;
      setPosCart(updatedCart);
    } else {
      setPosCart([
        ...posCart,
        {
          id: 'CART-' + Date.now().toString().slice(-4),
          item,
          quantity: 1,
          itemPrice: item.price,
          cogsPrice: cogs,
          subtotal: item.price,
        },
      ]);
    }
    showToast(`+ ${item.name} ditambahkan ke keranjang kasir!`);
  };

  const handleConfirmCustomizePosItem = () => {
    if (checkReadOnlyPermission()) return;
    if (!customizingItem) return;
    const chickenObj = chickenOptions.find((c) => c.name === posSelectedChicken);
    const sauceObj = sauceOptions.find((s) => s.name === posSelectedSauce);
    let extraPrice = (chickenObj?.priceAdjustment || 0) + (sauceObj?.priceAdjustment || 0);

    const addonNames: string[] = [];
    posSelectedAddons.forEach((aName) => {
      const addonObj = addonOptions.find((a) => a.name === aName);
      if (addonObj) {
        extraPrice += addonObj.price;
        addonNames.push(addonObj.name);
      }
    });

    const basePrice = customizingItem.price;
    const finalUnitPrice = basePrice + extraPrice;
    const baseCogs = customizingItem.cogs || Math.round(basePrice * 0.45);

    const newItem = {
      id: 'CART-' + Date.now().toString().slice(-4),
      item: customizingItem,
      selectedChicken: posSelectedChicken,
      selectedSauce: posSelectedSauce,
      selectedAddons: addonNames,
      quantity: posItemQty,
      itemPrice: finalUnitPrice,
      cogsPrice: baseCogs,
      subtotal: finalUnitPrice * posItemQty,
    };

    setPosCart([...posCart, newItem]);
    setCustomizingItem(null);
    showToast(`${customizingItem.name} disesuaikan & masuk keranjang!`);
  };

  const handlePosCheckout = () => {
    if (checkReadOnlyPermission()) return;
    if (posCart.length === 0) {
      showToast('Keranjang kasir masih kosong! Silakan pilih menu terlebih dahulu.');
      return;
    }

    const cartItemsStr = posCart
      .map(
        (c) =>
          `${c.item.name} x${c.quantity}${c.selectedSauce ? ` (${c.selectedSauce})` : ''}`
      )
      .join(', ');

    const subtotal = posCart.reduce((acc, c) => acc + c.subtotal, 0);
    const tax = Math.round(subtotal * 0.1);
    const grandTotal = subtotal - posDiscountAmount + tax;

    let effectiveCashPaid = posCashPaid;
    if (posPaymentMethod === 'Cash') {
      if (effectiveCashPaid === 0) {
        effectiveCashPaid = grandTotal;
      } else if (effectiveCashPaid < grandTotal) {
        showToast(`❌ Uang tunai kurang! Total bayar: ${formatRupiah(grandTotal)}, Uang diterima: ${formatRupiah(effectiveCashPaid)}.`);
        return;
      }
    }

    const totalCogs = posCart.reduce(
      (sum, c) => sum + ((c.cogsPrice || Math.round(c.itemPrice * 0.45)) * c.quantity),
      0
    );
    const netProfit = Math.max(0, grandTotal - totalCogs);
    const currentCashierName = currentUser?.name || 'Kasir Direct';

    const orderId = getNextReceiptNumber(cashierOutlet);
    const newOrder: OrderItem = {
      id: orderId,
      date: new Date().toISOString().split('T')[0],
      createdTime: new Date().toTimeString().slice(0, 5),
      customerName: cashierCustomerName || 'Pelanggan Walk-in',
      phone: cashierCustomerPhone || '08123456789',
      outlet: cashierOutlet,
      items: cartItemsStr as any,
      itemsSummary: cartItemsStr,
      subtotal: subtotal,
      discountAmount: posDiscountAmount,
      taxAmount: tax,
      total: grandTotal,
      totalPrice: grandTotal,
      status: 'Selesai',
      createdAt: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().slice(0, 5),
      serviceType: cashierServiceType,
      tableNumber: cashierServiceType === 'Dine In' ? `Meja ${cashierTableNum}` : undefined,
      addressOrNotes: cashierServiceType === 'Dine In' ? `Nomor Meja: ${cashierTableNum}` : 'Pemesanan Kasir Direct',
      addressOrTime: cashierServiceType === 'Dine In' ? `Makan di Tempat - Meja ${cashierTableNum}` : 'Kasir Direct',
      paymentMethod: posPaymentMethod,
      cashPaid: posPaymentMethod === 'Cash' ? effectiveCashPaid : grandTotal,
      changeAmount: posPaymentMethod === 'Cash' ? Math.max(0, effectiveCashPaid - grandTotal) : 0,
      cashierName: currentCashierName,
      cogsTotal: totalCogs,
      netProfit: netProfit,
      deliveryFee: 0,
    };

    const updatedOrders = [newOrder, ...orders];
    saveOrders(updatedOrders);
    setOrders(updatedOrders);

    // Trigger Thermal Receipt
    setReceiptOrder(newOrder);
    setShowReceiptModal(true);

    // Reset Cart
    setPosCart([]);
    setPosDiscountAmount(0);
    setPosDiscountCode('');
    setPosCashPaid(0);
    showToast(`Transaksi POS ${orderId} Berhasil Diproses!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF9F6] dark:bg-[#12071B] flex flex-col h-screen overflow-hidden">
      {/* Top Admin Header */}
      <div className="bg-white dark:bg-[#180B24] border-b border-slate-200 dark:border-purple-900/50 shadow-xs px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 z-40">
        <div className="flex items-center gap-3">
          {/* Sidebar Toggle Button */}
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 768) {
                setIsMobileDrawerOpen(!isMobileDrawerOpen);
              } else {
                setIsSidebarOpen(!isSidebarOpen);
              }
            }}
            className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#3D1259] dark:text-amber-300 font-extrabold hover:bg-purple-200 dark:hover:bg-purple-800 transition-all cursor-pointer flex items-center gap-2 border border-purple-200 dark:border-purple-800"
            title="Buka / Sembunyikan Menu Navigasi"
          >
            <PanelLeft className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-black hidden md:inline">
              {isSidebarOpen ? 'Sembunyikan Sidebar' : 'Buka Sidebar'}
            </span>
          </button>

          <div className="w-9 h-9 rounded-lg bg-amber-400 text-purple-950 font-extrabold flex items-center justify-center font-baloo shadow-xs shrink-0">
            <Crown className="w-5 h-5 text-purple-950" />
          </div>
          <div>
            <h2 className="font-extrabold text-base sm:text-lg font-baloo text-[#3D1259] dark:text-amber-400 leading-tight">
              Admin & HR Operational Dashboard - Steak 11
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Manajemen Pesanan, Stok, Kasir, Karyawan, Absensi, & Payroll
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/60 dark:bg-purple-900/40 border border-purple-800/60 text-amber-300 font-bold text-xs shadow-xs"
            title="Waktu Real-time Operasional"
          >
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-mono text-[11px] sm:text-xs text-amber-300 font-extrabold tracking-tight">
              {headerDateTime || 'Memuat waktu...'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>

      {/* Main Wrapper with Left Sidebar */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* OVERLAY BACKDROP FOR MOBILE */}
        {isMobileDrawerOpen && (
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden"
          />
        )}

        {/* VERTICAL LEFT SIDEBAR */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-40 md:z-20 w-72 bg-white dark:bg-[#180B24] border-r border-slate-200 dark:border-purple-900/50 flex flex-col h-full transition-all duration-300 ease-in-out shrink-0 ${
            isMobileDrawerOpen
              ? 'translate-x-0 opacity-100 shadow-2xl'
              : '-translate-x-full opacity-0 pointer-events-none md:pointer-events-auto md:opacity-100'
          } ${
            isSidebarOpen
              ? 'md:translate-x-0 md:w-72 md:opacity-100 md:pointer-events-auto md:shadow-none'
              : 'md:translate-x-0 md:w-0 md:opacity-0 md:overflow-hidden md:pointer-events-none md:border-none md:shadow-none'
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-100 dark:border-purple-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-purple-900 dark:text-amber-400 font-baloo">
                Menu Navigasi Left
              </span>
            </div>
            <button
              onClick={() => {
                setIsSidebarOpen(false);
                setIsMobileDrawerOpen(false);
              }}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-purple-900/60 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              title="Tutup Menu Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Active Logged In User Profile Banner */}
          {currentUser && (
            <div className="mx-3 my-2 p-2.5 rounded-xl bg-purple-900/30 dark:bg-purple-950 border border-purple-700/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-lg bg-amber-400 text-purple-950 font-black flex items-center justify-center shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="truncate">
                  <div className="font-extrabold text-[#3D1259] dark:text-amber-400 truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">
                    {currentUser.role}
                  </div>
                </div>
              </div>
              {currentUser.allowedTabs && (
                <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-500 text-[9px] font-black shrink-0" title="Hak Akses Terbatas">
                  RBAC
                </span>
              )}
            </div>
          )}

          {/* Sidebar Item Links */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
            {/* GROUP 1: PENJUALAN & KASIR */}
            <div>
              <div className="px-3 mb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-purple-400 font-mono">
                Penjualan & Kasir POS
              </div>
              <div className="space-y-1">
                {canAccessTab('dashboard') && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('dashboard'); setIsMobileDrawerOpen(false); }}
                    className={`w-full px-3 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'dashboard'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <LayoutDashboard className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Dashboard Utama</span>
                    </div>
                  </button>
                )}

                {canAccessTab('kasir') && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('kasir'); setIsMobileDrawerOpen(false); }}
                    className={`w-full px-3 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'kasir'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShoppingBag className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Kasir</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-[9px] uppercase">
                      POS
                    </span>
                  </button>
                )}

                {canAccessTab('pesanan') && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('pesanan'); setIsMobileDrawerOpen(false); }}
                    className={`w-full px-3 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'pesanan'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Daftar Pesanan</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-purple-900 dark:text-amber-300 font-black text-[10px]">
                      {totalOrders}
                    </span>
                  </button>
                )}

                {canAccessTab('analytics') && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('analytics'); setIsMobileDrawerOpen(false); }}
                    className={`w-full px-3 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'analytics'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <TrendingUp className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Analisis Keuangan</span>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* GROUP 2: PRODUK & PERSEDIAAN */}
            <div>
              <div className="px-3 mb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-purple-400 font-mono">
                Produk & Persediaan
              </div>
              <div className="space-y-1">
                {canAccessTab('menu') && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('menu'); setIsMobileDrawerOpen(false); }}
                    className={`w-full px-3 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'menu'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Utensils className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Daftar Menu</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-purple-900/60 font-black text-[10px]">
                      {(menuItems || []).length}
                    </span>
                  </button>
                )}

                {canAccessTab('racik') && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('racik'); setIsMobileDrawerOpen(false); }}
                    className={`w-full px-3 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'racik'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ChefHat className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Racikan</span>
                    </div>
                  </button>
                )}

                {canAccessTab('inventory') && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('inventory'); setIsMobileDrawerOpen(false); }}
                    className={`w-full px-3 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'inventory'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Boxes className="w-4 h-4 text-orange-400 shrink-0" />
                      <span>Manajemen Stok</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-purple-900/60 font-black text-[10px]">
                      {(inventory || []).length}
                    </span>
                  </button>
                )}

                {canAccessTab('reviews') && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('reviews'); setIsMobileDrawerOpen(false); }}
                    className={`w-full px-3 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'reviews'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MessageSquare className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Ulasan Pelanggan</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-400 font-black text-[10px]">
                      {(reviews || []).length}
                    </span>
                  </button>
                )}

                {canAccessTab('promos') && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('promos'); setIsMobileDrawerOpen(false); }}
                    className={`w-full px-3 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'promos'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Percent className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Voucher & Kode Promo</span>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* GROUP 3: HR & OPERASIONAL */}
            <div>
              <div className="px-3 mb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-purple-400 font-mono">
                HR, Presensi & Shift
              </div>
              <div className="space-y-1">
                {canAccessTab('karyawan') && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('karyawan'); setIsMobileDrawerOpen(false); }}
                    className={`w-full px-3 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'karyawan'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Data Karyawan</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-purple-900/60 font-black text-[10px]">
                      {(employees || []).length}
                    </span>
                  </button>
                )}

                {canAccessTab('absensi') && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('absensi'); setIsMobileDrawerOpen(false); }}
                    className={`w-full px-3 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'absensi'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Rekap Presensi Digital</span>
                    </div>
                  </button>
                )}

                {canAccessTab('presensi_kamera') && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('presensi_kamera'); setIsMobileDrawerOpen(false); }}
                    className={`w-full px-3 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'presensi_kamera'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Camera className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Presensi Kamera Selfie</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px]">
                      LIVE
                    </span>
                  </button>
                )}

                {canAccessTab('jadwal') && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('jadwal'); setIsMobileDrawerOpen(false); }}
                    className={`w-full px-3 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'jadwal'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Jadwal Shift Kerja</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold text-[10px]">
                      ROSTER
                    </span>
                  </button>
                )}

                {canAccessTab('penggajian') && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('penggajian'); setIsMobileDrawerOpen(false); }}
                    className={`w-full px-3 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'penggajian'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Calculator className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Penggajian</span>
                    </div>
                  </button>
                )}

                {(canAccessTab('shifts') || canAccessTab('expenses')) && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('shifts'); setIsMobileDrawerOpen(false); }}
                    className={`w-full px-3 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'shifts' || activeTab === 'expenses'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Banknote className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Laporan Keuangan</span>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* GROUP 4: SISTEM & OUTLET */}
            <div>
              <div className="px-3 mb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-purple-400 font-mono">
                Sistem & Pengaturan
              </div>
              <div className="space-y-1">
                {canAccessTab('outlets') && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('outlets'); setIsMobileDrawerOpen(false); }}
                    className={`w-full px-3 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'outlets'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Outlet & Shift Rules</span>
                    </div>
                  </button>
                )}

                {canAccessTab('admin') && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('admin'); setIsMobileDrawerOpen(false); }}
                    className={`w-full px-3 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'admin'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Admin System</span>
                    </div>
                  </button>
                )}

                {canAccessTab('wa') && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('wa'); setIsMobileDrawerOpen(false); }}
                    className={`w-full px-3 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'wa'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <PhoneCall className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Notifikasi WhatsApp</span>
                    </div>
                  </button>
                )}

                {canAccessTab('branding') && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('branding'); setIsMobileDrawerOpen(false); }}
                    className={`w-full px-3 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'branding'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Identitas & Branding</span>
                    </div>
                  </button>
                )}

                {canAccessTab('system') && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('system'); setIsMobileDrawerOpen(false); }}
                    className={`w-full px-3 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'system'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Database className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Integrasi & System</span>
                    </div>
                  </button>
                )}

                {(canAccessTab('firebase') || canAccessTab('admin')) && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('firebase'); setIsMobileDrawerOpen(false); }}
                    className={`w-full px-3 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'firebase'
                        ? 'bg-amber-500 dark:bg-amber-400 text-purple-950 shadow-md'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Firebase Sync</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold text-[10px]">
                      Firestore
                    </span>
                  </button>
                )}

                {canAccessTab('payment_receipt_settings') && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('payment_receipt_settings'); setIsMobileDrawerOpen(false); }}
                    className={`w-full px-3 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'payment_receipt_settings'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Pembayaran & Struk</span>
                    </div>
                  </button>
                )}

                {canAccessTab('audit_logs') && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('audit_logs'); setIsMobileDrawerOpen(false); }}
                    className={`w-full px-3 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'audit_logs'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Audit Log Aktivitas</span>
                    </div>
                  </button>
                )}

                {canAccessTab('customers') && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('customers'); setIsMobileDrawerOpen(false); }}
                    className={`w-full px-3 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'customers'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Data Pelanggan & WA</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 font-black text-[9px] uppercase">
                      CRM
                    </span>
                  </button>
                )}

                {canAccessTab('pengunjung') && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('pengunjung'); setIsMobileDrawerOpen(false); }}
                    className={`w-full px-3 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'pengunjung'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Data Pengunjung</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-purple-950 dark:text-amber-300 font-black text-[9px] uppercase">
                      VISITOR
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('user_guide' as any); setIsMobileDrawerOpen(false); }}
                  className={`w-full px-3 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer ${
                    (activeTab as string) === 'user_guide'
                      ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Panduan & Tutorial</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-purple-950 dark:text-amber-300 font-black text-[9px] uppercase">
                    Bantuan
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 border-t border-slate-100 dark:border-purple-900/40 bg-slate-50/60 dark:bg-purple-950/30 text-[10px] text-slate-400 text-center font-mono">
            {brandingSettings.systemVersionText || 'Steak 11 v1.0 System'}
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT PANEL */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {!isSidebarOpen && (
            <div className="hidden md:block mb-2">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs shadow-md hover:bg-amber-300 transition-all flex items-center gap-2 cursor-pointer"
              >
                <PanelLeftOpen className="w-4 h-4" /> Tampilkan Menu Navigasi Sidebar
              </button>
            </div>
          )}

        {/* TAB 0: DASHBOARD UTAMA */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#3D1259] via-purple-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
                <Crown className="w-64 h-64 text-amber-400" />
              </div>
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase mb-3">
                  <Sparkles className="w-3.5 h-3.5" /> Dashboard Pusat Operasional Steak 11
                </div>
                <h1 className="text-2xl sm:text-3xl font-black font-baloo text-amber-400 mb-2">
                  Selamat Datang, {currentUser?.name || 'Administrator System'}!
                </h1>
                <p className="text-xs sm:text-sm text-purple-100 leading-relaxed font-medium">
                  Pantau performa penjualan seluruh cabang outlet, jalankan transaksi kasir POS, kelola bahan baku COGS, serta monitoring absensi & ulasan pelanggan secara real-time.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('kasir')}
                    className="px-4 py-2.5 rounded-xl bg-amber-400 text-purple-950 font-black text-xs hover:bg-amber-300 transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" /> Buka Kasir
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="px-4 py-2.5 rounded-xl bg-purple-800/80 hover:bg-purple-800 border border-purple-600 text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Analisis Laba Rugi
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Total Omzet Penjualan</span>
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-[#3D1259] dark:text-amber-400 font-baloo">
                  {formatRupiah(totalRevenue)}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Total dari {(orders || []).length} transaksi
                </div>
              </div>

              <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Estimasi Laba Kotor</span>
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-baloo">
                  {formatRupiah(Math.round(totalRevenue * 0.55))}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Margin Laba Rata-rata: ~55%
                </div>
              </div>

              <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Pesanan Pending</span>
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-500 font-baloo">
                  {pendingOrders} Transaksi
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Perlu diproses oleh kasir & dapur
                </div>
              </div>

              <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Karyawan Bertugas</span>
                  <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-purple-700 dark:text-amber-300 font-baloo">
                  {(employees || []).filter(e => e.status === 'Aktif').length} Karyawan
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {(attendance || []).length} Absensi tercatat hari ini
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-500" /> Akses Cepat Fitur Modul
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div
                  onClick={() => setActiveTab('kasir')}
                  className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 hover:border-amber-400 dark:hover:border-amber-400 cursor-pointer transition-all shadow-xs hover:shadow-md group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 group-hover:text-amber-500 transition-colors">
                        Kasir
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Input transaksi & Cetak Struk Bluetooth Thermal (58mm/80mm)</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('pesanan')}
                  className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 hover:border-amber-400 dark:hover:border-amber-400 cursor-pointer transition-all shadow-xs hover:shadow-md group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 group-hover:text-amber-500 transition-colors">
                        Daftar Pesanan Masuk
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Monitor status pesanan online & takeaway secara live</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('analytics')}
                  className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 hover:border-amber-400 dark:hover:border-amber-400 cursor-pointer transition-all shadow-xs hover:shadow-md group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 group-hover:text-amber-500 transition-colors">
                        Laporan Laba Rugi
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Analisis COGS per porsi, grafik Jam Sibuk & Menu Terlaris</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('reviews')}
                  className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 hover:border-amber-400 dark:hover:border-amber-400 cursor-pointer transition-all shadow-xs hover:shadow-md group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 group-hover:text-amber-500 transition-colors">
                        Testimoni & Ulasan
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Setujui atau tambah ulasan rating bintang pelanggan</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('karyawan')}
                  className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 hover:border-amber-400 dark:hover:border-amber-400 cursor-pointer transition-all shadow-xs hover:shadow-md group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 group-hover:text-amber-500 transition-colors">
                        Kelola Akun Karyawan
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Atur PIN login & Hak Akses Menu (RBAC) Karyawan</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('absensi')}
                  className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 hover:border-amber-400 dark:hover:border-amber-400 cursor-pointer transition-all shadow-xs hover:shadow-md group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 group-hover:text-amber-500 transition-colors">
                        Rekap Presensi Digital
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Cetak rekap absensi shift GPS karyawan ke Excel & PDF</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('jadwal')}
                  className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 hover:border-amber-400 dark:hover:border-amber-400 cursor-pointer transition-all shadow-xs hover:shadow-md group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 group-hover:text-amber-500 transition-colors">
                        Jadwal Shift Kerja & Roster
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Atur & pantau penugasan shift kerja harian per karyawan</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('pengunjung')}
                  className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 hover:border-amber-400 dark:hover:border-amber-400 cursor-pointer transition-all shadow-xs hover:shadow-md group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 group-hover:text-amber-500 transition-colors">
                        Data Pengunjung
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Daftar pengguna login Google Auth & Pengunjung Read-Only</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB KASIR POS */}
        {activeTab === 'kasir' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1f0e30] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-500" />
                  <span className="font-extrabold text-sm text-[#3D1259] dark:text-amber-400 font-baloo">
                    Terminal Kasir POS Direct
                  </span>
                </div>
                
                <select
                  value={cashierOutlet}
                  onChange={(e) => setCashierOutlet(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-extrabold"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      📍 {loc.name}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-purple-950 p-1 rounded-xl">
                  {(['Dine In', 'Takeaway', 'Delivery'] as const).map((sType) => (
                    <button
                      key={sType}
                      onClick={() => setCashierServiceType(sType)}
                      className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        cashierServiceType === sType
                          ? 'bg-[#3D1259] text-amber-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                      }`}
                    >
                      {sType}
                    </button>
                  ))}
                </div>

                {cashierServiceType === 'Dine In' && (
                  <input
                    type="text"
                    value={cashierTableNum}
                    onChange={(e) => setCashierTableNum(e.target.value)}
                    placeholder="No. Meja"
                    className="w-24 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
                  />
                )}
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-semibold">Kasir Bertugas</div>
                  <div className="text-xs font-black text-[#3D1259] dark:text-amber-400">
                    {currentUser?.name || 'Kasir Utama'}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      value={cashierSearch}
                      onChange={(e) => setCashierSearch(e.target.value)}
                      placeholder="Cari menu steak, saus, minuman..."
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-purple-900 bg-white dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
                    <button
                      onClick={() => setCashierCategory('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${
                        cashierCategory === 'all'
                          ? 'bg-[#3D1259] text-amber-400'
                          : 'bg-white dark:bg-[#1f0e30] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-purple-900'
                      }`}
                    >
                      Semua Menu
                    </button>
                    {posCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setCashierCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${
                          cashierCategory === cat.id
                            ? 'bg-[#3D1259] text-amber-400'
                            : 'bg-white dark:bg-[#1f0e30] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-purple-900'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(menuItems || [])
                    .filter((item) => {
                      const matchSearch =
                        item.name.toLowerCase().includes(cashierSearch.toLowerCase()) ||
                        (item.description && item.description.toLowerCase().includes(cashierSearch.toLowerCase()));
                      if (!matchSearch) return false;
                      if (cashierCategory === 'all') return true;
                      if (cashierCategory === 'signature') return item.isSignature || item.category === 'signature';
                      if (cashierCategory === 'addon') return !item.isSignature || item.category === 'addon';

                      const targetCat = posCategories.find((c) => c.id === cashierCategory);
                      if (targetCat) {
                        return (
                          item.category === targetCat.name ||
                          item.category === targetCat.id ||
                          item.category.toLowerCase() === targetCat.name.toLowerCase()
                        );
                      }
                      return item.category === cashierCategory;
                    })
                    .map((item) => {
                      const displayImg = item.imageUrl || (item as any).image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80';
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleAddPosToCart(item)}
                          className="bg-white dark:bg-[#1f0e30] rounded-2xl p-3 border border-slate-200 dark:border-purple-900/50 hover:border-amber-400 cursor-pointer transition-all shadow-xs hover:shadow-md flex flex-col justify-between group relative overflow-hidden"
                        >
                          {item.badge && (
                            <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-amber-400 text-purple-950 text-[9px] font-black uppercase">
                              {item.badge}
                            </span>
                          )}
                          <div>
                            <img
                              src={displayImg}
                              alt={item.name}
                              className="w-full h-24 object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                            <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 line-clamp-1">
                              {item.name}
                            </h4>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {item.category}
                            </div>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-purple-900/40 flex items-center justify-between">
                            <span className="font-black text-xs text-[#3D1259] dark:text-amber-400">
                              {formatRupiah(item.price)}
                            </span>
                            <span className="p-1 rounded-lg bg-amber-400 text-purple-950 font-black text-xs group-hover:bg-amber-300">
                              + Tambah
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="lg:col-span-5 bg-white dark:bg-[#1f0e30] rounded-2xl border border-slate-200 dark:border-purple-900/50 p-4 sm:p-5 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-purple-900/40">
                    <h3 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-amber-500" /> Ringkasan Keranjang Kasir
                    </h3>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-400">
                      {posCart.reduce((a, b) => a + b.quantity, 0)} Item
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Pelanggan</label>
                      <input
                        type="text"
                        value={cashierCustomerName}
                        onChange={(e) => setCashierCustomerName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">No. WhatsApp</label>
                      <input
                        type="text"
                        value={cashierCustomerPhone}
                        onChange={(e) => setCashierCustomerPhone(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto my-3 pr-1">
                    {posCart.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs italic">
                        Keranjang kasir masih kosong. Klik menu di samping untuk menambah item.
                      </div>
                    ) : (
                      posCart.map((c, idx) => (
                        <div
                          key={c.id}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/60 border border-slate-200 dark:border-purple-900/50 flex items-center justify-between text-xs"
                        >
                          <div className="flex-1 pr-2">
                            <div className="font-extrabold text-slate-800 dark:text-slate-100">
                              {c.item.name}
                            </div>
                            {c.selectedSauce && (
                              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                                Saus: {c.selectedSauce}
                              </div>
                            )}
                            {c.selectedAddons && c.selectedAddons.length > 0 && (
                              <div className="text-[9px] text-slate-500 dark:text-slate-400">
                                Addons: {c.selectedAddons.join(', ')}
                              </div>
                            )}
                            <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                              {formatRupiah(c.itemPrice)} x {c.quantity}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-black text-xs text-[#3D1259] dark:text-amber-400">
                              {formatRupiah(c.subtotal)}
                            </span>
                            <button
                              onClick={() => {
                                const updated = posCart.filter((_, i) => i !== idx);
                                setPosCart(updated);
                              }}
                              className="p-1 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                              title="Hapus item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-purple-900/40 space-y-3">
                  <div className="flex gap-2">
                    <select
                      value={posDiscountCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        setPosDiscountCode(code);
                        const promo = promos.find((p) => p.code === code);
                        if (promo) {
                          setPosDiscountAmount(promo.discountValue);
                        } else {
                          setPosDiscountAmount(0);
                        }
                      }}
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                    >
                      <option value="">Gunakan Promo Voucher (Opsional)</option>
                      {promos.map((p) => (
                        <option key={p.id} value={p.code}>
                          {p.code} - Diskon {formatRupiah(p.discountValue)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal Item</span>
                      <span>{formatRupiah(posCart.reduce((a, b) => a + b.subtotal, 0))}</span>
                    </div>
                    {posDiscountAmount > 0 && (
                      <div className="flex justify-between text-rose-500 font-bold">
                        <span>Diskon Promo</span>
                        <span>-{formatRupiah(posDiscountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-500">
                      <span>Pajak Resto (10%)</span>
                      <span>{formatRupiah(Math.round(posCart.reduce((a, b) => a + b.subtotal, 0) * 0.1))}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-[#3D1259] dark:text-amber-400 pt-2 border-t border-slate-200 dark:border-purple-900">
                      <span>TOTAL BAYAR</span>
                      <span>
                        {formatRupiah(
                          Math.max(
                            0,
                            posCart.reduce((a, b) => a + b.subtotal, 0) -
                              posDiscountAmount +
                              Math.round(posCart.reduce((a, b) => a + b.subtotal, 0) * 0.1)
                          )
                        )}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">
                        Metode Pembayaran
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveTab('payment_receipt_settings')}
                        className="text-[10px] font-bold text-amber-500 hover:text-amber-600 underline cursor-pointer"
                      >
                        Atur Pembayaran
                      </button>
                    </div>
                    
                    {(() => {
                      const rawCfg = getStoredPaymentSettings();
                      const posPaymentConfig = {
                        cash: rawCfg?.cash || { enabled: true, quickCashPresets: [20000, 50000, 100000] },
                        qris: rawCfg?.qris || { enabled: true, merchantName: 'QRIS STEAK 11', nmid: 'ID10200300405011', instructions: 'Scan QRIS via GoPay, OVO, ShopeePay, DANA, BCA', qrisImageUrl: '' },
                        transfer: rawCfg?.transfer || { enabled: true, bankName: 'BCA', accountNumber: '8830-1122-33', accountHolder: 'PT STEAK SEBELAS NUSANTARA' },
                        debit: rawCfg?.debit || { enabled: true, bankName: 'BCA / Mandiri', terminalId: 'TID-88192301', instructions: 'Gesek / Dip kartu pada Mesin EDC Outlet.' }
                      };
                      return (
                        <div className="space-y-2">
                          <div className="grid grid-cols-4 gap-1.5">
                            {(['Cash', 'QRIS', 'Transfer', 'Debit'] as const).map((pm) => {
                              const key = pm.toLowerCase() as keyof typeof posPaymentConfig;
                              const isEnabled = posPaymentConfig[key]?.enabled ?? true;
                              if (!isEnabled) return null;

                              return (
                                <button
                                  key={pm}
                                  onClick={() => setPosPaymentMethod(pm)}
                                  className={`py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                                    posPaymentMethod === pm
                                      ? 'bg-[#3D1259] text-amber-400 shadow-xs'
                                      : 'bg-slate-100 dark:bg-purple-950 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {pm}
                                </button>
                              );
                            })}
                          </div>

                          {posPaymentMethod === 'Cash' && (
                            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-purple-950/80 border border-amber-200 dark:border-purple-800 space-y-2">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-700 dark:text-slate-200">Uang Diterima:</span>
                                <input
                                  type="number"
                                  value={posCashPaid || ''}
                                  onChange={(e) => setPosCashPaid(Number(e.target.value))}
                                  placeholder="Rp 0"
                                  className="w-32 text-right px-2 py-1 text-xs font-black rounded-lg border border-slate-200 dark:border-purple-800 bg-white dark:bg-purple-900 text-slate-900 dark:text-slate-100"
                                />
                              </div>
                              <div className="flex items-center gap-1">
                                {(posPaymentConfig.cash.quickCashPresets || [20000, 50000, 100000]).map((preset) => (
                                  <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setPosCashPaid(preset)}
                                    className="flex-1 py-1 rounded bg-white dark:bg-purple-900 border text-[10px] font-bold cursor-pointer hover:bg-slate-50 text-slate-800 dark:text-slate-200"
                                  >
                                    {preset >= 1000 ? `${preset / 1000}k` : preset}
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const subtotalCalc = posCart.reduce((a, b) => a + b.subtotal, 0);
                                    const taxCalc = Math.round(subtotalCalc * 0.1);
                                    const grandTotal = Math.max(0, subtotalCalc - posDiscountAmount + taxCalc);
                                    setPosCashPaid(grandTotal);
                                  }}
                                  className="py-1 px-2 rounded bg-amber-400 text-purple-950 font-black text-[10px] cursor-pointer hover:bg-amber-300"
                                >
                                  Pas
                                </button>
                              </div>
                              <div className="flex justify-between text-xs font-black text-purple-900 dark:text-amber-400 pt-1 border-t border-amber-200 dark:border-purple-800">
                                <span>Kembalian:</span>
                                <span>
                                  {formatRupiah(
                                    Math.max(
                                      0,
                                      (posCashPaid || 0) -
                                        (posCart.reduce((a, b) => a + b.subtotal, 0) -
                                          posDiscountAmount +
                                          Math.round(posCart.reduce((a, b) => a + b.subtotal, 0) * 0.1))
                                    )
                                  )}
                                </span>
                              </div>
                            </div>
                          )}

                          {posPaymentMethod === 'QRIS' && (
                            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 space-y-1.5 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-purple-900 dark:text-amber-300">
                                  {posPaymentConfig.qris.merchantName || 'QRIS STEAK 11'}
                                </span>
                                <span className="text-[10px] font-mono text-purple-700 dark:text-purple-300">
                                  NMID: {posPaymentConfig.qris.nmid || 'ID10200300405011'}
                                </span>
                              </div>
                              {posPaymentConfig.qris.qrisImageUrl && (
                                <div className="flex justify-center p-1.5 bg-white rounded-lg border border-purple-100">
                                  <img
                                    src={posPaymentConfig.qris.qrisImageUrl}
                                    alt="QR Code"
                                    className="w-28 h-28 object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://i.ibb.co/zWhxV6Bp/Gemini-Generated-Image-vvqchqvvqchqvvqc.png';
                                    }}
                                  />
                                </div>
                              )}
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center italic">
                                {posPaymentConfig.qris.instructions || 'Scan QRIS via GoPay, OVO, ShopeePay, DANA, BCA'}
                              </p>
                            </div>
                          )}

                          {posPaymentMethod === 'Transfer' && (
                            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-purple-950/80 border border-blue-200 dark:border-purple-800 space-y-1 text-xs">
                              <div className="flex justify-between items-center font-extrabold text-blue-900 dark:text-blue-300">
                                <span>{posPaymentConfig.transfer.bankName || 'BCA'}</span>
                                <span className="font-mono text-xs">{posPaymentConfig.transfer.accountNumber || '8830-1122-33'}</span>
                              </div>
                              <div className="text-[10px] text-slate-600 dark:text-slate-300">
                                A.N: <span className="font-bold">{posPaymentConfig.transfer.accountHolder || 'PT STEAK SEBELAS NUSANTARA'}</span>
                              </div>
                            </div>
                          )}

                          {posPaymentMethod === 'Debit' && (
                            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-purple-950/80 border border-amber-200 dark:border-purple-800 space-y-1 text-xs">
                              <div className="flex justify-between items-center font-extrabold text-amber-900 dark:text-amber-300">
                                <span>EDC {posPaymentConfig.debit.bankName || 'BCA / Mandiri'}</span>
                                <span className="font-mono text-[10px]">{posPaymentConfig.debit.terminalId || 'TID-88192301'}</span>
                              </div>
                              <p className="text-[10px] text-slate-600 dark:text-slate-300">
                                {posPaymentConfig.debit.instructions || 'Gesek / Dip kartu pada Mesin EDC Outlet.'}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <button
                    onClick={handlePosCheckout}
                    className="w-full py-3.5 rounded-2xl bg-amber-400 text-purple-950 font-black text-sm hover:bg-amber-300 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="w-5 h-5" /> Bayar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB ANALISIS LABA RUGI */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="font-black text-lg text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" /> Laporan Analisis Laba Rugi & Peak Hours (COGS)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ringkasan Estimasi Cost of Goods Sold (COGS), Grafik Jam Sibuk Penjualan & Top Menu Terlaris
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const doc = new jsPDF();
                    doc.setFontSize(14);
                    doc.setFont('helvetica', 'bold');
                    doc.text('STEAK 11 - LAPORAN ANALISIS LABA RUGI', 14, 18);
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');
                    doc.text(`Total Omzet: ${formatRupiah(totalRevenue)}`, 14, 26);
                    doc.text(`Estimasi Total COGS/HPP: ${formatRupiah(Math.round(totalRevenue * 0.45))}`, 14, 32);
                    doc.text(`Estimasi Laba Kotor: ${formatRupiah(Math.round(totalRevenue * 0.55))}`, 14, 38);

                    const tableCols = ['Nama Menu', 'Harga Jual', 'Estimasi HPP/COGS', 'Laba Kotor / Porsi', 'Margin %'];
                    const tableRows = menuItems.map((m) => {
                      const cogs = m.cogs || Math.round(m.price * 0.45);
                      const profit = m.price - cogs;
                      const margin = Math.round((profit / m.price) * 100);
                      return [m.name, formatRupiah(m.price), formatRupiah(cogs), formatRupiah(profit), `${margin}%`];
                    });

                    autoTable(doc, {
                      head: [tableCols],
                      body: tableRows,
                      startY: 45,
                    });

                    doc.save(`Laporan_Laba_Rugi_Steak11_${new Date().toISOString().split('T')[0]}.pdf`);
                    showToast('Laporan Laba Rugi berhasil diekspor ke PDF!');
                  }}
                  className="px-3 py-2 rounded-xl bg-purple-900 text-amber-300 font-bold text-xs hover:bg-purple-800 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4" /> Unduh PDF
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-xs">
                <div className="text-xs text-slate-500 font-bold mb-1">Total Omzet Penjualan</div>
                <div className="text-2xl font-black text-[#3D1259] dark:text-amber-400 font-baloo">
                  {formatRupiah(totalRevenue)}
                </div>
                <div className="text-[10px] text-emerald-500 font-bold mt-1">100% Total Pendapatan</div>
              </div>

              <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-xs">
                <div className="text-xs text-slate-500 font-bold mb-1">Estimasi COGS / HPP Total</div>
                <div className="text-2xl font-black text-rose-500 font-baloo">
                  {formatRupiah(Math.round(totalRevenue * 0.45))}
                </div>
                <div className="text-[10px] text-rose-500 font-bold mt-1">~45% HPP Bahan Baku</div>
              </div>

              <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-xs">
                <div className="text-xs text-slate-500 font-bold mb-1">Estimasi Laba Kotor (Gross Profit)</div>
                <div className="text-2xl font-black text-emerald-500 font-baloo">
                  {formatRupiah(Math.round(totalRevenue * 0.55))}
                </div>
                <div className="text-[10px] text-emerald-500 font-bold mt-1">Omzet dikurangi HPP</div>
              </div>

              <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-xs">
                <div className="text-xs text-slate-500 font-bold mb-1">Persentase Margin Laba Kotor</div>
                <div className="text-2xl font-black text-blue-500 font-baloo">
                  55.0%
                </div>
                <div className="text-[10px] text-blue-500 font-bold mt-1">Target Sehat Resto (&gt;50%)</div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-xs">
              <h3 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-400 font-baloo mb-1 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-500" /> Visualisasi Grafik Jam Sibuk Penjualan (Peak Hours Analysis)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Grafik kepadatan pesanan berdasarkan jam operasional outlet (Jam 11.00 - 22.00 WIB)
              </p>

              <div className="space-y-3">
                {[
                  { hour: '11:00 - 12:00', orders: 12, percent: 35, peak: false },
                  { hour: '12:00 - 13:00 (Makan Siang)', orders: 38, percent: 85, peak: true },
                  { hour: '13:00 - 14:00', orders: 25, percent: 60, peak: false },
                  { hour: '14:00 - 17:00 (Sore Quiet)', orders: 15, percent: 40, peak: false },
                  { hour: '18:00 - 19:00 (Makan Malam Peak)', orders: 45, percent: 100, peak: true },
                  { hour: '19:00 - 20:00 (Peak Malam)', orders: 40, percent: 90, peak: true },
                  { hour: '20:00 - 21:00', orders: 22, percent: 50, peak: false },
                  { hour: '21:00 - 22:00 (Closing)', orders: 10, percent: 25, peak: false },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-extrabold">
                      <span className={item.peak ? 'text-amber-500 dark:text-amber-400 font-black' : 'text-slate-700 dark:text-slate-300'}>
                        {item.hour} {item.peak && '🔥 PEAK HOUR'}
                      </span>
                      <span className="text-slate-500">{item.orders} Transaksi</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-purple-950 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.peak ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-purple-600'
                        }`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-xs">
                <h3 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-400 font-baloo mb-3 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-500" /> Menu Paling Laris (Top Selling Items)
                </h3>
                <div className="space-y-3">
                  {menuItems.slice(0, 5).map((m, i) => (
                    <div key={m.id} className="p-3 rounded-xl bg-slate-50 dark:bg-purple-950/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-amber-400 text-purple-950 font-black flex items-center justify-center text-xs">
                          #{i + 1}
                        </span>
                        <div>
                          <div className="font-extrabold text-slate-800 dark:text-slate-100">{m.name}</div>
                          <div className="text-[10px] text-slate-400">{m.category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-emerald-600 dark:text-emerald-400">{formatRupiah(m.price)}</div>
                        <div className="text-[10px] text-slate-400">Terjual ~{85 - i * 12} porsi</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-xs">
                <h3 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-400 font-baloo mb-3 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-blue-500" /> Estimasi HPP / COGS Per Porsi Menu
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-purple-900/50 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-2">Menu</th>
                        <th className="py-2 text-right">Harga Jual</th>
                        <th className="py-2 text-right">Est. HPP</th>
                        <th className="py-2 text-right">Laba/Porsi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-purple-900/40">
                      {menuItems.map((m) => {
                        const cogs = m.cogs || Math.round(m.price * 0.45);
                        const profit = m.price - cogs;
                        return (
                          <tr key={m.id}>
                            <td className="py-2 font-bold text-slate-800 dark:text-slate-100">{m.name}</td>
                            <td className="py-2 text-right font-semibold">{formatRupiah(m.price)}</td>
                            <td className="py-2 text-right text-rose-500 font-bold">{formatRupiah(cogs)}</td>
                            <td className="py-2 text-right text-emerald-500 font-black">{formatRupiah(profit)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB KELOLA TESTIMONI & ULASAN */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="font-black text-lg text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-500" /> Kelola Testimoni & Ulasan Pelanggan
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fitur Admin untuk menambah, mengedit, atau menyetujui ulasan dan rating pelanggan yang tampil di Landing Page.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={revFilterStatus}
                  onChange={(e) => setRevFilterStatus(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="Disetujui">Disetujui (Tampil di Landing)</option>
                  <option value="Pending">Pending</option>
                  <option value="Ditolak">Ditolak / Sembunyi</option>
                </select>

                <button
                  onClick={handleResetReviewsToDefault}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-purple-900/60 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-purple-800 transition-all cursor-pointer"
                  title="Bersihkan ulasan ganda & reset ke data awal"
                >
                  Reset / Bersihkan Data
                </button>

                <button
                  onClick={handleOpenAddReview}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-black text-xs hover:bg-amber-300 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Tambah Ulasan Baru
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews
                .filter((r) => revFilterStatus === 'ALL' || r.status === revFilterStatus)
                .map((r) => (
                  <div
                    key={r.id}
                    className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            r.status === 'Disetujui'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                              : r.status === 'Pending'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                              : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400'
                          }`}
                        >
                          {r.status}
                        </span>
                        <div className="flex items-center gap-1 text-amber-400">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-200 italic mb-4">
                        "{r.comment}"
                      </p>

                      <div className="border-t border-slate-100 dark:border-purple-900/40 pt-3">
                        <div className="font-extrabold text-xs text-[#3D1259] dark:text-amber-400">
                          {r.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                          <span className="font-semibold text-amber-600 dark:text-amber-400">Menu Favorit:</span> {r.favoriteDish || 'Creamy Garlic Herb Steak'}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5">
                          📍 {r.outlet || 'Steak 11, Cibubur'} • {r.date} • {r.role}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-purple-900/40">
                      <button
                        onClick={() => handleOpenEditReview(r)}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-100 text-purple-950 font-extrabold text-xs hover:bg-amber-200 transition-all flex items-center justify-center gap-1 cursor-pointer"
                        title="Edit Ulasan & Menu Favorit"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>

                      {r.status !== 'Disetujui' ? (
                        <button
                          onClick={() => handleApproveReview(r.id)}
                          className="flex-1 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Setujui
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRejectReview(r.id)}
                          className="flex-1 py-1.5 rounded-xl bg-slate-200 dark:bg-purple-900 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Sembunyi
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteReview(r.id)}
                        className="p-1.5 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer"
                        title="Hapus Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 1: PESANAN & SPREADSHEET */}
        {activeTab === 'pesanan' && (
          <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
                  Total Pesanan
                </div>
                <div className="text-2xl font-extrabold text-[#3D1259] dark:text-amber-400 font-baloo">
                  {totalOrders}
                </div>
              </div>

              <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
                  Pending
                </div>
                <div className="text-2xl font-extrabold text-amber-500 font-baloo">
                  {pendingOrders}
                </div>
              </div>

              <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
                  Terkirim / Diproses
                </div>
                <div className="text-2xl font-extrabold text-emerald-500 font-baloo">
                  {sentOrders}
                </div>
              </div>

              <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
                  Total Pendapatan (Omzet)
                </div>
                <div className="text-xl font-extrabold text-purple-700 dark:text-amber-300 font-baloo">
                  {formatRupiah(totalRevenue)}
                </div>
              </div>
            </div>

            {/* Toolbar Filters & Actions */}
            <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto flex-1">
                  {/* Search Input */}
                  <div className="relative flex-1 sm:w-56 min-w-[180px]">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Cari nama, ID, telp, kasir..."
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>

                  {/* Filter Outlet */}
                  <select
                    value={filterOutlet}
                    onChange={(e) => {
                      setFilterOutlet(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-semibold"
                  >
                    <option value="ALL">📍 Semua Outlet</option>
                    {availableOutlets.map((out) => (
                      <option key={out} value={out}>
                        {out}
                      </option>
                    ))}
                  </select>

                  {/* Filter Tipe Layanan */}
                  <select
                    value={filterServiceType}
                    onChange={(e) => {
                      setFilterServiceType(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-semibold"
                  >
                    <option value="ALL">🍽️ Semua Tipe Layanan</option>
                    {availableServiceTypes.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>

                  {/* Filter Metode Pembayaran */}
                  <select
                    value={filterPaymentMethod}
                    onChange={(e) => {
                      setFilterPaymentMethod(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-semibold"
                  >
                    <option value="ALL">💳 Semua Pembayaran</option>
                    {availablePaymentMethods.map((pm) => (
                      <option key={pm} value={pm}>
                        {pm}
                      </option>
                    ))}
                  </select>

                  {/* Filter Status */}
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-semibold"
                  >
                    <option value="ALL">📌 Semua Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Terkirim/Diproses">Terkirim/Diproses</option>
                    <option value="Selesai">Selesai</option>
                  </select>

                  {/* Filter Tanggal */}
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => {
                      setFilterDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                  />

                  {/* Filter Jumlah Tampilan (Entries per Page) */}
                  <select
                    value={entriesPerPage}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEntriesPerPage(val === 'ALL' ? 'ALL' : Number(val));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 text-xs rounded-xl border border-amber-300 dark:border-purple-700 bg-amber-50 dark:bg-purple-900/60 text-purple-950 dark:text-amber-300 font-extrabold"
                  >
                    <option value={10}>🔢 10 Data / Hal</option>
                    <option value={25}>🔢 25 Data / Hal</option>
                    <option value={50}>🔢 50 Data / Hal</option>
                    <option value={100}>🔢 100 Data / Hal</option>
                    <option value="ALL">🔢 Tampilkan Semua</option>
                  </select>
                </div>

                {/* Toolbar Export & Sync Buttons */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
                  <button
                    onClick={loadAllData}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-purple-950 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 border border-slate-200 dark:border-purple-800 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                  </button>

                  <button
                    onClick={() => syncFromSheets(false)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-xs cursor-pointer"
                  >
                    <CloudDownload className="w-3.5 h-3.5 text-purple-950" /> Sync Sheet
                  </button>

                  {/* Ekspor Excel (Warna Hijau) */}
                  <button
                    onClick={handleDownloadExcel}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700 shadow-xs cursor-pointer transition-all"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-white" /> Ekspor Excel
                  </button>

                  {/* Cetak PDF (Warna Merah) */}
                  <button
                    onClick={handleDownloadPdf}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 text-white font-extrabold text-xs hover:bg-rose-700 shadow-xs cursor-pointer transition-all"
                  >
                    <FileText className="w-3.5 h-3.5 text-white" /> Cetak PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-[#1f0e30] rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-purple-900/50 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-400 font-baloo">
                  Daftar Pesanan Masuk (Pusat Data Spreadsheet)
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span>
                    Menampilkan {paginatedOrders.length} dari {totalFilteredCount} pesanan terfilter (Total: {totalOrders})
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-purple-950/80 text-slate-700 dark:text-amber-300 font-bold border-b border-slate-200 dark:border-purple-900">
                      <th className="p-3">ID / Tanggal</th>
                      <th className="p-3">Pelanggan & Outlet</th>
                      <th className="p-3">Nama Kasir</th>
                      <th className="p-3">Metode</th>
                      <th className="p-3">Rincian Item</th>
                      <th className="p-3">Total Tagihan</th>
                      <th className="p-3">Laba Bersih</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-center">Cetak Struk & Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-purple-900/30">
                    {paginatedOrders.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-400">
                          Tidak ada data pesanan yang sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      paginatedOrders.map((o, idx) => (
                        <tr key={`${o.id}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-purple-950/40">
                          <td className="p-3 align-top whitespace-nowrap">
                            <span className="font-extrabold text-[#3D1259] dark:text-amber-400 block">
                              {o.id}
                            </span>
                            <span className="text-[10px] text-slate-500 block">{o.date}</span>
                            {o.createdTime && (
                              <span className="text-[10px] text-slate-400 block font-mono">⏰ {o.createdTime}</span>
                            )}
                          </td>

                          <td className="p-3 align-top min-w-[140px]">
                            <span className="font-bold text-slate-900 dark:text-slate-100 block">
                              {o.customerName}
                            </span>
                            <span className="text-[11px] text-slate-500 block">📞 {o.phone}</span>
                            <div className="mt-1 flex flex-col gap-0.5">
                              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                {o.outlet}
                              </span>
                              <span className="text-[9px] inline-block px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-amber-300 font-bold w-max">
                                {o.serviceType}
                              </span>
                            </div>
                          </td>

                          <td className="p-3 align-top whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-amber-300 font-extrabold text-xs border border-purple-200 dark:border-purple-800/60">
                              <User className="w-3.5 h-3.5 text-purple-700 dark:text-amber-400 shrink-0" />
                              {o.cashierName || 'Kasir POS'}
                            </span>
                          </td>

                          <td className="p-3 align-top whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-purple-950/80 text-amber-900 dark:text-amber-300 font-extrabold text-xs border border-amber-200 dark:border-purple-800">
                              <CreditCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                              {o.paymentMethod || 'Cash'}
                            </span>
                          </td>

                          <td className="p-3 align-top max-w-xs">
                            <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                              {o.itemsSummary || (typeof o.items === 'string' ? o.items : '-')}
                            </p>
                          </td>

                          <td className="p-3 align-top whitespace-nowrap">
                            <span className="font-extrabold text-amber-600 dark:text-amber-400 text-xs block">
                              {formatRupiah(o.total || o.totalPrice || 0)}
                            </span>
                          </td>

                          <td className="p-3 align-top whitespace-nowrap">
                            {(() => {
                              const totalVal = o.total || o.totalPrice || 0;
                              const netProf = o.netProfit !== undefined
                                ? o.netProfit
                                : o.cogsTotal !== undefined
                                  ? Math.max(0, totalVal - o.cogsTotal)
                                  : Math.round(totalVal * 0.55);
                              return (
                                <div>
                                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs block">
                                    {formatRupiah(netProf)}
                                  </span>
                                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium block">
                                    {o.netProfit !== undefined ? 'Laba Bersih' : 'Est. Margin ~55%'}
                                  </span>
                                </div>
                              );
                            })()}
                          </td>

                          <td className="p-3 align-top whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                o.status === 'Pending'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>

                          <td className="p-3 align-top text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Cetak Struk PDF (Warna Merah) */}
                              <button
                                onClick={() => handleDownloadSingleOrderPdf(o)}
                                className="p-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-xs inline-flex items-center justify-center cursor-pointer transition-all"
                                title="Cetak / Unduh Struk PDF"
                              >
                                <FileText className="w-4 h-4" />
                              </button>

                              {/* Print Struk Thermal */}
                              <button
                                onClick={() => {
                                  const ordItem: OrderItem = {
                                    id: o.id,
                                    customerName: o.customerName || 'Pelanggan',
                                    phone: o.phone || '08123456789',
                                    outlet: o.outlet || 'Steak 11 Outlet',
                                    items: Array.isArray(o.items) ? o.items : [],
                                    itemsSummary: o.itemsSummary || (typeof o.items === 'string' ? o.items : '-'),
                                    total: o.total || o.totalPrice || 0,
                                    totalPrice: o.total || o.totalPrice || 0,
                                    status: o.status === 'Pending' ? 'Perlu Diproses' : 'Selesai',
                                    createdAt: o.date || o.createdAt,
                                    date: o.date,
                                    createdTime: o.createdTime,
                                    serviceType: (o.serviceType as any) || 'Dine In',
                                    addressOrNotes: o.addressOrNotes || 'Order via System',
                                    paymentMethod: o.paymentMethod || 'Cash',
                                    cashierName: o.cashierName || 'Kasir POS',
                                    subtotal: o.subtotal || o.total || o.totalPrice || 0,
                                    discountAmount: o.discountAmount || 0,
                                    taxAmount: o.taxAmount || 0,
                                    deliveryFee: 0,
                                    cashPaid: o.cashPaid,
                                    changeAmount: o.changeAmount,
                                  };
                                  setReceiptOrder(ordItem);
                                  setShowReceiptModal(true);
                                }}
                                className="p-2 rounded-xl bg-amber-400 text-purple-950 font-black hover:bg-amber-300 shadow-xs inline-flex items-center justify-center cursor-pointer transition-all"
                                title="Print Struk Thermal Bluetooth (58/80mm)"
                              >
                                <Printer className="w-4 h-4" />
                              </button>

                              {/* WhatsApp */}
                              <button
                                onClick={() => handleSendViaWhatsApp(o.id)}
                                className="p-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-xs inline-flex items-center justify-center cursor-pointer transition-all"
                                title="Kirim Struk via WhatsApp"
                              >
                                <Send className="w-4 h-4" />
                              </button>

                              {/* Edit Order Button */}
                              <button
                                onClick={() => handleOpenEditOrder(o)}
                                className="p-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-purple-950 font-black shadow-xs inline-flex items-center justify-center cursor-pointer transition-all border border-amber-400"
                                title="Edit Rincian Pesanan"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              {/* Delete Order Button */}
                              <button
                                onClick={() => handleDeleteOrder(o.id)}
                                className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs inline-flex items-center justify-center cursor-pointer transition-all"
                                title="Hapus Pesanan Ini"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {entriesPerPage !== 'ALL' && totalPages > 1 && (
                <div className="px-6 py-3.5 bg-slate-50 dark:bg-purple-950/60 border-t border-slate-200 dark:border-purple-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    Halaman <strong className="font-extrabold text-[#3D1259] dark:text-amber-400">{currentPage}</strong> dari{' '}
                    <strong className="font-extrabold">{totalPages}</strong> ({totalFilteredCount} total data)
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-purple-900 border border-slate-200 dark:border-purple-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-purple-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      ← Sebelumnya
                    </button>

                    <div className="flex items-center gap-1 max-w-[200px] overflow-x-auto px-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                        <button
                          key={pg}
                          onClick={() => setCurrentPage(pg)}
                          className={`w-7 h-7 rounded-lg text-xs font-black cursor-pointer transition-all ${
                            currentPage === pg
                              ? 'bg-amber-400 text-purple-950 shadow-xs'
                              : 'bg-slate-100 dark:bg-purple-950 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {pg}
                        </button>
                      ))}
                    </div>

                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-purple-900 border border-slate-200 dark:border-purple-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-purple-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Selanjutnya →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: KELOLA MENU & PRODUK */}
        {activeTab === 'menu' && (() => {
          const safeMenuItems = menuItems || [];
          const filteredMenuItems = safeMenuItems.filter((item) => {
            const matchesSearch =
              (item.name || '').toLowerCase().includes(menuSearchTerm.toLowerCase()) ||
              (item.description && item.description.toLowerCase().includes(menuSearchTerm.toLowerCase())) ||
              (item.koreanName && item.koreanName.toLowerCase().includes(menuSearchTerm.toLowerCase()));
            const matchesCategory =
              menuCategoryFilter === 'ALL' ||
              item.category === menuCategoryFilter ||
              (menuCategories.find((c) => c.id === menuCategoryFilter)?.name === item.category) ||
              (menuCategories.find((c) => c.id === menuCategoryFilter)?.name.toLowerCase() === (item.category || '').toLowerCase());
            return matchesSearch && matchesCategory;
          });

          const totalSignature = safeMenuItems.filter((m) => m.category === 'signature').length;
          const totalAddon = safeMenuItems.filter((m) => m.category === 'addon').length;
          const totalPopular = safeMenuItems.filter((m) => m.isPopular).length;

          return (
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
                    className="px-3.5 py-2.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-amber-300 font-extrabold text-xs hover:bg-purple-200 border border-purple-300 dark:border-purple-800 flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Folder className="w-4 h-4" /> Pengaturan Kategori
                  </button>

                  <button
                    onClick={handleOpenAddMenu}
                    className="px-4 py-2.5 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4 text-purple-950" /> Tambah Menu Baru
                  </button>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Menu</span>
                    <Utensils className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{(menuItems || []).length} <span className="text-xs font-medium text-slate-500">item</span></p>
                </div>

                <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Signature Steak</span>
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-amber-400" />
                  </div>
                  <p className="text-2xl font-black text-purple-700 dark:text-amber-400">{totalSignature} <span className="text-xs font-medium text-slate-500">item</span></p>
                </div>

                <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Add On & Sides</span>
                    <Tag className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{totalAddon} <span className="text-xs font-medium text-slate-500">item</span></p>
                </div>

                <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Best Seller</span>
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{totalPopular} <span className="text-xs font-medium text-slate-500">item</span></p>
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
                      <div className="p-3 bg-slate-50 dark:bg-purple-950/40 border-t border-slate-100 dark:border-purple-900/40 flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditMenu(item)}
                          className="px-3 py-1.5 rounded-xl bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/80 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMenu(item.id)}
                          className="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 dark:bg-red-950/80 dark:hover:bg-red-900 text-red-700 dark:text-red-300 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 3: PENGATURAN RACIK STEAK */}
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
                <button
                  onClick={() => handleOpenAddRacik('chicken')}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Tambah Pilihan Daging
                </button>
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
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-purple-900/40">
                      <button
                        onClick={() => handleEditRacik('chicken', ch)}
                        className="px-2.5 py-1 rounded-lg bg-amber-100 text-purple-950 hover:bg-amber-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRacik('chicken', ch.id)}
                        className="px-2.5 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
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
                <button
                  onClick={() => handleOpenAddRacik('sauce')}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Tambah Saus Signature
                </button>
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
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-purple-900/40">
                      <button
                        onClick={() => handleEditRacik('sauce', s)}
                        className="px-2.5 py-1 rounded-lg bg-amber-100 text-purple-950 hover:bg-amber-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRacik('sauce', s.id)}
                        className="px-2.5 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
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
                <button
                  onClick={() => handleOpenAddRacik('addon')}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Tambah Add On
                </button>
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
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-purple-900/40">
                      <button
                        onClick={() => handleEditRacik('addon', a)}
                        className="px-2.5 py-1 rounded-lg bg-amber-100 text-purple-950 hover:bg-amber-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRacik('addon', a.id)}
                        className="px-2.5 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}





        {/* TAB 4: MANAJEMEN KARYAWAN */}
        {activeTab === 'karyawan' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
              <div>
                <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo">
                  Daftar Karyawan Outlet Steak 11
                </h3>
                <p className="text-xs text-slate-500">
                  Kelola staf, jabatan, outlet penugasan, PIN absensi, serta tarif gaji harian & tunjangan.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={handleRefreshEmployees}
                  disabled={isRefreshingEmployees}
                  className="px-3.5 py-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 font-extrabold text-xs hover:bg-purple-200 dark:hover:bg-purple-800 border border-purple-300 dark:border-purple-700 shadow-md flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors disabled:opacity-50"
                  title="Refresh Data Karyawan dari Cloud Firestore"
                >
                  <RefreshCw className={`w-4 h-4 text-purple-700 dark:text-purple-300 ${isRefreshingEmployees ? 'animate-spin' : ''}`} />
                  {isRefreshingEmployees ? 'Memuat Data...' : 'Refresh Data'}
                </button>

                <button
                  onClick={handleDownloadEmployeeTemplate}
                  className="px-3.5 py-2.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-amber-300 font-extrabold text-xs hover:bg-purple-200 border border-purple-300 dark:border-purple-800 flex items-center gap-1.5 cursor-pointer shrink-0 transition-all"
                  title="Unduh Template Excel untuk Impor Data Karyawan"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-amber-400" /> Download Template
                </button>

                <label className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                  <Upload className="w-4 h-4 text-white" /> Impor Excel / CSV
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleImportEmployees}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={handleExportEmployeesXlsx}
                  className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                  title="Ekspor Seluruh Data Karyawan ke File Excel"
                >
                  <Download className="w-4 h-4 text-white" /> Ekspor Data Excel
                </button>

                <button
                  onClick={handleOpenAddEmp}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <PlusCircle className="w-4 h-4" /> Tambah Karyawan Baru
                </button>
              </div>
            </div>

            {/* Employee Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map((emp, idx) => (
                <div
                  key={`${emp.id}-${idx}`}
                  className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm space-y-4 relative"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-purple-950 dark:bg-purple-900/80 dark:text-amber-300">
                        {emp.id}
                      </span>
                      <div className="mt-1">
                        <select
                          value={emp.role}
                          onChange={(e) => {
                            const newRole = e.target.value;
                            const matchedRole = roleSettings.find(
                              (r) => r.name.trim().toLowerCase() === newRole.trim().toLowerCase()
                            );
                            const newAllowedTabs =
                              matchedRole && matchedRole.allowedTabs && matchedRole.allowedTabs.length > 0
                                ? matchedRole.allowedTabs
                                : emp.allowedTabs;

                            const updated = employees.map((item) =>
                              item.id === emp.id ? { ...item, role: newRole, allowedTabs: newAllowedTabs } : item
                            );
                            setEmployees(updated);
                            saveEmployees(updated);
                            showToast(`Jabatan ${emp.name} berhasil diubah menjadi "${newRole}"!`);
                          }}
                          className="px-2.5 py-1 text-xs font-extrabold rounded-lg border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-amber-600 dark:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer w-full"
                        >
                          {roleSettings.map((r) => (
                            <option key={r.id} value={r.name}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        emp.status === 'Aktif'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 border-t border-b border-slate-100 dark:border-purple-900/40 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Username Login:</span>
                      <span className="font-semibold text-purple-900 dark:text-amber-300 font-mono">{emp.username || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Outlet Tugas:</span>
                      <span className="font-semibold">{emp.outlet}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">No. WhatsApp:</span>
                      <span className="font-semibold">{emp.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Gaji Pokok Harian:</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(emp.dailyRate)} / hari
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Rate Lembur / Jam:</span>
                      <span className="font-extrabold text-blue-600 dark:text-blue-400">
                        {formatRupiah(emp.hourlyRate ?? 0)} / jam
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Uang Makan & Transpor:</span>
                      <span className="font-extrabold text-amber-600 dark:text-amber-300">
                        {formatRupiah(emp.dailyAllowance)} / hari
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Tunj. Hadir Tepat Waktu:</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-300">
                        +{formatRupiah(emp.punctualityAllowancePerDay ?? 15000)} / hari
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Denda Telat (&gt;{latePenaltyThresholdMinutes}m):</span>
                      <span className="font-extrabold text-rose-600 dark:text-rose-400">
                        -{formatRupiah(emp.latePenaltyPerDay ?? 15000)} / hari
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold text-purple-700 dark:text-purple-300">Bonus Outlet:</span>
                      <span className="font-extrabold text-purple-700 dark:text-amber-300">
                        +{formatRupiah(emp.outletBonus || 0)} / hari
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Password / PIN:</span>
                      <span className="font-mono font-bold bg-slate-100 dark:bg-purple-950 px-2 py-0.5 rounded text-amber-500">
                        {emp.password || emp.pin}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Hak Akses ({emp.allowedTabs?.length || 0}):</span>
                      <span className="font-semibold text-[10px] text-purple-700 dark:text-amber-300 truncate max-w-[140px]" title={emp.allowedTabs?.join(', ')}>
                        {emp.allowedTabs?.length ? `${emp.allowedTabs.length} Menu Modul` : 'Semua Menu'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleEditEmp(emp)}
                      className="px-3 py-1.5 rounded-lg bg-amber-100 text-purple-950 hover:bg-amber-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEmp(emp.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: REKAP ABSENSI */}
        {activeTab === 'absensi' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo">
                      Laporan Rekap Presensi Digital Shift Karyawan
                    </h3>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Firestore Cloud & Local Synced
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Data kehadiran terintegrasi dengan perhitungan durasi jam kerja, foto watermark (&lt; 1MB), dan ekspor data laporan.
                  </p>
                </div>

                {/* Toolbar Action Buttons: Refresh, XLSX, PDF, Sync Sheet */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                  <button
                    onClick={() => setActiveTab('presensi_kamera')}
                    className="px-3.5 py-2 rounded-xl bg-[#3D1259] dark:bg-amber-400 text-amber-300 dark:text-purple-950 font-black text-xs flex items-center gap-1.5 shadow-md hover:scale-[1.02] transition-all cursor-pointer"
                    title="Buka Menu Presensi Kamera Selfie"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-400 dark:text-purple-950" /> Kamera Selfie Live
                  </button>

                  <button
                    onClick={handleRefreshAttendance}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-purple-900/50 hover:bg-slate-200 dark:hover:bg-purple-900 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Refresh data dari memori"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-500" /> Refresh Data
                  </button>

                  <button
                    onClick={handleDownloadAttendanceXlsx}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    title="Ekspor data .xlsx"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Ekspor Excel
                  </button>

                  <button
                    onClick={handleDownloadAttendancePdf}
                    className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    title="Cetak data PDF"
                  >
                    <FileText className="w-3.5 h-3.5" /> Cetak PDF
                  </button>

                  <button
                    onClick={() => syncAttendanceSheets(false)}
                    className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    title="Sinkronisasi dengan Google Apps Script"
                  >
                    <CloudDownload className="w-3.5 h-3.5 text-purple-950" /> Sync Sheet
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-purple-900/40">
                <input
                  type="text"
                  placeholder="Cari nama karyawan..."
                  value={attSearchTerm}
                  onChange={(e) => setAttSearchTerm(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 min-w-[200px]"
                />

                <select
                  value={attOutletFilter}
                  onChange={(e) => setAttOutletFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-semibold"
                >
                  <option value="ALL">Semua Outlet</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.name}>
                      {l.name}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={attDateFilter}
                  onChange={(e) => setAttDateFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                />

                {attDateFilter && (
                  <button
                    onClick={() => setAttDateFilter('')}
                    className="text-[11px] font-bold text-amber-500 hover:underline cursor-pointer"
                  >
                    Reset Tanggal
                  </button>
                )}
              </div>
            </div>

            {/* DASHBOARD ANALYTICS MODEL (REKAP DATA MODEL DASHBOARD) */}
            {(() => {
              const totalAttShift = filteredAttendance.length;
              const totalAttHours = filteredAttendance.reduce((acc, c) => acc + (c.hoursWorked || 0), 0);
              const totalHadirTepat = filteredAttendance.filter(
                (a) => a.status === 'Hadir' && a.clockInStatus !== 'Terlambat Masuk'
              ).length;
              const totalTerlambat = filteredAttendance.filter(
                (a) => a.status === 'Terlambat' || a.clockInStatus === 'Terlambat Masuk'
              ).length;
              const totalLateMinutes = filteredAttendance.reduce((acc, c) => acc + (c.lateMinutes || 0), 0);
              const totalIzin = filteredAttendance.filter((a) => a.status === 'Izin').length;
              const totalSakit = filteredAttendance.filter((a) => a.status === 'Sakit').length;
              const totalAlpha = filteredAttendance.filter((a) => a.status === 'Alpha').length;
              const totalIzinSakitAlpha = totalIzin + totalSakit + totalAlpha;

              const punctualityRate = totalAttShift > 0
                ? Math.round((totalHadirTepat / totalAttShift) * 100)
                : 0;

              const outletAttStats = locations.map((loc) => {
                const records = filteredAttendance.filter((a) => a.outlet === loc.name);
                const count = records.length;
                const hours = records.reduce((acc, c) => acc + (c.hoursWorked || 0), 0);
                const lateCount = records.filter((a) => a.status === 'Terlambat' || a.clockInStatus === 'Terlambat Masuk').length;
                return { name: loc.name, count, hours, lateCount };
              });

              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-slate-800 dark:text-amber-300 flex items-center gap-2 font-baloo">
                      <Sparkles className="w-4 h-4 text-amber-400" /> Ringkasan Performa & Analytics Presensi
                    </h4>
                    <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-900">
                      {filteredAttendance.length} Shift Terfilter
                    </span>
                  </div>

                  {/* 4 Metric Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Total Presensi */}
                    <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm relative overflow-hidden">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Shift Presensi</span>
                        <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-xl text-purple-600 dark:text-purple-300">
                          <Users className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                        {totalAttShift} <span className="text-xs font-medium text-slate-500">Shift</span>
                      </p>
                      <p className="text-[11px] text-purple-600 dark:text-amber-400 font-semibold mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {totalAttHours.toFixed(1)} Jam Kerja Terakumulasi
                      </p>
                    </div>

                    {/* Card 2: Hadir Tepat Waktu */}
                    <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm relative overflow-hidden">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Hadir Tepat Waktu</span>
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-950 rounded-xl text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {totalHadirTepat} <span className="text-xs font-medium text-slate-500">Shift</span>
                      </p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                        {punctualityRate}% Rate Ketepatan
                      </p>
                    </div>

                    {/* Card 3: Terlambat Masuk */}
                    <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm relative overflow-hidden">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Terlambat Shift</span>
                        <div className="p-2 bg-amber-100 dark:bg-amber-950 rounded-xl text-amber-600 dark:text-amber-400">
                          <Clock className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                        {totalTerlambat} <span className="text-xs font-medium text-slate-500">Shift</span>
                      </p>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
                        Total {totalLateMinutes} menit terlambat
                      </p>
                    </div>

                    {/* Card 4: Izin / Sakit / Alpha */}
                    <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm relative overflow-hidden">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Izin / Sakit / Alpha</span>
                        <div className="p-2 bg-rose-100 dark:bg-rose-950 rounded-xl text-rose-600 dark:text-rose-400">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
                        {totalIzinSakitAlpha} <span className="text-xs font-medium text-slate-500">Presensi</span>
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                        Izin: {totalIzin} | Sakit: {totalSakit} | Alpha: {totalAlpha}
                      </p>
                    </div>
                  </div>

                  {/* Visual Progress Bar & Outlet Analytics Bento */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Visual Status Composition */}
                    <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm space-y-3">
                      <h5 className="font-extrabold text-xs text-slate-800 dark:text-amber-300">
                        Rasio & Komposisi Status Kehadiran Shift
                      </h5>

                      {/* Stacked Progress Bar */}
                      <div className="w-full h-3.5 bg-slate-100 dark:bg-purple-950 rounded-full overflow-hidden flex">
                        {totalAttShift > 0 ? (
                          <>
                            <div
                              style={{ width: `${(totalHadirTepat / totalAttShift) * 100}%` }}
                              className="bg-emerald-500 h-full transition-all"
                              title={`Hadir Tepat: ${totalHadirTepat}`}
                            />
                            <div
                              style={{ width: `${(totalTerlambat / totalAttShift) * 100}%` }}
                              className="bg-amber-500 h-full transition-all"
                              title={`Terlambat: ${totalTerlambat}`}
                            />
                            <div
                              style={{ width: `${(totalIzin / totalAttShift) * 100}%` }}
                              className="bg-blue-500 h-full transition-all"
                              title={`Izin: ${totalIzin}`}
                            />
                            <div
                              style={{ width: `${(totalSakit / totalAttShift) * 100}%` }}
                              className="bg-purple-500 h-full transition-all"
                              title={`Sakit: ${totalSakit}`}
                            />
                            <div
                              style={{ width: `${(totalAlpha / totalAttShift) * 100}%` }}
                              className="bg-rose-500 h-full transition-all"
                              title={`Alpha: ${totalAlpha}`}
                            />
                          </>
                        ) : (
                          <div className="w-full h-full bg-slate-200 dark:bg-purple-900/40" />
                        )}
                      </div>

                      {/* Legend Item Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs">
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-purple-950/40 border border-slate-100 dark:border-purple-900/50">
                          <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                            Hadir Tepat
                          </span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {totalHadirTepat}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-purple-950/40 border border-slate-100 dark:border-purple-900/50">
                          <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                            Terlambat
                          </span>
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            {totalTerlambat}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-purple-950/40 border border-slate-100 dark:border-purple-900/50">
                          <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                            Izin
                          </span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {totalIzin}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-purple-950/40 border border-slate-100 dark:border-purple-900/50">
                          <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                            Sakit
                          </span>
                          <span className="font-bold text-purple-600 dark:text-purple-400">
                            {totalSakit}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-purple-950/40 border border-slate-100 dark:border-purple-900/50">
                          <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                            Alpha
                          </span>
                          <span className="font-bold text-rose-600 dark:text-rose-400">
                            {totalAlpha}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Outlet Shift & Hours Breakdown */}
                    <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm space-y-3">
                      <h5 className="font-extrabold text-xs text-slate-800 dark:text-amber-300">
                        Distribusi Shift & Jam Kerja per Outlet
                      </h5>

                      <div className="space-y-2">
                        {outletAttStats.map((out, idx) => {
                          const pct = totalAttHours > 0 ? Math.round((out.hours / totalAttHours) * 100) : 0;
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-amber-500" /> {out.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-semibold text-slate-500">
                                    {out.count} shift ({out.hours.toFixed(1)} jam)
                                  </span>
                                  {out.lateCount > 0 && (
                                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded">
                                      {out.lateCount} telat
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-purple-950 h-2 rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${pct}%` }}
                                  className="bg-amber-400 h-full rounded-full transition-all"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Attendance Table & Page Size Options */}
            {(() => {
              const pageSizeNum = attPageSize === 'ALL' ? filteredAttendance.length : attPageSize;
              const totalPages = attPageSize === 'ALL' ? 1 : Math.ceil(filteredAttendance.length / (pageSizeNum || 1));
              const safeCurrentPage = Math.min(attCurrentPage, Math.max(1, totalPages));
              const startIndex = attPageSize === 'ALL' ? 0 : (safeCurrentPage - 1) * pageSizeNum;
              const paginatedAttendance = attPageSize === 'ALL' ? filteredAttendance : filteredAttendance.slice(startIndex, startIndex + pageSizeNum);

              return (
                <div className="bg-white dark:bg-[#1f0e30] rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm overflow-hidden space-y-0">
                  {/* Option Bar: Display Points */}
                  <div className="p-4 border-b border-slate-200 dark:border-purple-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-purple-950/40">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Tampilkan Data Absensi:
                      </span>
                      <select
                        value={attPageSize}
                        onChange={(e) => {
                          const val = e.target.value === 'ALL' ? 'ALL' : Number(e.target.value);
                          setAttPageSize(val as any);
                          setAttCurrentPage(1);
                        }}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-purple-900 bg-white dark:bg-purple-950 text-slate-900 dark:text-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
                      >
                        <option value={5}>5 Point / Halaman</option>
                        <option value={10}>10 Point / Halaman</option>
                        <option value={20}>20 Point / Halaman</option>
                        <option value={50}>50 Point / Halaman</option>
                        <option value="ALL">Semua Point ({filteredAttendance.length})</option>
                      </select>
                    </div>

                    <div className="text-xs text-slate-500 font-medium">
                      Menampilkan <span className="font-bold text-slate-800 dark:text-slate-100">{paginatedAttendance.length}</span> dari <span className="font-bold text-slate-800 dark:text-slate-100">{filteredAttendance.length}</span> record absensi
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-purple-950/80 text-slate-700 dark:text-amber-300 font-bold border-b border-slate-200 dark:border-purple-900">
                          <th className="p-4">Tanggal / Karyawan</th>
                          <th className="p-4">Selfie Watermark</th>
                          <th className="p-4">Outlet Jaga</th>
                          <th className="p-4">Jam Masuk (Clock In)</th>
                          <th className="p-4">Jam Pulang (Clock Out)</th>
                          <th className="p-4">Durasi Kerja</th>
                          <th className="p-4">Status & Catatan Shift</th>
                          <th className="p-4 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-purple-900/30">
                        {paginatedAttendance.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-slate-400">
                              Belum ada rekam absensi yang sesuai filter.
                            </td>
                          </tr>
                        ) : (
                          paginatedAttendance.map((rec, idx) => (
                        <tr key={`${rec.id}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-purple-950/40">
                          <td className="p-4 align-top">
                            <span className="font-bold text-slate-900 dark:text-slate-100 block">
                              {rec.employeeName}
                            </span>
                            <span className="text-[10px] text-slate-500">{rec.date} ({rec.employeeId})</span>
                          </td>
                          <td className="p-4 align-top">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Selfie Masuk */}
                              {rec.selfieUrl ? (
                                <div
                                  onClick={() => setEnlargedSelfie(rec.selfieUrl || null)}
                                  className="w-11 h-11 rounded-lg border-2 border-emerald-500 overflow-hidden cursor-pointer hover:scale-105 transition-transform relative group shadow-xs"
                                  title="Foto Selfie Masuk (Klik untuk perbesar)"
                                >
                                  <img src={rec.selfieUrl} alt="Selfie Masuk" className="w-full h-full object-cover" />
                                  <div className="absolute inset-x-0 bottom-0 bg-black/60 text-emerald-300 text-[8px] font-black text-center py-0.5">
                                    MASUK
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[9px] italic text-slate-400 block">Masuk: -</span>
                              )}

                              {/* Selfie Pulang */}
                              {rec.clockOutSelfieUrl ? (
                                <div
                                  onClick={() => setEnlargedSelfie(rec.clockOutSelfieUrl || null)}
                                  className="w-11 h-11 rounded-lg border-2 border-amber-400 overflow-hidden cursor-pointer hover:scale-105 transition-transform relative group shadow-xs"
                                  title="Foto Selfie Pulang (Klik untuk perbesar)"
                                >
                                  <img src={rec.clockOutSelfieUrl} alt="Selfie Pulang" className="w-full h-full object-cover" />
                                  <div className="absolute inset-x-0 bottom-0 bg-black/60 text-amber-300 text-[8px] font-black text-center py-0.5">
                                    PULANG
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[9px] italic text-slate-400 block">Pulang: -</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 align-top font-semibold text-slate-800 dark:text-slate-200">
                            <span className="font-bold block text-purple-900 dark:text-amber-300">{rec.outlet}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight mt-0.5">
                              📍 {rec.locationName || 'GPS Verified'}
                            </span>
                            {rec.latitude && rec.longitude && (
                              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono block mt-0.5">
                                ({rec.latitude}, {rec.longitude})
                              </span>
                            )}
                          </td>
                          <td className="p-4 align-top">
                            <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                              {rec.clockInTime}
                            </div>
                            {rec.clockInStatus === 'Terlambat Masuk' ? (
                              <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                                Terlambat {rec.lateMinutes || 0}m
                              </span>
                            ) : (
                              <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                                Tepat Waktu
                              </span>
                            )}
                          </td>
                          <td className="p-4 align-top">
                            <div className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                              {rec.clockOutTime || 'Masih Bertugas'}
                            </div>
                            {rec.clockOutStatus === 'Pulang Awal' ? (
                              <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
                                Pulang Awal {rec.earlyOutMinutes || 0}m
                              </span>
                            ) : rec.clockOutTime ? (
                              <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300">
                                Pulang Tepat
                              </span>
                            ) : null}
                          </td>
                          <td className="p-4 align-top font-bold text-purple-900 dark:text-amber-300">
                            {rec.hoursWorked || 0} Jam
                          </td>
                          <td className="p-4 align-top">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                rec.status === 'Hadir'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                              }`}
                            >
                              {rec.status}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                              {rec.notes || '-'}
                            </span>
                          </td>
                          <td className="p-4 align-top text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditAttendance(rec)}
                                className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/80 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 transition-colors cursor-pointer"
                                title="Edit Data Absensi"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAttendance(rec.id)}
                                className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-950/80 dark:hover:bg-red-900 text-red-600 dark:text-red-300 transition-colors cursor-pointer"
                                title="Hapus Data Absensi"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Attendance Pagination Footer */}
              {attPageSize !== 'ALL' && totalPages > 1 && (
                <div className="p-4 border-t border-slate-200 dark:border-purple-900/50 flex items-center justify-between bg-slate-50/50 dark:bg-purple-950/40">
                  <span className="text-xs text-slate-500 font-medium">
                    Halaman <span className="font-bold text-slate-800 dark:text-slate-100">{safeCurrentPage}</span> dari <span className="font-bold text-slate-800 dark:text-slate-100">{totalPages}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={safeCurrentPage <= 1}
                      onClick={() => setAttCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-purple-900 bg-white dark:bg-purple-950 font-bold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-purple-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      &larr; SBLM
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAttCurrentPage(i + 1)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            safeCurrentPage === i + 1
                              ? 'bg-amber-400 text-purple-950 font-extrabold shadow-sm'
                              : 'bg-white dark:bg-purple-950 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-purple-900'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={safeCurrentPage >= totalPages}
                      onClick={() => setAttCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-purple-900 bg-white dark:bg-purple-950 font-bold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-purple-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      LNJT &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
              );
            })()}
          </div>
        )}

        {/* TAB 4: FITUR PENGGAJIAN / PAYROLL */}
        {activeTab === 'penggajian' && (
          <div className="space-y-6">
            {/* Header Control & Period Picker */}
            <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-[#3D1259] dark:text-amber-400 font-baloo">
                    Fitur Penggajian & Payroll Karyawan Terintegrasi
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    Auto-Absensi Real-Time
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Kalkulasi otomatis Gaji Bersih (Pokok + Uang Makan + Tunjangan Tepat Waktu + Upah Lembur + Bonus - Potongan Kasbon), rincian slip karyawan, WhatsApp & cetak PDF executive.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-0.5">
                    Periode Bulan:
                  </label>
                  <input
                    type="month"
                    value={payrollPeriod}
                    onChange={(e) => setPayrollPeriod(e.target.value)}
                    className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 shadow-sm"
                  />
                </div>

                <button
                  onClick={() => setShowLoanLedgerModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-900 text-amber-300 dark:bg-purple-950 dark:text-amber-300 font-extrabold text-xs hover:bg-purple-800 border border-purple-700 dark:border-purple-800 shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  title="Kelola & Lihat Riwayat Pinjaman Kasbon Berkelanjutan Karyawan"
                >
                  <Banknote className="w-3.5 h-3.5 text-amber-400" /> Riwayat Kasbon
                </button>

                <button
                  onClick={() => setShowLatePenaltySettingsModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-amber-300 font-extrabold text-xs hover:bg-purple-200 border border-purple-300 dark:border-purple-800 shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  title="Pengaturan Batas Toleransi Menit Keterlambatan Denda"
                >
                  <Sliders className="w-3.5 h-3.5 text-purple-700 dark:text-amber-400" /> Toleransi Telat ({latePenaltyThresholdMinutes}m)
                </button>

                <button
                  onClick={handleCalculatePayroll}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  title="Kalkulasi ulang slip gaji karyawan berdasarkan data absensi terkini"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-950" /> Hitung Ulang
                </button>

                <button
                  onClick={() => syncPayrollSheets(false)}
                  className="px-3.5 py-2 rounded-xl bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-amber-300 font-extrabold text-xs hover:bg-purple-200 border border-purple-300 dark:border-purple-800 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  title="Sinkronisasi slip penggajian langsung ke Google Sheets"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Sync Sheet
                </button>

                <button
                  onClick={handlePrintMonthlyPayrollReport}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 text-white font-extrabold text-xs hover:bg-rose-700 shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  title="Cetak Laporan Rekapitulasi Penggajian Bulanan dalam format PDF"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak PDF
                </button>

                <button
                  onClick={handleDownloadExcelPayroll}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700 shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  title="Ekspor Rekapitulasi Penggajian Bulanan ke file Excel .xlsx"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Ekspor Excel
                </button>
              </div>
            </div>

            {/* DASHBOARD ANALYTICS GAJI (REKAP BENTO CARDS) */}
            {(() => {
              const totalSlips = filteredPayroll.length;
              const totalNetSalary = filteredPayroll.reduce((acc, c) => acc + (c.netSalary || 0), 0);
              const totalAllowance = filteredPayroll.reduce((acc, c) => acc + (c.totalAllowance || 0), 0);
              const totalPunctualityAllowance = filteredPayroll.reduce((acc, c) => acc + (c.punctualityAllowance || 0), 0);
              const totalOutletBonus = filteredPayroll.reduce((acc, c) => acc + (c.outletBonus || 0), 0);
              const totalBonus = filteredPayroll.reduce((acc, c) => acc + (c.bonus || 0), 0);
              const totalDeductions = filteredPayroll.reduce((acc, c) => acc + (c.deductions || 0), 0);

              const countLunas = filteredPayroll.filter((s) => s.paymentStatus === 'Lunas / Terbayar').length;
              const countDisetujui = filteredPayroll.filter((s) => s.paymentStatus === 'Disetujui').length;
              const countDraft = filteredPayroll.filter((s) => s.paymentStatus === 'Draft').length;

              return (
                <div className="space-y-4">
                  {/* Metric Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Total Anggaran Gaji */}
                    <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Anggaran Gaji Bersih</span>
                        <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-xl text-purple-600 dark:text-amber-400">
                          <Users className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-xl font-black text-[#3D1259] dark:text-amber-300">
                        {formatRupiah(totalNetSalary)}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        Untuk {totalSlips} Karyawan Terdaftar
                      </p>
                    </div>

                    {/* Card 2: Status Pembayaran */}
                    <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Status Pembayaran Gaji</span>
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-950 rounded-xl text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                        {countLunas} / {totalSlips} <span className="text-xs font-semibold text-slate-500">Lunas</span>
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        Disetujui: {countDisetujui} | Draft: {countDraft}
                      </p>
                    </div>

                    {/* Card 3: Total Tunjangan & Bonus */}
                    <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Tunjangan & Bonus</span>
                        <div className="p-2 bg-amber-100 dark:bg-amber-950 rounded-xl text-amber-600 dark:text-amber-400">
                          <Sparkles className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-xl font-black text-amber-600 dark:text-amber-400">
                        {formatRupiah(totalAllowance + totalPunctualityAllowance + totalOutletBonus + totalBonus)}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        Makan + Hadir Tepat Waktu + Outlet + Kinerja
                      </p>
                    </div>

                    {/* Card 4: Total Potongan */}
                    <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Potongan & Denda</span>
                        <div className="p-2 bg-rose-100 dark:bg-rose-950 rounded-xl text-rose-600 dark:text-rose-400">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-xl font-black text-rose-600 dark:text-rose-400">
                        {formatRupiah(totalDeductions)}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        Denda Keterlambatan / Kasbon
                      </p>
                    </div>
                  </div>

                  {/* Filter & Batch Actions Bar */}
                  <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
                      {/* Search */}
                      <div className="relative flex-1 max-w-xs">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Cari nama karyawan / ID..."
                          value={payrollSearchTerm}
                          onChange={(e) => setPayrollSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </div>

                      {/* Filter Outlet */}
                      <select
                        value={payrollOutletFilter}
                        onChange={(e) => setPayrollOutletFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
                      >
                        <option value="ALL">Semua Outlet Cabang</option>
                        {locations.map((loc) => (
                          <option key={loc.id} value={loc.name}>
                            {loc.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Batch Actions */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <span className="text-[11px] font-bold text-slate-400 hidden lg:inline">Aksi Massal:</span>
                      <button
                        onClick={() => handleBatchUpdatePayrollStatus('Disetujui')}
                        className="px-3 py-1.5 rounded-xl bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 font-bold text-[11px] hover:bg-blue-200 cursor-pointer"
                      >
                        Setujui Semua
                      </button>
                      <button
                        onClick={() => handleBatchUpdatePayrollStatus('Lunas / Terbayar')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[11px] hover:bg-emerald-200 cursor-pointer"
                      >
                        Tandai Semua Lunas
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Payroll Table */}
            <div className="bg-white dark:bg-[#1f0e30] rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-purple-950/80 text-slate-700 dark:text-amber-300 font-bold border-b border-slate-200 dark:border-purple-900">
                      <th className="p-4">Karyawan & Jabatan</th>
                      <th className="p-4">Kehadiran & Jam Kerja</th>
                      <th className="p-4">Gaji Pokok & Tunjangan</th>
                      <th className="p-4">Bonus & Potongan</th>
                      <th className="p-4">Total Gaji Bersih</th>
                      <th className="p-4">Status Pembayaran</th>
                      <th className="p-4 text-center">Aksi (Edit / PDF / WA)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-purple-900/30">
                    {filteredPayroll.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          Belum ada slip penggajian yang cocok dengan pencarian / periode ini. Klik &quot;Hitung Ulang&quot;.
                        </td>
                      </tr>
                    ) : (
                      filteredPayroll.map((slip, idx) => (
                        <tr key={`${slip.id}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-purple-950/40 transition-colors">
                          <td className="p-4 align-top">
                            <span className="font-extrabold text-[#3D1259] dark:text-amber-400 block text-sm">
                              {slip.employeeName}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {slip.employeeRole} • <span className="font-semibold text-amber-600 dark:text-amber-400">{slip.outlet}</span>
                            </span>
                          </td>
                          <td className="p-4 align-top space-y-0.5">
                            <span className="font-bold text-slate-900 dark:text-slate-100 block">
                              {slip.totalDaysPresent} Hari Hadir
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                              ⏰ Tepat Waktu: {slip.totalDaysOnTime ?? (slip.totalDaysPresent - slip.totalDaysLate)} Hari
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                              ⏱️ {slip.totalHoursWorked} Jam Kerja | Telat: {slip.totalDaysLate} Hari
                            </span>
                          </td>
                          <td className="p-4 align-top space-y-1">
                            <div className="text-slate-800 dark:text-slate-200 font-bold">
                              Pokok: {formatRupiah(slip.baseSalary)}
                            </div>
                            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                              Makan: +{formatRupiah(slip.totalAllowance)}
                            </div>
                            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              Tunj. Tepat Waktu: +{formatRupiah(slip.punctualityAllowance || 0)}
                            </div>
                            {Number(slip.overtimePay || 0) > 0 && (
                              <div className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                                Upah Lembur ({slip.totalOvertimeHours || 0}j): +{formatRupiah(slip.overtimePay || 0)}
                              </div>
                            )}
                          </td>
                          <td className="p-4 align-top space-y-0.5">
                            {Number(slip.outletBonus || 0) > 0 && (
                              <div className="text-purple-700 dark:text-amber-300 font-bold text-xs">
                                🏪 Bonus Outlet: +{formatRupiah(slip.outletBonus || 0)}
                              </div>
                            )}
                            <div className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                              ⭐ Bonus Kinerja: +{formatRupiah(slip.bonus)}
                            </div>
                            <div className="text-rose-600 dark:text-rose-400 font-extrabold text-xs">
                              Potongan: -{formatRupiah(slip.deductions)}
                            </div>
                            {(() => {
                              const emp = employees.find((e) => e.id === slip.employeeId);
                              const lateRate = emp?.latePenaltyPerDay ?? latePenaltyRate ?? 15000;
                              const empAtt = (attendance || []).filter(
                                (a) => (a.employeeId === slip.employeeId || (slip.employeeName && (a.employeeName || '').toLowerCase() === slip.employeeName.toLowerCase())) && a.date.startsWith(slip.periodMonth)
                              );
                              const daysPenalized = empAtt.length > 0
                                ? empAtt.filter((a) => (a.lateMinutes && a.lateMinutes > latePenaltyThresholdMinutes)).length
                                : (lateRate > 0 && slip.deductions >= lateRate ? Math.min(slip.totalDaysLate, Math.floor(slip.deductions / lateRate)) : 0);
                              const latePenaltyVal = daysPenalized * lateRate;
                              const empLoan = employeeLoans.find((l) => l.employeeId === slip.employeeId && l.status === 'ACTIVE' && l.remainingAmount > 0);
                              const loanVal = empLoan ? Math.min(empLoan.monthlyInstallment, empLoan.remainingAmount) : 0;

                              return (
                                <div className="space-y-0.5 mt-1">
                                  {latePenaltyVal > 0 && (
                                    <span className="block text-[9px] font-extrabold text-rose-600 dark:text-rose-400">
                                      🛑 Denda Telat &gt;{latePenaltyThresholdMinutes}m ({daysPenalized}x): -{formatRupiah(latePenaltyVal)}
                                    </span>
                                  )}
                                  {loanVal > 0 && (
                                    <span className="block text-[9px] font-extrabold text-purple-700 dark:text-amber-300">
                                      💸 Kasbon: -{formatRupiah(loanVal)}
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </td>
                          <td className="p-4 align-top font-black text-sm text-purple-900 dark:text-amber-300">
                            {formatRupiah(slip.netSalary)}
                          </td>
                          <td className="p-4 align-top">
                            <select
                              value={slip.paymentStatus}
                              onChange={(e) =>
                                handleUpdatePayrollStatus(slip.id, e.target.value as any)
                              }
                              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold border cursor-pointer ${
                                slip.paymentStatus === 'Lunas / Terbayar'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                                  : slip.paymentStatus === 'Disetujui'
                                  ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
                                  : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                              }`}
                            >
                              <option value="Draft">Draft</option>
                              <option value="Disetujui">Disetujui</option>
                              <option value="Lunas / Terbayar">Lunas / Terbayar</option>
                            </select>
                          </td>
                          <td className="p-4 align-top text-center space-x-1.5">
                            <button
                              onClick={() => handleOpenEditPayroll(slip)}
                              title="Edit Bonus & Potongan"
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-purple-950 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-purple-900 cursor-pointer inline-flex items-center gap-1 text-[11px] font-semibold"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => handlePrintPayrollPdf(slip)}
                              title="Download Slip Gaji PDF"
                              className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 cursor-pointer inline-flex items-center gap-1 text-[11px] font-semibold"
                            >
                              <Printer className="w-3.5 h-3.5" /> PDF
                            </button>
                            <button
                              onClick={() => handleSendPayrollWhatsApp(slip)}
                              title="Kirim Slip Gaji via WhatsApp"
                              className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer inline-flex items-center gap-1 text-[11px] font-semibold"
                            >
                              <Send className="w-3.5 h-3.5" /> WA
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB JADWAL SHIFT KERJA (ROSTER SHIFT) */}
        {activeTab === 'jadwal' && (
          <div className="space-y-6">
            {/* Header Control Bar */}
            <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-black text-[#3D1259] dark:text-amber-400 font-baloo">
                    Jadwal Shift Kerja & Roster Karyawan
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-amber-300 border border-purple-300 dark:border-purple-800">
                    Terintegrasi Absensi & Payroll
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Atur & pantau penugasan shift kerja harian per karyawan. Terkoneksi otomatis dengan presensi selfie (keterlambatan) & penggajian (upah lembur).
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-0.5">
                    Periode Roster:
                  </label>
                  <input
                    type="month"
                    value={schedulePeriod}
                    onChange={(e) => setSchedulePeriod(e.target.value)}
                    className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 shadow-sm"
                  />
                </div>

                <select
                  value={scheduleOutletFilter}
                  onChange={(e) => setScheduleOutletFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 shadow-sm mt-3"
                >
                  <option value="ALL">Semua Outlet Cabang</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setShowGenerateScheduleModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md flex items-center gap-1.5 cursor-pointer mt-3 transition-all active:scale-95"
                  title="Pilih model & generate jadwal shift roster otomatis 1 bulan penuh"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Generate Otomatis
                </button>

                <button
                  onClick={() => setShowShiftTemplateModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-amber-300 font-extrabold text-xs hover:bg-purple-200 border border-purple-300 dark:border-purple-800 flex items-center gap-1.5 cursor-pointer mt-3 transition-all active:scale-95"
                >
                  <Sliders className="w-3.5 h-3.5" /> Master Shift
                </button>

                <button
                  onClick={() => handleOpenAssignSchedule()}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700 shadow-md flex items-center gap-1.5 cursor-pointer mt-3 transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Shift
                </button>

                <button
                  onClick={handleDownloadExcelScheduleRoster}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-purple-950 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 border border-slate-200 dark:border-purple-800 flex items-center gap-1.5 cursor-pointer mt-3"
                  title="Ekspor Roster Shift ke Excel Profesional"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Ekspor Excel
                </button>

                <button
                  onClick={handleDownloadExcelImportScheduleTemplate}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-purple-950 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 border border-slate-200 dark:border-purple-800 flex items-center gap-1.5 cursor-pointer mt-3"
                  title="Unduh Format Template Excel Roster Shift untuk Diimpor"
                >
                  <Download className="w-3.5 h-3.5 text-blue-500" /> Template Impor
                </button>

                <label
                  className="px-3 py-2 rounded-xl bg-blue-600 text-white font-extrabold text-xs hover:bg-blue-700 shadow-md flex items-center gap-1.5 cursor-pointer mt-3 transition-all active:scale-95"
                  title="Unggah & Impor Roster Shift dari File Excel (.xlsx)"
                >
                  <Upload className="w-3.5 h-3.5" /> Impor Excel
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleImportScheduleExcel}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Bento Metric Cards */}
            {(() => {
              const targetEmps = scheduleOutletFilter === 'ALL' ? employees : employees.filter((e) => e.outlet === scheduleOutletFilter);
              const targetEmpIds = new Set(targetEmps.map((e) => e.id));
              const monthSchedules = schedules.filter(
                (s) => s.date.startsWith(schedulePeriod) && targetEmpIds.has(s.employeeId)
              );

              const countOff = monthSchedules.filter((s) => {
                const matchedTpl = shiftTemplates.find((t) => t.id === s.shiftId || t.name.trim().toLowerCase() === s.shiftName.trim().toLowerCase());
                return s.isOff || matchedTpl?.isOff || s.shiftName.toLowerCase().includes('off') || s.shiftName.toLowerCase().includes('libur');
              }).length;

              const countWorking = monthSchedules.length - countOff;

              const shiftCounts = shiftTemplates.map((tpl) => {
                const count = monthSchedules.filter((s) => s.shiftId === tpl.id || s.shiftName.trim().toLowerCase() === tpl.name.trim().toLowerCase()).length;
                return { ...tpl, count };
              });
              const topWorkingShift = shiftCounts.filter((t) => !t.isOff).sort((a, b) => b.count - a.count)[0];

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-500 dark:text-slate-400">Total Shift Terjadwal</span>
                      <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-xl text-purple-600 dark:text-amber-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-xl font-black text-[#3D1259] dark:text-amber-300">
                      {monthSchedules.length} <span className="text-xs font-semibold text-slate-500">Penugasan</span>
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Untuk {targetEmps.length} Karyawan Aktif
                    </p>
                  </div>

                  <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-500 dark:text-slate-400">Shift Bekerja (Aktif)</span>
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-950 rounded-xl text-emerald-600 dark:text-emerald-400">
                        <Clock className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                      {countWorking} <span className="text-xs font-semibold text-slate-400">Hari Kerja</span>
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Tercatat dalam Operasional Outlets
                    </p>
                  </div>

                  <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-500 dark:text-slate-400">Hari Libur / OFF</span>
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
                        <UserCheck className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-xl font-black text-slate-700 dark:text-slate-300">
                      {countOff} <span className="text-xs font-semibold text-slate-500">Hari Libur</span>
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Rotasi Libur Rutin Karyawan
                    </p>
                  </div>

                  <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-500 dark:text-slate-400">Shift Kerja Dominan</span>
                      <div className="p-2 bg-amber-100 dark:bg-amber-950 rounded-xl text-amber-600 dark:text-amber-400">
                        <Flame className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-xl font-black text-amber-600 dark:text-amber-400 truncate">
                      {topWorkingShift ? `${topWorkingShift.name}` : '-'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {topWorkingShift ? `${topWorkingShift.count} Penugasan Roster` : 'Belum ada data'}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Shift Templates Legend Pill */}
            <div className="flex items-center gap-3 flex-wrap p-3.5 bg-white dark:bg-[#1f0e30] rounded-2xl border border-slate-200 dark:border-purple-900/50 text-xs">
              <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-500" /> Master Shift Available:
              </span>
              {shiftTemplates.map((tpl) => (
                <div key={tpl.id} className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 dark:bg-purple-950/80 border border-slate-200 dark:border-purple-800">
                  <span className={`w-3 h-3 rounded-full shrink-0 ${
                    tpl.color === 'emerald' ? 'bg-emerald-500' :
                    tpl.color === 'blue' ? 'bg-blue-500' :
                    tpl.color === 'purple' ? 'bg-purple-500' :
                    tpl.color === 'amber' ? 'bg-amber-500' :
                    tpl.color === 'rose' ? 'bg-rose-500' :
                    tpl.color === 'orange' ? 'bg-orange-500' :
                    tpl.color === 'teal' ? 'bg-teal-500' : 'bg-slate-400'
                  }`} />
                  <span className="font-bold text-slate-800 dark:text-slate-200">{tpl.name}</span>
                  <span className="text-[10px] text-slate-400">({tpl.isOff ? 'OFF' : `${tpl.startTime} - ${tpl.endTime}`})</span>
                </div>
              ))}
            </div>

            {/* Monthly Schedule Roster Grid Table */}
            <div className="bg-white dark:bg-[#1f0e30] rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-purple-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span className="font-extrabold text-sm text-[#3D1259] dark:text-amber-400 font-baloo">
                    Matriks Roster Shift Kerja Bulan {schedulePeriod}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 italic hidden sm:inline">
                  💡 Klik sel tanggal pada baris karyawan untuk mengubah shift secara langsung.
                </span>
              </div>

              {(() => {
                const targetEmps = scheduleOutletFilter === 'ALL' ? employees : employees.filter((e) => e.outlet === scheduleOutletFilter);
                const [yearStr, monthStr] = schedulePeriod.split('-');
                const year = parseInt(yearStr, 10);
                const month = parseInt(monthStr, 10);
                const daysInMonth = new Date(year, month, 0).getDate();
                const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-purple-950/80 text-slate-700 dark:text-amber-300 font-bold border-b border-slate-200 dark:border-purple-900 text-[11px]">
                          <th className="p-3 min-w-[220px] sticky left-0 bg-slate-50 dark:bg-purple-950 z-10">Karyawan & Status Roster</th>
                          {daysArray.map((dayNum) => {
                            const dateStr = `${yearStr}-${monthStr.padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                            const dayOfWeekStr = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][new Date(year, month - 1, dayNum).getDay()];
                            const isWeekend = dayOfWeekStr === 'Min' || dayOfWeekStr === 'Sab';

                            return (
                              <th key={dayNum} className={`p-2 text-center min-w-[45px] border-l border-slate-100 dark:border-purple-900/40 ${isWeekend ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : ''}`}>
                                <div>{dayNum}</div>
                                <div className="text-[9px] text-slate-400 font-normal">{dayOfWeekStr}</div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-purple-900/30">
                        {targetEmps.length === 0 ? (
                          <tr>
                            <td colSpan={daysInMonth + 1} className="p-8 text-center text-slate-400">
                              Belum ada karyawan terdaftar pada outlet ini.
                            </td>
                          </tr>
                        ) : (
                          targetEmps.map((emp) => {
                            const isOffRoster = Boolean(emp.isScheduleOff || emp.status === 'Non-Aktif');
                            return (
                              <tr key={emp.id} className={`hover:bg-slate-50 dark:hover:bg-purple-950/40 transition-colors ${isOffRoster ? 'opacity-75 bg-rose-50/20 dark:bg-rose-950/10' : ''}`}>
                                <td className="p-2.5 sticky left-0 bg-white dark:bg-[#1f0e30] z-10 border-r border-slate-100 dark:border-purple-900/40">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                      <span className="font-extrabold text-[#3D1259] dark:text-amber-400 block truncate text-xs">
                                        {emp.name}
                                      </span>
                                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                                        {emp.role} • <strong className="text-amber-600">{emp.outlet}</strong>
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleEmployeeRoster(emp.id);
                                      }}
                                      className={`px-2 py-1 rounded-lg text-[10px] font-black cursor-pointer border transition-all shrink-0 flex items-center gap-1 shadow-2xs ${
                                        emp.isScheduleOff
                                          ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800 hover:bg-rose-200'
                                          : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-200'
                                      }`}
                                      title={emp.isScheduleOff ? 'Karyawan di-OFF-kan dari Roster. Klik untuk mengaktifkan kembali.' : 'Karyawan Aktif Roster. Klik untuk men-OFF-kan dari roster.'}
                                    >
                                      {emp.isScheduleOff ? '🔴 OFF' : '🟢 ON'}
                                    </button>
                                  </div>
                                </td>

                              {daysArray.map((dayNum) => {
                                const dateStr = `${yearStr}-${monthStr.padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                                const sch = schedules.find((s) => s.employeeId === emp.id && s.date === dateStr);

                                let colorBg = 'bg-slate-100 dark:bg-purple-950/40 text-slate-400 border-slate-200';
                                if (sch) {
                                  const matchedTpl = shiftTemplates.find((t) => t.id === sch.shiftId || t.name.trim().toLowerCase() === sch.shiftName.trim().toLowerCase());
                                  const isOff = Boolean(sch.isOff || matchedTpl?.isOff);
                                  const colorName = matchedTpl?.color || (sch as any).color || (isOff ? 'slate' : 'emerald');
                                  colorBg = getShiftBadgeStyle(colorName, isOff);
                                }

                                return (
                                  <td
                                    key={dayNum}
                                    onClick={() => handleOpenAssignSchedule(emp.id, dateStr)}
                                    className="p-1 text-center border-l border-slate-100 dark:border-purple-900/40 cursor-pointer hover:scale-105 transition-all"
                                    title={sch ? `${sch.employeeName}: ${sch.shiftName} (${sch.startTime}-${sch.endTime})` : `Klik untuk atur shift ${emp.name}`}
                                  >
                                    <div className={`p-1 rounded-lg border font-bold text-[9.5px] truncate shadow-2xs ${colorBg}`}>
                                      {sch ? (sch.isOff ? 'OFF' : sch.shiftName.replace('Shift ', '')) : '+ Atur'}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })
                      )}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB 5: KELOLA OUTLET & ATURAN SHIFT */}
        {activeTab === 'outlets' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
              <div>
                <h3 className="font-extrabold text-lg font-baloo text-[#3D1259] dark:text-amber-400 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-500" /> Kelola Outlet & Aturan Shift
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Atur lokasi cabang, alamat, kontak, jam operasional, serta batas jam masuk/pulang shift karyawan untuk perhitungan keterlambatan.
                </p>
              </div>

              <button
                onClick={handleOpenAddOutlet}
                className="px-4 py-2.5 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Tambah Outlet Baru
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.map((loc) => (
                <div
                  key={loc.id}
                  className="bg-white dark:bg-[#1f0e30] rounded-2xl p-5 border-2 border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-900 dark:text-amber-300 text-[10px] font-extrabold border border-purple-300 dark:border-purple-800">
                        {loc.city}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 font-mono">
                        ID: {loc.id}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-lg text-[#3D1259] dark:text-amber-400 font-baloo">
                        {loc.name}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5 mt-1">
                        <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span>{loc.address}</span>
                      </p>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-purple-900/40">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-purple-400" /> Jam Buka Outlet:
                        </span>
                        <span className="font-bold">{loc.hours}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px] flex items-center gap-1">
                          <PhoneCall className="w-3.5 h-3.5 text-emerald-400" /> Kontak Outlet:
                        </span>
                        <span className="font-mono font-bold">{loc.phone}</span>
                      </div>
                    </div>

                    {/* Aturan Shift Box */}
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-purple-950/60 border border-amber-200/80 dark:border-purple-800/80 space-y-2">
                      <div className="text-[11px] font-extrabold text-[#3D1259] dark:text-amber-300 flex items-center gap-1.5 border-b border-amber-200 dark:border-purple-800 pb-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" /> Aturan Shift Workhouse:
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white dark:bg-[#12071B] p-2 rounded-lg border border-amber-200/60 dark:border-purple-900">
                          <span className="text-[10px] text-slate-400 block">Batas Masuk:</span>
                          <strong className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                            {loc.startWorkTime || '15:00'} WIB
                          </strong>
                        </div>
                        <div className="bg-white dark:bg-[#12071B] p-2 rounded-lg border border-amber-200/60 dark:border-purple-900">
                          <span className="text-[10px] text-slate-400 block">Batas Pulang:</span>
                          <strong className="font-mono font-extrabold text-rose-600 dark:text-rose-400">
                            {loc.endWorkTime || '22:00'} WIB
                          </strong>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                        Karyawan absen lewat dari jam masuk dihitung Keterlambatan.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-purple-900/40 flex items-center gap-2">
                    <button
                      onClick={() => handleEditOutlet(loc)}
                      className="flex-1 py-2 rounded-xl bg-purple-900/30 text-amber-300 hover:bg-purple-900/60 font-extrabold text-xs flex items-center justify-center gap-1 cursor-pointer border border-purple-700/50"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit Outlet & Shift
                    </button>
                    <button
                      onClick={() => handleDeleteOutlet(loc.id)}
                      className="p-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 hover:bg-red-200 font-bold text-xs cursor-pointer border border-red-300 dark:border-red-800"
                      title="Hapus Outlet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: MANAJEMEN DATA ADMIN SYSTEM & ROLE */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            {/* Header Control & Sub-tab Switcher */}
            <div className="bg-white dark:bg-[#1f0e30] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-500" /> Admin System & Pengaturan Role / Jabatan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Kelola pengeditan ID & Akun Admin System, serta atur Master Role / Jabatan beserta hak akses menu untuk Admin dan Karyawan.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {adminActiveSubTab === 'accounts' ? (
                  <button
                    onClick={handleOpenAddAdmin}
                    className="px-4 py-2.5 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Tambah Admin Baru
                  </button>
                ) : (
                  <button
                    onClick={handleOpenAddRole}
                    className="px-4 py-2.5 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Tambah Master Role
                  </button>
                )}
              </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-purple-900/50 pb-3">
              <button
                onClick={() => setAdminActiveSubTab('accounts')}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  adminActiveSubTab === 'accounts'
                    ? 'bg-[#3D1259] text-amber-300 shadow-md border border-amber-400/30 font-extrabold'
                    : 'bg-white dark:bg-purple-950/40 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-purple-900/40'
                }`}
              >
                <UserCheck className="w-4 h-4 text-amber-400" />
                1. Akun Admin System & Edit ID ({adminUsers.filter((a) => a.role !== 'Pengunjung' && !a.passwordPin?.includes('Google') && !a.role.toLowerCase().includes('pengunjung')).length})
              </button>
              <button
                onClick={() => setAdminActiveSubTab('roles')}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  adminActiveSubTab === 'roles'
                    ? 'bg-[#3D1259] text-amber-300 shadow-md border border-amber-400/30 font-extrabold'
                    : 'bg-white dark:bg-purple-950/40 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-purple-900/40'
                }`}
              >
                <Crown className="w-4 h-4 text-amber-400" />
                2. Pengaturan Role / Jabatan pada Menu ({(roleSettings || []).length} Role)
              </button>
            </div>

            {/* SUB-TAB 1: AKUN ADMIN SYSTEM */}
            {adminActiveSubTab === 'accounts' && (
              <div className="bg-white dark:bg-[#1f0e30] rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-purple-900/50 flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-700 dark:text-amber-300">
                    Daftar Pengelola System & ID Akun ({adminUsers.filter((a) => a.role !== 'Pengunjung' && !a.passwordPin?.includes('Google') && !a.role.toLowerCase().includes('pengunjung')).length} Terdaftar)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                    💡 Klik &quot;Edit&quot; untuk mengubah ID, Username, PIN, atau Hak Akses Admin.
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-purple-950/80 text-slate-700 dark:text-amber-300 font-bold border-b border-slate-200 dark:border-purple-900">
                        <th className="p-3.5">ID Admin</th>
                        <th className="p-3.5">Username</th>
                        <th className="p-3.5">Nama Lengkap</th>
                        <th className="p-3.5">Role / Jabatan</th>
                        <th className="p-3.5">Hak Akses Menu</th>
                        <th className="p-3.5">Kontak</th>
                        <th className="p-3.5">PIN / Pass</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-purple-900/30">
                      {adminUsers
                        .filter((a) => a.role !== 'Pengunjung' && !a.passwordPin?.includes('Google') && !a.role.toLowerCase().includes('pengunjung'))
                        .map((admin) => (
                        <tr key={admin.id} className="hover:bg-slate-50 dark:hover:bg-purple-950/40">
                          <td className="p-3.5 font-mono font-extrabold text-[#3D1259] dark:text-amber-400">
                            <span className="px-2 py-1 rounded-lg bg-amber-400/15 border border-amber-400/30">
                              {admin.id}
                            </span>
                          </td>
                          <td className="p-3.5 font-bold text-slate-800 dark:text-slate-100">
                            @{admin.username}
                          </td>
                          <td className="p-3.5 font-extrabold text-slate-800 dark:text-slate-100">
                            {admin.fullName}
                          </td>
                          <td className="p-3.5 font-bold">
                            <select
                              value={admin.role}
                              onChange={(e) => {
                                const newRole = e.target.value;
                                const updated = adminUsers.map((item) =>
                                  item.id === admin.id ? { ...item, role: newRole } : item
                                );
                                setAdminUsers(updated);
                                saveAdmins(updated);
                                showToast(`Role Admin ${admin.fullName} berhasil diubah menjadi "${newRole}"!`);
                              }}
                              className="px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-amber-300 text-xs font-extrabold border border-purple-300 dark:border-purple-800 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                            >
                              {roleSettings.map((r) => (
                                <option key={r.id} value={r.name}>
                                  {r.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3.5 font-bold text-slate-700 dark:text-amber-300">
                            <span className="px-2 py-0.5 rounded bg-amber-400/20 text-purple-950 dark:text-amber-300 text-[10px]">
                              {admin.allowedTabs?.length ? `${admin.allowedTabs.length} Menu` : 'Semua Menu'}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-600 dark:text-slate-300">
                            {admin.phone && <div>📞 {admin.phone}</div>}
                            {admin.email && <div>✉️ {admin.email}</div>}
                          </td>
                          <td className="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">
                            {admin.passwordPin === 'Firebase Auth' || admin.passwordPin === '******' ? (
                              <span className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-amber-300 text-[11px] font-extrabold border border-purple-300 dark:border-purple-800 inline-flex items-center gap-1">
                                🔒 Firebase Auth (Terenkripsi)
                              </span>
                            ) : (
                              `•••• (${admin.passwordPin})`
                            )}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                                admin.status === 'Aktif'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              }`}
                            >
                              {admin.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleEditAdmin(admin)}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-400/20 text-purple-950 dark:text-amber-300 font-bold hover:bg-amber-400 hover:text-purple-950 transition-colors cursor-pointer"
                              >
                                Edit ID & Data
                              </button>
                              <button
                                onClick={() => handleDeleteAdmin(admin.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: PENGATURAN ROLE / JABATAN PADA MENU (ADMIN & KARYAWAN) */}
            {adminActiveSubTab === 'roles' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Crown className="w-6 h-6 text-amber-500 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-300">
                        Pengaturan Master Role / Jabatan & Hak Akses Menu
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Atur daftar role resmi untuk Admin System dan Karyawan Outlet. Saat membuat/mengedit akun, memilih role akan otomatis mengisi default hak akses menu.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleOpenAddRole}
                    className="px-3.5 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Tambah Role Baru
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roleSettings.map((role) => (
                    <div
                      key={role.id}
                      className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col justify-between hover:border-amber-400/50 transition-all space-y-4"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 flex items-center gap-1.5 font-baloo">
                            <ShieldCheck className="w-4 h-4 text-amber-500" /> {role.name}
                          </h4>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                              role.targetType === 'admin'
                                ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                                : role.targetType === 'employee'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            }`}
                          >
                            {role.targetType === 'admin'
                              ? 'Khusus Admin'
                              : role.targetType === 'employee'
                              ? 'Khusus Karyawan'
                              : 'Admin & Karyawan'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
                          {role.description || 'Tidak ada deskripsi.'}
                        </p>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-purple-950/50 border border-slate-200 dark:border-purple-900/60">
                          <div className="flex items-center justify-between mb-1.5 text-[11px] font-extrabold text-slate-700 dark:text-amber-300">
                            <span>Hak Akses Menu ({role.allowedTabs.length} Menu)</span>
                          </div>
                          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                            {role.allowedTabs.map((tId) => (
                              <span
                                key={tId}
                                className="px-2 py-0.5 rounded bg-amber-400/20 text-purple-950 dark:text-amber-300 text-[10px] font-bold"
                              >
                                {getTabDisplayName(tId)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-purple-900/40">
                        <button
                          onClick={() => handleEditRole(role)}
                          className="px-3 py-1.5 rounded-xl bg-amber-400/20 text-purple-950 dark:text-amber-300 font-extrabold text-xs hover:bg-amber-400 hover:text-purple-950 transition-colors cursor-pointer"
                        >
                          Edit Hak Akses
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role.id)}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 font-extrabold text-xs hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB DATA PENGUNJUNG (GOOGLE AUTH & VISITORS) */}
        {activeTab === 'pengunjung' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1f0e30] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-500" /> Data Pengunjung (Google Auth & Guest Visitor)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Daftar akun pengunjung yang masuk menggunakan Google Authentication atau Role Pengunjung. Pengunjung dapat melihat seluruh menu dasbor aplikasi namun tidak memiliki hak akses mengubah/menghapus data (Read-Only).
                </p>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-amber-400/20 text-purple-950 dark:text-amber-300 font-extrabold text-xs border border-amber-400/40 shrink-0 flex items-center gap-1.5">
                🔒 Mode Read-Only Aktif
              </div>
            </div>

            {/* Visitors Table */}
            <div className="bg-white dark:bg-[#1f0e30] rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-purple-900/50 flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-300 flex items-center gap-2">
                  <span>👥 Daftar Akun Pengunjung ({adminUsers.filter((a) => a.role === 'Pengunjung' || a.passwordPin?.includes('Google')).length})</span>
                </h4>
                <span className="text-xs text-slate-500 dark:text-slate-400">Tersimpan di Cloud Firestore (`users/data/admins`)</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-purple-950/80 text-slate-700 dark:text-amber-300 font-bold border-b border-slate-200 dark:border-purple-900">
                      <th className="p-3.5">ID Pengunjung</th>
                      <th className="p-3.5">Nama Lengkap</th>
                      <th className="p-3.5">Email / Akun</th>
                      <th className="p-3.5">Role / Jabatan</th>
                      <th className="p-3.5">Metode Login</th>
                      <th className="p-3.5">Status Hak Akses</th>
                      <th className="p-3.5">Login Terakhir</th>
                      <th className="p-3.5 text-center">Aksi / Hapus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-purple-900/30">
                    {adminUsers
                      .filter((a) => a.role === 'Pengunjung' || a.passwordPin?.includes('Google') || a.role.toLowerCase().includes('pengunjung'))
                      .map((visitor) => (
                        <tr key={visitor.id} className="hover:bg-slate-50 dark:hover:bg-purple-950/40">
                          <td className="p-3.5 font-mono font-bold text-[#3D1259] dark:text-amber-400">
                            <span className="px-2 py-1 rounded-lg bg-amber-400/15 border border-amber-400/30">
                              {visitor.id}
                            </span>
                          </td>
                          <td className="p-3.5 font-extrabold text-slate-800 dark:text-slate-100">
                            {visitor.fullName}
                          </td>
                          <td className="p-3.5 text-slate-700 dark:text-slate-300 font-bold">
                            ✉️ {visitor.email || visitor.username}
                          </td>
                          <td className="p-3.5 font-bold">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-amber-300 border border-purple-300 dark:border-purple-800">
                              👁️ {visitor.role || 'Pengunjung'}
                            </span>
                          </td>
                          <td className="p-3.5 font-bold text-slate-700 dark:text-amber-300">
                            <span className="px-2.5 py-1 rounded-lg bg-amber-400/20 text-purple-950 dark:text-amber-300 text-[11px] font-extrabold inline-flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                              </svg>
                              Google Auth / Visitor
                            </span>
                          </td>
                          <td className="p-3.5 font-extrabold text-emerald-600 dark:text-emerald-400">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-[10px]">
                              Bisa Melihat Semua Menu (Tanpa Izin Ubah/Hapus)
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                            {visitor.lastLogin || visitor.createdAt || 'Baru Saja'}
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteAdmin(visitor.id)}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 font-extrabold hover:bg-rose-600 hover:text-white transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                              title="Hapus Data Pengunjung Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    {adminUsers.filter((a) => a.role === 'Pengunjung' || a.passwordPin?.includes('Google') || a.role.toLowerCase().includes('pengunjung')).length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400 dark:text-slate-500 italic font-medium">
                          Belum ada aktivitas pengunjung via Google Auth. Pengunjung yang login via Google akan otomatis tercatat di sini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: PENGATURAN NOTIFIKASI WHATSAPP */}
        {activeTab === 'wa' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1f0e30] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
              <h3 className="text-lg font-extrabold text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2 mb-1">
                <PhoneCall className="w-5 h-5 text-emerald-500" /> Pengaturan Notifikasi WhatsApp Otomatis
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atur format template pesan dan nomor WhatsApp penerima notifikasi pesanan masuk serta update status pengerjaan.
              </p>

              <form onSubmit={handleSaveWaSettings} className="mt-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-extrabold text-xs text-slate-700 dark:text-slate-200 block mb-1">
                      Nomor WA Dapur / Kasir Penerima Notifikasi *
                    </label>
                    <input
                      type="text"
                      value={waSettings.targetWaNumber}
                      onChange={(e) => setWaSettings({ ...waSettings, targetWaNumber: e.target.value })}
                      placeholder="Contoh: 628123456789"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Gunakan format internasional diawali 62 (tanpa tanda + / angka 0 di depan).
                    </p>
                  </div>

                  <div>
                    <label className="font-extrabold text-xs text-slate-700 dark:text-slate-200 block mb-1">
                      Mode Notifikasi WhatsApp
                    </label>
                    <select
                      value={waSettings.autoSendMode}
                      onChange={(e) => setWaSettings({ ...waSettings, autoSendMode: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                    >
                      <option value="direct_link">Direct WhatsApp Link (Aman & Gratis)</option>
                      <option value="gateway_api">Fonnte / Wablas API Gateway</option>
                    </select>
                  </div>
                </div>

                {waSettings.autoSendMode === 'gateway_api' && (
                  <div>
                    <label className="font-extrabold text-xs text-slate-700 dark:text-slate-200 block mb-1">
                      API Key Gateway (Fonnte / Wablas)
                    </label>
                    <input
                      type="password"
                      value={waSettings.apiKey || ''}
                      onChange={(e) => setWaSettings({ ...waSettings, apiKey: e.target.value })}
                      placeholder="Masukkan Token / Key API WA Gateway..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}

                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-extrabold text-xs text-slate-700 dark:text-slate-200">
                        Template Pesan Pesanan Masuk Baru (Order Placed)
                      </label>
                      <button
                        type="button"
                        onClick={() => handleTestWaSend('newOrder')}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        ⚡ Simulasi Tes Kirim Template
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      value={waSettings.templateNewOrder}
                      onChange={(e) => setWaSettings({ ...waSettings, templateNewOrder: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Placeholder yang tersedia: <code className="bg-slate-200 dark:bg-purple-900 px-1 rounded">{'{BRAND_NAME}'}</code>, <code className="bg-slate-200 dark:bg-purple-900 px-1 rounded">{'{ORDER_ID}'}</code>, <code className="bg-slate-200 dark:bg-purple-900 px-1 rounded">{'{NAMA}'}</code>, <code className="bg-slate-200 dark:bg-purple-900 px-1 rounded">{'{OUTLET}'}</code>, <code className="bg-slate-200 dark:bg-purple-900 px-1 rounded">{'{ITEMS_SUMMARY}'}</code>, <code className="bg-slate-200 dark:bg-purple-900 px-1 rounded">{'{TOTAL}'}</code>
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-extrabold text-xs text-slate-700 dark:text-slate-200">
                        Template Pesan Update Status Pesanan (Order Processed)
                      </label>
                      <button
                        type="button"
                        onClick={() => handleTestWaSend('statusUpdate')}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        ⚡ Simulasi Tes Kirim Template
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={waSettings.templateStatusUpdate}
                      onChange={(e) => setWaSettings({ ...waSettings, templateStatusUpdate: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-extrabold text-xs text-slate-700 dark:text-slate-200">
                        Template Pesan Notifikasi Absensi / Presensi Staff
                      </label>
                      <button
                        type="button"
                        onClick={() => handleTestWaSend('attendance')}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        ⚡ Simulasi Tes Kirim Template Absensi
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      value={waSettings.templateAttendance || `*PRESENSI NOTIFIKASI {TIPE} STAFF STEAK 11*\n---------------------------\n*Karyawan:* {NAMA} ({ROLE})\n*Outlet:* {OUTLET}\n*Tanggal:* {TANGGAL}\n*Jam:* {WAKTU} WIB\n*Evaluasi:* {EVALUASI}\n*Alamat:* {LOKASI}\n*Catatan:* {CATATAN}\n---------------------------\n_Terverifikasi Sistem Presensi Kamera Steak 11_`}
                      onChange={(e) => setWaSettings({ ...waSettings, templateAttendance: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Placeholder yang tersedia: <code className="bg-slate-200 dark:bg-purple-900 px-1 rounded">{'{TIPE}'}</code>, <code className="bg-slate-200 dark:bg-purple-900 px-1 rounded">{'{NAMA}'}</code>, <code className="bg-slate-200 dark:bg-purple-900 px-1 rounded">{'{ROLE}'}</code>, <code className="bg-slate-200 dark:bg-purple-900 px-1 rounded">{'{OUTLET}'}</code>, <code className="bg-slate-200 dark:bg-purple-900 px-1 rounded">{'{TANGGAL}'}</code>, <code className="bg-slate-200 dark:bg-purple-900 px-1 rounded">{'{WAKTU}'}</code>, <code className="bg-slate-200 dark:bg-purple-900 px-1 rounded">{'{EVALUASI}'}</code>, <code className="bg-slate-200 dark:bg-purple-900 px-1 rounded">{'{LOKASI}'}</code>, <code className="bg-slate-200 dark:bg-purple-900 px-1 rounded">{'{CATATAN}'}</code>
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md transition-all cursor-pointer"
                  >
                    Simpan Pengaturan WhatsApp
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 10: BRANDING & IDENTITAS STORE */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1f0e30] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
              <h3 className="text-lg font-extrabold text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-amber-500" /> Identitas Store & Branding Landing Page
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ubah nama brand, tagline, logo, banner hero, serta tautan media sosial yang terintegrasi secara otomatis di Landing Page & Header.
              </p>

              <form onSubmit={handleSaveBrandingSettings} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                      Nama Brand / Toko *
                    </label>
                    <input
                      type="text"
                      value={brandingSettings.brandName}
                      onChange={(e) => setBrandingSettings({ ...brandingSettings, brandName: e.target.value })}
                      placeholder="Contoh: STEAK 11"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-extrabold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                      Slogan Utama (Tagline) *
                    </label>
                    <input
                      type="text"
                      value={brandingSettings.tagline}
                      onChange={(e) => setBrandingSettings({ ...brandingSettings, tagline: e.target.value })}
                      placeholder="Contoh: Mythic Chicken Taste"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                      Sub-Tagline / Deskripsi Hero
                    </label>
                    <input
                      type="text"
                      value={brandingSettings.subTagline || ''}
                      onChange={(e) => setBrandingSettings({ ...brandingSettings, subTagline: e.target.value })}
                      placeholder="Contoh: Bukan sekadar steak ayam biasa, ini rasa yang MYTHIC..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* UPLOAD FOTO LOGO BRAND */}
                  <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 space-y-2">
                    <label className="font-extrabold text-slate-700 dark:text-slate-200 block flex items-center justify-between">
                      <span>Foto / Logo Brand Utama Landing Page *</span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Upload File / URL</span>
                    </label>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        value={brandingSettings.logoUrl}
                        onChange={(e) => setBrandingSettings({ ...brandingSettings, logoUrl: e.target.value })}
                        placeholder="https://... atau Upload File ▶"
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900 bg-white dark:bg-[#12071B] font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                      />

                      <label className="px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-all shadow-sm">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                showToast('Ukuran file logo terlalu besar! Maksimal 2 MB.');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setBrandingSettings({
                                  ...brandingSettings,
                                  logoUrl: reader.result as string
                                });
                                showToast('Foto logo brand berhasil diunggah!');
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>

                    {brandingSettings.logoUrl && (
                      <div className="flex items-center gap-3 pt-1">
                        <div className="relative w-16 h-16 rounded-xl border-2 border-amber-400/80 p-1 bg-white dark:bg-purple-950 flex items-center justify-center overflow-hidden shadow-sm">
                          <img
                            src={brandingSettings.logoUrl}
                            alt="Logo Brand Landing Page"
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setBrandingSettings({ ...brandingSettings, logoUrl: '' })}
                            className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-red-600 text-white text-[9px] font-bold shadow hover:bg-red-700 cursor-pointer"
                            title="Hapus Logo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Logo Brand Siap Tampil di Landing Page
                        </span>
                      </div>
                    )}
                  </div>

                  {/* UPLOAD HERO BANNER */}
                  <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 space-y-2">
                    <label className="font-extrabold text-slate-700 dark:text-slate-200 block flex items-center justify-between">
                      <span>URL / Foto Hero Banner Utama</span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Upload File / URL</span>
                    </label>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        value={brandingSettings.heroBannerUrl}
                        onChange={(e) => setBrandingSettings({ ...brandingSettings, heroBannerUrl: e.target.value })}
                        placeholder="https://... atau Upload File ▶"
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900 bg-white dark:bg-[#12071B] font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                      />

                      <label className="px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-all shadow-sm">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Banner</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 3 * 1024 * 1024) {
                                showToast('Ukuran file banner terlalu besar! Maksimal 3 MB.');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setBrandingSettings({
                                  ...brandingSettings,
                                  heroBannerUrl: reader.result as string
                                });
                                showToast('Foto hero banner berhasil diunggah!');
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>

                    {brandingSettings.heroBannerUrl && (
                      <div className="flex items-center gap-3 pt-1">
                        <div className="relative w-32 h-16 rounded-xl border-2 border-amber-400/80 p-1 bg-white dark:bg-purple-950 flex items-center justify-center overflow-hidden shadow-sm">
                          <img
                            src={brandingSettings.heroBannerUrl}
                            alt="Banner Hero Landing Page"
                            className="max-w-full max-h-full object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setBrandingSettings({ ...brandingSettings, heroBannerUrl: '' })}
                            className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-red-600 text-white text-[9px] font-bold shadow hover:bg-red-700 cursor-pointer"
                            title="Hapus Banner"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Hero Banner Siap Tampil
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                      Instagram Handle
                    </label>
                    <input
                      type="text"
                      value={brandingSettings.instagramHandle}
                      onChange={(e) => setBrandingSettings({ ...brandingSettings, instagramHandle: e.target.value })}
                      placeholder="@steak11.id"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                      TikTok Handle
                    </label>
                    <input
                      type="text"
                      value={brandingSettings.tiktokHandle}
                      onChange={(e) => setBrandingSettings({ ...brandingSettings, tiktokHandle: e.target.value })}
                      placeholder="@steak11.id"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                      Rating Score
                    </label>
                    <input
                      type="text"
                      value={brandingSettings.ratingScore}
                      onChange={(e) => setBrandingSettings({ ...brandingSettings, ratingScore: e.target.value })}
                      placeholder="4.9 / 5.0"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                      Ulasan Text
                    </label>
                    <input
                      type="text"
                      value={brandingSettings.reviewCountText}
                      onChange={(e) => setBrandingSettings({ ...brandingSettings, reviewCountText: e.target.value })}
                      placeholder="1,200+ Ulasan"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                      Deskripsi Profil Singkat (Footer)
                    </label>
                    <textarea
                      rows={3}
                      value={brandingSettings.aboutDescription}
                      onChange={(e) => setBrandingSettings({ ...brandingSettings, aboutDescription: e.target.value })}
                      placeholder="Tentang Steak 11..."
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md transition-all cursor-pointer"
                  >
                    Simpan & Terapkan Branding Toko
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 11: INVENTARIS & HUBUNGAN SUPPLIER (SUPPLY CHAIN) */}
        {(activeTab === 'inventory' || activeTab === 'suppliers' || activeTab === 'purchase_orders') && (
          <SupplyChainManager
            inventory={inventory}
            setInventory={setInventory}
            saveInventoryData={saveInventory}
            suppliers={suppliers}
            setSuppliers={setSuppliers}
            saveSuppliersData={saveSuppliers}
            purchaseOrders={purchaseOrders}
            setPurchaseOrders={setPurchaseOrders}
            savePurchaseOrdersData={savePurchaseOrders}
            showToast={showToast}
            outletsList={locations.map(l => l.name)}
            initialSubTab={
              activeTab === 'suppliers'
                ? 'suppliers'
                : activeTab === 'purchase_orders'
                ? 'purchase_orders'
                : 'inventory'
            }
            currentUser={currentUser}
          />
        )}

        {/* TAB 12: MANAJEMEN KODE PROMO & VOUCHER */}
        {activeTab === 'promos' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1f0e30] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                  <Percent className="w-5 h-5 text-rose-500" /> Kode Promo, Voucher Diskon & Campaign Sales
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Atur voucher potongan harga (nominal / persen) untuk meningkatkan transaksi pelanggan.
                </p>
              </div>

              <button
                onClick={handleOpenAddPromo}
                className="px-4 py-2.5 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Terbitkan Promo Baru
              </button>
            </div>

            {/* Promos Table */}
            <div className="bg-white dark:bg-[#1f0e30] rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-purple-950/80 text-slate-700 dark:text-amber-300 font-bold border-b border-slate-200 dark:border-purple-900">
                      <th className="p-3.5">Kode Voucher</th>
                      <th className="p-3.5">Deskripsi Promo</th>
                      <th className="p-3.5">Nilai Diskon</th>
                      <th className="p-3.5">Min. Belanja</th>
                      <th className="p-3.5">Dipakai</th>
                      <th className="p-3.5">Masa Berlaku</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-purple-900/30">
                    {promos.map((promo) => (
                      <tr key={promo.id} className="hover:bg-slate-50 dark:hover:bg-purple-950/40">
                        <td className="p-3.5 font-black text-sm font-mono text-purple-900 dark:text-amber-400">
                          {promo.code}
                        </td>
                        <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                          {promo.description}
                        </td>
                        <td className="p-3.5 font-black text-rose-600 dark:text-rose-400">
                          {promo.discountType === 'nominal'
                            ? formatRupiah(promo.discountValue)
                            : `${promo.discountValue}% (Maks ${formatRupiah(promo.maxDiscountAmount || 0)})`}
                        </td>
                        <td className="p-3.5 font-bold text-slate-600 dark:text-slate-300">
                          {formatRupiah(promo.minOrderAmount)}
                        </td>
                        <td className="p-3.5 font-black text-amber-600 dark:text-amber-300">
                          {promo.usageCount}x
                        </td>
                        <td className="p-3.5 text-slate-500">
                          s/d {promo.expiryDate}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                              promo.status === 'Aktif'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-purple-950 dark:text-slate-400'
                            }`}
                          >
                            {promo.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleEditPromo(promo)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-400/20 text-purple-950 dark:text-amber-300 font-bold hover:bg-amber-400 hover:text-purple-950 transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePromo(promo.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 13: KEUANGAN & AUDIT KASIR (FINANCE & CONTROL) */}
        {(activeTab === 'shifts' || activeTab === 'expenses') && (
          <FinanceControlManager
            shifts={cashierShifts}
            setShifts={setCashierShifts}
            saveShiftsData={saveCashierShifts}
            expenses={expenses}
            setExpenses={setExpenses}
            saveExpensesData={saveExpenses}
            orders={orders}
            payrolls={payrollSlips}
            showToast={showToast}
            outletsList={locations.map(l => l.name)}
            currentUser={currentUser}
          />
        )}

        {/* TAB 14: INTEGRASI & SYSTEM */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#180B24] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
              <div>
                <h3 className="font-extrabold text-lg text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-500" />
                  Pengaturan Integrasi & Sistem Terpadu
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Kelola Google Apps Script (GAS) Spreadsheet, Konten Header/Footer Landing Page, serta Backup & Restore Basis Data.
                </p>
              </div>
            </div>

            {/* SEKSI 1: INTEGRASI GOOGLE APPS SCRIPT (GAS) & SPREADSHEET */}
            <div className="bg-white dark:bg-[#180B24] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-purple-900/40 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-amber-400">
                    <FileCode2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-300 flex items-center gap-2">
                      1. Integrasi Google Apps Script (GAS) & Google Sheets
                      <span className="text-[10px] bg-slate-200 dark:bg-purple-900 text-slate-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                        Opsional / Secondary Backup
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Firebase Firestore aktif sebagai database utama real-time. Isi URL di bawah jika ingin mengaktifkan ekspor otomatis ke Google Sheets.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCopyGasCode}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-900 dark:bg-amber-400 text-white dark:text-purple-950 font-bold text-xs hover:bg-purple-800 dark:hover:bg-amber-300 transition-all cursor-pointer shadow-xs"
                >
                  {gasCopyStatus ? <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-950" /> : <Copy className="w-4 h-4" />}
                  <span>{gasCopyStatus ? 'Kode Tersalin!' : 'Salin Kode GAS'}</span>
                </button>
              </div>

              {/* Input URL Web App */}
              <div className="space-y-3 bg-slate-50 dark:bg-purple-950/40 p-4 rounded-xl border border-slate-200 dark:border-purple-900/50">
                <label className="font-bold text-xs text-slate-700 dark:text-slate-200 block">
                  URL Web App Google Apps Script:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    value={gasUrlInput}
                    onChange={(e) => setGasUrlInput(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-purple-800 bg-white dark:bg-[#12071B] text-slate-800 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveGasUrlInSystem}
                      className="px-4 py-2.5 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 transition-all cursor-pointer shadow-xs flex items-center gap-1.5 shrink-0"
                    >
                      <Save className="w-4 h-4" /> Simpan URL
                    </button>
                    <button
                      onClick={handleTestGasConnection}
                      disabled={isTestingGas}
                      className="px-4 py-2.5 rounded-xl bg-purple-900 text-amber-300 border border-purple-700 font-bold text-xs hover:bg-purple-800 transition-all cursor-pointer shadow-xs flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                    >
                      <ExternalLink className="w-4 h-4" /> {isTestingGas ? 'Menguji...' : 'Uji Koneksi'}
                    </button>
                  </div>
                </div>

                {gasTestResult && (
                  <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    gasTestResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}>
                    <span>{gasTestResult.message}</span>
                  </div>
                )}
              </div>

              {/* Visual Box Code Snippet */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-amber-500" /> Kode Script Integrasi (Google Apps Script / Code.gs):
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">JavaScript (GAS Apps Script Engine)</span>
                </div>
                <pre className="p-4 rounded-xl bg-[#0F0717] text-amber-300 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-56 border border-purple-900/60 shadow-inner select-all">
                  {fullGasScriptCode}
                </pre>
              </div>
            </div>

            {/* SEKSI 2: PENGATURAN KONTEN HEADER DAN FOOTER LANDING PAGE */}
            <form onSubmit={handleSaveBrandingSettings} className="bg-white dark:bg-[#180B24] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-purple-900/40 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-purple-950 text-amber-600 dark:text-amber-400">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-300">
                      2. Pengaturan Konten Header & Footer Landing Page
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Sesuaikan teks pengumuman atas (announcement bar), running text footer, & teks hak cipta.
                    </p>
                  </div>
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 transition-all cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4" /> Simpan Pengaturan Web
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                {/* Header Announcement Bar Settings */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-purple-950/40 border border-slate-200 dark:border-purple-900/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-800 dark:text-amber-300 font-baloo text-sm flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-amber-500" /> Header Announcement Bar
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={brandingSettings.showAnnouncementBar ?? true}
                        onChange={(e) => setBrandingSettings({ ...brandingSettings, showAnnouncementBar: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                      />
                      <span className="font-bold text-[11px] text-slate-700 dark:text-slate-200">Tampilkan Banner Top</span>
                    </label>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Teks Banner Pengumuman:
                    </label>
                    <input
                      type="text"
                      placeholder="Misal: 🔥 PROMO MYTHIC: Diskon Rp 5.000..."
                      value={brandingSettings.announcementText || ''}
                      onChange={(e) => setBrandingSettings({ ...brandingSettings, announcementText: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-white dark:bg-[#12071B] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Link / Anchor Banner (Opsional):
                    </label>
                    <input
                      type="text"
                      placeholder="#menu atau URL eksternal"
                      value={brandingSettings.announcementLink || ''}
                      onChange={(e) => setBrandingSettings({ ...brandingSettings, announcementLink: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-white dark:bg-[#12071B] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

                {/* Footer Customizations */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-purple-950/40 border border-slate-200 dark:border-purple-900/50 space-y-3">
                  <span className="font-extrabold text-slate-800 dark:text-amber-300 font-baloo text-sm flex items-center gap-1.5 block">
                    <Sliders className="w-4 h-4 text-purple-400" /> Pengaturan Footer Landing Page
                  </span>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Teks Berjalan Footer (Running Text Banner):
                    </label>
                    <input
                      type="text"
                      placeholder="Misal: ⚡ PROMO HOTPLATE STEAK 11 — DAGING PAHA AYAM BONELESS JUICY..."
                      value={brandingSettings.footerRunningText || ''}
                      onChange={(e) => setBrandingSettings({ ...brandingSettings, footerRunningText: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-white dark:bg-[#12071B] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Teks Hak Cipta Copyright Footer:
                    </label>
                    <input
                      type="text"
                      placeholder="© 2026 STEAK 11 — MYTHIC CHICKEN TASTE. ALL RIGHTS RESERVED."
                      value={brandingSettings.footerCopyrightText || ''}
                      onChange={(e) => setBrandingSettings({ ...brandingSettings, footerCopyrightText: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-white dark:bg-[#12071B] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Label Versi Sistem (Tampil di Footer Sidebar Dashboard):
                    </label>
                    <input
                      type="text"
                      placeholder="Steak 11 v1.0 System"
                      value={brandingSettings.systemVersionText || ''}
                      onChange={(e) => setBrandingSettings({ ...brandingSettings, systemVersionText: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-white dark:bg-[#12071B] text-slate-800 dark:text-amber-300 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-purple-900/40">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" /> Simpan & Terapkan Pengaturan Header & Footer Web
                </button>
              </div>
            </form>

            {/* SEKSI 3: BACKUP & RESTORE BASIS DATA APLIKASI */}
            <div className="bg-white dark:bg-[#180B24] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-purple-900/40 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-300">
                      3. Backup & Restore Basis Data Aplikasi
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Ekspor cadangan penuh atau pulihkan data (Pesanan, Menu, Karyawan, Absensi, Payroll, & Outlet) dari file JSON.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                {/* Ekspor Backup */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-purple-950/40 border border-slate-200 dark:border-purple-900/50 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-extrabold text-sm mb-2 font-baloo">
                      <Download className="w-5 h-5" /> Cadangkan / Ekspor Data (Full Backup)
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                      Unduh seluruh data aplikasi ke dalam 1 file JSON terenkapsulasi secara offline. Termasuk data pesanan, menu, stok bahan baku, absensi karyawan, slip penggajian, dan outlet.
                    </p>
                  </div>

                  <button
                    onClick={handleExportFullBackup}
                    className="w-full py-3 px-4 rounded-xl bg-cyan-600 dark:bg-cyan-500 text-white dark:text-cyan-950 font-extrabold text-xs hover:bg-cyan-700 dark:hover:bg-cyan-400 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download Backup Database (JSON)
                  </button>
                </div>

                {/* Impor Restore */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-purple-950/40 border border-slate-200 dark:border-purple-900/50 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-purple-900 dark:text-amber-400 font-extrabold text-sm mb-2 font-baloo">
                      <Upload className="w-5 h-5" /> Pulihkan / Restore Data (Impor JSON)
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                      Unggah file backup JSON untuk memulihkan seluruh catatan sistem.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileChangeForRestore}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-purple-100 file:text-purple-900 dark:file:bg-purple-900 dark:file:text-amber-300 hover:file:bg-purple-200 cursor-pointer"
                    />

                    {restoreError && (
                      <div className="p-3 rounded-xl bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800">
                        {restoreError}
                      </div>
                    )}

                    {restoreSuccessMsg && (
                      <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800">
                        {restoreSuccessMsg}
                      </div>
                    )}

                    {restorePreviewData && (
                      <div className="p-3.5 rounded-xl bg-white dark:bg-[#12071B] border border-slate-200 dark:border-purple-800 space-y-2">
                        <span className="font-extrabold text-slate-800 dark:text-amber-300 block text-[11px] uppercase tracking-wider">
                          Pratinjau Data File Backup:
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                          <div>• Pesanan: {restorePreviewData.data?.orders?.length ?? restorePreviewData.orders?.length ?? 0} rec</div>
                          <div>• Menu & Produk: {restorePreviewData.data?.menuItems?.length ?? restorePreviewData.menuItems?.length ?? 0} rec</div>
                          <div>• Karyawan: {restorePreviewData.data?.employees?.length ?? restorePreviewData.employees?.length ?? 0} rec</div>
                          <div>• Absensi: {restorePreviewData.data?.attendance?.length ?? restorePreviewData.attendance?.length ?? 0} rec</div>
                          <div>• Slip Payroll: {restorePreviewData.data?.payrollSlips?.length ?? restorePreviewData.payrollSlips?.length ?? 0} rec</div>
                          <div>• Outlets: {restorePreviewData.data?.locations?.length ?? restorePreviewData.locations?.length ?? 0} rec</div>
                        </div>

                        <button
                          onClick={handleApplyRestoreDatabase}
                          className="w-full mt-2 py-2.5 px-3 rounded-xl bg-amber-400 text-purple-950 font-black text-xs hover:bg-amber-300 transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <RotateCcw className="w-4 h-4" /> Terapkan Restore Database Sekarang
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SEKSI 4: PEMBARUAN APLIKASI VIA FILE ZIP (SYSTEM SOFTWARE UPDATE) */}
            <div className="bg-white dark:bg-[#180B24] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-purple-900/40 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-300 flex items-center gap-2">
                      4. Pembaruan Aplikasi via File ZIP (System Software Update)
                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Database Firestore Safe
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Unggah file .zip paket update versi terbaru untuk memperbarui versi aplikasi tanpa mengubah atau menghapus data transaksi & toko di Firestore.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
                {/* Unggah Dropzone */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border-2 border-dashed border-purple-300 dark:border-purple-800 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center mx-auto font-bold shadow-xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs text-[#3D1259] dark:text-amber-300 font-baloo">
                        Unggah Bundle Paket Update (.zip)
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Pilih file ZIP hasil ekspor atau kompilasi versi terbaru.
                      </p>
                    </div>

                    {isUploadingZipUpdate ? (
                      <div className="py-2 space-y-2">
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{zipUpdateProgress}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-purple-950 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-amber-500 h-full w-full animate-pulse"></div>
                        </div>
                      </div>
                    ) : (
                      <label className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#3D1259] dark:bg-amber-400 hover:bg-purple-900 dark:hover:bg-amber-300 text-amber-300 dark:text-purple-950 text-xs font-extrabold cursor-pointer transition-all shadow-md">
                        <HardDrive className="w-4 h-4" />
                        <span>Pilih File Update ZIP...</span>
                        <input
                          type="file"
                          accept=".zip"
                          onChange={handleUploadZipUpdate}
                          disabled={isUploadingZipUpdate}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 space-y-1">
                    <div className="font-extrabold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Jaminan Keamanan Data:</span>
                    </div>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed">
                      Proses ekstraksi ZIP hanya memperbarui berkas aplikasi (codebase). Seluruh database transaksi, outlet, pengguna, dan pengaturan toko tersimpan secara permanen di Google Cloud Firestore.
                    </p>
                  </div>
                </div>

                {/* Status & History */}
                <div className="lg:col-span-7 space-y-3">
                  {zipUpdateResult && (
                    <div className={`p-4 rounded-xl border ${zipUpdateResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'} space-y-2`}>
                      <div className="flex items-center justify-between font-extrabold text-xs">
                        <span className="flex items-center gap-1.5">
                          {zipUpdateResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
                          {zipUpdateResult.message}
                        </span>
                      </div>

                      {zipUpdateResult.updateInfo && (
                        <div className="text-[11px] font-mono grid grid-cols-2 gap-2 pt-1 border-t border-emerald-500/20">
                          <div>• File: {zipUpdateResult.updateInfo.fileName} ({zipUpdateResult.updateInfo.fileSizeMb} MB)</div>
                          <div>• Total Berkas: {zipUpdateResult.updateInfo.totalFiles} File</div>
                          <div>• Status DB: {zipUpdateResult.updateInfo.databaseStatus}</div>
                          <div>• Waktu: {new Date(zipUpdateResult.updateInfo.uploadedAt).toLocaleString('id-ID')} WIB</div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs text-[#3D1259] dark:text-amber-400 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-purple-500" />
                        Riwayat Pembaruan Sistem (System Update Log)
                      </h5>
                      <button
                        onClick={fetchZipUpdateHistory}
                        className="text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" /> Refresh
                      </button>
                    </div>

                    {zipUpdateHistory.length === 0 ? (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-purple-950/40 border border-slate-200 dark:border-purple-900/40 text-center text-xs text-slate-500 dark:text-slate-400">
                        Belum ada riwayat pembaruan sistem via ZIP.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-purple-900/50 max-h-52 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 dark:bg-purple-950 text-slate-700 dark:text-slate-300 font-bold sticky top-0">
                            <tr>
                              <th className="p-2.5">ID Update</th>
                              <th className="p-2.5">Nama File</th>
                              <th className="p-2.5">Ukuran</th>
                              <th className="p-2.5">Jml File</th>
                              <th className="p-2.5">Waktu</th>
                              <th className="p-2.5">Status DB</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-purple-900/40">
                            {zipUpdateHistory.map((rec) => (
                              <tr key={rec.id} className="hover:bg-purple-50/50 dark:hover:bg-purple-900/20">
                                <td className="p-2.5 font-mono text-[11px] font-bold text-purple-700 dark:text-purple-300">
                                  {rec.id}
                                </td>
                                <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[130px]">
                                  {rec.fileName}
                                </td>
                                <td className="p-2.5 font-mono text-slate-500 dark:text-slate-400">
                                  {rec.fileSizeMb} MB
                                </td>
                                <td className="p-2.5 font-mono text-slate-700 dark:text-slate-300">
                                  {rec.totalFiles}
                                </td>
                                <td className="p-2.5 text-slate-500 dark:text-slate-400 text-[11px]">
                                  {new Date(rec.uploadedAt).toLocaleDateString('id-ID', {
                                    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                  })}
                                </td>
                                <td className="p-2.5">
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                                    🛡️ Aman (Untouched)
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB FIREBASE DATABASE */}
        {activeTab === 'firebase' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#180B24] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
              <FirebaseSettingsPanel currentUser={currentUser} />
            </div>
          </div>
        )}

        {/* TAB 19: PENGATURAN PEMBAYARAN & STRUK THERMAL */}
        {activeTab === 'payment_receipt_settings' && (
          <PaymentAndReceiptSettingsManager showToast={showToast} currentUser={currentUser} />
        )}

        {/* TAB 20: AUDIT LOG AKTIVITAS */}
        {activeTab === 'audit_logs' && (
          <AuditLogManager showToast={showToast} />
        )}

        {/* TAB 21: PRESENSI KAMERA SELFIE */}
        {activeTab === 'presensi_kamera' && (
          <PresensiKameraManager showToast={showToast} currentUser={currentUser} />
        )}

        {/* TAB 22: DATA PELANGGAN & WA GATEWAY NODE.JS */}
        {activeTab === 'customers' && (
          <CustomerManager onShowToast={showToast} currentUser={currentUser} />
        )}

        {/* TAB 23: PANDUAN & TUTORIAL PEMAKAIAN */}
        {(activeTab as string) === 'user_guide' && (
          <UserGuideManager onNavigateTab={(tab) => setActiveTab(tab as any)} />
        )}
        </main>
      </div>

      {/* ADD/EDIT OUTLET MODAL */}
      {showOutletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-[#1a0c28] text-slate-800 dark:text-slate-100 rounded-2xl p-6 shadow-2xl border border-purple-900/50 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-purple-900 pb-3 shrink-0">
              <h3 className="font-extrabold text-lg text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                {editingOutletId ? 'Edit Outlet & Aturan Shift' : 'Tambah Outlet Baru'}
              </h3>
              <button
                onClick={() => setShowOutletModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-purple-900 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-purple-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-1.5 space-y-4 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="font-bold block mb-1">Nama Outlet:</label>
                  <input
                    type="text"
                    placeholder="Misal: Steak 11, Kalisari"
                    value={outletName}
                    onChange={(e) => setOutletName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Kota Outlet:</label>
                  <input
                    type="text"
                    placeholder="Misal: Jakarta Timur"
                    value={outletCity}
                    onChange={(e) => setOutletCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Telepon / WhatsApp Outlet:</label>
                  <input
                    type="text"
                    placeholder="081223233299"
                    value={outletPhone}
                    onChange={(e) => setOutletPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold block mb-1">Alamat Lengkap Outlet:</label>
                  <input
                    type="text"
                    placeholder="Jl. Raya Kalisari No. 11, Pasar Rebo, Jakarta Timur"
                    value={outletAddress}
                    onChange={(e) => setOutletAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Jam Operasional Outlet:</label>
                  <input
                    type="text"
                    placeholder="10:00 - 22:00 WIB"
                    value={outletHours}
                    onChange={(e) => setOutletHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Google Maps URL:</label>
                  <input
                    type="text"
                    placeholder="https://maps.google.com/..."
                    value={outletMapUrl}
                    onChange={(e) => setOutletMapUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                {/* SHIFT RULES Section */}
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-amber-50 dark:bg-purple-950/80 border border-amber-300 dark:border-purple-800 space-y-2 mt-1">
                  <div className="font-bold text-xs text-[#3D1259] dark:text-amber-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-500" /> Pengaturan Shift Operasional Karyawan
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold block text-[11px] mb-1">Batas Jam Masuk Shift:</label>
                      <input
                        type="time"
                        value={outletStartWorkTime}
                        onChange={(e) => setOutletStartWorkTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-white dark:bg-[#12071B] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block text-[11px] mb-1">Batas Jam Pulang Shift:</label>
                      <input
                        type="time"
                        value={outletEndWorkTime}
                        onChange={(e) => setOutletEndWorkTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-white dark:bg-[#12071B] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>
                </div>

                {/* LAYANAN OUTLET MENU (Dine-In, Takeaway, Delivery) */}
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 space-y-2">
                  <div className="font-bold text-xs text-[#3D1259] dark:text-amber-300 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-emerald-500" /> Mode Tipe Pesanan Outlet (Landing Page & POS)
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={outletDineIn}
                        onChange={(e) => setOutletDineIn(e.target.checked)}
                        className="rounded accent-purple-600 w-4 h-4"
                      />
                      <span>🍽️ Dine-In (Makan di Tempat)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={outletTakeaway}
                        onChange={(e) => setOutletTakeaway(e.target.checked)}
                        className="rounded accent-amber-500 w-4 h-4"
                      />
                      <span>🛍️ Takeaway (Bungkus)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={outletDelivery}
                        onChange={(e) => setOutletDelivery(e.target.checked)}
                        className="rounded accent-emerald-500 w-4 h-4"
                      />
                      <span>🛵 Delivery (Kurir Toko)</span>
                    </label>
                  </div>
                </div>

                {/* MITRA PENGIRIMAN ONLINE (GoFood, GrabFood, ShopeeFood, Maxim) */}
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50 dark:bg-purple-950/40 border border-slate-200 dark:border-purple-800 space-y-3">
                  <div className="font-bold text-xs text-[#3D1259] dark:text-amber-300 flex items-center justify-between">
                    <span>Mitra Pengiriman Online (Terintegrasi ke Landing Page)</span>
                    <span className="text-[10px] text-slate-500">Isi Link URL Aplikasi</span>
                  </div>

                  <div className="space-y-2">
                    {/* GoFood */}
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 min-w-[110px] font-bold text-emerald-700 dark:text-emerald-400 cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={outletIsGofoodActive}
                          onChange={(e) => setOutletIsGofoodActive(e.target.checked)}
                          className="rounded accent-emerald-600 w-3.5 h-3.5"
                        />
                        <span>🟢 GoFood</span>
                      </label>
                      <input
                        type="url"
                        placeholder="URL Resto GoFood (https://gofood.link/...)"
                        value={outletGofoodUrl}
                        onChange={(e) => setOutletGofoodUrl(e.target.value)}
                        disabled={!outletIsGofoodActive}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-purple-800 bg-white dark:bg-[#12071B] text-xs font-mono disabled:opacity-40"
                      />
                    </div>

                    {/* GrabFood */}
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 min-w-[110px] font-bold text-green-700 dark:text-green-400 cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={outletIsGrabfoodActive}
                          onChange={(e) => setOutletIsGrabfoodActive(e.target.checked)}
                          className="rounded accent-green-600 w-3.5 h-3.5"
                        />
                        <span>🟢 GrabFood</span>
                      </label>
                      <input
                        type="url"
                        placeholder="URL Resto GrabFood (https://grab.com/food/...)"
                        value={outletGrabfoodUrl}
                        onChange={(e) => setOutletGrabfoodUrl(e.target.value)}
                        disabled={!outletIsGrabfoodActive}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-purple-800 bg-white dark:bg-[#12071B] text-xs font-mono disabled:opacity-40"
                      />
                    </div>

                    {/* ShopeeFood */}
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 min-w-[110px] font-bold text-orange-700 dark:text-orange-400 cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={outletIsShopeefoodActive}
                          onChange={(e) => setOutletIsShopeefoodActive(e.target.checked)}
                          className="rounded accent-orange-600 w-3.5 h-3.5"
                        />
                        <span>🟠 ShopeeFood</span>
                      </label>
                      <input
                        type="url"
                        placeholder="URL Resto ShopeeFood (https://shopee.co.id/food/...)"
                        value={outletShopeefoodUrl}
                        onChange={(e) => setOutletShopeefoodUrl(e.target.value)}
                        disabled={!outletIsShopeefoodActive}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-purple-800 bg-white dark:bg-[#12071B] text-xs font-mono disabled:opacity-40"
                      />
                    </div>

                    {/* Maxim */}
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 min-w-[110px] font-bold text-amber-700 dark:text-amber-400 cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={outletIsMaximActive}
                          onChange={(e) => setOutletIsMaximActive(e.target.checked)}
                          className="rounded accent-amber-500 w-3.5 h-3.5"
                        />
                        <span>🟡 Maxim Food</span>
                      </label>
                      <input
                        type="url"
                        placeholder="URL Resto Maxim Food"
                        value={outletMaximUrl}
                        onChange={(e) => setOutletMaximUrl(e.target.value)}
                        disabled={!outletIsMaximActive}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-purple-800 bg-white dark:bg-[#12071B] text-xs font-mono disabled:opacity-40"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-purple-900 shrink-0">
              {editingOutletId ? (
                <button
                  type="button"
                  onClick={() => handleDeleteOutlet(editingOutletId)}
                  className="px-3 py-2 rounded-xl bg-red-100 hover:bg-red-200 dark:bg-red-950/80 dark:hover:bg-red-900 text-red-600 dark:text-red-300 font-bold text-xs flex items-center gap-1 cursor-pointer border border-red-300 dark:border-red-800"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus Outlet
                </button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowOutletModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveOutlet}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md cursor-pointer"
                >
                  Simpan Data Outlet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT EMPLOYEE MODAL */}
      {showAddEmpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg my-auto max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1a0c28] text-slate-800 dark:text-slate-100 rounded-2xl p-5 sm:p-6 shadow-2xl border border-purple-900/50 space-y-4">
            <h3 className="font-extrabold text-lg text-[#3D1259] dark:text-amber-400 font-baloo">
              {editingEmpId ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold block mb-1">ID Karyawan (Dapat Diubah):</label>
                <input
                  type="text"
                  value={empCustomId}
                  onChange={(e) => setEmpCustomId(e.target.value)}
                  placeholder="Contoh: EMP-001"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Username Login Karyawan:</label>
                <input
                  type="text"
                  value={empUsername}
                  onChange={(e) => setEmpUsername(e.target.value)}
                  placeholder="Contoh: budi_cook"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-mono text-purple-900 dark:text-amber-300 font-bold"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Jabatan / Role Karyawan:</label>
                <select
                  value={empRole}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEmpRole(val);
                    const matched = roleSettings.find((r) => r.name.toLowerCase() === val.toLowerCase());
                    if (matched && matched.allowedTabs && matched.allowedTabs.length > 0) {
                      setEmpAllowedTabs(matched.allowedTabs);
                      showToast(`Akses menu otomatis disesuaikan untuk role "${matched.name}"`);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold cursor-pointer focus:ring-2 focus:ring-amber-400"
                >
                  {roleSettings.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Outlet Penugasan:</label>
                <select
                  value={empOutlet}
                  onChange={(e) => setEmpOutlet(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950"
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.name}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">No WhatsApp Staf:</label>
                <input
                  type="text"
                  value={empPhone}
                  onChange={(e) => setEmpPhone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Gaji Pokok Harian (Rp):</label>
                <input
                  type="number"
                  value={empDailyRate}
                  onChange={(e) => setEmpDailyRate(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Rate Lembur / Jam (Rp):</label>
                <input
                  type="number"
                  value={empHourlyRate}
                  onChange={(e) => setEmpHourlyRate(Number(e.target.value))}
                  placeholder="15000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold text-blue-600 dark:text-blue-400"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Uang Makan & Transpor (Rp):</label>
                <input
                  type="number"
                  value={empDailyAllowance}
                  onChange={(e) => setEmpDailyAllowance(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Tunj. Hadir Tepat Waktu / Hari (Rp):</label>
                <input
                  type="number"
                  value={empPunctualityAllowance}
                  onChange={(e) => setEmpPunctualityAllowance(Number(e.target.value))}
                  placeholder="15000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="font-bold text-rose-600 dark:text-rose-400 block mb-1 flex items-center justify-between">
                  <span>Denda Potongan Telat / Hari (Rp):</span>
                  <span className="text-[10px] font-normal text-slate-400">Jika telat &gt;{latePenaltyThresholdMinutes}m</span>
                </label>
                <input
                  type="number"
                  value={empLatePenaltyPerDay}
                  onChange={(e) => setEmpLatePenaltyPerDay(Number(e.target.value))}
                  placeholder="15000"
                  className="w-full px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/60 dark:bg-purple-950 font-bold text-rose-700 dark:text-rose-300"
                />
              </div>

              <div>
                <label className="font-bold text-purple-700 dark:text-purple-300 block mb-1 flex items-center justify-between">
                  <span>Bonus Outlet / Hari (Rp):</span>
                  <span className="text-[10px] font-normal text-slate-400">Insentif Omset Harian</span>
                </label>
                <input
                  type="number"
                  value={empOutletBonus}
                  onChange={(e) => setEmpOutletBonus(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl border border-purple-300 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-950 font-bold text-purple-700 dark:text-amber-300"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Password Staff:</label>
                <input
                  type="text"
                  placeholder="Password atau PIN (min. 4 karakter)"
                  value={empPin}
                  onChange={(e) => setEmpPin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Status Karyawan:</label>
                <select
                  value={empStatus}
                  onChange={(e) => setEmpStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                </select>
              </div>
            </div>

            {/* RBAC Menu Permission Section for Employees */}
            <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="font-extrabold text-xs text-[#3D1259] dark:text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  Hak Akses Menu Dashboard ({(empAllowedTabs || []).length} Menu Terpilih)
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEmpAllowedTabs(['kasir', 'pesanan', 'shifts', 'inventory', 'reviews', 'absensi'])}
                    className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] cursor-pointer"
                  >
                    Preset Kasir
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmpAllowedTabs(['kasir', 'pesanan', 'inventory', 'absensi'])}
                    className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-[10px] cursor-pointer"
                  >
                    Preset Koki
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmpAllowedTabs(['dashboard', 'kasir', 'pesanan', 'analytics', 'menu', 'racik', 'inventory', 'reviews', 'promos', 'karyawan', 'absensi', 'penggajian', 'shifts', 'outlets'])}
                    className="px-2 py-0.5 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-700 dark:text-purple-300 font-bold text-[10px] cursor-pointer"
                  >
                    Manager
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-56 overflow-y-auto overscroll-contain p-1.5 text-[11px] rounded-lg bg-white/40 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-800/50">
                {SYSTEM_ALL_TABS.map((tab) => {
                  const isChecked = empAllowedTabs.includes(tab.id);
                  return (
                    <label
                      key={tab.id}
                      className={`flex items-center gap-1.5 p-1.5 rounded-lg border cursor-pointer select-none transition-all ${
                        isChecked
                          ? 'bg-amber-400/20 border-amber-400 text-purple-950 dark:text-amber-300 font-bold'
                          : 'bg-white/50 dark:bg-purple-900/30 border-slate-200 dark:border-purple-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEmpAllowedTabs([...empAllowedTabs, tab.id]);
                          } else {
                            setEmpAllowedTabs(empAllowedTabs.filter((t) => t !== tab.id));
                          }
                        }}
                        className="rounded accent-amber-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="truncate">{tab.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddEmpModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEmp}
                className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md cursor-pointer"
              >
                Simpan Karyawan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PAYROLL SLIP ADJUSTMENT MODAL */}
      {editingSlipId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-purple-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg my-auto max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1a0c28] text-slate-800 dark:text-slate-100 rounded-2xl p-5 sm:p-6 shadow-2xl border border-purple-900/50 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-purple-900 pb-3">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo">
                  Edit & Penyesuaian Rincian Slip Gaji
                </h3>
              </div>
              <button
                onClick={() => setEditingSlipId(null)}
                className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const currentSlip = payrollSlips.find((s) => s.id === editingSlipId);
              if (!currentSlip) return null;
              const matchedEmp = employees.find((e) => e.id === currentSlip.employeeId);
              const previewNet = Number(editBaseSalary) + Number(editAllowance) + Number(editPunctualityAllowance) + Number(editOvertimePay) + Number(editOutletBonus) + Number(editBonus) - Number(editDeductions);

              return (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-purple-950/50 rounded-xl border border-slate-200 dark:border-purple-900 flex justify-between items-center">
                    <div>
                      <span className="font-extrabold text-sm text-[#3D1259] dark:text-amber-300 block">
                        {currentSlip.employeeName}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {currentSlip.employeeRole} • {currentSlip.outlet}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Presensi Shift:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-300">
                        {currentSlip.totalDaysPresent} Hari Hadir ({currentSlip.totalHoursWorked} Jam)
                      </span>
                    </div>
                  </div>

                  {matchedEmp && (
                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[11px] space-y-1">
                      <span className="font-bold text-purple-900 dark:text-amber-300 block">
                        👤 Tarif Master Karyawan Saat Ini:
                      </span>
                      <div className="flex flex-wrap gap-2 text-[10px] text-slate-600 dark:text-slate-300 font-semibold">
                        <span>Gaji Harian: <strong className="text-emerald-600">{formatRupiah(matchedEmp.dailyRate)}</strong></span>
                        <span>• Rate Lembur: <strong className="text-blue-600">{formatRupiah(matchedEmp.hourlyRate ?? 0)}/jam</strong></span>
                        <span>• Uang Makan: <strong className="text-amber-600">{formatRupiah(matchedEmp.dailyAllowance)}</strong></span>
                        <span>• Bonus Outlet: <strong className="text-purple-600">{formatRupiah(matchedEmp.outletBonus || 0)}/hari</strong></span>
                      </div>
                    </div>
                  )}

                  {/* Components Input Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold block mb-1">Gaji Pokok (Rp):</label>
                      <input
                        type="number"
                        value={editBaseSalary}
                        onChange={(e) => setEditBaseSalary(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1">Uang Makan & Transpor (Rp):</label>
                      <input
                        type="number"
                        value={editAllowance}
                        onChange={(e) => setEditAllowance(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold text-amber-600 dark:text-amber-400"
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1">Tunj. Tepat Waktu (Rp):</label>
                      <input
                        type="number"
                        value={editPunctualityAllowance}
                        onChange={(e) => setEditPunctualityAllowance(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold text-emerald-600 dark:text-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1">Upah Lembur (Rp):</label>
                      <input
                        type="number"
                        value={editOvertimePay}
                        onChange={(e) => setEditOvertimePay(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold text-blue-600 dark:text-blue-400"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-purple-700 dark:text-purple-300 block mb-1">
                        Bonus Outlet ({currentSlip.totalDaysPresent} Hari Hadir) (Rp):
                      </label>
                      <input
                        type="number"
                        value={editOutletBonus}
                        onChange={(e) => setEditOutletBonus(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-purple-300 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-950 font-bold text-purple-700 dark:text-amber-300"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                        Bonus Kinerja / Insentif (Rp):
                      </label>
                      <input
                        type="number"
                        value={editBonus}
                        onChange={(e) => setEditBonus(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold focus:ring-2 focus:ring-emerald-400"
                      />
                    </div>

                    {/* Breakdown Rincian Potongan */}
                    <div className="col-span-1 sm:col-span-2 p-3.5 rounded-xl bg-rose-50/70 dark:bg-purple-950/60 border border-rose-200 dark:border-purple-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-rose-900 dark:text-rose-300">
                          🛑 Rincian Komponen Potongan & Denda Slip:
                        </span>
                        <span className="text-[11px] font-black text-rose-600 dark:text-rose-400">
                          Total Potongan: {formatRupiah(Number(editDeductions))}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="font-bold block text-[10px] text-rose-700 dark:text-rose-300 mb-0.5">
                            Denda Telat (&gt;{latePenaltyThresholdMinutes}m):
                          </label>
                          <input
                            type="number"
                            value={editLatePenalty}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setEditLatePenalty(val);
                              setEditDeductions(val + Number(editLoanDeduction) + Number(editOtherDeductions));
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-purple-800 bg-white dark:bg-purple-950 font-bold text-rose-600 text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-bold block text-[10px] text-purple-700 dark:text-purple-300 mb-0.5">
                            Angsuran Kasbon:
                          </label>
                          <input
                            type="number"
                            value={editLoanDeduction}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setEditLoanDeduction(val);
                              setEditDeductions(Number(editLatePenalty) + val + Number(editOtherDeductions));
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-purple-800 bg-white dark:bg-purple-950 font-bold text-purple-600 text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-bold block text-[10px] text-slate-700 dark:text-slate-300 mb-0.5">
                            Potongan Lainnya:
                          </label>
                          <input
                            type="number"
                            value={editOtherDeductions}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setEditOtherDeductions(val);
                              setEditDeductions(Number(editLatePenalty) + Number(editLoanDeduction) + val);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-purple-800 bg-white dark:bg-purple-950 font-bold text-slate-800 dark:text-slate-200 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Catatan Tambahan Slip:
                    </label>
                    <textarea
                      rows={2}
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      placeholder="Misal: Bonus Capai Target Penjualan + Potongan Kasbon Minggu ke-2"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={syncToEmployeeMaster}
                      onChange={(e) => setSyncToEmployeeMaster(e.target.checked)}
                      className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span>⚡ Sinkronkan juga perubahan tarif ini ke Data Master Karyawan</span>
                  </label>

                  <div className="p-3.5 bg-amber-50 dark:bg-purple-950/80 rounded-xl border border-amber-300 dark:border-purple-800 flex justify-between items-center">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Total Gaji Bersih (Take Home Pay):
                    </span>
                    <span className="font-black text-lg text-purple-950 dark:text-amber-300">
                      {formatRupiah(previewNet > 0 ? previewNet : 0)}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-purple-900">
                    <button
                      type="button"
                      onClick={() => setEditingSlipId(null)}
                      className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePayrollEdit}
                      className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Simpan Penyesuaian
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL PENGATURAN TOLERANSI DENDA TELAT */}
      {showLatePenaltySettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1a0c28] border border-purple-900/50 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-purple-900">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-900 dark:text-amber-300">
                  <Sliders className="w-5 h-5 text-purple-700 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo">
                    Pengaturan Denda Keterlambatan
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Batas toleransi menit keterlambatan penggajian
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLatePenaltySettingsModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-amber-50 dark:bg-purple-950/60 rounded-xl border border-amber-200 dark:border-purple-800 text-[11px] text-amber-900 dark:text-amber-300 space-y-1">
                <span className="font-extrabold block flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Aturan Denda Potongan Telat:
                </span>
                <p className="text-[11px] text-slate-700 dark:text-slate-300">
                  Karyawan hanya akan dikenakan potongan denda jika waktu keterlambatan presensi masuk <strong>melebihi batas menit toleransi</strong> (misal: telat &gt; 30 menit).
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Batas Toleransi Keterlambatan (Menit):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="180"
                    value={latePenaltyThresholdMinutes}
                    onChange={(e) => setLatePenaltyThresholdMinutes(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-extrabold text-sm text-purple-950 dark:text-amber-300"
                  />
                  <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Menit</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Default: 30 menit. Keterlambatan ≤ {latePenaltyThresholdMinutes} menit tidak dikenakan potongan denda.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-purple-900">
                <button
                  type="button"
                  onClick={() => setShowLatePenaltySettingsModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-purple-950 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    saveLatePenaltyThreshold(latePenaltyThresholdMinutes);
                    setShowLatePenaltySettingsModal(false);
                    showToast(`Pengaturan berhasil disimpan! Denda telat berlaku jika telat > ${latePenaltyThresholdMinutes} menit.`);
                  }}
                  className="px-5 py-2 rounded-xl bg-purple-950 text-amber-400 dark:bg-amber-400 dark:text-purple-950 font-extrabold text-xs shadow-lg flex items-center gap-1.5 cursor-pointer hover:bg-purple-900 dark:hover:bg-amber-300"
                >
                  <Save className="w-4 h-4" /> Simpan Pengaturan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ENLARGED WATERMARK SELFIE MODAL */}
      {enlargedSelfie && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-[#12071B] rounded-2xl p-4 border border-amber-400/50 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-purple-900 pb-2">
              <h4 className="font-bold text-sm text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verifikasi Foto Watermark Steak 11
              </h4>
              <button
                type="button"
                onClick={() => setEnlargedSelfie(null)}
                className="w-7 h-7 rounded-full bg-purple-900 text-amber-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={enlargedSelfie}
              alt="Watermarked Selfie Full"
              className="w-full rounded-xl border border-purple-800 shadow-2xl"
            />
            <div className="text-center">
              <button
                type="button"
                onClick={() => setEnlargedSelfie(null)}
                className="px-5 py-2 bg-amber-400 text-purple-950 font-extrabold text-xs rounded-full hover:bg-amber-300 cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT DATA ABSENSI */}
      {showEditAttModal && (
        <div className="fixed inset-0 z-60 bg-purple-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a0c28] border border-purple-900/50 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-purple-900 pb-3">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo">
                  Edit Rekam Absensi Karyawan
                </h3>
              </div>
              <button
                onClick={() => setShowEditAttModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Karyawan
                </label>
                <input
                  type="text"
                  value={attEditEmpName}
                  onChange={(e) => setAttEditEmpName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Tanggal Absen
                  </label>
                  <input
                    type="date"
                    value={attEditDate}
                    onChange={(e) => setAttEditDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Outlet Jaga
                  </label>
                  <select
                    value={attEditOutlet}
                    onChange={(e) => setAttEditOutlet(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-semibold"
                  >
                    {locations.map((l) => (
                      <option key={l.id} value={l.name}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-purple-950/40 border border-slate-200 dark:border-purple-900/60">
                <div>
                  <label className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                    Jam Masuk (Clock In)
                  </label>
                  <input
                    type="text"
                    placeholder="15:00:00"
                    value={attEditClockIn}
                    onChange={(e) => setAttEditClockIn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-white dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Status Jam Masuk
                  </label>
                  <select
                    value={attEditClockInStatus}
                    onChange={(e) => setAttEditClockInStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-white dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                  >
                    <option value="Tepat Waktu">Tepat Waktu</option>
                    <option value="Terlambat Masuk">Terlambat Masuk</option>
                  </select>
                </div>

                {attEditClockInStatus === 'Terlambat Masuk' && (
                  <div className="col-span-2">
                    <label className="font-bold text-amber-600 dark:text-amber-400 block mb-1">
                      Keterlambatan (Menit)
                    </label>
                    <input
                      type="number"
                      value={attEditLateMinutes}
                      onChange={(e) => setAttEditLateMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-purple-950/40 border border-slate-200 dark:border-purple-900/60">
                <div>
                  <label className="font-bold text-amber-600 dark:text-amber-400 block mb-1">
                    Jam Pulang (Clock Out)
                  </label>
                  <input
                    type="text"
                    placeholder="22:00:00"
                    value={attEditClockOut}
                    onChange={(e) => setAttEditClockOut(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-white dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Status Jam Pulang
                  </label>
                  <select
                    value={attEditClockOutStatus}
                    onChange={(e) => setAttEditClockOutStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-white dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                  >
                    <option value="Pulang Tepat Waktu">Pulang Tepat Waktu</option>
                    <option value="Pulang Awal">Pulang Awal</option>
                  </select>
                </div>

                {attEditClockOutStatus === 'Pulang Awal' && (
                  <div className="col-span-2">
                    <label className="font-bold text-rose-600 dark:text-rose-400 block mb-1">
                      Pulang Awal (Menit)
                    </label>
                    <input
                      type="number"
                      value={attEditEarlyOutMinutes}
                      onChange={(e) => setAttEditEarlyOutMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Durasi Kerja (Jam)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={attEditHoursWorked}
                    onChange={(e) => setAttEditHoursWorked(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Status Presensi Shift
                  </label>
                  <select
                    value={attEditStatus}
                    onChange={(e) => setAttEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
                  >
                    <option value="Hadir">Hadir</option>
                    <option value="Terlambat">Terlambat</option>
                    <option value="Izin">Izin</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Alpha">Alpha</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Catatan Shift
                </label>
                <textarea
                  rows={2}
                  value={attEditNotes}
                  onChange={(e) => setAttEditNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-purple-900">
              <button
                type="button"
                onClick={() => setShowEditAttModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEditAttendance}
                className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Simpan Perubahan Absensi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT ADMIN */}
      {showAdminModal && (
        <div className="fixed inset-0 z-60 bg-purple-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1a0c28] border border-purple-900/50 rounded-2xl p-5 sm:p-6 max-w-lg w-full my-auto max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-purple-900 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo">
                  {editingAdminId ? 'Edit Data Admin System' : 'Tambah Admin / Pengelola Baru'}
                </h3>
              </div>
              <button
                onClick={() => setShowAdminModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ID Admin System *
                  </label>
                  <input
                    type="text"
                    value={adminIdInput}
                    onChange={(e) => setAdminIdInput(e.target.value)}
                    placeholder="Contoh: adm-1001"
                    className="w-full px-3 py-2 rounded-xl border border-amber-400 dark:border-purple-800 bg-amber-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-mono font-extrabold"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">ID unik pengelola (dapat diedit).</span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Username Login *
                  </label>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="Contoh: kasir_tebet"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Lengkap Admin *
                </label>
                <input
                  type="text"
                  value={adminFullName}
                  onChange={(e) => setAdminFullName(e.target.value)}
                  placeholder="Contoh: Rian Pratama"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-extrabold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Role / Jabatan
                  </label>
                  <select
                    value={adminRole}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      setAdminRole(newRole);
                      const matched = roleSettings.find((r) => r.name.toLowerCase() === newRole.toLowerCase());
                      if (matched && matched.allowedTabs && matched.allowedTabs.length > 0) {
                        setAdminAllowedTabs(matched.allowedTabs);
                        showToast(`Akses menu disesuaikan dari Role "${matched.name}"`);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
                  >
                    {roleSettings
                      .filter((r) => r.targetType === 'admin' || r.targetType === 'both')
                      .map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name} ({r.allowedTabs.length} Menu)
                        </option>
                      ))}
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin Kasir">Admin Kasir</option>
                    <option value="Manager Outlet">Manager Outlet</option>
                    <option value="Admin Operasional">Admin Operasional</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    PIN / Password Access *
                  </label>
                  <input
                    type="text"
                    value={adminPasswordPin}
                    onChange={(e) => setAdminPasswordPin(e.target.value)}
                    placeholder="1234"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="text"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    placeholder="0812..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Status Akun
                  </label>
                  <select
                    value={adminStatus}
                    onChange={(e) => setAdminStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Non-Aktif">Non-Aktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Email (Opsional)
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@steak11.id"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* RBAC Menu Permission Section for Admins */}
              <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="font-extrabold text-xs text-[#3D1259] dark:text-amber-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    Hak Akses Menu Admin ({(adminAllowedTabs || []).length} Menu Terpilih)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAdminAllowedTabs(['dashboard', 'kasir', 'pesanan', 'analytics', 'menu', 'racik', 'inventory', 'reviews', 'promos', 'karyawan', 'absensi', 'penggajian', 'shifts', 'outlets', 'admin', 'wa', 'branding', 'system', 'payment_receipt_settings', 'audit_logs'])}
                      className="px-2 py-0.5 rounded bg-amber-400 text-purple-950 font-black text-[10px] cursor-pointer hover:bg-amber-300"
                    >
                      Super Admin (Semua)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminAllowedTabs(['dashboard', 'kasir', 'pesanan', 'inventory', 'reviews', 'shifts', 'absensi'])}
                      className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] cursor-pointer"
                    >
                      Kasir
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminAllowedTabs(['dashboard', 'kasir', 'pesanan', 'analytics', 'menu', 'racik', 'inventory', 'reviews', 'promos', 'karyawan', 'absensi', 'penggajian', 'shifts', 'outlets'])}
                      className="px-2 py-0.5 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-700 dark:text-purple-300 font-bold text-[10px] cursor-pointer"
                    >
                      Manager
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-56 overflow-y-auto overscroll-contain p-1.5 text-[11px] rounded-lg bg-white/40 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-800/50">
                {SYSTEM_ALL_TABS.map((tab) => {
                    const isChecked = adminAllowedTabs.includes(tab.id);
                    return (
                      <label
                        key={tab.id}
                        className={`flex items-center gap-1.5 p-1.5 rounded-lg border cursor-pointer select-none transition-all ${
                          isChecked
                            ? 'bg-amber-400/20 border-amber-400 text-purple-950 dark:text-amber-300 font-bold'
                            : 'bg-white/50 dark:bg-purple-900/30 border-slate-200 dark:border-purple-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAdminAllowedTabs([...adminAllowedTabs, tab.id]);
                            } else {
                              setAdminAllowedTabs(adminAllowedTabs.filter((t) => t !== tab.id));
                            }
                          }}
                          className="rounded accent-amber-500 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span className="truncate">{tab.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-purple-900">
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveAdmin}
                className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Simpan Data Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT MASTER ROLE & HAK AKSES MENU */}
      {showRoleModal && (
        <div className="fixed inset-0 z-60 bg-purple-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1a0c28] border border-purple-900/50 rounded-2xl p-5 sm:p-6 max-w-lg w-full my-auto max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-purple-900 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo">
                  {editingRoleId ? 'Edit Master Role & Hak Akses' : 'Tambah Master Role / Jabatan Baru'}
                </h3>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Role / Jabatan *
                </label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="Contoh: Supervisor Kasir, Chef Utama, Admin Finance"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-extrabold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Pengguna
                </label>
                <select
                  value={roleTargetType}
                  onChange={(e) => setRoleTargetType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
                >
                  <option value="both">Dapat Digunakan Admin & Karyawan</option>
                  <option value="admin">Khusus Akun Admin System</option>
                  <option value="employee">Khusus Karyawan Outlet</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Deskripsi Peran / Tugas
                </label>
                <textarea
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="Jelaskan secara singkat wewenang dan cakupan peran ini..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Checkbox Grid Menu Access */}
              <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="font-extrabold text-xs text-[#3D1259] dark:text-amber-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    Hak Akses Menu Default ({(roleAllowedTabs || []).length} Terpilih)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setRoleAllowedTabs(['dashboard', 'kasir', 'pesanan', 'analytics', 'menu', 'racik', 'inventory', 'reviews', 'promos', 'karyawan', 'absensi', 'penggajian', 'shifts', 'outlets', 'admin', 'wa', 'branding', 'system', 'payment_receipt_settings', 'audit_logs'])}
                      className="px-2 py-0.5 rounded bg-amber-400 text-purple-950 font-black text-[10px] cursor-pointer hover:bg-amber-300"
                    >
                      Pilih Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoleAllowedTabs(['kasir', 'pesanan', 'inventory', 'reviews', 'shifts', 'absensi'])}
                      className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] cursor-pointer"
                    >
                      Kasir POS
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoleAllowedTabs(['kasir', 'pesanan', 'menu', 'racik', 'inventory', 'absensi'])}
                      className="px-2 py-0.5 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-700 dark:text-purple-300 font-bold text-[10px] cursor-pointer"
                    >
                      Dapur & Stok
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-56 overflow-y-auto overscroll-contain p-1.5 text-[11px] rounded-lg bg-white/40 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-800/50">
                {SYSTEM_ALL_TABS.map((tab) => {
                    const isChecked = roleAllowedTabs.includes(tab.id);
                    return (
                      <label
                        key={tab.id}
                        className={`flex items-center gap-1.5 p-1.5 rounded-lg border cursor-pointer select-none transition-all ${
                          isChecked
                            ? 'bg-amber-400/20 border-amber-400 text-purple-950 dark:text-amber-300 font-bold'
                            : 'bg-white/50 dark:bg-purple-900/30 border-slate-200 dark:border-purple-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRoleAllowedTabs([...roleAllowedTabs, tab.id]);
                            } else {
                              setRoleAllowedTabs(roleAllowedTabs.filter((t) => t !== tab.id));
                            }
                          }}
                          className="rounded accent-amber-500 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span className="truncate">{tab.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-purple-900">
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveRole}
                className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Simpan Master Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT MENU */}
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

      {/* MODAL EDIT/ADD RACIK STEAK OPTION */}
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

      {/* MODAL INVENTORY */}
      {showInventoryModal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#180B24] rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-purple-900/60 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-purple-900 pb-3">
              <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                <Boxes className="w-5 h-5 text-amber-500" />
                {editingInvId ? 'Edit Stok Bahan Baku' : 'Tambah Bahan Baku Dapur'}
              </h3>
              <button
                type="button"
                onClick={() => setShowInventoryModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                  Nama Bahan Baku / Barang
                </label>
                <input
                  type="text"
                  value={invName}
                  onChange={(e) => setInvName(e.target.value)}
                  placeholder="Misal: Fillet Ayam Paha Boneless"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                    Kategori
                  </label>
                  <select
                    value={invCategory}
                    onChange={(e) => setInvCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100"
                  >
                    <option value="Daging Ayam">Daging Ayam</option>
                    <option value="Bumbu & Saus">Bumbu & Saus</option>
                    <option value="Sayuran & Karbo">Sayuran & Karbo</option>
                    <option value="Kemasan & Plastik">Kemasan & Plastik</option>
                  </select>
                </div>
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                    Satuan (Unit)
                  </label>
                  <input
                    type="text"
                    value={invUnit}
                    onChange={(e) => setInvUnit(e.target.value)}
                    placeholder="Kg, Liter, Pcs, Cup"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                    Stok Saat Ini
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={invStock}
                    onChange={(e) => setInvStock(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                    Batas Min. Alert
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={invMinStock}
                    onChange={(e) => setInvMinStock(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                    Harga Beli / Satuan (Rp)
                  </label>
                  <input
                    type="number"
                    value={invUnitPrice}
                    onChange={(e) => setInvUnitPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                    Outlet Penyimpanan
                  </label>
                  <select
                    value={invOutlet}
                    onChange={(e) => setInvOutlet(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100"
                  >
                    <option value="Semua Outlet">Semua Outlet</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-purple-900">
              <button
                type="button"
                onClick={() => setShowInventoryModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveInventory}
                className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Simpan Bahan Baku
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PROMO */}
      {showPromoModal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#180B24] rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-purple-900/60 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-purple-900 pb-3">
              <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                <Percent className="w-5 h-5 text-rose-500" />
                {editingPromoId ? 'Edit Kode Promo' : 'Terbitkan Promo / Voucher Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowPromoModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                  Kode Promo / Voucher (Kapital)
                </label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="MYTHIC11"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-black tracking-wider text-purple-900 dark:text-amber-400 text-sm"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                  Deskripsi Singkat Promo
                </label>
                <input
                  type="text"
                  value={promoDesc}
                  onChange={(e) => setPromoDesc(e.target.value)}
                  placeholder="Diskon Rp 5.000 untuk minimal transaksi Rp 30.000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                    Tipe Diskon
                  </label>
                  <select
                    value={promoDiscountType}
                    onChange={(e) => setPromoDiscountType(e.target.value as 'percentage' | 'nominal')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100"
                  >
                    <option value="nominal">Nominal Rp (Rupiah)</option>
                    <option value="percentage">Persentase %</option>
                  </select>
                </div>
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                    Nilai Diskon ({promoDiscountType === 'nominal' ? 'Rp' : '%'})
                  </label>
                  <input
                    type="number"
                    value={promoDiscountValue}
                    onChange={(e) => setPromoDiscountValue(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                    Min. Belanja (Rp)
                  </label>
                  <input
                    type="number"
                    value={promoMinOrder}
                    onChange={(e) => setPromoMinOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                    Masa Berlaku
                  </label>
                  <input
                    type="date"
                    value={promoExpiry}
                    onChange={(e) => setPromoExpiry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-purple-900">
              <button
                type="button"
                onClick={() => setShowPromoModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSavePromo}
                className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Simpan Promo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SHIFT CASH OPNAME */}
      {showShiftModal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#180B24] rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-purple-900/60 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-purple-900 pb-3">
              <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-500" />
                Form Closing Shift Kasir & Cash Opname
              </h3>
              <button
                type="button"
                onClick={() => setShowShiftModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                    Nama Petugas Kasir
                  </label>
                  <input
                    type="text"
                    value={shiftCashier}
                    onChange={(e) => setShiftCashier(e.target.value)}
                    placeholder="Rina Kurnia"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                    Outlet
                  </label>
                  <select
                    value={shiftOutlet}
                    onChange={(e) => setShiftOutlet(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                    Modal Kas Awal Shift (Rp)
                  </label>
                  <input
                    type="number"
                    value={shiftStartingCash}
                    onChange={(e) => setShiftStartingCash(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                    Nama Shift
                  </label>
                  <input
                    type="text"
                    value={shiftName}
                    onChange={(e) => setShiftName(e.target.value)}
                    placeholder="Shift Malam (15.00 - 22.00)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-purple-950/60 border border-slate-200 dark:border-purple-900 space-y-2">
                <h4 className="font-extrabold text-purple-950 dark:text-amber-400">Rincian Penjualan Shift Ini:</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block">Omset Tunai (Cash)</label>
                    <input
                      type="number"
                      value={shiftCashRev}
                      onChange={(e) => setShiftCashRev(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-purple-900 bg-white dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block">Non-Tunai (QRIS)</label>
                    <input
                      type="number"
                      value={shiftQrisRev}
                      onChange={(e) => setShiftQrisRev(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-purple-900 bg-white dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block">Transfer / EDC</label>
                    <input
                      type="number"
                      value={shiftTransferRev}
                      onChange={(e) => setShiftTransferRev(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-purple-900 bg-white dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                    Fisik Uang Tunai Laci (Rp)
                  </label>
                  <input
                    type="number"
                    value={shiftActualCash}
                    onChange={(e) => setShiftActualCash(parseInt(e.target.value) || 0)}
                    placeholder="200k modal + tunai"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-amber-50 dark:bg-amber-950/40 font-black text-amber-700 dark:text-amber-300"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                    Hitungan Sistem (Modal+Tunai)
                  </label>
                  <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-purple-950 font-black text-slate-700 dark:text-slate-200">
                    {formatRupiah(Number(shiftStartingCash) + Number(shiftCashRev))}
                  </div>
                </div>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                  Catatan Serah Terima / Keterangan
                </label>
                <input
                  type="text"
                  value={shiftNotes}
                  onChange={(e) => setShiftNotes(e.target.value)}
                  placeholder="Kondisi kasir aman..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-purple-900">
              <button
                type="button"
                onClick={() => setShowShiftModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveShift}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-extrabold text-xs hover:bg-emerald-600 shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Simpan & Tutup Shift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MENU CATEGORY MANAGEMENT MODAL */}
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
                    {cat.id !== 'signature' && cat.id !== 'addon' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (checkReadOnlyPermission()) return;

                          const updatedCats = menuCategories.filter((c) => c.id !== cat.id);
                          setMenuCategories(updatedCats);
                          saveMenuCategories(updatedCats);

                          // Reassign any menu items belonging to the deleted category to signature category
                          const currentItems = menuItems.length > 0 ? menuItems : getStoredMenuItems();
                          const updatedMenuItems = currentItems.map((item) => {
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

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C0D2B] rounded-2xl p-6 max-w-md w-full border border-red-500/30 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-3 bg-red-100 dark:bg-red-950/80 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  {deleteConfirmTarget.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {deleteConfirmTarget.description}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-purple-950/50 p-3 rounded-xl border border-slate-200 dark:border-purple-900">
              Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin melanjutkan?
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
                onClick={executeDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-extrabold text-xs hover:bg-red-700 shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ORDER MODAL */}
      {showEditOrderModal && editingOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C0D2B] rounded-3xl p-6 max-w-xl w-full border border-purple-900/50 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-purple-900/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-400 text-purple-950 font-black">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo">
                    Edit Data Pesanan #{editingOrder.id}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Perbarui rincian transaksi, pelanggan, status, dan total tagihan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEditOrderModal(false);
                  setEditingOrder(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedOrder} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Nama Pelanggan */}
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                    Nama Pelanggan
                  </label>
                  <input
                    type="text"
                    required
                    value={editCustomerName}
                    onChange={(e) => setEditCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-900 dark:text-slate-100 font-semibold"
                  />
                </div>

                {/* Nomor Telepon */}
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                    Nomor WhatsApp / Telp
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-900 dark:text-slate-100 font-semibold"
                  />
                </div>

                {/* Outlet */}
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                    Outlet Transaksi
                  </label>
                  <select
                    value={editOutlet}
                    onChange={(e) => setEditOutlet(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-900 dark:text-slate-100 font-bold"
                  >
                    {availableOutlets.map((out) => (
                      <option key={out} value={out}>
                        {out}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipe Layanan */}
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                    Tipe Layanan
                  </label>
                  <select
                    value={editServiceType}
                    onChange={(e) => setEditServiceType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-900 dark:text-slate-100 font-bold"
                  >
                    <option value="Dine In">Dine In (Makan di Tempat)</option>
                    <option value="Takeaway">Takeaway (Bungkus)</option>
                    <option value="Delivery">Delivery (Pesan Antar)</option>
                    <option value="Catering / Katering">Catering / Katering</option>
                  </select>
                </div>

                {/* Metode Pembayaran */}
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                    Metode Pembayaran
                  </label>
                  <select
                    value={editPaymentMethod}
                    onChange={(e) => setEditPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-900 dark:text-slate-100 font-bold"
                  >
                    <option value="Cash">Cash / Tunai</option>
                    <option value="QRIS">QRIS Standar</option>
                    <option value="Transfer BCA">Transfer BCA</option>
                    <option value="Transfer Mandiri">Transfer Mandiri</option>
                    <option value="ShopeePay">ShopeePay</option>
                    <option value="GoPay">GoPay</option>
                    <option value="OVO">OVO</option>
                  </select>
                </div>

                {/* Nama Kasir */}
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                    Nama Kasir POS
                  </label>
                  <input
                    type="text"
                    value={editCashierName}
                    onChange={(e) => setEditCashierName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-900 dark:text-slate-100 font-semibold"
                  />
                </div>

                {/* Status Transaksi */}
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                    Status Pesanan
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-900 dark:text-slate-100 font-extrabold"
                  >
                    <option value="Pending">Pending (Menunggu)</option>
                    <option value="Terkirim/Diproses">Terkirim / Diproses</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>

                {/* Total Tagihan */}
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                    Total Tagihan (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={editTotal}
                    onChange={(e) => setEditTotal(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-purple-700 bg-amber-50 dark:bg-purple-950 text-amber-700 dark:text-amber-300 font-black"
                  />
                </div>
              </div>

              {/* Items Summary */}
              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                  Rincian Item Pesanan
                </label>
                <textarea
                  rows={2}
                  value={editItemsSummary}
                  onChange={(e) => setEditItemsSummary(e.target.value)}
                  placeholder="2x Steak Ayam Crispy, 1x Es Teh Sweet..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              {/* Catatan / Alamat */}
              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                  Catatan / Alamat Kirim
                </label>
                <input
                  type="text"
                  value={editAddressOrNotes}
                  onChange={(e) => setEditAddressOrNotes(e.target.value)}
                  placeholder="Nomor meja, tanpa cabai, dsb."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-purple-900">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditOrderModal(false);
                    setEditingOrder(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-300 dark:hover:bg-purple-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-black text-xs hover:bg-amber-300 shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* THERMAL RECEIPT MODAL (58mm / 80mm Bluetooth Printer) */}
      {showReceiptModal && (
        <ThermalReceiptModal
          isOpen={showReceiptModal}
          order={receiptOrder}
          onClose={() => {
            setShowReceiptModal(false);
            setReceiptOrder(null);
          }}
        />
      )}

      {/* POS ITEM CUSTOMIZATION MODAL */}
      {customizingItem && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C0D2B] rounded-3xl p-6 max-w-md w-full border border-purple-900/50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-purple-900/50">
              <h3 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-400 font-baloo">
                Kustomisasi {customizingItem.name}
              </h3>
              <button
                onClick={() => setCustomizingItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase mb-1 block">Pilih Varian Saus Gourmet</label>
              <div className="grid grid-cols-2 gap-2">
                {(sauceOptions || []).map((s) => (
                  <button
                    key={s.name}
                    onClick={() => setPosSelectedSauce(s.name)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                      posSelectedSauce === s.name
                        ? 'border-amber-400 bg-amber-50 dark:bg-purple-900/80 text-[#3D1259] dark:text-amber-300'
                        : 'border-slate-200 dark:border-purple-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>{s.name}</div>
                    {s.priceAdjustment > 0 && (
                      <div className="text-[9px] text-amber-600 dark:text-amber-400">
                        +{formatRupiah(s.priceAdjustment)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase mb-1 block">Potongan Daging Ayam</label>
              <div className="space-y-1.5">
                {(chickenOptions || []).map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setPosSelectedChicken(c.name)}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex justify-between items-center ${
                      posSelectedChicken === c.name
                        ? 'border-amber-400 bg-amber-50 dark:bg-purple-900/80 text-[#3D1259] dark:text-amber-300'
                        : 'border-slate-200 dark:border-purple-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{c.name}</span>
                    {c.priceAdjustment > 0 && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400">
                        +{formatRupiah(c.priceAdjustment)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Jumlah Porsi:</span>
              <div className="flex items-center gap-3 bg-slate-100 dark:bg-purple-950 p-1 rounded-xl">
                <button
                  onClick={() => setPosItemQty(Math.max(1, posItemQty - 1))}
                  className="w-7 h-7 rounded-lg bg-white dark:bg-purple-900 font-black text-xs cursor-pointer"
                >
                  -
                </button>
                <span className="font-black text-xs px-2">{posItemQty}</span>
                <button
                  onClick={() => setPosItemQty(posItemQty + 1)}
                  className="w-7 h-7 rounded-lg bg-white dark:bg-purple-900 font-black text-xs cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleConfirmCustomizePosItem}
              className="w-full py-3 rounded-2xl bg-amber-400 text-purple-950 font-black text-xs hover:bg-amber-300 transition-all cursor-pointer shadow-md"
            >
              Simpan & Masukkan Keranjang Kasir
            </button>
          </div>
        </div>
      )}

      {/* ADD/EDIT REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C0D2B] rounded-3xl p-6 max-w-md w-full border border-purple-900/50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-purple-900/50">
              <h3 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-400 font-baloo">
                {editingReviewId ? 'Edit Testimoni Pelanggan' : 'Tambah Testimoni Baru'}
              </h3>
              <button onClick={() => setShowReviewModal(false)} className="p-1 text-slate-400 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Pelanggan</label>
                <input
                  type="text"
                  value={revName}
                  onChange={(e) => setRevName(e.target.value)}
                  placeholder="Misal: Budi Santoso"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Role / Status</label>
                  <input
                    type="text"
                    value={revRole}
                    onChange={(e) => setRevRole(e.target.value)}
                    placeholder="Misal: Pelanggan Setia"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Menu Favorit</label>
                  <select
                    value={revFavoriteDish}
                    onChange={(e) => setRevFavoriteDish(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-semibold"
                  >
                    {(menuItems || []).map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                    <option value="Creamy Garlic Herb Steak">Creamy Garlic Herb Steak</option>
                    <option value="Spicy Mythic Black Pepper Steak">Spicy Mythic Black Pepper Steak</option>
                    <option value="Smoky Legend BBQ Steak">Smoky Legend BBQ Steak</option>
                    <option value="Steak Ayam 11 Rempah">Steak Ayam 11 Rempah</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Outlet / Cabang</label>
                <select
                  value={revOutlet}
                  onChange={(e) => setRevOutlet(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-semibold"
                >
                  {(locations || []).map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                  <option value="Steak 11, Cibubur">Steak 11, Cibubur</option>
                  <option value="Steak 11, Kalisari">Steak 11, Kalisari</option>
                  <option value="Steak 11, Kuningan">Steak 11, Kuningan</option>
                  <option value="Steak 11, Cilangkap">Steak 11, Cilangkap</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Isi Ulasan & Testimoni</label>
                <textarea
                  value={revComment}
                  onChange={(e) => setRevComment(e.target.value)}
                  rows={3}
                  placeholder="Isi ulasan kepuasan rasa steak, saus, dan pelayanan..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Rating Bintang</label>
                  <select
                    value={revRating}
                    onChange={(e) => setRevRating(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Star)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Star)</option>
                    <option value={3}>⭐⭐⭐ (3 Star)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Status Publikasi</label>
                  <select
                    value={revStatus}
                    onChange={(e) => setRevStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
                  >
                    <option value="Disetujui">Disetujui (Landing Page)</option>
                    <option value="Pending">Pending</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveReview}
              className="w-full py-2.5 rounded-xl bg-amber-400 text-purple-950 font-black text-xs hover:bg-amber-300 transition-all shadow-md cursor-pointer"
            >
              Simpan Ulasan
            </button>
          </div>
        </div>
      )}

      {/* MODAL ASSIGN / EDIT JADWAL SHIFT KARYAWAN */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-purple-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-[#1a0c28] text-slate-800 dark:text-slate-100 rounded-2xl p-6 shadow-2xl border border-purple-900/50 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-purple-900 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo">
                  Atur Penugasan Shift Karyawan
                </h3>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">Pilih Karyawan:</label>
                <select
                  value={schEmployeeId}
                  onChange={(e) => setSchEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role} - {emp.outlet})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Tanggal Shift:</label>
                <input
                  type="date"
                  value={schDate}
                  onChange={(e) => setSchDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Pilih Shift / Status Work:</label>
                <select
                  value={schShiftId}
                  onChange={(e) => setSchShiftId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold"
                >
                  {shiftTemplates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.isOff ? 'OFF / Libur' : `${tpl.startTime} - ${tpl.endTime}`})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Catatan Tambahan (Opsional):</label>
                <input
                  type="text"
                  value={schNotes}
                  onChange={(e) => setSchNotes(e.target.value)}
                  placeholder="Misal: Tukar shift dengan Budi / Tugas Dapur Pagi"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-purple-900">
                {editingScheduleId ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteSchedule(editingScheduleId)}
                    className="px-3 py-2 rounded-xl bg-rose-100 text-rose-700 font-bold text-xs hover:bg-rose-200 cursor-pointer"
                  >
                    Hapus
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSchedule}
                    className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md cursor-pointer"
                  >
                    Simpan Shift
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PENGATURAN MASTER SHIFT TEMPLATES */}
      {showShiftTemplateModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-purple-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md max-h-[85vh] overflow-y-auto bg-white dark:bg-[#1a0c28] text-slate-800 dark:text-slate-100 rounded-2xl p-6 shadow-2xl border border-purple-900/50 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-purple-900 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo">
                  Kelola Master Jam Shift Kerja
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowShiftTemplateModal(false);
                  handleOpenAddShiftTemplate();
                }}
                className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold block text-slate-700 dark:text-slate-300">Daftar Master Shift saat ini:</span>
                  <button
                    type="button"
                    onClick={handleOpenAddShiftTemplate}
                    className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Tambah Baru
                  </button>
                </div>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {shiftTemplates.map((tpl) => (
                    <div key={tpl.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/60 border border-slate-200 dark:border-purple-800 flex justify-between items-center gap-2">
                      <div className="overflow-hidden">
                        <span className="font-bold block text-slate-800 dark:text-slate-200 truncate">{tpl.name}</span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {tpl.isOff ? 'Hari Libur Karyawan' : `${tpl.startTime} s/d ${tpl.endTime}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditShiftTemplate(tpl)}
                          className="p-1 rounded bg-slate-200 dark:bg-purple-900 text-slate-700 dark:text-slate-200 hover:bg-amber-400 hover:text-purple-950 transition-all cursor-pointer"
                          title="Edit Master Shift Ini"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteShiftTemplate(tpl.id)}
                          className="p-1 rounded bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                          title="Hapus Master Shift"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-purple-950/40 rounded-xl border border-amber-300 dark:border-purple-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold block text-amber-900 dark:text-amber-300">
                    {editingShiftTplId ? '✏️ Edit Master Shift:' : '➕ Tambah Master Shift Baru:'}
                  </span>
                  {editingShiftTplId && (
                    <button
                      type="button"
                      onClick={handleOpenAddShiftTemplate}
                      className="text-[10px] text-slate-500 underline font-bold cursor-pointer"
                    >
                      Batal Edit
                    </button>
                  )}
                </div>

                <div>
                  <label className="font-bold block mb-1">Nama Shift:</label>
                  <input
                    type="text"
                    value={shiftTplName}
                    onChange={(e) => setShiftTplName(e.target.value)}
                    placeholder="Misal: Shift Pagi Dapur, Shift Malam Kasir, OFF"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-white dark:bg-purple-950 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold block mb-1">Jam Masuk:</label>
                    <input
                      type="time"
                      value={shiftTplStart}
                      onChange={(e) => setShiftTplStart(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-white dark:bg-purple-950 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Jam Pulang:</label>
                    <input
                      type="time"
                      value={shiftTplEnd}
                      onChange={(e) => setShiftTplEnd(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-white dark:bg-purple-950 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold block mb-1">Pilih Warna Badge Shift:</label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { name: 'emerald', label: 'Emerald', bg: 'bg-emerald-500' },
                      { name: 'blue', label: 'Biru', bg: 'bg-blue-500' },
                      { name: 'purple', label: 'Ungu', bg: 'bg-purple-500' },
                      { name: 'amber', label: 'Amber', bg: 'bg-amber-500' },
                      { name: 'rose', label: 'Rose', bg: 'bg-rose-500' },
                      { name: 'teal', label: 'Teal', bg: 'bg-teal-500' },
                      { name: 'orange', label: 'Oranye', bg: 'bg-orange-500' },
                      { name: 'slate', label: 'Slate', bg: 'bg-slate-500' },
                    ].map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setShiftTplColor(c.name)}
                        className={`px-2 py-1 rounded-xl text-[10px] font-extrabold border flex items-center gap-1 cursor-pointer transition-all ${
                          shiftTplColor === c.name
                            ? 'ring-2 ring-amber-400 bg-slate-900 text-amber-300 dark:bg-purple-900 border-amber-400'
                            : 'bg-white dark:bg-purple-950 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-purple-800'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${c.bg}`} />
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-purple-950 border border-slate-300 dark:border-purple-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-purple-900/50 transition-all">
                  <input
                    type="checkbox"
                    checked={shiftTplIsOff}
                    onChange={(e) => setShiftTplIsOff(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400 cursor-pointer accent-amber-400"
                  />
                  <div>
                    <span className="font-extrabold text-xs block text-slate-800 dark:text-slate-200">
                      Tandai sebagai Hari Libur / OFF (Karyawan Bebas Tugas)
                    </span>
                    <span className="text-[10px] text-slate-400 block font-normal">
                      Karyawan yang mendapatkan shift ini tidak diwajibkan melakukan presensi kerja harian.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-purple-900">
                <button
                  type="button"
                  onClick={() => {
                    setShowShiftTemplateModal(false);
                    handleOpenAddShiftTemplate();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleSaveShiftTemplate}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md cursor-pointer"
                >
                  {editingShiftTplId ? 'Simpan Perubahan Shift' : 'Tambah Shift Baru'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RIWAYAT KASBON LEDGER KARYAWAN */}
      {showLoanLedgerModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-purple-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1a0c28] text-slate-800 dark:text-slate-100 rounded-2xl p-6 shadow-2xl border border-purple-900/50 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-purple-900 pb-3">
              <div className="flex items-center gap-2">
                <Banknote className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo">
                    Riwayat & Potongan Kasbon Berkelanjutan (Employee Loan Ledger)
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pencatatan saldo pinjaman, potongan otomatis gaji bulanan, dan histori pelunasan karyawan Steak 11.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLoanLedgerModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metric Overview Cards */}
            {(() => {
              const totalActiveLoanAmount = employeeLoans.filter((l) => l.status === 'ACTIVE').reduce((a, b) => a + b.remainingAmount, 0);
              const countActiveLoans = employeeLoans.filter((l) => l.status === 'ACTIVE').length;
              const countPaidOffLoans = employeeLoans.filter((l) => l.status === 'PAID_OFF').length;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800">
                    <span className="font-bold text-slate-500 dark:text-slate-400 block mb-0.5">Total Sisa Kasbon Aktif</span>
                    <p className="text-lg font-black text-purple-900 dark:text-amber-300">{formatRupiah(totalActiveLoanAmount)}</p>
                    <span className="text-[10px] text-slate-400">{countActiveLoans} Karyawan Memiliki Pinjaman</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    <span className="font-bold text-slate-500 dark:text-slate-400 block mb-0.5">Status Pinjaman Lunas</span>
                    <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{countPaidOffLoans} Pinjaman</p>
                    <span className="text-[10px] text-slate-400">Kasbon Telah Lunas Terbayar</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-amber-900 dark:text-amber-300 block mb-0.5">Tambah Pinjaman</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Catat Kasbon Karyawan Baru</span>
                    </div>
                    <button
                      onClick={() => handleOpenAddLoan()}
                      className="px-3 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" /> Kasbon Baru
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Loan Table */}
            <div className="bg-slate-50 dark:bg-purple-950/40 rounded-xl border border-slate-200 dark:border-purple-800 overflow-hidden text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-purple-900/60 text-slate-700 dark:text-amber-300 font-bold border-b border-slate-200 dark:border-purple-800 text-[11px]">
                      <th className="p-3">Karyawan & Outlet</th>
                      <th className="p-3">Tgl Pinjam & Catatan</th>
                      <th className="p-3">Total Pinjaman</th>
                      <th className="p-3">Potongan / Bln</th>
                      <th className="p-3">Sisa Kasbon & Progress</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center">Aksi Pelunasan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-purple-900/40">
                    {employeeLoans.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400">
                          Belum ada riwayat pinjaman kasbon karyawan.
                        </td>
                      </tr>
                    ) : (
                      employeeLoans.map((loan) => {
                        const paidAmount = loan.totalAmount - loan.remainingAmount;
                        const pctPaid = loan.totalAmount > 0 ? Math.round((paidAmount / loan.totalAmount) * 100) : 0;

                        return (
                          <tr key={loan.id} className="hover:bg-white dark:hover:bg-purple-900/30 transition-colors">
                            <td className="p-3 align-top">
                              <span className="font-extrabold text-slate-900 dark:text-amber-300 block">{loan.employeeName}</span>
                              <span className="text-[10px] text-slate-500">{loan.outlet}</span>
                            </td>
                            <td className="p-3 align-top">
                              <span className="font-bold text-slate-700 dark:text-slate-300 block">{loan.date}</span>
                              <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">{loan.notes || '-'}</span>
                            </td>
                            <td className="p-3 align-top font-bold text-slate-900 dark:text-slate-100">
                              {formatRupiah(loan.totalAmount)}
                            </td>
                            <td className="p-3 align-top font-bold text-purple-600 dark:text-purple-400">
                              {formatRupiah(loan.monthlyInstallment)} / bln
                            </td>
                            <td className="p-3 align-top space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-rose-600 dark:text-rose-400">Sisa: {formatRupiah(loan.remainingAmount)}</span>
                                <span className="text-emerald-600 dark:text-emerald-400">{pctPaid}% Lunas</span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-purple-900 h-2 rounded-full overflow-hidden">
                                <div style={{ width: `${pctPaid}%` }} className="bg-emerald-500 h-full transition-all" />
                              </div>
                            </td>
                            <td className="p-3 align-top text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                loan.status === 'ACTIVE'
                                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                                  : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                              }`}>
                                {loan.status === 'ACTIVE' ? 'Aktif Berjalan' : 'LUNAS'}
                              </span>
                            </td>
                            <td className="p-3 align-top text-center">
                              <div className="flex items-center justify-center gap-1 flex-wrap">
                                {loan.status === 'ACTIVE' && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenManualPaymentModal(loan)}
                                    className="px-2 py-1 rounded bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 cursor-pointer"
                                    title="Bayar Cicilan / Pelunasan Manual"
                                  >
                                    Bayar / Cicil
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleEditLoan(loan)}
                                  className="p-1 rounded bg-slate-200 dark:bg-purple-900 text-slate-700 dark:text-slate-200 hover:bg-amber-400 hover:text-purple-950 cursor-pointer"
                                  title="Edit Data Kasbon"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLoan(loan.id)}
                                  className="p-1 rounded bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white cursor-pointer"
                                  title="Hapus Record Kasbon"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 dark:border-purple-900 pt-3">
              <button
                onClick={() => setShowLoanLedgerModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Tutup Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CATAT / EDIT PINJAMAN KASBON */}
      {showLoanModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-purple-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-[#1a0c28] text-slate-800 dark:text-slate-100 rounded-2xl p-6 shadow-2xl border border-purple-900/50 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-purple-900 pb-3">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo">
                  {editingLoanId ? '✏️ Edit Pinjaman Kasbon' : '➕ Catat Pinjaman Kasbon Baru'}
                </h3>
              </div>
              <button onClick={() => setShowLoanModal(false)} className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold block mb-1">Pilih Karyawan:</label>
                <select
                  value={loanEmployeeId}
                  onChange={(e) => setLoanEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role} - {emp.outlet})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Tanggal Pinjaman:</label>
                <input
                  type="date"
                  value={loanDate}
                  onChange={(e) => setLoanDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Total Nominal Kasbon (Rp):</label>
                  <input
                    type="number"
                    value={loanTotalAmount}
                    onChange={(e) => setLoanTotalAmount(Number(e.target.value))}
                    step={50000}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-white dark:bg-purple-950 font-bold text-amber-600"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Potongan per Bulan (Rp):</label>
                  <input
                    type="number"
                    value={loanMonthlyInstallment}
                    onChange={(e) => setLoanMonthlyInstallment(Number(e.target.value))}
                    step={25000}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-white dark:bg-purple-950 font-bold text-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Keperluan / Catatan Pinjaman:</label>
                <input
                  type="text"
                  value={loanNotes}
                  onChange={(e) => setLoanNotes(e.target.value)}
                  placeholder="Misal: Biaya mendesak servis motor, perbaikan rumah"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-purple-900">
              <button
                type="button"
                onClick={() => setShowLoanModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveLoan}
                className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold hover:bg-amber-300 shadow-md cursor-pointer"
              >
                Simpan Pinjaman Kasbon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PELUNASAN / BAYAR MANUAL KASBON */}
      {showManualPaymentModal && selectedLoanForHistory && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-purple-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-[#1a0c28] text-slate-800 dark:text-slate-100 rounded-2xl p-6 shadow-2xl border border-purple-900/50 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-purple-900 pb-3">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo">
                  Bayar / Cicil Kasbon Karyawan
                </h3>
              </div>
              <button onClick={() => setShowManualPaymentModal(false)} className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-purple-950/50 border border-amber-200 dark:border-purple-800 space-y-1">
              <span className="font-bold text-amber-900 dark:text-amber-300 block">{selectedLoanForHistory.employeeName}</span>
              <span className="text-[11px] text-slate-500 block">
                Total Pinjaman: {formatRupiah(selectedLoanForHistory.totalAmount)} | Sisa Kasbon: <strong className="text-rose-600">{formatRupiah(selectedLoanForHistory.remainingAmount)}</strong>
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold block mb-1">Nominal Pembayaran Angsuran (Rp):</label>
                <input
                  type="number"
                  value={manualPayAmount}
                  onChange={(e) => setManualPayAmount(Number(e.target.value))}
                  step={25000}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-white dark:bg-purple-950 font-bold text-emerald-600 text-sm"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Keterangan / Metode Pembayaran:</label>
                <input
                  type="text"
                  value={manualPayNotes}
                  onChange={(e) => setManualPayNotes(e.target.value)}
                  placeholder="Misal: Titip tunai kasir / Pelunasan bonus bulanan"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-purple-900">
              <button
                type="button"
                onClick={() => setShowManualPaymentModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleManualLoanPayment}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-extrabold hover:bg-emerald-700 shadow-md cursor-pointer"
              >
                Simpan Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GENERATE AUTO SCHEDULE MODEL STRATEGY */}
      {showGenerateScheduleModal && (
        <div className="fixed inset-0 z-70 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C0D2B] text-slate-800 dark:text-slate-100 rounded-3xl p-6 max-w-lg w-full border border-purple-900/50 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-purple-900/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-400 text-purple-950 font-black">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo leading-tight">
                    Model Generate Roster Shift
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pilih metode & pola pembagian roster shift otomatis untuk karyawan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGenerateScheduleModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-amber-300 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Outlet & Periode Info */}
            <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
              <div>
                <span className="text-slate-400 text-[10px] block">Target Periode:</span>
                <span className="text-purple-950 dark:text-amber-300">{schedulePeriod}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Target Outlet:</span>
                <span className="text-purple-950 dark:text-amber-300">{scheduleOutletFilter === 'ALL' ? 'Semua Outlet Cabang' : scheduleOutletFilter}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Karyawan Aktif:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black">
                  {employees.filter((e) => e.status !== 'Non-Aktif' && !e.isScheduleOff && (scheduleOutletFilter === 'ALL' || e.outlet === scheduleOutletFilter)).length} Staf
                </span>
              </div>
            </div>

            {/* Pilihan Model Generate */}
            <div className="space-y-2.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Pilih Model Penjadwalan Roster:
              </label>

              {/* Model 1: Rotasi Standar */}
              <div
                onClick={() => setScheduleGenModel('rotasi_standar')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  scheduleGenModel === 'rotasi_standar'
                    ? 'border-amber-400 bg-amber-400/10 text-purple-950 dark:text-amber-300 ring-2 ring-amber-400/40'
                    : 'border-slate-200 dark:border-purple-900 bg-slate-50/50 dark:bg-purple-950/40 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    checked={scheduleGenModel === 'rotasi_standar'}
                    onChange={() => setScheduleGenModel('rotasi_standar')}
                    className="mt-1 accent-amber-500"
                  />
                  <div>
                    <div className="font-extrabold text-xs flex items-center gap-1.5">
                      <span>🔄 Rotasi Standar Berimbang (Pagi, Siang, Malam & OFF)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Menggilir shift Pagi, Siang, Malam & Libur (OFF) secara seimbang untuk outlet dengan tim lengkap.
                    </p>
                  </div>
                </div>
              </div>

              {/* Model 2: 1 Orang 1 Outlet */}
              <div
                onClick={() => setScheduleGenModel('single_person_outlet')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  scheduleGenModel === 'single_person_outlet'
                    ? 'border-amber-400 bg-amber-400/10 text-purple-950 dark:text-amber-300 ring-2 ring-amber-400/40'
                    : 'border-slate-200 dark:border-purple-900 bg-slate-50/50 dark:bg-purple-950/40 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    checked={scheduleGenModel === 'single_person_outlet'}
                    onChange={() => setScheduleGenModel('single_person_outlet')}
                    className="mt-1 accent-amber-500"
                  />
                  <div>
                    <div className="font-extrabold text-xs flex items-center gap-1.5">
                      <span>👤 1 Orang 1 Outlet (Bergiliran Solo Stand)</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-purple-900 dark:text-amber-300 text-[9px] font-black uppercase">
                        KHUSUS CABANG STAND
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Menugaskan 1 karyawan per hari secara bergantian per outlet. Anggota lain otomatis OFF di hari tersebut.
                    </p>
                  </div>
                </div>
              </div>

              {/* Model 3: Rotasi 2 Shift */}
              <div
                onClick={() => setScheduleGenModel('equal_two_shifts')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  scheduleGenModel === 'equal_two_shifts'
                    ? 'border-amber-400 bg-amber-400/10 text-purple-950 dark:text-amber-300 ring-2 ring-amber-400/40'
                    : 'border-slate-200 dark:border-purple-900 bg-slate-50/50 dark:bg-purple-950/40 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    checked={scheduleGenModel === 'equal_two_shifts'}
                    onChange={() => setScheduleGenModel('equal_two_shifts')}
                    className="mt-1 accent-amber-500"
                  />
                  <div>
                    <div className="font-extrabold text-xs flex items-center gap-1.5">
                      <span>⚖️ Rotasi 2 Shift (Pagi & Malam)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Distribusi 2 shift utama (Shift Pagi & Shift Malam) dengan rotasi libur tetap per minggu.
                    </p>
                  </div>
                </div>
              </div>

              {/* Model 4: Shift Tetap Sesuai Jabatan */}
              <div
                onClick={() => setScheduleGenModel('fixed_role_shift')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  scheduleGenModel === 'fixed_role_shift'
                    ? 'border-amber-400 bg-amber-400/10 text-purple-950 dark:text-amber-300 ring-2 ring-amber-400/40'
                    : 'border-slate-200 dark:border-purple-900 bg-slate-50/50 dark:bg-purple-950/40 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    checked={scheduleGenModel === 'fixed_role_shift'}
                    onChange={() => setScheduleGenModel('fixed_role_shift')}
                    className="mt-1 accent-amber-500"
                  />
                  <div>
                    <div className="font-extrabold text-xs flex items-center gap-1.5">
                      <span>📌 Shift Tetap Sesuai Jabatan (Role-Based)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Shift konsisten berdasarkan divisi karyawan (Chef, Kasir, Waitress, Barista).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Overwrite Checkbox */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={scheduleGenOverwrite}
                  onChange={(e) => setScheduleGenOverwrite(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span>Timpa & perbarui seluruh jadwal roster pada bulan {schedulePeriod} ini</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-purple-900/50">
              <button
                type="button"
                onClick={() => setShowGenerateScheduleModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-purple-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-purple-950 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteScheduleGeneration}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs shadow-md cursor-pointer flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4" /> 🚀 Terbitkan Roster Shift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-80 bg-slate-900 text-amber-300 dark:bg-purple-950 dark:text-amber-300 border border-amber-400/50 px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMsg}
        </div>
      )}
    </div>
  );
};
