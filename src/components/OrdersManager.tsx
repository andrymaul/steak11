import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Download,
  Printer,
  RefreshCw,
  FileSpreadsheet,
  Edit,
  Trash2,
  Send,
  X,
  CheckCircle2,
  Clock,
  MapPin,
  Utensils,
  Plus
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { OrderItem, Location, AdminUser } from '../types';
import { formatRupiah, isRegisteredAdmin } from '../utils';

export interface OrdersManagerProps {
  orders: OrderItem[];
  setOrders: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  saveOrders: (data: OrderItem[]) => void;
  locations: Location[];
  currentUser?: { name?: string; fullName?: string; role?: string; allowedTabs?: string[] } | AdminUser | null;
  showToast: (msg: string) => void;
  syncFromSheets?: () => Promise<void>;
  isSyncing?: boolean;
  onOpenThermalModal?: (order: OrderItem) => void;
  onSendWhatsApp?: (order: OrderItem) => void;
  onPrintPdf?: (order: OrderItem) => void;
}

export const OrdersManager: React.FC<OrdersManagerProps> = ({
  orders,
  setOrders,
  saveOrders,
  locations,
  currentUser,
  showToast,
  syncFromSheets,
  isSyncing = false,
  onOpenThermalModal,
  onSendWhatsApp,
  onPrintPdf
}) => {
  const isAdmin = isRegisteredAdmin(currentUser);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [outletFilter, setOutletFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('ALL');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Edit Order Modal State
  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderItem | null>(null);
  const [editCustName, setEditCustName] = useState('');
  const [editTableNo, setEditTableNo] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editOutlet, setEditOutlet] = useState('');
  const [editServiceType, setEditServiceType] = useState<string>('Dine-In');
  const [editPaymentMethod, setEditPaymentMethod] = useState<'Cash' | 'QRIS' | 'Transfer'>('Cash');
  const [editStatus, setEditStatus] = useState<OrderItem['status']>('Selesai');
  const [editNotes, setEditNotes] = useState('');
  const [editItems, setEditItems] = useState<OrderItem['items']>([]);

  // Delete Confirm Modal
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    id: string;
    desc: string;
  } | null>(null);

  const checkAdminPermission = (actionName: string = 'melakukan tindakan ini'): boolean => {
    if (!isAdmin) {
      showToast(`🔒 Akses Ditolak: Hanya Admin Terdaftar yang memiliki izin untuk ${actionName}.`);
      return false;
    }
    return true;
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return (orders || []).filter((o) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm.trim() ||
        (o.id || '').toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.tableNumber || '').toLowerCase().includes(q) ||
        (o.phone || '').toLowerCase().includes(q) ||
        (o.items || []).some((it) => (it.name || '').toLowerCase().includes(q));

      const matchesDate = !dateFilter || o.date === dateFilter;
      const matchesOutlet = outletFilter === 'ALL' || o.outlet === outletFilter;
      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
      const matchesService = serviceTypeFilter === 'ALL' || o.serviceType === serviceTypeFilter;
      const matchesPayment = paymentMethodFilter === 'ALL' || (o.paymentMethod || 'Cash') === paymentMethodFilter;

      return matchesSearch && matchesDate && matchesOutlet && matchesStatus && matchesService && matchesPayment;
    });
  }, [orders, searchTerm, dateFilter, outletFilter, statusFilter, serviceTypeFilter, paymentMethodFilter]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  // Status Change Handler
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderItem['status']) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    setOrders(updated);
    saveOrders(updated);
    showToast(`Status pesanan ${orderId} diubah menjadi "${newStatus}"`);
  };

  // Open Edit Order
  const handleOpenEditOrder = (order: OrderItem) => {
    if (!checkAdminPermission('mengedit data pesanan')) return;
    setEditingOrder(order);
    setEditCustName(order.customerName || '');
    setEditTableNo(order.tableNumber || '');
    setEditPhone(order.phone || '');
    setEditOutlet(order.outlet || locations[0]?.name || 'Steak 11, Cibubur');
    setEditServiceType(order.serviceType || 'Dine-In');
    setEditPaymentMethod((order.paymentMethod as any) || 'Cash');
    setEditStatus(order.status);
    setEditNotes(order.notes || '');
    setEditItems(JSON.parse(JSON.stringify(order.items || [])));
    setShowEditOrderModal(true);
  };

  // Save Edit Order
  const handleSaveEditOrder = () => {
    if (!editingOrder || !checkAdminPermission('menyimpan data pesanan')) return;
    const newTotal = editItems.reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0);

    const updated = orders.map((o) => {
      if (o.id === editingOrder.id) {
        return {
          ...o,
          customerName: editCustName.trim() || 'Pelanggan Walk-In',
          tableNumber: editTableNo.trim() || undefined,
          phone: editPhone.trim() || undefined,
          outlet: editOutlet,
          serviceType: editServiceType,
          paymentMethod: editPaymentMethod,
          status: editStatus,
          notes: editNotes.trim() || undefined,
          items: editItems,
          total: newTotal
        };
      }
      return o;
    });

    setOrders(updated);
    saveOrders(updated);
    showToast(`Pesanan #${editingOrder.id} berhasil diperbarui!`);
    setShowEditOrderModal(false);
  };

  // Delete Order
  const executeDeleteOrder = () => {
    if (!deleteConfirmTarget || !checkAdminPermission('menghapus pesanan')) return;
    const updated = orders.filter((o) => o.id !== deleteConfirmTarget.id);
    setOrders(updated);
    saveOrders(updated);
    showToast(`🗑️ Pesanan "${deleteConfirmTarget.id}" berhasil dihapus.`);
    setDeleteConfirmTarget(null);
  };

  // Export Excel
  const handleExportExcel = () => {
    if (filteredOrders.length === 0) {
      showToast('Tidak ada data pesanan untuk diekspor.');
      return;
    }

    const exportRows = filteredOrders.map((o) => ({
      'ID Pesanan': o.id,
      'Tanggal': o.date,
      'Jam': o.time || '-',
      'Nama Pelanggan': o.customerName || 'Walk-In',
      'No. Meja': o.tableNumber || '-',
      'WhatsApp': o.phone || '-',
      'Outlet': o.outlet,
      'Tipe Layanan': o.serviceType,
      'Rincian Menu': (o.items || []).map((it) => `${it.name} (${it.quantity}x)`).join(', '),
      'Metode Bayar': o.paymentMethod || 'Cash',
      'Total Belanja': o.total,
      'Status': o.status,
      'Catatan': o.notes || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Daftar Pesanan');
    XLSX.writeFile(wb, `Steak11_Daftar_Pesanan_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Data pesanan berhasil diekspor ke Excel!');
  };

  // Export Full PDF Table
  const handleExportPdfReport = () => {
    if (filteredOrders.length === 0) {
      showToast('Tidak ada data pesanan untuk dicetak PDF.');
      return;
    }

    const doc = new jsPDF('landscape');
    doc.setFontSize(16);
    doc.text('STEAK 11 — REKAP LAPORAN DAFTAR PESANAN', 14, 15);
    doc.setFontSize(10);
    doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')} WIB | Total Transaksi: ${filteredOrders.length} Pesanan`, 14, 22);

    const tableData = filteredOrders.map((o, idx) => [
      idx + 1,
      o.id,
      `${o.date} ${o.time || ''}`,
      o.customerName || 'Walk-In',
      o.outlet,
      o.serviceType,
      (o.items || []).map((it) => `${it.quantity}x ${it.name}`).join(', '),
      o.paymentMethod || 'Cash',
      formatRupiah(o.total),
      o.status
    ]);

    autoTable(doc, {
      head: [['No', 'ID Order', 'Waktu', 'Pelanggan', 'Outlet', 'Layanan', 'Menu', 'Metode', 'Total', 'Status']],
      body: tableData,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [61, 18, 89] }
    });

    doc.save(`Steak11_Rekap_Pesanan_${new Date().toISOString().split('T')[0]}.pdf`);
    showToast('Rekap PDF daftar pesanan berhasil diunduh!');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            Pusat Data &amp; Riwayat Pesanan Steak 11
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Daftar transaksi masuk dari Kasir POS dan Landing Page Pelanggan. Dilengkapi cetak struk thermal, WhatsApp invoice, dan status dapur realtime.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {syncFromSheets && (
            <button
              onClick={syncFromSheets}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800 font-extrabold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sinkronisasi...' : 'Sinkron Cloud'}</span>
            </button>
          )}

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 font-extrabold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-all active:scale-95"
            title="Ekspor ke File Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> <span>Ekspor Excel</span>
          </button>

          <button
            onClick={handleExportPdfReport}
            className="px-3.5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/80 dark:hover:bg-purple-800 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700/60 font-extrabold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-all active:scale-95"
            title="Unduh Rekap Pesanan PDF"
          >
            <Download className="w-3.5 h-3.5" /> <span>Cetak Rekap PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 text-xs">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari ID pesanan, nama, meja, telepon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Date Filter */}
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 cursor-pointer"
            />
          </div>

          {/* Outlet Filter */}
          <div>
            <select
              value={outletFilter}
              onChange={(e) => setOutletFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 cursor-pointer"
            >
              <option value="ALL">Semua Outlet</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
              <option value="Diproses Dapur">Diproses Dapur</option>
              <option value="Siap Disajikan">Siap Disajikan</option>
              <option value="Selesai">Selesai</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 cursor-pointer"
            >
              <option value="ALL">Semua Metode</option>
              <option value="Cash">💵 Tunai (Cash)</option>
              <option value="QRIS">📱 QRIS</option>
              <option value="Transfer">💳 Transfer</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Reset & Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-purple-900/40">
          <span>
            Menampilkan <strong>{filteredOrders.length}</strong> transaksi pesanan
          </span>
          {(searchTerm || dateFilter || outletFilter !== 'ALL' || statusFilter !== 'ALL' || paymentMethodFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDateFilter('');
                setOutletFilter('ALL');
                setStatusFilter('ALL');
                setServiceTypeFilter('ALL');
                setPaymentMethodFilter('ALL');
              }}
              className="text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#1f0e30] rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 dark:bg-purple-950/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-purple-900">
              <tr>
                <th className="p-3">ID &amp; Waktu</th>
                <th className="p-3">Pelanggan &amp; Meja</th>
                <th className="p-3">Outlet &amp; Layanan</th>
                <th className="p-3">Rincian Menu</th>
                <th className="p-3">Metode &amp; Total</th>
                <th className="p-3">Status Pesanan</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-purple-900/40">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 italic">
                    Belum ada data pesanan yang sesuai filter.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 dark:hover:bg-purple-900/20 transition-colors">
                    {/* ID & Date */}
                    <td className="p-3 font-mono">
                      <span className="font-extrabold text-purple-950 dark:text-amber-300 block">{o.id}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" /> {o.date} {o.time || ''}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="p-3">
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 block">
                        {o.customerName || 'Pelanggan Walk-In'}
                      </span>
                      {o.tableNumber && (
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          Meja #{o.tableNumber}
                        </span>
                      )}
                      {o.phone && (
                        <span className="block text-[10px] text-slate-400 font-mono">{o.phone}</span>
                      )}
                    </td>

                    {/* Outlet & Service */}
                    <td className="p-3">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-500" /> {o.outlet}
                      </span>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          o.serviceType === 'Dine-In'
                            ? 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300'
                            : o.serviceType === 'Takeaway'
                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {o.serviceType || 'Dine-In'}
                      </span>
                    </td>

                    {/* Items */}
                    <td className="p-3 max-w-[240px]">
                      <div className="space-y-1 max-h-20 overflow-y-auto pr-1">
                        {(o.items || []).map((it, idx) => (
                          <div key={idx} className="text-[11px] leading-tight flex items-start justify-between gap-1">
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              <strong className="text-amber-600 dark:text-amber-400">{it.quantity}x</strong> {it.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 shrink-0">
                              {formatRupiah((it.price || 0) * (it.quantity || 1))}
                            </span>
                          </div>
                        ))}
                      </div>
                      {o.notes && (
                        <span className="block mt-1 text-[10px] italic text-slate-500 dark:text-slate-400 truncate">
                          Note: {o.notes}
                        </span>
                      )}
                    </td>

                    {/* Payment & Total */}
                    <td className="p-3">
                      <span className="font-black text-sm text-purple-950 dark:text-amber-400 block">
                        {formatRupiah(o.total)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        {o.paymentMethod || 'Cash'}
                      </span>
                    </td>

                    {/* Status Select */}
                    <td className="p-3">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as any)}
                        className={`px-2.5 py-1 rounded-lg font-extrabold text-[11px] border cursor-pointer ${
                          o.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                            : o.status === 'Diproses Dapur'
                            ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                            : o.status === 'Siap Disajikan'
                            ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300'
                            : o.status === 'Dibatalkan'
                            ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300'
                        }`}
                      >
                        <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                        <option value="Diproses Dapur">Diproses Dapur</option>
                        <option value="Siap Disajikan">Siap Disajikan</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Dibatalkan">Dibatalkan</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Thermal Print */}
                        {onOpenThermalModal && (
                          <button
                            onClick={() => onOpenThermalModal(o)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-purple-950 dark:hover:bg-purple-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-purple-800 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                            title="Cetak Struk Thermal Bluetooth"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* WhatsApp Send */}
                        {onSendWhatsApp && (
                          <button
                            onClick={() => onSendWhatsApp(o)}
                            className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                            title="Kirim Struk via WhatsApp"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Edit Order */}
                        {isAdmin && (
                          <button
                            onClick={() => handleOpenEditOrder(o)}
                            className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                            title="Edit Rincian Pesanan"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete Order */}
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteConfirmTarget({ id: o.id, desc: `${o.id} - ${o.customerName || 'Walk-In'} (${formatRupiah(o.total)})` })}
                            className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                            title="Hapus Pesanan Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3 bg-slate-50 dark:bg-purple-950/40 border-t border-slate-200 dark:border-purple-900/50 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-purple-900 border border-slate-200 dark:border-purple-800 text-slate-700 dark:text-slate-200 font-bold disabled:opacity-40 cursor-pointer"
              >
                ← Sebelumnya
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-purple-900 border border-slate-200 dark:border-purple-800 text-slate-700 dark:text-slate-200 font-bold disabled:opacity-40 cursor-pointer"
              >
                Selanjutnya →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Order Modal */}
      {showEditOrderModal && editingOrder && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C0D2B] rounded-3xl p-6 max-w-xl w-full border border-purple-900/50 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-purple-900/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-400 text-purple-950 font-black">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo">
                    Edit Rincian Pesanan #{editingOrder.id}
                  </h3>
                  <p className="text-[11px] text-slate-500">Ubah data pesanan, item menu, atau status pembayaran</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditOrderModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Pelanggan</label>
                  <input
                    type="text"
                    value={editCustName}
                    onChange={(e) => setEditCustName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">No. Meja</label>
                  <input
                    type="text"
                    value={editTableNo}
                    onChange={(e) => setEditTableNo(e.target.value)}
                    placeholder="01"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Outlet</label>
                  <select
                    value={editOutlet}
                    onChange={(e) => setEditOutlet(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tipe Layanan</label>
                  <select
                    value={editServiceType}
                    onChange={(e) => setEditServiceType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold"
                  >
                    <option value="Dine-In">🍽️ Dine-In</option>
                    <option value="Takeaway">🛍️ Takeaway</option>
                    <option value="Delivery">🛵 Delivery</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Metode Bayar</label>
                  <select
                    value={editPaymentMethod}
                    onChange={(e) => setEditPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold"
                  >
                    <option value="Cash">💵 Cash (Tunai)</option>
                    <option value="QRIS">📱 QRIS</option>
                    <option value="Transfer">💳 Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-amber-600 dark:text-amber-400"
                  >
                    <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                    <option value="Diproses Dapur">Diproses Dapur</option>
                    <option value="Siap Disajikan">Siap Disajikan</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>
                </div>
              </div>

              {/* Items in order */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-purple-900/40">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">Rincian Item Menu Pesanan</label>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {editItems.map((itm, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/60 border border-slate-200 dark:border-purple-900 flex items-center justify-between gap-2"
                    >
                      <div className="flex-1">
                        <span className="font-bold text-slate-800 dark:text-slate-100 block">{itm.name}</span>
                        <span className="text-[10px] text-slate-400">{formatRupiah(itm.price)} / porsi</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          value={itm.quantity}
                          onChange={(e) => {
                            const val = Math.max(1, parseInt(e.target.value) || 1);
                            const updated = [...editItems];
                            updated[idx].quantity = val;
                            setEditItems(updated);
                          }}
                          className="w-16 px-2 py-1 text-center font-bold rounded-lg border border-slate-200 dark:border-purple-800 bg-white dark:bg-[#12071B]"
                        />
                        <button
                          type="button"
                          onClick={() => setEditItems(editItems.filter((_, i) => i !== idx))}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                          title="Hapus Menu Ini dari Pesanan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total preview */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-purple-950/80 border border-amber-300 dark:border-purple-800 flex items-center justify-between font-bold">
                <span>Total Belanja Baru:</span>
                <span className="font-black text-base text-purple-950 dark:text-amber-400">
                  {formatRupiah(editItems.reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0))}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-purple-900/40">
              <button
                type="button"
                onClick={() => setShowEditOrderModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEditOrder}
                className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C0D2B] rounded-2xl p-6 max-w-md w-full border border-red-500/30 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-3 bg-red-100 dark:bg-red-950/80 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">Hapus Pesanan</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{deleteConfirmTarget.desc}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-purple-950/50 p-3 rounded-xl border border-slate-200 dark:border-purple-900">
              Tindakan ini tidak dapat dibatalkan. Riwayat pesanan akan langsung dihapus dari sistem.
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
                onClick={executeDeleteOrder}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-extrabold text-xs hover:bg-red-700 shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
