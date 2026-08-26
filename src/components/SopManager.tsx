import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FileCheck,
  ClipboardList,
  Flame,
  ShieldAlert,
  Clock,
  Utensils,
  ChefHat,
  Download,
  Search,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Sparkles,
  RefreshCw,
  Sliders,
  ChevronDown,
  ChevronUp,
  Layers,
  Info,
  ExternalLink,
  Building2,
  BadgeCheck,
  PackageCheck,
  Droplets,
  Timer,
  CheckSquare,
  Square,
  Copy,
  MessageCircle,
  FileText,
  Thermometer,
  Scale,
  Calendar,
  PhoneCall,
  Zap,
  MapPin,
  ArrowRight,
  Camera,
  ShoppingBag,
  DollarSign,
  Check,
  Trash2
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getStoredEmployees } from '../utils';
import { Employee } from '../types';

interface SopManagerProps {
  onShowToast?: (msg: string) => void;
  onNavigateTab?: (tab: string) => void;
}

interface BranchShiftInfo {
  groupName: string;
  branches: string[];
  openHours: string;
  centralKitchenPrep: string;
  durationShift: string;
  type: string;
  color: string;
}

interface SopChecklistItem {
  no: number;
  activity: string;
  parameter: string;
  standardStatus: string;
  isChecked: boolean;
  notes?: string;
}

