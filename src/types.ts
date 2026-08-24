export interface MenuItem {
  id: string;
  name: string;
  koreanName?: string;
  category: 'signature' | 'addon' | string;
  price: number;
  cogs?: number; // HPP (Cost of Goods Sold) per porsi
  rating: number;
  reviewCount: number;
  description: string;
  isPopular?: boolean;
  isSpicy?: boolean;
  isSignature?: boolean;
  badge?: string;
  tags: string[];
  imageUrl?: string;
}

export interface ChickenOption {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  priceAdjustment?: number;
  cogs?: number;
}

export interface SauceOption {
  id: string;
  name: string;
  description: string;
  spiciness: number;
  priceAdjustment?: number;
  cogs?: number;
}

export interface AddonOption {
  id: string;
  name: string;
  price: number;
  cogs?: number;
  description: string;
}

export interface OnlineDeliveryPartners {
  gofoodUrl?: string;
  grabfoodUrl?: string;
  shopeefoodUrl?: string;
  maximUrl?: string;
  isGofoodActive?: boolean;
  isGrabfoodActive?: boolean;
  isShopeefoodActive?: boolean;
  isMaximActive?: boolean;
}

export interface SupportedServiceTypes {
  dineIn: boolean;
  takeaway: boolean;
  delivery: boolean;
}

export interface LocationItem {
  id: string;
  name: string;
  city: string;
  address: string;
  hours: string;
  phone: string;
  mapUrl: string;
  startWorkTime: string; // HH:mm - Batas jam masuk tepat waktu (e.g. "15:00")
  endWorkTime: string;   // HH:mm - Batas jam pulang shift (e.g. "22:00")
  onlineDeliveryPartners?: OnlineDeliveryPartners;
  supportedServiceTypes?: SupportedServiceTypes;
}

export interface ReviewItem {
  id: string;
  name: string;
  role: string;
  comment: string;
  rating: number;
  favoriteDish: string;
  status?: 'Disetujui' | 'Pending' | 'Ditolak';
  date?: string;
  outlet?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  cogs?: number;
  quantity: number;
  specialNotes?: string;
}

export interface OrderItem {
  id: string;
  date?: string;
  time?: string;
  createdTime?: string; // e.g. "17:45"
  createdAt?: string;
  customerName?: string;
  phone?: string;
  outlet?: string;
  serviceType?: 'Dine In' | 'Takeaway' | 'Delivery' | string;
  tableNumber?: string; // e.g. "Meja 05"
  addressOrTime?: string;
  addressOrNotes?: string;
  itemsSummary?: string;
  subtotal?: number;
  discountAmount?: number;
  deliveryFee?: number;
  taxAmount?: number;
  total?: number;
  totalPrice?: number;
  paymentMethod?: 'Cash' | 'QRIS' | 'Transfer' | string;
  cashPaid?: number;
  changeAmount?: number;
  cashierName?: string;
  cogsTotal?: number;
  netProfit?: number;
  items?: any[];
  status: 'Pending' | 'Terkirim/Diproses' | 'Selesai' | string;
}

