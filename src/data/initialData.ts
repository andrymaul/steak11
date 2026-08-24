import { MenuItem, ChickenOption, SauceOption, AddonOption, LocationItem, ReviewItem, OrderItem, AdminUser, RoleSetting, WaNotificationSettings, StoreBrandingSettings, InventoryItem, PromoVoucher, CashierShiftRecord, Supplier, PurchaseOrder, PettyCashExpense, MenuRecipe, StockOpnameLog, StockTransfer, AuditLogItem, StockMutation, Customer, WaGatewayConfig, WorkShiftTemplate, EmployeeSchedule, EmployeeLoan } from '../types';

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'steak-creamy-garlic',
    name: 'Creamy Garlic Herb Steak',
    koreanName: '크리미 갈릭 스테이크',
    category: 'signature',
    price: 20000,
    cogs: 7500, // Estimasi HPP / COGS per porsi
    rating: 4.9,
    reviewCount: 420,
    description: 'Paha ayam juicy panggang disiram saus krim bawang gurih, disajikan dengan potato wedges, carrot, and green beans segar.',
    isPopular: true,
    tags: ['Best Seller', 'Asin Gurih'],
    imageUrl: 'https://i.ibb.co/zWhxV6Bp/Gemini-Generated-Image-vvqchqvvqchqvvqc.png'
  },
  {
    id: 'steak-black-pepper',
    name: 'Spicy Mythic Black Pepper Steak',
    koreanName: '블랙 페퍼 스테이크',
    category: 'signature',
    price: 20000,
    cogs: 7500,
    rating: 4.9,
    reviewCount: 380,
    description: 'Paha ayam juicy panggang disiram saus lada hitam khas yang pedas hangat, pekat dan beraroma bold.',
    isPopular: true,
    isSpicy: true,
    tags: ['Must Try', 'Pedas Manis'],
    imageUrl: 'https://i.ibb.co/jkcgnq14/Gemini-Generated-Image-rak3lhrak3lhrak3-1.png'
  },
  {
    id: 'steak-smoky-bbq',
    name: 'Smoky Legend BBQ Steak',
    koreanName: '스모키 바비큐 스테이크',
    category: 'signature',
    price: 20000,
    cogs: 7500,
    rating: 4.9,
    reviewCount: 310,
    description: 'Paha ayam juicy panggang dengan rasa smoky dipadu saus Legend BBQ beraroma khas panggang rempah otentik.',
    isPopular: false,
    tags: ['Smoky BBQ', 'Asam Manis'],
    imageUrl: 'https://i.ibb.co/jk7WhQWm/Gemini-Generated-Image-jfw63pjfw63pjfw6.png'
  },
  {
    id: 'addon-meat-30g',
    name: '+ Daging Ayam 30 gram',
    koreanName: '추가 닭고기',
    category: 'addon',
    price: 5000,
    cogs: 2200,
    rating: 4.9,
    reviewCount: 230,
    description: 'Tambahan daging paha ayam juicy 30 gram bermarinasi rempah rahasia.',
    tags: ['Add On', '+ Daging Ayam']
  },
  {
    id: 'addon-potato-wedges',
    name: '+ Crispy Potato Wedges',
    koreanName: '포테이토 웨지',
    category: 'addon',
    price: 5000,
    cogs: 1800,
    rating: 4.9,
    reviewCount: 290,
    description: 'Tambahan kentang potongan wedges tebal dengan kulit krispi renyah.',
    tags: ['Add On', '+ Kentang Wedges']
  },
  {
    id: 'addon-sauce-extra',
    name: '+ Sauce Signature',
    koreanName: '추가 소스',
    category: 'addon',
    price: 3000,
    cogs: 900,
    rating: 4.9,
    reviewCount: 340,
    description: 'Ekstra 1 cup saus signature pilihan (Creamy Garlic Herb, Spicy Black Pepper, atau Smoky BBQ).',
    tags: ['Add On', '+ Saus Cup']
  }
];

export const CHICKEN_OPTIONS: ChickenOption[] = [
  {
    id: 'thigh-1',
    name: '1 Potongan Daging Paha',
    description: 'Daging paha ayam juicy boneless panggang 11 rempah.',
    basePrice: 20000
  },
  {
    id: 'thigh-2',
    name: '2 Potongan Daging Paha',
    description: '2 Potong daging paha ayam juicy boneless porsi puas mantap.',
    basePrice: 30000
  }
];

export const SAUCE_OPTIONS: SauceOption[] = [
  {
    id: 'creamy-garlic',
    name: 'Creamy Garlic Herb',
    description: 'Saus krim putih savory bertabur bawang putih & thyme segar',
    spiciness: 0
  },
  {
    id: 'black-pepper',
    name: 'Spicy Mythic Black Pepper',
    description: 'Saus lada hitam rempah pekat pedas manis hangat',
    spiciness: 2
  },
  {
    id: 'smoky-bbq',
    name: 'Smoky Legend BBQ',
    description: 'Saus barbeque khas beraroma asap panggang otentik',
    spiciness: 0
  }
];

export const ADDON_OPTIONS: AddonOption[] = [
  { id: 'addon-chicken-30g', name: '+ 30g Chicken Meat', price: 5000, description: 'Ekstra 30 gram daging ayam paha juicy' },
  { id: 'addon-wedges', name: '+ Crispy Potato Wedges', price: 5000, description: 'Tambahan kentang wedges krispi renyah' },
  { id: 'addon-sauce', name: '+ Extra Sauce Signature', price: 3000, description: 'Tambahan 1 cup saus pilihan' }
];

export const LOCATIONS: LocationItem[] = [
  {
    id: 'loc-cibubur',
    name: 'Steak 11, Cibubur',
    city: 'Jakarta Timur',
    address: 'Jl. Cibubur I, Cibubur, Ciracas, Jakarta Timur',
    hours: 'Setiap Hari : 15.00-22.00 WIB',
    phone: '081223233299',
    mapUrl: 'https://share.google/O3f5RdhdFB6oE7toi',
    startWorkTime: '14:00',
    endWorkTime: '23:00',
    onlineDeliveryPartners: {
      gofoodUrl: 'https://gofood.link/a/steak11cibubur',
      grabfoodUrl: 'https://grab.onelink.me/steak11cibubur',
      shopeefoodUrl: 'https://shopee.co.id/steak11cibubur',
      maximUrl: 'https://taximaxim.com/steak11cibubur',
      isGofoodActive: true,
      isGrabfoodActive: true,
      isShopeefoodActive: true,
      isMaximActive: false
    },
    supportedServiceTypes: {
      dineIn: true,
      takeaway: true,
      delivery: true
    }
  },
  {
    id: 'loc-kalisari',
    name: 'Steak 11, Kalisari',
    city: 'Jakarta Timur',
    address: 'Jl. Kalisari II, Kalisari, Pasar Rebo, Jakarta Timur',
    hours: 'Setiap Hari : 15.00-22.00 WIB',
    phone: '081223233299',
    mapUrl: 'https://share.google/4WOCcckZ4Kfvxj6hj',
    startWorkTime: '14:00',
    endWorkTime: '23:00',
    onlineDeliveryPartners: {
      gofoodUrl: 'https://gofood.link/a/steak11kalisari',
      grabfoodUrl: 'https://grab.onelink.me/steak11kalisari',
      shopeefoodUrl: 'https://shopee.co.id/steak11kalisari',
      maximUrl: '',
      isGofoodActive: true,
      isGrabfoodActive: true,
      isShopeefoodActive: true,
      isMaximActive: false
    },
    supportedServiceTypes: {
      dineIn: true,
      takeaway: true,
      delivery: true
    }
  },
  {
    id: 'loc-cilangkap',
    name: 'Steak 11, Cilangkap',
    city: 'Jakarta Timur',
    address: 'Jl. Pintu 2 Mabes TNI AL, Cilangkap, Cipayung, Jakarta Timur',
    hours: 'Setiap Hari : 16.00-23.00 WIB',
    phone: '081223233299',
    mapUrl: 'https://share.google/J4atKAQkJzuKX8OfM',
    startWorkTime: '14:30',
    endWorkTime: '23:30',
    onlineDeliveryPartners: {
      gofoodUrl: 'https://gofood.link/a/steak11cilangkap',
      grabfoodUrl: 'https://grab.onelink.me/steak11cilangkap',
      shopeefoodUrl: 'https://shopee.co.id/steak11cilangkap',
      maximUrl: '',
      isGofoodActive: true,
      isGrabfoodActive: true,
      isShopeefoodActive: true,
      isMaximActive: false
    },
    supportedServiceTypes: {
      dineIn: true,
      takeaway: true,
      delivery: true
    }
  },
  {
    id: 'loc-kuningan',
    name: 'Steak 11, Kuningan',
    city: 'Jakarta Selatan',
    address: 'Jl. Pedurenan Masjid III, Karet Kuningan, Setiabudi, Jakarta Selatan',
    hours: 'Senin-Jumat : 10.00-18.00 WIB',
    phone: '081223233299',
    mapUrl: 'https://share.google/L2FHRrb133CrSfkUD',
    startWorkTime: '09:00',
    endWorkTime: '21:00',
    onlineDeliveryPartners: {
      gofoodUrl: 'https://gofood.link/a/steak11kuningan',
      grabfoodUrl: 'https://grab.onelink.me/steak11kuningan',
      shopeefoodUrl: 'https://shopee.co.id/steak11kuningan',
      maximUrl: '',
      isGofoodActive: true,
      isGrabfoodActive: true,
      isShopeefoodActive: true,
      isMaximActive: false
    },
    supportedServiceTypes: {
      dineIn: true,
      takeaway: true,
      delivery: true
    }
  },
  {
    id: 'loc-jatisampurna',
    name: 'Steak 11, Jatisampurna',
    city: 'Kota Bekasi',
    address: 'Jl. Raya Ps. Kranggan, Jatisampurna, Kota Bekasi, Jawa Barat',
    hours: 'Setiap Hari : 15.00-22.00 WIB',
    phone: '081223233299',
    mapUrl: 'https://share.google/3N0QsIy9hYIYJxOxd',
    startWorkTime: '14:00',
    endWorkTime: '23:00',
    onlineDeliveryPartners: {
      gofoodUrl: 'https://gofood.link/a/steak11jatisampurna',
      grabfoodUrl: 'https://grab.onelink.me/steak11jatisampurna',
      shopeefoodUrl: 'https://shopee.co.id/steak11jatisampurna',
      maximUrl: '',
      isGofoodActive: true,
      isGrabfoodActive: true,
      isShopeefoodActive: true,
      isMaximActive: false
    },
    supportedServiceTypes: {
      dineIn: true,
      takeaway: true,
      delivery: true
    }
  }
];

