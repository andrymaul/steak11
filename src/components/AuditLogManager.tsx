import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Clock,
  User,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  RefreshCw,
  Eye,
  Trash2,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { AuditLogItem } from '../types';
import { getStoredAuditLogs, saveAuditLogs } from '../utils';
import * as XLSX from 'xlsx';

interface AuditLogManagerProps {
  outletsList?: string[];
  currentUser?: { name: string; role: string } | null;
  showToast?: (msg: string) => void;
}

export const AuditLogManager: React.FC<AuditLogManagerProps> = ({
  outletsList = [],
  currentUser,
  showToast = (_: string) => {}
}) => {
  const [logs, setLogs] = useState<AuditLogItem[]>(() => getStoredAuditLogs());
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedOutlet, setSelectedOutlet] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Auto-refresh when audit logs updated event fires
  useEffect(() => {
    const handleUpdate = () => {
      setLogs(getStoredAuditLogs());
    };
    window.addEventListener('audit_logs_updated', handleUpdate);
    return () => window.removeEventListener('audit_logs_updated', handleUpdate);
  }, []);

  const handleRefresh = () => {
    setLogs(getStoredAuditLogs());
    showToast('🔄 Audit log aktivitas berhasil diperbarui!');
  };

  // Filter logs logic
  const filteredLogs = logs.filter((log) => {
    // Search matching user, action, details, or id
    const matchSearch =
      !search.trim() ||
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.id.toLowerCase().includes(search.toLowerCase());

    const matchCategory = selectedCategory === 'ALL' || log.category === selectedCategory;
    const matchStatus = selectedStatus === 'ALL' || log.status === selectedStatus;
    const matchOutlet = selectedOutlet === 'ALL' || log.outlet === selectedOutlet;

    let matchDate = true;
    if (startDate) {
      matchDate = matchDate && log.date >= startDate;
    }
    if (endDate) {
      matchDate = matchDate && log.date <= endDate;
    }

    return matchSearch && matchCategory && matchStatus && matchOutlet && matchDate;
  });

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = filteredLogs.map((log) => ({
      'ID Log': log.id,
      'Waktu & Tanggal': log.timestamp,
      'Pengguna': log.user,
      'Peran / Role': log.role,
      'Outlet': log.outlet,
      'Kategori': log.category,
      'Aksi Aktivitas': log.action,
      'Detail Deskripsi': log.details,
      'Status Execution': log.status,
      'IP Address': log.ipAddress || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Log Aktivitas');
    XLSX.writeFile(workbook, `Audit_Log_Steak11_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('📊 Export Audit Log Aktivitas ke Excel berhasil diunduh!');
  };

  const handleClearLogs = () => {
    setShowClearConfirm(true);
  };

  const executeClearLogs = () => {
    saveAuditLogs([]);
    setLogs([]);
    showToast('🗑️ Audit log telah dibersihkan.');
    setShowClearConfirm(false);
  };

  // Metrics
  const totalCount = logs.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = logs.filter((l) => l.date === todayStr).length;
  const warningCount = logs.filter((l) => l.status === 'Peringatan' || l.status === 'Gagal').length;
  const uniqueUsers = new Set(logs.map((l) => l.user)).size;

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#1a0c28] border border-slate-200 dark:border-purple-900 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#3D1259] dark:text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-[#3D1259] dark:text-amber-400 font-baloo">
              Audit Log Aktivitas & Jejak Keamanan System
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rekam jejak otomatis seluruh aktivitas pengguna, transaksi POS, closing kasir, stok opname, dan perubahan data master.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="px-3.5 py-2 rounded-xl bg-teal-100 hover:bg-teal-200 dark:bg-teal-950/80 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700/60 font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Ekspor Excel</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1a0c28] border border-slate-200 dark:border-purple-900 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Catatan Log</span>
          <p className="font-black text-xl text-purple-900 dark:text-amber-400">{totalCount}</p>
          <p className="text-[10px] text-slate-400">Tersimpan di local storage system</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1a0c28] border border-slate-200 dark:border-purple-900 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aktivitas Hari Ini</span>
          <p className="font-black text-xl text-emerald-600 dark:text-emerald-400">{todayCount}</p>
          <p className="text-[10px] text-slate-400">Aktivitas di tanggal {todayStr}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1a0c28] border border-slate-200 dark:border-purple-900 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Peringatan / Selisih</span>
          <p className="font-black text-xl text-amber-500">{warningCount}</p>
          <p className="text-[10px] text-slate-400">Butuh perhatian manajemen</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1a0c28] border border-slate-200 dark:border-purple-900 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pengguna Terdeteksi</span>
          <p className="font-black text-xl text-blue-600 dark:text-blue-400">{uniqueUsers}</p>
          <p className="text-[10px] text-slate-400">Staff, Kasir & Admin aktif</p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1a0c28] border border-slate-200 dark:border-purple-900 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari user, aktivitas, atau keyword detail..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-medium placeholder-slate-400"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="Transaksi POS">Transaksi POS</option>
              <option value="Audit Closing">Audit Closing Shift</option>
              <option value="Kas Kecil">Kas Kecil & Petty Cash</option>
              <option value="Kelola Stok">Kelola Stok & Opname</option>
              <option value="Absensi Staff">Absensi Staff</option>
              <option value="Penggajian">Penggajian & Payroll</option>
              <option value="Manajemen User">Manajemen User</option>
              <option value="Data Master">Data Master / Menu</option>
              <option value="Pengaturan">Pengaturan System</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
            >
              <option value="ALL">Semua Status Execution</option>
              <option value="Berhasil">✓ Berhasil</option>
              <option value="Peringatan">⚠️ Peringatan</option>
              <option value="Gagal">❌ Gagal</option>
            </select>
          </div>

          {/* Outlet Dropdown */}
          <div>
            <select
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
            >
              <option value="ALL">Semua Outlet</option>
              {outletsList.map((out) => (
                <option key={out} value={out}>
                  {out}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-purple-900/50 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500 dark:text-purple-300">Rentang Tanggal:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 text-xs font-medium"
            />
            <span className="text-slate-400">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 text-xs font-medium"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-amber-500 hover:underline font-bold text-[11px] cursor-pointer"
              >
                Reset Tanggal
              </button>
            )}
          </div>

          <div className="text-slate-400 text-[11px]">
            Menampilkan <strong className="text-purple-900 dark:text-amber-400">{filteredLogs.length}</strong> dari{' '}
            {logs.length} catatan
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1a0c28] border border-slate-200 dark:border-purple-900 shadow-sm space-y-3">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-500 dark:text-purple-300 font-bold">
                <th className="p-2.5">Waktu & Tanggal</th>
                <th className="p-2.5">Pengguna & Peran</th>
                <th className="p-2.5">Outlet</th>
                <th className="p-2.5">Kategori & Aksi</th>
                <th className="p-2.5">Detail Ringkas Aktivitas</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-purple-900/50">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ada catatan audit log yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-purple-900/30 transition-colors">
                    <td className="p-2.5 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                      {log.timestamp}
                      <span className="block text-[10px] text-slate-400">{log.id}</span>
                    </td>
                    <td className="p-2.5">
                      <span className="font-extrabold text-slate-800 dark:text-slate-100">{log.user}</span>
                      <span className="block text-[10px] text-purple-600 dark:text-amber-300 font-medium">
                        {log.role}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300 text-[11px]">{log.outlet}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-900 dark:text-amber-300 font-extrabold text-[10px] inline-block mb-0.5">
                        {log.category}
                      </span>
                      <span className="block font-bold text-slate-800 dark:text-slate-200 text-[11px]">{log.action}</span>
                    </td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300 max-w-xs truncate">{log.details}</td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] inline-flex items-center gap-1 ${
                          log.status === 'Berhasil'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                            : log.status === 'Peringatan'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {log.status === 'Berhasil' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                        {log.status === 'Peringatan' && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                        {log.status === 'Gagal' && <XCircle className="w-3 h-3 text-rose-500" />}
                        {log.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-purple-900 hover:bg-slate-200 dark:hover:bg-purple-800 text-slate-700 dark:text-amber-300 cursor-pointer transition-colors"
                        title="Lihat Detail Log"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-purple-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-[#1a0c28] border border-purple-900/50 rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-purple-900/50 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-amber-400" />
                <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo">
                  Detail Audit Log Aktivitas
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-purple-950/60 border border-slate-200 dark:border-purple-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">ID Log:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedLog.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Waktu Record:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedLog.timestamp}</span>
                </div>
                <div className="mt-2">
                  <span className="text-[10px] text-slate-400 block">Pengguna:</span>
                  <span className="font-extrabold text-purple-900 dark:text-amber-300">{selectedLog.user}</span>
                  <span className="text-[10px] text-slate-400 block">Role: {selectedLog.role}</span>
                </div>
                <div className="mt-2">
                  <span className="text-[10px] text-slate-400 block">Outlet:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedLog.outlet}</span>
                  <span className="text-[10px] text-slate-400 block">IP: {selectedLog.ipAddress || '127.0.0.1'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Kategori & Aksi:</span>
                <p className="font-black text-sm text-slate-800 dark:text-slate-100">
                  [{selectedLog.category}] {selectedLog.action}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Deskripsi Detail Rekam Jejak:</span>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-purple-900/40 border border-slate-200 dark:border-purple-800 text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  {selectedLog.details}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">Status Eksekusi System:</span>
                <span
                  className={`px-3 py-1 rounded-full font-black text-xs ${
                    selectedLog.status === 'Berhasil'
                      ? 'bg-emerald-500 text-white'
                      : selectedLog.status === 'Peringatan'
                      ? 'bg-amber-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {selectedLog.status}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-purple-900/50 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-purple-900 text-white font-bold text-xs cursor-pointer"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Logs Confirm Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1A0C28] rounded-2xl p-6 max-w-md w-full border border-red-500/30 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-3 bg-red-100 dark:bg-red-950/80 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  Kosongkan Audit Log?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Seluruh riwayat aktivitas sistem akan dihapus permanen.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-purple-950/50 p-3 rounded-xl border border-slate-200 dark:border-purple-900">
              Tindakan ini tidak dapat dibatalkan. Pastikan Anda telah mengunduh / mengeksport data ke Excel jika masih dibutuhkan.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-300 dark:hover:bg-purple-900"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeClearLogs}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-extrabold text-xs hover:bg-red-700 shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Bersihkan Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
