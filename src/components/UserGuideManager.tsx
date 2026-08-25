import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  ShoppingCart,
  Camera,
  DollarSign,
  Package,
  Printer,
  Upload,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Tag,
  Wifi,
  FileSpreadsheet,
  Building2,
  Key,
  HardDrive,
  HelpCircle,
  Info,
  TrendingUp,
  Flame,
  Clock,
  PhoneCall,
  Calendar,
  MessageSquare,
  Repeat,
  Sliders,
  Database,
  FileText,
  CreditCard,
  ChefHat,
  MapPin
} from 'lucide-react';

interface UserGuideManagerProps {
  onNavigateTab?: (tab: string) => void;
}

interface GuideItem {
  id: string;
  category: 'pos' | 'absensi' | 'payroll' | 'inventory' | 'finance' | 'crm' | 'receipt' | 'system' | 'users';
  categoryLabel: string;
  categoryIcon: any;
  title: string;
  summary: string;
  badge?: string;
  targetTab?: string;
  steps: string[];
  tips?: string[];
  warnings?: string[];
}

interface FaqItem {
  q: string;
  a: string;
  category: string;
}

export const UserGuideManager: React.FC<UserGuideManagerProps> = ({ onNavigateTab }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>('guide-pos-1');
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);

  const guides: GuideItem[] = [
    // 1. KASIR POS & TRANSAKSI
    {
      id: 'guide-pos-1',
      category: 'pos',
      categoryLabel: 'Kasir POS & Transaksi',
      categoryIcon: ShoppingCart,
      title: '1. Membuat Pesanan Baru & Pemilihan Varian Steak',
      summary: 'Panduan melayani pelanggan di Kasir POS, memilih opsi Dine In / Takeaway, racikan saus, dan add-on.',
      badge: 'Utama POS',
      targetTab: 'kasir',
      steps: [
        'Buka menu "Kasir POS" di bilah navigasi utama.',
        'Pilih tipe layanan: Dine In (Makan di Tempat) atau Takeaway (Bawa Pulang). Jika Dine In, tentukan nomor meja.',
        'Klik pada kartu menu yang diinginkan (contoh: Creamy Garlic Herb Steak atau Mythic Chicken Steak 20K).',
        'Sesuaikan varian porsi (Original / Crispy), pilihan saus (Blackpepper, Mushroom, BBQ, Creamy Garlic), dan menu pendamping (Potato Wedges, Extra Sauce).',
        'Klik "Tambah ke Keranjang". Item akan otomatis masuk ke panel rincian pesanan di sebelah kanan.',
        'Periksa daftar pesanan, lalu klik tombol "Proses Pembayaran".'
      ],
      tips: [
        'Gunakan kolom pencarian cepat di bagian atas kasir untuk mencari menu berdasarkan nama atau kode dengan instan.'
      ]
    },
    {
      id: 'guide-pos-2',
      category: 'pos',
      categoryLabel: 'Kasir POS & Transaksi',
      categoryIcon: Tag,
      title: '2. Penerapan Kode Promo & Voucher Diskon',
      summary: 'Cara menginput atau memilih chip voucher diskon (nominal / persen) untuk memotong total bayar pelanggan.',
      badge: 'Promo & Voucher',
      targetTab: 'kasir',
      steps: [
        'Pada panel Keranjang Kasir, perhatikan kolom "Kode Promo / Voucher Diskon".',
        'Ketikkan kode promo secara manual (contoh: STEAKMERDEKA, PROMO20K) atau klik chip promo aktif di bawahnya.',
        'Klik tombol "Terapkan".',
        'Sistem akan memverifikasi syarat minimum belanja dan menghitung potongan harga otomatis.',
        'Jumlah diskon akan tertera jelas pada rincian bayar, struk thermal, dan pesan WA pelanggan.'
      ],
      tips: [
        'Klik chip promo berwarna hijau/kuning untuk menerapkan promo dalam 1-klik tanpa perlu mengetik.'
      ]
    },
    {
      id: 'guide-pos-3',
      category: 'pos',
      categoryLabel: 'Kasir POS & Transaksi',
      categoryIcon: DollarSign,
      title: '3. Metode Pembayaran (QRIS, Tunai, Transfer, EDC) & Struk',
      summary: 'Proses penyelesaian pembayaran via QRIS, Uang Tunai, Bank Transfer, dan cetak struk kasir.',
      badge: 'Pembayaran',
      targetTab: 'kasir',
      steps: [
        'Pada modal Pembayaran, pilih metode bayar: Tunai, QRIS, Transfer Bank, atau Kartu Debit (EDC).',
        'Jika Pembayaran Tunai: Input nominal uang yang diterima. Sistem akan menghitung uang kembalian secara otomatis.',
        'Jika QRIS / Transfer: Tampilkan kode QRIS di layar kepada pelanggan untuk di-scan.',
        'Klik "Selesaikan Transaksi & Cetak Struk".',
        'Struk transaksi akan otomatis muncul dalam modal cetak thermal untuk siap diprint ke printer Bluetooth/USB.'
      ]
    },
    {
      id: 'guide-pos-4',
      category: 'pos',
      categoryLabel: 'Kasir POS & Transaksi',
      categoryIcon: Wifi,
      title: '4. Mode Offline Transaksi Kasir & Auto-Sync Online',
      summary: 'Penjelasan cara kerja Kasir POS saat koneksi internet terputus (offline mode).',
      badge: 'Offline Mode',
      targetTab: 'kasir',
      steps: [
        'Saat internet terputus, banner merah "Mode Offline (Internet Terputus)" akan otomatis muncul di bagian atas.',
        'Kasir dapat tetap memproses transaksi seperti biasa. Data pesanan & presensi akan tersimpan secara aman di memori lokal.',
        'Ketika internet terhubung kembali, banner hijau "Internet Terhubung Kembali" akan aktif dan sistem otomatis menyinkronkan seluruh data ke Cloud Firestore.'
      ],
      warnings: [
        'Jangan menghapus cache browser saat dalam kondisi offline agar transaksi yang belum di-sync tidak hilang.'
      ]
    },

    // 2. ABSENSI KAMERA WATERMARK & SHIFT
    {
      id: 'guide-absensi-1',
      category: 'absensi',
      categoryLabel: 'Absensi Kamera Watermark',
      categoryIcon: Camera,
      title: '5. Presensi Kamera Selfie & Watermark Lokasi Staff',
      summary: 'Proses presensi masuk & pulang karyawan dengan verifikasi foto selfie, GPS lokasi outlet, dan jam WIB.',
      badge: 'Presensi Kamera',
      targetTab: 'presensi_kamera',
      steps: [
        'Buka menu "Presensi Kamera Selfie" (atau klik tombol Modal Presensi di Kasir).',
        'Pilih Nama Karyawan dari daftar dropdown.',
        'Masukkan PIN Presensi 4-Digit milik karyawan.',
        'Pilih Lokasi Outlet tempat bertugas.',
        'Klik "Buka Kamera" dan berikan izin (*allow*) akses kamera & lokasi pada browser.',
        'Posisikan wajah dengan jelas, lalu klik "Presensi MASUK" atau "Presensi PULANG".',
        'Foto selfie akan otomatis dibubuhi Watermark Logo Steak 11, Nama Karyawan, Jam WIB, dan Alamat Outlet.'
      ],
      tips: [
        'Hasil presensi dapat langsung dikirimkan sebagai bukti pesan WhatsApp ke Supervisor / Group Manager.'
      ],
      warnings: [
        'Pastikan izin Kamera dan Lokasi (GPS) browser dalam status aktif agar watermark lokasi akurat.'
      ]
    },
    {
      id: 'guide-absensi-2',
      category: 'absensi',
      categoryLabel: 'Absensi Kamera Watermark',
      categoryIcon: Calendar,
      title: '6. Pengaturan Jadwal Shift Kerja Roster Karyawan',
      summary: 'Cara mengatur jadwal shift (Pagi, Siang, Malam, Libur) per karyawan dan outlet cabang.',
      badge: 'Jadwal Shift',
      targetTab: 'jadwal',
      steps: [
        'Buka menu "Jadwal Shift Kerja" di Dashboard Admin.',
        'Pilih Outlet dan Periode Minggu/Bulan yang ingin diatur.',
        'Tentukan jam kerja shift (misal: Shift Pagi 08:00 - 16:00, Shift Malam 15:00 - 23:00).',
        'Klik pada sel kalender karyawan untuk menetapkan status shift (Pagi, Malam, Off/Libur).',
        'Klik tombol "Simpan Jadwal Roster".'
      ]
    },

    // 3. PENGGAJIAN & PAYROLL
    {
      id: 'guide-payroll-1',
      category: 'payroll',
      categoryLabel: 'Penggajian & Payroll',
      categoryIcon: FileSpreadsheet,
      title: '7. Siklus Cut-Off 25 & Kalkulasi Gaji Otomatis Terintegrasi Presensi Digital',
      summary: 'Perhitungan gaji pokok, lembur, tunjangan tepat waktu, denda keterlambatan, kasbon dengan siklus cut-off 25 ketemu 25, dan cetak slip gaji PDF / WA.',
      badge: 'Siklus Cut-Off 25',
      targetTab: 'penggajian',
      steps: [
        'Buka menu "Penggajian / Payroll" di Dashboard Admin.',
        'Pilih Mode Siklus: "⭐ Siklus Cut-Off 25" (tgl 25 bulan lalu s/d 24 bulan berjalan) atau "🗓️ Bulan Kalender (1–Akhir)".',
        'Pilih Bulan Gaji (contoh: September 2026). Tanggal Cut-off (25/08 s/d 24/09) dan Tanggal Bayar (25/09) akan terisi otomatis.',
        'Klik tombol "Hitung Otomatis Cut-Off" (Berikon Bintang Sparkles).',
        'Sistem akan otomatis menghitung: Total Hari Hadir, Presensi Tepat Waktu (Rp 15.000/hari), Upah Lembur, Potongan Denda Terlambat, dan Potongan Cicilan Kasbon Pinjaman dalam rentang tgl 25 s/d 24.',
        'Klik ikon "PDF" untuk mencetak Slip Gaji resmi, atau klik "WA" untuk mengirim rincian slip langsung ke nomor WhatsApp karyawan.',
        'Gunakan tombol "Ekspor Excel" untuk mengunduh rekapitulasi penggajian lengkap dengan rincian periode cut-off.'
      ],
      tips: [
        'Pilih mode "⚙️ Kustom Rentang" jika ingin menghitung gaji dengan rentang tanggal khusus di luar tanggal 25.'
      ]
    },

    // 4. STRUK & PRINTER THERMAL
    {
      id: 'guide-receipt-1',
      category: 'receipt',
      categoryLabel: 'Struk & Printer Thermal',
      categoryIcon: Printer,
      title: '8. Pengaturan Format Struk Per Outlet & Logo Brand',
      summary: 'Mengatur header kustom per cabang, mengunggah foto logo brand, dan menyesuaikan ukuran logo.',
      badge: 'Custom Struk',
      targetTab: 'payment_receipt_settings',
      steps: [
        'Buka menu "Pembayaran & Struk", lalu klik tab "Pengaturan Struk Thermal".',
        'Pilih Target Outlet pada dropdown (misal: "Semua Outlet" atau cabang spesifik "Outlet Cibubur").',
        'Unggah foto logo brand dengan mengklik tombol "Upload Logo" atau masukkan URL gambar logo.',
        'Pilih Ukuran Tampilan Logo (Kecil - 40px, Sedang - 56px, Besar - 80px, atau Jumbo - 112px).',
        'Isi Teks Header Cabang, Slogan Toko, Alamat Outlet, No. Telepon, dan Catatan Kaki Struk.',
        'Klik tombol "Simpan Pengaturan Struk".'
      ]
    },
    {
      id: 'guide-receipt-2',
      category: 'receipt',
      categoryLabel: 'Struk & Printer Thermal',
      categoryIcon: Wifi,
      title: '9. Reset Nomor Struk dari 0 & Info Wi-Fi Pelanggan',
      summary: 'Mengubah prefix nomor struk (ORD-), mereset nomor urut dari 0, serta menampilkan password Wi-Fi toko.',
      badge: 'Format Struk',
      targetTab: 'payment_receipt_settings',
      steps: [
        'Pada menu Pengaturan Struk, gulir ke seksi "Format & Reset Nomor Struk".',
        'Atur Prefix No. Struk (misal: ORD-, INV-, STR-).',
        'Klik tombol "Reset No. Struk dari 1 (0)" untuk mengembalikan nomor urut pesanan ke awal.',
        'Aktifkan opsi "Tampilkan Informasi Wi-Fi Pelanggan di Struk".',
        'Isi SSID Nama Wi-Fi dan Password Wi-Fi toko.',
        'Klik "Simpan Pengaturan Struk". Informasi Wi-Fi akan otomatis dicetak pada bagian bawah struk.'
      ]
    },

    // 5. STOK & SUPPLY CHAIN
    {
      id: 'guide-inventory-1',
      category: 'inventory',
      categoryLabel: 'Stok & Supply Chain',
      categoryIcon: Package,
      title: '10. Manajemen Stok Bahan Baku, Supplier & PO',
      summary: 'Mengelola persediaan daging ayam, saus, bumbu, membuat Purchase Order ke supplier, dan opname stok.',
      badge: 'Inventory Control',
      targetTab: 'inventory',
      steps: [
        'Buka menu "Manajemen Stok / Inventory".',
        'Untuk Tambah Bahan Baku Baru: Klik "Tambah Item Bahan Baku", tentukan nama bahan, satuan (kg, gram, pcs), harga satuan, dan batas minimal stok.',
        'Untuk Pesanan ke Supplier (PO): Buka sub-tab "Purchase Orders (PO)", klik "Buat PO Baru", pilih Supplier dan rincian barang.',
        'Setelah barang fisik dikirim supplier dan tiba di toko, ubah status PO menjadi "Diterima (Received)" agar stok otomatis bertambah.',
        'Gunakan sub-tab "Opname Stok" untuk mencocokkan stok fisik aktual dengan stok catatan sistem.'
      ]
    },

    // 6. KEUANGAN & AUDIT KASIR
    {
      id: 'guide-finance-1',
      category: 'finance',
      categoryLabel: 'Keuangan & Audit Kasir',
      categoryIcon: TrendingUp,
      title: '11. Shift Pembukaan/Penutupan Kasir & Kas Kecil (Petty Cash)',
      summary: 'Pencatatan kas awal modal kasir, penutupan shift kasir, pencatatan pengeluaran harian, dan analisis omzet.',
      badge: 'Keuangan POS',
      targetTab: 'shifts',
      steps: [
        'Saat Kasir Membuka Shift: Buka menu "Laporan Keuangan", catat modal saldo awal kas (misal: Rp 200.000).',
        'Mencatat Pengeluaran Toko: Buka sub-tab "Pengeluaran Kas Kecil", klik "Tambah Pengeluaran", masukkan nominal dan foto nota pembelanjaan (misal: beli es batu/gas).',
        'Saat Penutupan Shift Kasir: Klik "Tutup Shift Kasir", hitung fisik uang tunai di laci kasir. Sistem akan membandingkan otomatis saldo sistem vs saldo fisik.',
        'Buka menu "Analisis Keuangan" untuk melihat grafik omzet bulanan, total margin profit, dan metode bayar terpopuler.'
      ]
    },

    // 7. CRM & PELANGGAN
    {
      id: 'guide-crm-1',
      category: 'crm',
      categoryLabel: 'CRM & Pelanggan WA',
      categoryIcon: PhoneCall,
      title: '12. Data Pelanggan CRM & Broadcast WhatsApp',
      summary: 'Pencatatan riwayat belanja pelanggan, poin loyalitas, dan integrasi notifikasi gateway WhatsApp.',
      badge: 'CRM & WA',
      targetTab: 'customers',
      steps: [
        'Setiap kali transaksi dibuat di kasir dengan mencantumkan No. HP pelanggan, data pelanggan otomatis tersimpan di database CRM.',
        'Buka menu "Data Pelanggan & WA" untuk melihat total riwayat belanja dan total poin tiap pelanggan.',
        'Buka menu "Notifikasi WhatsApp" untuk mengaktifkan notifikasi otomatis ke WA pelanggan saat pesanan dibuat atau diproses.',
        'Gunakan fitur Broadcast WA untuk mengirimkan pesan promosi promo terbaru ke seluruh pelanggan toko.'
      ]
    },

    // 8. PEMBARUAN SYSTEM & FIREBASE
    {
      id: 'guide-system-1',
      category: 'system',
      categoryLabel: 'System & Firebase',
      categoryIcon: HardDrive,
      title: '13. Pembaruan Software Aplikasi via Berkas ZIP',
      summary: 'Mengunggah file paket update .zip versi terbaru tanpa mengganggu atau menghapus data di Firestore.',
      badge: 'System Update',
      targetTab: 'system',
      steps: [
        'Buka menu "Integrasi & System" di Dashboard Admin.',
        'Gulir ke seksi "Pembaruan Aplikasi via File ZIP (System Software Update)".',
        'Klik tombol "Pilih File Update ZIP...".',
        'Pilih berkas bundle update berformat .zip.',
        'Sistem akan memproses ekstraksi kode software dan menampilkan ukuran file (MB), total berkas, dan status keamanan database (🛡️ Safe Untouched).'
      ],
      tips: [
        'Seluruh database transaksi, outlet, karyawan, dan settings tersimpan aman terpisah di Cloud Firestore, sehingga proses update software 100% aman.'
      ]
    },
    {
      id: 'guide-system-2',
      category: 'system',
      categoryLabel: 'System & Firebase',
      categoryIcon: Database,
      title: '14. Integrasi Real-Time Firebase Cloud Firestore & Google Sheets (GAS)',
      summary: 'Konfigurasi koneksi database Firebase Cloud Firestore dan backup sekunder ke Google Sheets Apps Script.',
      badge: 'Database Cloud',
      targetTab: 'firebase',
      steps: [
        'Buka menu "Firebase Sync" untuk memeriksa status sinkronisasi real-time Firebase Cloud Firestore.',
        'Seluruh transaksi, stok, dan absensi tersinkronkan secara otomatis antar perangkat kasir & admin.',
        'Jika ingin mengaktifkan backup otomatis ke Google Spreadsheet: Buka menu "Integrasi & System", masukkan URL Web App Google Apps Script (GAS), lalu klik "Uji Koneksi" & "Simpan URL".'
      ]
    },

    // 9. HAK AKSES & PENGATURAN BRAND
    {
      id: 'guide-users-1',
      category: 'users',
      categoryLabel: 'Hak Akses & Branding',
      categoryIcon: Users,
      title: '15. Pengaturan Role Karyawan, User Admin & Hak Akses (RBAC)',
      summary: 'Menambah staf, mengatur PIN presensi 4-digit, dan membatasi centang menu yang boleh diakses.',
      badge: 'RBAC Access',
      targetTab: 'karyawan',
      steps: [
        'Buka menu "Data Karyawan" di Dashboard Admin.',
        'Klik "Tambah Karyawan Baru". Isi Nama Lengkap, Jabatan (Kasir, Manager, Chef), Outlet Tugas, Gaji Harian, dan PIN Presensi 4-Digit.',
        'Untuk Pengaturan Akun Login Admin: Buka menu "Admin System". Tambahkan Username & Password login.',
        'Tentukan Centang Hak Akses Menu yang diizinkan untuk akun tersebut. Menu yang tidak dicentang akan otomatis disembunyikan dari sidebar pengguna.'
      ]
    },
    {
      id: 'guide-users-2',
      category: 'users',
      categoryLabel: 'Hak Akses & Branding',
      categoryIcon: Sparkles,
      title: '16. Identitas Toko, Banner Hero & Running Text Footer Web',
      summary: 'Mengubah nama brand, tagline, logo toko, banner hero beranda, dan running text di Landing Page.',
      badge: 'Branding Store',
      targetTab: 'branding',
      steps: [
        'Buka menu "Identitas & Branding" (atau seksi 2 pada menu "Integrasi & System").',
        'Ubah Nama Brand / Toko (contoh: STEAK 11), Slogan Utama, dan Sub-tagline Hero.',
        'Unggah Foto Logo Brand Utama dan Foto Hero Banner Steak.',
        'Atur Teks Pengumuman Header Top (Announcement Bar) dan Teks Berjalan Footer (Running Text Banner).',
        'Klik tombol "Simpan & Terapkan Branding Toko". Tampilan Landing Page akan langsung ter-update otomatis.'
      ]
    }
  ];

  const categories = [
    { id: 'all', label: 'Semua Tutorial', icon: BookOpen },
    { id: 'pos', label: 'Kasir POS & Transaksi', icon: ShoppingCart },
    { id: 'absensi', label: 'Absensi Kamera Watermark', icon: Camera },
    { id: 'payroll', label: 'Penggajian & Payroll', icon: FileSpreadsheet },
    { id: 'receipt', label: 'Struk & Printer Thermal', icon: Printer },
    { id: 'inventory', label: 'Stok & Supply Chain', icon: Package },
    { id: 'finance', label: 'Keuangan & Audit Kasir', icon: TrendingUp },
    { id: 'crm', label: 'CRM & Pelanggan WA', icon: PhoneCall },
    { id: 'system', label: 'System & Firebase', icon: HardDrive },
    { id: 'users', label: 'Hak Akses & Branding', icon: Users }
  ];

  const faqs: FaqItem[] = [
    {
      q: 'Bagaimana jika aplikasi kasir terputus dari jaringan internet saat ada pesanan?',
      a: 'Aplikasi Steak 11 dilengkapi teknologi Offline-First PWA. Transaksi tetap dapat dilakukan seperti biasa. Data disimpan aman di memori browser lokal dan akan otomatis di-sync ke Cloud Firestore begitu koneksi online kembali.',
      category: 'pos'
    },
    {
      q: 'Apakah pembaruan software via file ZIP akan menghapus data penjualan & transaksi?',
      a: 'Sama sekali TIDAK. Seluruh database transaksi, stok, karyawan, dan outlet tersimpan terpisah di Cloud Firestore. Proses update via berkas ZIP hanya memperbarui berkas kode aplikasi tanpa menyentuh database.',
      category: 'system'
    },
    {
      q: 'Bagaimana cara menambahkan lokasi cabang outlet baru?',
      a: 'Buka menu "Outlet & Shift Rules" di Dashboard Admin. Klik tombol "Tambah Outlet Baru", masukkan Nama Cabang, Alamat Lengkap, No. HP/WA Outlet, Jam Operasional, dan Aturan Shift. Outlet baru akan langsung aktif di kasir.',
      category: 'system'
    },
    {
      q: 'Mengapa menu tertentu tidak muncul di sidebar karyawan?',
      a: 'Hal ini karena sistem pembatasan Hak Akses (RBAC). Admin dapat mengatur menu yang diizinkan melalui menu "Admin System" atau "Data Karyawan" dengan mencentang daftar modul yang boleh diakses.',
      category: 'users'
    },
    {
      q: 'Bagaimana cara mencetak slip gaji karyawan?',
      a: 'Buka menu "Penggajian / Payroll", hitung ulang gaji periode bulan terkait. Pada tabel rekapitulasi gaji, klik ikon Printer di sebelah kanan baris nama karyawan untuk mencetak Slip Gaji PDF resmi.',
      category: 'payroll'
    }
  ];

  const filteredGuides = guides.filter((g) => {
    const matchCategory = selectedCategory === 'all' || g.category === selectedCategory;
    const matchSearch =
      g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.steps.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#3D1259] text-white shadow-xl border border-purple-900/60 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <BookOpen className="w-80 h-80 text-amber-400" />
        </div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-400 text-purple-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> PUSAT PANDUAN PENGGUNA TERPADU
            </span>
            <span className="text-xs text-purple-200 font-bold hidden sm:inline">
              Steak 11 v1.0 — Modul Panduan Resmi
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-baloo text-amber-400 tracking-wide">
            Panduan & Tutorial Lengkap Seluruh Modul Aplikasi
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 max-w-3xl leading-relaxed">
            Petunjuk langkah demi langkah lengkap untuk mengoperasikan Kasir POS, Presensi Kamera Selfie Watermark, Penggajian Otomatis, Pengaturan Struk Per Outlet, Manajemen Stok, Pembaruan System ZIP, dan Hak Akses RBAC.
          </p>

          {/* Search Bar Input */}
          <div className="pt-2 max-w-xl">
            <div className="relative">
              <Search className="w-5 h-5 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari kata kunci tutorial... (contoh: promo, struk, absensi, gaji, zip, logo, wifi, stok)"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-amber-400/60 bg-purple-950/90 text-slate-100 text-xs font-bold focus:outline-none focus:border-amber-300 placeholder:text-purple-300/60 shadow-lg"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-purple-300 hover:text-white"
                >
                  ✕ Sembunyikan
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar scrollbar-none">
        {categories.map((cat) => {
          const IconComp = cat.icon;
          const isActive = selectedCategory === cat.id;
          const count = cat.id === 'all' ? guides.length : guides.filter(g => g.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer border ${
                isActive
                  ? 'bg-amber-400 text-purple-950 border-amber-300 shadow-md scale-[1.02]'
                  : 'bg-white dark:bg-[#180C25] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-purple-900/60 hover:bg-slate-50 dark:hover:bg-purple-950'
              }`}
            >
              <IconComp className={`w-4 h-4 ${isActive ? 'text-purple-950' : 'text-amber-500'}`} />
              <span>{cat.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                isActive ? 'bg-purple-950/20 text-purple-950' : 'bg-slate-100 dark:bg-purple-900/60 text-slate-600 dark:text-slate-300'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tutorial Cards List */}
      <div className="space-y-4">
        {filteredGuides.length === 0 ? (
          <div className="bg-white dark:bg-[#180C25] p-8 rounded-3xl border border-slate-200 dark:border-purple-900/50 text-center space-y-3">
            <HelpCircle className="w-12 h-12 text-slate-400 mx-auto opacity-50" />
            <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200">
              Tutorial Tidak Ditemukan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Tidak ada panduan yang cocok dengan kata kunci "{searchTerm}". Coba gunakan kata kunci lain seperti "struk", "kasir", "gaji", "stok", atau "absensi".
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-bold text-xs hover:bg-amber-300 cursor-pointer"
            >
              Tampilkan Semua Tutorial
            </button>
          </div>
        ) : (
          filteredGuides.map((guide) => {
            const IconComp = guide.categoryIcon;
            const isExpanded = expandedId === guide.id;

            return (
              <div
                key={guide.id}
                className="bg-white dark:bg-[#180C25] rounded-2xl border border-slate-200 dark:border-purple-900/60 shadow-xs overflow-hidden transition-all"
              >
                {/* Header Section */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : guide.id)}
                  className="p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-purple-950/40 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-purple-900 dark:text-amber-300 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-xs">
                      <IconComp className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                          {guide.categoryLabel}
                        </span>
                        {guide.badge && (
                          <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                            {guide.badge}
                          </span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-base text-[#3D1259] dark:text-slate-100 font-baloo">
                        {guide.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {guide.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/40 text-purple-900 dark:text-amber-300 hover:bg-amber-400 hover:text-purple-950 transition-colors"
                    >
                      <ChevronRight className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-slate-100 dark:border-purple-900/40 space-y-4 animate-in fade-in duration-200">
                    <div className="pt-3">
                      <h4 className="font-extrabold text-xs text-[#3D1259] dark:text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Langkah-Langkah Pemakaian:
                      </h4>

                      <ol className="space-y-2.5">
                        {guide.steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            <span className="w-5 h-5 rounded-full bg-amber-400 text-purple-950 font-black text-[11px] flex items-center justify-center shrink-0 shadow-xs">
                              {idx + 1}
                            </span>
                            <span className="pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Pro Tips */}
                    {guide.tips && guide.tips.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/40 text-xs text-amber-900 dark:text-amber-300 space-y-1">
                        <div className="font-extrabold flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-500" /> Tips Efisiensi:
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-[11px] pl-1">
                          {guide.tips.map((tip, i) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Warnings */}
                    {guide.warnings && guide.warnings.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-800 dark:text-rose-300 space-y-1">
                        <div className="font-extrabold flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-500" /> Perhatian Penting:
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-[11px] pl-1">
                          {guide.warnings.map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Shortcut Button */}
                    {guide.targetTab && onNavigateTab && (
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => onNavigateTab(guide.targetTab!)}
                          className="px-4 py-2 rounded-xl bg-[#3D1259] dark:bg-amber-400 text-amber-300 dark:text-purple-950 font-extrabold text-xs hover:bg-purple-900 dark:hover:bg-amber-300 transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <span>Langsung Buka Menu Ini</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* FREQUENTLY ASKED QUESTIONS (FAQ) SECTION */}
      <div className="bg-white dark:bg-[#180C25] p-6 rounded-3xl border border-slate-200 dark:border-purple-900/60 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-purple-900/40">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-amber-400">
            <HelpCircle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Jawaban cepat untuk pertanyaan teknis dan operasional sehari-hari.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isFaqOpen = expandedFaqId === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-purple-900/50 bg-slate-50/50 dark:bg-purple-950/30 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaqId(isFaqOpen ? null : idx)}
                  className="w-full p-4 text-left font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between gap-3 hover:bg-slate-100 dark:hover:bg-purple-950/60 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-400/30 text-amber-600 dark:text-amber-400 font-black text-[10px] flex items-center justify-center shrink-0">
                      Q
                    </span>
                    <span>{faq.q}</span>
                  </span>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isFaqOpen ? 'rotate-90' : ''}`} />
                </button>

                {isFaqOpen && (
                  <div className="p-4 pt-0 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/60 dark:border-purple-900/40">
                    <div className="pt-2 pl-7 flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        A
                      </span>
                      <span>{faq.a}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