export const SopManager: React.FC<SopManagerProps> = ({ onShowToast, onNavigateTab }) => {
  const [activeMainTab, setActiveMainTab] = useState<'all' | 'central_kitchen' | 'outlet_cooking' | 'timeline' | 'efficiency' | 'reporting' | 'checklist'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('Cibubur');
  const [expandedSection, setExpandedSection] = useState<string | null>('sec-2');
  
  // Plating Gramasi Calculator state
  const [portionCount, setPortionCount] = useState<number>(10);
  
  // Sunlight dispenser calculator
  const [dispenserVolumeMl, setDispenserVolumeMl] = useState<number>(500);

  // Digital SOP Commitment & Acknowledgement state
  const [employeeList] = useState<Employee[]>(() => {
    const list = getStoredEmployees() || [];
    return list.filter(e => e.status === 'Aktif');
  });

  const [ackRecord, setAckRecord] = useState<{ name: string; branch: string; time: string; agreed: boolean } | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('steak11_sop_ack_record');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [ackName, setAckName] = useState('');
  const [ackBranch, setAckBranch] = useState('Steak 11, Cibubur');
  const [ackAgree, setAckAgree] = useState(false);

  // Interactive Checklist State
  const initialChecklist: SopChecklistItem[] = [
    {
      no: 1,
      activity: 'Fillet Paha Ayam Marinasi',
      parameter: '100% utuh tidak dipotong, bumbu meresap rata, hitungan porsi cocok.',
      standardStatus: 'Sesuai & Lengkap',
      isChecked: true,
      notes: 'Daging utuh dari Dapur Pusat'
    },
    {
      no: 2,
      activity: '3 Varian Saus Resmi',
      parameter: 'BBQ, Black Pepper, Mushroom dalam kondisi higienis & terlabel tanggal produksi.',
      standardStatus: 'Sesuai & Lengkap',
      isChecked: true,
      notes: 'Suhu normal (siap saji)'
    },
    {
      no: 3,
      activity: 'Kentang & Sayuran Potong',
      parameter: 'Wortel & buncis segar, kentang beku bersih siap olah.',
      standardStatus: 'Sesuai & Lengkap',
      isChecked: true,
      notes: 'Kentang siap goreng golden-yellow'
    },
    {
      no: 4,
      activity: 'Kondisi Coolbox & Es Batu',
      parameter: 'Es batu cukup, susunan rapi berselang-seling, suhu dingin terjaga optimal.',
      standardStatus: 'Dingin Maksimal',
      isChecked: true,
      notes: 'Tanpa kulkas listrik'
    },
    {
      no: 5,
      activity: 'Kompor Gas & Regulator',
      parameter: 'Selang aman, tidak bocor, api stabil; regulator dilepas saat closing.',
      standardStatus: 'Aman Terkunci',
      isChecked: true,
      notes: 'Pemeriksaan rutin setiap shift'
    },
    {
      no: 6,
      activity: 'Sanitasi TAF & Sunlight',
      parameter: 'TAF meja/kompor bersih; Sunlight rasio 80:20 terpasang di dispenser.',
      standardStatus: 'Bersih Sesuai SOP',
      isChecked: true,
      notes: 'TAF hanya untuk meja & alat saji'
    },
    {
      no: 7,
      activity: 'Dual Reporting & Presensi',
      parameter: 'Web steak11.vercel.app terisi + WA terkirim + Buku manual tercatat.',
      standardStatus: 'Lengkap Terkirim',
      isChecked: true,
      notes: 'Sistem dual channel terlaksana'
    }
  ];

  const [checklist, setChecklist] = useState<SopChecklistItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('steak11_sop_checklist_state_v83');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return initialChecklist;
        }
      }
    }
    return initialChecklist;
  });

  const [checklistOfficer, setChecklistOfficer] = useState<string>('Kru Solo Operator');
  const [checklistDate, setChecklistDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('steak11_sop_checklist_state_v83', JSON.stringify(checklist));
    }
  }, [checklist]);

  const showToast = (msg: string) => {
    if (onShowToast) onShowToast(msg);
  };

  const branchShiftData: BranchShiftInfo[] = [
    {
      groupName: 'Cibubur, Kalisari, Jatisampurna',
      branches: ['Cibubur', 'Kalisari', 'Jatisampurna'],
      openHours: '14.00 – 23.00 WIB',
      centralKitchenPrep: '14.00 – 14.30 WIB',
      durationShift: 'Total 9 Jam',
      type: 'Solo Operator Shift Sore-Malam',
      color: 'purple'
    },
    {
      groupName: 'Cilangkap',
      branches: ['Cilangkap'],
      openHours: '14.30 – 23.30 WIB',
      centralKitchenPrep: '14.30 – 15.00 WIB',
      durationShift: 'Total 9 Jam',
      type: 'Solo Operator Shift Sore-Malam',
      color: 'amber'
    },
    {
      groupName: 'Kuningan',
      branches: ['Kuningan'],
      openHours: '09.00 – 21.00 WIB',
      centralKitchenPrep: '09.00 – 09.30 WIB',
      durationShift: 'Total 12 Jam',
      type: 'Solo Operator Shift Pagi-Malam',
      color: 'emerald'
    }
  ];

  const toggleChecklistItem = (no: number) => {
    const updated = checklist.map((item) =>
      item.no === no ? { ...item, isChecked: !item.isChecked } : item
    );
    setChecklist(updated);
  };

  const handleResetChecklist = () => {
    const reset = checklist.map((item) => ({ ...item, isChecked: false }));
    setChecklist(reset);
    showToast('Checklist harian di-reset. Siap untuk shift baru!');
  };

  const handleCheckAllChecklist = () => {
    const all = checklist.map((item) => ({ ...item, isChecked: true }));
    setChecklist(all);
    showToast('Semua 7 poin checklist berhasil diverifikasi [Sesuai & Lengkap]!');
  };

  // Save Digital SOP Acknowledgement & Send to WA 081223233299
  const handleSaveAcknowledgement = () => {
    if (!ackName.trim() || !ackAgree) {
      showToast('Mohon pilih nama karyawan dan centang persetujuan komitmen.');
      return;
    }
    const record = {
      name: ackName.trim(),
      branch: ackBranch,
      time: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' WIB',
      agreed: true
    };
    setAckRecord(record);
    localStorage.setItem('steak11_sop_ack_record', JSON.stringify(record));

    // WhatsApp Confirmation Template to 0812-2323-3299
    const waText = 
`*KONFIRMASI KOMITMEN & KEPATUHAN SOP STEAK 11*

Kepada: Manajemen Steak 11 (0812-2323-3299)
Dengan ini saya telah membaca, memahami, dan siap menjalankan seluruh Standar Operasional Prosedur (SOP) dengan rincian:

👤 *Nama Kru:* ${record.name}
🏬 *Cabang Penempatan:* ${record.branch}
📅 *Waktu Konfirmasi:* ${record.time}

*Pernyataan Komitmen:*
"Saya berkomitmen penuh menjalankan seluruh SOP Steak 11 secara disiplin, menjaga gramasi presisi porsi ayam 90g, kualitas masakan juicy, gorengan golden-yellow, efisiensi bahan pembersih & gas, serta pelaporan dual-channel yang tertib pada setiap shift kerja saya."

_Status: Terkonfirmasi Digital melalui Sistem Portal Steak 11_`;

    window.open(`https://wa.me/6281223233299?text=${encodeURIComponent(waText)}`, '_blank');
    showToast(`Komitmen SOP berhasil dikonfirmasi oleh ${record.name} (${record.branch}) dan pesan WhatsApp ke 081223233299 telah dibuka!`);
  };

  // Reset / Re-confirm Digital SOP Acknowledgement
  const handleResetAcknowledgement = () => {
    setAckRecord(null);
    setAckAgree(false);
    localStorage.removeItem('steak11_sop_ack_record');
    showToast('Status komitmen SOP di-reset.');
  };

  // Generate Official PDF Document of SOP in Brand Colors
  const handleExportPdfOfficial = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const primaryColor: [number, number, number] = [61, 18, 89]; // #3D1259
    const goldColor: [number, number, number] = [245, 158, 11]; // #F59E0B
    const bgLight: [number, number, number] = [250, 249, 246];

    // --- PAGE 1 ---
    // Header Banner
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 36, 'F');

    // Korean Text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('열하나', 14, 10);

    // Title
    doc.setFontSize(20);
    doc.setTextColor(...goldColor);
    doc.text('STEAK 11', 14, 18);

    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('STANDAR OPERASIONAL PROSEDUR (SOP) RESMI', 14, 25);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(230, 220, 245);
    doc.text('MYTHIC CHICKEN TASTE • System Integration: Central Kitchen & Single-Operator Outlet', 14, 31);

    // Right Header Meta Box
    doc.setFillColor(75, 24, 108);
    doc.roundedRect(132, 6, 68, 24, 2, 2, 'F');
    doc.setFontSize(7.5);
    doc.setTextColor(...goldColor);
    doc.text('Dokumen Versi: SOP Standar Steak 11', 136, 12);
    doc.setTextColor(255, 255, 255);
    doc.text('Sistem Kerja: Solo Operator (1 Kru/Cabang)', 136, 18);
    doc.text('Portal Digital: steak11.vercel.app', 136, 24);

    // Operational Framework Badges
    doc.setFillColor(243, 238, 248);
    doc.roundedRect(14, 40, 56, 16, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Struktur Operasional: Hub-and-Spoke', 17, 46);
    doc.setFont('helvetica', 'normal');
    doc.text('Pusat Saji: Central Kitchen (Dapur Pusat)', 17, 51);

    doc.setFillColor(243, 238, 248);
    doc.roundedRect(74, 40, 62, 16, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Jaringan 5 Cabang Outlet:', 77, 46);
    doc.setFont('helvetica', 'normal');
    doc.text('Cibubur, Kalisari, Cilangkap, Kuningan, Jatisampurna', 77, 51);

    doc.setFillColor(243, 238, 248);
    doc.roundedRect(140, 40, 56, 16, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Sistem Laporan:', 143, 46);
    doc.setFont('helvetica', 'normal');
    doc.text('Digital (Web + WA) & Buku Manual Cabang', 143, 51);

    // Section 0: Rincian Jam Operasional & Shift
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...primaryColor);
    doc.text('RINCIAN JAM OPERASIONAL & SHIFT RESMI PER CABANG OUTLET', 14, 63);

    autoTable(doc, {
      startY: 66,
      head: [['Grup Cabang / Outlet', 'Jam Operasional Outlet', 'Persiapan Dapur Pusat', 'Durasi & Tipe Shift']],
      body: [
        ['Cibubur, Kalisari, Jatisampurna', '14.00 – 23.00 WIB', '14.00 – 14.30 WIB', 'Total 9 Jam (Solo Operator Shift Sore-Malam)'],
        ['Cilangkap', '14.30 – 23.30 WIB', '14.30 – 15.00 WIB', 'Total 9 Jam (Solo Operator Shift Sore-Malam)'],
        ['Kuningan', '09.00 – 21.00 WIB', '09.00 – 09.30 WIB', 'Total 12 Jam (Solo Operator Shift Pagi-Malam)']
      ],
      styles: { fontSize: 7.5, cellPadding: 2.5 },
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 245, 250] },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' },
        1: { cellWidth: 42, halign: 'center' },
        2: { cellWidth: 40, halign: 'center' },
        3: { cellWidth: 50 }
      }
    });

    let currentY = (doc as any).lastAutoTable.finalY + 8;

    // BAGIAN 1: DAPUR PUSAT
    doc.setFillColor(...primaryColor);
    doc.roundedRect(14, currentY, 182, 7, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('BAGIAN 1: DAPUR PUSAT (CENTRAL KITCHEN) & LOGISTIK HUB', 18, currentY + 4.8);

    currentY += 11;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(50, 50, 50);
    doc.text('Dapur Pusat mengendalikan penuh preparasi bahan mentah, marinasi, pengolahan 3 varian saus resmi, uji kelayakan rasa (QC), dan sanitasi lantai. Seluruh outlet cabang mengambil stok harian langsung di Pusat sebelum jam operasional dimulai.', 14, currentY, { maxWidth: 182 });

    currentY += 9;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('1.1 Standar Pengolahan Fillet Paha Ayam & Marinasi', 14, currentY);

    currentY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    doc.text('• Spesifikasi Daging: Wajib menggunakan 100% fillet paha ayam segar. Daging diterima dan diproses utuh dan DILARANG DIPOTONG LAGI di Dapur Pusat.', 17, currentY, { maxWidth: 179 });
    currentY += 7;
    doc.text('• Presisi Bumbu Marinasi: Balur fillet paha secara merata menggunakan bumbu marinasi khusus tepat 1 1/2 sendok makan per 5kg ayam.', 17, currentY, { maxWidth: 179 });
    currentY += 5;
    doc.text('• Waktu Peresapan: Simpan daging terbalur di dalam chiller Dapur Pusat minimal 4 – 6 jam agar bumbu meresap sempurna hingga ke serat dalam.', 17, currentY, { maxWidth: 179 });
    currentY += 5;
    doc.text('• Sanitasi Dapur Pusat: Setelah seluruh proses marinasi dan pengolahan bahan selesai, staf Dapur Pusat wajib mengepel lantai dari area dapur hingga ke depan rumah pusat menggunakan cairan pembersih.', 17, currentY, { maxWidth: 179 });

    currentY += 8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('1.2 Produksi 3 Varian Saus Resmi & Quality Control (QC)', 14, currentY);
    currentY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    doc.text('Dapur Pusat HANYA memproduksi 3 varian saus resmi Steak 11: Barbeque (BBQ), Black Pepper, dan Mushroom.', 17, currentY);
    currentY += 4.5;
    doc.text('• Uji Kelayakan (QC): Sebelum dikemas, koki Dapur Pusat wajib menguji konsistensi kekentalan, aroma, dan cita rasa saus.', 17, currentY, { maxWidth: 179 });
    currentY += 4.5;
    doc.text('• Pengemasan Higienis: Saus dikemas higienis dalam pouch/pail food grade dan wajib diberi label tanggal produksi.', 17, currentY, { maxWidth: 179 });

    currentY += 8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('1.3 Logistik, Pengambilan Stok & Verifikasi Cabang', 14, currentY);
    currentY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    doc.text('• Rute Ambil Stok Harian: Karyawan/kru outlet WAJIB datang ke Dapur Pusat terlebih dahulu setiap hari untuk mengambil stok porsi ayam marinasi, saus, kentang, sayuran, dan kemasan sebelum berangkat ke outlet masing-masing.', 17, currentY, { maxWidth: 179 });
    currentY += 7;
    doc.text('• Verifikasi Stok Serah Terima: Hitung jumlah porsi ayam dan kemasan saus secara teliti bersama petugas Dapur Pusat, lalu catat serta verifikasi di form serah terima.', 17, currentY, { maxWidth: 179 });

    // BAGIAN 2 START (Bottom of page 1)
    currentY += 9;
    doc.setFillColor(...primaryColor);
    doc.roundedRect(14, currentY, 182, 7, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('BAGIAN 2: SPESIFIKASI PERALATAN & STANDAR OPERASIONAL OUTLET CABANG', 18, currentY + 4.8);

    currentY += 10;
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(14, currentY, 182, 26, 2, 2, 'FD');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text('PERINGATAN STANDAR ALAT OUTLET CABANG (MUTLAK):', 17, currentY + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    doc.text('1. Penyimpanan Coolbox: Menggunakan Coolbox + Es Batu. Susun porsi ayam dan saus berselang-seling es batu.', 17, currentY + 9, { maxWidth: 176 });
    doc.text('2. Kompor Gas & Wajan: Menggunakan Kompor Gas & Wajan. Gunakan api sedang untuk ayam & api 170°C–180°C untuk kentang.', 17, currentY + 14, { maxWidth: 176 });
    doc.text('3. Penyajian Saus: Saus resmi (BBQ / Black Pepper / Mushroom) disiramkan di atas porsi atau disajikan dalam cup terpisah.', 17, currentY + 19, { maxWidth: 176 });
    doc.text('4. Timbangan Digital (90g): Wajib menggunakan timbangan digital dapur untuk memastikan berat fillet ayam tepat 90 Gram.', 17, currentY + 24, { maxWidth: 176 });

    // Page 1 Footer
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('STEAK 11 • Standard Operating Procedure (SOP)', 14, 290);
    doc.text('Halaman 1 dari 3', 175, 290);

    // --- PAGE 2 ---
    doc.addPage();
    currentY = 16;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...primaryColor);
    doc.text('2.1 Standar Penggorengan Kentang (Poin Sangat Krusial Outlet)', 14, currentY);

    currentY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(40, 40, 40);
    doc.text('Goreng kentang pada minyak panas bersuhu 170°C – 180°C di wajan kompor gas. Ikuti instruksi mutlak berikut:', 14, currentY);

    currentY += 4.5;
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(239, 68, 68);
    doc.roundedRect(14, currentY, 182, 16, 2, 2, 'FD');
    doc.setTextColor(185, 28, 28);
    doc.setFont('helvetica', 'bold');
    doc.text('• ATURAN EMAS: Angkat kentang SEGERA TEPAT SAAT MENGAMBANG di permukaan minyak dan warnanya berubah menjadi SEDIKIT KEEMASAN (Golden-Yellow).', 17, currentY + 5.5, { maxWidth: 176 });
    doc.text('• DILARANG KERAS menunggu sampai cokelat tua/kering agar kentang tidak keras dan tidak alot. Tiriskan minyak hingga bersih sebelum disajikan.', 17, currentY + 12, { maxWidth: 176 });

    currentY += 21;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('2.2 Standar Memasak, Gramasi & Penyajian (Cooking & Plating Presisi)', 14, currentY);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Komponen Porsi', 'Standar Gramasi / Porsi', 'Petunjuk Teknis Pemasakan & Penyajian']],
      body: [
        ['Steak Ayam Fillet Paha', 'Ditimbang tepat 90 Gram', 'Masak/goreng fillet paha ayam marinasi hingga matang merata (suhu internal >75°C, bagian luar renyah/juicy).'],
        ['Kentang Goreng', 'Tepat 5 Potong', 'Digoreng keemasan (*golden-yellow*), ditiriskan minyaknya, disajikan renyah.'],
        ['Wortel Rebus', 'Tepat 4 Potong', 'Dipotong rapi, matang pas, segar dan tidak lembek/hancur.'],
        ['Buncis Rebus', 'Tepat 2 Potong', 'Warna hijau segar, dipotong seragam, disajikan sejajar.'],
        ['Saus Resmi (BBQ/Black Pepper/Mushroom)', '1 Porsi Saus (±40-50 ml)', 'Disiramkan di atas porsi atau disajikan dalam cup terpisah.']
      ],
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 245, 250] },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' },
        1: { cellWidth: 42, halign: 'center', fontStyle: 'bold' },
        2: { cellWidth: 90 }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    // 2.3 Hospitality
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.text('2.3 Standar Pelayanan Konsumen, Hospitality (3S) & Higienitas Kru', 14, currentY);

    autoTable(doc, {
      startY: currentY + 2.5,
      head: [['Pilar Standar Pelayanan', 'Pedoman & Kalimat Baku Solo Operator Steak 11']],
      body: [
        ['Greeting Baku 3S (Senyum, Salam, Sapa)', '• Menyambut: "Selamat datang di Steak 11! Mau pesan steak dengan saus apa Kak? Ada BBQ, Black Pepper, dan Mushroom."\n• Konfirmasi: "Sausnya mau langsung disiram di atas steak atau dipisah dalam cup Kak?"\n• Serah Terima: "Terima kasih banyak Kak, selamat menikmati Steak 11!"'],
        ['Penanganan Komplain (Customer First)', 'Dengarkan keluhan dengan tenang tanpa berdebat. Jika kematangan ayam/kentang kurang pas/salah saus, segera ganti baru dengan ramah dan prioritaskan pengerjaannya.'],
        ['Higienitas Personal & Grooming', 'Wajib mengenakan apron bersih & pakaian rapi. Selalu cuci tangan dengan sabun sebelum dan sesudah bekerja. Dilarang merokok/bermain HP saat memasak & melayani pembeli.']
      ],
      styles: { fontSize: 6.8, cellPadding: 2 },
      headStyles: { fillColor: [74, 22, 107], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 245, 250] },
      columnStyles: {
        0: { cellWidth: 55, fontStyle: 'bold' },
        1: { cellWidth: 127 }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;

    // BAGIAN 3: TIMELINE OPERASIONAL HARIAN
    doc.setFillColor(...primaryColor);
    doc.roundedRect(14, currentY, 182, 7, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('BAGIAN 3: TIMELINE OPERASIONAL HARIAN TEREDUKSI PER CABANG', 18, currentY + 4.8);

    currentY += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(50, 50, 50);
    doc.text('Setiap kru cabang bertanggung jawab penuh secara mandiri (Solo Operator). Timeline ini disesuaikan secara proporsional sesuai jam operasional masing-masing cabang:', 14, currentY, { maxWidth: 182 });

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Fase Operasional', 'Jam Pelaksanaan Sesuai Cabang', 'Detail Prosedur Standar Kru Cabang']],
      body: [
        [
          'Fase 1: Pre-Opening & Logistik\n30-60 Menit Sebelum Buka',
          '• Cibubur, Kalisari, Jatisampurna: 14.00 – 14.30\n• Cilangkap: 14.30 – 15.00\n• Kuningan: 09.00 – 09.30',
          '1. Pengisian BBM & Logistik: Bensin motor wajib terisi (min. 1 jam sebelum jam masuk). Ambil stok daging, saus, sayur, es batu & kemasan di Dapur Pusat.\n2. Tiba di outlet min. 30 menit sebelum buka. Buka gembok gerobak.\n3. Clock-In Digital: Presensi masuk di steak11.vercel.app.\n4. Susun porsi ayam & saus di Coolbox berselang-seling es batu.\n5. Cek selang regulator gas & kenakan apron bersih.'
        ],
        [
          'Fase 2: Operasional Reguler\nAwal Buka s/d Sebelum Peak Hours',
          '• Cibubur, Kalisari, Jatisampurna: 14.30 – 18.00\n• Cilangkap: 15.00 – 18.30\n• Kuningan: 09.30 – 11.30 & 14.00 – 17.00',
          '1. Sambut pelanggan dengan ramah. Catat pilihan saus & pembayaran.\n2. Masak ayam marinasi juicy & goreng kentang mengambang keemasan.\n3. Plating presisi: 90g ayam, 5 kentang, 4 wortel, 2 buncis + saus.\n4. Sela sepi: Lap meja kerja/pelanggan dengan cairan TAF.'
        ],
        [
          'Fase 3: Peak Hours (Jam Sibuk)\nPeriode Antrean Padat',
          '• Cibubur, Kalisari, Jatisampurna: 18.00 – 21.30\n• Cilangkap: 18.30 – 22.00\n• Kuningan: 11.30 – 14.00 (Siang) & 17.00 – 20.00 (Malam)',
          'Hierarki Prioritas Kerja Eksekusi Cepat:\n1. Utama: Jaga wajan masakan ayam & kentang agar matang sempurna tanpa gosong.\n2. Kedua: Melayani antrean transaksi kasir.\n3. Ketiga: Plating cepat & serahkan masakan selagi hangat.\n4. Keempat: Bersihkan meja dan area sekitar hanya saat wajan kosong.'
        ],
        [
          'Fase 4: Closing, Sanitasi & Reporting\n30-45 Menit Penutupan Shift',
          '• Cibubur, Kalisari, Jatisampurna: 22.15 – 23.00\n• Cilangkap: 22.45 – 23.30\n• Kuningan: 20.15 – 21.00',
          '1. Matikan kompor & LEPAS REGULATOR GAS dari tabung.\n2. Cuci wajan/alat saji. Lap meja/kompor dengan Cairan TAF.\n3. Hitung uang tunai (cash on hand), pisahkan modal kembalian.\n4. Digital Report: Input web steak11.vercel.app & send WA Group.\n5. Manual Report: Catat stok bawaan, sisa ayam coolbox & restock besok.\n6. Clock-Out Digital, buang sampah, kunci & gembok gerobak.'
        ]
      ],
      styles: { fontSize: 6.8, cellPadding: 2 },
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 245, 250] },
      columnStyles: {
        0: { cellWidth: 42, fontStyle: 'bold' },
        1: { cellWidth: 46 },
        2: { cellWidth: 94 }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;

    // BAGIAN 4 HEADER (Bottom of page 2)
    doc.setFillColor(...primaryColor);
    doc.roundedRect(14, currentY, 182, 7, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('BAGIAN 4: PANDUAN EFISIENSI, PEMELIHARAAN ASET & LOGISTIK OUTLET', 18, currentY + 4.8);

    // Page 2 Footer
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('STEAK 11 • Standard Operating Procedure (SOP)', 14, 290);
    doc.text('Halaman 2 dari 3', 175, 290);

    // --- PAGE 3 ---
    doc.addPage();
    currentY = 16;

    autoTable(doc, {
      startY: currentY,
      head: [['Area Penghematan / Aset', 'Standar Aturan / Rasio', 'Instruksi Prosedur Standar (SOP Efisiensi & Logistik)']],
      body: [
        ['Cairan Pembersih TAF', 'ATURAN KHUSUS', 'Penggunaan Terbatas: Cairan pembersih TAF HANYA Boleh Digunakan khusus untuk meja pelanggan/meja kerja, kompor grill, dan alat-alat penyajian. Dilarang keras menggunakan TAF untuk lantai, gerobak umum, atau tempat cuci piring.'],
        ['Minyak Goreng Wajan', 'Penggantian Berkala (1 Bulan Sekali)', 'Minyak goreng pada wajan kompor wajib dijaga kebersihannya dari sisa remah dan diganti total 1 bulan sekali. Saring remah gorengan setiap hari setelah operasional.'],
        ['Sabun Cuci Piring (Sunlight)', 'Rasio 80% Sabun : 20% Air', 'Campurkan cairan pencuci piring dengan air bersih menggunakan rasio 80% sabun: 20% air di dalam botol dispenser. Dilarang mengucurkan sabun murni dari refill.'],
        ['Penggunaan Tisu vs Kain Lap', 'Tisu HANYA untuk Konsumen', 'Gunakan kain lap khusus untuk pembersihan umum (meja/kompor/gerobak). Hemat penggunaan tisu kertas (tisu HANYA disajikan untuk konsumen). Kain lap wajib dicuci bersih tiap shift.'],
        ['Gas Elpiji & Energi', 'Manajemen Api & Regulator', 'Kecilkan api kompor saat tidak ada antrean pesanan. Wajib melepas regulator gas dari tabung saat penutupan outlet ("closing"). Matikan lampu dekorasi pada siang hari.'],
        ['Kantong Plastik / Kemasan', 'Sistem Rapih Mingguan', 'Gunakan kantong plastik sesuai kapasitas porsi pesanan. Bawa pulang/rapikan sisa stok plastik berlebih setiap hari Minggu (Khusus cabang Kuningan: Hari Jumat).'],
        ['Motor Operasional & BBM', 'BBM 1 Jam Sebelum Masuk & Cuci 1x/Bulan', 'Pengisian BBM motor wajib dilakukan min. 1 jam sebelum jam masuk kerja / sebelum ambil stok di Dapur Pusat agar pengiriman tidak tertunda. Fisik motor wajib dicuci/dibersihkan minimal 1 bulan sekali demi higienitas bahan makanan.'],
        ['Pembersihan Gerobak Total', 'Sebelum Jadwal Libur', 'Lakukan pembersihan menyeluruh (deep cleaning) pada seluruh fisik gerobak, etalase, dan area kerja sebelum jadwal hari libur karyawan. Bawa pulang apron untuk dicuci bersih sesuai jadwal cabang (Minggu / Khusus Kuningan: Hari Jumat).'],
        ['Pengelolaan Sampah Harian', 'Wajib Harian (Piket)', 'Ikat rapi seluruh sampah operasional dijadikan satu di dalam kantong plastik hitam sampah. Buang sampah harian ke tempat pembuangan sampah (TPS) resmi sesuai jadwal piket harian yang telah ditunjuk per orang.']
      ],
      styles: { fontSize: 6.8, cellPadding: 2 },
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 245, 250] },
      columnStyles: {
        0: { cellWidth: 42, fontStyle: 'bold' },
        1: { cellWidth: 44, fontStyle: 'bold', halign: 'center' },
        2: { cellWidth: 96 }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;

    // BAGIAN 5: SISTEM PELAPORAN LENGKAP
    doc.setFillColor(...primaryColor);
    doc.roundedRect(14, currentY, 182, 7, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('BAGIAN 5: SISTEM PELAPORAN LENGKAP (DUAL-CHANNEL REPORTING)', 18, currentY + 4.8);

    currentY += 10;
    // Box 1: Alur Pelaporan Digital
    doc.setFillColor(243, 238, 248);
    doc.roundedRect(14, currentY, 88, 52, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...primaryColor);
    doc.text('1. ALUR PELAPORAN DIGITAL (WEBSITE & WA GROUP)', 17, currentY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(40, 40, 40);
    doc.text('Buka website steak11.vercel.app dan isi data laporan harian berikut:', 17, currentY + 11, { maxWidth: 82 });
    doc.text('1. Jumlah Uang Terhitung: Masukkan jumlah total uang tunai yang terhitung (cash on hand).', 17, currentY + 18, { maxWidth: 82 });
    doc.text('2. Rincian Penjualan: Masukkan rincian porsi/menu yang berhasil terjual.', 17, currentY + 25, { maxWidth: 82 });
    doc.text('3. Rincian Pembayaran Non-Tunai: Masukkan nominal transaksi via QRIS / Transfer / Online Food.', 17, currentY + 32, { maxWidth: 82 });
    doc.text('4. Kirim Konfirmasi WA: Salin/ekspor ringkasan hasil input website dan kirimkan langsung ke Grup WhatsApp Manajemen Steak 11.', 17, currentY + 39, { maxWidth: 82 });
    doc.text('5. Presensi Pulang: Lakukan Clock-Out Presensi Pulang pada sistem website sebelum meninggalkan outlet.', 17, currentY + 47, { maxWidth: 82 });

    // Box 2: Alur Pelaporan Manual
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(108, currentY, 88, 52, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(180, 83, 9);
    doc.text('2. ALUR PELAPORAN MANUAL (BUKU LAPORAN OUTLET)', 111, currentY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(40, 40, 40);
    doc.text('Setiap akhir shift, staf wajib menuliskan laporan fisik pada Buku Laporan Manual outlet yang mencakup:', 111, currentY + 12, { maxWidth: 82 });
    doc.text('1. Daftar Barang Bawaan: Tuliskan secara keseluruhan daftar barang/stok yang dibawa dari Dapur Pusat hari ini.', 111, currentY + 22, { maxWidth: 82 });
    doc.text('2. Permintaan Stok Besok: Tuliskan rincian permintaan barang/stok yang akan diambil dan dibawa dari Dapur Pusat untuk operasional esok hari.', 111, currentY + 32, { maxWidth: 82 });
    doc.text('3. Sisa Stok Daging Ayam: Tuliskan pencatatan akurat jumlah sisa stok porsi daging ayam yang tersisa di coolbox.', 111, currentY + 42, { maxWidth: 82 });

    currentY += 56;

    // BAGIAN 6: CHECKLIST HARIAN
    doc.setFillColor(...primaryColor);
    doc.roundedRect(14, currentY, 182, 7, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('BAGIAN 6: CHECKLIST HARIAN SERAH TERIMA & OPERASIONAL HARIAN', 18, currentY + 4.8);

    autoTable(doc, {
      startY: currentY + 9,
      head: [['No', 'Item / Aktivitas Pemeriksaan', 'Standar Parameter Kelayakan', 'Status Verifikasi']],
      body: [
        ['1', 'Fillet Paha Ayam Marinasi', '100% utuh tidak dipotong, bumbu meresap, hitungan porsi cocok.', '[ X ] Sesuai & Lengkap'],
        ['2', '3 Varian Saus Resmi', 'BBQ, Black Pepper, Mushroom dalam kondisi higienis & terlabel.', '[ X ] Sesuai & Lengkap'],
        ['3', 'Kentang & Sayuran Potong', 'Wortel & buncis segar, kentang beku bersih siap olah.', '[ X ] Sesuai & Lengkap'],
        ['4', 'Kondisi Coolbox & Es Batu', 'Es batu cukup, susunan rapi, suhu dingin terjaga optimal.', '[ X ] Dingin Maksimal'],
        ['5', 'Kompor Gas & Regulator', 'Selang aman, tidak bocor, api stabil; regulator dilepas saat closing.', '[ X ] Aman Terkunci'],
        ['6', 'Sanitasi TAF & Sunlight', 'TAF meja/kompor bersih; Sunlight rasio 80:20 terpasang di dispenser.', '[ X ] Bersih Sesuai SOP'],
        ['7', 'Dual Reporting & Presensi', 'Web steak11.vercel.app terisi + WA terkirim + Buku manual tercatat.', '[ X ] Lengkap Terkirim']
      ],
      styles: { fontSize: 6.8, cellPadding: 1.8 },
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 245, 250] },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 46, fontStyle: 'bold' },
        2: { cellWidth: 92 },
        3: { cellWidth: 36, halign: 'center', fontStyle: 'bold' }
      }
    });

    // Page 3 Footer
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('STEAK 11 • Standard Operating Procedure (SOP)', 14, 290);
    doc.text('Halaman 3 dari 3', 175, 290);

    doc.save(`SOP_Steak11_Brand_Edition_${checklistDate}.pdf`);
    showToast('Dokumen PDF SOP berhasil diunduh!');
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Top Banner Header */}
      <div className="bg-linear-to-r from-[#3D1259] via-[#4D1770] to-[#250838] p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-purple-800/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-purple-950 font-black text-xs uppercase tracking-wider font-mono shadow-xs">
                열하나 STEAK 11
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-baloo tracking-tight text-white leading-tight">
              STANDAR OPERASIONAL PROSEDUR (SOP) RESMI
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 font-medium leading-relaxed">
              <strong className="text-amber-300">MYTHIC CHICKEN TASTE</strong> • System Integration: Central Kitchen & Single-Operator Outlet. Sistem kerja mandiri (Solo Operator 1 Kru/Cabang) dengan integrasi Dapur Pusat & Pelaporan Ganda (Web + WA & Buku Manual Cabang).
            </p>

            <div className="flex flex-wrap gap-4 pt-1 text-xs text-purple-200">
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong>Struktur:</strong> Hub-and-Spoke (Central Kitchen)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>5 Cabang:</strong> Cibubur, Kalisari, Cilangkap, Kuningan, Jatisampurna</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong>Sistem:</strong> Solo Operator 1 Kru/Cabang</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={handleExportPdfOfficial}
              className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              title="Unduh Dokumen PDF Resmi SOP"
            >
              <Download className="w-4 h-4 text-purple-950" />
              <span>Cetak / Download PDF Resmi</span>
            </button>
            <button
              onClick={() => setActiveMainTab('checklist')}
              className="px-5 py-3 rounded-2xl bg-purple-900/80 hover:bg-purple-900 text-amber-300 font-extrabold text-xs border border-amber-400/40 shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ClipboardList className="w-4 h-4 text-amber-400" />
              <span>Buka Checklist Harian (7 Poin)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Search & Tab Navigation Bar */}
      <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari SOP (cth: marinasi, TAF, kentang, saus, Kuningan)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-purple-950 text-xs font-semibold border border-slate-200 dark:border-purple-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'Semua SOP', icon: Layers },
            { id: 'central_kitchen', label: '1. Dapur Pusat', icon: ChefHat },
            { id: 'outlet_cooking', label: '2. Masak & Plating', icon: Utensils },
            { id: 'timeline', label: '3. Timeline Shift', icon: Clock },
            { id: 'efficiency', label: '4. Efisiensi & Hemat', icon: Sparkles },
            { id: 'reporting', label: '5. Dual Reporting', icon: MessageCircle },
            { id: 'checklist', label: '6. Checklist Serah Terima', icon: CheckSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeMainTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMainTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-purple-950/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-purple-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400 dark:text-purple-950' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MATRIX JAM OPERASIONAL & SHIFT PER CABANG (Live Branch Selector) */}
      <div className="bg-white dark:bg-[#1f0e30] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-purple-900/40">
          <div>
            <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Rincian Jam Operasional & Shift Resmi Per Cabang Outlet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sistem Solo Operator (1 Kru/Cabang). Seluruh kru wajib mengambil stok di Dapur Pusat sebelum jam buka outlet.
            </p>
          </div>

          {/* Branch Filter Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Pilih Cabang:</span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-950 dark:text-amber-300 font-extrabold text-xs border border-purple-200 dark:border-purple-800 cursor-pointer focus:ring-2 focus:ring-amber-400"
            >
              <option value="Cibubur">Steak 11 Cibubur</option>
              <option value="Kalisari">Steak 11 Kalisari</option>
              <option value="Cilangkap">Steak 11 Cilangkap</option>
              <option value="Kuningan">Steak 11 Kuningan</option>
              <option value="Jatisampurna">Steak 11 Jatisampurna</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {branchShiftData.map((item, idx) => {
            const isSelectedGroup = item.branches.includes(selectedBranch);
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all ${
                  isSelectedGroup
                    ? 'bg-purple-50 dark:bg-purple-950/80 border-amber-400 shadow-md ring-2 ring-amber-400/30'
                    : 'bg-slate-50/70 dark:bg-[#180a26] border-slate-200 dark:border-purple-900/40 opacity-90'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <h4 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-300 font-baloo">
                    {item.groupName}
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-purple-950 dark:text-amber-300 border border-amber-400/40">
                    {item.durationShift}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-purple-900/30 border border-slate-200 dark:border-purple-800">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">Jam Buka Outlet:</span>
                    <strong className="text-purple-950 dark:text-amber-400 font-extrabold">{item.openHours}</strong>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-purple-900/30 border border-slate-200 dark:border-purple-800">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">Ambil Stok Dapur Pusat:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">{item.centralKitchenPrep}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-400/10 border border-amber-400/20 text-[11px] text-slate-700 dark:text-slate-300">
                    <strong>Tipe Shift:</strong> {item.type}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- CONTENT SECTION 1: DAPUR PUSAT (CENTRAL KITCHEN) & LOGISTIK HUB --- */}
      {(activeMainTab === 'all' || activeMainTab === 'central_kitchen') && (
        <div className="bg-white dark:bg-[#1f0e30] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-purple-900/40 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#3D1259] dark:text-amber-400 flex items-center justify-center font-extrabold font-baloo shadow-xs">
                1
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-[#3D1259] dark:text-amber-400 font-baloo">
                  BAGIAN 1: DAPUR PUSAT (CENTRAL KITCHEN) & LOGISTIK HUB
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pusat kendali preparasi bahan mentah, marinasi, saus resmi, QC, dan serah terima stok cabang.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-amber-300 font-bold text-xs">
              Hub Logistik
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 1.1 Standar Pengolahan Fillet Paha Ayam */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-purple-950/40 border border-slate-200 dark:border-purple-900/60 space-y-3.5">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-500 shrink-0" />
                <h4 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-300 font-baloo">
                  1.1 Fillet Paha Ayam & Marinasi
                </h4>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200">
                  <strong className="block font-black text-rose-700 dark:text-rose-400 mb-1">
                    ⚠️ DILARANG DIPOTONG LAGI!
                  </strong>
                  Wajib menggunakan <strong>100% fillet paha ayam segar</strong>. Daging diterima dan diproses utuh. Dilarang keras dipotong lagi di Dapur Pusat!
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-purple-900/30 border border-slate-200 dark:border-purple-800 space-y-1">
                  <span className="font-bold text-purple-950 dark:text-amber-300 block">
                    🥄 Presisi Bumbu Marinasi:
                  </span>
                  <p className="text-slate-600 dark:text-slate-300">
                    Balur fillet paha secara merata menggunakan bumbu marinasi khusus tepat <strong>1 ½ sendok makan per 5kg ayam</strong>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-purple-900/30 border border-slate-200 dark:border-purple-800 space-y-1">
                  <span className="font-bold text-purple-950 dark:text-amber-300 block">
                    ❄️ Waktu Peresapan Chiller:
                  </span>
                  <p className="text-slate-600 dark:text-slate-300">
                    Simpan daging terbalur di dalam chiller Dapur Pusat minimal <strong>4 – 6 jam</strong> agar bumbu meresap sempurna hingga ke serat dalam.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-purple-900/30 border border-slate-200 dark:border-purple-800 space-y-1">
                  <span className="font-bold text-purple-950 dark:text-amber-300 block">
                    🧹 Sanitasi Dapur Pusat:
                  </span>
                  <p className="text-slate-600 dark:text-slate-300">
                    Setelah proses selesai, staf wajib mengepel lantai dari area dapur hingga depan rumah pusat dengan cairan pembersih.
                  </p>
                </div>
              </div>
            </div>

            {/* 1.2 Produksi 3 Varian Saus Resmi */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-purple-950/40 border border-slate-200 dark:border-purple-900/60 space-y-3.5">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500 shrink-0" />
                <h4 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-300 font-baloo">
                  1.2 Produksi 3 Saus Resmi & QC
                </h4>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-300">
                  <span className="font-black block mb-1">3 Varian Saus Resmi Steak 11:</span>
                  <div className="grid grid-cols-3 gap-1.5 text-center font-bold text-[11px]">
                    <span className="p-1.5 rounded-lg bg-white dark:bg-purple-900/60 border border-amber-300 dark:border-amber-700">1. Barbeque (BBQ)</span>
                    <span className="p-1.5 rounded-lg bg-white dark:bg-purple-900/60 border border-amber-300 dark:border-amber-700">2. Black Pepper</span>
                    <span className="p-1.5 rounded-lg bg-white dark:bg-purple-900/60 border border-amber-300 dark:border-amber-700">3. Mushroom</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-purple-900/30 border border-slate-200 dark:border-purple-800 space-y-1">
                  <span className="font-bold text-purple-950 dark:text-amber-300 block">
                    🧪 Uji Kelayakan Rasa (QC):
                  </span>
                  <p className="text-slate-600 dark:text-slate-300">
                    Sebelum dikemas, koki Dapur Pusat wajib menguji konsistensi kekentalan, aroma khas, dan cita rasa saus.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-purple-900/30 border border-slate-200 dark:border-purple-800 space-y-1">
                  <span className="font-bold text-purple-950 dark:text-amber-300 block">
                    🏷️ Pengemasan Higienis & Label:
                  </span>
                  <p className="text-slate-600 dark:text-slate-300">
                    Saus dikemas higienis dalam pouch/pail food grade dan <strong>wajib diberi label tanggal produksi</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* 1.3 Logistik, Pengambilan Stok & Verifikasi */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-purple-950/40 border border-slate-200 dark:border-purple-900/60 space-y-3.5">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <h4 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-300 font-baloo">
                  1.3 Logistik & Serah Terima Cabang
                </h4>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-950 dark:text-amber-300">
                  <strong className="block font-black mb-1">🛵 Rute Ambil Stok Harian:</strong>
                  Karyawan/kru outlet <strong>WAJIB</strong> datang ke Dapur Pusat terlebih dahulu setiap hari untuk mengambil stok porsi ayam marinasi, saus, kentang, sayuran, dan kemasan sebelum berangkat ke outlet masing-masing.
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-purple-900/30 border border-slate-200 dark:border-purple-800 space-y-1">
                  <span className="font-bold text-purple-950 dark:text-amber-300 block">
                    📋 Verifikasi Form Serah Terima:
                  </span>
                  <p className="text-slate-600 dark:text-slate-300">
                    Hitung jumlah porsi ayam dan kemasan saus secara teliti bersama petugas Dapur Pusat, lalu catat serta verifikasi di form serah terima.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-300">
                  <strong>✅ Standar Kelayakan:</strong> 100% data stok cocok antara fisik dan form serah terima sebelum meninggalkan Dapur Pusat.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CONTENT SECTION 2: SPESIFIKASI PERALATAN & STANDAR OPERASIONAL OUTLET CABANG --- */}
      {(activeMainTab === 'all' || activeMainTab === 'outlet_cooking') && (
        <div className="bg-white dark:bg-[#1f0e30] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-purple-900/40 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-purple-950 flex items-center justify-center font-extrabold font-baloo shadow-xs">
                2
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-[#3D1259] dark:text-amber-400 font-baloo">
                  BAGIAN 2: SPESIFIKASI PERALATAN & STANDAR OPERASIONAL OUTLET CABANG
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Standar alat non-listrik (Coolbox & Kompor Gas), teknik goreng kentang golden-yellow, dan gramasi plating presisi.
                </p>
              </div>
            </div>
          </div>

          {/* 4 WARNING BOXES PERALATAN */}
          <div className="p-4 rounded-2xl bg-amber-400/10 border-2 border-amber-400/40 space-y-2.5">
            <h4 className="font-black text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> PERINGATAN STANDAR ALAT OUTLET CABANG (MUTLAK):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-purple-950/80 border border-amber-300 dark:border-purple-800 space-y-1">
                <span className="font-extrabold text-[#3D1259] dark:text-amber-300 block">
                  1. Penyimpanan Coolbox + Es Batu
                </span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  Menggunakan Coolbox + Es Batu. Susun porsi ayam dan saus berselang-seling es batu.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-purple-950/80 border border-amber-300 dark:border-purple-800 space-y-1">
                <span className="font-extrabold text-[#3D1259] dark:text-amber-300 block">
                  2. Kompor Gas & Wajan Masak
                </span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  Menggunakan Kompor Gas & Wajan. Gunakan api sedang untuk ayam & api 170°C–180°C untuk kentang. Jaga wajan selalu bersih dari sisa bumbu.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-purple-950/80 border border-amber-300 dark:border-purple-800 space-y-1">
                <span className="font-extrabold text-[#3D1259] dark:text-amber-300 block">
                  3. Penyajian Saus
                </span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  Saus resmi (BBQ / Black Pepper / Mushroom) disiramkan di atas porsi atau disajikan dalam cup terpisah.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-purple-950/80 border border-amber-300 dark:border-purple-800 space-y-1">
                <span className="font-extrabold text-[#3D1259] dark:text-amber-300 block">
                  4. Timbangan Digital (90g)
                </span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  Wajib menggunakan timbangan digital dapur untuk memastikan berat fillet paha ayam marinasi tepat 90 Gram per porsi sebelum dimasak.
                </p>
              </div>
            </div>
          </div>

          {/* 2.1 PENGGORENGAN KENTANG (KRUSIAL) */}
          <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-rose-800 dark:text-rose-300 flex items-center gap-2 font-baloo">
                <Flame className="w-5 h-5 text-rose-500" />
                2.1 Standar Penggorengan Kentang (Poin Sangat Krusial Outlet)
              </h4>
              <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-black text-[10px] uppercase">
                Suhu 170°C – 180°C
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300">
              Goreng kentang pada minyak panas bersuhu <strong>170°C – 180°C</strong> di wajan kompor gas. Ikuti instruksi mutlak berikut:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200">
                <strong className="block font-black text-amber-700 dark:text-amber-400 mb-1">
                  ⭐ ATURAN EMAS:
                </strong>
                Angkat kentang <strong>SEGERA TEPAT SAAT MENGAMBANG</strong> di permukaan minyak dan warnanya berubah menjadi <strong>SEDIKIT KEEMASAN (Golden-Yellow)</strong>.
              </div>

              <div className="p-3.5 rounded-xl bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200">
                <strong className="block font-black text-rose-700 dark:text-rose-400 mb-1">
                  🚫 DILARANG KERAS:
                </strong>
                Dilarang menunggu sampai cokelat tua/kering agar kentang tidak keras dan tidak alot. Tiriskan minyak hingga bersih sebelum disajikan.
              </div>
            </div>
          </div>

          {/* 2.2 STANDAR GRAMASI & PLATING PRESISI */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-300 font-baloo flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-500" />
                  2.2 Standar Memasak, Gramasi & Penyajian (Cooking & Plating Presisi)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Rincian gramasi baku dan instruksi teknis setiap komponen menu porsi Steak 11.
                </p>
              </div>

              {/* Calculator Input */}
              <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Simulasi Jumlah Porsi:</span>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={portionCount}
                  onChange={(e) => setPortionCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 px-2 py-1 rounded-lg bg-white dark:bg-[#1f0e30] text-center font-extrabold text-xs text-purple-950 dark:text-amber-400 border border-slate-300 dark:border-purple-700"
                />
                <span className="text-xs font-bold text-purple-900 dark:text-amber-300">Porsi</span>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-purple-900/50">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#3D1259] text-white uppercase text-[10px] font-black tracking-wider">
                  <tr>
                    <th className="p-3.5">Komponen Porsi</th>
                    <th className="p-3.5 text-center">Standar 1 Porsi</th>
                    <th className="p-3.5 text-center bg-amber-400 text-purple-950 font-extrabold">
                      Kebutuhan Total ({portionCount} Porsi)
                    </th>
                    <th className="p-3.5">Petunjuk Teknis Pemasakan & Penyajian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-purple-900/30">
                  <tr className="hover:bg-slate-50 dark:hover:bg-purple-950/40">
                    <td className="p-3.5 font-bold text-[#3D1259] dark:text-amber-400">
                      🥩 Steak Ayam Fillet Paha
                    </td>
                    <td className="p-3.5 text-center font-extrabold text-purple-900 dark:text-slate-200">
                      Ditimbang tepat 90 Gram
                    </td>
                    <td className="p-3.5 text-center font-black text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-purple-900/20">
                      {(portionCount * 90) >= 1000 ? `${(portionCount * 90 / 1000).toFixed(2)} Kg (${portionCount * 90}g)` : `${portionCount * 90} Gram`}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      Masak/goreng fillet paha ayam marinasi hingga matang merata (<strong>suhu internal &gt;75°C</strong>, bagian luar renyah/juicy).
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50 dark:hover:bg-purple-950/40">
                    <td className="p-3.5 font-bold text-[#3D1259] dark:text-amber-400">
                      🍟 Kentang Goreng
                    </td>
                    <td className="p-3.5 text-center font-extrabold text-purple-900 dark:text-slate-200">
                      Tepat 5 Potong
                    </td>
                    <td className="p-3.5 text-center font-black text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-purple-900/20">
                      {portionCount * 5} Potong
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      Digoreng keemasan (<em>*golden-yellow*</em>), ditiriskan minyaknya, disajikan renyah.
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50 dark:hover:bg-purple-950/40">
                    <td className="p-3.5 font-bold text-[#3D1259] dark:text-amber-400">
                      🥕 Wortel Rebus
                    </td>
                    <td className="p-3.5 text-center font-extrabold text-purple-900 dark:text-slate-200">
                      Tepat 4 Potong
                    </td>
                    <td className="p-3.5 text-center font-black text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-purple-900/20">
                      {portionCount * 4} Potong
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      Dipotong rapi, matang pas, segar dan tidak lembek/hancur.
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50 dark:hover:bg-purple-950/40">
                    <td className="p-3.5 font-bold text-[#3D1259] dark:text-amber-400">
                      🥬 Buncis Rebus
                    </td>
                    <td className="p-3.5 text-center font-extrabold text-purple-900 dark:text-slate-200">
                      Tepat 2 Potong
                    </td>
                    <td className="p-3.5 text-center font-black text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-purple-900/20">
                      {portionCount * 2} Potong
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      Warna hijau segar, dipotong seragam, disajikan sejajar.
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50 dark:hover:bg-purple-950/40">
                    <td className="p-3.5 font-bold text-[#3D1259] dark:text-amber-400">
                      🥣 Saus Resmi (BBQ / Black Pepper / Mushroom)
                    </td>
                    <td className="p-3.5 text-center font-extrabold text-purple-900 dark:text-slate-200">
                      1 Porsi Saus (±40-50 ml)
                    </td>
                    <td className="p-3.5 text-center font-black text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-purple-900/20">
                      {portionCount} Cup / ±{(portionCount * 45 / 1000).toFixed(2)} Liter
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      Disiramkan di atas porsi atau disajikan dalam cup terpisah.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden space-y-3">
              {[
                {
                  title: '🥩 Steak Ayam Fillet Paha',
                  std: 'Ditimbang tepat 90 Gram',
                  total: (portionCount * 90) >= 1000 ? `${(portionCount * 90 / 1000).toFixed(2)} Kg (${portionCount * 90}g)` : `${portionCount * 90} Gram`,
                  guide: 'Masak/goreng fillet paha ayam marinasi hingga matang merata (suhu internal >75°C, bagian luar renyah/juicy).'
                },
                {
                  title: '🍟 Kentang Goreng',
                  std: 'Tepat 5 Potong',
                  total: `${portionCount * 5} Potong`,
                  guide: 'Digoreng keemasan (*golden-yellow*), ditiriskan minyaknya, disajikan renyah.'
                },
                {
                  title: '🥕 Wortel Rebus',
                  std: 'Tepat 4 Potong',
                  total: `${portionCount * 4} Potong`,
                  guide: 'Dipotong rapi, matang pas, segar dan tidak lembek/hancur.'
                },
                {
                  title: '🥬 Buncis Rebus',
                  std: 'Tepat 2 Potong',
                  total: `${portionCount * 2} Potong`,
                  guide: 'Warna hijau segar, dipotong seragam, disajikan sejajar.'
                },
                {
                  title: '🥣 Saus Resmi (BBQ / Black Pepper / Mushroom)',
                  std: '1 Porsi Saus (±40-50 ml)',
                  total: `${portionCount} Cup / ±${(portionCount * 45 / 1000).toFixed(2)} Liter`,
                  guide: 'Disiramkan di atas porsi atau disajikan dalam cup terpisah.'
                }
              ].map((comp, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-purple-950/60 border border-slate-200 dark:border-purple-800 space-y-2 text-xs">
                  <div className="font-extrabold text-[#3D1259] dark:text-amber-300">
                    {comp.title}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-white dark:bg-purple-900/40 border border-slate-200 dark:border-purple-800">
                      <span className="text-slate-500 dark:text-slate-400 block font-semibold text-[10px]">Standar 1 Porsi:</span>
                      <strong className="text-purple-950 dark:text-slate-100">{comp.std}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-400/20 border border-amber-400/30">
                      <span className="text-purple-950 dark:text-amber-300 block font-semibold text-[10px]">Kebutuhan ({portionCount} Porsi):</span>
                      <strong className="text-amber-600 dark:text-amber-400">{comp.total}</strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-black/20 p-2 rounded-lg border border-slate-100 dark:border-white/5">
                    <strong>Petunjuk:</strong> {comp.guide}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 2.3 STANDAR PELAYANAN KONSUMEN, HOSPITALITY (3S) & HIGIENITAS KRU */}
          <div className="space-y-3 pt-2">
            <div>
              <h4 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-300 font-baloo flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-purple-600 dark:text-amber-400" />
                2.3 Standar Pelayanan Konsumen, Hospitality (3S) & Higienitas Kru
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sapaan baku konsumen, etika pelayanan cepat, penanganan keluhan, dan standar kebersihan personal.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Card 1: Greeting Baku 3S */}
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#3D1259] dark:text-amber-300">
                    👋 1. Greeting Baku 3S
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-amber-300 font-black text-[9px] uppercase">
                    Hospitality
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                  <p>• <strong>Menyambut:</strong> <em>"Selamat datang di Steak 11! Mau pesan steak dengan saus apa Kak? Ada BBQ, Black Pepper, dan Mushroom."</em></p>
                  <p>• <strong>Konfirmasi Saus:</strong> <em>"Sausnya mau langsung disiram di atas steak atau dipisah dalam cup Kak?"</em></p>
                  <p>• <strong>Serah Terima:</strong> <em>"Terima kasih banyak Kak, selamat menikmati Steak 11!"</em></p>
                </div>
              </div>

              {/* Card 2: Penanganan Komplain */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-amber-900 dark:text-amber-300">
                    🤝 2. Penanganan Komplain
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-purple-950 font-black text-[9px] uppercase">
                    Customer First
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                  <p>• <strong>Sikap Tenang:</strong> Dengarkan keluhan pelanggan dengan sopan dan ramah tanpa berdebat.</p>
                  <p>• <strong>Solusi Cepat:</strong> Jika kematangan ayam kurang pas / kentang kurang renyah / salah saus, segera buatkan porsi pengganti baru dan prioritaskan.</p>
                  <p>• <strong>Permohonan Maaf:</strong> Sampaikan permohonan maaf dengan tulus atas ketidaknyamanan.</p>
                </div>
              </div>

              {/* Card 3: Higienitas & Grooming */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-emerald-900 dark:text-emerald-300">
                    🧼 3. Higienitas & Grooming
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[9px] uppercase">
                    Kebersihan Kru
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                  <p>• <strong>Apron & Pakaian:</strong> Wajib mengenakan apron bersih & pakaian rapi selama bertugas di outlet.</p>
                  <p>• <strong>Cuci Tangan:</strong> Selalu mencuci tangan dengan sabun sebelum dan sesudah bekerja.</p>
                  <p>• <strong>Larangan Mutlak:</strong> Dilarang keras merokok atau bermain ponsel saat proses memasak & melayani pelanggan.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CONTENT SECTION 3: TIMELINE OPERASIONAL HARIAN TEREDUKSI PER CABANG --- */}
      {(activeMainTab === 'all' || activeMainTab === 'timeline') && (
        <div className="bg-white dark:bg-[#1f0e30] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-purple-900/40 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#3D1259] dark:text-amber-400 flex items-center justify-center font-extrabold font-baloo shadow-xs">
                3
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-[#3D1259] dark:text-amber-400 font-baloo">
                  BAGIAN 3: TIMELINE OPERASIONAL HARIAN TEREDUKSI PER CABANG
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  4 Fase Alur Kerja Harian Solo Operator dari Pre-Opening hingga Closing & Sanitasi.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* FASE 1 */}
            <div className="p-5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#3D1259] text-white font-extrabold text-xs">
                  Fase 1: Pre-Opening & Logistik
                </span>
                <span className="text-[11px] font-bold text-purple-700 dark:text-amber-300">
                  30-60 Menit Sebelum Buka
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-purple-900/30 text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5 border border-purple-100 dark:border-purple-900">
                <div>• <strong>Cibubur, Kalisari, Jatisampurna:</strong> 14.00 – 14.30</div>
                <div>• <strong>Cilangkap:</strong> 14.30 – 15.00</div>
                <div>• <strong>Kuningan:</strong> 09.00 – 09.30</div>
              </div>

              <ol className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-decimal list-inside pl-1">
                <li><strong>Pengisian BBM & Logistik:</strong> Bensin motor wajib terisi penuh sebelum jam masuk (min. 1 jam sebelum jadwal). Ambil stok daging, saus, sayur, es batu & kemasan di Dapur Pusat.</li>
                <li>Tiba di outlet min. 30 menit sebelum buka. Buka gembok gerobak.</li>
                <li><strong>Clock-In Digital:</strong> Presensi masuk di steak11.vercel.app.</li>
                <li>Susun porsi ayam & saus di Coolbox berselang-seling es batu.</li>
                <li>Cek selang regulator gas & kenakan apron bersih.</li>
              </ol>

              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('presensi_kamera')}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-purple-900 hover:bg-purple-800 text-amber-300 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>Buka Presensi Kamera Selfie</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </button>
              )}
            </div>

            {/* FASE 2 */}
            <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-purple-950 font-extrabold text-xs">
                  Fase 2: Operasional Reguler
                </span>
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                  Awal Buka s/d Sebelum Peak
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-purple-900/30 text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5 border border-amber-100 dark:border-amber-900">
                <div>• <strong>Cibubur, Kalisari, Jatisampurna:</strong> 14.30 – 18.00</div>
                <div>• <strong>Cilangkap:</strong> 15.00 – 18.30</div>
                <div>• <strong>Kuningan:</strong> 09.30 – 11.30 & 14.00 – 17.00</div>
              </div>

              <ol className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-decimal list-inside pl-1">
                <li>Sambut pelanggan dengan ramah. Catat pilihan saus & pembayaran.</li>
                <li>Masak ayam marinasi juicy & goreng kentang mengambang keemasan.</li>
                <li><strong>Plating presisi:</strong> 90g ayam, 5 kentang, 4 wortel, 2 buncis + saus.</li>
                <li>Sela sepi: Lap meja kerja/pelanggan dengan <strong>cairan TAF</strong>.</li>
              </ol>

              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('pesanan')}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-purple-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-purple-950" />
                  <span>Buka Kasir POS / Pesanan</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </button>
              )}
            </div>

            {/* FASE 3 */}
            <div className="p-5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-extrabold text-xs">
                  Fase 3: Peak Hours (Jam Sibuk)
                </span>
                <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300">
                  Periode Antrean Padat
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-purple-900/30 text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5 border border-rose-100 dark:border-rose-900">
                <div>• <strong>Cibubur, Kalisari, Jatisampurna:</strong> 18.00 – 21.30</div>
                <div>• <strong>Cilangkap:</strong> 18.30 – 22.00</div>
                <div>• <strong>Kuningan:</strong> 11.30 – 14.00 (Siang) & 17.00 – 20.00 (Malam)</div>
              </div>

              <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950 border border-rose-300 dark:border-rose-800 text-xs space-y-1.5">
                <strong className="block text-rose-800 dark:text-rose-300">
                  ⚡ Hierarki Prioritas Kerja Eksekusi Cepat:
                </strong>
                <div className="space-y-1 pl-1 text-[11px]">
                  <div><strong>1. Utama:</strong> Jaga wajan masakan ayam & kentang agar matang sempurna tanpa gosong.</div>
                  <div><strong>2. Kedua:</strong> Melayani antrean transaksi kasir.</div>
                  <div><strong>3. Ketiga:</strong> Plating cepat & serahkan masakan selagi hangat.</div>
                  <div><strong>4. Keempat:</strong> Bersihkan meja dan area sekitar hanya saat wajan kosong.</div>
                </div>
              </div>
            </div>

            {/* FASE 4 */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-700 text-white font-extrabold text-xs">
                  Fase 4: Closing, Sanitasi & Reporting
                </span>
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                  30-45 Menit Penutupan
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-purple-900/30 text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5 border border-emerald-100 dark:border-emerald-900">
                <div>• <strong>Cibubur, Kalisari, Jatisampurna:</strong> 22.15 – 23.00</div>
                <div>• <strong>Cilangkap:</strong> 22.45 – 23.30</div>
                <div>• <strong>Kuningan:</strong> 20.15 – 21.00</div>
              </div>

              <ol className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-decimal list-inside pl-1">
                <li>Matikan kompor & <strong>LEPAS REGULATOR GAS</strong> dari tabung.</li>
                <li>Cuci wajan/alat saji. Lap meja/kompor dengan <strong>Cairan TAF</strong>.</li>
                <li>Hitung uang tunai (<em>cash on hand</em>), pisahkan modal kembalian.</li>
                <li><strong>Digital Report:</strong> Input web steak11.vercel.app & send WA Group.</li>
                <li><strong>Manual Report:</strong> Catat stok bawaan, sisa ayam coolbox & restock besok.</li>
                <li><strong>Clock-Out Digital</strong>, buang sampah, kunci & gembok gerobak.</li>
              </ol>

              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('shifts')}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5 text-white" />
                  <span>Buka Menu Audit Closing Shift</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- CONTENT SECTION 4: PANDUAN EFISIENSI, PEMELIHARAAN ASET & LOGISTIK OUTLET --- */}
      {(activeMainTab === 'all' || activeMainTab === 'efficiency') && (
        <div className="bg-white dark:bg-[#1f0e30] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-purple-900/40 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-extrabold font-baloo shadow-xs">
                4
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-[#3D1259] dark:text-amber-400 font-baloo">
                  BAGIAN 4: PANDUAN EFISIENSI, PEMELIHARAAN ASET & LOGISTIK OUTLET
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Rasio pencampuran bahan pembersih, penghematan gas, pemeliharaan minyak wajan, perawatan motor operasional, pembersihan gerobak menyeluruh, dan pengelolaan sampah harian.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* TAF */}
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-[#3D1259] dark:text-amber-300">
                  🧽 Cairan Pembersih TAF
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-black text-[9px] uppercase">
                  Aturan Khusus
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                <strong>Penggunaan Terbatas:</strong> Cairan TAF <strong>HANYA Boleh Digunakan</strong> khusus meja pelanggan/kerja, kompor grill, dan alat saji. <em>Dilarang keras untuk lantai, gerobak umum, atau cuci piring.</em>
              </p>
            </div>

            {/* Minyak Goreng Wajan */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-amber-900 dark:text-amber-300">
                  🍳 Minyak Goreng Wajan
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-purple-950 font-black text-[9px] uppercase">
                  1 Bulan Sekali
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Minyak pada wajan kompor dijaga dari sisa remah dan <strong>diganti total 1 bulan sekali</strong>. Wajib menyaring remah gorengan setiap hari setelah operasional.
              </p>
            </div>

            {/* Sunlight 80:20 */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-emerald-900 dark:text-emerald-300">
                  🧴 Sabun Cuci Piring (Sunlight)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[9px] uppercase">
                  Rasio 80:20
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Campurkan cairan pencuci piring dengan air bersih menggunakan rasio <strong>80% sabun : 20% air</strong> di botol dispenser ({dispenserVolumeMl * 0.8}ml sabun + {dispenserVolumeMl * 0.2}ml air untuk botol {dispenserVolumeMl}ml). Dilarang mengucurkan murni dari refill.
              </p>
            </div>

            {/* Tisu vs Lap */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-purple-950/40 border border-slate-200 dark:border-purple-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
                  🧻 Tisu vs Kain Lap
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-amber-300 font-black text-[9px] uppercase">
                  Tisu Konsumen
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Gunakan kain lap khusus untuk pembersihan umum (meja/kompor/gerobak). <strong>Tisu HANYA disajikan untuk konsumen</strong>. Kain lap wajib dicuci bersih tiap shift.
              </p>
            </div>

            {/* Gas & Energi */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-purple-950/40 border border-slate-200 dark:border-purple-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
                  🔥 Gas Elpiji & Energi
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-black text-[9px] uppercase">
                  Lepas Regulator
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Kecilkan api kompor saat tidak ada antrean. <strong>Wajib melepas regulator gas dari tabung saat penutupan outlet (closing)</strong>. Matikan lampu dekorasi pada siang hari.
              </p>
            </div>

            {/* Kantong Plastik / Kemasan */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-purple-950/40 border border-slate-200 dark:border-purple-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
                  🛍️ Kantong Plastik / Kemasan
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-amber-300 font-black text-[9px] uppercase">
                  Rapih Mingguan
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Gunakan kantong plastik sesuai kapasitas porsi pesanan. Bawa pulang/rapikan sisa stok plastik berlebih <strong>setiap hari Minggu</strong> (<em>Khusus Kuningan: Hari Jumat</em>).
              </p>
            </div>

            {/* Motor Operasional & BBM */}
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-[#3D1259] dark:text-amber-300">
                  🛵 Motor Operasional & BBM
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-black text-[9px] uppercase">
                  Logistik & Armada
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Pengisian BBM motor wajib dilakukan <strong>minimal 1 jam sebelum jam masuk</strong> (sebelum mengambil stok di Dapur Pusat) agar distribusi bahan tidak tertunda. Fisik motor wajib <strong>dicuci/dibersihkan minimal 1 bulan sekali</strong> demi higienitas dan citra outlet.
              </p>
            </div>

            {/* Pembersihan Gerobak Total */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-amber-900 dark:text-amber-300">
                  🧹 Pembersihan Gerobak Total
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-purple-950 font-black text-[9px] uppercase">
                  Sebelum Libur
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Lakukan pembersihan menyeluruh (<em>deep cleaning</em>) pada seluruh gerobak, etalase, dan area kerja <strong>sebelum jadwal hari libur karyawan</strong>. Bawa pulang apron untuk dicuci bersih sesuai jadwal cabang (Setiap hari Minggu / <em>Khusus Kuningan: Hari Jumat</em>).
              </p>
            </div>

            {/* Pengelolaan Sampah Wajib Harian */}
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-rose-900 dark:text-rose-300">
                  🗑️ Pengelolaan Sampah
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[9px] uppercase">
                  Wajib Harian
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Ikat rapi seluruh sampah operasional dijadikan satu di dalam <strong>kantong plastik hitam sampah</strong>. Buang sampah harian ke Tempat Pembuangan Sampah (TPS) resmi sesuai jadwal piket harian yang telah ditunjuk per kru/petugas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- CONTENT SECTION 5: SISTEM PELAPORAN LENGKAP (DUAL-CHANNEL REPORTING) --- */}
      {(activeMainTab === 'all' || activeMainTab === 'reporting') && (
        <div className="bg-white dark:bg-[#1f0e30] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-purple-900/40 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#3D1259] dark:text-amber-400 flex items-center justify-center font-extrabold font-baloo shadow-xs">
                5
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-[#3D1259] dark:text-amber-400 font-baloo">
                  BAGIAN 5: SISTEM PELAPORAN LENGKAP (DUAL-CHANNEL REPORTING)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Alur Pelaporan Digital (Website steak11.vercel.app + WA Group) dan Pelaporan Fisik (Buku Laporan Manual Outlet).
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Alur Pelaporan Digital + WA Generator */}
            <div className="p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-300 font-baloo flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-500" />
                  1. Alur Pelaporan Digital (Website & WA Group)
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-black text-[10px]">
                  Online Channel
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300">
                Setiap penutupan shift (closing), staf wajib menginput data pada sistem website dan mengirimkan konfirmasi ke <strong>Grup WhatsApp Manajemen</strong> yang mencakup:
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
                  <strong className="block text-[#3D1259] dark:text-amber-300 mb-0.5">
                    1. Jumlah Uang Tunai (Cash on Hand):
                  </strong>
                  Hitung dan masukkan total fisik uang tunai di kasir setelah dipisahkan dari modal awal kembalian.
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
                  <strong className="block text-[#3D1259] dark:text-amber-300 mb-0.5">
                    2. Rincian Porsi & Transaksi Non-Tunai:
                  </strong>
                  Pastikan kesesuaian jumlah porsi yang terjual serta nominal penerimaan via QRIS / Transfer / Ojek Online.
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
                  <strong className="block text-[#3D1259] dark:text-amber-300 mb-0.5">
                    3. Kirim Laporan ke WA Grup & Presensi Pulang:
                  </strong>
                  Kirimkan ringkasan laporan closing ke Grup WhatsApp, lalu lakukan <strong>Clock-Out Presensi Pulang</strong> di sistem website sebelum meninggalkan outlet.
                </div>
              </div>

              {onNavigateTab && (
                <div className="pt-2 border-t border-purple-200/60 dark:border-purple-800/60 space-y-1.5">
                  <span className="text-[10px] uppercase font-black tracking-wider text-purple-800 dark:text-amber-400 block">
                    Pintas Menu Operasional:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigateTab('shifts')}
                      className="p-2.5 rounded-xl bg-white dark:bg-purple-900/60 hover:bg-purple-100 dark:hover:bg-purple-900 text-[#3D1259] dark:text-amber-300 font-extrabold text-[11px] border border-purple-200 dark:border-purple-800 flex items-center justify-between transition-all cursor-pointer shadow-2xs"
                    >
                      <span className="flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                        Input Closing Shift
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigateTab('presensi_kamera')}
                      className="p-2.5 rounded-xl bg-white dark:bg-purple-900/60 hover:bg-purple-100 dark:hover:bg-purple-900 text-[#3D1259] dark:text-amber-300 font-extrabold text-[11px] border border-purple-200 dark:border-purple-800 flex items-center justify-between transition-all cursor-pointer shadow-2xs"
                    >
                      <span className="flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-purple-500" />
                        Presensi Pulang (Clock-Out)
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Alur Pelaporan Manual (Buku Manual) */}
            <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-amber-900 dark:text-amber-300 font-baloo flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-600" />
                  2. Alur Pelaporan Manual (Buku Laporan Outlet)
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/30 text-amber-900 dark:text-amber-300 font-black text-[10px]">
                  Fisik Cabang
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300">
                Setiap akhir shift, staf wajib menuliskan laporan fisik pada <strong>Buku Laporan Manual outlet</strong> yang mencakup 3 poin mutlak:
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-purple-900/30 border border-amber-200 dark:border-amber-900">
                  <strong className="block text-amber-800 dark:text-amber-300 mb-0.5">
                    1. Daftar Barang Bawaan:
                  </strong>
                  Tuliskan secara keseluruhan daftar barang/stok yang dibawa dari Dapur Pusat hari ini.
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-purple-900/30 border border-amber-200 dark:border-amber-900">
                  <strong className="block text-amber-800 dark:text-amber-300 mb-0.5">
                    2. Permintaan Stok Besok:
                  </strong>
                  Tuliskan rincian permintaan barang/stok yang akan diambil dan dibawa dari Dapur Pusat untuk operasional esok hari.
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-purple-900/30 border border-amber-200 dark:border-amber-900">
                  <strong className="block text-amber-800 dark:text-amber-300 mb-0.5">
                    3. Sisa Stok Daging Ayam:
                  </strong>
                  Tuliskan pencatatan akurat jumlah sisa stok porsi daging ayam yang tersisa di coolbox.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CONTENT SECTION 6: CHECKLIST HARIAN SERAH TERIMA & OPERASIONAL HARIAN --- */}
      {(activeMainTab === 'all' || activeMainTab === 'checklist') && (
        <div className="bg-white dark:bg-[#1f0e30] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-purple-900/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-extrabold font-baloo shadow-xs">
                6
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-[#3D1259] dark:text-amber-400 font-baloo">
                  BAGIAN 6: CHECKLIST HARIAN SERAH TERIMA & OPERASIONAL HARIAN
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Verifikasi harian kondisi fisik bahan baku, peralatan kompor, sanitasi, dan pelaporan per shift.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCheckAllChecklist}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-xs cursor-pointer"
              >
                Centang Semua (7/7)
              </button>
              <button
                onClick={handleResetChecklist}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-purple-900 text-slate-700 dark:text-slate-300 font-extrabold text-xs cursor-pointer hover:bg-slate-300"
              >
                Reset Checklist
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          {(() => {
            const checkedCount = checklist.filter((c) => c.isChecked).length;
            const progressPercent = Math.round((checkedCount / checklist.length) * 100);
            return (
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#3D1259] dark:text-amber-300">
                    Status Verifikasi Shift: {checkedCount} dari {checklist.length} Poin Terverifikasi ({progressPercent}%)
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                    progressPercent === 100
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-400 text-purple-950'
                  }`}>
                    {progressPercent === 100 ? '✅ SIAP OPERASIONAL' : '⏳ PEMERIKSAAN'}
                  </span>
                </div>
                <div className="w-full bg-purple-200 dark:bg-purple-900 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-linear-to-r from-amber-400 to-emerald-500 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            );
          })()}

          {/* Checklist Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-purple-900/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#3D1259] text-white uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="p-3.5 text-center w-12">No</th>
                  <th className="p-3.5">Item / Aktivitas Pemeriksaan</th>
                  <th className="p-3.5">Standar Parameter Kelayakan</th>
                  <th className="p-3.5 text-center w-48">Status Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-purple-900/30">
                {checklist.map((item) => (
                  <tr
                    key={item.no}
                    onClick={() => toggleChecklistItem(item.no)}
                    className={`cursor-pointer transition-colors ${
                      item.isChecked
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                        : 'hover:bg-slate-50 dark:hover:bg-purple-950/40'
                    }`}
                  >
                    <td className="p-3.5 text-center font-extrabold text-purple-900 dark:text-amber-400">
                      {item.no}
                    </td>
                    <td className="p-3.5 font-bold text-[#3D1259] dark:text-slate-100">
                      {item.activity}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {item.parameter}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleChecklistItem(item.no);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-extrabold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-all ${
                          item.isChecked
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-200 dark:bg-purple-900 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-purple-700'
                        }`}
                      >
                        {item.isChecked ? (
                          <>
                            <CheckSquare className="w-4 h-4 text-white" />
                            <span>[X] Sesuai & Lengkap</span>
                          </>
                        ) : (
                          <>
                            <Square className="w-4 h-4 text-slate-400" />
                            <span>[ ] Belum Dicek</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- DIGITAL SOP ACKNOWLEDGEMENT & COMMITMENT SIGNATURE --- */}
      <div className="bg-linear-to-r from-purple-900 via-[#3D1259] to-[#250838] p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-purple-800/80 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-800/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-purple-950 flex items-center justify-center font-black shadow-md">
              <BadgeCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white font-baloo">
                Lembar Komitmen & Konfirmasi Kepatuhan SOP
              </h3>
              <p className="text-xs text-purple-200">
                Pernyataan resmi kru pelaksana operasional Solo Operator Steak 11.
              </p>
            </div>
          </div>
          {ackRecord && (
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-black flex items-center gap-1.5 self-start sm:self-auto">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> SOP Terkonfirmasi Aktif
            </span>
          )}
        </div>

        {ackRecord ? (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <p className="font-bold text-emerald-300">
                ✓ Telah ditandatangani secara digital oleh: <strong className="text-white underline">{ackRecord.name}</strong> ({ackRecord.branch})
              </p>
              <p className="text-emerald-400/80 text-[11px]">
                Waktu Konfirmasi: {ackRecord.time}
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetAcknowledgement}
              className="px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 text-xs font-bold border border-purple-800 cursor-pointer transition-all"
            >
              Ubah / Konfirmasi Ulang
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-purple-100 leading-relaxed">
              Saya yang bertanda tangan di bawah ini menyatakan telah membaca, memahami, dan berkomitmen penuh untuk menjalankan seluruh Prosedur Operasional Standar (SOP) Steak 11 ini secara disiplin, bertanggung jawab, dan higienis.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-purple-200 font-bold mb-1">Nama Lengkap Kru Operator (Data Karyawan):</label>
                <select
                  value={ackName}
                  onChange={(e) => {
                    const chosen = e.target.value;
                    setAckName(chosen);
                    const matchedEmp = employeeList.find(emp => emp.name === chosen);
                    if (matchedEmp && matchedEmp.outlet) {
                      const outLower = matchedEmp.outlet.toLowerCase();
                      if (outLower.includes('cibubur')) setAckBranch('Steak 11, Cibubur');
                      else if (outLower.includes('kalisari')) setAckBranch('Steak 11, Kalisari');
                      else if (outLower.includes('cilangkap')) setAckBranch('Steak 11, Cilangkap');
                      else if (outLower.includes('kuningan')) setAckBranch('Steak 11, Kuningan');
                      else if (outLower.includes('jatisampurna')) setAckBranch('Steak 11, Jatisampurna');
                      else if (outLower.includes('pusat')) setAckBranch('Dapur Pusat (Central Kitchen)');
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/90 border border-purple-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="">-- Pilih Nama Karyawan --</option>
                  {employeeList.map((emp) => (
                    <option key={emp.id} value={emp.name}>
                      {emp.name} ({emp.role} • {emp.outlet || 'Semua Cabang'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-purple-200 font-bold mb-1">Cabang Penempatan:</label>
                <select
                  value={ackBranch}
                  onChange={(e) => setAckBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/90 border border-purple-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="Steak 11, Cibubur">Steak 11, Cibubur</option>
                  <option value="Steak 11, Kalisari">Steak 11, Kalisari</option>
                  <option value="Steak 11, Cilangkap">Steak 11, Cilangkap</option>
                  <option value="Steak 11, Kuningan">Steak 11, Kuningan</option>
                  <option value="Steak 11, Jatisampurna">Steak 11, Jatisampurna</option>
                  <option value="Dapur Pusat (Central Kitchen)">Dapur Pusat (Central Kitchen)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="ackCheck"
                checked={ackAgree}
                onChange={(e) => setAckAgree(e.target.checked)}
                className="w-4 h-4 rounded-md accent-amber-400 cursor-pointer"
              />
              <label htmlFor="ackCheck" className="text-xs text-purple-200 font-medium cursor-pointer">
                Saya menyetujui dan siap menjalankan standar SOP ini pada setiap shift kerja saya.
              </label>
            </div>

            <button
              type="button"
              onClick={handleSaveAcknowledgement}
              disabled={!ackAgree || !ackName.trim()}
              className={`px-5 py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center sm:justify-start gap-2 cursor-pointer ${
                ackAgree && ackName.trim()
                  ? 'bg-amber-400 hover:bg-amber-300 text-purple-950 shadow-lg active:scale-95'
                  : 'bg-purple-950/50 text-purple-400 border border-purple-800/60 cursor-not-allowed opacity-60'
              }`}
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Konfirmasi Pemahaman SOP & Kirim ke WA</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