export const REVIEWS: ReviewItem[] = [
  { id: 'rev-1', name: 'Isyfie Lathifatur Robbaniyah', role: 'Pencinta Kuliner Setia', comment: 'Enak banget, bumbu melimpah dengan harga 20k udah dpt ayam 90gr + kentang dan sayur tuh WORTH IT banget, rasanya pun enakk ayamnya juicy karna fillet paha ya🥰 rasa bumbunya juga enakk, urutan fav aku aku mushroom, blackpepper dan bbq', rating: 5, favoriteDish: 'Creamy Garlic Herb Steak', status: 'Disetujui', date: '2026-08-01', outlet: 'Steak 11, Cibubur' },
  { id: 'rev-2', name: 'Ima Hardiman', role: 'Pelanggan Kalisari', comment: 'Buka jam 3 sore..Jualannya di gerobak, lokasi depan Alfamidi Kalisari. Harga 20k dengan pilihan saus: barbeque, black pepper, mushroom. Semua sausnya enaak terasa homemade. Daging ayam yang dibakar besar2, Plusnya salad dan kentang wedges fresh.', rating: 5, favoriteDish: 'Spicy Mythic Black Pepper Steak', status: 'Disetujui', date: '2026-08-02', outlet: 'Steak 11, Kalisari' },
  { id: 'rev-3', name: 'Fadhil R', role: 'Pekerja Kantor Kuningan', comment: 'Steak ayam yang lokasinya dibelakang Kuncit, kalau lewat tempting banget ayam panggangnyaa. Lumayan enakk, juicy dan dapet potongannya banyak beserta kentang dan sayurnya juga dengan harga 20k ini worth the price bangett. Ayamnya juga masih anget dari panggangan, pas banget dimakan di jam istirahat siang', rating: 5, favoriteDish: 'Creamy Garlic Herb Steak', status: 'Disetujui', date: '2026-08-05', outlet: 'Steak 11, Kuningan' },
  { id: 'rev-4', name: 'Annisa Rahayu', role: 'Pelanggan Cilangkap', comment: 'Setiap lewat sini selalu rame bgt, akhirnya kesampaian jg buat nyobain. Dan ternyata pantesan ramai, dengan harga 20rb udh dpt stik ayam yg best bgt!', rating: 5, favoriteDish: 'Smoky Legend BBQ Steak', status: 'Disetujui', date: '2026-08-08', outlet: 'Steak 11, Cilangkap' }
];

export const DEFAULT_ORDERS: OrderItem[] = [
  {
    id: 'ORD-1101',
    date: '2026-08-10',
    createdTime: '12:30',
    customerName: 'Budi Santoso',
    phone: '6281234567890',
    outlet: 'Steak 11, Cibubur',
    serviceType: 'Dine In',
    tableNumber: 'Meja 03',
    addressOrTime: 'Makan di Tempat - Meja 03',
    itemsSummary: '1x Creamy Garlic Herb Steak (Rp 20.000)',
    subtotal: 20000,
    total: 20000,
    paymentMethod: 'Cash',
    cashPaid: 50000,
    changeAmount: 30000,
    cashierName: 'Rina Kurnia',
    status: 'Selesai'
  },
  {
    id: 'ORD-1102',
    date: '2026-08-10',
    createdTime: '13:15',
    customerName: 'Siti Rahma',
    phone: '6289876543210',
    outlet: 'Steak 11, Kuningan',
    serviceType: 'Delivery',
    addressOrTime: 'Jl. Prof. Dr. Satrio No. 5, Karet Kuningan',
    itemsSummary: '2x Spicy Mythic Black Pepper Steak (Rp 40.000)',
    subtotal: 40000,
    total: 40000,
    paymentMethod: 'QRIS',
    cashierName: 'Rina Kurnia',
    status: 'Selesai'
  },
  {
    id: 'ORD-1103',
    date: '2026-08-10',
    createdTime: '18:30',
    customerName: 'Ahmad Fauzi',
    phone: '6281311223344',
    outlet: 'Steak 11, Cibubur',
    serviceType: 'Dine In',
    tableNumber: 'Meja 01',
    addressOrTime: 'Makan di Tempat - Meja 01',
    itemsSummary: '2x Creamy Garlic Herb Steak (Rp 40.000), 1x + Crispy Potato Wedges (Rp 5.000)',
    subtotal: 45000,
    total: 45000,
    paymentMethod: 'Cash',
    cashPaid: 50000,
    changeAmount: 5000,
    cashierName: 'Rina Kurnia',
    status: 'Selesai'
  },
  {
    id: 'ORD-1104',
    date: '2026-08-10',
    createdTime: '19:00',
    customerName: 'Dewi Lestari',
    phone: '6285712345678',
    outlet: 'Steak 11, Cibubur',
    serviceType: 'Takeaway',
    addressOrTime: 'Bawa Pulang',
    itemsSummary: '1x Smoky Legend BBQ Steak (Rp 20.000), 1x + Sauce Signature (Rp 3.000)',
    subtotal: 23000,
    total: 23000,
    paymentMethod: 'QRIS',
    cashierName: 'Rina Kurnia',
    status: 'Selesai'
  },
  {
    id: 'ORD-1105',
    date: '2026-08-10',
    createdTime: '19:45',
    customerName: 'Rizky Pratama',
    phone: '6281987654321',
    outlet: 'Steak 11, Kalisari',
    serviceType: 'Dine In',
    tableNumber: 'Meja 05',
    addressOrTime: 'Makan di Tempat - Meja 05',
    itemsSummary: '3x Spicy Mythic Black Pepper Steak (Rp 60.000)',
    subtotal: 60000,
    total: 60000,
    paymentMethod: 'Transfer',
    cashierName: 'Asep Saepulloh',
    status: 'Selesai'
  }
];

