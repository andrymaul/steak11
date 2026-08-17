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
  Info
} from 'lucide-react';

interface UserGuideManagerProps {
  onNavigateTab?: (tab: string) => void;
}

interface GuideItem {
  id: string;
  category: 'pos' | 'absensi' | 'payroll' | 'inventory' | 'receipt' | 'system' | 'users';
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

export const UserGuideManager: React.FC<UserGuideManagerProps> = ({ onNavigateTab }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>('guide-pos-1');

  const guides: GuideItem[] = [
    {
      id: 'guide-pos-1',
      category: 'pos',
      categoryLabel: 'Kasir POS & Transaksi',
      categoryIcon: ShoppingCart,
      title: 'Cara Membuat Pesanan Baru & Memilih Menu',
      summary: 'Panduan melayani pelanggan di Kasir POS, memilih varian steak, saus, dan pesanan tambahan.',
      badge: 'Utama POS',
      targetTab: 'kasir',
      steps: [
        'Buka menu "Kasir POS" di bilah navigasi utama.',
        'Pilih opsi layanan: Dine In (Makan di Tempat) atau Takeaway (Bawa Pulang). Isi nomor meja jika Dine In.',
        'Klik pada kartu menu yang diinginkan (misal: Creamy Garlic Herb Steak).',
        'Pilih varian rasa (Ayam Original/Crispy, Pilihan Saus, dan Tambahan/Add-on) jika tersedia.',
        'Klik "Tambah ke Keranjang". Item akan masuk ke daftar pesanan di sisi sebelah kanan.',
        'Periksa daftar pesanan dan klik tombol "Proses Pembayaran".'
      ],
      tips: [
        'Gunakan kolom pencarian cepat di bagian atas menu kasir untuk mencari nama makanan dengan instan.'
      ]
    },
    {
      id: 'guide-pos-2',
      category: 'pos',
      categoryLabel: 'Kasir POS & Transaksi',
      categoryIcon: Tag,
      title: 'Menggunakan Voucher & Kode Promo Diskon',
      summary: 'Cara menginput kode promo (misal: STEAKMERDEKA, DISCOUNT10K) untuk mendapatkan potongan harga.',
      badge: 'Promo & Voucher',
      targetTab: 'kasir',
      steps: [
        'Pada modal Keranjang Pelanggan, lihat bagian "Kode Promo / Voucher Diskon".',
        'Ketikkan kode promo di kolom input (contoh: STEAKMERDEKA atau DISCOUNT10K) atau klik langsung chip promo aktif di bawahnya.',
        'Klik tombol "Terapkan".',
        'Sistem akan otomatis menguji syarat minimum transaksi dan memotong total biaya pesanan.',
        'Rincian diskon voucher akan otomatis tercetak di struk kasir dan dikirimkan pada pesan WhatsApp.'
      ],
      tips: [
        'Klik chip promo berwarna hijau/kuning untuk menerapkan promo dalam 1-klik tanpa perlu mengetik manual.'
      ]
    },
    {
      id: 'guide-pos-3',
      category: 'pos',
      categoryLabel: 'Kasir POS & Transaksi',
      categoryIcon: DollarSign,
      title: 'Metode Pembayaran & Cetak Struk Kasir',
      summary: 'Proses penyelesaian pembayaran via QRIS, Tunai, Bank Transfer, dan cetak struk thermal.',
      badge: 'Pembayaran',
      targetTab: 'kasir',
      steps: [
        'Pada layar pembayaran, pilih metode bayar: QRIS, Tunai, Transfer Bank, atau Kartu Debit.',
        'Jika memilih Tunai: Masukkan jumlah uang tunai yang diterima dari pelanggan. Sistem akan menghitung otomatis nilai kembalian.',
        'Klik "Selesaikan Transaksi & Cetak Struk".',
        'Modal Cetak Struk Thermal akan terbuka. Anda dapat langsung mencetak ke Printer Bluetooth Portable (58mm) atau Printer USB/LAN (80mm).'
      ]
    },
    {
      id: 'guide-absensi-1',
      category: 'absensi',
      categoryLabel: 'Absensi Kamera Watermark',
      categoryIcon: Camera,
      title: 'Presensi Kamera Selfie & Watermark Staff',
      summary: 'Proses absensi masuk & pulang karyawan dengan verifikasi foto selfie, jam, dan lokasi outlet.',
      badge: 'Presensi Kamera',
      targetTab: 'presensi_kamera',
      steps: [
        'Buka menu "Presensi Kamera Staff" (atau gunakan tombol modal presensi di kasir).',
        'Pilih Nama Karyawan dari daftar dropdown.',
        'Masukkan PIN Presensi 4-Digit milik karyawan.',
        'Pilih Lokasi Outlet tempat bertugas.',
        'Klik "Buka Kamera" dan izinkan akses kamera pada browser/perangkat HP.',
        'Posisikan wajah dengan jelas di depan kamera, lalu klik "Presensi MASUK" atau "Presensi PULANG".',
        'Foto selfie akan secara otomatis dibubuhi Watermark Logo Steak 11, Nama Karyawan, Tanggal, Jam WIB, dan Alamat Outlet.'
      ],
      tips: [
        'Setelah presensi berhasil, akan muncul modal bukti presensi yang bisa langsung dikirimkan ke WhatsApp Supervisor / Owner.'
      ],
      warnings: [
        'Pastikan GPS / Izin Kamera pada browser dalam kondisi aktif agar watermark lokasi dan foto selfie berhasil dibuat.'
      ]
    },
    {
      id: 'guide-payroll-1',
      category: 'payroll',
      categoryLabel: 'Penggajian & Payroll',
      categoryIcon: FileSpreadsheet,
      title: 'Kalkulasi Penggajian Otomatis Terintegrasi Absensi',
      summary: 'Perhitungan gaji pokok, uang makan, tunjangan tepat waktu, denda keterlambatan, dan cetak slip gaji.',
      badge: 'Payroll System',
      targetTab: 'penggajian',
      steps: [
        'Buka menu "Penggajian / Payroll" di Dashboard Admin.',
        'Pilih Periode Bulan yang ingin dihitung (misal: 2026-08).',
        'Klik tombol "Hitung Ulang" (Berikon Bintang Sparkles).',
        'Sistem akan otomatis menghitung: Hari Hadir (Gaji Pokok & Uang Makan), Hari Tepat Waktu (Tunjangan Rp 15.000/hari), Hari Terlambat (Denda Potongan), dan Total Jam Kerja Nyata.',
        'Klik icon Printer pada baris karyawan untuk mencetak Slip Gaji PDF individual.',
        'Gunakan tombol "Cetak PDF" atau "Ekspor Excel" untuk laporan rekapitulasi penggajian bulanan.'
      ]
    },
    {
      id: 'guide-receipt-1',
      category: 'receipt',
      categoryLabel: 'Struk & Printer Thermal',
      categoryIcon: Printer,
      title: 'Pengaturan Struk Per Outlet & Upload Logo Brand',
      summary: 'Mengatur format header struk khusus tiap outlet cabang, unggah foto logo brand, dan pilih ukuran logo.',
      badge: 'Custom Struk',
      targetTab: 'payment_receipt_settings',
      steps: [
        'Buka menu "Pengaturan Pembayaran & Struk". Klik tab "Pengaturan Struk Thermal".',
        'Pilih Target Outlet pada dropdown (misal: "Semua Outlet" atau cabang tertentu seperti "Outlet Cibubur").',
        'Unggah foto logo brand dengan mengklik tombol "Upload Logo" atau ketikkan URL foto logo.',
        'Pilih Ukuran Tampilan Logo (Kecil - 40px, Sedang - 56px, Besar - 80px, atau Ekstra Besar Jumbo - 112px).',
        'Isi Teks Header Outlet Kustom, Tagline Toko, Alamat Cabang, dan No. Telepon.',
        'Klik "Simpan Format Struk".'
      ]
    },
    {
      id: 'guide-receipt-2',
      category: 'receipt',
      categoryLabel: 'Struk & Printer Thermal',
      categoryIcon: Wifi,
      title: 'Reset Nomor Struk dari 0 & Info Wi-Fi Pelanggan',
      summary: 'Mengubah prefix nomor struk (ORD-), mereset nomor urut dari 0, serta menampilkan Wi-Fi di struk.',
      badge: 'Format Struk',
      targetTab: 'payment_receipt_settings',
      steps: [
        'Pada menu Pengaturan Struk, gulir ke seksi "Format & Reset Nomor Struk".',
        'Isi Prefix No. Struk (misal: ORD-, INV-, STR-).',
        'Klik tombol "Reset No. Struk dari 1 (0)" untuk mengembalikan penomoran urut ke awal.',
        'Aktifkan checkbox "Tampilkan Informasi Wi-Fi Pelanggan di Struk".',
        'Isi Nama Wi-Fi (SSID) dan Password Wi-Fi toko.',
        'Klik "Simpan Format Struk". Informasi Wi-Fi akan otomatis tercetak di setiap struk pelanggan.'
      ]
    },
    {
      id: 'guide-system-1',
      category: 'system',
      categoryLabel: 'Pembaruan ZIP & Sistem',
      categoryIcon: HardDrive,
      title: 'Pembaruan Aplikasi via File ZIP (System Software Update)',
      summary: 'Mengunggah file .zip paket update versi terbaru tanpa mengubah atau menghapus data di Firestore.',
      badge: 'System Update',
      targetTab: 'system',
      steps: [
        'Buka menu "Pengaturan Sistem" di Dashboard Admin.',
        'Gulir ke bawah ke "Seksi 4: Pembaruan Aplikasi via File ZIP (System Software Update)".',
        'Klik tombol "Pilih File Update ZIP...".',
        'Pilih berkas bundle update berformat .zip.',
        'Sistem akan otomatis memproses ekstraksi software dan menampilkan laporan ukuran file (MB), total berkas, dan status keamanan database Firestore (🛡️ Aman Untouched).'
      ],
      tips: [
        'Seluruh database transaksi, outlet, pengguna, dan pengaturan tersimpan terpisah secara permanen di Cloud Firestore, sehingga proses update aman 100%.'
      ]
    },
    {
      id: 'guide-inventory-1',
      category: 'inventory',
      categoryLabel: 'Stok & Supply Chain',
      categoryIcon: Package,
      title: 'Manajemen Stok Bahan Baku & Purchase Order (PO)',
      summary: 'Mengisi stok daging ayam, saus, bumbu, membuat PO supplier, dan opname stok.',
      badge: 'Inventory Control',
      targetTab: 'inventory',
      steps: [
        'Buka menu "Kelola Stok / Inventory".',
        'Untuk menambah stok baru: Klik "Tambah Item Bahan Baku", isi nama bahan, satuan (kg, gram, pcs), dan batas minimal stok.',
        'Untuk membuat pesanan ke Supplier: Buka tab "Purchase Orders (PO)", klik "Buat PO Baru", pilih Supplier dan jumlah barang.',
        'Setelah barang fisik dikirim supplier dan diterima toko, ubah status PO menjadi "Diterima (Received)" agar stok otomatis bertambah.'
      ]
    },
    {
      id: 'guide-users-1',
      category: 'users',
      categoryLabel: 'Hak Akses & Karyawan',
      categoryIcon: Users,
      title: 'Manajemen Karyawan, PIN Presensi & User Admin',
      summary: 'Menambah data staf, mengatur role hak akses (Super Admin, Kasir, Manager, Chef), dan PIN presensi.',
      badge: 'User Management',
      targetTab: 'karyawan',
      steps: [
        'Buka menu "Manajemen Karyawan" di Dashboard Admin.',
        'Klik "Tambah Karyawan Baru". Isi Nama Lengkap, Jabatan/Role, Outlet Tempat Tugas, Tarif Gaji Harian, dan PIN Presensi 4-Digit.',
        'Untuk mengatur akun login Admin: Buka menu "Pengaturan User Admin". Tambahkan Username & Password login.',
        'Tentukan Hak Akses Menu yang diizinkan untuk setiap akun pengguna.'
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
    { id: 'system', label: 'Pembaruan ZIP & Sistem', icon: HardDrive },
    { id: 'users', label: 'Hak Akses & Karyawan', icon: Users }
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
              <Sparkles className="w-3.5 h-3.5" /> PUSAT PANDUAN PENGGUNA
            </span>
            <span className="text-xs text-purple-200 font-bold">
              Versi 1.0.5 — Panduan Lengkap
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-baloo text-amber-400 tracking-wide">
            Tutorial Pemakaian Seluruh Menu Application
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 max-w-3xl leading-relaxed">
            Petunjuk langkah demi langkah lengkap untuk mengoperasikan Kasir POS, Presensi Kamera Selfie Watermark, Penggajian Otomatis, Pengaturan Struk Per Outlet, Pembaruan System ZIP, dan Stok Barang.
          </p>

          {/* Search Bar Input */}
          <div className="pt-2 max-w-xl">
            <div className="relative">
              <Search className="w-5 h-5 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari tutorial... (contoh: promo, struk, absensi, gaji, zip, logo, wifi)"
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
              Tidak ada panduan yang cocok dengan kata kunci "{searchTerm}". Coba gunakan kata kunci lain seperti "struk", "kasir", "gaji", atau "absensi".
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
    </div>
  );
};