export interface Employee {
  id: string;
  name: string;
  username?: string; // Username login & presensi
  password?: string; // Password / PIN untuk absensi & login
  role: 'Chef / Cook' | 'Kasir' | 'Waitress' | 'Barista' | 'Manager Outlet' | string;
  outlet: string;
  phone: string;
  joinDate: string;
  dailyRate: number; // Gaji pokok harian
  hourlyRate: number; // Rate per jam lembur/standar
  dailyAllowance: number; // Uang makan & transpor harian
  punctualityAllowancePerDay?: number; // Tunjangan hadir tepat waktu per hari
  latePenaltyPerDay?: number; // Denda potongan keterlambatan per hari terlambat
  outletBonus?: number; // Bonus Outlet per hari hadir (Rp)
  status: 'Aktif' | 'Non-Aktif';
  isScheduleOff?: boolean; // Status penonaktifan karyawan dari penjadwalan shift (roster)
  pin: string; // PIN / Password 4+ digit untuk absensi & login
  allowedTabs?: string[]; // Hak akses menu dashboard untuk karyawan ini
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  clockInTime: string; // HH:mm:ss
  clockOutTime?: string; // HH:mm:ss
  hoursWorked: number; // Total jam kerja
  outlet: string;
  status: 'Hadir' | 'Terlambat' | 'Izin' | 'Sakit' | 'Alpha';
  notes?: string;
  locationName?: string;
  selfieUrl?: string; // Foto selfie absensi masuk dengan watermark Steak 11
  clockOutSelfieUrl?: string; // Foto selfie absensi pulang dengan watermark
  clockInStatus?: 'Tepat Waktu' | 'Terlambat Masuk';
  clockOutStatus?: 'Pulang Tepat Waktu' | 'Pulang Awal';
  lateMinutes?: number; // Jumlah menit keterlambatan
  earlyOutMinutes?: number; // Jumlah menit pulang awal
  latitude?: number;
  longitude?: number;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface PayrollSlip {
  id: string; // PAY-YYYYMM-EMP
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  outlet: string;
  period?: string;
  periodMonth: string; // e.g. "2026-08"
  periodLabel: string; // e.g. "Agustus 2026"
  totalDaysPresent: number;
  totalDaysLate: number;
  totalLateMinutes?: number;
  totalDaysOnTime?: number; // Total hari masuk tepat waktu
  totalHoursWorked: number;
  hourlyRate?: number; // Rate lembur per jam
  totalOvertimeHours?: number; // Total jam lembur (jam kerja > 8 jam per shift)
  overtimePay?: number; // Total upah lembur (totalOvertimeHours * hourlyRate)
  baseSalary: number; // totalDaysPresent * dailyRate
  totalAllowance: number; // totalDaysPresent * dailyAllowance
  punctualityAllowance?: number; // totalDaysOnTime * punctualityAllowancePerDay
  outletBonus?: number; // totalDaysPresent * outletBonus (Bonus Outlet per hari hadir)
  bonus: number; // Bonus kinerja / omset / lembur
  deductions: number; // Potongan keterlambatan / kasbon
  netSalary: number; // (baseSalary + totalAllowance + punctualityAllowance + overtimePay + outletBonus + bonus) - deductions
  paymentStatus: 'Draft' | 'Disetujui' | 'Lunas / Terbayar';
  paymentDate?: string;
  note?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  role: string;
  phone: string;
  email: string;
  status: 'Aktif' | 'Non-Aktif' | string;
  passwordPin: string;
  createdAt: string;
  lastLogin?: string;
  allowedTabs?: string[]; // Hak akses khusus
}

export interface RoleSetting {
  id: string;
  name: string;
  targetType: 'admin' | 'employee' | 'both';
  description: string;
  allowedTabs: string[];
}

export interface WaNotificationSettings {
  isEnabled: boolean;
  targetWaNumber: string;
  apiKey: string;
  gatewayUrl: string;
  autoOpenCustomerWa: boolean;
  autoSendMode?: 'manual' | 'auto' | string;
  templateNewOrder: string;
  templateStatusUpdate: string;
  templateAttendance?: string;
}

export interface StoreBrandingSettings {
  brandName: string;
  tagline: string;
  subTagline: string;
  logoUrl: string;
  heroBannerUrl: string;
  halalCertified: boolean;
  ratingScore: string;
  reviewCountText: string;
  mainWhatsapp: string;
  instagramHandle: string;
  tiktokHandle: string;
  youtubeHandle: string;
  operatingHours: string;
  mainAddress: string;
  aboutDescription: string;
  // Header & Announcement Bar
  showAnnouncementBar?: boolean;
  announcementText?: string;
  announcementLink?: string;
  // Footer Customizations
  footerRunningText?: string;
  footerCopyrightText?: string;
  googleMapsUrl?: string;
  // System Version Label
  systemVersionText?: string;
}

export interface PromoVoucher {
  id: string;
  code: string;
  description: string;
  discountType: 'nominal' | 'percentage';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  expiryDate: string;
  usageCount: number;
  status: 'Aktif' | 'Non-Aktif';
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Daging Ayam' | 'Bumbu & Saus' | 'Sayuran & Karbo' | 'Kemasan & Plastik' | string;
  currentStock: number;
  minStock: number;
  unit: string;
  unitPrice: number;
  outlet: string;
  lastRestockDate: string;
  expiryDate?: string; // Tanggal kedaluwarsa batch
  batchNumber?: string;
  supplierId?: string;
  supplierName?: string;
}

export interface RecipeItem {
  inventoryItemId: string;
  inventoryItemName: string;
  quantityNeeded: number; // e.g. 0.2 kg atau 1 pcs
  unit: string;
}

export interface MenuRecipe {
  menuId: string;
  menuName: string;
  ingredients: RecipeItem[];
}

export interface StockOpnameLog {
  id: string;
  date: string;
  time: string;
  inventoryItemId: string;
  inventoryItemName: string;
  outlet: string;
  systemStock: number;
  actualStock: number;
  difference: number;
  reason: 'Bahan Rusak / Spoilage' | 'Kedaluwarsa / Expired' | 'Limbah Dapur / Tumpah' | 'Selisih Hitung Physical' | 'Penyesuaian Manual';
  notes?: string;
  performedBy: string;
}

export interface StockTransfer {
  id: string;
  date: string;
  fromOutlet: string;
  toOutlet: string;
  inventoryItemId: string;
  inventoryItemName: string;
  quantity: number;
  unit: string;
  status: 'Dalam Pengiriman' | 'Selesai / Diterima' | 'Dibatalkan';
  notes?: string;
  sentBy: string;
  receivedBy?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  category: 'Daging Ayam Fresh' | 'Bumbu & Rempah' | 'Sayuran & Karbo' | 'Kemasan & Plastik' | string;
  address: string;
  city?: string;
  rating: number; // 1 to 5
  paymentTerms?: string; // e.g. "COD", "TOP 14 Hari", "Net 30"
  notes?: string;
  status: 'Aktif' | 'Non-Aktif';
}

export interface PurchaseOrderItem {
  inventoryItemId: string;
  itemName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string; // e.g. "PO-2026-001"
  poNumber?: string;
  supplierId: string;
  supplierName: string;
  outlet: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  receivedDate?: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'Draft' | 'Dipesan' | 'Diterima' | 'Dibatalkan';
  paymentStatus: 'Belum Lunas' | 'Lunas';
  createdBy?: string;
  notes?: string;
}

export interface PettyCashExpense {
  id: string; // e.g. "EXP-2026-001"
  date: string;
  time: string;
  outlet: string;
  cashierName: string;
  category: 'Pembelian Bahan Darurat' | 'Listrik & Air' | 'Gas LPG' | 'Kebersihan & Operasional' | 'Transport & Kurir' | 'Lain-lain';
  description: string;
  amount: number;
  receiptNumber?: string;
  shiftId?: string;
  approvedBy?: string;
}

export interface CashierShiftRecord {
  id: string;
  date: string;
  shiftName: 'Shift Pagi' | 'Shift Siang' | 'Shift Malam' | string;
  cashierName: string;
  outlet: string;
  startingCash: number;
  cashRevenue: number;
  qrisRevenue: number;
  transferRevenue: number;
  onlineFoodRevenue?: number; // GoFood, GrabFood, ShopeeFood, etc.
  actualQrisRevenue?: number; // Hasil Realisasi Uang QRIS
  actualTransferRevenue?: number; // Hasil Realisasi Uang Transfer Bank
  actualOnlineFoodRevenue?: number; // Hasil Realisasi Omset Online Food
  totalRevenue: number;
  operationalExpenses?: number; // Total Kas Keluar Operasional (Petty Cash)
  manualCashAdjustment?: number; // Tambahan Manual Penjualan Tunai POS
  manualExpenseAdjustment?: number; // Tambahan Manual Kas Keluar Operasional
  expenseItems?: { id?: string; description: string; amount: number }[]; // Rincian Pengeluaran Kas Keluar per Item
  expectedCashInDrawer?: number; // Modal Awal + Kas Masuk POS - Operasional
  actualCashInDrawer?: number; // Hasil Hitung Fisik Kasir di Laci
  systemCashTotal: number;
  actualCashTotal: number;
  cashDifference: number;
  auditStatus?: 'Sesuai (Balance)' | 'Surplus (Lebih Kas)' | 'Defisit (Kurang Kas)';
  notes: string;
  status: 'Open' | 'Closed';
  closedAt?: string;
  denominations?: Record<string, number>; // Breakdown pecahan uang e.g. { "100000": 5, "50000": 3 }
}

export interface PaymentMethodSettings {
  qris: {
    enabled: boolean;
    merchantName: string;
    nmid: string;
    qrisImageUrl: string;
    instructions: string;
  };
  transfer: {
    enabled: boolean;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    instructions: string;
  };
  debit: {
    enabled: boolean;
    bankName: string;
    terminalId: string;
    instructions: string;
  };
  cash: {
    enabled: boolean;
    defaultStartingCash: number;
    quickCashPresets: number[];
  };
}

export interface ReceiptSettings {
  brandTitle: string;
  tagline: string;
  address: string;
  phone: string;
  paperWidth: '58mm' | '80mm';
  receiptLogoUrl?: string;
  logoSize?: 'small' | 'medium' | 'large' | 'xlarge';
  outletName?: string;
  showOutletLocation?: boolean;
  customOutletHeader?: string;
  // Receipt Counter & Prefix
  receiptPrefix?: string;
  receiptNextNumber?: number;
  showDateInReceiptNo?: boolean;
  // Display Toggles
  showCashierName: boolean;
  showCustomerName?: boolean;
  showTableNumber?: boolean;
  showServiceType?: boolean;
  showTax: boolean;
  showDiscount: boolean;
  showFooterPromo: boolean;
  footerThankYouMessage: string;
  footerPromoText: string;
  socialMediaText: string;
  // Wifi Info
  showWifiInfo?: boolean;
  wifiName?: string;
  wifiPassword?: string;
  // Custom Notes
  showCustomNotes?: boolean;
  customNotesText?: string;
  // Printer Connection Settings (Koneksi Perangkat Mesin Struk Biasa & Bluetooth)
  printerConnectionType?: 'system_dialog' | 'web_bluetooth' | 'web_usb' | 'network_lan';
  connectedBluetoothName?: string;
  connectedBluetoothDeviceId?: string;
  connectedUsbName?: string;
  networkPrinterIp?: string;
  networkPrinterPort?: number;
  autoCutPaper?: boolean;
  openCashDrawer?: boolean;
  printCopies?: number;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  date: string;
  user: string;
  role: string;
  outlet: string;
  category: 'Transaksi POS' | 'Audit Closing' | 'Kas Kecil' | 'Kelola Stok' | 'Absensi Staff' | 'Penggajian' | 'Manajemen User' | 'Pengaturan' | 'Data Master' | string;
  action: string;
  details: string;
  status: 'Berhasil' | 'Peringatan' | 'Gagal' | string;
  ipAddress?: string;
}

export interface StockMutation {
  id: string;
  timestamp: string; // YYYY-MM-DD HH:mm:ss
  date: string; // YYYY-MM-DD
  inventoryItemId: string;
  inventoryItemName: string;
  outlet: string;
  mutationType: 'Masuk (PO Pembelian)' | 'Masuk (Transfer Outlet)' | 'Masuk (Penyesuaian)' | 'Keluar (Penjualan POS)' | 'Keluar (Transfer Outlet)' | 'Keluar (Opname/Limbah)' | 'Penyesuaian Opname' | string;
  quantity: number; // Jumlah mutasi (+ masuk, - keluar)
  unit: string;
  stockBefore: number;
  stockAfter: number;
  referenceNo: string; // Ref No (PO-xxx, ORD-xxx, TRF-xxx, OPN-xxx, etc.)
  notes?: string;
  performedBy: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  favoriteOutlet?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  loyaltyPoints: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  notes?: string;
  tags: string[];
  createdAt: string;
}

export interface WorkShiftTemplate {
  id: string;
  name: string; // e.g. "Shift Pagi", "Shift Siang", "Shift Malam", "OFF"
  startTime: string; // e.g. "09:00"
  endTime: string; // e.g. "17:00"
  color: string; // tailwind color indicator
  outlet?: string; // e.g. "Semua Outlet", "Steak 11, Kalisari", "Steak 11, Cibubur"
  isOff?: boolean;
  notes?: string;
}

export interface EmployeeSchedule {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole?: string;
  outlet: string;
  date: string; // YYYY-MM-DD
  shiftId: string;
  shiftName: string;
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  isOff?: boolean;
  notes?: string;
}

export interface EmployeeLoanPayment {
  id: string;
  period: string; // YYYY-MM
  amountPaid: number;
  datePaid: string;
  notes?: string;
}

export interface EmployeeLoan {
  id: string;
  employeeId: string;
  employeeName: string;
  outlet: string;
  date: string; // YYYY-MM-DD
  totalAmount: number;
  monthlyInstallment: number;
  remainingAmount: number;
  status: 'ACTIVE' | 'PAID_OFF';
  notes?: string;
  history: EmployeeLoanPayment[];
}

export interface WaGatewayConfig {
  serverUrl: string;
  apiKey: string;
  deviceNumber: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'qr_ready';
  qrCodeData?: string;
  autoSendOrderNotif: boolean;
  autoSendStatusNotif: boolean;
  templateOrderNotif: string;
  templateStatusNotif: string;
  templatePromoNotif: string;
}