export const DEFAULT_GAS_URL = '';

export const DEFAULT_EMPLOYEES: any[] = [
  {
    id: 'S11-001',
    name: 'Andry Maulana',
    username: 'andry',
    role: 'Chef / Koki',
    outlet: 'Steak 11, Cibubur',
    phone: '081223233299',
    joinDate: '2026-05-28',
    dailyRate: 60000,
    hourlyRate: 0,
    dailyAllowance: 10000,
    punctualityAllowancePerDay: 10000,
    status: 'Aktif',
    pin: '1234',
    allowedTabs: ['kasir', 'pesanan', 'inventory', 'absensi', 'presensi_kamera']
  },
  {
    id: 'S11-002',
    name: 'Desi Suci Afriani',
    username: 'desi',
    role: 'Chef / Koki',
    outlet: 'Steak 11, Cibubur',
    phone: '081223233299',
    joinDate: '2026-05-28',
    dailyRate: 60000,
    hourlyRate: 0,
    dailyAllowance: 10000,
    punctualityAllowancePerDay: 10000,
    status: 'Aktif',
    pin: '1234',
    allowedTabs: ['kasir', 'pesanan', 'inventory', 'absensi', 'presensi_kamera']
  },
  {
    id: 'S11-003',
    name: 'Rizky Musyaffa Fajari',
    username: 'fajar',
    role: 'Chef / Koki',
    outlet: 'Steak 11, Cilangkap',
    phone: '081223233299',
    joinDate: '2026-05-28',
    dailyRate: 60000,
    hourlyRate: 0,
    dailyAllowance: 10000,
    punctualityAllowancePerDay: 10000,
    status: 'Aktif',
    pin: '1234',
    allowedTabs: ['kasir', 'pesanan', 'inventory', 'absensi', 'presensi_kamera']
  },
  {
    id: 'S11-004',
    name: 'Achmad Fuad Putranto',
    username: 'fuad',
    role: 'Chef / Koki',
    outlet: 'Steak 11, Kalisari',
    phone: '081223233299',
    joinDate: '2026-05-28',
    dailyRate: 60000,
    hourlyRate: 0,
    dailyAllowance: 10000,
    punctualityAllowancePerDay: 10000,
    status: 'Aktif',
    pin: '1234',
    allowedTabs: ['kasir', 'pesanan', 'inventory', 'absensi', 'presensi_kamera']
  },
  {
    id: 'S11-005',
    name: 'Aura Tri Nabila Putri',
    username: 'aura',
    role: 'Chef / Koki',
    outlet: 'Steak 11, Cibubur',
    phone: '081223233299',
    joinDate: '2026-05-28',
    dailyRate: 60000,
    hourlyRate: 0,
    dailyAllowance: 10000,
    punctualityAllowancePerDay: 10000,
    status: 'Aktif',
    pin: '1234',
    allowedTabs: ['kasir', 'pesanan', 'inventory', 'absensi', 'presensi_kamera']
  },
  {
    id: 'S11-006',
    name: 'Anggraini Putri',
    username: 'putri',
    role: 'Chef / Koki',
    outlet: 'Steak 11, Cibubur',
    phone: '081223233299',
    joinDate: '2026-05-28',
    dailyRate: 60000,
    hourlyRate: 0,
    dailyAllowance: 10000,
    punctualityAllowancePerDay: 10000,
    status: 'Aktif',
    pin: '1234',
    allowedTabs: ['kasir', 'pesanan', 'inventory', 'absensi', 'presensi_kamera']
  },
  {
    id: 'S11-007',
    name: 'Muhammad Yusuf Al-Mahdi',
    username: 'yusuf',
    role: 'Chef / Koki',
    outlet: 'Steak 11, Kuningan',
    phone: '081223233299',
    joinDate: '2026-05-28',
    dailyRate: 100000,
    hourlyRate: 0,
    dailyAllowance: 10000,
    punctualityAllowancePerDay: 10000,
    status: 'Aktif',
    pin: '1234',
    allowedTabs: ['kasir', 'pesanan', 'inventory', 'absensi', 'presensi_kamera']
  },
  {
    id: 'S11-008',
    name: 'Febrian Dwi Anggoro',
    username: 'febri',
    role: 'Chef / Koki',
    outlet: 'Steak 11, Cilangkap',
    phone: '081223233299',
    joinDate: '2026-05-28',
    dailyRate: 80000,
    hourlyRate: 0,
    dailyAllowance: 10000,
    punctualityAllowancePerDay: 10000,
    status: 'Aktif',
    pin: '1234',
    allowedTabs: ['kasir', 'pesanan', 'inventory', 'absensi', 'presensi_kamera']
  },
  {
    id: 'S11-009',
    name: 'Andhira Pratama Hasibuan',
    username: 'andhira',
    role: 'Chef / Koki',
    outlet: 'Steak 11, Jatisampurna',
    phone: '081223233299',
    joinDate: '2026-05-28',
    dailyRate: 60000,
    hourlyRate: 0,
    dailyAllowance: 10000,
    punctualityAllowancePerDay: 10000,
    status: 'Aktif',
    pin: '1234',
    allowedTabs: ['kasir', 'pesanan', 'inventory', 'absensi', 'presensi_kamera']
  },
  {
    id: 'S11-010',
    name: 'Muhammad Zacky Alfiansyah',
    username: 'zacky',
    role: 'Chef / Koki',
    outlet: 'Steak 11, Kalisari',
    phone: '081223233299',
    joinDate: '2026-05-28',
    dailyRate: 60000,
    hourlyRate: 0,
    dailyAllowance: 10000,
    punctualityAllowancePerDay: 10000,
    status: 'Aktif',
    pin: '1234',
    allowedTabs: ['kasir', 'pesanan', 'inventory', 'absensi', 'presensi_kamera']
  },
  {
    id: 'S11-011',
    name: 'Adam Mubin Muzaki',
    username: 'adam',
    role: 'Chef / Koki',
    outlet: 'Steak 11, Cilangkap',
    phone: '081223233299',
    joinDate: '2026-05-28',
    dailyRate: 60000,
    hourlyRate: 0,
    dailyAllowance: 10000,
    punctualityAllowancePerDay: 10000,
    status: 'Aktif',
    pin: '1234',
    allowedTabs: ['kasir', 'pesanan', 'inventory', 'absensi', 'presensi_kamera']
  }
];

export const DEFAULT_ATTENDANCE: any[] = [
  {
    id: 'ATT-20260810-01',
    employeeId: 'EMP-001',
    employeeName: 'Asep Saepulloh',
    date: '2026-08-10',
    clockInTime: '14:45:12',
    clockOutTime: '22:15:00',
    hoursWorked: 7.5,
    outlet: 'Steak 11, Cibubur',
    status: 'Hadir',
    clockInStatus: 'Tepat Waktu',
    clockOutStatus: 'Pulang Tepat Waktu',
    lateMinutes: 0,
    earlyOutMinutes: 0,
    notes: 'Shift Sore',
    locationName: 'Lokasi Terverifikasi (GPS Outlet Cibubur)'
  },
  {
    id: 'ATT-20260810-02',
    employeeId: 'EMP-002',
    employeeName: 'Rina Kurnia',
    date: '2026-08-10',
    clockInTime: '09:55:00',
    clockOutTime: '18:05:00',
    hoursWorked: 8.1,
    outlet: 'Steak 11, Kuningan',
    status: 'Hadir',
    clockInStatus: 'Tepat Waktu',
    clockOutStatus: 'Pulang Tepat Waktu',
    lateMinutes: 0,
    earlyOutMinutes: 0,
    notes: 'Shift Pagi Kuningan',
    locationName: 'Lokasi Terverifikasi (GPS Outlet Kuningan)'
  },
  {
    id: 'ATT-20260809-01',
    employeeId: 'EMP-001',
    employeeName: 'Asep Saepulloh',
    date: '2026-08-09',
    clockInTime: '15:02:10',
    clockOutTime: '22:30:00',
    hoursWorked: 7.5,
    outlet: 'Steak 11, Cibubur',
    status: 'Terlambat',
    clockInStatus: 'Terlambat Masuk',
    clockOutStatus: 'Pulang Tepat Waktu',
    lateMinutes: 2,
    earlyOutMinutes: 0,
    notes: 'Standar Shift',
    locationName: 'Lokasi Terverifikasi'
  },
  {
    id: 'ATT-20260809-02',
    employeeId: 'EMP-003',
    employeeName: 'Doni Setiawan',
    date: '2026-08-09',
    clockInTime: '15:20:00',
    clockOutTime: '21:30:00',
    hoursWorked: 6.2,
    outlet: 'Steak 11, Kalisari',
    status: 'Terlambat',
    clockInStatus: 'Terlambat Masuk',
    clockOutStatus: 'Pulang Awal',
    lateMinutes: 20,
    earlyOutMinutes: 30,
    notes: 'Macet jalan raya & ijin pulang awal',
    locationName: 'Lokasi Terverifikasi'
  }
];

