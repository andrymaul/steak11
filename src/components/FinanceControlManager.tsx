import React, { useState } from 'react';
import {
  Banknote,
  Calculator,
  Receipt,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Download,
  Filter,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  ShieldAlert,
  FileText,
  PieChart,
  UserCheck,
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  Calendar,
  ArrowUpRight,
  BarChart3
} from 'lucide-react';
import { CashierShiftRecord, PettyCashExpense, OrderItem, PayrollSlip } from '../types';
import { formatRupiah, isRegisteredAdmin } from '../utils';
import * as XLSX from 'xlsx';

interface FinanceControlManagerProps {
  shifts: CashierShiftRecord[];
  setShifts: React.Dispatch<React.SetStateAction<CashierShiftRecord[]>>;
  saveShiftsData: (data: CashierShiftRecord[]) => void;
  expenses: PettyCashExpense[];
  setExpenses: React.Dispatch<React.SetStateAction<PettyCashExpense[]>>;
  saveExpensesData: (data: PettyCashExpense[]) => void;
  orders: OrderItem[];
  payrolls: PayrollSlip[];
  showToast: (msg: string) => void;
  outletsList: string[];
  currentUser?: { name: string; role: string } | null;
}

export const FinanceControlManager: React.FC<FinanceControlManagerProps> = ({
  shifts = [],
  setShifts = (_: any) => {},
  saveShiftsData = (_: any) => {},
  expenses = [],
  setExpenses = (_: any) => {},
  saveExpensesData = (_: any) => {},
  orders = [],
  payrolls = [],
  showToast = (_: any) => {},
  outletsList = [],
  currentUser
}) => {
  const [subTab, setSubTab] = useState<'closing_audit' | 'petty_cash' | 'profit_loss' | 'payment_methods'>('closing_audit');

  // Timeframe Filters for Financial Statements (P&L & Payment Methods)
  const todayStr = new Date().toISOString().split('T')[0];
  const [pnlMode, setPnlMode] = useState<'harian' | 'mingguan' | 'bulanan' | 'semua'>('harian');
  const [pnlDate, setPnlDate] = useState<string>(todayStr);
  const [pnlMonth, setPnlMonth] = useState<string>(todayStr.substring(0, 7));

  // Payment Method Filter Tab inside Payment Method Breakdown
  const [selectedPayMethodFilter, setSelectedPayMethodFilter] = useState<'ALL' | 'QRIS' | 'Cash' | 'Transfer' | 'Debit'>('ALL');

  // New Shift Closing State
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    id: string;
    desc: string;
    type?: 'expense' | 'shift';
  } | null>(null);

  const handleDeleteShift = (id: string, shiftDesc: string) => {
    setDeleteConfirmTarget({ id, desc: shiftDesc, type: 'shift' });
  };

  const executeDeleteTarget = () => {
    if (!deleteConfirmTarget) return;
    const { id, desc, type = 'expense' } = deleteConfirmTarget;
    if (type === 'shift') {
      const updated = (shifts || []).filter((s) => s.id !== id);
      setShifts(updated);
      saveShiftsData(updated);
      showToast(`🗑️ Data Audit Closing Shift "${desc}" telah dihapus.`);
    } else {
      const updated = (expenses || []).filter((e) => e.id !== id);
      setExpenses(updated);
      saveExpensesData(updated);
      showToast(`🗑️ Pengeluaran "${desc}" telah dihapus.`);
    }
    setDeleteConfirmTarget(null);
  };

  const [showClosingModal, setShowClosingModal] = useState(false);
  const [shiftName, setShiftName] = useState<'Shift Pagi' | 'Shift Siang' | 'Shift Malam'>('Shift Malam');
  const [cashierName, setCashierName] = useState(currentUser?.name || 'Rina Kurnia');
  const [outlet, setOutlet] = useState((outletsList && outletsList[0]) || 'Steak 11, Cibubur');
  const [startingCash, setStartingCash] = useState<number>(200000);
  const [notes, setNotes] = useState('');

  // Money Denominations Breakdown (Calculator)
  const [denominations, setDenominations] = useState<Record<string, number>>({
    '100000': 0,
    '50000': 0,
    '20000': 0,
    '10000': 0,
    '5000': 0,
    '2000': 0,
    '1000': 0,
    'koin': 0,
  });

  // Manual actual cash fallback
  const [manualActualCash, setManualActualCash] = useState<number>(0);
  const [useDenominationCalc, setUseDenominationCalc] = useState(true);

  // New Expense State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expCategory, setExpCategory] = useState<PettyCashExpense['category']>('Pembelian Bahan Darurat');
  const [expDescription, setExpDescription] = useState('');
  const [expAmount, setExpAmount] = useState<number>(20000);
  const [expReceiptNo, setExpReceiptNo] = useState('');

  // Filters
  const [selectedOutletFilter, setSelectedOutletFilter] = useState('ALL');

  // Compute live POS revenue for chosen outlet today
  const todayOrders = (orders || []).filter(
    (o) => o.status === 'Selesai' && o.date === todayStr && (selectedOutletFilter === 'ALL' || o.outlet === selectedOutletFilter)
  );

  const posCashRevenue = todayOrders
    .filter((o) => o.paymentMethod === 'Cash')
    .reduce((acc, c) => acc + c.total, 0);

  const posQrisRevenue = todayOrders
    .filter((o) => o.paymentMethod === 'QRIS')
    .reduce((acc, c) => acc + c.total, 0);

  const posTransferRevenue = todayOrders
    .filter((o) => o.paymentMethod === 'Transfer')
    .reduce((acc, c) => acc + c.total, 0);

  const posTotalRevenue = posCashRevenue + posQrisRevenue + posTransferRevenue;

  // Expenses for today
  const todayExpenses = (expenses || []).filter(
    (e) => e.date === todayStr && (selectedOutletFilter === 'ALL' || e.outlet === selectedOutletFilter)
  );
  const totalOperationalExpenses = todayExpenses.reduce((acc, c) => acc + c.amount, 0);

  // Denominations Total
  const denomTotal = Object.entries(denominations).reduce((acc: number, [denom, count]) => {
    const val = denom === 'koin' ? 1 : (Number(denom) || 0);
    const cnt = typeof count === 'number' ? count : (Number(count) || 0);
    return acc + (val * cnt);
  }, 0);

  const calculatedActualCash = useDenominationCalc ? denomTotal : manualActualCash;
  const expectedCashInDrawer = startingCash + posCashRevenue - totalOperationalExpenses;
  const cashDifference = calculatedActualCash - expectedCashInDrawer;

  let auditStatus: 'Sesuai (Balance)' | 'Surplus (Lebih Kas)' | 'Defisit (Kurang Kas)' = 'Sesuai (Balance)';
  if (cashDifference > 0) auditStatus = 'Surplus (Lebih Kas)';
  if (cashDifference < 0) auditStatus = 'Defisit (Kurang Kas)';

  // Helper date checker for P&L and Payment Breakdown
  const isDateInPnlFilter = (dateStr: string) => {
    if (!dateStr) return false;
    if (pnlMode === 'semua') return true;
    if (pnlMode === 'harian') return dateStr === pnlDate;
    if (pnlMode === 'bulanan') return dateStr.substring(0, 7) === pnlMonth;
    if (pnlMode === 'mingguan') {
      const endMs = new Date(pnlDate + 'T23:59:59').getTime();
      const startMs = endMs - 7 * 24 * 60 * 60 * 1000;
      const curMs = new Date(dateStr + 'T12:00:00').getTime();
      return curMs >= startMs && curMs <= endMs;
    }
    return true;
  };

  // List of all known outlets (from props or data)
  const allKnownOutlets = Array.from(
    new Set([
      ...(outletsList || []),
      ...(orders || []).map((o) => o.outlet).filter(Boolean),
      ...(expenses || []).map((e) => e.outlet).filter(Boolean),
      ...(shifts || []).map((s) => s.outlet).filter(Boolean),
    ])
  );
  if (allKnownOutlets.length === 0) {
    allKnownOutlets.push('Steak 11, Cibubur');
  }

  // Per Branch Financial Performance Breakdown Calculations
  const perBranchReports = allKnownOutlets.map((outletName) => {
    const branchOrders = (orders || []).filter(
      (o) => o.status === 'Selesai' && o.outlet === outletName && isDateInPnlFilter(o.date || '')
    );
    const branchExpenses = (expenses || []).filter(
      (e) => e.outlet === outletName && isDateInPnlFilter(e.date)
    );
    const branchPayrolls = (payrolls || []).filter((p) => {
      if (p.outlet !== outletName) return false;
      if (pnlMode === 'bulanan') return p.periodMonth === pnlMonth;
      return true;
    });

    const grossRev = branchOrders.reduce((acc, c) => acc + (c.total || 0), 0);
    const cashRev = branchOrders
      .filter((o) => (o.paymentMethod || 'Cash') === 'Cash')
      .reduce((acc, c) => acc + (c.total || 0), 0);
    const qrisRev = branchOrders
      .filter((o) => o.paymentMethod === 'QRIS')
      .reduce((acc, c) => acc + (c.total || 0), 0);
    const transferRev = branchOrders
      .filter((o) => o.paymentMethod === 'Transfer')
      .reduce((acc, c) => acc + (c.total || 0), 0);
    const debitRev = branchOrders
      .filter((o) => o.paymentMethod === 'Debit')
      .reduce((acc, c) => acc + (c.total || 0), 0);
    const nonCashRev = qrisRev + transferRev + debitRev;

    const cogs = branchOrders.reduce((acc, c) => {
      if (c.cogsTotal && c.cogsTotal > 0) return acc + c.cogsTotal;
      const sub = c.subtotal || c.total || 0;
      return acc + Math.round(sub * 0.38);
    }, 0);

    const grossProfit = grossRev - cogs;
    const opExpenses = branchExpenses.reduce((acc, c) => acc + c.amount, 0);
    const payrollCosts = branchPayrolls.reduce((acc, c) => acc + c.netSalary, 0);
    const netProfit = grossProfit - opExpenses - payrollCosts;
    const marginPct = grossRev > 0 ? (netProfit / grossRev) * 100 : 0;

    return {
      outletName,
      orderCount: branchOrders.length,
      grossRev,
      cashRev,
      nonCashRev,
      qrisRev,
      transferRev,
      debitRev,
      cogs,
      grossProfit,
      opExpenses,
      payrollCosts,
      netProfit,
      marginPct,
    };
  });

  // Filtered Orders for P&L / Payment Breakdown
  const filteredPnlOrders = (orders || []).filter(
    (o) =>
      o.status === 'Selesai' &&
      isDateInPnlFilter(o.date || '') &&
      (selectedOutletFilter === 'ALL' || o.outlet === selectedOutletFilter)
  );

  // Filtered Expenses
  const filteredPnlExpenses = (expenses || []).filter(
    (e) =>
      isDateInPnlFilter(e.date) &&
      (selectedOutletFilter === 'ALL' || e.outlet === selectedOutletFilter)
  );

  // Filtered Payrolls
  const filteredPnlPayrolls = (payrolls || []).filter((p) => {
    if (selectedOutletFilter !== 'ALL' && p.outlet !== selectedOutletFilter) return false;
    if (pnlMode === 'bulanan') return p.periodMonth === pnlMonth;
    return true;
  });

  // P&L Metric Calculations
  const pnlGrossRevenue = filteredPnlOrders.reduce((acc, c) => acc + (c.total || 0), 0);

  // HPP / COGS Estimate (Calculated per item cogs if available or 38% default)
  const pnlCogsEstimate = filteredPnlOrders.reduce((acc, c) => {
    if (c.cogsTotal && c.cogsTotal > 0) return acc + c.cogsTotal;
    const sub = c.subtotal || c.total || 0;
    return acc + Math.round(sub * 0.38);
  }, 0);

  const pnlGrossProfit = pnlGrossRevenue - pnlCogsEstimate;
  const pnlOperatingExpenses = filteredPnlExpenses.reduce((acc, c) => acc + c.amount, 0);
  const pnlPayrollExpenses = filteredPnlPayrolls.reduce((acc, c) => acc + c.netSalary, 0);

  const pnlNetProfit = pnlGrossProfit - pnlOperatingExpenses - pnlPayrollExpenses;
  const pnlProfitMargin = pnlGrossRevenue > 0 ? (pnlNetProfit / pnlGrossRevenue) * 100 : 0;

  // Payment Methods Breakdown Calculations
  const payMethodQrisOrders = filteredPnlOrders.filter((o) => (o.paymentMethod || 'Cash') === 'QRIS');
  const payMethodCashOrders = filteredPnlOrders.filter((o) => (o.paymentMethod || 'Cash') === 'Cash');
  const payMethodTransferOrders = filteredPnlOrders.filter((o) => (o.paymentMethod || 'Cash') === 'Transfer');
  const payMethodDebitOrders = filteredPnlOrders.filter((o) => (o.paymentMethod || 'Cash') === 'Debit');

  const qrisTotalRevenue = payMethodQrisOrders.reduce((a, b) => a + (b.total || 0), 0);
  const cashTotalRevenue = payMethodCashOrders.reduce((a, b) => a + (b.total || 0), 0);
  const transferTotalRevenue = payMethodTransferOrders.reduce((a, b) => a + (b.total || 0), 0);
  const debitTotalRevenue = payMethodDebitOrders.reduce((a, b) => a + (b.total || 0), 0);

  const qrisSharePct = pnlGrossRevenue > 0 ? (qrisTotalRevenue / pnlGrossRevenue) * 100 : 0;
  const cashSharePct = pnlGrossRevenue > 0 ? (cashTotalRevenue / pnlGrossRevenue) * 100 : 0;
  const transferSharePct = pnlGrossRevenue > 0 ? (transferTotalRevenue / pnlGrossRevenue) * 100 : 0;
  const debitSharePct = pnlGrossRevenue > 0 ? (debitTotalRevenue / pnlGrossRevenue) * 100 : 0;

  // Export P&L Statement to Excel
  const handleExportPnlExcel = () => {
    const periodLabel =
      pnlMode === 'harian'
        ? `Harian (${pnlDate})`
        : pnlMode === 'mingguan'
        ? `Mingguan (7 Hari s/d ${pnlDate})`
        : pnlMode === 'bulanan'
        ? `Bulanan (${pnlMonth})`
        : 'Keseluruhan Data';

    const pnlRows = [
      { Parameter: 'Periode Laporan', Nilai: periodLabel },
      { Parameter: 'Filter Outlet', Nilai: selectedOutletFilter },
      { Parameter: '1. PENDAPATAN KOTOR (GROSS REVENUE)', Nilai: pnlGrossRevenue },
      { Parameter: '  - Pendapatan Tunai (Cash)', Nilai: cashTotalRevenue },
      { Parameter: '  - Pendapatan QRIS', Nilai: qrisTotalRevenue },
      { Parameter: '  - Pendapatan Transfer Bank', Nilai: transferTotalRevenue },
      { Parameter: '  - Pendapatan Kartu Debit/EDC', Nilai: debitTotalRevenue },
      { Parameter: '2. HARGA POKOK PENJUALAN (COGS/HPP PORSI)', Nilai: -pnlCogsEstimate },
      { Parameter: '3. LABA KOTOR (GROSS PROFIT)', Nilai: pnlGrossProfit },
      { Parameter: '4. BEBAN OPERASIONAL KAS KECIL', Nilai: -pnlOperatingExpenses },
      { Parameter: '5. BEBAN GAJI & PAYROLL KARYAWAN', Nilai: -pnlPayrollExpenses },
      { Parameter: '6. LABA / RUGI BERSIH (NET PROFIT)', Nilai: pnlNetProfit },
      { Parameter: 'MARGIN LABA BERSIH (%)', Nilai: `${pnlProfitMargin.toFixed(1)}%` },
    ];

    const branchRows = perBranchReports.map((b) => ({
      'Nama Outlet Cabang': b.outletName,
      'Jumlah Transaksi': b.orderCount,
      'Omset Kotor (Rp)': b.grossRev,
      'Penjualan Tunai (Rp)': b.cashRev,
      'Penjualan Non-Tunai (Rp)': b.nonCashRev,
      'Estimasi HPP/COGS (Rp)': b.cogs,
      'Laba Kotor (Rp)': b.grossProfit,
      'Beban Kas Kecil (Rp)': b.opExpenses,
      'Beban Payroll (Rp)': b.payrollCosts,
      'Laba Bersih (Rp)': b.netProfit,
      'Margin Laba (%)': `${b.marginPct.toFixed(1)}%`,
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet1 = XLSX.utils.json_to_sheet(pnlRows);
    XLSX.utils.book_append_sheet(workbook, worksheet1, 'Laporan Laba Rugi');

    const worksheet2 = XLSX.utils.json_to_sheet(branchRows);
    XLSX.utils.book_append_sheet(workbook, worksheet2, 'Rekap Per Cabang');

    XLSX.writeFile(workbook, `Laporan_Keuangan_Steak11_${pnlMode}_${todayStr}.xlsx`);
    showToast('📊 Laporan Keuangan & Rekap Per Cabang Excel berhasil diunduh!');
  };

  // Print Complete Financial Statement PDF
  const handlePrintPnlReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const periodLabel =
      pnlMode === 'harian'
        ? `HARIAN (${pnlDate})`
        : pnlMode === 'mingguan'
        ? `MINGGUAN (7 HARI S/D ${pnlDate})`
        : pnlMode === 'bulanan'
        ? `BULANAN (${pnlMonth})`
        : 'KESELURUHAN DATA';

    const branchTableRows = perBranchReports
      .map(
        (b) => `
        <tr>
          <td style="padding: 6px; border: 1px solid #ccc; font-weight: bold;">${b.outletName}</td>
          <td style="padding: 6px; border: 1px solid #ccc; text-align: center;">${b.orderCount}</td>
          <td style="padding: 6px; border: 1px solid #ccc; text-align: right; font-weight: bold;">${formatRupiah(b.grossRev)}</td>
          <td style="padding: 6px; border: 1px solid #ccc; text-align: right;">${formatRupiah(b.cashRev)}</td>
          <td style="padding: 6px; border: 1px solid #ccc; text-align: right;">${formatRupiah(b.nonCashRev)}</td>
          <td style="padding: 6px; border: 1px solid #ccc; text-align: right; color: #c53030;">-${formatRupiah(b.cogs)}</td>
          <td style="padding: 6px; border: 1px solid #ccc; text-align: right; color: #c53030;">-${formatRupiah(b.opExpenses + b.payrollCosts)}</td>
          <td style="padding: 6px; border: 1px solid #ccc; text-align: right; font-weight: bold; color: ${b.netProfit >= 0 ? '#276749' : '#c53030'};">${formatRupiah(b.netProfit)}</td>
          <td style="padding: 6px; border: 1px solid #ccc; text-align: center; font-weight: bold;">${b.marginPct.toFixed(1)}%</td>
        </tr>
      `
      )
      .join('');

    const content = `
      <html>
        <head>
          <title>Laporan Keuangan & Profit Loss - Steak 11</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; color: #1a202c; font-size: 12px; }
            .header { text-align: center; border-bottom: 2px solid #3D1259; padding-bottom: 12px; margin-bottom: 20px; }
            .header h2 { margin: 0; color: #3D1259; font-size: 20px; }
            .header p { margin: 4px 0 0; color: #718096; font-size: 12px; }
            .meta-bar { display: flex; justify-content: space-between; background: #f7fafc; padding: 10px 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px; font-weight: bold; }
            .summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
            .card { background: #fff; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e0; }
            .card-title { font-size: 10px; color: #718096; text-transform: uppercase; font-weight: bold; }
            .card-val { font-size: 16px; font-weight: 800; margin-top: 4px; }
            .table-sec { margin-top: 24px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th { background: #3D1259; color: #fff; text-align: left; padding: 8px; border: 1px solid #3D1259; }
            .total-row { background: #edf2f7; font-weight: bold; }
            .signatures { margin-top: 40px; display: flex; justify-content: space-between; text-align: center; }
            .sig-box { width: 30%; }
            .sig-line { margin-top: 50px; border-top: 1px solid #000; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>STEAK 11 — MYTHIC CHICKEN TASTE</h2>
            <p>LAPORAN KEUANGAN & AUDIT LABA RUGI (PROFIT & LOSS STATEMENT)</p>
          </div>

          <div class="meta-bar">
            <span>PERIODE: ${periodLabel}</span>
            <span>FILTER CABANG: ${selectedOutletFilter}</span>
            <span>TANGGAL CETAK: ${new Date().toLocaleString('id-ID')}</span>
          </div>

          <div class="summary-cards">
            <div class="card">
              <div class="card-title">PENDAPATAN KOTOR</div>
              <div class="card-val" style="color: #276749;">${formatRupiah(pnlGrossRevenue)}</div>
            </div>
            <div class="card">
              <div class="card-title">HPP / COGS PORSI</div>
              <div class="card-val" style="color: #dd6b20;">-${formatRupiah(pnlCogsEstimate)}</div>
            </div>
            <div class="card">
              <div class="card-title">BEBAN OPERASIONAL & GAJI</div>
              <div class="card-val" style="color: #c53030;">-${formatRupiah(pnlOperatingExpenses + pnlPayrollExpenses)}</div>
            </div>
            <div class="card" style="background: #3D1259; color: #fff;">
              <div class="card-title" style="color: #f6ad55;">LABA BERSIH (NET PROFIT)</div>
              <div class="card-val" style="color: ${pnlNetProfit >= 0 ? '#68d391' : '#fc8181'};">${formatRupiah(pnlNetProfit)}</div>
            </div>
          </div>

          <div class="table-sec">
            <h3 style="color: #3D1259; margin-bottom: 8px;">RINCIAN KINERJA KEUANGAN PER CABANG / OUTLET</h3>
            <table>
              <thead>
                <tr>
                  <th>Nama Outlet</th>
                  <th style="text-align: center;">Order</th>
                  <th style="text-align: right;">Gross Revenue</th>
                  <th style="text-align: right;">Tunai (Cash)</th>
                  <th style="text-align: right;">Non-Tunai</th>
                  <th style="text-align: right;">HPP (COGS)</th>
                  <th style="text-align: right;">Beban (Opex+Payroll)</th>
                  <th style="text-align: right;">Net Profit</th>
                  <th style="text-align: center;">Margin %</th>
                </tr>
              </thead>
              <tbody>
                ${branchTableRows}
                <tr class="total-row">
                  <td style="padding: 8px; border: 1px solid #ccc;">KONSOLIDASI SELURUH CABANG</td>
                  <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${filteredPnlOrders.length}</td>
                  <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${formatRupiah(pnlGrossRevenue)}</td>
                  <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${formatRupiah(cashTotalRevenue)}</td>
                  <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${formatRupiah(qrisTotalRevenue + transferTotalRevenue + debitTotalRevenue)}</td>
                  <td style="padding: 8px; border: 1px solid #ccc; text-align: right; color: #c53030;">-${formatRupiah(pnlCogsEstimate)}</td>
                  <td style="padding: 8px; border: 1px solid #ccc; text-align: right; color: #c53030;">-${formatRupiah(pnlOperatingExpenses + pnlPayrollExpenses)}</td>
                  <td style="padding: 8px; border: 1px solid #ccc; text-align: right; color: ${pnlNetProfit >= 0 ? '#276749' : '#c53030'};">${formatRupiah(pnlNetProfit)}</td>
                  <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${pnlProfitMargin.toFixed(1)}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="signatures">
            <div class="sig-box">
              <p>Dibuat oleh,</p>
              <div class="sig-line"></div>
              <p><strong>${currentUser?.name || 'Kasir / Staff Finance'}</strong></p>
            </div>
            <div class="sig-box">
              <p>Diperiksa oleh,</p>
              <div class="sig-line"></div>
              <p><strong>Operational Manager</strong></p>
            </div>
            <div class="sig-box">
              <p>Disetujui oleh,</p>
              <div class="sig-line"></div>
              <p><strong>Owner / Direksi</strong></p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const isReadOnlyVisitor = !isRegisteredAdmin(currentUser);
  const checkReadOnlyPermission = (): boolean => {
    if (isReadOnlyVisitor) {
      showToast('🔒 Akses Ditolak: Hanya Admin Terdaftar yang memiliki izin untuk Edit & Hapus data.');
      return true;
    }
    return false;
  };

  // Handle Save Closing Shift
  const handleSaveClosingShift = () => {
    if (checkReadOnlyPermission()) return;
    const newShift: CashierShiftRecord = {
      id: `SHF-${todayStr.replace(/-/g, '')}-${String((shifts || []).length + 1).padStart(2, '0')}`,
      date: todayStr,
      shiftName,
      cashierName,
      outlet,
      startingCash,
      cashRevenue: posCashRevenue,
      qrisRevenue: posQrisRevenue,
      transferRevenue: posTransferRevenue,
      totalRevenue: posTotalRevenue,
      operationalExpenses: totalOperationalExpenses,
      expectedCashInDrawer,
      actualCashInDrawer: calculatedActualCash,
      systemCashTotal: startingCash + posCashRevenue,
      actualCashTotal: calculatedActualCash,
      cashDifference,
      auditStatus,
      notes: notes.trim() || 'Closing shift tercatat otomatis.',
      status: 'Closed',
      closedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      denominations,
    };

    const updated = [newShift, ...shifts];
    setShifts(updated);
    saveShiftsData(updated);
    setShowClosingModal(false);
    showToast(`✅ Closing Shift Kasir ${newShift.id} berhasil disimpan & diaudit!`);
  };

  // Handle Save Expense
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkReadOnlyPermission()) return;
    if (!expDescription.trim() || expAmount <= 0) {
      showToast('⚠️ Deskripsi dan nominal pengeluaran wajib diisi!');
      return;
    }

    const newExp: PettyCashExpense = {
      id: `EXP-${todayStr.replace(/-/g, '')}-${String((expenses || []).length + 1).padStart(3, '0')}`,
      date: todayStr,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      outlet,
      cashierName: currentUser?.name || 'Kasir',
      category: expCategory,
      description: expDescription.trim(),
      amount: expAmount,
      receiptNumber: expReceiptNo.trim() || undefined,
      approvedBy: currentUser?.name || 'Manager',
    };

    const updated = [newExp, ...expenses];
    setExpenses(updated);
    saveExpensesData(updated);
    setShowExpenseModal(false);
    setExpDescription('');
    setExpAmount(20000);
    setExpReceiptNo('');
    showToast(`💸 Pengeluaran kas kecil "${formatRupiah(expAmount)}" berhasil dicatat!`);
  };

  const handleDeleteExpense = (id: string, desc: string) => {
    setDeleteConfirmTarget({ id, desc });
  };

  // Print Closing Summary
  const handlePrintClosingSummary = (shift: CashierShiftRecord) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <html>
        <head>
          <title>Closing Shift Audit - ${shift.id}</title>
          <style>
            body { font-family: monospace; padding: 20px; max-width: 380px; margin: 0 auto; font-size: 12px; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .row { display: flex; justify-content: space-between; margin: 4px 0; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 8px 0; }
            .highlight { background: #f0f0f0; padding: 6px; border-radius: 4px; font-weight: bold; }
            .footer { text-align: center; margin-top: 15px; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h3>STEAK 11 — MYTHIC CHICKEN TASTE</h3>
            <p>LAPORAN AUDIT CLOSING SHIFT KASIR</p>
            <p>${shift.outlet}</p>
          </div>
          <div class="row"><span>ID Shift:</span><span class="bold">${shift.id}</span></div>
          <div class="row"><span>Tanggal / Jam:</span><span>${shift.date} ${shift.closedAt || ''}</span></div>
          <div class="row"><span>Kasir:</span><span class="bold">${shift.cashierName}</span></div>
          <div class="row"><span>Shift:</span><span>${shift.shiftName}</span></div>
          <div class="line"></div>

          <div class="row"><span>1. Modal Awal Laci:</span><span>${formatRupiah(shift.startingCash)}</span></div>
          <div class="row"><span>2. Penjualan Tunai:</span><span>+${formatRupiah(shift.cashRevenue)}</span></div>
          <div class="row"><span>3. Pengeluaran Operasional:</span><span>-${formatRupiah(shift.operationalExpenses || 0)}</span></div>
          <div class="line"></div>
          <div class="row highlight"><span>KAS TEORETIS SEHARUSNYA:</span><span>${formatRupiah(shift.expectedCashInDrawer || shift.systemCashTotal)}</span></div>
          <div class="row highlight"><span>HASIL HITUNG FISIK LACI:</span><span>${formatRupiah(shift.actualCashInDrawer || shift.actualCashTotal)}</span></div>
          <div class="line"></div>

          <div class="row bold">
            <span>SELISIH AUDIT:</span>
            <span>${formatRupiah(shift.cashDifference)} (${shift.auditStatus || 'Sesuai'})</span>
          </div>

          <div class="line"></div>
          <div class="row"><span>Omset QRIS:</span><span>${formatRupiah(shift.qrisRevenue)}</span></div>
          <div class="row"><span>Omset Transfer:</span><span>${formatRupiah(shift.transferRevenue)}</span></div>
          <div class="row bold"><span>TOTAL OMSET POS:</span><span>${formatRupiah(shift.totalRevenue)}</span></div>

          <div class="line"></div>
          <p><strong>Catatan Kasir:</strong> ${shift.notes || '-'}</p>

          <div class="footer">
            <p>Dicetak otomatis oleh System Steak 11</p>
            <p>-- Terima Kasih --</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  // Profit Loss Summary
  const allOrdersTotalRevenue = (orders || [])
    .filter((o) => o.status === 'Selesai')
    .reduce((acc, c) => acc + c.total, 0);

  // Estimasi total HPP (COGS) porsi
  const totalCogsEstimate = (orders || [])
    .filter((o) => o.status === 'Selesai')
    .reduce((acc, c) => acc + (c.subtotal ? c.subtotal * 0.38 : c.total * 0.38), 0);

  const totalPettyCashExpensesAll = (expenses || []).reduce((acc, c) => acc + c.amount, 0);
  const totalPayrollExpensesAll = (payrolls || []).reduce((acc, c) => acc + c.netSalary, 0);

  const netProfitEstimate = allOrdersTotalRevenue - totalCogsEstimate - totalPettyCashExpensesAll - totalPayrollExpensesAll;

  return (
    <div className="space-y-6">
      {/* Sub-Header Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-slate-100 dark:bg-purple-950/60 border border-slate-200 dark:border-purple-900">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSubTab('closing_audit')}
            className={`px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              subTab === 'closing_audit'
                ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-purple-900/40'
            }`}
          >
            <Banknote className="w-4 h-4 text-emerald-400" />
            <span>Audit Closing Shift</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
              {(shifts || []).length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('petty_cash')}
            className={`px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              subTab === 'petty_cash'
                ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-purple-900/40'
            }`}
          >
            <Receipt className="w-4 h-4 text-rose-400" />
            <span>Kas Kecil & Operasional</span>
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-[10px]">
              {(expenses || []).length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('profit_loss')}
            className={`px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              subTab === 'profit_loss'
                ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-purple-900/40'
            }`}
          >
            <PieChart className="w-4 h-4 text-amber-400" />
            <span>Laporan Laba / Rugi (P&L)</span>
          </button>

          <button
            onClick={() => setSubTab('payment_methods')}
            className={`px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              subTab === 'payment_methods'
                ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-purple-900/40'
            }`}
          >
            <CreditCard className="w-4 h-4 text-blue-400" />
            <span>Breakdown Metode Pembayaran</span>
          </button>
        </div>

        {subTab === 'closing_audit' && (
          <button
            onClick={() => setShowClosingModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            <span>Input Closing Shift Kasir</span>
          </button>
        )}

        {subTab === 'petty_cash' && (
          <button
            onClick={() => setShowExpenseModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Pengeluaran Operasional</span>
          </button>
        )}
      </div>

      {/* SUB-TAB 1: AUDIT CLOSING SHIFT & SELISIH KAS */}
      {subTab === 'closing_audit' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1a0c28] border border-slate-200 dark:border-purple-900 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-slate-400">Total Penjualan Tunai Hari Ini</span>
              <p className="font-black text-lg text-emerald-600 dark:text-emerald-400">{formatRupiah(posCashRevenue)}</p>
              <p className="text-[10px] text-slate-400">{(todayOrders || []).filter(o => o.paymentMethod === 'Cash').length} Pesanan Tunai</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1a0c28] border border-slate-200 dark:border-purple-900 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-slate-400">Total QRIS & Transfer Hari Ini</span>
              <p className="font-black text-lg text-blue-600 dark:text-blue-400">{formatRupiah(posQrisRevenue + posTransferRevenue)}</p>
              <p className="text-[10px] text-slate-400">Nontunai Otomatis Masuk Rekening</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1a0c28] border border-slate-200 dark:border-purple-900 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-slate-400">Kas Keluar Operasional (Hari Ini)</span>
              <p className="font-black text-lg text-rose-600 dark:text-rose-400">-{formatRupiah(totalOperationalExpenses)}</p>
              <p className="text-[10px] text-slate-400">{(todayExpenses || []).length} Nota Pengeluaran</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1a0c28] border border-slate-200 dark:border-purple-900 shadow-sm space-y-1 bg-gradient-to-br from-purple-900 to-indigo-950 text-white">
              <span className="text-[10px] font-bold text-amber-300">Estimasi Saldo Laci Kasir Seharusnya</span>
              <p className="font-black text-lg text-amber-400">{formatRupiah(expectedCashInDrawer)}</p>
              <p className="text-[10px] text-purple-200">Modal Awal + Tunai - Operasional</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#1a0c28] border border-slate-200 dark:border-purple-900 shadow-sm space-y-3">
            <h4 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-400 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-500" />
              Riwayat Closing Shift & Audit Selisih Kas
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-500 dark:text-purple-300 font-bold">
                    <th className="p-2.5">ID & Tanggal Shift</th>
                    <th className="p-2.5">Kasir & Outlet</th>
                    <th className="p-2.5">Modal Awal</th>
                    <th className="p-2.5">Tunai POS</th>
                    <th className="p-2.5">Kas Keluar</th>
                    <th className="p-2.5">Teoretis System</th>
                    <th className="p-2.5">Fisik Laci Hitung</th>
                    <th className="p-2.5">Selisih Audit</th>
                    <th className="p-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-purple-900/50">
                  {shifts.map((shf) => {
                    const diff = shf.cashDifference;
                    return (
                      <tr key={shf.id} className="hover:bg-slate-50 dark:hover:bg-purple-900/30 transition-colors">
                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-100">
                          {shf.id}
                          <span className="block text-[10px] text-slate-400">{shf.date} ({shf.shiftName})</span>
                        </td>
                        <td className="p-2.5">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{shf.cashierName}</span>
                          <span className="block text-[10px] text-slate-400">{shf.outlet}</span>
                        </td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{formatRupiah(shf.startingCash)}</td>
                        <td className="p-2.5 font-bold text-emerald-600 dark:text-emerald-400">+{formatRupiah(shf.cashRevenue)}</td>
                        <td className="p-2.5 text-rose-500 font-bold">-{formatRupiah(shf.operationalExpenses || 0)}</td>
                        <td className="p-2.5 font-black text-purple-900 dark:text-amber-300">
                          {formatRupiah(shf.expectedCashInDrawer || shf.systemCashTotal)}
                        </td>
                        <td className="p-2.5 font-black text-slate-900 dark:text-slate-100">
                          {formatRupiah(shf.actualCashInDrawer || shf.actualCashTotal)}
                        </td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded font-black text-[10px] inline-flex items-center gap-1 ${
                              diff === 0
                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                : diff > 0
                                ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                                : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {diff === 0 ? '✓ Sesuai (0)' : diff > 0 ? `+${formatRupiah(diff)}` : formatRupiah(diff)}
                          </span>
                        </td>
                        <td className="p-2.5 text-right flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handlePrintClosingSummary(shf)}
                            className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/60 dark:hover:bg-purple-800 text-purple-950 dark:text-amber-300 font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer"
                            title="Cetak Struk Audit Closing Shift"
                          >
                            <Printer className="w-3 h-3" />
                            Cetak Audit
                          </button>
                          <button
                            onClick={() => handleDeleteShift(shf.id, `${shf.id} - ${shf.date} (${shf.shiftName})`)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/80 hover:text-rose-700 transition-all cursor-pointer"
                            title="Hapus Record Closing Shift Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PETTY CASH & OPERATIONAL EXPENSES */}
      {subTab === 'petty_cash' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1a0c28] border border-slate-200 dark:border-purple-900 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-purple-900/50 pb-3">
              <h4 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-400 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-500" />
                Pencatatan Pengeluaran Kas Kecil Operasional ({(expenses || []).length} Transaksi)
              </h4>

              <div className="text-xs">
                <span className="text-slate-400">Total Pengeluaran: </span>
                <span className="font-black text-rose-600 dark:text-rose-400 text-sm">
                  {formatRupiah((expenses || []).reduce((a, b) => a + b.amount, 0))}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-500 dark:text-purple-300 font-bold">
                    <th className="p-2.5">Tanggal & Jam</th>
                    <th className="p-2.5">Kategori</th>
                    <th className="p-2.5">Deskripsi Pengeluaran</th>
                    <th className="p-2.5">No. Nota</th>
                    <th className="p-2.5">Kasir / Outlet</th>
                    <th className="p-2.5">Nominal</th>
                    <th className="p-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-purple-900/50">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-purple-900/30 transition-colors">
                      <td className="p-2.5 text-slate-600 dark:text-slate-300">
                        {exp.date} <span className="text-[10px] text-slate-400 block">{exp.time}</span>
                      </td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[10px] font-bold">
                          {exp.category}
                        </span>
                      </td>
                      <td className="p-2.5 font-extrabold text-slate-800 dark:text-slate-100">{exp.description}</td>
                      <td className="p-2.5 text-slate-400 font-mono text-[10px]">{exp.receiptNumber || '-'}</td>
                      <td className="p-2.5 text-slate-500">
                        {exp.cashierName} <span className="block text-[10px] text-slate-400">{exp.outlet}</span>
                      </td>
                      <td className="p-2.5 font-black text-rose-600 dark:text-rose-400">{formatRupiah(exp.amount)}</td>
                      <td className="p-2.5 text-right">
                        <button
                          onClick={() => handleDeleteExpense(exp.id, exp.description)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: LAPORAN LABA / RUGI (PROFIT & LOSS STATEMENT) */}
      {subTab === 'profit_loss' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1a0c28] border border-slate-200 dark:border-purple-900 shadow-sm space-y-4">
            {/* Header & Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-purple-900/50 pb-4">
              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-amber-500" />
                  Laporan Laba / Rugi (Profit & Loss Statement)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Konsolidasi real-time Penjualan POS, HPP Porsi (COGS), Operasional Kas Kecil, & Gaji Karyawan.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Timeframe Mode Selector */}
                <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-purple-950 border border-slate-200 dark:border-purple-800 text-xs">
                  <button
                    onClick={() => setPnlMode('harian')}
                    className={`px-3 py-1.5 rounded-lg font-extrabold transition-all cursor-pointer ${
                      pnlMode === 'harian'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    Harian
                  </button>
                  <button
                    onClick={() => setPnlMode('mingguan')}
                    className={`px-3 py-1.5 rounded-lg font-extrabold transition-all cursor-pointer ${
                      pnlMode === 'mingguan'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    Mingguan
                  </button>
                  <button
                    onClick={() => setPnlMode('bulanan')}
                    className={`px-3 py-1.5 rounded-lg font-extrabold transition-all cursor-pointer ${
                      pnlMode === 'bulanan'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    Bulanan
                  </button>
                  <button
                    onClick={() => setPnlMode('semua')}
                    className={`px-3 py-1.5 rounded-lg font-extrabold transition-all cursor-pointer ${
                      pnlMode === 'semua'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    Semua Data
                  </button>
                </div>

                {/* Specific Picker based on mode */}
                {pnlMode === 'harian' && (
                  <input
                    type="date"
                    value={pnlDate}
                    onChange={(e) => setPnlDate(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold text-xs"
                  />
                )}

                {pnlMode === 'mingguan' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 font-bold">s/d Tanggal:</span>
                    <input
                      type="date"
                      value={pnlDate}
                      onChange={(e) => setPnlDate(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold text-xs"
                    />
                  </div>
                )}

                {pnlMode === 'bulanan' && (
                  <input
                    type="month"
                    value={pnlMonth}
                    onChange={(e) => setPnlMonth(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold text-xs"
                  />
                )}

                {/* Outlet Selector */}
                <select
                  value={selectedOutletFilter}
                  onChange={(e) => setSelectedOutletFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold text-xs"
                >
                  <option value="ALL">Semua Outlet Cabang</option>
                  {outletsList.map((out) => (
                    <option key={out} value={out}>
                      {out}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handlePrintPnlReport}
                  className="px-3 py-1.5 rounded-xl bg-purple-900 text-amber-300 dark:bg-amber-400 dark:text-purple-950 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs hover:opacity-90"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak PDF / Thermal</span>
                </button>

                <button
                  onClick={handleExportPnlExcel}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-900/60 hover:bg-purple-200 text-purple-950 dark:text-amber-300 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor Excel</span>
                </button>
              </div>

              {/* Quick Date Preset Helpers */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs w-full pt-1 border-t border-slate-100 dark:border-purple-900/30">
                <span className="text-slate-400 font-bold text-[11px]">Pilih Cepat Tanggal Laporan:</span>
                <button
                  onClick={() => {
                    setPnlMode('harian');
                    setPnlDate(todayStr);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                    pnlMode === 'harian' && pnlDate === todayStr
                      ? 'bg-amber-400 text-purple-950 border-amber-400 shadow-xs'
                      : 'bg-slate-100 dark:bg-purple-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-purple-800 hover:bg-slate-200'
                  }`}
                >
                  Hari Ini
                </button>
                <button
                  onClick={() => {
                    const yest = new Date();
                    yest.setDate(yest.getDate() - 1);
                    setPnlMode('harian');
                    setPnlDate(yest.toISOString().split('T')[0]);
                  }}
                  className="px-2.5 py-1 rounded-lg font-bold bg-slate-100 dark:bg-purple-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-purple-800 hover:bg-slate-200 dark:hover:bg-purple-900 cursor-pointer"
                >
                  Kemarin
                </button>
                <button
                  onClick={() => {
                    setPnlMode('mingguan');
                    setPnlDate(todayStr);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                    pnlMode === 'mingguan'
                      ? 'bg-amber-400 text-purple-950 border-amber-400 shadow-xs'
                      : 'bg-slate-100 dark:bg-purple-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-purple-800 hover:bg-slate-200'
                  }`}
                >
                  7 Hari Terakhir
                </button>
                <button
                  onClick={() => {
                    setPnlMode('bulanan');
                    setPnlMonth(todayStr.substring(0, 7));
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                    pnlMode === 'bulanan'
                      ? 'bg-amber-400 text-purple-950 border-amber-400 shadow-xs'
                      : 'bg-slate-100 dark:bg-purple-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-purple-800 hover:bg-slate-200'
                  }`}
                >
                  Bulan Ini
                </button>
              </div>
            </div>

            {/* P&L Key Performance Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <span className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  Pendapatan Kotor (Revenue)
                </span>
                <p className="font-black text-xl text-emerald-700 dark:text-emerald-400">
                  {formatRupiah(pnlGrossRevenue)}
                </p>
                <p className="text-[10px] text-slate-500">
                  {filteredPnlOrders.length} transaksi selesai
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <span className="text-[10px] font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                  HPP / Cost of Goods Sold (COGS)
                </span>
                <p className="font-black text-xl text-amber-700 dark:text-amber-400">
                  -{formatRupiah(pnlCogsEstimate)}
                </p>
                <p className="text-[10px] text-slate-500">
                  Laba Kotor: <strong className="text-amber-700 dark:text-amber-300">{formatRupiah(pnlGrossProfit)}</strong>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                <span className="text-[10px] font-extrabold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                  Total Beban Operasional & Gaji
                </span>
                <p className="font-black text-xl text-rose-700 dark:text-rose-400">
                  -{formatRupiah(pnlOperatingExpenses + pnlPayrollExpenses)}
                </p>
                <p className="text-[10px] text-slate-500">
                  Kas Kecil: {formatRupiah(pnlOperatingExpenses)} | Payroll: {formatRupiah(pnlPayrollExpenses)}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-950 text-white space-y-1 shadow-md">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                  Laba / Rugi Bersih (Net Profit)
                </span>
                <p className={`font-black text-xl ${pnlNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatRupiah(pnlNetProfit)}
                </p>
                <p className="text-[10px] text-purple-200">
                  Margin Bersih: <strong className="text-amber-300">{pnlProfitMargin.toFixed(1)}%</strong>
                </p>
              </div>
            </div>

            {/* Financial Statement Line Items */}
            <div className="space-y-3 pt-2">
              <h5 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">
                Laporan Rincian Pos Keuangan [{pnlMode.toUpperCase()}]
              </h5>

              {/* 1. Revenue */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-purple-950/60 border border-slate-200 dark:border-purple-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-black text-xs text-emerald-800 dark:text-emerald-300 uppercase">
                    1. PENDAPATAN PENJUALAN KOTOR (GROSS REVENUE)
                  </span>
                  <span className="font-black text-sm text-emerald-700 dark:text-emerald-400">
                    {formatRupiah(pnlGrossRevenue)}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pl-3 border-l-2 border-emerald-500">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Tunai (Cash):</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{formatRupiah(cashTotalRevenue)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">QRIS:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{formatRupiah(qrisTotalRevenue)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Transfer Bank:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{formatRupiah(transferTotalRevenue)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Debit / EDC:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{formatRupiah(debitTotalRevenue)}</span>
                  </div>
                </div>
              </div>

              {/* 2. COGS */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-purple-950/60 border border-slate-200 dark:border-purple-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-black text-xs text-amber-800 dark:text-amber-300 uppercase">
                    2. HARGA POKOK PENJUALAN (COGS / HPP PORSI)
                  </span>
                  <span className="font-black text-sm text-amber-700 dark:text-amber-400">
                    -{formatRupiah(pnlCogsEstimate)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 pl-3 border-l-2 border-amber-500">
                  Estimasi porsi penggunaan daging paha/dada ayam, marinasi 11 rempah rahasia, saus, saus keju & packaging takeaway.
                </p>
              </div>

              {/* 3. Gross Profit Summary */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex justify-between items-center font-black text-xs">
                <span className="text-amber-900 dark:text-amber-300 uppercase">3. LABA KOTOR (GROSS PROFIT)</span>
                <span className="text-sm text-amber-700 dark:text-amber-400">{formatRupiah(pnlGrossProfit)}</span>
              </div>

              {/* 4. Operating Expenses */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-purple-950/60 border border-slate-200 dark:border-purple-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-black text-xs text-rose-800 dark:text-rose-300 uppercase">
                    4. BEBAN OPERASIONAL KAS KECIL (PETTY CASH)
                  </span>
                  <span className="font-black text-sm text-rose-700 dark:text-rose-400">
                    -{formatRupiah(pnlOperatingExpenses)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 pl-3 border-l-2 border-rose-500 space-y-0.5">
                  <p>• Pembelian es batu kristal, gas LPG 3kg/12kg, perlengkapan kasir, dan kebersihan outlet.</p>
                  <p>• Total Nota Pengeluaran: {filteredPnlExpenses.length} transaksi petty cash.</p>
                </div>
              </div>

              {/* 5. Payroll Costs */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-purple-950/60 border border-slate-200 dark:border-purple-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-black text-xs text-blue-800 dark:text-blue-300 uppercase">
                    5. BEBAN GAJI & TUNJANGAN KARYAWAN (PAYROLL)
                  </span>
                  <span className="font-black text-sm text-blue-700 dark:text-blue-400">
                    -{formatRupiah(pnlPayrollExpenses)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 pl-3 border-l-2 border-blue-500">
                  Gaji harian staff, insentif kebersihan, tunjangan kedisiplinan, dan bonus omset target harian.
                </p>
              </div>

              {/* 6. Net Profit Final */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950 to-indigo-900 text-white shadow-lg space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-black text-sm text-amber-300 uppercase">
                    6. LABA / RUGI BERSIH AKHIR (NET PROFIT / LOSS)
                  </span>
                  <span className={`font-black text-2xl ${pnlNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatRupiah(pnlNetProfit)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-purple-200 pt-1">
                  <span>Persentase Margin Bersih terhadap Omset Kotor:</span>
                  <span className="font-black text-amber-400 text-sm">{pnlProfitMargin.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* SEKSI TABEL REKAPITULASI LAPORAN KEUANGAN PER CABANG / OUTLET */}
            <div className="pt-6 border-t border-slate-200 dark:border-purple-900/50 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h5 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-400 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-500" />
                    Laporan Rekapitulasi Keuangan Per Cabang / Outlet [{pnlMode.toUpperCase()}]
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Perbandingan performa omset, transaksi, HPP, beban operasional, dan laba bersih di setiap outlet cabang Steak 11.
                  </p>
                </div>

                <button
                  onClick={handlePrintPnlReport}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-900 text-amber-300 dark:bg-amber-400 dark:text-purple-950 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs hover:opacity-90"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Laporan Keuangan
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-purple-900/60 bg-white dark:bg-[#180B24] shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-purple-950/80 text-slate-800 dark:text-amber-300 font-extrabold border-b border-slate-200 dark:border-purple-900">
                      <th className="p-3.5">Nama Cabang / Outlet</th>
                      <th className="p-3.5 text-center">Jumlah Order</th>
                      <th className="p-3.5 text-right">Gross Revenue (Omset)</th>
                      <th className="p-3.5 text-right">Tunai (Cash)</th>
                      <th className="p-3.5 text-right">Non-Tunai</th>
                      <th className="p-3.5 text-right">HPP (COGS)</th>
                      <th className="p-3.5 text-right">Beban Kas Kecil</th>
                      <th className="p-3.5 text-right">Beban Payroll</th>
                      <th className="p-3.5 text-right">Laba Bersih</th>
                      <th className="p-3.5 text-center">Margin %</th>
                      <th className="p-3.5 text-center">Kinerja</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-purple-900/30 font-medium">
                    {perBranchReports.map((branch) => {
                      let statusBadge = { label: 'Stabil', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' };
                      if (branch.marginPct >= 25 && branch.netProfit > 0) {
                        statusBadge = { label: 'Profit Tinggi 🚀', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
                      } else if (branch.netProfit < 0) {
                        statusBadge = { label: 'Defisit ⚠️', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' };
                      }

                      return (
                        <tr key={branch.outletName} className="hover:bg-slate-50 dark:hover:bg-purple-950/40">
                          <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>{branch.outletName}</span>
                          </td>
                          <td className="p-3.5 text-center font-bold text-slate-700 dark:text-slate-300">
                            {branch.orderCount} pesanan
                          </td>
                          <td className="p-3.5 text-right font-black text-emerald-600 dark:text-emerald-400">
                            {formatRupiah(branch.grossRev)}
                          </td>
                          <td className="p-3.5 text-right font-semibold text-slate-700 dark:text-slate-300">
                            {formatRupiah(branch.cashRev)}
                          </td>
                          <td className="p-3.5 text-right font-semibold text-slate-700 dark:text-slate-300">
                            {formatRupiah(branch.nonCashRev)}
                          </td>
                          <td className="p-3.5 text-right font-semibold text-amber-600 dark:text-amber-400">
                            -{formatRupiah(branch.cogs)}
                          </td>
                          <td className="p-3.5 text-right font-semibold text-rose-600 dark:text-rose-400">
                            -{formatRupiah(branch.opExpenses)}
                          </td>
                          <td className="p-3.5 text-right font-semibold text-purple-600 dark:text-purple-300">
                            -{formatRupiah(branch.payrollCosts)}
                          </td>
                          <td className={`p-3.5 text-right font-black ${branch.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {formatRupiah(branch.netProfit)}
                          </td>
                          <td className="p-3.5 text-center font-extrabold text-slate-800 dark:text-slate-200">
                            {branch.marginPct.toFixed(1)}%
                          </td>
                          <td className="p-3.5 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${statusBadge.color}`}>
                              {statusBadge.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-purple-950 text-white font-black text-xs border-t-2 border-amber-400">
                      <td className="p-3.5 uppercase text-amber-300">KONSOLIDASI SELURUH CABANG</td>
                      <td className="p-3.5 text-center text-amber-300">{filteredPnlOrders.length} pesanan</td>
                      <td className="p-3.5 text-right text-emerald-400">{formatRupiah(pnlGrossRevenue)}</td>
                      <td className="p-3.5 text-right text-slate-200">{formatRupiah(cashTotalRevenue)}</td>
                      <td className="p-3.5 text-right text-slate-200">{formatRupiah(qrisTotalRevenue + transferTotalRevenue + debitTotalRevenue)}</td>
                      <td className="p-3.5 text-right text-amber-300">-{formatRupiah(pnlCogsEstimate)}</td>
                      <td className="p-3.5 text-right text-rose-300">-{formatRupiah(pnlOperatingExpenses)}</td>
                      <td className="p-3.5 text-right text-rose-300">-{formatRupiah(pnlPayrollExpenses)}</td>
                      <td className={`p-3.5 text-right ${pnlNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatRupiah(pnlNetProfit)}
                      </td>
                      <td className="p-3.5 text-center text-amber-300">{pnlProfitMargin.toFixed(1)}%</td>
                      <td className="p-3.5 text-center text-amber-300">TOTAL SYSTEM</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: BREAKDOWN METODE PEMBAYARAN */}
      {subTab === 'payment_methods' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1a0c28] border border-slate-200 dark:border-purple-900 shadow-sm space-y-5">
            {/* Header Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-purple-900/50 pb-4">
              <div>
                <h4 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-500" />
                  Breakdown Distribusi Metode Pembayaran
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Analisis perbandingan nominal transaksi, porsi persentase, dan frekuensi pesanan tunai vs. non-tunai.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-purple-950 border border-slate-200 dark:border-purple-800 text-xs">
                  <button
                    onClick={() => setPnlMode('harian')}
                    className={`px-3 py-1.5 rounded-lg font-extrabold transition-all cursor-pointer ${
                      pnlMode === 'harian'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Harian
                  </button>
                  <button
                    onClick={() => setPnlMode('mingguan')}
                    className={`px-3 py-1.5 rounded-lg font-extrabold transition-all cursor-pointer ${
                      pnlMode === 'mingguan'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Mingguan
                  </button>
                  <button
                    onClick={() => setPnlMode('bulanan')}
                    className={`px-3 py-1.5 rounded-lg font-extrabold transition-all cursor-pointer ${
                      pnlMode === 'bulanan'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Bulanan
                  </button>
                </div>

                <select
                  value={selectedOutletFilter}
                  onChange={(e) => setSelectedOutletFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold text-xs"
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

            {/* Payment Method Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* QRIS */}
              <div className="p-4 rounded-2xl bg-white dark:bg-purple-950/40 border-2 border-blue-500/30 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-blue-500" />
                    QRIS (GoPay/OVO/Shopee/BCA)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 font-black text-[10px]">
                    {qrisSharePct.toFixed(1)}%
                  </span>
                </div>
                <p className="font-black text-xl text-slate-900 dark:text-white">{formatRupiah(qrisTotalRevenue)}</p>
                <div className="w-full bg-slate-100 dark:bg-purple-900/50 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(qrisSharePct, 100)}%` }}></div>
                </div>
                <p className="text-[11px] text-slate-500">
                  {payMethodQrisOrders.length} Pesanan | Rata-rata: {payMethodQrisOrders.length > 0 ? formatRupiah(Math.round(qrisTotalRevenue / payMethodQrisOrders.length)) : 'Rp 0'}
                </p>
              </div>

              {/* Cash */}
              <div className="p-4 rounded-2xl bg-white dark:bg-purple-950/40 border-2 border-emerald-500/30 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-500" />
                    Tunai (Cash Laci)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-black text-[10px]">
                    {cashSharePct.toFixed(1)}%
                  </span>
                </div>
                <p className="font-black text-xl text-slate-900 dark:text-white">{formatRupiah(cashTotalRevenue)}</p>
                <div className="w-full bg-slate-100 dark:bg-purple-900/50 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min(cashSharePct, 100)}%` }}></div>
                </div>
                <p className="text-[11px] text-slate-500">
                  {payMethodCashOrders.length} Pesanan | Rata-rata: {payMethodCashOrders.length > 0 ? formatRupiah(Math.round(cashTotalRevenue / payMethodCashOrders.length)) : 'Rp 0'}
                </p>
              </div>

              {/* Transfer */}
              <div className="p-4 rounded-2xl bg-white dark:bg-purple-950/40 border-2 border-purple-500/30 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-xs text-purple-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-purple-500" />
                    Transfer Bank / Virtual Account
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 font-black text-[10px]">
                    {transferSharePct.toFixed(1)}%
                  </span>
                </div>
                <p className="font-black text-xl text-slate-900 dark:text-white">{formatRupiah(transferTotalRevenue)}</p>
                <div className="w-full bg-slate-100 dark:bg-purple-900/50 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min(transferSharePct, 100)}%` }}></div>
                </div>
                <p className="text-[11px] text-slate-500">
                  {payMethodTransferOrders.length} Pesanan | Rata-rata: {payMethodTransferOrders.length > 0 ? formatRupiah(Math.round(transferTotalRevenue / payMethodTransferOrders.length)) : 'Rp 0'}
                </p>
              </div>

              {/* Debit / EDC */}
              <div className="p-4 rounded-2xl bg-white dark:bg-purple-950/40 border-2 border-indigo-500/30 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-indigo-500" />
                    Kartu Debit / EDC
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-black text-[10px]">
                    {debitSharePct.toFixed(1)}%
                  </span>
                </div>
                <p className="font-black text-xl text-slate-900 dark:text-white">{formatRupiah(debitTotalRevenue)}</p>
                <div className="w-full bg-slate-100 dark:bg-purple-900/50 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min(debitSharePct, 100)}%` }}></div>
                </div>
                <p className="text-[11px] text-slate-500">
                  {payMethodDebitOrders.length} Pesanan | Rata-rata: {payMethodDebitOrders.length > 0 ? formatRupiah(Math.round(debitTotalRevenue / payMethodDebitOrders.length)) : 'Rp 0'}
                </p>
              </div>
            </div>

            {/* Filtered Order Transaction List */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h5 className="font-extrabold text-xs text-[#3D1259] dark:text-amber-400">
                  Daftar Transaksi Selesai berdasarkan Metode Pembayaran
                </h5>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400 font-bold">Filter Metode:</span>
                  <select
                    value={selectedPayMethodFilter}
                    onChange={(e) => setSelectedPayMethodFilter(e.target.value as any)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
                  >
                    <option value="ALL">Semua Metode Pembayaran</option>
                    <option value="QRIS">QRIS</option>
                    <option value="Cash">Tunai (Cash)</option>
                    <option value="Transfer">Transfer Bank</option>
                    <option value="Debit">Debit / EDC</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-500 dark:text-purple-300 font-bold">
                      <th className="p-2.5">ID Order</th>
                      <th className="p-2.5">Waktu & Tanggal</th>
                      <th className="p-2.5">Pelanggan</th>
                      <th className="p-2.5">Outlet</th>
                      <th className="p-2.5">Metode Pembayaran</th>
                      <th className="p-2.5 text-right">Total Transaksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-purple-900/50">
                    {filteredPnlOrders
                      .filter(
                        (o) =>
                          selectedPayMethodFilter === 'ALL' ||
                          (o.paymentMethod || 'Cash') === selectedPayMethodFilter
                      )
                      .map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-purple-900/30 transition-colors">
                          <td className="p-2.5 font-bold text-slate-800 dark:text-slate-100 font-mono">{ord.id}</td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-300 text-[11px]">
                            {ord.date} {ord.time ? `• ${ord.time}` : ''}
                          </td>
                          <td className="p-2.5 font-medium text-slate-800 dark:text-slate-200">{ord.customerName}</td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-300 text-[11px]">{ord.outlet}</td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded font-black text-[10px] inline-flex items-center gap-1 ${
                                ord.paymentMethod === 'QRIS'
                                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                                  : ord.paymentMethod === 'Cash'
                                  ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                              }`}
                            >
                              {ord.paymentMethod || 'Cash'}
                            </span>
                          </td>
                          <td className="p-2.5 text-right font-black text-slate-900 dark:text-white">
                            {formatRupiah(ord.total)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INPUT CLOSING SHIFT KASIR WITH DENOMINATION CALCULATOR */}
      {showClosingModal && (
        <div className="fixed inset-0 z-50 bg-purple-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1a0c28] border border-purple-900/50 rounded-2xl p-5 sm:p-6 max-w-xl w-full my-auto max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <h3 className="font-extrabold text-lg text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-500" />
              Audit & Closing Shift Kasir
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-purple-300">Nama Kasir *</label>
                  <input
                    type="text"
                    required
                    value={cashierName}
                    onChange={(e) => setCashierName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-purple-300">Pilih Shift *</label>
                  <select
                    value={shiftName}
                    onChange={(e) => setShiftName(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
                  >
                    <option value="Shift Pagi">Shift Pagi (10.00 - 15.00)</option>
                    <option value="Shift Siang">Shift Siang (12.00 - 18.00)</option>
                    <option value="Shift Malam">Shift Malam (15.00 - 22.00)</option>
                  </select>
                </div>
              </div>

              {/* Shift Summary Metrics */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-purple-950/60 border border-slate-200 dark:border-purple-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Modal Awal Laci Kasir:</span>
                  <input
                    type="number"
                    value={startingCash}
                    onChange={(e) => setStartingCash(Number(e.target.value))}
                    className="w-32 px-2 py-0.5 rounded border border-slate-300 dark:border-purple-700 text-right font-bold text-xs"
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Penjualan Tunai POS (System):</span>
                  <span className="font-bold text-emerald-600">+{formatRupiah(posCashRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kas Keluar Operasional (Petty Cash):</span>
                  <span className="font-bold text-rose-500">-{formatRupiah(totalOperationalExpenses)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-purple-800">
                  <span className="font-black text-purple-900 dark:text-amber-300">LACI KAS TEORETIS SEHARUSNYA:</span>
                  <span className="font-black text-purple-900 dark:text-amber-300">{formatRupiah(expectedCashInDrawer)}</span>
                </div>
              </div>

              {/* Physical Cash Calculation Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-700 dark:text-purple-300">
                    Hitung Fisik Kas Laci (Pecahan Uang):
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseDenominationCalc(!useDenominationCalc)}
                    className="text-[11px] text-amber-500 font-bold underline cursor-pointer"
                  >
                    {useDenominationCalc ? 'Ganti Input Langsung' : 'Gunakan Kalkulator Pecahan'}
                  </button>
                </div>

                {useDenominationCalc ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    {[
                      { key: '100000', label: 'Rp 100.000' },
                      { key: '50000', label: 'Rp 50.000' },
                      { key: '20000', label: 'Rp 20.000' },
                      { key: '10000', label: 'Rp 10.000' },
                      { key: '5000', label: 'Rp 5.000' },
                      { key: '2000', label: 'Rp 2.000' },
                      { key: '1000', label: 'Rp 1.000' },
                      { key: 'koin', label: 'Total Koin (Rp)' },
                    ].map((d) => (
                      <div key={d.key} className="space-y-1">
                        <span className="text-[10px] text-slate-600 dark:text-slate-300 font-bold block">{d.label}</span>
                        <input
                          type="number"
                          min={0}
                          value={denominations[d.key] || 0}
                          onChange={(e) =>
                            setDenominations({ ...denominations, [d.key]: Number(e.target.value) })
                          }
                          className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-purple-700 bg-white dark:bg-purple-900 text-center font-bold text-xs"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <input
                      type="number"
                      value={manualActualCash}
                      onChange={(e) => setManualActualCash(Number(e.target.value))}
                      placeholder="Masukkan total uang fisik di laci"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Audit Result Display */}
              <div className="p-3 rounded-xl bg-purple-900 text-white space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span>Hasil Hitung Fisik Laci Kasir:</span>
                  <span className="font-black text-amber-400 text-sm">{formatRupiah(calculatedActualCash)}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-purple-800">
                  <span>Selisih Kas Audit:</span>
                  <span
                    className={`font-black text-sm px-2 py-0.5 rounded ${
                      cashDifference === 0
                        ? 'bg-emerald-500 text-white'
                        : cashDifference > 0
                        ? 'bg-blue-500 text-white'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {cashDifference === 0 ? '✓ PAS / SEIMBANG' : formatRupiah(cashDifference)}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-purple-300">Catatan Kasir / Manager</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Uang fisik sesuai, uang kembalian utuh"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-purple-900">
                <button
                  type="button"
                  onClick={() => setShowClosingModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-purple-900 text-slate-700 dark:text-slate-200 font-bold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveClosingShift}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black cursor-pointer"
                >
                  Simpan Closing Shift
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INPUT PENGELUARAN KAS KECIL */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-purple-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1a0c28] border border-purple-900/50 rounded-2xl p-5 sm:p-6 max-w-md w-full my-auto max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <h3 className="font-extrabold text-lg text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
              <Receipt className="w-5 h-5 text-rose-500" />
              Catat Pengeluaran Kas Kecil Operasional
            </h3>

            <form onSubmit={handleSaveExpense} className="space-y-3 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 dark:text-purple-300">Kategori Pengeluaran *</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold"
                >
                  <option value="Pembelian Bahan Darurat">Pembelian Bahan Darurat (Es, Bumbu)</option>
                  <option value="Gas LPG">Gas LPG Kompor Grill</option>
                  <option value="Listrik & Air">Listrik & Air Operasional</option>
                  <option value="Kebersihan & Operasional">Kebersihan, Plastik & Perlengkapan</option>
                  <option value="Transport & Kurir">Transport & Kurir</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-purple-300">Deskripsi Detail *</label>
                <input
                  type="text"
                  required
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  placeholder="e.g. Beli Es Batu Kristal 3 Plastik @ Rp 7.000"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-purple-300">Nominal (Rp) *</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 dark:text-purple-300">No. Nota / Struk</label>
                  <input
                    type="text"
                    value={expReceiptNo}
                    onChange={(e) => setExpReceiptNo(e.target.value)}
                    placeholder="e.g. NOTA-88"
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-300">
                ℹ️ Pengeluaran kas kecil ini otomatis langsung memotong Saldo Laci Kasir dan diperhitungkan di Laporan Laba Rugi.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-purple-900">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-purple-900 text-slate-700 dark:text-slate-200 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black cursor-pointer"
                >
                  Simpan Pengeluaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Expense or Shift) */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C0D2B] rounded-2xl p-6 max-w-md w-full border border-red-500/30 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-3 bg-red-100 dark:bg-red-950/80 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  {deleteConfirmTarget.type === 'shift'
                    ? 'Hapus Record Audit Closing Shift?'
                    : 'Hapus Catatan Pengeluaran?'}
                </h3>
                <p className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                  {deleteConfirmTarget.desc}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-purple-950/50 p-3 rounded-xl border border-slate-200 dark:border-purple-900">
              {deleteConfirmTarget.type === 'shift'
                ? 'Tindakan ini akan menghapus catatan audit closing shift kasir secara permanen dari laporan keuangan.'
                : 'Tindakan ini akan menghapus catatan pengeluaran kas kecil dari laporan keuangan.'}
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
                onClick={executeDeleteTarget}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-extrabold text-xs hover:bg-red-700 shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
