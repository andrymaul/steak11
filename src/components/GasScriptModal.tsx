import React, { useState } from 'react';
import { X, Save, FileCode, Check } from 'lucide-react';
import { getStoredGasUrl, saveStoredGasUrl } from '../utils';

interface GasScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GasScriptModal: React.FC<GasScriptModalProps> = ({ isOpen, onClose }) => {
  const [gasUrl, setGasUrl] = useState(getStoredGasUrl());
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSaveUrl = () => {
    saveStoredGasUrl(gasUrl.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    onClose();
  };

  const scriptCode = `function doGet(e) {
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
          id: String(r[0]), employeeId: String(r[1]), employeeName: String(r[2]), date: String(r[3]), outlet: String(r[4]), clockInTime: String(r[5]), clockInStatus: String(r[6]), lateMinutes: Number(r[7]) || 0, clockOutTime: String(r[8]), clockOutStatus: String(r[9]), earlyOutMinutes: Number(r[10]) || 0, hoursWorked: Number(r[11]) || 0, status: String(r[12]), notes: String(r[13])
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
        id: String(row[0]), date: String(row[1]), customerName: String(row[2]), phone: String(row[3]), outlet: String(row[4]), serviceType: String(row[5]), addressOrTime: String(row[6]), itemsSummary: String(row[7]), total: Number(row[8]) || 0, status: String(row[9]) || "Pending"
      });
    }
  }
  return ContentService.createTextOutput(JSON.stringify(orders)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var data = JSON.parse(e.postData.contents);
  var action = data ? data.action : 'sync_orders';
  
  if (action === 'sync_payroll' && Array.isArray(data.payroll)) {
    var sheet = ss.getSheetByName("Penggajian") || ss.insertSheet("Penggajian");
    sheet.clear();
    sheet.appendRow(["ID Slip", "ID Karyawan", "Nama Karyawan", "Jabatan", "Outlet", "Periode", "Hari Hadir", "Hari Telat", "Jam Kerja", "Gaji Pokok", "Tunjangan", "Bonus", "Potongan", "Gaji Bersih", "Status Bayar", "Tanggal Bayar", "Catatan"]);
    data.payroll.forEach(function(rec) {
      sheet.appendRow([rec.id, rec.employeeId, rec.employeeName, rec.employeeRole, rec.outlet, rec.periodLabel, rec.totalDaysPresent, rec.totalDaysLate, rec.totalHoursWorked, rec.baseSalary, rec.totalAllowance, rec.bonus, rec.deductions, rec.netSalary, rec.paymentStatus, rec.paymentDate || '', rec.note || '']);
    });
    return ContentService.createTextOutput(JSON.stringify({"status": "success", "message": "Payroll synced"})).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'sync_attendance' && Array.isArray(data.attendance)) {
    var sheet = ss.getSheetByName("Absensi") || ss.insertSheet("Absensi");
    sheet.clear();
    sheet.appendRow(["ID Absensi", "ID Karyawan", "Nama Karyawan", "Tanggal", "Outlet", "Jam Masuk", "Status Masuk", "Late Min", "Jam Pulang", "Status Pulang", "Early Min", "Jam Kerja", "Status", "Catatan"]);
    data.attendance.forEach(function(rec) {
      sheet.appendRow([rec.id, rec.employeeId, rec.employeeName, rec.date, rec.outlet, rec.clockInTime, rec.clockInStatus || 'Tepat Waktu', rec.lateMinutes || 0, rec.clockOutTime || '', rec.clockOutStatus || '', rec.earlyOutMinutes || 0, rec.hoursWorked || 0, rec.status, rec.notes || '']);
    });
    return ContentService.createTextOutput(JSON.stringify({"status": "success", "message": "Attendance synced"})).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'sync_menu' && Array.isArray(data.menu)) {
    var sheet = ss.getSheetByName("Katalog Menu") || ss.insertSheet("Katalog Menu");
    sheet.clear();
    sheet.appendRow(["ID Menu", "Nama Menu", "Nama Korea", "Kategori", "Harga Jual", "HPP / COGS", "Rating", "Review", "Deskripsi", "Best Seller"]);
    data.menu.forEach(function(m) {
      sheet.appendRow([m.id, m.name, m.koreanName || '', m.category, m.price, m.cogs || 0, m.rating, m.reviewCount, m.description, m.isPopular ? "Ya" : "Tidak"]);
    });
    return ContentService.createTextOutput(JSON.stringify({"status": "success", "message": "Menu synced"})).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'sync_inventory' && Array.isArray(data.inventory)) {
    var sheet = ss.getSheetByName("Stok Dapur") || ss.insertSheet("Stok Dapur");
    sheet.clear();
    sheet.appendRow(["ID Item", "Nama Bahan", "Kategori", "Stok Saat Ini", "Min Stok", "Satuan", "Harga Satuan", "Outlet"]);
    data.inventory.forEach(function(inv) {
      sheet.appendRow([inv.id, inv.name, inv.category, inv.currentStock, inv.minStock, inv.unit, inv.unitPrice, inv.outlet]);
    });
    return ContentService.createTextOutput(JSON.stringify({"status": "success", "message": "Inventory synced"})).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'sync_employees' && Array.isArray(data.employees)) {
    var sheet = ss.getSheetByName("Data Karyawan") || ss.insertSheet("Data Karyawan");
    sheet.clear();
    sheet.appendRow(["ID Karyawan", "Nama Karyawan", "Jabatan", "Outlet", "No HP", "Tgl Masuk", "Gaji Harian", "Rate Jam", "Tunjangan", "Status"]);
    data.employees.forEach(function(emp) {
      sheet.appendRow([emp.id, emp.name, emp.role, emp.outlet, emp.phone, emp.joinDate, emp.dailyRate, emp.hourlyRate, emp.dailyAllowance, emp.status]);
    });
    return ContentService.createTextOutput(JSON.stringify({"status": "success", "message": "Employees synced"})).setMimeType(ContentService.MimeType.JSON);
  }
  
  var sheet = ss.getSheetByName("Pesanan") || ss.getActiveSheet();
  var orders = Array.isArray(data) ? data : (data.orders || []);
  if (Array.isArray(orders)) {
    sheet.clear();
    sheet.appendRow(["Order ID", "Tanggal", "Nama Pelanggan", "No HP", "Outlet", "Layanan", "Catatan/Waktu", "Detail Item", "Total", "Status"]);
    orders.forEach(function(item) {
      sheet.appendRow([item.id, item.date, item.customerName, item.phone, item.outlet, item.serviceType, item.addressOrTime, item.itemsSummary, item.total, item.status]);
    });
  }
  return ContentService.createTextOutput(JSON.stringify({"status": "success", "message": "Synced successfully"})).setMimeType(ContentService.MimeType.JSON);
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#1a0c28] text-slate-800 dark:text-slate-100 rounded-2xl overflow-hidden shadow-2xl border border-purple-900/50 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-[#250838] text-white flex items-center justify-between border-b border-purple-800/50">
          <div className="flex items-center gap-2.5">
            <FileCode className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-extrabold text-lg font-baloo text-white">
                Panduan & Kode Google Apps Script (Sinkronisasi 2-Arah)
              </h3>
              <p className="text-[11px] text-slate-300">
                Sinkronisasi penuh antara Google Sheets (Pusat Data) dan Website Steak 11
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-purple-800/40 text-slate-200 flex items-center justify-center hover:bg-purple-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          <div>
            <h4 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-400 font-baloo mb-2">
              1. Konfigurasi Endpoint Google Apps Script
            </h4>
            <p className="text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
              Masukkan URL Web App Google Apps Script Anda di bawah ini agar website dapat menarik data pesanan langsung dari Google Sheets (Pusat Data Utama):
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={gasUrl}
                onChange={(e) => setGasUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
              />
              <button
                onClick={handleSaveUrl}
                className="px-4 py-2.5 rounded-xl bg-amber-400 text-purple-950 font-extrabold hover:bg-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Simpan URL
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-400 font-baloo">
                2. Kode Google Apps Script Diperbarui (Mendukung GET & POST)
              </h4>
              <button
                onClick={copyCode}
                className="px-3 py-1 rounded-lg bg-purple-900 text-amber-300 font-bold text-[11px] flex items-center gap-1 hover:bg-purple-800 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                {copied ? 'Tersalin!' : 'Salin Kode'}
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              Buka Google Spreadsheet Anda, pilih menu <strong>Extensions &gt; Apps Script</strong>, lalu ganti kodenya dengan kode lengkap di bawah ini:
            </p>
            <div className="relative bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
              <pre>{scriptCode}</pre>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-400 font-baloo">
              3. Cara Deploy Web App GAS:
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              1. Di editor Apps Script, klik tombol <strong>Deploy &gt; New deployment</strong>.<br />
              2. Pilih jenis (Select type): <strong>Web app</strong>.<br />
              3. Set Execute as: <strong>Me</strong> dan Who has access: <strong>Anyone</strong>.<br />
              4. Salin URL Web App yang dihasilkan dan tempelkan ke kolom pengaturan di atas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