export const DEFAULT_PAYROLL: any[] = [
  {
    id: 'PAY-202608-EMP-001',
    employeeId: 'EMP-001',
    employeeName: 'Asep Saepulloh',
    employeeRole: 'Chef / Cook',
    outlet: 'Steak 11, Cibubur',
    periodMonth: '2026-08',
    periodLabel: 'Agustus 2026',
    totalDaysPresent: 22,
    totalDaysLate: 0,
    totalHoursWorked: 165,
    baseSalary: 2860000,
    totalAllowance: 550000,
    bonus: 200000,
    deductions: 0,
    netSalary: 3610000,
    paymentStatus: 'Disetujui',
    paymentDate: '2026-08-01',
    note: 'Slip Gaji Sah Terbitan Sistem Steak 11'
  },
  {
    id: 'PAY-202608-EMP-002',
    employeeId: 'EMP-002',
    employeeName: 'Rina Kurnia',
    employeeRole: 'Kasir',
    outlet: 'Steak 11, Kuningan',
    periodMonth: '2026-08',
    periodLabel: 'Agustus 2026',
    totalDaysPresent: 20,
    totalDaysLate: 1,
    totalHoursWorked: 160,
    baseSalary: 2400000,
    totalAllowance: 500000,
    bonus: 150000,
    deductions: 25000,
    netSalary: 3025000,
    paymentStatus: 'Lunas / Terbayar',
    paymentDate: '2026-08-05',
    note: 'Slip Gaji Sah Terbitan Sistem Steak 11'
  }
];

export const DEFAULT_MENU_CATEGORIES = [
  { id: 'signature', name: 'Signature Steak', description: 'Menu utama paha ayam juicy boneless' },
  { id: 'addon', name: 'Extra Addon', description: 'Tambahan daging, kentang wedges & ekstra saus' }
];

export const DEFAULT_ADMINS: AdminUser[] = [
  {
    id: 'adm-000',
    username: 'steak11jaya',
    fullName: 'Admin Steak 11 Jaya',
    role: 'Super Admin',
    phone: '081211111111',
    email: 'steak11jaya@steak11.com',
    status: 'Aktif',
    passwordPin: '1111',
    createdAt: '2026-01-01',
    lastLogin: '2026-08-11 00:00',
    allowedTabs: ['dashboard', 'kasir', 'pesanan', 'analytics', 'menu', 'racik', 'inventory', 'suppliers', 'purchase_orders', 'reviews', 'promos', 'karyawan', 'absensi', 'penggajian', 'shifts', 'expenses', 'outlets', 'admin', 'wa', 'branding', 'system', 'jadwal', 'pengunjung', 'payment_receipt_settings', 'audit_logs', 'customers', 'user_guide', 'presensi_kamera']
  },
  {
    id: 'adm-001',
    username: 'admin',
    fullName: 'Andry Maul (Owner / Super Admin)',
    role: 'Super Admin',
    phone: '081223233299',
    email: 'andrymaul.am@gmail.com',
    status: 'Aktif',
    passwordPin: '1111',
    createdAt: '2026-01-01',
    lastLogin: '2026-08-10 22:30',
    allowedTabs: ['dashboard', 'kasir', 'pesanan', 'analytics', 'menu', 'racik', 'inventory', 'suppliers', 'purchase_orders', 'reviews', 'promos', 'karyawan', 'absensi', 'penggajian', 'shifts', 'expenses', 'outlets', 'admin', 'wa', 'branding', 'system', 'jadwal', 'pengunjung', 'payment_receipt_settings', 'audit_logs', 'customers', 'user_guide', 'presensi_kamera']
  },
  {
    id: 'visitor-001',
    username: 'pengunjung_google1',
    fullName: 'Dimas Prasetyo (Pengunjung Google)',
    role: 'Pengunjung',
    phone: '081299887766',
    email: 'dimas.prasetyo@gmail.com',
    status: 'Aktif',
    passwordPin: 'Google Auth',
    createdAt: '2026-08-15',
    lastLogin: '2026-08-17 19:30',
    allowedTabs: ['dashboard', 'kasir', 'pesanan', 'analytics', 'menu', 'racik', 'inventory', 'suppliers', 'purchase_orders', 'reviews', 'promos', 'karyawan', 'absensi', 'presensi_kamera', 'jadwal', 'penggajian', 'shifts', 'expenses', 'outlets', 'admin', 'wa', 'branding', 'system', 'payment_receipt_settings', 'audit_logs', 'customers', 'pengunjung', 'user_guide']
  },
  {
    id: 'visitor-002',
    username: 'pengunjung_google2',
    fullName: 'Anisa Rahmawati (Pengunjung Google)',
    role: 'Pengunjung',
    phone: '085711224455',
    email: 'anisa.rahmawati@gmail.com',
    status: 'Aktif',
    passwordPin: 'Google Auth',
    createdAt: '2026-08-16',
    lastLogin: '2026-08-17 20:00',
    allowedTabs: ['dashboard', 'kasir', 'pesanan', 'analytics', 'menu', 'racik', 'inventory', 'suppliers', 'purchase_orders', 'reviews', 'promos', 'karyawan', 'absensi', 'presensi_kamera', 'jadwal', 'penggajian', 'shifts', 'expenses', 'outlets', 'admin', 'wa', 'branding', 'system', 'payment_receipt_settings', 'audit_logs', 'customers', 'pengunjung', 'user_guide']
  }
];

export const DEFAULT_WA_SETTINGS: WaNotificationSettings = {
  isEnabled: true,
  targetWaNumber: '6281223233299',
  apiKey: 'FONNTE_STEAK11_DEMO_KEY_2026',
  gatewayUrl: 'https://api.fonnte.com/send',
  autoOpenCustomerWa: true,
  templateNewOrder: `*HALO {BRAND_NAME}! SAYA MAU PESAN STEAK*\n\n*Order ID:* {ORDER_ID}\n*Nama Pemesan:* {NAMA}\n*Outlet:* {OUTLET}\n*Tipe Layanan:* {SERVICE_TYPE}\n*Lokasi/Jam:* {ADDRESS_TIME}\n\n*RINCIAN PESANAN:*\n{ITEMS_SUMMARY}\n\n*GRAND TOTAL:* {TOTAL}\n\nMohon diproses ya Kak, Terima kasih!`,
  templateStatusUpdate: `*UPDATE STATUS PESANAN STEAK 11*\n\nHalo Kak {NAMA}!\nPesanan ID: *{ORDER_ID}* di Outlet *{OUTLET}*\nStatus Terbaru: *{STATUS}*\n\nItem: {ITEMS_SUMMARY}\nTotal: {TOTAL}\n\nTerima kasih telah memesan di Steak 11!`,
  templateAttendance: `*PRESENSI NOTIFIKASI {TIPE} STAFF STEAK 11*\n---------------------------\n*Karyawan:* {NAMA} ({ROLE})\n*Outlet:* {OUTLET}\n*Tanggal:* {TANGGAL}\n*Jam:* {WAKTU} WIB\n*Evaluasi:* {EVALUASI}\n*Alamat:* {LOKASI}\n*Catatan:* {CATATAN}\n---------------------------\n_Terverifikasi Sistem Presensi Kamera Steak 11_`
};

