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
  MapPin,
  Utensils,
  Boxes,
  Calculator,
  Receipt,
  Banknote,
  Percent,
  FileCheck,
  UserCheck,
  Star,
  Activity,
  Layers
} from 'lucide-react';

interface UserGuideManagerProps {
  onNavigateTab?: (tab: string) => void;
}

interface GuideItem {
  id: string;
  category: 'sop' | 'pos' | 'absensi' | 'payroll' | 'inventory' | 'finance' | 'crm' | 'receipt' | 'system' | 'users';
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
  const [expandedId, setExpandedId] = useState<string | null>('guide-sop-1');
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);

  const guides: GuideItem[] = [
    // 0. SOP RESMI STEAK 11 (V8.3)
    {
      id: 'guide-sop-1',
      category: 'sop',
      categoryLabel: 'SOP Resmi Steak 11 (V8.3)',
      categoryIcon: FileCheck,
      title: 'Dokumen Standar Operasional Prosedur (SOP V8.3 - Brand Edition)',
      summary: 'Pedoman Hub-and-Spoke Dapur Pusat, 5 Cabang Solo Operator, Peringatan 4 Alat Mutlak, Goreng Kentang Golden-Yellow, Plating Presisi, BBM 1 Jam Sebelum Masuk, Deep-Cleaning Gerobak, Hospitality (3S), & Konfirmasi WA.',
      badge: 'SOP V8.3 Resmi',
      targetTab: 'sop',
      steps: [
        'Buka menu "SOP" pada sidebar navigasi left.',
        'Pelajari 6 Bagian SOP: (1) Dapur Pusat & Logistik Hub, (2) Spesifikasi Alat & Plating Presisi (Coolbox, Kompor Gas/Wajan, Saus Resmi, Timbangan Digital 90g, Kentang Golden-Yellow 170°C-180°C, Hospitality 3S & Cuci Tangan Sebelum/Sesudah Bekerja), (3) Timeline 4 Fase Operasional, (4) Panduan Efisiensi & Pemeliharaan Aset (BBM Motor 1 Jam Sebelum Masuk, Cuci Motor 1x/Bulan, Deep-Cleaning Gerobak Sebelum Libur, Sampah Harian, Cairan TAF, Sunlight 80:20), (5) Dual-Channel Reporting, dan (6) Checklist Harian Serah Terima.',
        'Gunakan Simulasi Gramasi Porsi interaktif untuk menghitung total bahan baku paha fillet ayam (90g), kentang (5 pcs), wortel (4 pcs), buncis (2 pcs), dan saus (40-50ml).',
        'Lakukan Konfirmasi Pemahaman SOP & Komitmen Digital: Pilih nama karyawan dari data karyawan dan kirimkan pernyataan komitmen otomatis ke WhatsApp Manajemen (0812-2323-3299).',
        'Klik tombol "Cetak / Download PDF Resmi" untuk mengunduh dokumen SOP V8.3 resmi dengan format warna brand.'
      ],
      tips: [
        'Gunakan checklist interaktif 7 poin setiap awal shift untuk memverifikasi kesesuaian fisik stok dari Dapur Pusat.'
      ],
      warnings: [
        'Dilarang keras memotong ulang fillet paha ayam marinasi di Dapur Pusat!',
        'Cairan TAF hanya boleh digunakan untuk meja kerja/pelanggan dan kompor grill, dilarang untuk lantai.'
      ]
    },

    // 1. KASIR POS, TRANSAKSI & PESANAN
    {
      id: 'guide-pos-1',
      category: 'pos',
      categoryLabel: 'Kasir POS & Transaksi',
      categoryIcon: ShoppingCart,
      title: '1. Membuat Pesanan Baru & Pemilihan Varian Steak di Kasir POS',
      summary: 'Panduan melayani pelanggan di Kasir POS, memilih opsi Dine In / Takeaway, racikan saus, add-on, dan hitung kembalian.',
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
      categoryIcon: Percent,
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
      category: 'receipt',
      categoryLabel: 'Struk & Printer Thermal',
      categoryIcon: DollarSign,
      title: '3. Metode Pembayaran (QRIS, Tunai, Transfer Bank, EDC) & Struk Thermal',
      summary: 'Proses penyelesaian transaksi via Uang Tunai, scan QRIS Statis/Dinamis, Bank Transfer, dan cetak struk kasir.',
      badge: 'Pembayaran',
      targetTab: 'payment_receipt_settings',
      steps: [
        'Pada modal Pembayaran Kasir, pilih metode bayar: Tunai, QRIS, Transfer Bank, atau Kartu Debit (EDC).',
        'Jika Pembayaran Tunai: Input nominal uang yang diterima. Sistem akan menghitung uang kembalian secara otomatis.',
        'Jika QRIS / Transfer: Tampilkan kode QRIS di layar kepada pelanggan untuk di-scan secara instan.',
        'Klik "Selesaikan Transaksi & Cetak Struk".',
        'Struk transaksi akan otomatis muncul dalam modal cetak thermal 58mm/80mm untuk siap diprint ke printer Bluetooth/USB.'
      ]
    },
    {
      id: 'guide-pos-4',
      category: 'pos',
      categoryLabel: 'Kasir POS & Transaksi',
      categoryIcon: Wifi,
      title: '4. Mode Offline PWA Kasir & Auto-Sync ke Cloud Firestore',
      summary: 'Cara kerja transaksi saat internet terputus (offline mode) dan sinkronisasi otomatis saat online.',
      badge: 'Offline Mode',
      targetTab: 'kasir',
      steps: [
        'Saat internet terputus, banner "Mode Offline (Internet Terputus)" akan otomatis muncul di bagian atas.',
        'Kasir dapat tetap memproses pesanan dan mencetak struk seperti biasa. Data tersimpan aman di IndexedDB/Local Storage.',
        'Ketika internet terhubung kembali, sistem secara otomatis menyinkronkan seluruh transaksi dan presensi ke Cloud Firestore tanpa ada data yang terlewat.'
      ],
      warnings: [
        'Jangan menghapus cache/data browser saat dalam kondisi offline sebelum koneksi internet terhubung kembali.'
      ]
    },
    {
      id: 'guide-pos-5',
      category: 'pos',
      categoryLabel: 'Kasir POS & Transaksi',
      categoryIcon: Receipt,
      title: '5. Manajemen Riwayat Pesanan & Cetak Ulang Struk',
      summary: 'Memantau pesanan masuk, mengubah status pesanan (Proses, Selesai, Dibatalkan), dan cetak ulang struk thermal.',
      badge: 'Daftar Pesanan',
      targetTab: 'pesanan',
      steps: [
        'Buka menu "Daftar Pesanan" di sidebar navigasi.',
        'Filter pesanan berdasarkan tanggal, outlet cabang, atau status pembayaran.',
        'Klik tombol "Cetak Struk" pada baris transaksi untuk mencetak ulang struk thermal.',
        'Klik tombol "Kirim WA" untuk mengirimkan rincian struk digital langsung ke nomor WhatsApp pelanggan.'
      ]
    },

    // 2. PRODUK, MENU & INVENTORY
    {
      id: 'guide-menu-1',
      category: 'inventory',
      categoryLabel: 'Produk & Persediaan',
      categoryIcon: Utensils,
      title: '6. Pengelolaan Daftar Menu Makanan, Minuman & Status Stok Habis',
      summary: 'Menambah produk menu baru, mengubah harga, mengunggah foto makanan, dan mengatur toggle Sold Out.',
      badge: 'Daftar Menu',
      targetTab: 'menu',
      steps: [
        'Buka menu "Daftar Menu" di sidebar.',
        'Klik tombol "Tambah Menu Baru". Masukkan Nama Menu, Kategori (Steak, Sides, Minuman), Harga Jual (Rp), dan Deskripsi Singkat.',
        'Unggah foto menu makanan yang menarik untuk ditampilkan di Landing Page dan POS.',
        'Gunakan tombol sakelar (toggle) "Tersedia / Habis" untuk menonaktifkan menu sementara jika bahan baku di outlet habis.'
      ]
    },
    {
      id: 'guide-menu-2',
      category: 'inventory',
      categoryLabel: 'Produk & Persediaan',
      categoryIcon: ChefHat,
      title: '7. Racikan Varian Steak, Saus Resmi & Add-On Tambahan',
      summary: 'Mengatur pilihan tingkat kepedasan, varian porsi (Original/Crispy), aneka saus (BBQ, Blackpepper, Mushroom), dan add-on.',
      badge: 'Racikan Menu',
      targetTab: 'racik',
      steps: [
        'Buka menu "Racikan" di bawah kelompok Produk & Persediaan.',
        'Atur daftar opsi Ayam (Original, Crispy Paha Fillet), Saus Pilihan Resmi, dan Add-on Pendamping (Extra Sauce, Potato Wedges).',
        'Tentukan harga tambahan per item add-on jika ada.',
        'Klik "Simpan Opsi Racikan" agar langsung teraplikasi pada Kasir POS.'
      ]
    },
    {
      id: 'guide-inventory-1',
      category: 'inventory',
      categoryLabel: 'Produk & Persediaan',
      categoryIcon: Boxes,
      title: '8. Kontrol Stok Bahan Baku, Ambang Minimum & Opname Stok',
      summary: 'Memantau persediaan daging ayam fillet, kentang, wortel, buncis, saus, bumbu, dan pencocokan opname fisik.',
      badge: 'Manajemen Stok',
      targetTab: 'inventory',
      steps: [
        'Buka menu "Manajemen Stok" di Dashboard Admin.',
        'Periksa stok bahan baku: status Aman (Hijau), Menipis (Kuning), atau Habis (Merah).',
        'Untuk Menambah Bahan Baru: Klik "Tambah Item Bahan Baku", tentukan nama bahan, satuan (kg, gram, pcs), harga beli, dan batas minimal stok.',
        'Gunakan sub-tab "Opname Stok" untuk mencocokkan stok fisik aktual dengan stok catatan sistem.'
      ]
    },
    {
      id: 'guide-inventory-2',
      category: 'inventory',
      categoryLabel: 'Produk & Persediaan',
      categoryIcon: Package,
      title: '9. Pemasok (Supplier) & Pembuatan Purchase Order (PO)',
      summary: 'Mengelola daftar supplier bahan baku dan alur pembuatan PO hingga verifikasi barang masuk (Received).',
      badge: 'Supply Chain PO',
      targetTab: 'inventory',
      steps: [
        'Buka sub-tab "Pemasok & Supplier" untuk mencatat kontak rekanan distributor bahan baku.',
        'Buka sub-tab "Purchase Order (PO)", klik "Buat PO Baru". Pilih Supplier, tanggal estimasi kirim, dan daftar bahan yang dipesan.',
        'Setelah barang fisik tiba di Dapur Pusat / Toko, ubah status PO menjadi "Diterima (Received)". Stok bahan baku akan bertambah otomatis.'
      ]
    },
    {
      id: 'guide-crm-reviews',
      category: 'crm',
      categoryLabel: 'CRM & Pelanggan WA',
      categoryIcon: Star,
      title: '10. Ulasan & Feedback Pelanggan (QR Rating di Struk)',
      summary: 'Melihat review bintang 1-5 dan saran kepuasan pelanggan yang masuk dari scan barcode QR pada struk belanja.',
      badge: 'Customer Reviews',
      targetTab: 'reviews',
      steps: [
        'Buka menu "Ulasan Pelanggan" di sidebar.',
        'Pantau skor rata-rata kepuasan pelanggan (Rating Bintang) dari seluruh outlet cabang.',
        'Tinjau kritik dan saran pelanggan untuk peningkatan mutu makanan dan pelayanan di outlet.'
      ]
    },

    // 3. PRESENSI, SHIFT & KARYAWAN
    {
      id: 'guide-absensi-1',
      category: 'absensi',
      categoryLabel: 'Presensi & Shift',
      categoryIcon: Camera,
      title: '11. Presensi Kamera Selfie & Watermark Lokasi Staff',
      summary: 'Proses presensi masuk & pulang karyawan dengan verifikasi foto selfie live, GPS outlet, jam WIB, dan kirim bukti ke WA.',
      badge: 'Presensi Kamera',
      targetTab: 'presensi_kamera',
      steps: [
        'Buka menu "Presensi Kamera Selfie" (atau klik tombol Presensi di Kasir).',
        'Pilih Nama Karyawan dari daftar dropdown.',
        'Masukkan PIN Presensi 4-Digit milik karyawan.',
        'Pilih Lokasi Outlet tempat bertugas.',
        'Klik "Buka Kamera" dan berikan izin (*allow*) akses kamera & lokasi GPS pada browser.',
        'Posisikan wajah dengan jelas, lalu klik "Presensi MASUK" atau "Presensi PULANG".',
        'Foto selfie akan otomatis dibubuhi Watermark Logo Steak 11, Nama Karyawan, Jam WIB, dan Alamat Outlet.'
      ],
      tips: [
        'Hasil presensi dapat langsung dikirimkan sebagai bukti pesan WhatsApp ke Supervisor / Group WA Manager.'
      ]
    },
    {
      id: 'guide-absensi-lembur',
      category: 'absensi',
      categoryLabel: 'Presensi & Shift',
      categoryIcon: Clock,
      title: '12. Pencatatan Presensi Lembur (Akses Mandiri Akun Karyawan)',
      summary: 'Panduan karyawan mencatat lembur mandiri tanpa foto terintegrasi otomatis dengan perhitungan payroll.',
      badge: 'Presensi Lembur',
      targetTab: 'absensi',
      steps: [
        'Buka menu "Rekap Presensi Digital" (atau tombol + Catat Lembur di toolbar).',
        'Bagi akun staf login yang terdaftar di Data Karyawan, kolom Nama dan Outlet akan terkunci secara aman ke profil akun.',
        'Tentukan Tanggal Lembur, Jam Mulai, Jam Selesai, dan Total Jam Lembur (contoh: 1 jam).',
        'Tuliskan Alasan / Keterangan Tugas Lembur (contoh: Persiapan Event / Bumbu Marinasi / Stok Opname).',
        'Klik tombol "Simpan Presensi Lembur". Data lembur akan langsung tercatat dan masuk ke rekapitulasi penggajian.'
      ]
    },
    {
      id: 'guide-absensi-2',
      category: 'absensi',
      categoryLabel: 'Presensi & Shift',
      categoryIcon: Calendar,
      title: '13. Pengaturan Jadwal Shift Kerja Roster Karyawan',
      summary: 'Cara mengatur jadwal shift (Pagi, Siang, Malam, Off/Libur) per karyawan dan outlet cabang.',
      badge: 'Jadwal Roster',
      targetTab: 'jadwal',
      steps: [
        'Buka menu "Jadwal Shift Kerja" di Dashboard Admin.',
        'Pilih Outlet dan Periode Minggu/Bulan yang ingin diatur.',
        'Tentukan jam kerja shift (misal: Shift Pagi 08:00 - 16:00, Shift Malam 15:00 - 23:00).',
        'Klik pada sel kalender karyawan untuk menetapkan status shift (Pagi, Malam, Off/Libur).',
        'Klik tombol "Simpan Jadwal Roster".'
      ]
    },

    // 4. PENGGAJIAN & KEUANGAN
    {
      id: 'guide-payroll-1',
      category: 'payroll',
      categoryLabel: 'Penggajian & Payroll',
      categoryIcon: Calculator,
      title: '14. Siklus Cut-Off 25 & Kalkulasi Gaji Otomatis Terintegrasi Presensi Digital',
      summary: 'Perhitungan gaji pokok, lembur, tunjangan tepat waktu, denda keterlambatan, kasbon dengan siklus cut-off 25, serta slip gaji PDF / WA.',
      badge: 'Siklus Cut-Off 25',
      targetTab: 'penggajian',
      steps: [
        'Buka menu "Penggajian / Payroll" di Dashboard Admin.',
        'Pilih Mode Siklus: "⭐ Siklus Cut-Off 25" (tgl 25 bulan lalu s/d 24 bulan berjalan) atau "🗓️ Bulan Kalender (1–Akhir)".',
        'Pilih Bulan Gaji (contoh: September 2026). Tanggal Cut-off (25/08 s/d 24/09) dan Tanggal Bayar (25/09) terisi otomatis.',
        'Klik tombol "Hitung Otomatis Cut-Off" (Berikon Bintang Sparkles).',
        'Sistem akan otomatis menghitung: Total Hari Hadir, Presensi Tepat Waktu (Rp 15.000/hari), Upah Lembur, Potongan Denda Terlambat, dan Potongan Cicilan Kasbon Pinjaman dalam rentang tgl 25 s/d 24.',
        'Klik ikon "PDF" untuk mencetak Slip Gaji resmi, atau klik "WA" untuk mengirim rincian slip langsung ke nomor WhatsApp karyawan.',
        'Gunakan tombol "Ekspor Excel" untuk mengunduh rekapitulasi penggajian lengkap dengan rincian periode cut-off.'
      ]
    },
    {
      id: 'guide-finance-1',
      category: 'finance',
      categoryLabel: 'Keuangan & Audit Kasir',
      categoryIcon: TrendingUp,
      title: '15. Shift Pembukaan/Penutupan Kasir & Kas Kecil (Petty Cash)',
      summary: 'Pencatatan kas awal modal kasir, penutupan shift kasir, pencatatan pengeluaran harian, dan analisis omzet.',
      badge: 'Audit Shift Kasir',
      targetTab: 'shifts',
      steps: [
        'Saat Kasir Membuka Shift: Buka menu "Audit Closing Shift", catat modal saldo awal kas (misal: Rp 200.000).',
        'Mencatat Pengeluaran Toko: Buka menu "Laporan Keuangan", klik "Tambah Pengeluaran Kas Kecil", masukkan nominal dan foto nota pembelanjaan (misal: beli es batu/gas elpiji).',
        'Saat Penutupan Shift Kasir: Klik "Tutup Shift Kasir", hitung fisik uang tunai di laci kasir. Sistem akan membandingkan otomatis saldo sistem vs saldo fisik.',
        'Buka menu "Analisis Keuangan" untuk melihat grafik omzet bulanan, total margin profit, dan metode bayar terpopuler.'
      ]
    },

    // 5. STRUK & PEMBAYARAN
    {
      id: 'guide-receipt-1',
      category: 'receipt',
      categoryLabel: 'Struk & Pembayaran',
      categoryIcon: Printer,
      title: '16. Pengaturan Format Struk Per Outlet, Logo Brand & Info Wi-Fi',
      summary: 'Mengatur header kustom per cabang, upload foto logo brand (40-112px), reset nomor struk dari 0, dan password Wi-Fi toko.',
      badge: 'Custom Struk',
      targetTab: 'payment_receipt_settings',
      steps: [
        'Buka menu "Pembayaran & Struk", lalu klik tab "Pengaturan Struk Thermal".',
        'Pilih Target Outlet pada dropdown (misal: "Semua Outlet" atau cabang spesifik "Outlet Cibubur").',
        'Unggah foto logo brand dengan mengklik tombol "Upload Logo" atau masukkan URL gambar logo.',
        'Pilih Ukuran Tampilan Logo (Kecil - 40px, Sedang - 56px, Besar - 80px, atau Jumbo - 112px).',
        'Isi Teks Header Cabang, Slogan Toko, Alamat Outlet, No. Telepon, dan Catatan Kaki Struk.',
        'Atur Prefix No. Struk (misal: ORD-) atau klik "Reset No. Struk dari 1 (0)" untuk mengembalikan nomor urut pesanan ke awal.',
        'Aktifkan opsi "Tampilkan Informasi Wi-Fi Pelanggan di Struk" dan isi SSID serta Password Wi-Fi toko.',
        'Klik tombol "Simpan Pengaturan Struk".'
      ]
    },

    // 6. CRM & WHATSAPP GATEWAY
    {
      id: 'guide-crm-1',
      category: 'crm',
      categoryLabel: 'CRM & Pelanggan WA',
      categoryIcon: PhoneCall,
      title: '17. Data Pelanggan CRM, Poin Loyalitas & Broadcast WhatsApp',
      summary: 'Pencatatan riwayat belanja pelanggan, poin loyalitas, dan integrasi notifikasi gateway WhatsApp.',
      badge: 'CRM & WA Broadcast',
      targetTab: 'customers',
      steps: [
        'Setiap kali transaksi dibuat di kasir dengan mencantumkan No. HP pelanggan, data pelanggan otomatis tersimpan di database CRM.',
        'Buka menu "Data Pelanggan & WA" untuk melihat total riwayat belanja dan total poin tiap pelanggan.',
        'Buka menu "Notifikasi WhatsApp" untuk mengaktifkan notifikasi otomatis ke WA pelanggan saat pesanan dibuat atau diproses.',
        'Gunakan fitur Broadcast WA untuk mengirimkan pesan promosi promo terbaru ke seluruh pelanggan toko.'
      ]
    },

    // 7. HAK AKSES, ADMIN & AUDIT LOG
    {
      id: 'guide-users-1',
      category: 'users',
      categoryLabel: 'Hak Akses & Branding',
      categoryIcon: Users,
      title: '18. Data Karyawan, Role Jabatan, PIN Presensi & Hak Akses (RBAC)',
      summary: 'Menambah staf, mengatur PIN presensi 4-digit, dan membatasi centang menu yang boleh diakses.',
      badge: 'RBAC Access',
      targetTab: 'karyawan',
      steps: [
        'Buka menu "Data Karyawan" di Dashboard Admin.',
        'Klik "Tambah Karyawan Baru". Isi Nama Lengkap, Jabatan (Kasir, Manager, Chef/Cook), Outlet Tugas, Gaji Harian, Rate Lembur, dan PIN Presensi 4-Digit.',
        'Untuk Pengaturan Akun Login Admin: Buka menu "Admin System". Tambahkan Username & Password login.',
        'Tentukan Centang Hak Akses Menu yang diizinkan untuk akun tersebut. Menu yang tidak dicentang akan otomatis disembunyikan dari sidebar pengguna.'
      ]
    },
    {
      id: 'guide-audit-logs',
      category: 'users',
      categoryLabel: 'Hak Akses & Branding',
      categoryIcon: ShieldCheck,
      title: '19. Audit Log Aktivitas & Jejak Keamanan Sistem',
      summary: 'Memantau rekam aktivitas login/logout, perubahan data karyawan, harga, stok, dan ekspor log ke Excel.',
      badge: 'Security Audit Log',
      targetTab: 'audit_logs',
      steps: [
        'Buka menu "Audit Log Aktivitas" di sidebar navigasi.',
        'Tinjau seluruh riwayat aktivitas sistem yang dicatat secara kronologis lengkap dengan Nama User, Role, Aksi, Modul, dan Timestamp WIB.',
        'Gunakan filter pencarian untuk mencari aktivitas user tertentu atau aksi spesifik.',
        'Klik tombol "Ekspor Excel (.xlsx)" untuk mengunduh laporan log audit keamanan sistem.'
      ]
    },

    // 8. OUTLET, SYSTEM & INTEGRASI
    {
      id: 'guide-outlets',
      category: 'system',
      categoryLabel: 'System & Firebase',
      categoryIcon: MapPin,
      title: '20. Pengaturan Outlet Cabang, Radius GPS & Jam Shift Operasional',
      summary: 'Mengelola 5 cabang (Cibubur, Kalisari, Jatisampurna, Cilangkap, Kuningan), koordinat GPS presensi, dan shift rules.',
      badge: 'Outlet Rules',
      targetTab: 'outlets',
      steps: [
        'Buka menu "Outlet & Shift Rules" di Dashboard Admin.',
        'Pilih Cabang yang ingin diatur (Cibubur, Kalisari, Jatisampurna, Cilangkap, Kuningan).',
        'Atur Koordinat Latitude/Longitude lokasi outlet dan Radius Maksimal Presensi (misal: 100 meter).',
        'Tentukan jam buka, jam tutup, dan batas toleransi keterlambatan shift.',
        'Klik "Simpan Pengaturan Outlet".'
      ]
    },
    {
      id: 'guide-users-branding',
      category: 'users',
      categoryLabel: 'Hak Akses & Branding',
      categoryIcon: Sparkles,
      title: '21. Identitas Brand, Banner Hero & Running Text Footer Web',
      summary: 'Mengubah nama brand STEAK 11, logo toko, banner hero beranda, dan running text pengumuman footer.',
      badge: 'Branding Store',
      targetTab: 'branding',
      steps: [
        'Buka menu "Identitas & Branding" di sidebar navigasi.',
        'Ubah Nama Brand / Toko (contoh: STEAK 11), Slogan Utama, dan Sub-tagline Hero.',
        'Unggah Foto Logo Brand Utama dan Foto Hero Banner Steak.',
        'Atur Teks Pengumuman Header Top (Announcement Bar) dan Teks Berjalan Footer (Running Text Banner).',
        'Klik tombol "Simpan & Terapkan Branding Toko". Tampilan Landing Page akan langsung ter-update otomatis.'
      ]
    },
    {
      id: 'guide-system-1',
      category: 'system',
      categoryLabel: 'System & Firebase',
      categoryIcon: HardDrive,
      title: '22. Pembaruan Software Aplikasi via Berkas ZIP',
      summary: 'Mengunggah file paket update .zip versi terbaru tanpa mengganggu atau menghapus data di Cloud Firestore.',
      badge: 'System Update',
      targetTab: 'system',
      steps: [
        'Buka menu "Integrasi & System" di Dashboard Admin.',
        'Gulir ke seksi "Pembaruan Aplikasi via File ZIP (System Software Update)".',
        'Klik tombol "Pilih File Update ZIP...".',
        'Pilih berkas bundle update berformat .zip.',
        'Sistem akan memproses ekstraksi kode software dan menampilkan status keamanan database (🛡️ Safe Untouched).'
      ],
      tips: [
        'Seluruh database transaksi, stok, karyawan, dan settings tersimpan aman terpisah di Cloud Firestore, sehingga proses update software 100% aman.'
      ]
    },
    {
      id: 'guide-system-2',
      category: 'system',
      categoryLabel: 'System & Firebase',
      categoryIcon: Database,
      title: '23. Integrasi Cloud Firestore & Backup Google Sheets (GAS)',
      summary: 'Pemeriksaan status sinkronisasi real-time Firebase Cloud Firestore dan backup sekunder ke Google Sheets Apps Script.',
      badge: 'Database Cloud',
      targetTab: 'firebase',
      steps: [
        'Buka menu "Firebase Sync" untuk memeriksa status sinkronisasi real-time Firebase Cloud Firestore.',
        'Seluruh transaksi, stok, dan absensi tersinkronkan secara otomatis antar perangkat kasir & admin.',
        'Jika ingin mengaktifkan backup otomatis ke Google Spreadsheet: Buka menu "Integrasi & System", masukkan URL Web App Google Apps Script (GAS), lalu klik "Uji Koneksi" & "Simpan URL".'
      ]
    }
  ];

  const categories = [
    { id: 'all', label: 'Semua Tutorial', icon: BookOpen },
    { id: 'sop', label: 'SOP Resmi (V8.3)', icon: FileCheck },
    { id: 'pos', label: 'Kasir POS & Pesanan', icon: ShoppingCart },
    { id: 'inventory', label: 'Produk, Menu & Stok', icon: Package },
    { id: 'absensi', label: 'Presensi & Shift', icon: Camera },
    { id: 'payroll', label: 'Penggajian & Payroll', icon: FileSpreadsheet },
    { id: 'finance', label: 'Keuangan & Audit Kasir', icon: TrendingUp },
    { id: 'receipt', label: 'Struk & Pembayaran', icon: Printer },
    { id: 'crm', label: 'CRM & WhatsApp', icon: PhoneCall },
    { id: 'users', label: 'Hak Akses, RBAC & Audit Log', icon: Users },
    { id: 'system', label: 'System & Firebase', icon: HardDrive }
  ];

  const faqs: FaqItem[] = [
    {
      q: 'Bagaimana jika aplikasi kasir terputus dari jaringan internet saat ada pesanan?',
      a: 'Aplikasi Steak 11 dilengkapi teknologi Offline-First PWA. Transaksi tetap dapat dilakukan seperti biasa. Data disimpan aman di memori browser lokal dan akan otomatis di-sync ke Cloud Firestore begitu koneksi online kembali.',
      category: 'pos'
    },
    {
      q: 'Bagaimana cara karyawan mencatat presensi lembur mandiri?',
      a: 'Buka menu "Rekap Presensi Digital" lalu klik tombol "+ Catat Lembur". Bagi akun staf/karyawan yang login, nama dan cabang outlet otomatis terkunci sesuai profil akun karyawan. Cukup masukkan jam lembur, alasan tugas, dan klik "Simpan Presensi Lembur".',
      category: 'absensi'
    },
    {
      q: 'Bagaimana alur siklus cut-off penggajian 25 di Steak 11?',
      a: 'Siklus Cut-Off 25 menghitung presensi dan lembur mulai dari tanggal 25 bulan lalu hingga tanggal 24 bulan berjalan, dengan tanggal bayar pada tanggal 25. Sistem otomatis mengakumulasi hari hadir, tunjangan tepat waktu Rp 15.000/hari, upah lembur, dan potongan denda telat/kasbon.',
      category: 'payroll'
    },
    {
      q: 'Apakah pembaruan software via file ZIP akan menghapus data penjualan & transaksi?',
      a: 'Sama sekali TIDAK. Seluruh database transaksi, stok, karyawan, dan outlet tersimpan terpisah di Cloud Firestore. Proses update via berkas ZIP hanya memperbarui berkas kode aplikasi tanpa menyentuh database.',
      category: 'system'
    },
    {
      q: 'Bagaimana cara menambahkan lokasi cabang outlet baru atau mengatur jam shift?',
      a: 'Buka menu "Outlet & Shift Rules" di Dashboard Admin. Klik tombol "Tambah Outlet Baru", masukkan Nama Cabang, Alamat Lengkap, No. HP/WA Outlet, Koordinat GPS, dan Jam Operasional Shift. Outlet baru akan langsung aktif di kasir dan presensi.',
      category: 'system'
    },
    {
      q: 'Mengapa menu tertentu tidak muncul di sidebar karyawan?',
      a: 'Hal ini karena sistem pembatasan Hak Akses (RBAC). Admin dapat mengatur menu yang diizinkan melalui menu "Admin System" atau "Data Karyawan" dengan mencentang daftar modul yang boleh diakses oleh karyawan tersebut.',
      category: 'users'
    },
    {
      q: 'Bagaimana cara mencetak slip gaji karyawan dan mengirimkannya ke WhatsApp?',
      a: 'Buka menu "Penggajian / Payroll", hitung otomatis cut-off periode bulan terkait. Pada tabel rekapitulasi gaji, klik ikon "PDF" untuk mencetak Slip Gaji resmi atau klik ikon "WA" untuk mengirim rincian slip langsung ke nomor WhatsApp karyawan.',
      category: 'payroll'
    },
    {
      q: 'Bagaimana cara melakukan konfirmasi pemahaman SOP V8.3 ke Manajemen?',
      a: 'Buka menu "SOP", gulir ke bagian paling bawah (Digital SOP Acknowledgement). Pilih nama karyawan dari daftar data karyawan, centang persetujuan, lalu klik tombol "Konfirmasi Pemahaman SOP & Kirim ke WA" untuk otomatis mengirim pesan verifikasi ke WhatsApp Manajemen 0812-2323-3299.',
      category: 'sop'
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