export const DEFAULT_BRANDING: StoreBrandingSettings = {
  brandName: 'Steak 11',
  tagline: 'Mythic Chicken Taste',
  subTagline: 'Bukan sekadar steak ayam biasa — Ini Rasa yang MYTHIC! 100% Daging Paha Ayam Boneless Juicy & Soft.',
  logoUrl: 'https://i.ibb.co/cSnHx8HC/Logo-PNG-01-2.png',
  heroBannerUrl: 'https://i.ibb.co/zWhxV6Bp/Gemini-Generated-Image-vvqchqvvqchqvvqc.png',
  halalCertified: true,
  ratingScore: '4.9 / 5.0',
  reviewCountText: '1,200+ Ulasan Sempurna',
  mainWhatsapp: '081223233299',
  instagramHandle: 'steak11.id',
  tiktokHandle: 'steak11.id',
  youtubeHandle: 'steak11id',
  operatingHours: '10.00 - 22.00 WIB setiap hari',
  mainAddress: 'Cabang Utama: Tebet, Margonda Depok, Bintaro, Bekasi & Gading Serpong',
  aboutDescription: 'Bukan sekadar steak ayam biasa, ini rasa yang MYTHIC. Terbuat dari 100% daging paha ayam segar pilihan bertabur 11 rempah rahasia yang dipadukan saus racikan homemade premium.',
  showAnnouncementBar: true,
  announcementText: '🔥 PROMO MYTHIC: REVIEW GOOGLE MAPS FREE MINI CHICKEN STEAK!!!',
  announcementLink: '#menu',
  footerRunningText: '⚡ PROMO MYTHIC STEAK 11 — DAGING PAHA AYAM BONELESS JUICY 100% HALAL — BISA PESAN ONLINE DENGAN PENGIRIMAN INSTAN ⚡',
  footerCopyrightText: '© 2026 STEAK 11 — MYTHIC CHICKEN TASTE. ALL RIGHTS RESERVED.',
  googleMapsUrl: 'https://maps.google.com/?q=Steak+11',
  systemVersionText: 'Steak 11 v1.0 System'
};

export const DEFAULT_INVENTORY: InventoryItem[] = [
  {
    id: 'INV-001',
    name: 'Daging Paha Ayam Boneless Fillet',
    category: 'Daging Ayam',
    currentStock: 45.5,
    minStock: 10.0,
    unit: 'Kg',
    unitPrice: 42000,
    outlet: 'Semua Outlet',
    lastRestockDate: '2026-08-10'
  },
  {
    id: 'INV-002',
    name: 'Bumbu Marinasi 11 Rempah Secret',
    category: 'Bumbu & Saus',
    currentStock: 8.2,
    minStock: 3.0,
    unit: 'Kg',
    unitPrice: 75000,
    outlet: 'Semua Outlet',
    lastRestockDate: '2026-08-08'
  },
  {
    id: 'INV-003',
    name: 'Saus Creamy Garlic Base',
    category: 'Bumbu & Saus',
    currentStock: 15.0,
    minStock: 5.0,
    unit: 'Liter',
    unitPrice: 35000,
    outlet: 'Steak 11, Cibubur',
    lastRestockDate: '2026-08-09'
  },
  {
    id: 'INV-004',
    name: 'Potato Wedges Crispy Raw',
    category: 'Sayuran & Karbo',
    currentStock: 22.0,
    minStock: 8.0,
    unit: 'Kg',
    unitPrice: 28000,
    outlet: 'Semua Outlet',
    lastRestockDate: '2026-08-10'
  },
  {
    id: 'INV-005',
    name: 'Paper Rice Box Custom Steak 11',
    category: 'Kemasan & Plastik',
    currentStock: 350,
    minStock: 100,
    unit: 'Pcs',
    unitPrice: 1200,
    outlet: 'Semua Outlet',
    lastRestockDate: '2026-08-05'
  }
];

export const DEFAULT_PROMOS: PromoVoucher[] = [
  {
    id: 'PRM-000',
    code: 'STEAKMERDEKA',
    description: 'Diskon Merdeka Rp 17.000 (Min. Transaksi Rp 50.000)',
    discountType: 'nominal',
    discountValue: 17000,
    minOrderAmount: 50000,
    status: 'Aktif',
    usageCount: 254,
    expiryDate: '2026-12-31'
  },
  {
    id: 'PRM-003',
    code: 'DISCOUNT10K',
    description: 'Diskon Hemat Rp 10.000 (Min. Transaksi Rp 35.000)',
    discountType: 'nominal',
    discountValue: 10000,
    minOrderAmount: 35000,
    status: 'Aktif',
    usageCount: 188,
    expiryDate: '2026-12-31'
  },
  {
    id: 'PRM-001',
    code: 'MYTHIC11',
    description: 'REVIEW GOOGLE MAPS FREE MINI CHICKEN STEAK!!!',
    discountType: 'nominal',
    discountValue: 5000,
    minOrderAmount: 30000,
    status: 'Aktif',
    usageCount: 142,
    expiryDate: '2026-12-31'
  },
  {
    id: 'PRM-002',
    code: 'TEBET20',
    description: 'Diskon 10% Khusus Grand Opening / Event',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 40000,
    maxDiscountAmount: 10000,
    status: 'Aktif',
    usageCount: 89,
    expiryDate: '2026-09-30'
  }
];

export const DEFAULT_CASHIER_SHIFTS: CashierShiftRecord[] = [];

export const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: 'SUP-001',
    name: 'PT Poultry Fresh Subang',
    contactPerson: 'H. Suhendar',
    phone: '081298881234',
    email: 'order@poultryfresh.co.id',
    category: 'Daging Ayam Fresh',
    address: 'Jl. Raya Subang KM 12, Jawa Barat',
    city: 'Subang',
    rating: 5,
    paymentTerms: 'TOP 14 Hari',
    notes: 'Suplier utama paha ayam boneless fillet 100% halal MUI.',
    status: 'Aktif'
  },
  {
    id: 'SUP-002',
    name: 'CV Rempah Nusantara Spice',
    contactPerson: 'Ibu Ratna',
    phone: '081377779900',
    email: 'sales@rempahnusantara.com',
    category: 'Bumbu & Rempah',
    address: 'Kawasan Industri Pasar Induk Kramat Jati, Jakarta Timur',
    city: 'Jakarta',
    rating: 4.8,
    paymentTerms: 'COD / Tunai Saat Kirim',
    notes: 'Pemasok 11 rempah secret & saus garlic cream.',
    status: 'Aktif'
  },
  {
    id: 'SUP-003',
    name: 'PT Packaging Master Indonesia',
    contactPerson: 'Pak Budi Santoso',
    phone: '081511223344',
    email: 'budi@packmaster.id',
    category: 'Kemasan & Plastik',
    address: 'Jl. Daan Mogot KM 18, Cengkareng, Jakarta Barat',
    city: 'Jakarta',
    rating: 4.9,
    paymentTerms: 'Net 30 Hari',
    notes: 'Produsen paper rice box custom logo Steak 11.',
    status: 'Aktif'
  }
];

export const DEFAULT_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'PO-202608-001',
    supplierId: 'SUP-001',
    supplierName: 'PT Poultry Fresh Subang',
    outlet: 'Semua Outlet',
    orderDate: '2026-08-08',
    receivedDate: '2026-08-09',
    items: [
      {
        inventoryItemId: 'INV-001',
        itemName: 'Daging Paha Ayam Boneless Fillet',
        unit: 'Kg',
        quantity: 50,
        unitPrice: 42000,
        subtotal: 2100000
      }
    ],
    totalAmount: 2100000,
    status: 'Diterima',
    paymentStatus: 'Lunas',
    createdBy: 'Manager Pusat',
    notes: 'Kirim pagi jam 07.00 dengan thermobox es.'
  },
  {
    id: 'PO-202608-002',
    supplierId: 'SUP-002',
    supplierName: 'CV Rempah Nusantara Spice',
    outlet: 'Steak 11, Cibubur',
    orderDate: '2026-08-10',
    items: [
      {
        inventoryItemId: 'INV-002',
        itemName: 'Bumbu Marinasi 11 Rempah Secret',
        unit: 'Kg',
        quantity: 10,
        unitPrice: 75000,
        subtotal: 750000
      }
    ],
    totalAmount: 750000,
    status: 'Dipesan',
    paymentStatus: 'Belum Lunas',
    createdBy: 'Budi Santoso',
    notes: 'Pesan mendesak untuk stok persediaan akhir pekan.'
  }
];

export const DEFAULT_EXPENSES: PettyCashExpense[] = [];

export const DEFAULT_RECIPES: MenuRecipe[] = [
  {
    menuId: '1',
    menuName: 'Chicken Steak Crispy',
    ingredients: [
      { inventoryItemId: 'INV-001', inventoryItemName: 'Daging Paha Ayam Boneless Fillet', quantityNeeded: 0.18, unit: 'Kg' },
      { inventoryItemId: 'INV-002', inventoryItemName: 'Bumbu Marinasi 11 Rempah Secret', quantityNeeded: 0.02, unit: 'Kg' },
      { inventoryItemId: 'INV-004', inventoryItemName: 'Potato Wedges Crispy Raw', quantityNeeded: 0.10, unit: 'Kg' },
      { inventoryItemId: 'INV-005', inventoryItemName: 'Paper Rice Box Custom Steak 11', quantityNeeded: 1, unit: 'Pcs' }
    ]
  },
  {
    menuId: '2',
    menuName: 'Chicken Steak Original Grill',
    ingredients: [
      { inventoryItemId: 'INV-001', inventoryItemName: 'Daging Paha Ayam Boneless Fillet', quantityNeeded: 0.20, unit: 'Kg' },
      { inventoryItemId: 'INV-002', inventoryItemName: 'Bumbu Marinasi 11 Rempah Secret', quantityNeeded: 0.025, unit: 'Kg' },
      { inventoryItemId: 'INV-003', inventoryItemName: 'Saus Creamy Garlic Base', quantityNeeded: 0.05, unit: 'Liter' },
      { inventoryItemId: 'INV-005', inventoryItemName: 'Paper Rice Box Custom Steak 11', quantityNeeded: 1, unit: 'Pcs' }
    ]
  }
];

export const DEFAULT_STOCK_OPNAMES: StockOpnameLog[] = [
  {
    id: 'SOP-20260810-001',
    date: '2026-08-10',
    time: '21:30',
    inventoryItemId: 'INV-001',
    inventoryItemName: 'Daging Paha Ayam Boneless Fillet',
    outlet: 'Steak 11, Cibubur',
    systemStock: 48.0,
    actualStock: 45.5,
    difference: -2.5,
    reason: 'Limbah Dapur / Tumpah',
    notes: 'Pemotongan lemak paha berlebih dan penyusutan daging saat thawing.',
    performedBy: 'Chef Asep Saepulloh'
  },
  {
    id: 'SOP-20260809-002',
    date: '2026-08-09',
    time: '21:00',
    inventoryItemId: 'INV-003',
    inventoryItemName: 'Saus Creamy Garlic Base',
    outlet: 'Steak 11, Cibubur',
    systemStock: 15.5,
    actualStock: 15.0,
    difference: -0.5,
    reason: 'Bahan Rusak / Spoilage',
    notes: 'Sisa saus di dasar wadah blender yang tidak terpakai.',
    performedBy: 'Rina Kurnia'
  }
];

export const DEFAULT_STOCK_TRANSFERS: StockTransfer[] = [
  {
    id: 'TRF-20260808-001',
    date: '2026-08-08',
    fromOutlet: 'Gudang Pusat (Subang)',
    toOutlet: 'Steak 11, Cibubur',
    inventoryItemId: 'INV-002',
    inventoryItemName: 'Bumbu Marinasi 11 Rempah Secret',
    quantity: 5,
    unit: 'Kg',
    status: 'Selesai / Diterima',
    notes: 'Pengiriman bumbu rahasia mingguan via Kurir Internal.',
    sentBy: 'Gudang Pusat Subang',
    receivedBy: 'Chef Asep Saepulloh'
  }
];

export const DEFAULT_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'AUD-20260811-001',
    timestamp: '2026-08-11 08:30:15',
    date: '2026-08-11',
    user: 'Rina Kurnia',
    role: 'Kasir',
    outlet: 'Steak 11, Cibubur',
    category: 'Absensi Staff',
    action: 'Clock In Absensi',
    details: 'Absensi masuk shift pagi tepat waktu (08:30:15 WIB)',
    status: 'Berhasil',
    ipAddress: '192.168.1.102'
  },
  {
    id: 'AUD-20260811-002',
    timestamp: '2026-08-11 09:15:00',
    date: '2026-08-11',
    user: 'Chef Asep Saepulloh',
    role: 'Chef / Cook',
    outlet: 'Steak 11, Cibubur',
    category: 'Kelola Stok',
    action: 'Stock Opname',
    details: 'Melakukan stock opname daging paha ayam boneless: Fisik 45.5 kg, System 48.0 kg (Selisih -2.5 kg - Limbah Dapur)',
    status: 'Peringatan',
    ipAddress: '192.168.1.105'
  },
  {
    id: 'AUD-20260811-003',
    timestamp: '2026-08-11 11:20:45',
    date: '2026-08-11',
    user: 'Rina Kurnia',
    role: 'Kasir',
    outlet: 'Steak 11, Cibubur',
    category: 'Transaksi POS',
    action: 'Order POS Selesai',
    details: 'Selesai transaksi ORD-1108 senilai Rp 50.000 via QRIS (Creamy Garlic Herb Steak x2)',
    status: 'Berhasil',
    ipAddress: '192.168.1.102'
  },
  {
    id: 'AUD-20260811-004',
    timestamp: '2026-08-11 13:40:10',
    date: '2026-08-11',
    user: 'Rina Kurnia',
    role: 'Kasir',
    outlet: 'Steak 11, Cibubur',
    category: 'Kas Kecil',
    action: 'Input Petty Cash',
    details: 'Mencatat pengeluaran kas kecil "Pembelian Es Batu Kristal 3 Plastik" senilai Rp 21.000',
    status: 'Berhasil',
    ipAddress: '192.168.1.102'
  },
  {
    id: 'AUD-20260811-005',
    timestamp: '2026-08-11 15:00:22',
    date: '2026-08-11',
    user: 'Rina Kurnia',
    role: 'Kasir',
    outlet: 'Steak 11, Cibubur',
    category: 'Audit Closing',
    action: 'Closing Shift Kasir',
    details: 'Melakukan closing shift pagi. Laci fisik Rp 379.000 vs Teoretis Rp 379.000 (Status: PAS / SEIMBANG)',
    status: 'Berhasil',
    ipAddress: '192.168.1.102'
  },
  {
    id: 'AUD-20260810-006',
    timestamp: '2026-08-10 16:10:00',
    date: '2026-08-10',
    user: 'Admin Manager',
    role: 'Super Admin',
    outlet: 'Steak 11, Kalisari',
    category: 'Data Master',
    action: 'Update Menu',
    details: 'Memperbarui harga promo menu "Spicy Mythic Black Pepper Steak" menjadi Rp 20.000',
    status: 'Berhasil',
    ipAddress: '182.253.11.45'
  },
  {
    id: 'AUD-20260809-007',
    timestamp: '2026-08-09 19:25:00',
    date: '2026-08-09',
    user: 'Manager Outlet',
    role: 'Manager Outlet',
    outlet: 'Steak 11, Kuningan',
    category: 'Penggajian',
    action: 'Persetujuan Payroll',
    details: 'Menyetujui slip gaji bulan Agustus 2026 untuk 4 karyawan cabang Kuningan',
    status: 'Berhasil',
    ipAddress: '180.252.88.12'
  }
];

export const DEFAULT_ROLE_SETTINGS: RoleSetting[] = [
  {
    id: 'role-pengunjung',
    name: 'Pengunjung',
    targetType: 'both',
    description: 'Akses Pengunjung (Visitor / Google Auth). Dapat melihat semua menu dasbor aplikasi, namun tidak dapat mengubah/menghapus data (Read-Only).',
    allowedTabs: ['dashboard', 'kasir', 'pesanan', 'analytics', 'menu', 'racik', 'inventory', 'suppliers', 'purchase_orders', 'reviews', 'promos', 'karyawan', 'absensi', 'presensi_kamera', 'jadwal', 'penggajian', 'shifts', 'expenses', 'outlets', 'wa', 'branding', 'system', 'supabase', 'payment_receipt_settings', 'audit_logs', 'customers', 'pengunjung', 'user_guide']
  },
  {
    id: 'role-super-admin',
    name: 'Super Admin',
    targetType: 'admin',
    description: 'Akses penuh tanpa batas ke seluruh menu sistem, database, audit log, dan pengaturan branding.',
    allowedTabs: ['dashboard', 'kasir', 'pesanan', 'analytics', 'menu', 'racik', 'inventory', 'reviews', 'promos', 'karyawan', 'absensi', 'presensi_kamera', 'jadwal', 'penggajian', 'shifts', 'expenses', 'outlets', 'admin', 'wa', 'branding', 'system', 'supabase', 'payment_receipt_settings', 'audit_logs', 'customers', 'user_guide']
  },
  {
    id: 'role-admin',
    name: 'Admin',
    targetType: 'admin',
    description: 'Akses pengelolaan operasional harian resto, transaksi kasir, persediaan, karyawan, absensi, dan laporan.',
    allowedTabs: ['dashboard', 'kasir', 'pesanan', 'analytics', 'menu', 'racik', 'inventory', 'reviews', 'promos', 'karyawan', 'absensi', 'presensi_kamera', 'jadwal', 'penggajian', 'shifts', 'expenses', 'outlets', 'wa', 'payment_receipt_settings', 'audit_logs', 'customers']
  },
  {
    id: 'role-owner',
    name: 'Owner',
    targetType: 'admin',
    description: 'Akses eksekutif untuk memantau omzet harian, laba rugi, laporan analisis bisnis, audit log, dan ulasan.',
    allowedTabs: ['dashboard', 'analytics', 'reviews', 'promos', 'karyawan', 'absensi', 'presensi_kamera', 'jadwal', 'penggajian', 'shifts', 'expenses', 'outlets', 'audit_logs', 'customers']
  },
  {
    id: 'role-manager-outlet',
    name: 'Manager Outlet',
    targetType: 'both',
    description: 'Manajemen operasional outlet, pesanan, menu, stok, karyawan, absensi, dan closing shift.',
    allowedTabs: ['dashboard', 'kasir', 'pesanan', 'analytics', 'menu', 'racik', 'inventory', 'reviews', 'promos', 'karyawan', 'absensi', 'presensi_kamera', 'jadwal', 'penggajian', 'shifts', 'expenses', 'outlets', 'customers']
  },
  {
    id: 'role-supervisor',
    name: 'Supervisor',
    targetType: 'both',
    description: 'Pengawasan staf shift harian, pemantauan pesanan, persediaan stok, ulasan pelanggan, dan absensi.',
    allowedTabs: ['dashboard', 'kasir', 'pesanan', 'menu', 'racik', 'inventory', 'reviews', 'absensi', 'presensi_kamera', 'jadwal', 'shifts']
  },
  {
    id: 'role-kasir',
    name: 'Kasir',
    targetType: 'both',
    description: 'Akses transaksi kasir POS, daftar pesanan masuk, cetak struk thermal, closing shift, dan absensi.',
    allowedTabs: ['kasir', 'pesanan', 'inventory', 'reviews', 'shifts', 'absensi', 'presensi_kamera', 'customers']
  },
  {
    id: 'role-chef',
    name: 'Chef / Cook',
    targetType: 'employee',
    description: 'Akses antrean pesanan dapur, resep racik steak, cek stok bahan baku, dan absensi selfie.',
    allowedTabs: ['kasir', 'pesanan', 'menu', 'racik', 'inventory', 'absensi', 'presensi_kamera', 'jadwal']
  },
  {
    id: 'role-waitress',
    name: 'Waitress / Waiter',
    targetType: 'employee',
    description: 'Akses antrean pesanan masuk, pemanggilan pelanggan, ulasan meja, dan absensi selfie.',
    allowedTabs: ['kasir', 'pesanan', 'reviews', 'absensi', 'presensi_kamera', 'jadwal']
  },
  {
    id: 'role-barista',
    name: 'Barista',
    targetType: 'employee',
    description: 'Akses pesanan minuman beverage, cek persediaan stok bahan minuman, dan absensi selfie.',
    allowedTabs: ['kasir', 'pesanan', 'inventory', 'absensi', 'presensi_kamera', 'jadwal']
  },
  {
    id: 'role-staff-dapur',
    name: 'Staff Dapur',
    targetType: 'employee',
    description: 'Persiapan bahan mentah (prep kitchen), pemotongan daging & bumbu, serta absensi selfie.',
    allowedTabs: ['pesanan', 'racik', 'inventory', 'absensi', 'presensi_kamera', 'jadwal']
  },
  {
    id: 'role-driver',
    name: 'Driver / Kurir',
    targetType: 'employee',
    description: 'Pengantaran pesanan delivery outlet, daftar pengiriman, dan absensi selfie.',
    allowedTabs: ['pesanan', 'absensi', 'presensi_kamera', 'jadwal']
  },
  {
    id: 'role-cleaning-staff',
    name: 'Cleaning Staff',
    targetType: 'employee',
    description: 'Kebersihan area dining & kitchen, kelengkapan fasilitas outlet, dan absensi selfie.',
    allowedTabs: ['absensi', 'presensi_kamera', 'jadwal']
  },
  {
    id: 'role-hr-finance',
    name: 'HR & Finance Admin',
    targetType: 'admin',
    description: 'Kelola data karyawan, absensi digital, penggajian/payroll slip, dan laporan keuangan.',
    allowedTabs: ['dashboard', 'analytics', 'karyawan', 'absensi', 'presensi_kamera', 'jadwal', 'penggajian', 'shifts', 'expenses', 'payment_receipt_settings', 'audit_logs']
  },
  {
    id: 'role-admin-kasir',
    name: 'Admin Kasir',
    targetType: 'admin',
    description: 'Akses transaksi kasir POS, daftar pesanan masuk, pantau stok, ulasan, dan laporan closing shift.',
    allowedTabs: ['dashboard', 'kasir', 'pesanan', 'inventory', 'reviews', 'shifts', 'absensi', 'presensi_kamera', 'customers']
  }
];

export const DEFAULT_STOCK_MUTATIONS: StockMutation[] = [
  {
    id: 'MUT-20260811-001',
    timestamp: '2026-08-11 08:00:00',
    date: '2026-08-11',
    inventoryItemId: 'INV-001',
    inventoryItemName: 'Daging Paha Ayam Boneless Fillet',
    outlet: 'Semua Outlet',
    mutationType: 'Masuk (PO Pembelian)',
    quantity: 50.0,
    unit: 'Kg',
    stockBefore: 0.0,
    stockAfter: 50.0,
    referenceNo: 'PO-2026-001',
    notes: 'Penerimaan bahan baku segar dari PT Poultry Fresh Subang',
    performedBy: 'Gudang Pusat Subang'
  },
  {
    id: 'MUT-20260811-002',
    timestamp: '2026-08-11 09:15:00',
    date: '2026-08-11',
    inventoryItemId: 'INV-001',
    inventoryItemName: 'Daging Paha Ayam Boneless Fillet',
    outlet: 'Steak 11, Cibubur',
    mutationType: 'Keluar (Opname/Limbah)',
    quantity: -2.0,
    unit: 'Kg',
    stockBefore: 50.0,
    stockAfter: 48.0,
    referenceNo: 'OPN-20260811-01',
    notes: 'Selisih limbah pemotongan & pembersihan lemak paha',
    performedBy: 'Chef Asep Saepulloh'
  },
  {
    id: 'MUT-20260811-003',
    timestamp: '2026-08-11 11:30:00',
    date: '2026-08-11',
    inventoryItemId: 'INV-001',
    inventoryItemName: 'Daging Paha Ayam Boneless Fillet',
    outlet: 'Steak 11, Cibubur',
    mutationType: 'Keluar (Penjualan POS)',
    quantity: -2.5,
    unit: 'Kg',
    stockBefore: 48.0,
    stockAfter: 45.5,
    referenceNo: 'POS-20260811-BATCH',
    notes: 'Pemakaian resep terpotong otomatis dari 25 porsi Creamy Garlic Steak',
    performedBy: 'Sistem Kasir Auto'
  },
  {
    id: 'MUT-20260810-004',
    timestamp: '2026-08-10 14:00:00',
    date: '2026-08-10',
    inventoryItemId: 'INV-003',
    inventoryItemName: 'Saus Creamy Garlic Base',
    outlet: 'Steak 11, Cibubur',
    mutationType: 'Masuk (Transfer Outlet)',
    quantity: 5.0,
    unit: 'Liter',
    stockBefore: 10.0,
    stockAfter: 15.0,
    referenceNo: 'TRF-20260810-001',
    notes: 'Transfer masuk saus dari Gudang Pusat Subang',
    performedBy: 'Chef Asep Saepulloh'
  }
];

export const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-001',
    name: 'Budi Santoso',
    phone: '6281234567890',
    email: 'budi.santoso@gmail.com',
    address: 'Jl. Cibubur Indah No. 12, Cibubur, Jakarta Timur',
    favoriteOutlet: 'Steak 11, Cibubur',
    totalOrders: 14,
    totalSpent: 350000,
    lastOrderDate: '2026-08-10',
    loyaltyPoints: 350,
    tier: 'Gold',
    notes: 'Suka saus Creamy Garlic, pedas sedang, sering pesan via Dine In meja 03.',
    tags: ['VIP', 'Pelanggan Setia', 'Lover Creamy Garlic'],
    createdAt: '2026-01-15'
  },
  {
    id: 'CUST-002',
    name: 'Siti Rahma',
    phone: '6289876543210',
    email: 'siti.rahma@yahoo.com',
    address: 'Jl. Prof. Dr. Satrio No. 5, Karet Kuningan, Jakarta Selatan',
    favoriteOutlet: 'Steak 11, Kuningan',
    totalOrders: 8,
    totalSpent: 210000,
    lastOrderDate: '2026-08-10',
    loyaltyPoints: 210,
    tier: 'Silver',
    notes: 'Pekerja kantor Kuningan, rutin order makan siang delivery via WhatsApp.',
    tags: ['Delivery Rutin', 'Lover Black Pepper'],
    createdAt: '2026-03-20'
  },
  {
    id: 'CUST-003',
    name: 'Ahmad Fauzi',
    phone: '6281311223344',
    email: 'ahmad.fauzi@outlook.com',
    address: 'Jl. Radar Auri No. 88, Cibubur',
    favoriteOutlet: 'Steak 11, Cibubur',
    totalOrders: 22,
    totalSpent: 620000,
    lastOrderDate: '2026-08-10',
    loyaltyPoints: 620,
    tier: 'Platinum',
    notes: 'Member Platinum Steak 11. Sering bawa keluarga 4 porsi tiap akhir pekan.',
    tags: ['Platinum Member', 'Porsi Keluarga', 'Gofood Superfan'],
    createdAt: '2025-11-05'
  },
  {
    id: 'CUST-004',
    name: 'Dewi Lestari',
    phone: '6285712345678',
    email: 'dewilestari@gmail.com',
    address: 'Kalisari, Pasar Rebo, Jakarta Timur',
    favoriteOutlet: 'Steak 11, Kalisari',
    totalOrders: 5,
    totalSpent: 115000,
    lastOrderDate: '2026-08-10',
    loyaltyPoints: 115,
    tier: 'Bronze',
    notes: 'Suka Smoky BBQ Steak & ekstra kentang wedges.',
    tags: ['Pelanggan Baru', 'Bawa Pulang'],
    createdAt: '2026-06-12'
  },
  {
    id: 'CUST-005',
    name: 'Rizky Pratama',
    phone: '6281987654321',
    email: 'rizky.pratama@techcompany.com',
    address: 'Jl. Kalisari Raya No. 45, Jakarta Timur',
    favoriteOutlet: 'Steak 11, Kalisari',
    totalOrders: 11,
    totalSpent: 290000,
    lastOrderDate: '2026-08-10',
    loyaltyPoints: 290,
    tier: 'Gold',
    notes: 'Pelanggan favorit menu pedas Spicy Mythic Black Pepper.',
    tags: ['Gold Member', 'Pedas Mania'],
    createdAt: '2026-02-18'
  }
];

export const DEFAULT_WA_GATEWAY_CONFIG: WaGatewayConfig = {
  serverUrl: 'http://localhost:3000/api/wa',
  apiKey: 'STEAK11_GATEWAY_KEY_2026',
  deviceNumber: '+62 812-2323-3299',
  status: 'connected',
  qrCodeData: '2@STEAK11_WA_SESSION_TOKEN_SAMPLE_QR_CODE_DATA_2026',
  autoSendOrderNotif: true,
  autoSendStatusNotif: true,
  templateOrderNotif: `*NOTIFIKASI PESANAN MASUK - STEAK 11*\n---------------------------\nHalo Kak *{NAMA}*!\n\nOrder ID: *#{ORDER_ID}*\nOutlet: *{OUTLET}*\nTipe Layanan: *{SERVICE_TYPE}*\n\n*Rincian Pesanan:*\n{ITEMS_SUMMARY}\n\n*Total Pembayaran:* {TOTAL}\n*Metode:* {PAYMENT_METHOD}\n\nTerima kasih telah memesan di Steak 11 Mythic Chicken Taste! 🍗✨`,
  templateStatusNotif: `*UPDATE STATUS PESANAN - STEAK 11*\n---------------------------\nHalo Kak *{NAMA}*,\n\nPesanan Anda *#{ORDER_ID}* saat ini berstatus: *{STATUS}*!\n\nOutlet: {OUTLET}\nItem: {ITEMS_SUMMARY}\n\nSilakan dinikmati dan jangan lupa beri ulasan terbaik Anda ya Kak! ⭐⭐⭐⭐⭐`,
  templatePromoNotif: `🔥 *PROMO CHICKEN STEAK MYTHIC 11* 🔥\n---------------------------\nHalo Kak *{NAMA}*,\n\nAda promo spesial diskon Rp 5.000 untuk transaksi berikutnya di Steak 11!\nGunakan Kode Voucher: *MYTHIC11*\n\nTunjukkan pesan WA ini saat memesan di kasir outlet atau saat chat pesan online!\n\n_Steak 11 - Bukan Sekadar Steak Ayam Biasa!_`
};

export const DEFAULT_SHIFT_TEMPLATES: WorkShiftTemplate[] = [
  { id: 'shift-off', name: 'OFF / Libur', startTime: '00:00', endTime: '00:00', color: 'slate', outlet: 'Semua Outlet', isOff: true, notes: 'Hari libur rutin harian' }
];

export const getStoredShiftTemplates = (): WorkShiftTemplate[] => {
  try {
    const raw = localStorage.getItem('steak11_shift_templates');
    if (raw) {
      const parsed: WorkShiftTemplate[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (t) => !['shift-1', 'shift-2', 'shift-3'].includes(t.id) &&
                 !['shift pagi', 'shift siang / mid', 'shift siang', 'shift malam'].includes((t.name || '').toLowerCase().trim())
        );
      }
    }
  } catch (e) {
    console.error('Failed to parse shift templates from storage', e);
  }
  return DEFAULT_SHIFT_TEMPLATES;
};

export const saveShiftTemplates = (data: WorkShiftTemplate[]) => {
  try {
    localStorage.setItem('steak11_shift_templates', JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save shift templates to storage', e);
  }
};

export const getStoredSchedules = (): EmployeeSchedule[] => {
  try {
    const raw = localStorage.getItem('steak11_employee_schedules');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse schedules from storage', e);
  }
  return [];
};

export const saveSchedules = (data: EmployeeSchedule[]) => {
  try {
    localStorage.setItem('steak11_employee_schedules', JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save schedules to storage', e);
  }
};

export const DEFAULT_EMPLOYEE_LOANS: EmployeeLoan[] = [];

export const getStoredEmployeeLoans = (): EmployeeLoan[] => {
  try {
    const raw = localStorage.getItem('steak11_employee_loans');
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((l: any) => l.id !== 'LOAN-1001' && l.id !== 'LOAN-1002');
      }
    }
  } catch (e) {
    console.error('Failed to parse employee loans from storage', e);
  }
  return [];
};

export const saveEmployeeLoans = (data: EmployeeLoan[]) => {
  try {
    const cleanData = (data || []).filter((l) => l.id !== 'LOAN-1001' && l.id !== 'LOAN-1002');
    localStorage.setItem('steak11_employee_loans', JSON.stringify(cleanData));
  } catch (e) {
    console.error('Failed to save employee loans to storage', e);
  }
};





