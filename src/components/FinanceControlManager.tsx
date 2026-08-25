import React, { useState, useEffect } from 'react';
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
  BarChart3,
  Lock,
  Smartphone,
  Layers,
  Sparkles,
  Store,
  ShoppingBag,
  RefreshCw,
  Send,
  Edit
} from 'lucide-react';
import { CashierShiftRecord, PettyCashExpense, OrderItem, PayrollSlip, LocationItem, WorkShiftTemplate, MonthlyDeductionItem, Employee, EmployeeLoan } from '../types';
import { formatRupiah, isRegisteredAdmin, getStoredEmployees, getStoredEmployeeLoans, saveEmployeeLoans, getStoredMonthlyDeductions, saveMonthlyDeductions } from '../utils';
import { pullCashierShiftsFromFirestore, pullExpensesFromFirestore } from '../lib/firebaseServices';
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
  locations?: LocationItem[];
  shiftTemplates?: WorkShiftTemplate[];
  employees?: Employee[];
  employeeLoans?: EmployeeLoan[];
  setEmployeeLoans?: React.Dispatch<React.SetStateAction<EmployeeLoan[]>>;
  saveEmployeeLoansData?: (data: EmployeeLoan[]) => void;
  initialSubTab?: 'closing_audit' | 'petty_cash' | 'cash_flow' | 'monthly_net_profit' | 'payment_methods';
  activeParentTab?: 'shifts' | 'expenses' | string;
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
  currentUser,
  locations = [],
  shiftTemplates = [],
  employees: propEmployees = [],
  employeeLoans: propEmployeeLoans = [],
  setEmployeeLoans = (_: any) => {},
  saveEmployeeLoansData = (_: any) => {},
  initialSubTab,
  activeParentTab = 'shifts'
}) => {
  const [subTab, setSubTab] = useState<'closing_audit' | 'petty_cash' | 'cash_flow' | 'monthly_net_profit' | 'payment_methods'>(
    () => (activeParentTab === 'expenses' ? 'payment_methods' : (initialSubTab || 'closing_audit'))
  );

  useEffect(() => {
    if (activeParentTab === 'shifts') {
      setSubTab('closing_audit');
    } else if (activeParentTab === 'expenses' && subTab === 'closing_audit') {
      setSubTab('payment_methods');
    }
  }, [activeParentTab]);

  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  const handleSyncCloud = async () => {
    setIsSyncingCloud(true);
    try {
      const [latestShifts, latestExpenses] = await Promise.all([
        pullCashierShiftsFromFirestore(),
        pullExpensesFromFirestore()
      ]);
      if (latestShifts && Array.isArray(latestShifts)) setShifts(latestShifts);
      if (latestExpenses && Array.isArray(latestExpenses)) setExpenses(latestExpenses);
      showToast(`✅ Data Audit Closing Shift & Kas telah disinkronkan (${(latestShifts || []).length} shift)!`);
    } catch (e: any) {
      showToast('⚠️ Gagal sinkronisasi data dari Cloud Firestore.');
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Active Employees & Loans fallback
  const activeEmployeesList = propEmployees && propEmployees.length > 0 ? propEmployees : getStoredEmployees();
  const activeEmployeeLoans = propEmployeeLoans && propEmployeeLoans.length > 0 ? propEmployeeLoans : getStoredEmployeeLoans();

  // Timeframe Filters for Financial Statements (P&L & Payment Methods)
  const todayStr = new Date().toISOString().split('T')[0];
  const [pnlMode, setPnlMode] = useState<'harian' | 'mingguan' | 'bulanan' | 'semua'>('harian');
  const [pnlDate, setPnlDate] = useState<string>(todayStr);
  const [pnlMonth, setPnlMonth] = useState<string>(todayStr.substring(0, 7));

  // Payment Method Filter Tab inside Payment Method Breakdown
  const [selectedPayMethodFilter, setSelectedPayMethodFilter] = useState<'ALL' | 'QRIS' | 'Cash' | 'Transfer' | 'Debit'>('ALL');

  // Helper: Get master shift templates tailored per outlet based on Outlet & Shift Rules
  const getShiftsForOutlet = (outletName?: string): WorkShiftTemplate[] => {
    const matchedLoc = (locations || []).find(
      (l) => l.name.toLowerCase() === (outletName || '').trim().toLowerCase()
    );

    // 1. Shift Operasional Resmi dari Menu Outlet & Shift Rules
    const outletShift: WorkShiftTemplate | null = matchedLoc
      ? {
          id: `loc-shift-${matchedLoc.id}`,
          name: `Shift Operasional (${matchedLoc.startWorkTime || '14:00'} - ${matchedLoc.endWorkTime || '23:00'})`,
          startTime: matchedLoc.startWorkTime || '14:00',
          endTime: matchedLoc.endWorkTime || '23:00',
          color: 'emerald',
          outlet: matchedLoc.name,
          notes: `Shift resmi dari Aturan Shift Outlet ${matchedLoc.name}`
        }
      : null;

    // 2. Custom shift templates assigned specifically to this outlet or 'Semua Outlet'
    const customList = (shiftTemplates || []).filter((tpl) => {
      if (tpl.isOff) return false;
      if (!tpl.outlet || tpl.outlet === 'Semua Outlet') return true;
      if (outletName && tpl.outlet.toLowerCase() === outletName.toLowerCase()) return true;
      return false;
    });

    const result: WorkShiftTemplate[] = [];
    if (outletShift) result.push(outletShift);
    customList.forEach((s) => {
      if (!result.some((r) => r.id === s.id || (r.startTime === s.startTime && r.endTime === s.endTime && r.name === s.name))) {
        result.push(s);
      }
    });

    if (result.length === 0) {
      result.push({
        id: 'shift-operasional-default',
        name: 'Shift Operasional (14:00 - 23:00)',
        startTime: '14:00',
        endTime: '23:00',
        color: 'emerald',
        outlet: 'Semua Outlet'
      });
    }

    return result;
  };

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
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [closingDate, setClosingDate] = useState<string>(todayStr);
  const [auditDateFilterMode, setAuditDateFilterMode] = useState<'semua' | 'harian' | 'bulanan'>('semua');
  const [auditFilterDate, setAuditFilterDate] = useState<string>(todayStr);
  const [auditFilterMonth, setAuditFilterMonth] = useState<string>(todayStr.substring(0, 7));
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');
  const [outlet, setOutlet] = useState((locations && locations[0]?.name) || (outletsList && outletsList[0]) || 'Steak 11, Cibubur');
  const [shiftName, setShiftName] = useState<string>('Shift Operasional');
  const [cashierName, setCashierName] = useState(currentUser?.name || 'Kasir (Admin)');
  const [startingCash, setStartingCash] = useState<number>(200000);
  const [manualCashAdjustment, setManualCashAdjustment] = useState<number>(0);
  const [manualExpenseAdjustment, setManualExpenseAdjustment] = useState<number>(0);
  
  // Itemized Operational Expenses State (Pengeluaran per Item & Kasbon Karyawan)
  const [manualExpenseItems, setManualExpenseItems] = useState<{
    id: string;
    category?: string;
    description: string;
    amount: number;
    employeeId?: string;
    employeeName?: string;
  }[]>([]);
  const [tempExpenseCategory, setTempExpenseCategory] = useState<string>('Operasional Toko');
  const [tempExpenseEmployeeId, setTempExpenseEmployeeId] = useState<string>('');
  const [tempExpenseDesc, setTempExpenseDesc] = useState('');
  const [tempExpenseAmount, setTempExpenseAmount] = useState<number | ''>('');

  const [actualQrisRevenue, setActualQrisRevenue] = useState<number>(0);
  const [actualTransferRevenue, setActualTransferRevenue] = useState<number>(0);
  const [onlineFoodRevenue, setOnlineFoodRevenue] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const handleAddManualExpenseItem = () => {
    const amt = Number(tempExpenseAmount) || 0;
    if (amt <= 0) {
      showToast('⚠️ Nominal pengeluaran / kasbon harus lebih dari 0!');
      return;
    }

    if (tempExpenseCategory === 'Kasbon Karyawan') {
      if (!tempExpenseEmployeeId) {
        showToast('⚠️ Silakan pilih nama karyawan penerima kasbon!');
        return;
      }
      const selectedEmp = activeEmployeesList.find((e) => e.id === tempExpenseEmployeeId);
      if (!selectedEmp) {
        showToast('⚠️ Karyawan tidak ditemukan!');
        return;
      }

      const itemDesc = tempExpenseDesc.trim()
        ? `Kasbon ${selectedEmp.name} - ${tempExpenseDesc.trim()}`
        : `Kasbon Karyawan - ${selectedEmp.name}`;

      const newItem = {
        id: `exp-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        category: 'Kasbon Karyawan',
        description: itemDesc,
        amount: amt,
        employeeId: selectedEmp.id,
        employeeName: selectedEmp.name,
      };

      setManualExpenseItems([...manualExpenseItems, newItem]);
      setTempExpenseDesc('');
      setTempExpenseAmount('');
      setTempExpenseEmployeeId('');
      showToast(`🏷️ Kasbon "${selectedEmp.name}" (${formatRupiah(newItem.amount)}) berhasil ditambahkan & siap disinkronkan ke Menu Penggajian!`);
      return;
    }

    if (!tempExpenseDesc.trim()) {
      showToast('⚠️ Masukkan deskripsi item pengeluaran!');
      return;
    }

    const newItem = {
      id: `exp-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      category: tempExpenseCategory || 'Operasional Toko',
      description: tempExpenseDesc.trim(),
      amount: amt,
    };

    setManualExpenseItems([...manualExpenseItems, newItem]);
    setTempExpenseDesc('');
    setTempExpenseAmount('');
    showToast(`💸 Item "${newItem.description}" (${formatRupiah(newItem.amount)}) ditambahkan ke pengeluaran shift.`);
  };

  const handleRemoveManualExpenseItem = (itemId: string) => {
    const target = manualExpenseItems.find((i) => i.id === itemId);
    setManualExpenseItems(manualExpenseItems.filter((it) => it.id !== itemId));
    if (target) {
      showToast(`🗑️ Item "${target.description}" dihapus.`);
    }
  };

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
  const [expenseModalSource, setExpenseModalSource] = useState<'petty_cash' | 'cash_flow'>('petty_cash');
  const [expCategory, setExpCategory] = useState<PettyCashExpense['category']>('Pembelian Bahan Darurat');
  const [expDescription, setExpDescription] = useState('');
  const [expAmount, setExpAmount] = useState<number>(20000);
  const [expReceiptNo, setExpReceiptNo] = useState('');

  // Filters
  const [selectedOutletFilter, setSelectedOutletFilter] = useState('ALL');

  // Monthly Net Profit & Deductions State
  const [monthlyPnlMonth, setMonthlyPnlMonth] = useState<string>(todayStr.substring(0, 7));
  const [monthlyPnlOutlet, setMonthlyPnlOutlet] = useState<string>('ALL');

  // Deduction Modal State
  const [showDeductionModal, setShowDeductionModal] = useState(false);
  const [dedCategory, setDedCategory] = useState<MonthlyDeductionItem['category']>('Sewa Tempat & Gedung');
  const [dedName, setDedName] = useState('');
  const [dedAmount, setDedAmount] = useState<number>(3500000);
  const [dedOutlet, setDedOutlet] = useState<string>('Semua Cabang (Konsolidasi)');
  const [dedMonth, setDedMonth] = useState<string>(todayStr.substring(0, 7));
  const [dedNotes, setDedNotes] = useState('');

  // Stored Monthly Deductions
  const [monthlyDeductions, setMonthlyDeductions] = useState<MonthlyDeductionItem[]>(() => getStoredMonthlyDeductions());

  useEffect(() => {
    const handleDeductionsUpdate = () => {
      setMonthlyDeductions(getStoredMonthlyDeductions());
    };
    window.addEventListener('monthly_deductions_updated', handleDeductionsUpdate);
    return () => window.removeEventListener('monthly_deductions_updated', handleDeductionsUpdate);
  }, []);

  const saveMonthlyDeductionsData = (data: MonthlyDeductionItem[]) => {
    setMonthlyDeductions(data);
    saveMonthlyDeductions(data);
  };

  const handleDeleteDeduction = (id: string, name: string) => {
    const updated = monthlyDeductions.filter((d) => d.id !== id);
    saveMonthlyDeductionsData(updated);
    showToast(`🗑️ Biaya pengurang "${name}" berhasil dihapus.`);
  };

  // Compute live POS revenue for chosen outlet today (in table / overall filter)
  const todayOrders = (orders || []).filter(
    (o) => o.status === 'Selesai' && o.date === todayStr && (selectedOutletFilter === 'ALL' || o.outlet === selectedOutletFilter)
  );

  const posCashRevenue = todayOrders
    .filter((o) => (o.paymentMethod || 'Cash') === 'Cash')
    .reduce((acc, c) => acc + (c.total || 0), 0);

  const posQrisRevenue = todayOrders
    .filter((o) => o.paymentMethod === 'QRIS')
    .reduce((acc, c) => acc + (c.total || 0), 0);

  const posTransferRevenue = todayOrders
    .filter((o) => o.paymentMethod === 'Transfer')
    .reduce((acc, c) => acc + (c.total || 0), 0);

  const posTotalRevenue = posCashRevenue + posQrisRevenue + posTransferRevenue;

  // Expenses for today (in overall filter) - Kas Kecil Laci Toko
  const todayExpenses = (expenses || []).filter(
    (e) => e.date === todayStr && (selectedOutletFilter === 'ALL' || e.outlet === selectedOutletFilter) && e.source !== 'cash_flow'
  );
  const totalOperationalExpenses = todayExpenses.reduce((acc, c) => acc + (c.amount || 0), 0);

  // Compute live POS numbers for the Modal's selected outlet and selected audit date
  const effectiveClosingDate = closingDate || todayStr;
  const modalOrders = (orders || []).filter(
    (o) => o.status === 'Selesai' && o.date === effectiveClosingDate && (outlet === 'ALL' || o.outlet === outlet)
  );

  const modalPosCash = modalOrders
    .filter((o) => (o.paymentMethod || 'Cash') === 'Cash')
    .reduce((acc, c) => acc + (c.total || 0), 0);

  const modalPosQris = modalOrders
    .filter((o) => o.paymentMethod === 'QRIS')
    .reduce((acc, c) => acc + (c.total || 0), 0);

  const modalPosTransfer = modalOrders
    .filter((o) => o.paymentMethod === 'Transfer')
    .reduce((acc, c) => acc + (c.total || 0), 0);

  // Modal Kas Keluar Laci Kasir: Sinkron dari Kas Kecil & Operasional (TANPA beban manual cash flow)
  const modalExpenses = (expenses || []).filter(
    (e) => e.date === effectiveClosingDate && (outlet === 'ALL' || e.outlet === outlet) && e.source !== 'cash_flow'
  ).reduce((acc, c) => acc + (c.amount || 0), 0);

  // Denominations Total
  const denomTotal = Object.entries(denominations).reduce((acc: number, [denom, count]) => {
    const val = denom === 'koin' ? 1 : (Number(denom) || 0);
    const cnt = typeof count === 'number' ? count : (Number(count) || 0);
    return acc + (val * cnt);
  }, 0);

  const calculatedActualCash = useDenominationCalc ? denomTotal : manualActualCash;
  const effectiveCashRevenue = modalPosCash + Number(manualCashAdjustment || 0);
  const totalItemizedExpenses = manualExpenseItems.reduce((acc, itm) => acc + (Number(itm.amount) || 0), 0);
  const effectiveOperationalExpenses = modalExpenses + totalItemizedExpenses + Number(manualExpenseAdjustment || 0);
  const expectedCashInDrawer = startingCash + effectiveCashRevenue - effectiveOperationalExpenses;
  const cashDifference = calculatedActualCash - expectedCashInDrawer;

  const effectiveQris = actualQrisRevenue > 0 ? actualQrisRevenue : modalPosQris;
  const effectiveTransfer = actualTransferRevenue > 0 ? actualTransferRevenue : modalPosTransfer;
  const totalShiftRevenue = effectiveCashRevenue + effectiveQris + effectiveTransfer + Number(onlineFoodRevenue || 0);

  let auditStatus: 'Sesuai (Balance)' | 'Surplus (Lebih Kas)' | 'Defisit (Kurang Kas)' = 'Sesuai (Balance)';
  if (cashDifference > 0) auditStatus = 'Surplus (Lebih Kas)';
  if (cashDifference < 0) auditStatus = 'Defisit (Kurang Kas)';

  // Audit Closing Shift Filtered List for Table
  const filteredAuditShifts = (shifts || []).filter((s) => {
    if (selectedOutletFilter !== 'ALL' && s.outlet !== selectedOutletFilter) return false;
    if (auditDateFilterMode === 'harian' && s.date !== auditFilterDate) return false;
    if (auditDateFilterMode === 'bulanan' && (s.date || '').substring(0, 7) !== auditFilterMonth) return false;
    if (auditSearchQuery.trim()) {
      const q = auditSearchQuery.toLowerCase();
      const matchId = (s.id || '').toLowerCase().includes(q);
      const matchCashier = (s.cashierName || '').toLowerCase().includes(q);
      const matchShift = (s.shiftName || '').toLowerCase().includes(q);
      const matchOutlet = (s.outlet || '').toLowerCase().includes(q);
      if (!matchId && !matchCashier && !matchShift && !matchOutlet) return false;
    }
    return true;
  });

  const handleOpenInputClosingShift = () => {
    setEditingShiftId(null);
    const initialOutlet = (locations && locations[0]?.name) || (outletsList && outletsList[0]) || 'Steak 11, Cibubur';
    const availableShifts = getShiftsForOutlet(initialOutlet);
    setClosingDate(todayStr);
    setOutlet(initialOutlet);
    setShiftName(availableShifts[0]?.name || 'Shift Operasional');
    setCashierName(currentUser?.name || 'Kasir (Admin)');
    setStartingCash(200000);
    setManualCashAdjustment(0);
    setManualExpenseAdjustment(0);
    setManualExpenseItems([]);
    setTempExpenseDesc('');
    setTempExpenseAmount('');
    setActualQrisRevenue(0);
    setActualTransferRevenue(0);
    setOnlineFoodRevenue(0);
    setNotes('');
    setDenominations({
      '100000': 0,
      '50000': 0,
      '20000': 0,
      '10000': 0,
      '5000': 0,
      '2000': 0,
      '1000': 0,
      'koin': 0,
    });
    setManualActualCash(0);
    setUseDenominationCalc(true);
    setShowClosingModal(true);
  };

  const handleOpenEditClosingShift = (shift: CashierShiftRecord) => {
    if (checkReadOnlyPermission()) return;
    setEditingShiftId(shift.id);
    setClosingDate(shift.date);
    setOutlet(shift.outlet);
    setShiftName(shift.shiftName);
    setCashierName(shift.cashierName);
    setStartingCash(shift.startingCash);
    setManualCashAdjustment(shift.manualCashAdjustment || 0);
    setManualExpenseItems(
      (shift.expenseItems || []).map((itm, idx) => ({
        id: itm.id || `exp-item-${Date.now()}-${idx}`,
        category: itm.category,
        description: itm.description,
        amount: itm.amount,
        employeeId: itm.employeeId,
        employeeName: itm.employeeName,
      }))
    );
    setTempExpenseDesc('');
    setTempExpenseAmount('');
    setActualQrisRevenue(shift.actualQrisRevenue ?? shift.qrisRevenue ?? 0);
    setActualTransferRevenue(shift.actualTransferRevenue ?? shift.transferRevenue ?? 0);
    setOnlineFoodRevenue(shift.actualOnlineFoodRevenue ?? shift.onlineFoodRevenue ?? 0);
    setNotes(shift.notes || '');

    if (shift.denominations && Object.keys(shift.denominations).length > 0) {
      setDenominations({
        '100000': shift.denominations['100000'] || 0,
        '50000': shift.denominations['50000'] || 0,
        '20000': shift.denominations['20000'] || 0,
        '10000': shift.denominations['10000'] || 0,
        '5000': shift.denominations['5000'] || 0,
        '2000': shift.denominations['2000'] || 0,
        '1000': shift.denominations['1000'] || 0,
        'koin': shift.denominations['koin'] || 0,
      });
      setManualActualCash(shift.actualCashInDrawer || shift.actualCashTotal || 0);
      setUseDenominationCalc(true);
    } else {
      setManualActualCash(shift.actualCashInDrawer || shift.actualCashTotal || 0);
      setUseDenominationCalc(false);
    }
    setShowClosingModal(true);
  };

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

  // Payment Methods Breakdown Calculations (Synchronized with Audit Closing Shift)
  const payMethodQrisOrders = filteredPnlOrders.filter((o) => (o.paymentMethod || 'Cash') === 'QRIS');
  const payMethodCashOrders = filteredPnlOrders.filter((o) => (o.paymentMethod || 'Cash') === 'Cash');
  const payMethodTransferOrders = filteredPnlOrders.filter((o) => (o.paymentMethod || 'Cash') === 'Transfer');
  const payMethodDebitOrders = filteredPnlOrders.filter((o) => (o.paymentMethod || 'Cash') === 'Debit');

  const qrisTotalRevenue = payMethodQrisOrders.reduce((a, b) => a + (b.total || 0), 0);
  const cashTotalRevenue = payMethodCashOrders.reduce((a, b) => a + (b.total || 0), 0);
  const transferTotalRevenue = payMethodTransferOrders.reduce((a, b) => a + (b.total || 0), 0);
  const debitTotalRevenue = payMethodDebitOrders.reduce((a, b) => a + (b.total || 0), 0);

  // CASH FLOW & GROSS PROFIT CALCULATIONS
  // 1. Inflow from Closed Shifts (Total Omset Shift Terkunci - Read Only)
  const filteredCashFlowShifts = (shifts || []).filter(
    (s) =>
      isDateInPnlFilter(s.date || '') &&
      (selectedOutletFilter === 'ALL' || s.outlet === selectedOutletFilter)
  );

  const totalShiftRevenueLocked = filteredCashFlowShifts.reduce(
    (acc, s) =>
      acc + (s.totalRevenue || ((s.cashRevenue || 0) + (s.actualQrisRevenue ?? s.qrisRevenue ?? 0) + (s.actualTransferRevenue ?? s.transferRevenue ?? 0) + (s.actualOnlineFoodRevenue ?? s.onlineFoodRevenue ?? 0))),
    0
  );

  const totalShiftCashLocked = filteredCashFlowShifts.reduce((acc, s) => acc + (s.cashRevenue || 0), 0);
  const totalShiftQrisLocked = filteredCashFlowShifts.reduce((acc, s) => acc + (s.actualQrisRevenue ?? s.qrisRevenue ?? 0), 0);
  const totalShiftTransferLocked = filteredCashFlowShifts.reduce((acc, s) => acc + (s.actualTransferRevenue ?? s.transferRevenue ?? 0), 0);
  const totalShiftOnlineFoodLocked = filteredCashFlowShifts.reduce((acc, s) => acc + (s.actualOnlineFoodRevenue ?? s.onlineFoodRevenue ?? 0), 0);

  // Synchronized values with Audit Closing Shift (Priority on verified shifts, fallback to POS orders)
  const syncShiftRevenueTotal = totalShiftRevenueLocked > 0 ? totalShiftRevenueLocked : pnlGrossRevenue;
  const syncCashRevenue = totalShiftRevenueLocked > 0 ? totalShiftCashLocked : cashTotalRevenue;
  const syncQrisRevenue = totalShiftRevenueLocked > 0 ? totalShiftQrisLocked : qrisTotalRevenue;
  const syncTransferRevenue = totalShiftRevenueLocked > 0 ? totalShiftTransferLocked : transferTotalRevenue;
  const syncOnlineFoodRevenue = totalShiftRevenueLocked > 0 ? totalShiftOnlineFoodLocked : debitTotalRevenue;

  const syncCashSharePct = syncShiftRevenueTotal > 0 ? (syncCashRevenue / syncShiftRevenueTotal) * 100 : 0;
  const syncQrisSharePct = syncShiftRevenueTotal > 0 ? (syncQrisRevenue / syncShiftRevenueTotal) * 100 : 0;
  const syncTransferSharePct = syncShiftRevenueTotal > 0 ? (syncTransferRevenue / syncShiftRevenueTotal) * 100 : 0;
  const syncOnlineFoodSharePct = syncShiftRevenueTotal > 0 ? (syncOnlineFoodRevenue / syncShiftRevenueTotal) * 100 : 0;

  // 2. Outflow from Recorded Operational & Manual Expenses
  const filteredCashFlowExpenses = (expenses || []).filter(
    (e) =>
      isDateInPnlFilter(e.date || '') &&
      (selectedOutletFilter === 'ALL' || e.outlet === selectedOutletFilter)
  );

  const totalCashFlowExpenses = filteredCashFlowExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const cogsCashFlowExpenses = filteredCashFlowExpenses
    .filter(
      (e) =>
        e.category === 'Bahan Baku & HPP' ||
        e.category === 'Belanja Pasar & Sayur' ||
        e.category === 'Pembelian Bahan Darurat'
    )
    .reduce((acc, e) => acc + (e.amount || 0), 0);
  const opCashFlowExpenses = totalCashFlowExpenses - cogsCashFlowExpenses;

  // 3. Gross Profit & Cash Flow Performance
  const cashFlowGrossProfit = totalShiftRevenueLocked - totalCashFlowExpenses;
  const cashFlowMarginPct = totalShiftRevenueLocked > 0 ? (cashFlowGrossProfit / totalShiftRevenueLocked) * 100 : 0;

  // 4. Branch Comparison for Cash Flow
  const perBranchCashFlow = allKnownOutlets.map((outletName) => {
    const branchShifts = (shifts || []).filter(
      (s) => s.outlet === outletName && isDateInPnlFilter(s.date || '')
    );
    const branchExpenses = (expenses || []).filter(
      (e) => e.outlet === outletName && isDateInPnlFilter(e.date || '')
    );

    const shiftRev = branchShifts.reduce(
      (acc, s) =>
        acc + (s.totalRevenue || (s.cashRevenue + s.qrisRevenue + s.transferRevenue + (s.onlineFoodRevenue || 0))),
      0
    );
    const expTotal = branchExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    const gp = shiftRev - expTotal;
    const margin = shiftRev > 0 ? (gp / shiftRev) * 100 : 0;

    return {
      outletName,
      shiftCount: branchShifts.length,
      shiftRev,
      expTotal,
      gp,
      margin,
    };
  });

  // --- MONTHLY NET PROFIT REPORT CALCULATIONS ---
  const monthShifts = (shifts || []).filter((s) => {
    const shiftDate = s.date || '';
    const matchesMonth = shiftDate.startsWith(monthlyPnlMonth);
    const matchesOutlet = monthlyPnlOutlet === 'ALL' || s.outlet === monthlyPnlOutlet;
    return matchesMonth && matchesOutlet;
  });

  const totalMonthShiftRevenue = monthShifts.reduce(
    (acc, s) =>
      acc +
      (s.totalRevenue ||
        (s.cashRevenue || 0) +
          (s.actualQrisRevenue ?? s.qrisRevenue ?? 0) +
          (s.actualTransferRevenue ?? s.transferRevenue ?? 0) +
          (s.actualOnlineFoodRevenue ?? s.onlineFoodRevenue ?? 0)),
    0
  );
  const monthCashRev = monthShifts.reduce((acc, s) => acc + (s.cashRevenue || 0), 0);
  const monthQrisRev = monthShifts.reduce((acc, s) => acc + (s.actualQrisRevenue ?? s.qrisRevenue ?? 0), 0);
  const monthTransferRev = monthShifts.reduce((acc, s) => acc + (s.actualTransferRevenue ?? s.transferRevenue ?? 0), 0);
  const monthOnlineFoodRev = monthShifts.reduce((acc, s) => acc + (s.actualOnlineFoodRevenue ?? s.onlineFoodRevenue ?? 0), 0);

  // Month Expenses (COGS & Harian)
  const monthExpensesList = (expenses || []).filter((e) => {
    const expDate = e.date || '';
    const matchesMonth = expDate.startsWith(monthlyPnlMonth);
    const matchesOutlet = monthlyPnlOutlet === 'ALL' || e.outlet === monthlyPnlOutlet;
    return matchesMonth && matchesOutlet;
  });

  const monthCogsExpenses = monthExpensesList
    .filter(
      (e) =>
        e.category === 'Bahan Baku & HPP' ||
        e.category === 'Belanja Pasar & Sayur' ||
        e.category === 'Pembelian Bahan Darurat'
    )
    .reduce((acc, e) => acc + (e.amount || 0), 0);

  const monthGrossProfit = totalMonthShiftRevenue - monthCogsExpenses;
  const monthGrossMarginPct = totalMonthShiftRevenue > 0 ? (monthGrossProfit / totalMonthShiftRevenue) * 100 : 0;

  // Month Deductions List
  const filteredMonthDeductions = (monthlyDeductions || []).filter((d) => {
    const matchesMonth = d.month === monthlyPnlMonth;
    const matchesOutlet = monthlyPnlOutlet === 'ALL' || d.outlet === monthlyPnlOutlet || d.outlet === 'Semua Cabang (Konsolidasi)';
    return matchesMonth && matchesOutlet;
  });

  // 1. Penggajian & Bonus (Dibuat Manual Saja dari Daftar Pos Beban Pengurang)
  const manualPayrollDeductions = filteredMonthDeductions
    .filter((d) => d.category === 'Penggajian & Bonus')
    .reduce((acc, d) => acc + (d.amount || 0), 0);
  const totalMonthPayrollDeduction = manualPayrollDeductions;

  // 2. Sewa Tempat & Gedung
  const totalMonthRentDeduction = filteredMonthDeductions
    .filter((d) => d.category === 'Sewa Tempat & Gedung')
    .reduce((acc, d) => acc + (d.amount || 0), 0);

  // 3. Utilitas & Operasional Toko
  const dailyOpExpensesNonCogs = monthExpensesList
    .filter(
      (e) =>
        e.category !== 'Bahan Baku & HPP' &&
        e.category !== 'Belanja Pasar & Sayur' &&
        e.category !== 'Pembelian Bahan Darurat'
    )
    .reduce((acc, e) => acc + (e.amount || 0), 0);
  const manualOpDeductions = filteredMonthDeductions
    .filter((d) => d.category === 'Operasional & Perlengkapan' || d.category === 'Listrik, Air & Utilitas')
    .reduce((acc, d) => acc + (d.amount || 0), 0);
  const totalMonthOpDeduction = dailyOpExpensesNonCogs + manualOpDeductions;

  // 4. Marketing & Promo
  const totalMonthMarketingDeduction = filteredMonthDeductions
    .filter((d) => d.category === 'Marketing & Promo')
    .reduce((acc, d) => acc + (d.amount || 0), 0);

  // 5. Maintenance & Servis Alat
  const totalMonthMaintenanceDeduction = filteredMonthDeductions
    .filter((d) => d.category === 'Maintenance & Perbaikan')
    .reduce((acc, d) => acc + (d.amount || 0), 0);

  // 6. Beban Lain-lain & Pajak
  const totalMonthOtherDeduction = filteredMonthDeductions
    .filter(
      (d) =>
        d.category !== 'Penggajian & Bonus' &&
        d.category !== 'Sewa Tempat & Gedung' &&
        d.category !== 'Operasional & Perlengkapan' &&
        d.category !== 'Listrik, Air & Utilitas' &&
        d.category !== 'Marketing & Promo' &&
        d.category !== 'Maintenance & Perbaikan'
    )
    .reduce((acc, d) => acc + (d.amount || 0), 0);

  // TOTAL DEDUCTIONS
  const totalMonthlyAllDeductions =
    totalMonthPayrollDeduction +
    totalMonthRentDeduction +
    totalMonthOpDeduction +
    totalMonthMarketingDeduction +
    totalMonthMaintenanceDeduction +
    totalMonthOtherDeduction;

  // HASIL AKHIR: NET PROFIT / LABA BERSIH BULANAN
  const monthlyNetProfit = monthGrossProfit - totalMonthlyAllDeductions;
  const monthlyNetMarginPct = totalMonthShiftRevenue > 0 ? (monthlyNetProfit / totalMonthShiftRevenue) * 100 : 0;

  // Per Branch Monthly Summary
  const perBranchMonthlyNetProfit = allKnownOutlets.map((outletName) => {
    const branchShifts = (shifts || []).filter(
      (s) => s.outlet === outletName && (s.date || '').startsWith(monthlyPnlMonth)
    );
    const branchExpenses = (expenses || []).filter(
      (e) => e.outlet === outletName && (e.date || '').startsWith(monthlyPnlMonth)
    );
    const branchDeductions = (monthlyDeductions || []).filter(
      (d) => (d.outlet === outletName || d.outlet === 'Semua Cabang (Konsolidasi)') && d.month === monthlyPnlMonth
    );

    const shiftRev = branchShifts.reduce(
      (acc, s) =>
        acc +
        (s.totalRevenue ||
          (s.cashRevenue || 0) +
            (s.actualQrisRevenue ?? s.qrisRevenue ?? 0) +
            (s.actualTransferRevenue ?? s.transferRevenue ?? 0) +
            (s.actualOnlineFoodRevenue ?? s.onlineFoodRevenue ?? 0)),
      0
    );
    const cogsExp = branchExpenses
      .filter(
        (e) =>
          e.category === 'Bahan Baku & HPP' ||
          e.category === 'Belanja Pasar & Sayur' ||
          e.category === 'Pembelian Bahan Darurat'
      )
      .reduce((acc, e) => acc + (e.amount || 0), 0);
    const gp = shiftRev - cogsExp;

    const opExp = branchExpenses
      .filter(
        (e) =>
          e.category !== 'Bahan Baku & HPP' &&
          e.category !== 'Belanja Pasar & Sayur' &&
          e.category !== 'Pembelian Bahan Darurat'
      )
      .reduce((acc, e) => acc + (e.amount || 0), 0);
    const dedExp = branchDeductions.reduce((acc, d) => acc + (d.amount || 0), 0);
    const totalDed = opExp + dedExp;
    const netProfit = gp - totalDed;
    const netMargin = shiftRev > 0 ? (netProfit / shiftRev) * 100 : 0;

    return {
      outletName,
      shiftCount: branchShifts.length,
      shiftRev,
      cogsExp,
      gp,
      totalDed,
      netProfit,
      netMargin,
    };
  });

  // Print Monthly Net Profit Statement
  const handlePrintMonthlyNetProfitReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <html>
        <head>
          <title>Laporan Laba Rugi Bulanan (Net Profit) - Steak 11</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; color: #1e293b; max-width: 840px; margin: 0 auto; font-size: 12px; }
            .header { text-align: center; border-bottom: 2px solid #3D1259; padding-bottom: 12px; margin-bottom: 16px; }
            .header h2 { margin: 0; color: #3D1259; font-size: 20px; }
            .header p { margin: 4px 0 0; color: #64748b; font-size: 12px; }
            .meta-bar { display: flex; justify-content: space-between; background: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid #cbd5e1; margin-bottom: 16px; font-weight: bold; font-size: 11px; }
            .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
            .card { padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; background: #f8fafc; }
            .card .label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold; }
            .card .val { font-size: 16px; font-weight: 800; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
            th { background: #f1f5f9; font-weight: bold; color: #334155; }
            .text-right { text-align: right; }
            .bold { font-weight: bold; }
            .footer { margin-top: 30px; display: flex; justify-content: space-between; text-align: center; font-size: 11px; }
            .sign { margin-top: 45px; border-top: 1px solid #000; width: 140px; padding-top: 4px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>STEAK 11 — MYTHIC CHICKEN TASTE</h2>
            <h4 style="margin:4px 0; color:#475569;">LAPORAN LABA / RUGI BERSIH BULANAN (MONTHLY NET PROFIT STATEMENT)</h4>
          </div>

          <div class="meta-bar">
            <span>PERIODE BULAN: ${monthlyPnlMonth}</span>
            <span>OUTLET: ${monthlyPnlOutlet === 'ALL' ? 'Semua Cabang (Konsolidasi)' : monthlyPnlOutlet}</span>
            <span>TANGGAL CETAK: ${new Date().toLocaleString('id-ID')}</span>
          </div>

          <div class="grid">
            <div class="card" style="border-left: 4px solid #3b82f6;">
              <div class="label">Total Omset Bulanan</div>
              <div class="val" style="color: #1d4ed8;">${formatRupiah(totalMonthShiftRevenue)}</div>
            </div>
            <div class="card" style="border-left: 4px solid #10b981;">
              <div class="label">Total Gross Profit</div>
              <div class="val" style="color: #047857;">${formatRupiah(monthGrossProfit)}</div>
            </div>
            <div class="card" style="border-left: 4px solid #ef4444;">
              <div class="label">Total Biaya Pengurang</div>
              <div class="val" style="color: #b91c1c;">-${formatRupiah(totalMonthlyAllDeductions)}</div>
            </div>
            <div class="card" style="border-left: 4px solid ${monthlyNetProfit >= 0 ? '#10b981' : '#ef4444'};">
              <div class="label">Laba / Rugi Bersih</div>
              <div class="val" style="color: ${monthlyNetProfit >= 0 ? '#047857' : '#b91c1c'};">${formatRupiah(monthlyNetProfit)}</div>
            </div>
          </div>

          <h4 style="margin: 15px 0 6px; color: #3D1259;">1. Rincian Laba Kotor (Gross Profit)</h4>
          <table>
            <thead>
              <tr><th>Komponen Pendapatan & HPP</th><th class="text-right">Nominal (Rp)</th></tr>
            </thead>
            <tbody>
              <tr><td>• Penjualan Tunai POS</td><td class="text-right bold text-emerald-600">+${formatRupiah(monthCashRev)}</td></tr>
              <tr><td>• Penerimaan QRIS</td><td class="text-right bold text-blue-600">+${formatRupiah(monthQrisRev)}</td></tr>
              <tr><td>• Penerimaan Transfer Bank</td><td class="text-right bold text-blue-600">+${formatRupiah(monthTransferRev)}</td></tr>
              <tr><td>• Penjualan Online Food (GoFood/Grab/Shopee)</td><td class="text-right bold text-orange-600">+${formatRupiah(monthOnlineFoodRev)}</td></tr>
              <tr style="background:#f8fafc; font-weight:bold;"><td>TOTAL OMSET BULANAN (LOCKED SHIFT REVENUE)</td><td class="text-right">${formatRupiah(totalMonthShiftRevenue)}</td></tr>
              <tr><td>• Beban HPP, Daging Ayam & Belanja Pasar</td><td class="text-right text-rose-600">-${formatRupiah(monthCogsExpenses)}</td></tr>
              <tr style="background:#ecfdf5; font-weight:bold; color:#065f46;"><td>TOTAL GROSS PROFIT BULANAN (MARGIN: ${monthGrossMarginPct.toFixed(1)}%)</td><td class="text-right">${formatRupiah(monthGrossProfit)}</td></tr>
            </tbody>
          </table>

          <h4 style="margin: 20px 0 6px; color: #3D1259;">2. Rincian Biaya Pengurang Beban Usaha Bulanan</h4>
          <table>
            <thead>
              <tr><th>Kategori Biaya Pengurang</th><th>Keterangan</th><th class="text-right">Nominal Pengurang (Rp)</th></tr>
            </thead>
            <tbody>
              <tr><td>1. Penggajian & Bonus Karyawan</td><td>Input Biaya Gaji & Bonus Manual</td><td class="text-right text-rose-600">-${formatRupiah(totalMonthPayrollDeduction)}</td></tr>
              <tr><td>2. Sewa Tempat & Gedung</td><td>Sewa Ruko, Lapak, Booth Outlet</td><td class="text-right text-rose-600">-${formatRupiah(totalMonthRentDeduction)}</td></tr>
              <tr><td>3. Utilitas & Operasional Toko</td><td>Listrik, Air, Gas LPG, Internet, Perlengkapan</td><td class="text-right text-rose-600">-${formatRupiah(totalMonthOpDeduction)}</td></tr>
              <tr><td>4. Marketing, Promo & Iklan</td><td>Ads Medsos, Banner, Campaign Promosi</td><td class="text-right text-rose-600">-${formatRupiah(totalMonthMarketingDeduction)}</td></tr>
              <tr><td>5. Maintenance & Perbaikan Alat</td><td>Servis Kompor Grill, Freezer, Kulkas, POS, AC</td><td class="text-right text-rose-600">-${formatRupiah(totalMonthMaintenanceDeduction)}</td></tr>
              <tr><td>6. Beban Lain-lain & Pajak</td><td>Pajak Restoran, Retribusi & Beban Lain</td><td class="text-right text-rose-600">-${formatRupiah(totalMonthOtherDeduction)}</td></tr>
              <tr style="background:#fee2e2; font-weight:bold; color:#991b1b;"><td colspan="2">TOTAL BIAYA PENGURANG BULANAN</td><td class="text-right">-${formatRupiah(totalMonthlyAllDeductions)}</td></tr>
            </tbody>
          </table>

          <div style="margin-top: 20px; padding: 14px; background: ${monthlyNetProfit >= 0 ? '#ecfdf5' : '#fef2f2'}; border: 2px solid ${monthlyNetProfit >= 0 ? '#10b981' : '#ef4444'}; border-radius: 8px; text-align: center;">
            <div style="font-size: 12px; font-weight: bold; color: ${monthlyNetProfit >= 0 ? '#065f46' : '#991b1b'}; text-transform: uppercase;">
              HASIL AKHIR: ${monthlyNetProfit >= 0 ? 'LABA BERSIH BULANAN (NET SURPLUS)' : 'RUGI OPERASIONAL BULANAN (NET DEFICIT)'}
            </div>
            <div style="font-size: 24px; font-weight: 900; color: ${monthlyNetProfit >= 0 ? '#047857' : '#b91c1c'}; margin: 4px 0;">
              ${formatRupiah(monthlyNetProfit)}
            </div>
            <div style="font-size: 11px; color: #64748b;">
              Margin Laba Bersih terhadap Omset Bulanan: <strong>${monthlyNetMarginPct.toFixed(2)}%</strong>
            </div>
          </div>

          <div class="footer">
            <div>
              <p>Dibuat Oleh,</p>
              <div class="sign">${currentUser?.name || 'Staff Finance'}</div>
            </div>
            <div>
              <p>Diperiksa Oleh,</p>
              <div class="sign">Accounting Manager</div>
            </div>
            <div>
              <p>Disetujui Oleh,</p>
              <div class="sign">Owner / Direktur Utama</div>
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

  // Export Monthly Net Profit to Excel
  const handleExportMonthlyNetProfitExcel = () => {
    const wb = XLSX.utils.book_new();

    const summaryData = [
      ['STEAK 11 - LAPORAN LABA / RUGI BERSIH BULANAN (NET PROFIT STATEMENT)'],
      ['Periode Bulan', monthlyPnlMonth],
      ['Filter Outlet', monthlyPnlOutlet === 'ALL' ? 'Semua Cabang (Konsolidasi)' : monthlyPnlOutlet],
      ['Tanggal Unduh', todayStr],
      [],
      ['1. TOTAL OMSET BULANAN (LOCKED SHIFT REVENUE)', totalMonthShiftRevenue, 'Rekapitulasi Seluruh Shift Kasir Terkunci'],
      ['  • Penjualan Tunai POS', monthCashRev, ''],
      ['  • Penerimaan QRIS', monthQrisRev, ''],
      ['  • Penerimaan Transfer Bank', monthTransferRev, ''],
      ['  • Penjualan Kanal Online Food', monthOnlineFoodRev, ''],
      ['2. HARGA POKOK PENJUALAN (HPP & BAHAN BAKU)', -monthCogsExpenses, 'Daging Ayam, Sosis, Telur & Belanja Pasar'],
      ['3. TOTAL GROSS PROFIT BULANAN', monthGrossProfit, `${monthGrossMarginPct.toFixed(2)}% Gross Margin`],
      [],
      ['4. BIAYA PENGURANG BEBAN USAHA BULANAN', -totalMonthlyAllDeductions, 'Total Beban Operasional, Gaji, Sewa, dll.'],
      ['  • Penggajian & Bonus Karyawan', -totalMonthPayrollDeduction, 'Input Beban Gaji & Bonus Manual'],
      ['  • Sewa Tempat & Gedung Outlet', -totalMonthRentDeduction, 'Sewa Ruko / Lapak Cabang'],
      ['  • Listrik, Air, Gas & Operasional Toko', -totalMonthOpDeduction, 'Utilitas & Belanja Toko'],
      ['  • Marketing, Iklan & Promo', -totalMonthMarketingDeduction, 'Ads & Campaign'],
      ['  • Maintenance & Servis Peralatan', -totalMonthMaintenanceDeduction, 'Grill, Kulkas, Freezer, dll.'],
      ['  • Beban Pajak & Lain-lain', -totalMonthOtherDeduction, ''],
      [],
      ['5. LABA / RUGI BERSIH BULANAN (NET PROFIT)', monthlyNetProfit, monthlyNetProfit >= 0 ? 'SURPLUS LABA' : 'DEFISIT RUGI'],
      ['NET PROFIT MARGIN (%)', `${monthlyNetMarginPct.toFixed(2)}%`, 'Margin Bersih terhadap Omset Bulanan'],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Laba Rugi');

    const dedData = [
      ['ID Beban', 'Bulan', 'Kategori', 'Nama Biaya Pengurang', 'Alokasi Outlet Cabang', 'Nominal (Rp)', 'Catatan'],
      ...filteredMonthDeductions.map((d) => [
        d.id,
        d.month,
        d.category,
        d.name,
        d.outlet,
        d.amount,
        d.notes || '-',
      ]),
    ];
    const wsDed = XLSX.utils.aoa_to_sheet(dedData);
    XLSX.utils.book_append_sheet(wb, wsDed, 'Rincian Biaya Pengurang');

    const branchData = [
      ['Nama Outlet Cabang', 'Jumlah Shift', 'Omset Shift Bulanan (Rp)', 'Beban HPP (Rp)', 'Gross Profit (Rp)', 'Total Beban Pengurang (Rp)', 'Laba / Rugi Bersih (Rp)', 'Net Margin (%)'],
      ...perBranchMonthlyNetProfit.map((b) => [
        b.outletName,
        b.shiftCount,
        b.shiftRev,
        b.cogsExp,
        b.gp,
        b.totalDed,
        b.netProfit,
        `${b.netMargin.toFixed(2)}%`,
      ]),
    ];
    const wsBranch = XLSX.utils.aoa_to_sheet(branchData);
    XLSX.utils.book_append_sheet(wb, wsBranch, 'Performa Cabang Bulanan');

    XLSX.writeFile(wb, `Laporan_Laba_Rugi_Bulanan_${monthlyPnlMonth}_Steak11.xlsx`);
    showToast('📊 File Excel Laporan Laba/Rugi Bulanan berhasil diunduh!');
  };

  // Print Payment Methods Statement
  const handlePrintPaymentMethodsReport = () => {
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

    const content = `
      <html>
        <head>
          <title>Laporan Breakdown Metode Pembayaran - Steak 11</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; color: #1e293b; max-width: 820px; margin: 0 auto; font-size: 12px; }
            .header { text-align: center; border-bottom: 2px solid #3D1259; padding-bottom: 12px; margin-bottom: 16px; }
            .header h2 { margin: 0; color: #3D1259; font-size: 20px; }
            .header p { margin: 4px 0 0; color: #64748b; font-size: 12px; }
            .meta-bar { display: flex; justify-content: space-between; background: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid #cbd5e1; margin-bottom: 16px; font-weight: bold; font-size: 11px; }
            .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
            .card { padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; background: #f8fafc; }
            .card .label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold; }
            .card .val { font-size: 16px; font-weight: 800; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
            th { background: #f1f5f9; font-weight: bold; color: #334155; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .bold { font-weight: bold; }
            .footer { margin-top: 30px; display: flex; justify-content: space-between; text-align: center; font-size: 11px; }
            .sign { margin-top: 45px; border-top: 1px solid #000; width: 140px; padding-top: 4px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>STEAK 11 — MYTHIC CHICKEN TASTE</h2>
            <h4 style="margin:4px 0; color:#475569;">LAPORAN DISTRIBUSI METODE PEMBAYARAN (AUDIT CLOSING SHIFT)</h4>
          </div>

          <div class="meta-bar">
            <span>PERIODE: ${periodLabel}</span>
            <span>FILTER OUTLET: ${selectedOutletFilter}</span>
            <span>TANGGAL CETAK: ${new Date().toLocaleString('id-ID')}</span>
          </div>

          <div class="grid">
            <div class="card" style="border-left: 4px solid #3b82f6;">
              <div class="label">QRIS (${syncQrisSharePct.toFixed(1)}%)</div>
              <div class="val" style="color: #2563eb;">${formatRupiah(syncQrisRevenue)}</div>
            </div>
            <div class="card" style="border-left: 4px solid #10b981;">
              <div class="label">Tunai (${syncCashSharePct.toFixed(1)}%)</div>
              <div class="val" style="color: #059669;">${formatRupiah(syncCashRevenue)}</div>
            </div>
            <div class="card" style="border-left: 4px solid #a855f7;">
              <div class="label">Transfer (${syncTransferSharePct.toFixed(1)}%)</div>
              <div class="val" style="color: #9333ea;">${formatRupiah(syncTransferRevenue)}</div>
            </div>
            <div class="card" style="border-left: 4px solid #f97316;">
              <div class="label">Online Food (${syncOnlineFoodSharePct.toFixed(1)}%)</div>
              <div class="val" style="color: #ea580c;">${formatRupiah(syncOnlineFoodRevenue)}</div>
            </div>
          </div>

          <h4 style="margin: 15px 0 6px; color: #3D1259;">Rincian Distribusi Metode Pembayaran per Shift Closing</h4>
          <table>
            <thead>
              <tr>
                <th>ID Shift</th>
                <th>Tanggal & Shift</th>
                <th>Kasir & Outlet</th>
                <th class="text-right">Tunai (Rp)</th>
                <th class="text-right">QRIS (Rp)</th>
                <th class="text-right">Transfer (Rp)</th>
                <th class="text-right">Online Food (Rp)</th>
                <th class="text-right">Total Omset (Rp)</th>
              </tr>
            </thead>
            <tbody>
              ${filteredCashFlowShifts.map((s) => `
                <tr>
                  <td class="bold">${s.id}</td>
                  <td>${s.date} • ${s.shiftName}</td>
                  <td>${s.cashierName} (${s.outlet})</td>
                  <td class="text-right">${formatRupiah(s.cashRevenue || 0)}</td>
                  <td class="text-right">${formatRupiah(s.actualQrisRevenue ?? s.qrisRevenue ?? 0)}</td>
                  <td class="text-right">${formatRupiah(s.actualTransferRevenue ?? s.transferRevenue ?? 0)}</td>
                  <td class="text-right">${formatRupiah(s.actualOnlineFoodRevenue ?? s.onlineFoodRevenue ?? 0)}</td>
                  <td class="text-right bold">${formatRupiah(s.totalRevenue)}</td>
                </tr>
              `).join('')}
              <tr style="background:#f8fafc; font-weight:bold;">
                <td colspan="3">TOTAL KONSOLIDASI (${filteredCashFlowShifts.length} Shift)</td>
                <td class="text-right">${formatRupiah(syncCashRevenue)}</td>
                <td class="text-right">${formatRupiah(syncQrisRevenue)}</td>
                <td class="text-right">${formatRupiah(syncTransferRevenue)}</td>
                <td class="text-right">${formatRupiah(syncOnlineFoodRevenue)}</td>
                <td class="text-right" style="color:#059669;">${formatRupiah(syncShiftRevenueTotal)}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <div>
              <p>Dibuat Oleh,</p>
              <div class="sign">${currentUser?.name || 'Kasir / Finance'}</div>
            </div>
            <div>
              <p>Disetujui Oleh,</p>
              <div class="sign">Owner / Management</div>
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

  // Export Payment Methods Breakdown to Excel
  const handleExportPaymentMethodsExcel = () => {
    const wb = XLSX.utils.book_new();

    const summaryData = [
      ['STEAK 11 - LAPORAN BREAKDOWN METODE PEMBAYARAN'],
      ['Periode', pnlMode],
      ['Filter Outlet', selectedOutletFilter],
      ['Tanggal Unduh', todayStr],
      [],
      ['Metode Pembayaran', 'Nominal (Rp)', 'Porsi Persentase (%)', 'Keterangan'],
      ['1. QRIS (GoPay/OVO/Shopee/BCA)', syncQrisRevenue, `${syncQrisSharePct.toFixed(2)}%`, 'Nontunai Real-Time'],
      ['2. Tunai (Cash Laci)', syncCashRevenue, `${syncCashSharePct.toFixed(2)}%`, 'Uang Fisik Kasir'],
      ['3. Transfer Bank / VA', syncTransferRevenue, `${syncTransferSharePct.toFixed(2)}%`, 'Transfer Bank Resmi'],
      ['4. Online Food (GoFood/Grab/Shopee)', syncOnlineFoodRevenue, `${syncOnlineFoodSharePct.toFixed(2)}%`, 'Kanal Mitra Digital'],
      ['TOTAL OMSET', syncShiftRevenueTotal, '100.00%', `${filteredCashFlowShifts.length} Shift Terverifikasi`],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Metode Pembayaran');

    const shiftData = [
      ['ID Shift', 'Tanggal', 'Shift', 'Kasir', 'Outlet', 'Tunai POS (Rp)', 'QRIS (Rp)', 'Transfer Bank (Rp)', 'Online Food (Rp)', 'Total Omset (Rp)', 'Status Audit'],
      ...filteredCashFlowShifts.map((s) => [
        s.id,
        s.date,
        s.shiftName,
        s.cashierName,
        s.outlet,
        s.cashRevenue || 0,
        s.actualQrisRevenue ?? s.qrisRevenue ?? 0,
        s.actualTransferRevenue ?? s.transferRevenue ?? 0,
        s.actualOnlineFoodRevenue ?? s.onlineFoodRevenue ?? 0,
        s.totalRevenue,
        s.auditStatus || 'Sesuai',
      ]),
    ];
    const wsShift = XLSX.utils.aoa_to_sheet(shiftData);
    XLSX.utils.book_append_sheet(wb, wsShift, 'Rincian Shift Kasir');

    XLSX.writeFile(wb, `Laporan_Metode_Pembayaran_${pnlMode}_${todayStr}.xlsx`);
    showToast('📊 File Excel Breakdown Metode Pembayaran berhasil diunduh!');
  };

  // Print Cash Flow & Gross Profit Statement
  const handlePrintCashFlowReport = () => {
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

    const content = `
      <html>
        <head>
          <title>Laporan Cash Flow & Gross Profit - Steak 11</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; color: #1e293b; max-width: 820px; margin: 0 auto; font-size: 12px; }
            .header { text-align: center; border-bottom: 2px solid #3D1259; padding-bottom: 12px; margin-bottom: 16px; }
            .header h2 { margin: 0; color: #3D1259; font-size: 20px; }
            .header p { margin: 4px 0 0; color: #64748b; font-size: 12px; }
            .meta-bar { display: flex; justify-content: space-between; background: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid #cbd5e1; margin-bottom: 16px; font-weight: bold; font-size: 11px; }
            .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
            .card { padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; background: #f8fafc; }
            .card .label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold; }
            .card .val { font-size: 16px; font-weight: 800; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
            th { background: #f1f5f9; font-weight: bold; color: #334155; }
            .text-right { text-align: right; }
            .bold { font-weight: bold; }
            .footer { margin-top: 30px; display: flex; justify-content: space-between; text-align: center; font-size: 11px; }
            .sign { margin-top: 45px; border-top: 1px solid #000; width: 140px; padding-top: 4px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>STEAK 11 — MYTHIC CHICKEN TASTE</h2>
            <h4 style="margin:4px 0; color:#475569;">LAPORAN ARUS KAS & GROSS PROFIT (CASH FLOW STATEMENT)</h4>
          </div>

          <div class="meta-bar">
            <span>PERIODE: ${periodLabel}</span>
            <span>FILTER OUTLET: ${selectedOutletFilter}</span>
            <span>TANGGAL CETAK: ${new Date().toLocaleString('id-ID')}</span>
          </div>

          <div class="grid">
            <div class="card" style="border-left: 4px solid #10b981;">
              <div class="label">Total Omset Shift (Terkunci)</div>
              <div class="val" style="color: #059669;">${formatRupiah(totalShiftRevenueLocked)}</div>
            </div>
            <div class="card" style="border-left: 4px solid #ef4444;">
              <div class="label">Total Pengeluaran Beban</div>
              <div class="val" style="color: #dc2626;">-${formatRupiah(totalCashFlowExpenses)}</div>
            </div>
            <div class="card" style="border-left: 4px solid #8b5cf6;">
              <div class="label">Gross Profit (Laba Kotor)</div>
              <div class="val" style="color: ${cashFlowGrossProfit >= 0 ? '#059669' : '#dc2626'};">${formatRupiah(cashFlowGrossProfit)}</div>
            </div>
            <div class="card" style="border-left: 4px solid #3b82f6;">
              <div class="label">Gross Margin %</div>
              <div class="val" style="color: #2563eb;">${cashFlowMarginPct.toFixed(1)}%</div>
            </div>
          </div>

          <h4 style="margin-top:16px;margin-bottom:6px;color:#3D1259;">1. Rincian Penerimaan Shift Kasir (🔒 Terkunci dari Hasil Audit Closing Shift)</h4>
          <table>
            <thead>
              <tr>
                <th>ID Shift</th>
                <th>Tanggal</th>
                <th>Kasir</th>
                <th>Outlet</th>
                <th class="text-right">Tunai POS</th>
                <th class="text-right">QRIS / Transfer</th>
                <th class="text-right">Online Food</th>
                <th class="text-right">Total Omset Shift</th>
              </tr>
            </thead>
            <tbody>
              ${filteredCashFlowShifts.map(s => `
                <tr>
                  <td class="bold">${s.id}</td>
                  <td>${s.date}</td>
                  <td>${s.cashierName}</td>
                  <td>${s.outlet}</td>
                  <td class="text-right">${formatRupiah(s.cashRevenue || 0)}</td>
                  <td class="text-right">${formatRupiah((s.actualQrisRevenue ?? s.qrisRevenue ?? 0) + (s.actualTransferRevenue ?? s.transferRevenue ?? 0))}</td>
                  <td class="text-right">${formatRupiah(s.actualOnlineFoodRevenue ?? s.onlineFoodRevenue ?? 0)}</td>
                  <td class="text-right bold" style="color:#059669;">${formatRupiah(s.totalRevenue || 0)}</td>
                </tr>
              `).join('')}
              <tr style="background:#f8fafc;" class="bold">
                <td colspan="4">TOTAL OMSET SHIFT TERKUNCI</td>
                <td class="text-right">${formatRupiah(totalShiftCashLocked)}</td>
                <td class="text-right">${formatRupiah(totalShiftQrisLocked + totalShiftTransferLocked)}</td>
                <td class="text-right">${formatRupiah(totalShiftOnlineFoodLocked)}</td>
                <td class="text-right" style="color:#059669;">${formatRupiah(totalShiftRevenueLocked)}</td>
              </tr>
            </tbody>
          </table>

          <h4 style="margin-top:20px;margin-bottom:6px;color:#3D1259;">2. Rincian Pengeluaran Beban Manual & Kas Keluar</h4>
          <table>
            <thead>
              <tr>
                <th>Tanggal & Jam</th>
                <th>Kategori</th>
                <th>Deskripsi Keperluan</th>
                <th>Outlet</th>
                <th class="text-right">Nominal Pengeluaran</th>
              </tr>
            </thead>
            <tbody>
              ${filteredCashFlowExpenses.map(e => `
                <tr>
                  <td>${e.date} ${e.time || ''}</td>
                  <td><span style="background:#fee2e2;color:#991b1b;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:bold;">${e.category}</span></td>
                  <td class="bold">${e.description}</td>
                  <td>${e.outlet}</td>
                  <td class="text-right bold" style="color:#dc2626;">-${formatRupiah(e.amount)}</td>
                </tr>
              `).join('')}
              <tr style="background:#f8fafc;" class="bold">
                <td colspan="4">TOTAL PENGELUARAN BEBAN</td>
                <td class="text-right" style="color:#dc2626;">-${formatRupiah(totalCashFlowExpenses)}</td>
              </tr>
            </tbody>
          </table>

          <h4 style="margin-top:20px;margin-bottom:6px;color:#3D1259;">3. Rekapitulasi Cash Flow & Gross Profit per Cabang</h4>
          <table>
            <thead>
              <tr>
                <th>Nama Outlet</th>
                <th class="text-right">Shift Closing</th>
                <th class="text-right">Total Omset Shift (🔒)</th>
                <th class="text-right">Total Pengeluaran</th>
                <th class="text-right">Gross Profit</th>
                <th class="text-right">Margin %</th>
              </tr>
            </thead>
            <tbody>
              ${perBranchCashFlow.map(b => `
                <tr>
                  <td class="bold">${b.outletName}</td>
                  <td class="text-right">${b.shiftCount}</td>
                  <td class="text-right bold" style="color:#059669;">${formatRupiah(b.shiftRev)}</td>
                  <td class="text-right" style="color:#dc2626;">-${formatRupiah(b.expTotal)}</td>
                  <td class="text-right bold" style="color:${b.gp >= 0 ? '#059669' : '#dc2626'};">${formatRupiah(b.gp)}</td>
                  <td class="text-right">${b.margin.toFixed(1)}%</td>
                </tr>
              `).join('')}
              <tr style="background:#f8fafc;" class="bold">
                <td>KONSOLIDASI SELURUH CABANG</td>
                <td class="text-right">${filteredCashFlowShifts.length}</td>
                <td class="text-right" style="color:#059669;">${formatRupiah(totalShiftRevenueLocked)}</td>
                <td class="text-right" style="color:#dc2626;">-${formatRupiah(totalCashFlowExpenses)}</td>
                <td class="text-right" style="color:${cashFlowGrossProfit >= 0 ? '#059669' : '#dc2626'};">${formatRupiah(cashFlowGrossProfit)}</td>
                <td class="text-right">${cashFlowMarginPct.toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <div>
              <p>Dibuat oleh (Finance/Kasir):</p>
              <div class="sign">${currentUser?.name || 'Staff Finance'}</div>
            </div>
            <div>
              <p>Diperiksa oleh (Manager):</p>
              <div class="sign">Operation Manager</div>
            </div>
            <div>
              <p>Disetujui oleh (Owner):</p>
              <div class="sign">Owner Steak 11</div>
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
    }, 400);
  };

  // Export Cash Flow Statement to Excel
  const handleExportCashFlowExcel = () => {
    const wb = XLSX.utils.book_new();

    const summaryData = [
      ['STEAK 11 - LAPORAN CASH FLOW & GROSS PROFIT'],
      ['Periode', `${pnlMode.toUpperCase()} (${pnlMode === 'harian' ? pnlDate : pnlMode === 'bulanan' ? pnlMonth : 'Semua Data'})`],
      ['Filter Cabang', selectedOutletFilter],
      ['Waktu Cetak', new Date().toLocaleString('id-ID')],
      [],
      ['INDIKATOR ARUS KAS', 'NOMINAL (RP)', 'KETERANGAN'],
      ['1. Total Omset Shift Masuk (Terkunci)', totalShiftRevenueLocked, `Otomatis dari ${filteredCashFlowShifts.length} Shift Closing Kasir`],
      ['  • Penerimaan Tunai POS', totalShiftCashLocked, 'Kas Masuk Laci'],
      ['  • Penerimaan QRIS & Transfer', totalShiftQrisLocked + totalShiftTransferLocked, 'Nontunai Bank'],
      ['  • Penerimaan Online Food', totalShiftOnlineFoodLocked, 'GoFood / GrabFood / ShopeeFood'],
      ['2. Total Pengeluaran Beban Manual', -totalCashFlowExpenses, `${filteredCashFlowExpenses.length} Transaksi Pengeluaran Dicatat`],
      ['  • Pembelian Bahan Baku & HPP', -cogsCashFlowExpenses, 'Belanja Daging, Bahan, & Sayur'],
      ['  • Operasional & Beban Lainnya', -opCashFlowExpenses, 'Gas, Listrik, Toko, & Maintenance'],
      ['3. GROSS PROFIT (LABA KOTOR CASH FLOW)', cashFlowGrossProfit, cashFlowGrossProfit >= 0 ? 'Surplus Arus Kas' : 'Defisit Arus Kas'],
      ['GROSS PROFIT MARGIN (%)', `${cashFlowMarginPct.toFixed(2)}%`, 'Margin Bersih terhadap Omset Shift'],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Cash Flow');

    const shiftData = [
      ['ID Shift', 'Tanggal', 'Kasir', 'Outlet Cabang', 'Tunai POS (Rp)', 'QRIS (Rp)', 'Transfer (Rp)', 'Online Food (Rp)', 'Total Omset Shift Terkunci (Rp)', 'Status Audit'],
      ...filteredCashFlowShifts.map((s) => [
        s.id,
        s.date,
        s.cashierName,
        s.outlet,
        s.cashRevenue || 0,
        s.actualQrisRevenue ?? s.qrisRevenue ?? 0,
        s.actualTransferRevenue ?? s.transferRevenue ?? 0,
        s.actualOnlineFoodRevenue ?? s.onlineFoodRevenue ?? 0,
        s.totalRevenue || 0,
        s.auditStatus || 'Sesuai',
      ]),
    ];
    const wsShift = XLSX.utils.aoa_to_sheet(shiftData);
    XLSX.utils.book_append_sheet(wb, wsShift, 'Omset Shift Terkunci');

    const expData = [
      ['ID Pengeluaran', 'Tanggal', 'Jam', 'Kategori', 'Deskripsi Keperluan', 'No. Nota', 'Kasir / PIC', 'Outlet', 'Nominal Pengeluaran (Rp)'],
      ...filteredCashFlowExpenses.map((e) => [
        e.id,
        e.date,
        e.time || '',
        e.category,
        e.description,
        e.receiptNumber || '',
        e.cashierName,
        e.outlet,
        e.amount,
      ]),
    ];
    const wsExp = XLSX.utils.aoa_to_sheet(expData);
    XLSX.utils.book_append_sheet(wb, wsExp, 'Rincian Pengeluaran');

    const branchData = [
      ['Nama Outlet Cabang', 'Jumlah Shift Closing', 'Total Omset Shift Terkunci (Rp)', 'Total Pengeluaran (Rp)', 'Gross Profit (Rp)', 'Gross Margin (%)'],
      ...perBranchCashFlow.map((b) => [
        b.outletName,
        b.shiftCount,
        b.shiftRev,
        b.expTotal,
        b.gp,
        `${b.margin.toFixed(2)}%`,
      ]),
    ];
    const wsBranch = XLSX.utils.aoa_to_sheet(branchData);
    XLSX.utils.book_append_sheet(wb, wsBranch, 'Performa Cabang');

    XLSX.writeFile(wb, `Laporan_Cash_Flow_Gross_Profit_${pnlMode}_${todayStr}.xlsx`);
    showToast('📊 File Excel Laporan Cash Flow & Gross Profit berhasil diunduh!');
  };

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

  // Send Closing Shift Report to WhatsApp 081223233299
  const handleSendClosingShiftWhatsApp = (shift: CashierShiftRecord) => {
    const targetWaNumber = '6281223233299';
    let waMessage = `*LAPORAN AUDIT & CLOSING SHIFT KASIR*\n`;
    waMessage += `*STEAK 11 - MYTHIC CHICKEN TASTE*\n`;
    waMessage += `━━━━━━━━━━━━━━━━━━━━━\n`;
    waMessage += `📌 *No. Audit Shift*: ${shift.id}\n`;
    waMessage += `🏢 *Outlet*: ${shift.outlet}\n`;
    waMessage += `📅 *Tanggal*: ${shift.date} (${shift.closedAt || 'WIB'})\n`;
    waMessage += `👤 *Kasir*: ${shift.cashierName}\n`;
    waMessage += `🏷️ *Shift*: ${shift.shiftName}\n\n`;

    waMessage += `💵 *RINGKASAN OMSET SHIFT*:\n`;
    waMessage += `• Modal Awal Laci: ${formatRupiah(shift.startingCash)}\n`;
    waMessage += `• Kasir Tunai (Cash): ${formatRupiah(shift.cashRevenue)}\n`;
    waMessage += `• QRIS: ${formatRupiah(shift.qrisRevenue || shift.actualQrisRevenue || 0)}\n`;
    waMessage += `• Transfer Bank: ${formatRupiah(shift.transferRevenue || shift.actualTransferRevenue || 0)}\n`;
    if (shift.onlineFoodRevenue) {
      waMessage += `• Online Food: ${formatRupiah(shift.onlineFoodRevenue)}\n`;
    }
    waMessage += `👉 *TOTAL OMSET*: *${formatRupiah(shift.totalRevenue)}*\n\n`;

    waMessage += `💸 *PENGELUARAN OPERASIONAL*:\n`;
    waMessage += `• Total Kas Keluar: ${formatRupiah(shift.operationalExpenses || 0)}\n`;
    if (shift.expenseItems && shift.expenseItems.length > 0) {
      shift.expenseItems.forEach((itm, idx) => {
        waMessage += `  ${idx + 1}. ${itm.description} (${itm.category || 'Kas Keluar'}): ${formatRupiah(itm.amount)}\n`;
      });
    }
    waMessage += `\n`;

    waMessage += `💼 *AUDIT FISIK LACI KAS*:\n`;
    waMessage += `• Laci Teoretis (Sistem): ${formatRupiah(shift.expectedCashInDrawer || 0)}\n`;
    waMessage += `• Hitung Fisik Kasir: ${formatRupiah(shift.actualCashInDrawer || shift.actualCashTotal || 0)}\n`;
    waMessage += `• Selisih Kas: *${formatRupiah(shift.cashDifference || 0)}*\n`;
    waMessage += `• Status Audit: *${shift.auditStatus || 'Sesuai (Balance)'}*\n\n`;

    if (shift.notes) {
      waMessage += `📝 *Catatan Kasir*: ${shift.notes}\n\n`;
    }

    waMessage += `━━━━━━━━━━━━━━━━━━━━━\n`;
    waMessage += `_Laporan otomatis terkirim dari Sistem POS Steak 11._`;

    const waUrl = `https://wa.me/${targetWaNumber}?text=${encodeURIComponent(waMessage)}`;
    window.open(waUrl, '_blank');
  };

  const isReadOnlyVisitor = currentUser?.role?.toLowerCase() === 'pengunjung' || currentUser?.role?.toLowerCase().includes('visitor');
  const checkReadOnlyPermission = (): boolean => {
    if (isReadOnlyVisitor) {
      showToast('🔒 Akses Ditolak: Hanya Pengguna Terdaftar yang memiliki izin untuk Edit & Hapus data.');
      return true;
    }
    return false;
  };

  // Handle Save Closing Shift
  const handleSaveClosingShift = () => {
    if (checkReadOnlyPermission()) return;

    const effectiveDate = closingDate || todayStr;
    const datePrefix = `SHF-${effectiveDate.replace(/-/g, '')}`;
    const nextSeq = String((shifts || []).filter(s => s.id && s.id.startsWith(datePrefix)).length + 1).padStart(2, '0');
    let generatedId = `${datePrefix}-${nextSeq}`;
    if ((shifts || []).some(s => s.id === generatedId)) {
      generatedId = `${datePrefix}-${Date.now().toString().slice(-4)}`;
    }

    const shiftIdToSave = editingShiftId || generatedId;

    const newShift: CashierShiftRecord = {
      id: shiftIdToSave,
      date: effectiveDate,
      shiftName,
      cashierName: currentUser?.name || cashierName,
      outlet,
      startingCash,
      cashRevenue: effectiveCashRevenue,
      qrisRevenue: effectiveQris,
      transferRevenue: effectiveTransfer,
      onlineFoodRevenue: Number(onlineFoodRevenue || 0),
      actualQrisRevenue: effectiveQris,
      actualTransferRevenue: effectiveTransfer,
      actualOnlineFoodRevenue: Number(onlineFoodRevenue || 0),
      totalRevenue: totalShiftRevenue,
      operationalExpenses: effectiveOperationalExpenses,
      manualCashAdjustment: Number(manualCashAdjustment || 0),
      manualExpenseAdjustment: totalItemizedExpenses + Number(manualExpenseAdjustment || 0),
      expenseItems: manualExpenseItems.length > 0 ? manualExpenseItems : undefined,
      expectedCashInDrawer,
      actualCashInDrawer: calculatedActualCash,
      systemCashTotal: startingCash + effectiveCashRevenue,
      actualCashTotal: calculatedActualCash,
      cashDifference,
      auditStatus,
      notes: notes.trim() || 'Closing shift tercatat otomatis.',
      status: 'Closed',
      closedAt: editingShiftId
        ? (shifts.find((s) => s.id === editingShiftId)?.closedAt || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }))
        : new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      denominations,
    };

    const updated = editingShiftId
      ? (shifts || []).map((s) => (s.id === editingShiftId ? newShift : s))
      : [newShift, ...(shifts || []).filter(s => s.id !== generatedId)];

    setShifts(updated);
    saveShiftsData(updated);
    try {
      localStorage.setItem('steak11_cashier_shifts', JSON.stringify(updated));
    } catch {}

    // 1. Sinkronisasi Otomatis Pengeluaran per Item Closing Kasir ke Daftar Kas Kecil & Operasional
    const newPettyExpenses: PettyCashExpense[] = manualExpenseItems.map((itm, idx) => ({
      id: `EXP-${effectiveDate.replace(/-/g, '')}-${Date.now().toString().slice(-4)}-${idx + 1}`,
      date: effectiveDate,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      outlet,
      cashierName: currentUser?.name || cashierName,
      category: itm.category === 'Kasbon Karyawan' ? 'Gaji & Bonus Harian' : (itm.category || 'Pembelian Bahan Darurat'),
      description: itm.description,
      amount: itm.amount,
      shiftId: newShift.id,
      approvedBy: currentUser?.name || 'Kasir',
      source: 'petty_cash',
    }));

    if (newPettyExpenses.length > 0) {
      const updatedExpenses = [...newPettyExpenses, ...expenses];
      setExpenses(updatedExpenses);
      saveExpensesData(updatedExpenses);
      try {
        localStorage.setItem('steak11_expenses', JSON.stringify(updatedExpenses));
      } catch {}
    }

    // 2. Sinkronisasi Otomatis Kasbon Karyawan ke Menu Penggajian (Employee Loan Ledger)
    const kasbonItems = manualExpenseItems.filter(
      (itm) => itm.category === 'Kasbon Karyawan' || Boolean(itm.employeeId)
    );

    if (kasbonItems.length > 0) {
      let currentLoans: EmployeeLoan[] =
        propEmployeeLoans && propEmployeeLoans.length > 0 ? [...propEmployeeLoans] : getStoredEmployeeLoans();

      kasbonItems.forEach((itm, idx) => {
        const empId = itm.employeeId || '';
        const empName = itm.employeeName || activeEmployeesList.find((e) => e.id === empId)?.name || 'Karyawan';

        const existingActiveLoanIndex = currentLoans.findIndex(
          (l) => l.employeeId === empId && l.status === 'ACTIVE' && l.remainingAmount > 0
        );

        if (existingActiveLoanIndex >= 0) {
          const existingLoan = currentLoans[existingActiveLoanIndex];
          const updatedTotal = existingLoan.totalAmount + itm.amount;
          const updatedRemaining = existingLoan.remainingAmount + itm.amount;
          const updatedNotes = `${existingLoan.notes || ''} | +Kasbon Shift ${shiftName} (${effectiveDate}): ${formatRupiah(itm.amount)}`;

          currentLoans[existingActiveLoanIndex] = {
            ...existingLoan,
            totalAmount: updatedTotal,
            remainingAmount: updatedRemaining,
            notes: updatedNotes,
          };
        } else {
          const newLoan: EmployeeLoan = {
            id: `LOAN-${effectiveDate.replace(/-/g, '')}-${Date.now().toString().slice(-4)}-${idx + 1}`,
            employeeId: empId,
            employeeName: empName,
            outlet,
            date: effectiveDate,
            totalAmount: itm.amount,
            monthlyInstallment: itm.amount,
            remainingAmount: itm.amount,
            status: 'ACTIVE',
            notes: `Kasbon Shift Kasir ${shiftName} (${effectiveDate}) - ${itm.description}`,
            history: [],
          };
          currentLoans = [newLoan, ...currentLoans];
        }
      });

      saveEmployeeLoans(currentLoans);
      saveEmployeeLoansData(currentLoans);
      setEmployeeLoans(currentLoans);

      try {
        window.dispatchEvent(new CustomEvent('steak11_loans_updated', { detail: currentLoans }));
      } catch {}
    }

    setShowClosingModal(false);
    const isEdit = Boolean(editingShiftId);
    setEditingShiftId(null);
    const kasbonCount = kasbonItems.length;
    showToast(
      `✅ ${isEdit ? 'Perubahan data' : 'Data'} Closing Shift Kasir ${newShift.id} berhasil disimpan!${
        kasbonCount > 0 ? ` ${kasbonCount} Kasbon Karyawan otomatis disinkronkan ke Menu Penggajian.` : ''
      } Mengarahkan ke WhatsApp 081223233299...`
    );

    // Otomatis arahkan pengiriman laporan ke WhatsApp 081223233299
    try {
      handleSendClosingShiftWhatsApp(newShift);
    } catch (err) {
      console.warn('Error opening WhatsApp:', err);
    }
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
      source: expenseModalSource,
    };

    const updated = [newExp, ...expenses];
    setExpenses(updated);
    saveExpensesData(updated);
    setShowExpenseModal(false);
    setExpDescription('');
    setExpAmount(20000);
    setExpReceiptNo('');
    showToast(
      expenseModalSource === 'cash_flow'
        ? `📊 Pengeluaran beban Cash Flow "${formatRupiah(expAmount)}" berhasil dicatat (tidak memotong kas laci closing).`
        : `💸 Pengeluaran kas kecil "${formatRupiah(expAmount)}" berhasil dicatat & disinkronkan!`
    );
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
          <div class="row"><span>Kasir:</span><span class="bold">${shift.cashierName} (Terkunci)</span></div>
          <div class="row"><span>Shift:</span><span>${shift.shiftName}</span></div>
          <div class="line"></div>

          <div class="row"><span>1. Modal Awal Laci:</span><span>${formatRupiah(shift.startingCash)}</span></div>
          <div class="row"><span>2. Penjualan Tunai POS:</span><span>+${formatRupiah(shift.cashRevenue)}</span></div>
          ${shift.manualCashAdjustment ? `<div class="row" style="padding-left:10px;font-size:11px;color:#555;"><span>• Penyesuaian Tunai:</span><span>${shift.manualCashAdjustment > 0 ? '+' : ''}${formatRupiah(shift.manualCashAdjustment)}</span></div>` : ''}
          <div class="row"><span>3. Kas Keluar Operasional:</span><span>-${formatRupiah(shift.operationalExpenses || 0)}</span></div>
          ${(shift.expenseItems && shift.expenseItems.length > 0)
            ? `<div style="padding-left:10px;font-size:11px;color:#555;margin:3px 0;">
                <p style="font-weight:bold;margin:2px 0;">Rincian Pengeluaran per Item:</p>
                ${shift.expenseItems.map(it => `<div class="row" style="margin:2px 0;"><span>- ${it.description}:</span><span>-${formatRupiah(it.amount)}</span></div>`).join('')}
              </div>`
            : ''
          }
          ${shift.manualExpenseAdjustment && (!shift.expenseItems || shift.expenseItems.length === 0) ? `<div class="row" style="padding-left:10px;font-size:11px;color:#555;"><span>• Penyesuaian Kas Keluar:</span><span>+${formatRupiah(shift.manualExpenseAdjustment)}</span></div>` : ''}
          <div class="line"></div>
          <div class="row highlight"><span>KAS TEORETIS SEHARUSNYA:</span><span>${formatRupiah(shift.expectedCashInDrawer || shift.systemCashTotal)}</span></div>
          <div class="row highlight"><span>HASIL HITUNG FISIK LACI:</span><span>${formatRupiah(shift.actualCashInDrawer || shift.actualCashTotal)}</span></div>
          <div class="line"></div>

          <div class="row bold">
            <span>SELISIH AUDIT KAS:</span>
            <span>${formatRupiah(shift.cashDifference)} (${shift.auditStatus || 'Sesuai'})</span>
          </div>

          <div class="line"></div>
          <p class="bold" style="margin-bottom:4px;">RINCIAN NONTUNAI & ONLINE FOOD:</p>
          <div class="row"><span>• Uang QRIS:</span><span>${formatRupiah(shift.actualQrisRevenue ?? shift.qrisRevenue)}</span></div>
          <div class="row"><span>• Uang Transfer:</span><span>${formatRupiah(shift.actualTransferRevenue ?? shift.transferRevenue)}</span></div>
          <div class="row"><span>• Online Food (Grab/GoFood):</span><span>${formatRupiah(shift.actualOnlineFoodRevenue ?? shift.onlineFoodRevenue ?? 0)}</span></div>
          <div class="line"></div>
          <div class="row bold highlight"><span>TOTAL OMSET SHIFT:</span><span>${formatRupiah(shift.totalRevenue)}</span></div>

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
      {/* Sub-Header Tabs Bar */}
      {activeParentTab === 'shifts' ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#180B24] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-500" />
              Audit Closing Shift Kasir
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              Rekonsiliasi uang fisik laci kasir, penerimaan QRIS & transfer, online food, serta rincian kas keluar operasional per shift.
            </p>
          </div>
          <button
            onClick={handleOpenInputClosingShift}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
          >
            <Calculator className="w-4 h-4" />
            <span>Input Closing Shift Kasir</span>
          </button>
        </div>
      ) : (
        /* Sub-Header Tabs for Laporan Keuangan */
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-slate-100 dark:bg-purple-950/60 border border-slate-200 dark:border-purple-900">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* 1. Breakdown Metode Pembayaran */}
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

            {/* 2. Cash Flow & Gross Profit */}
            <button
              onClick={() => setSubTab('cash_flow')}
              className={`px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                subTab === 'cash_flow'
                  ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-purple-900/40'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Cash Flow & Gross Profit</span>
            </button>

            {/* 3. Kas Kecil & Operasional */}
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

            {/* 4. Laba / Rugi Bulanan (Net Profit) */}
            <button
              onClick={() => setSubTab('monthly_net_profit')}
              className={`px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                subTab === 'monthly_net_profit'
                  ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-purple-900/40'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>Laba / Rugi Bulanan (Net Profit)</span>
            </button>
          </div>

        {subTab === 'petty_cash' && (
          <button
            onClick={() => {
              setExpenseModalSource('petty_cash');
              setShowExpenseModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Kas Kecil Laci</span>
          </button>
        )}

        {subTab === 'cash_flow' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setExpenseModalSource('cash_flow');
                setShowExpenseModal(true);
              }}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Beban Cash Flow</span>
            </button>
            <button
              onClick={handlePrintCashFlowReport}
              className="px-3 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 text-[#3D1259] dark:text-amber-300 font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
            <button
              onClick={handleExportCashFlowExcel}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
          </div>
        )}

        {subTab === 'monthly_net_profit' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setDedMonth(monthlyPnlMonth);
                setDedOutlet(monthlyPnlOutlet === 'ALL' ? 'Semua Cabang (Konsolidasi)' : monthlyPnlOutlet);
                setShowDeductionModal(true);
              }}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Biaya Pengurang</span>
            </button>
            <button
              onClick={handlePrintMonthlyNetProfitReport}
              className="px-3 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 text-[#3D1259] dark:text-amber-300 font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
            <button
              onClick={handleExportMonthlyNetProfitExcel}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
          </div>
        )}

        {subTab === 'payment_methods' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPaymentMethodsReport}
              className="px-3 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 text-[#3D1259] dark:text-amber-300 font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
            <button
              onClick={handleExportPaymentMethodsExcel}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
          </div>
        )}
      </div>
      )}

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-100 dark:border-purple-900/40">
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-400 flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-500" />
                  Riwayat Closing Shift & Audit Selisih Kas ({filteredAuditShifts.length} Shift)
                </h4>
                <button
                  type="button"
                  onClick={handleSyncCloud}
                  disabled={isSyncingCloud}
                  className="px-2 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/60 dark:hover:bg-purple-800 text-purple-900 dark:text-amber-300 font-extrabold text-[10px] inline-flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                  title="Sinkronkan ulang data dari Cloud Firestore"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncingCloud ? 'animate-spin text-purple-600 dark:text-amber-400' : ''}`} />
                  {isSyncingCloud ? 'Sinkron...' : 'Sync Cloud'}
                </button>
              </div>

              {/* Date Filter & Search Bar */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-purple-950 border border-slate-200 dark:border-purple-800 text-[11px] font-extrabold">
                  <button
                    type="button"
                    onClick={() => setAuditDateFilterMode('semua')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      auditDateFilterMode === 'semua'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuditDateFilterMode('harian')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      auditDateFilterMode === 'harian'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Harian
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuditDateFilterMode('bulanan')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      auditDateFilterMode === 'bulanan'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Bulanan
                  </button>
                </div>

                {auditDateFilterMode === 'harian' && (
                  <input
                    type="date"
                    value={auditFilterDate}
                    onChange={(e) => setAuditFilterDate(e.target.value)}
                    className="px-2.5 py-1 rounded-xl border border-slate-300 dark:border-purple-700 bg-white dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
                    title="Pilih Tanggal Audit"
                  />
                )}

                {auditDateFilterMode === 'bulanan' && (
                  <input
                    type="month"
                    value={auditFilterMonth}
                    onChange={(e) => setAuditFilterMonth(e.target.value)}
                    className="px-2.5 py-1 rounded-xl border border-slate-300 dark:border-purple-700 bg-white dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
                    title="Pilih Bulan Audit"
                  />
                )}

                <select
                  value={selectedOutletFilter}
                  onChange={(e) => setSelectedOutletFilter(e.target.value)}
                  className="px-2.5 py-1 rounded-xl border border-slate-300 dark:border-purple-700 bg-white dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
                >
                  <option value="ALL">Semua Cabang</option>
                  {allKnownOutlets.map((out) => (
                    <option key={out} value={out}>
                      {out}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={auditSearchQuery}
                  onChange={(e) => setAuditSearchQuery(e.target.value)}
                  placeholder="Cari ID / Kasir..."
                  className="w-32 sm:w-36 px-2.5 py-1 rounded-xl border border-slate-300 dark:border-purple-700 bg-white dark:bg-purple-950 text-slate-800 dark:text-slate-100 text-xs placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-500 dark:text-purple-300 font-bold">
                    <th className="p-2.5">ID & Tanggal Shift</th>
                    <th className="p-2.5">Kasir & Outlet</th>
                    <th className="p-2.5">Modal Awal</th>
                    <th className="p-2.5">Tunai POS</th>
                    <th className="p-2.5">QRIS & Trf</th>
                    <th className="p-2.5">Online Food</th>
                    <th className="p-2.5">Kas Keluar</th>
                    <th className="p-2.5">Teoretis System</th>
                    <th className="p-2.5">Fisik Laci Hitung</th>
                    <th className="p-2.5">Selisih Audit</th>
                    <th className="p-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-purple-900/50">
                  {filteredAuditShifts.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-6 text-center text-slate-400 italic">
                        Tidak ada riwayat closing shift pada periode / filter tanggal yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditShifts.map((shf) => {
                      const diff = shf.cashDifference;
                      const nonCashTotal = (shf.actualQrisRevenue ?? shf.qrisRevenue ?? 0) + (shf.actualTransferRevenue ?? shf.transferRevenue ?? 0);
                      const onlineFood = shf.actualOnlineFoodRevenue ?? shf.onlineFoodRevenue ?? 0;
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
                          <td className="p-2.5 font-bold text-blue-600 dark:text-blue-400">{formatRupiah(nonCashTotal)}</td>
                          <td className="p-2.5 font-bold text-orange-600 dark:text-orange-400">{formatRupiah(onlineFood)}</td>
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
                              onClick={() => handleOpenEditClosingShift(shf)}
                              className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                              title="Edit Data Audit Closing Shift"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleSendClosingShiftWhatsApp(shf)}
                              className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                              title="Kirim Laporan Closing Shift ke WhatsApp 081223233299"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handlePrintClosingSummary(shf)}
                              className="p-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/80 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                              title="Cetak Struk Audit Closing Shift"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteShift(shf.id, `${shf.id} - ${shf.date} (${shf.shiftName})`)}
                              className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                              title="Hapus Record Closing Shift Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
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
              <div>
                <h4 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-400 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-rose-500" />
                  Pencatatan Kas Kecil & Pengeluaran Operasional ({(expenses || []).length} Transaksi)
                </h4>
                <span className="text-[10px] text-slate-400">
                  Rekapitulasi seluruh pengeluaran kas kecil laci, operasional harian, dan beban per outlet
                </span>
              </div>

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
                    <th className="p-2.5">Kasir / PIC & Outlet</th>
                    <th className="p-2.5">Nominal</th>
                    <th className="p-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-purple-900/50">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400">
                        Belum ada data pengeluaran operasional.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-purple-900/30 transition-colors">
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">
                          {exp.date} <span className="text-[10px] text-slate-400 block">{exp.time}</span>
                        </td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[10px] font-bold">
                            {exp.category}
                          </span>
                          {exp.shiftId ? (
                            <span className="block mt-0.5 text-[9px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                              ✓ Closing: {exp.shiftId}
                            </span>
                          ) : exp.source === 'cash_flow' ? (
                            <span className="block mt-0.5 text-[9px] text-purple-600 dark:text-purple-400 font-mono font-bold">
                              📊 Beban Cash Flow
                            </span>
                          ) : null}
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
                            className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                            title="Hapus Pengeluaran"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: LAPORAN CASH FLOW & GROSS PROFIT */}
      {subTab === 'cash_flow' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1a0c28] border border-slate-200 dark:border-purple-900 shadow-sm space-y-4">
            {/* Header & Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-purple-900/50 pb-4">
              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  Laporan Cash Flow & Gross Profit (Arus Kas)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Arus masuk omset terkunci otomatis dari <strong>Audit Closing Shift</strong>, dikurangi pengeluaran beban manual untuk menghasilkan <strong>Gross Profit</strong>.
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
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="date"
                      value={pnlDate}
                      onChange={(e) => setPnlDate(e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 text-xs font-bold"
                    />
                  </div>
                )}

                {pnlMode === 'mingguan' && (
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-400 font-bold">s/d Tanggal:</span>
                    <input
                      type="date"
                      value={pnlDate}
                      onChange={(e) => setPnlDate(e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 text-xs font-bold"
                    />
                  </div>
                )}

                {pnlMode === 'bulanan' && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="month"
                      value={pnlMonth}
                      onChange={(e) => setPnlMonth(e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 text-xs font-bold"
                    />
                  </div>
                )}

                {/* Outlet Selector Filter */}
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={selectedOutletFilter}
                    onChange={(e) => setSelectedOutletFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold text-xs"
                  >
                    <option value="ALL">Semua Cabang (Konsolidasi)</option>
                    {allKnownOutlets.map((out) => (
                      <option key={out} value={out}>
                        {out}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 4 SUMMARY KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Card 1: Total Omset Shift (Terkunci) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/30 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5" /> 1. Total Omset Shift Masuk
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 font-black text-[9px] flex items-center gap-0.5" title="Nilai terkunci otomatis dari Audit Closing Shift">
                    <Lock className="w-2.5 h-2.5" /> Terkunci
                  </span>
                </div>
                <p className="font-black text-2xl text-emerald-600 dark:text-emerald-400">
                  {formatRupiah(totalShiftRevenueLocked)}
                </p>
                <div className="space-y-0.5 pt-1 border-t border-emerald-500/20 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  <div className="flex justify-between">
                    <span>• Kas Laci POS (Tunai):</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">{formatRupiah(totalShiftCashLocked)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• QRIS & Transfer Bank:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{formatRupiah(totalShiftQrisLocked + totalShiftTransferLocked)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Omset Online Food:</span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">{formatRupiah(totalShiftOnlineFoodLocked)}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Total Pengeluaran Beban Manual */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-transparent border border-rose-500/30 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-rose-800 dark:text-rose-300 flex items-center gap-1">
                    <Receipt className="w-3.5 h-3.5" /> 2. Pengeluaran Beban Manual
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold text-[9px]">
                    {filteredCashFlowExpenses.length} Transaksi
                  </span>
                </div>
                <p className="font-black text-2xl text-rose-600 dark:text-rose-400">
                  -{formatRupiah(totalCashFlowExpenses)}
                </p>
                <div className="space-y-0.5 pt-1 border-t border-rose-500/20 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  <div className="flex justify-between">
                    <span>• Bahan Baku & HPP:</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">-{formatRupiah(cogsCashFlowExpenses)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Operasional & Beban Lain:</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">-{formatRupiah(opCashFlowExpenses)}</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 italic pt-0.5">
                    <span>Mengurangi total omset kasir</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Gross Profit (Laba Kotor Cash Flow) */}
              <div className={`p-4 rounded-2xl border shadow-xs space-y-2 ${
                cashFlowGrossProfit >= 0
                  ? 'bg-gradient-to-br from-purple-500/10 via-amber-500/5 to-transparent border-purple-500/30'
                  : 'bg-gradient-to-br from-red-500/15 via-rose-500/10 to-transparent border-red-500/40'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-[#3D1259] dark:text-amber-300 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-amber-500" /> 3. Gross Profit (Arus Kas)
                  </span>
                  <span className={`px-2 py-0.5 rounded-full font-black text-[9px] ${
                    cashFlowGrossProfit >= 0
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                  }`}>
                    {cashFlowGrossProfit >= 0 ? '✓ SURPLUS ARUS KAS' : '⚠️ DEFISIT ARUS KAS'}
                  </span>
                </div>
                <p className={`font-black text-2xl ${
                  cashFlowGrossProfit >= 0 ? 'text-purple-950 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {formatRupiah(cashFlowGrossProfit)}
                </p>
                <div className="pt-1 border-t border-purple-500/20 text-[10px] text-slate-500 dark:text-slate-400">
                  <p className="font-bold text-slate-700 dark:text-slate-300">
                    Formula: Omset Shift (🔒) - Pengeluaran Beban
                  </p>
                  <span className="text-[9px] text-slate-400">Laba kotor kas riil shift operasional</span>
                </div>
              </div>

              {/* Card 4: Gross Profit Margin */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/30 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-blue-800 dark:text-blue-300 flex items-center gap-1">
                    <BarChart3 className="w-3.5 h-3.5" /> 4. Gross Margin %
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    {filteredCashFlowShifts.length} Shift
                  </span>
                </div>
                <p className="font-black text-2xl text-blue-600 dark:text-blue-400">
                  {cashFlowMarginPct.toFixed(1)}%
                </p>
                <div className="space-y-1 pt-1 border-t border-blue-500/20">
                  <div className="w-full bg-slate-200 dark:bg-purple-950 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-emerald-400 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(Math.max(cashFlowMarginPct, 0), 100)}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 block text-right">
                    Rasio Laba Kotor terhadap Omset
                  </span>
                </div>
              </div>
            </div>

            {/* DUAL COLUMN MATRIX: Shift Inflow Terkunci vs Pengeluaran Beban Manual */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
              {/* KOLOM KIRI: Penerimaan Omset per Shift (🔒 Terkunci) */}
              <div className="lg:col-span-7 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-purple-950/60 border border-emerald-200 dark:border-purple-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs text-emerald-950 dark:text-emerald-300">
                        1. Rincian Omset Shift Kasir (🔒 Terkunci)
                      </h5>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Total {filteredCashFlowShifts.length} Record Closing Shift Terverifikasi
                      </span>
                    </div>
                  </div>
                  <span className="font-black text-emerald-700 dark:text-emerald-400 text-xs">
                    +{formatRupiah(totalShiftRevenueLocked)}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-purple-900 bg-white dark:bg-purple-950/40">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-600 dark:text-purple-300 font-bold">
                        <th className="p-2.5">Shift & Tanggal</th>
                        <th className="p-2.5">Kasir & Outlet</th>
                        <th className="p-2.5 text-right">Rincian Kanal</th>
                        <th className="p-2.5 text-right">Omset Shift (🔒)</th>
                        <th className="p-2.5 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-purple-900/50">
                      {filteredCashFlowShifts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-400">
                            Belum ada record audit closing shift untuk filter ini.
                          </td>
                        </tr>
                      ) : (
                        filteredCashFlowShifts.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-purple-900/30 transition-colors">
                            <td className="p-2.5">
                              <span className="font-bold text-slate-900 dark:text-white font-mono block">{s.id}</span>
                              <span className="text-[10px] text-slate-400">{s.date} • {s.shiftName}</span>
                            </td>
                            <td className="p-2.5">
                              <span className="font-extrabold text-slate-800 dark:text-slate-200 block">{s.cashierName}</span>
                              <span className="text-[10px] text-slate-400">{s.outlet}</span>
                            </td>
                            <td className="p-2.5 text-right text-[10px] space-y-0.5">
                              <div className="text-slate-500">Tunai: <span className="font-bold text-emerald-600">{formatRupiah(s.cashRevenue)}</span></div>
                              <div className="text-slate-500">QRIS/Trf: <span className="font-bold text-blue-600">{formatRupiah((s.actualQrisRevenue ?? s.qrisRevenue ?? 0) + (s.actualTransferRevenue ?? s.transferRevenue ?? 0))}</span></div>
                              {(s.actualOnlineFoodRevenue || s.onlineFoodRevenue) ? (
                                <div className="text-slate-500">Online: <span className="font-bold text-orange-600">{formatRupiah(s.actualOnlineFoodRevenue ?? s.onlineFoodRevenue ?? 0)}</span></div>
                              ) : null}
                            </td>
                            <td className="p-2.5 text-right">
                              <div className="font-black text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-end gap-1">
                                <Lock className="w-2.5 h-2.5 text-amber-500" />
                                {formatRupiah(s.totalRevenue)}
                              </div>
                              <span className="text-[9px] text-slate-400 block">{s.auditStatus || 'Sesuai'}</span>
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => handlePrintClosingSummary(s)}
                                className="px-2 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/80 text-purple-950 dark:text-amber-300 font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer"
                                title="Cetak Struk Audit Closing Shift"
                              >
                                <Printer className="w-3 h-3" /> Struk
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* KOLOM KANAN: Pengeluaran Beban Manual */}
              <div className="lg:col-span-5 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-purple-950/60 border border-rose-200 dark:border-purple-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold">
                      <Receipt className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs text-rose-950 dark:text-rose-300">
                        2. Pengeluaran Beban Manual
                      </h5>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {filteredCashFlowExpenses.length} Pengeluaran Mengurangi Omset
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setExpenseModalSource('cash_flow');
                      setShowExpenseModal(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-[10px] flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3 h-3" /> Tambah
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-purple-900 bg-white dark:bg-purple-950/40">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-600 dark:text-purple-300 font-bold">
                        <th className="p-2.5">Kategori & Keperluan</th>
                        <th className="p-2.5">Outlet</th>
                        <th className="p-2.5 text-right">Nominal</th>
                        <th className="p-2.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-purple-900/50">
                      {filteredCashFlowExpenses.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-slate-400">
                            Belum ada pengeluaran beban manual untuk filter ini.
                          </td>
                        </tr>
                      ) : (
                        filteredCashFlowExpenses.map((exp) => (
                          <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-purple-900/30 transition-colors">
                            <td className="p-2.5">
                              <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[9px] font-bold block w-fit mb-0.5">
                                {exp.category}
                              </span>
                              <span className="font-extrabold text-slate-800 dark:text-slate-200 block">{exp.description}</span>
                              <span className="text-[10px] text-slate-400">{exp.date} {exp.time ? `• ${exp.time}` : ''}</span>
                            </td>
                            <td className="p-2.5 text-slate-600 dark:text-slate-300 text-[11px]">
                              {exp.outlet}
                              <span className="text-[9px] text-slate-400 block">{exp.cashierName}</span>
                            </td>
                            <td className="p-2.5 text-right font-black text-rose-600 dark:text-rose-400">
                              -{formatRupiah(exp.amount)}
                            </td>
                            <td className="p-2.5 text-right">
                              <button
                                onClick={() => handleDeleteExpense(exp.id, exp.description)}
                                className="p-1 rounded text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer"
                                title="Hapus pengeluaran ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* TABEL REKAPITULASI CASH FLOW & GROSS PROFIT PER CABANG OUTLET */}
            <div className="pt-3 border-t border-slate-100 dark:border-purple-900/50 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h5 className="font-extrabold text-xs text-[#3D1259] dark:text-amber-400 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-purple-500" />
                  Rekapitulasi Cash Flow & Gross Profit per Cabang Outlet
                </h5>
                <span className="text-[11px] text-slate-400">
                  Konsolidasi real-time seluruh cabang operasional
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-purple-900">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-700 dark:text-purple-300 font-bold">
                      <th className="p-2.5">Nama Outlet Cabang</th>
                      <th className="p-2.5 text-center">Jumlah Shift</th>
                      <th className="p-2.5 text-right">Total Omset Shift (🔒)</th>
                      <th className="p-2.5 text-right">Total Pengeluaran Beban</th>
                      <th className="p-2.5 text-right">Gross Profit (Arus Kas)</th>
                      <th className="p-2.5 text-center">Gross Margin %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-purple-900/50">
                    {perBranchCashFlow.map((b) => (
                      <tr key={b.outletName} className="hover:bg-slate-50 dark:hover:bg-purple-900/30 transition-colors">
                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-amber-500" />
                          {b.outletName}
                        </td>
                        <td className="p-2.5 text-center font-bold text-slate-600 dark:text-slate-300">
                          {b.shiftCount} Shift
                        </td>
                        <td className="p-2.5 text-right font-black text-emerald-600 dark:text-emerald-400">
                          {formatRupiah(b.shiftRev)}
                        </td>
                        <td className="p-2.5 text-right font-black text-rose-600 dark:text-rose-400">
                          -{formatRupiah(b.expTotal)}
                        </td>
                        <td className={`p-2.5 text-right font-black ${b.gp >= 0 ? 'text-purple-950 dark:text-amber-300' : 'text-rose-600 dark:text-rose-400'}`}>
                          {formatRupiah(b.gp)}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                            b.margin >= 40
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : b.margin >= 20
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          }`}>
                            {b.margin.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                    {/* Row Konsolidasi Total */}
                    <tr className="bg-slate-100 dark:bg-purple-950 font-black border-t-2 border-slate-300 dark:border-purple-800">
                      <td className="p-2.5 text-purple-950 dark:text-amber-300">
                        KONSOLIDASI SELURUH CABANG
                      </td>
                      <td className="p-2.5 text-center text-slate-700 dark:text-slate-300">
                        {filteredCashFlowShifts.length} Shift
                      </td>
                      <td className="p-2.5 text-right text-emerald-600 dark:text-emerald-400 text-sm">
                        {formatRupiah(totalShiftRevenueLocked)}
                      </td>
                      <td className="p-2.5 text-right text-rose-600 dark:text-rose-400 text-sm">
                        -{formatRupiah(totalCashFlowExpenses)}
                      </td>
                      <td className={`p-2.5 text-right text-sm ${cashFlowGrossProfit >= 0 ? 'text-purple-950 dark:text-amber-300' : 'text-rose-600 dark:text-rose-400'}`}>
                        {formatRupiah(cashFlowGrossProfit)}
                      </td>
                      <td className="p-2.5 text-center text-sm text-blue-600 dark:text-blue-400">
                        {cashFlowMarginPct.toFixed(1)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: REKAP BULANAN GROSS TO NET PROFIT (LABA / RUGI BERSIH) */}
      {subTab === 'monthly_net_profit' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1a0c28] border border-slate-200 dark:border-purple-900 shadow-sm space-y-5">
            {/* Header & Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-purple-900/50 pb-4">
              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  Laporan Laba / Rugi Bulanan (Gross to Net Profit)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Perhitungan komprehensif dari Total Gross Profit dikurangi pos penggajian, operasional, sewa, marketing, dan beban usaha bulanan.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Month Picker */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-purple-950 border border-slate-200 dark:border-purple-800 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-purple-500" />
                  <span className="font-bold text-slate-500">Pilih Bulan:</span>
                  <input
                    type="month"
                    value={monthlyPnlMonth}
                    onChange={(e) => setMonthlyPnlMonth(e.target.value)}
                    className="bg-transparent font-black text-[#3D1259] dark:text-amber-300 focus:outline-hidden cursor-pointer"
                  />
                </div>

                {/* Outlet Selector */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-purple-950 border border-slate-200 dark:border-purple-800 text-xs">
                  <Store className="w-3.5 h-3.5 text-purple-500" />
                  <select
                    value={monthlyPnlOutlet}
                    onChange={(e) => setMonthlyPnlOutlet(e.target.value)}
                    className="bg-transparent font-black text-[#3D1259] dark:text-amber-300 focus:outline-hidden cursor-pointer"
                  >
                    <option value="ALL">Semua Cabang (Konsolidasi)</option>
                    {allKnownOutlets.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 4 KPI CARDS: OMSET -> GROSS PROFIT -> DEDUCTIONS -> NET PROFIT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Card 1: Total Omset Bulanan */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-900/50 space-y-1.5">
                <div className="flex items-center justify-between text-blue-700 dark:text-blue-300">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                    <Lock className="w-3 h-3 text-blue-500" />
                    1. Omset Shift Bulanan
                  </span>
                  <span className="p-1 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                    <DollarSign className="w-3.5 h-3.5" />
                  </span>
                </div>
                <p className="font-black text-xl text-blue-700 dark:text-blue-300">
                  {formatRupiah(totalMonthShiftRevenue)}
                </p>
                <p className="text-[10px] text-blue-600/80 dark:text-blue-400/80">
                  {monthShifts.length} Shift Terverifikasi (Terkunci)
                </p>
              </div>

              {/* Card 2: Total Gross Profit */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-1.5">
                <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    2. Gross Profit Bulanan
                  </span>
                  <span className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                </div>
                <p className="font-black text-xl text-emerald-700 dark:text-emerald-300">
                  {formatRupiah(monthGrossProfit)}
                </p>
                <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">
                  Gross Margin: <span className="font-bold">{monthGrossMarginPct.toFixed(1)}%</span> (Setelah HPP & Bahan)
                </p>
              </div>

              {/* Card 3: Total Pengurang Beban */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50/50 dark:from-rose-950/40 dark:to-pink-950/20 border border-rose-200 dark:border-rose-900/50 space-y-1.5">
                <div className="flex items-center justify-between text-rose-700 dark:text-rose-300">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                    <TrendingDown className="w-3 h-3 text-rose-500" />
                    3. Biaya Pengurang Beban
                  </span>
                  <span className="p-1 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                    <Receipt className="w-3.5 h-3.5" />
                  </span>
                </div>
                <p className="font-black text-xl text-rose-700 dark:text-rose-300">
                  -{formatRupiah(totalMonthlyAllDeductions)}
                </p>
                <p className="text-[10px] text-rose-600/80 dark:text-rose-400/80">
                  Gaji, Sewa, Operasional, Promo & Servis
                </p>
              </div>

              {/* Card 4: Net Profit (Laba / Rugi Bersih) */}
              <div className={`p-4 rounded-2xl border space-y-1.5 shadow-xs ${
                monthlyNetProfit >= 0
                  ? 'bg-gradient-to-br from-purple-900 to-indigo-950 text-white border-purple-800'
                  : 'bg-gradient-to-br from-rose-900 to-red-950 text-white border-rose-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                    4. Laba / Rugi Bersih (Net)
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-white/20 text-white">
                    {monthlyNetProfit >= 0 ? '✓ SURPLUS PROFIT' : '⚠️ DEFISIT OPERASIONAL'}
                  </span>
                </div>
                <p className="font-black text-xl text-amber-300">
                  {formatRupiah(monthlyNetProfit)}
                </p>
                <p className="text-[10px] text-purple-200">
                  Net Margin: <span className="font-bold text-white">{monthlyNetMarginPct.toFixed(1)}%</span> dari Omset
                </p>
              </div>
            </div>

            {/* DUAL COLUMN BREAKDOWN: GROSS PROFIT ON LEFT, DEDUCTIONS ON RIGHT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* LEFT COLUMN: PENDAPATAN & GROSS PROFIT */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50/50 dark:bg-purple-950/20 space-y-3">
                <h5 className="font-extrabold text-xs text-[#3D1259] dark:text-amber-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  Rincian Omset & Gross Profit Bulanan
                </h5>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-purple-950 border border-slate-100 dark:border-purple-900">
                    <span className="text-slate-600 dark:text-slate-300">• Penjualan Tunai POS</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">+{formatRupiah(monthCashRev)}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-purple-950 border border-slate-100 dark:border-purple-900">
                    <span className="text-slate-600 dark:text-slate-300">• Penerimaan QRIS</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">+{formatRupiah(monthQrisRev)}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-purple-950 border border-slate-100 dark:border-purple-900">
                    <span className="text-slate-600 dark:text-slate-300">• Penerimaan Transfer Bank</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">+{formatRupiah(monthTransferRev)}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-purple-950 border border-slate-100 dark:border-purple-900">
                    <span className="text-slate-600 dark:text-slate-300">• Penjualan Online Food (GoFood/Grab)</span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">+{formatRupiah(monthOnlineFoodRev)}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 font-extrabold text-blue-800 dark:text-blue-300">
                    <span>TOTAL OMSET BULANAN (TERKUNCI)</span>
                    <span>{formatRupiah(totalMonthShiftRevenue)}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
                    <span className="text-rose-700 dark:text-rose-300 font-semibold">• Beban HPP Daging Ayam & Belanja Pasar</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">-{formatRupiah(monthCogsExpenses)}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 font-black text-emerald-800 dark:text-emerald-300 text-sm">
                    <span>TOTAL GROSS PROFIT BULANAN</span>
                    <span>{formatRupiah(monthGrossProfit)}</span>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: RINCIAN BIAYA PENGURANG BEBAN */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50/50 dark:bg-purple-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-extrabold text-xs text-[#3D1259] dark:text-amber-400 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-rose-500" />
                    Pos Biaya Pengurang Beban Usaha Bulanan
                  </h5>
                  <button
                    onClick={() => {
                      setDedMonth(monthlyPnlMonth);
                      setDedOutlet(monthlyPnlOutlet === 'ALL' ? 'Semua Cabang (Konsolidasi)' : monthlyPnlOutlet);
                      setShowDeductionModal(true);
                    }}
                    className="px-2 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-[10px] flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3 h-3" /> Tambah Beban
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  {/* 1. Penggajian */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-purple-950 border border-slate-100 dark:border-purple-900">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">1. Penggajian & Bonus Karyawan</span>
                      <span className="text-[10px] text-slate-400">Input Manual Beban Gaji & Bonus</span>
                    </div>
                    <span className="font-black text-rose-600 dark:text-rose-400">-{formatRupiah(totalMonthPayrollDeduction)}</span>
                  </div>

                  {/* 2. Sewa Tempat */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-purple-950 border border-slate-100 dark:border-purple-900">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">2. Sewa Tempat & Gedung Outlet</span>
                      <span className="text-[10px] text-slate-400">Ruko, Lapak, Booth Cabang</span>
                    </div>
                    <span className="font-black text-rose-600 dark:text-rose-400">-{formatRupiah(totalMonthRentDeduction)}</span>
                  </div>

                  {/* 3. Utilitas & Operasional */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-purple-950 border border-slate-100 dark:border-purple-900">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">3. Utilitas & Operasional Toko</span>
                      <span className="text-[10px] text-slate-400">Listrik, Air, Gas LPG, Kas Kecil Toko</span>
                    </div>
                    <span className="font-black text-rose-600 dark:text-rose-400">-{formatRupiah(totalMonthOpDeduction)}</span>
                  </div>

                  {/* 4. Marketing */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-purple-950 border border-slate-100 dark:border-purple-900">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">4. Marketing, Ads & Promo</span>
                      <span className="text-[10px] text-slate-400">Iklan Medsos & Konten</span>
                    </div>
                    <span className="font-black text-rose-600 dark:text-rose-400">-{formatRupiah(totalMonthMarketingDeduction)}</span>
                  </div>

                  {/* 5. Maintenance */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-purple-950 border border-slate-100 dark:border-purple-900">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">5. Maintenance & Servis Alat</span>
                      <span className="text-[10px] text-slate-400">Servis Grill, Freezer, POS, AC</span>
                    </div>
                    <span className="font-black text-rose-600 dark:text-rose-400">-{formatRupiah(totalMonthMaintenanceDeduction)}</span>
                  </div>

                  {/* 6. Lain-lain */}
                  {totalMonthOtherDeduction > 0 && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-purple-950 border border-slate-100 dark:border-purple-900">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">6. Pajak & Biaya Lainnya</span>
                        <span className="text-[10px] text-slate-400">Retribusi & Pengeluaran Tambahan</span>
                      </div>
                      <span className="font-black text-rose-600 dark:text-rose-400">-{formatRupiah(totalMonthOtherDeduction)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-3 rounded-xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 font-black text-rose-800 dark:text-rose-300 text-sm">
                    <span>TOTAL BIAYA PENGURANG</span>
                    <span>-{formatRupiah(totalMonthlyAllDeductions)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* DAFTAR RINCIAN ITEM BIAYA PENGURANG MANUAL */}
            <div className="pt-2 space-y-2.5">
              <div className="flex items-center justify-between">
                <h5 className="font-extrabold text-xs text-[#3D1259] dark:text-amber-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-500" />
                  Daftar Rincian Item Biaya Pengurang Bulan Ini ({filteredMonthDeductions.length} Item)
                </h5>
                <span className="text-[11px] text-slate-400">
                  Pos pengurang yang dapat ditambah & disesuaikan per cabang
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-purple-900 bg-white dark:bg-purple-950/40">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-600 dark:text-purple-300 font-bold">
                      <th className="p-2.5">Nama Pos Pengurang</th>
                      <th className="p-2.5">Kategori</th>
                      <th className="p-2.5">Cabang Outlet</th>
                      <th className="p-2.5 text-right">Nominal (Rp)</th>
                      <th className="p-2.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-purple-900/50">
                    {filteredMonthDeductions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400">
                          Belum ada catatan biaya pengurang tambahan untuk bulan ini.
                        </td>
                      </tr>
                    ) : (
                      filteredMonthDeductions.map((ded) => (
                        <tr key={ded.id} className="hover:bg-slate-50 dark:hover:bg-purple-900/30 transition-colors">
                          <td className="p-2.5">
                            <span className="font-extrabold text-slate-800 dark:text-slate-200 block">{ded.name}</span>
                            {ded.notes && <span className="text-[10px] text-slate-400">{ded.notes}</span>}
                          </td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-[#3D1259] dark:text-amber-300 text-[10px] font-bold">
                              {ded.category}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-300 text-[11px]">
                            {ded.outlet}
                          </td>
                          <td className="p-2.5 text-right font-black text-rose-600 dark:text-rose-400">
                            -{formatRupiah(ded.amount)}
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => handleDeleteDeduction(ded.id, ded.name)}
                              className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                              title="Hapus pos pengurang ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABEL REKAPITULASI LABA / RUGI PER CABANG OUTLET */}
            <div className="pt-3 border-t border-slate-100 dark:border-purple-900/50 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h5 className="font-extrabold text-xs text-[#3D1259] dark:text-amber-400 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-purple-500" />
                  Rekapitulasi Laba / Rugi Bersih per Cabang Outlet ({monthlyPnlMonth})
                </h5>
                <span className="text-[11px] text-slate-400">
                  Konsolidasi real-time Omset, HPP, Biaya Pengurang & Net Profit
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-purple-900">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-700 dark:text-purple-300 font-bold">
                      <th className="p-2.5">Nama Cabang Outlet</th>
                      <th className="p-2.5 text-center">Jumlah Shift</th>
                      <th className="p-2.5 text-right">Omset Bulanan</th>
                      <th className="p-2.5 text-right">Beban HPP/Bahan</th>
                      <th className="p-2.5 text-right">Gross Profit</th>
                      <th className="p-2.5 text-right">Total Pengurang</th>
                      <th className="p-2.5 text-right">Laba / Rugi Bersih</th>
                      <th className="p-2.5 text-center">Net Margin %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-purple-900/50">
                    {perBranchMonthlyNetProfit.map((b) => (
                      <tr key={b.outletName} className="hover:bg-slate-50 dark:hover:bg-purple-900/30 transition-colors">
                        <td className="p-2.5 font-extrabold text-slate-800 dark:text-slate-200">
                          {b.outletName}
                        </td>
                        <td className="p-2.5 text-center text-slate-600 dark:text-slate-300">
                          {b.shiftCount} Shift
                        </td>
                        <td className="p-2.5 text-right font-bold text-blue-600 dark:text-blue-400">
                          {formatRupiah(b.shiftRev)}
                        </td>
                        <td className="p-2.5 text-right font-bold text-rose-600 dark:text-rose-400">
                          -{formatRupiah(b.cogsExp)}
                        </td>
                        <td className="p-2.5 text-right font-black text-emerald-600 dark:text-emerald-400">
                          {formatRupiah(b.gp)}
                        </td>
                        <td className="p-2.5 text-right font-bold text-rose-600 dark:text-rose-400">
                          -{formatRupiah(b.totalDed)}
                        </td>
                        <td className={`p-2.5 text-right font-black ${
                          b.netProfit >= 0 ? 'text-purple-950 dark:text-amber-300' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {formatRupiah(b.netProfit)}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            b.netMargin >= 25
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : b.netMargin >= 10
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          }`}>
                            {b.netMargin.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                    {/* Row Konsolidasi Total */}
                    <tr className="bg-slate-100 dark:bg-purple-950 font-black border-t-2 border-slate-300 dark:border-purple-800">
                      <td className="p-2.5 text-purple-950 dark:text-amber-300">
                        KONSOLIDASI SELURUH CABANG
                      </td>
                      <td className="p-2.5 text-center text-slate-700 dark:text-slate-300">
                        {monthShifts.length} Shift
                      </td>
                      <td className="p-2.5 text-right text-blue-600 dark:text-blue-400 text-sm">
                        {formatRupiah(totalMonthShiftRevenue)}
                      </td>
                      <td className="p-2.5 text-right text-rose-600 dark:text-rose-400 text-sm">
                        -{formatRupiah(monthCogsExpenses)}
                      </td>
                      <td className="p-2.5 text-right text-emerald-600 dark:text-emerald-400 text-sm">
                        {formatRupiah(monthGrossProfit)}
                      </td>
                      <td className="p-2.5 text-right text-rose-600 dark:text-rose-400 text-sm">
                        -{formatRupiah(totalMonthlyAllDeductions)}
                      </td>
                      <td className={`p-2.5 text-right text-sm ${monthlyNetProfit >= 0 ? 'text-purple-950 dark:text-amber-300' : 'text-rose-600 dark:text-rose-400'}`}>
                        {formatRupiah(monthlyNetProfit)}
                      </td>
                      <td className="p-2.5 text-center text-sm text-purple-600 dark:text-amber-400">
                        {monthlyNetMarginPct.toFixed(1)}%
                      </td>
                    </tr>
                  </tbody>
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
                  Sinkronisasi real-time distribusi penerimaan omset dari Audit Closing Shift & transaksi POS (Tunai, QRIS, Transfer, & Online Food).
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
                  <button
                    onClick={() => setPnlMode('semua')}
                    className={`px-3 py-1.5 rounded-lg font-extrabold transition-all cursor-pointer ${
                      pnlMode === 'semua'
                        ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Semua Data
                  </button>
                </div>

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
                    <span className="text-xs text-slate-400 font-bold">s/d:</span>
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

                <select
                  value={selectedOutletFilter}
                  onChange={(e) => setSelectedOutletFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold text-xs"
                >
                  <option value="ALL">Semua Outlet Cabang</option>
                  {allKnownOutlets.map((out) => (
                    <option key={out} value={out}>
                      {out}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Date Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 font-bold text-[11px]">Pilih Cepat Tanggal:</span>
              <button
                onClick={() => {
                  setPnlMode('harian');
                  setPnlDate(todayStr);
                }}
                className={`px-2.5 py-1 rounded-lg font-extrabold transition-all cursor-pointer ${
                  pnlMode === 'harian' && pnlDate === todayStr
                    ? 'bg-amber-400 text-purple-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-purple-950 text-slate-600 dark:text-purple-300'
                }`}
              >
                Hari Ini
              </button>
              <button
                onClick={() => {
                  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                  setPnlMode('harian');
                  setPnlDate(yesterday);
                }}
                className="px-2.5 py-1 rounded-lg font-extrabold bg-slate-100 dark:bg-purple-950 text-slate-600 dark:text-purple-300 hover:bg-slate-200 cursor-pointer"
              >
                Kemarin
              </button>
              <button
                onClick={() => {
                  setPnlMode('mingguan');
                  setPnlDate(todayStr);
                }}
                className={`px-2.5 py-1 rounded-lg font-extrabold transition-all cursor-pointer ${
                  pnlMode === 'mingguan'
                    ? 'bg-amber-400 text-purple-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-purple-950 text-slate-600 dark:text-purple-300'
                }`}
              >
                7 Hari Terakhir
              </button>
              <button
                onClick={() => {
                  setPnlMode('bulanan');
                  setPnlMonth(todayStr.substring(0, 7));
                }}
                className={`px-2.5 py-1 rounded-lg font-extrabold transition-all cursor-pointer ${
                  pnlMode === 'bulanan'
                    ? 'bg-amber-400 text-purple-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-purple-950 text-slate-600 dark:text-purple-300'
                }`}
              >
                Bulan Ini
              </button>
            </div>

            {/* Payment Method 4 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* QRIS */}
              <div className="p-4 rounded-2xl bg-white dark:bg-purple-950/40 border-2 border-blue-500/30 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-blue-500" />
                    QRIS (GoPay/OVO/Shopee/BCA)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 font-black text-[10px]">
                    {syncQrisSharePct.toFixed(1)}%
                  </span>
                </div>
                <p className="font-black text-xl text-slate-900 dark:text-white">{formatRupiah(syncQrisRevenue)}</p>
                <div className="w-full bg-slate-100 dark:bg-purple-900/50 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(syncQrisSharePct, 100)}%` }}></div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Nontunai Real-Time • {filteredCashFlowShifts.length} Shift Terverifikasi
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
                    {syncCashSharePct.toFixed(1)}%
                  </span>
                </div>
                <p className="font-black text-xl text-slate-900 dark:text-white">{formatRupiah(syncCashRevenue)}</p>
                <div className="w-full bg-slate-100 dark:bg-purple-900/50 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min(syncCashSharePct, 100)}%` }}></div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Uang Fisik Kas Laci • {filteredCashFlowShifts.length} Shift Terverifikasi
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
                    {syncTransferSharePct.toFixed(1)}%
                  </span>
                </div>
                <p className="font-black text-xl text-slate-900 dark:text-white">{formatRupiah(syncTransferRevenue)}</p>
                <div className="w-full bg-slate-100 dark:bg-purple-900/50 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min(syncTransferSharePct, 100)}%` }}></div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Transfer Bank Kasir • {filteredCashFlowShifts.length} Shift Terverifikasi
                </p>
              </div>

              {/* Online Food */}
              <div className="p-4 rounded-2xl bg-white dark:bg-purple-950/40 border-2 border-amber-500/30 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-amber-500" />
                    Online Food & Kanal Digital
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-black text-[10px]">
                    {syncOnlineFoodSharePct.toFixed(1)}%
                  </span>
                </div>
                <p className="font-black text-xl text-slate-900 dark:text-white">{formatRupiah(syncOnlineFoodRevenue)}</p>
                <div className="w-full bg-slate-100 dark:bg-purple-900/50 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${Math.min(syncOnlineFoodSharePct, 100)}%` }}></div>
                </div>
                <p className="text-[11px] text-slate-500">
                  GoFood / Grab / Shopee • {filteredCashFlowShifts.length} Shift Terverifikasi
                </p>
              </div>
            </div>

            {/* Total Consolidation Bar */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-950 to-purple-950 text-white flex flex-wrap items-center justify-between gap-3 shadow-md">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider">
                  TOTAL KONSOLIDASI OMSET KESELURUHAN METODE [{pnlMode.toUpperCase()}]
                </span>
                <p className="text-2xl font-black text-emerald-400">{formatRupiah(syncShiftRevenueTotal)}</p>
              </div>
              <div className="text-right text-xs text-purple-200">
                <p className="font-extrabold text-white">Terintegrasi dengan Modul Audit Closing Shift</p>
                <p className="text-[11px]">Total {filteredCashFlowShifts.length} rekonsiliasi shift kasir di outlet terpilih</p>
              </div>
            </div>

            {/* Rekapitulasi Shift Closing Kasir Berdasarkan Metode Pembayaran */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h5 className="font-extrabold text-xs text-[#3D1259] dark:text-amber-400 flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-emerald-500" />
                    Rekapitulasi Distribusi Metode Pembayaran per Shift Closing
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Rincian data terverifikasi yang dilaporkan langsung dari form closing shift kasir.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-purple-900/60 bg-white dark:bg-[#180B24] shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-purple-900 bg-slate-100 dark:bg-purple-950/80 text-slate-800 dark:text-amber-300 font-extrabold">
                      <th className="p-3">ID Shift</th>
                      <th className="p-3">Tanggal & Shift</th>
                      <th className="p-3">Kasir</th>
                      <th className="p-3">Outlet Cabang</th>
                      <th className="p-3 text-right text-emerald-700 dark:text-emerald-300">Tunai (Cash)</th>
                      <th className="p-3 text-right text-blue-700 dark:text-blue-300">QRIS Nontunai</th>
                      <th className="p-3 text-right text-purple-700 dark:text-purple-300">Transfer Bank</th>
                      <th className="p-3 text-right text-amber-700 dark:text-amber-300">Online Food</th>
                      <th className="p-3 text-right font-black">Total Omset Shift</th>
                      <th className="p-3 text-center">Status Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-purple-900/40">
                    {filteredCashFlowShifts.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-slate-400 dark:text-slate-500">
                          <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          <p className="font-bold">Belum ada record Audit Closing Shift pada periode & filter outlet ini.</p>
                          <p className="text-[11px] mt-1">Data metode pembayaran akan terisi otomatis saat kasir melakukan closing shift.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredCashFlowShifts.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-purple-900/20 transition-colors font-medium">
                          <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">{s.id}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">
                            {s.date} <span className="text-[10px] text-slate-400 font-bold block">{s.shiftName}</span>
                          </td>
                          <td className="p-3 font-bold text-slate-800 dark:text-slate-100">{s.cashierName}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">{s.outlet}</td>
                          <td className="p-3 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                            {formatRupiah(s.cashRevenue || 0)}
                          </td>
                          <td className="p-3 text-right font-extrabold text-blue-600 dark:text-blue-400">
                            {formatRupiah(s.actualQrisRevenue ?? s.qrisRevenue ?? 0)}
                          </td>
                          <td className="p-3 text-right font-extrabold text-purple-600 dark:text-purple-400">
                            {formatRupiah(s.actualTransferRevenue ?? s.transferRevenue ?? 0)}
                          </td>
                          <td className="p-3 text-right font-extrabold text-amber-600 dark:text-amber-400">
                            {formatRupiah(s.actualOnlineFoodRevenue ?? s.onlineFoodRevenue ?? 0)}
                          </td>
                          <td className="p-3 text-right font-black text-slate-900 dark:text-white">
                            {formatRupiah(s.totalRevenue)}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                (s.auditStatus && s.auditStatus.includes('Sesuai')) || !s.auditStatus
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              }`}
                            >
                              {s.auditStatus || 'Sesuai (Balance)'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {filteredCashFlowShifts.length > 0 && (
                    <tfoot>
                      <tr className="bg-purple-950 text-white font-black text-xs border-t-2 border-amber-400">
                        <td colSpan={4} className="p-3 uppercase text-amber-300">
                          TOTAL KONSOLIDASI ({filteredCashFlowShifts.length} Shift Closing)
                        </td>
                        <td className="p-3 text-right text-emerald-300">{formatRupiah(syncCashRevenue)}</td>
                        <td className="p-3 text-right text-blue-300">{formatRupiah(syncQrisRevenue)}</td>
                        <td className="p-3 text-right text-purple-300">{formatRupiah(syncTransferRevenue)}</td>
                        <td className="p-3 text-right text-amber-300">{formatRupiah(syncOnlineFoodRevenue)}</td>
                        <td className="p-3 text-right text-emerald-400 text-sm">{formatRupiah(syncShiftRevenueTotal)}</td>
                        <td className="p-3 text-center text-amber-300">REKAP RESMI</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* Optional POS Orders Detail if present */}
            {filteredPnlOrders.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-purple-900/40">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h5 className="font-extrabold text-xs text-[#3D1259] dark:text-amber-400 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-blue-500" />
                    Rincian Nota Transaksi POS Individual ({filteredPnlOrders.length} Pesanan)
                  </h5>

                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400 font-bold">Filter Metode POS:</span>
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

                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-purple-900/60 bg-white dark:bg-[#180B24]">
                  <table className="w-full text-left text-xs border-collapse">
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
            )}
          </div>
        </div>
      )}

      {/* MODAL INPUT CLOSING SHIFT KASIR WITH MULTI-CHANNEL & DENOMINATION CALCULATOR */}
      {showClosingModal && (
        <div className="fixed inset-0 z-50 bg-purple-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1a0c28] border border-purple-900/50 rounded-2xl p-5 sm:p-6 max-w-2xl w-full my-auto max-h-[92vh] overflow-y-auto shadow-2xl space-y-4">
            <div>
              <h3 className="font-extrabold text-lg text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-500" />
                {editingShiftId ? `Edit Audit Closing Shift (${editingShiftId})` : 'Audit & Closing Shift Kasir Terpadu'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {editingShiftId
                  ? 'Perbarui rekonsiliasi kas laci fisik, arus modal, penjualan tunai/nontunai, atau pengeluaran operasional shift ini.'
                  : 'Rekonsiliasi kas laci fisik, arus modal, penjualan tunai/nontunai, online food, serta pengeluaran operasional per outlet.'}
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Row 1: Tanggal Audit, Kasir (Terkunci) & Lokasi Outlet */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-purple-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" /> Tanggal Audit Shift *
                  </label>
                  <input
                    type="date"
                    value={closingDate}
                    onChange={(e) => setClosingDate(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-white dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
                    title="Pilih tanggal transaksi yang ingin diaudit"
                  />
                  <span className="text-[10px] text-blue-500 font-medium block mt-0.5">
                    ✓ Sinkron data POS {closingDate}
                  </span>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 dark:text-purple-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-500" /> Nama Kasir (Terkunci) *
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="text"
                      value={currentUser?.name || cashierName}
                      readOnly
                      disabled
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-100 dark:bg-purple-950/70 text-slate-600 dark:text-slate-300 font-extrabold cursor-not-allowed select-none shadow-inner"
                      title="Nama kasir terkunci otomatis sesuai akun login aktif"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5">
                      🔒 Akun Login
                    </span>
                  </div>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 dark:text-purple-300 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-amber-500" /> Lokasi Outlet Cabang *
                  </label>
                  <select
                    value={outlet}
                    onChange={(e) => {
                      const newOutlet = e.target.value;
                      setOutlet(newOutlet);
                      const shiftsForLoc = getShiftsForOutlet(newOutlet);
                      if (shiftsForLoc.length > 0) {
                        setShiftName(shiftsForLoc[0].name);
                      }
                    }}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
                  >
                    {locations.length > 0 ? (
                      locations.map((loc) => (
                        <option key={loc.id} value={loc.name}>
                          {loc.name} ({loc.startWorkTime || '14:00'} - {loc.endWorkTime || '23:00'})
                        </option>
                      ))
                    ) : (
                      outletsList.map((out) => (
                        <option key={out} value={out}>{out}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Arus Kas Laci Kasir (Modal Awal + Tunai POS + Kas Keluar + Penyesuaian Manual) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-purple-950/60 border border-slate-200 dark:border-purple-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between font-extrabold text-slate-700 dark:text-purple-200">
                  <span className="flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-emerald-500" /> Rekonsiliasi Arus Kas Laci Kasir:
                  </span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-300 font-mono font-bold">
                    📅 Tanggal Audit: {effectiveClosingDate}
                  </span>
                </div>

                {/* Modal Saldo Awal */}
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-purple-900/60 border border-slate-200 dark:border-purple-800">
                  <span className="text-slate-600 dark:text-slate-300 font-bold">1. Modal Saldo Awal Laci:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400 font-mono">Rp</span>
                    <input
                      type="number"
                      min={0}
                      value={startingCash}
                      onChange={(e) => setStartingCash(Number(e.target.value))}
                      className="w-36 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-purple-700 bg-white dark:bg-purple-950 text-right font-bold text-xs"
                    />
                  </div>
                </div>

                {/* 2. Penjualan Tunai POS Sistem + Penyesuaian Manual */}
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-emerald-800 dark:text-emerald-300 block">2. Penjualan Tunai POS:</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Otomatis Sistem: +{formatRupiah(modalPosCash)} {manualCashAdjustment ? `(+ Tambahan Manual: ${formatRupiah(manualCashAdjustment)})` : ''}
                      </span>
                    </div>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">+{formatRupiah(effectiveCashRevenue)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-emerald-500/20">
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1">
                      <Plus className="w-3 h-3 text-emerald-500" /> Tambah / Koreksi Manual Tunai POS:
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-400 font-mono">Rp</span>
                      <input
                        type="number"
                        value={manualCashAdjustment}
                        onChange={(e) => setManualCashAdjustment(Number(e.target.value))}
                        placeholder="0"
                        className="w-32 px-2 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-purple-900 text-right font-bold text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Kas Keluar Operasional Sistem + Rincian Pengeluaran per Item */}
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-rose-800 dark:text-rose-300 block text-xs">
                        3. Kas Keluar Operasional (Petty Cash & Pengeluaran per Item):
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Kas Kecil Sistem: -{formatRupiah(modalExpenses)}
                        {totalItemizedExpenses > 0 ? ` • ${manualExpenseItems.length} Item Tambahan: -${formatRupiah(totalItemizedExpenses)}` : ''}
                        {manualExpenseAdjustment ? ` • Koreksi: -${formatRupiah(manualExpenseAdjustment)}` : ''}
                      </span>
                    </div>
                    <span className="font-black text-rose-600 dark:text-rose-400 text-sm">
                      -{formatRupiah(effectiveOperationalExpenses)}
                    </span>
                  </div>

                  {/* Form Input Pengeluaran per Item & Kasbon Karyawan */}
                  <div className="p-3 rounded-xl bg-white dark:bg-purple-900/80 border border-rose-200 dark:border-rose-900/60 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-extrabold text-[11px] text-rose-900 dark:text-rose-300 flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5 text-rose-500" /> Tambah Kas Keluar / Kasbon Shift:
                      </span>

                      {/* Category Switcher */}
                      <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-purple-950 border border-slate-200 dark:border-purple-800 text-[10px]">
                        <button
                          type="button"
                          onClick={() => {
                            setTempExpenseCategory('Operasional Toko');
                            setTempExpenseEmployeeId('');
                          }}
                          className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                            tempExpenseCategory !== 'Kasbon Karyawan'
                              ? 'bg-rose-500 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                          }`}
                        >
                          🏢 Belanja / Operasional
                        </button>
                        <button
                          type="button"
                          onClick={() => setTempExpenseCategory('Kasbon Karyawan')}
                          className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                            tempExpenseCategory === 'Kasbon Karyawan'
                              ? 'bg-purple-700 dark:bg-amber-400 text-white dark:text-purple-950 shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                          }`}
                        >
                          🏷️ Kasbon Karyawan (Sync Gaji)
                        </button>
                      </div>
                    </div>

                    {/* Kasbon Specific Employee Selector */}
                    {tempExpenseCategory === 'Kasbon Karyawan' && (
                      <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 space-y-1.5">
                        <label className="font-extrabold text-[11px] text-purple-900 dark:text-amber-300 flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-purple-600 dark:text-amber-400" />
                          Pilih Karyawan Penerima Kasbon *
                        </label>
                        <select
                          value={tempExpenseEmployeeId}
                          onChange={(e) => setTempExpenseEmployeeId(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-purple-900 text-slate-800 dark:text-slate-100 font-bold text-xs"
                        >
                          <option value="">-- Pilih Nama Karyawan --</option>
                          {activeEmployeesList.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.name} ({emp.role || 'Staff'} • {emp.outlet || 'Semua Outlet'})
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-purple-700 dark:text-purple-300">
                          💡 Kasbon ini akan memotong kas laci shift ini & otomatis tersinkronisasi sebagai potongan kasbon di Menu Penggajian.
                        </p>
                      </div>
                    )}

                    {/* Inputs Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5">
                      <div className="sm:col-span-7">
                        <input
                          type="text"
                          value={tempExpenseDesc}
                          onChange={(e) => setTempExpenseDesc(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddManualExpenseItem();
                            }
                          }}
                          placeholder={
                            tempExpenseCategory === 'Kasbon Karyawan'
                              ? 'Catatan kasbon (opsional, misal: Keperluan Darurat / Berobat)'
                              : 'Nama item / keperluan (e.g. Beli Es Batu, Plastik, Gas, Galon)'
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-purple-700 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 text-xs font-medium"
                        />
                      </div>
                      <div className="sm:col-span-3 flex items-center gap-1">
                        <span className="text-[11px] text-slate-400 font-mono">Rp</span>
                        <input
                          type="number"
                          min={0}
                          value={tempExpenseAmount}
                          onChange={(e) => setTempExpenseAmount(e.target.value === '' ? '' : Number(e.target.value))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddManualExpenseItem();
                            }
                          }}
                          placeholder="Nominal (Rp)"
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-purple-700 bg-slate-50 dark:bg-purple-950 text-right font-bold text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <button
                          type="button"
                          onClick={handleAddManualExpenseItem}
                          className={`w-full h-full min-h-[30px] px-2 py-1 rounded-lg text-white font-black text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-all shadow-xs ${
                            tempExpenseCategory === 'Kasbon Karyawan'
                              ? 'bg-purple-700 hover:bg-purple-800'
                              : 'bg-rose-500 hover:bg-rose-600'
                          }`}
                          title="Tambah item pengeluaran / kasbon ini"
                        >
                          <Plus className="w-3 h-3" /> {tempExpenseCategory === 'Kasbon Karyawan' ? 'Kasbon' : 'Tambah'}
                        </button>
                      </div>
                    </div>

                    {/* List of Added Itemized Expenses & Kasbon */}
                    {manualExpenseItems.length > 0 ? (
                      <div className="mt-2 space-y-1.5 pt-2 border-t border-rose-100 dark:border-rose-900/40">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold px-1">
                          <span>DAFTAR ITEM KAS KELUAR & KASBON:</span>
                          <span className="text-rose-600 dark:text-rose-400">
                            {manualExpenseItems.length} Item ({formatRupiah(totalItemizedExpenses)})
                          </span>
                        </div>
                        <div className="max-h-36 overflow-y-auto space-y-1 pr-0.5">
                          {manualExpenseItems.map((item, idx) => (
                            <div
                              key={item.id}
                              className={`flex items-center justify-between gap-2 p-1.5 px-2 rounded-lg border text-xs ${
                                item.category === 'Kasbon Karyawan' || item.employeeId
                                  ? 'bg-purple-50 dark:bg-purple-950/90 border-purple-300 dark:border-purple-800'
                                  : 'bg-rose-50 dark:bg-purple-950/80 border-rose-200/80 dark:border-rose-900/40'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <span
                                  className={`w-4 h-4 rounded-full font-black text-[9px] flex items-center justify-center shrink-0 ${
                                    item.category === 'Kasbon Karyawan'
                                      ? 'bg-purple-600 text-white'
                                      : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                                  }`}
                                >
                                  {idx + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    {item.category === 'Kasbon Karyawan' && (
                                      <span className="px-1.5 py-0.5 rounded bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-amber-300 text-[9px] font-black shrink-0">
                                        🏷️ KASBON: {item.employeeName}
                                      </span>
                                    )}
                                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate" title={item.description}>
                                      {item.description}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span
                                  className={`font-black ${
                                    item.category === 'Kasbon Karyawan'
                                      ? 'text-purple-700 dark:text-amber-400'
                                      : 'text-rose-600 dark:text-rose-400'
                                  }`}
                                >
                                  -{formatRupiah(item.amount)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveManualExpenseItem(item.id)}
                                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950 cursor-pointer transition-all"
                                  title="Hapus item ini"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic pt-1">
                        💡 Belum ada item pengeluaran atau kasbon. Ketik nama keperluan/pilih karyawan dan nominal di atas lalu klik tombol "+ Tambah".
                      </p>
                    )}
                  </div>
                </div>

                {/* Saldo Laci Kas Teoretis Seharusnya */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-purple-800">
                  <span className="font-black text-purple-900 dark:text-amber-300">LACI KAS TEORETIS SEHARUSNYA:</span>
                  <span className="font-black text-purple-900 dark:text-amber-300 text-sm">{formatRupiah(expectedCashInDrawer)}</span>
                </div>
              </div>

              {/* Hitung Fisik Kas Laci (Pecahan Koin & Kertas) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-700 dark:text-purple-300 flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-amber-500" /> Hitung Fisik Kas Laci Kasir:
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseDenominationCalc(!useDenominationCalc)}
                    className="text-[11px] text-amber-600 dark:text-amber-400 font-bold underline cursor-pointer hover:text-amber-500"
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

              {/* Realisasi Uang QRIS / Transfer Bank & Online Food */}
              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2.5 text-xs">
                <div className="flex items-center justify-between font-extrabold text-blue-900 dark:text-blue-300">
                  <span className="flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-blue-500" /> Realisasi Nontunai & Penjualan Online Food:
                  </span>
                  <span className="text-[10px] text-slate-400">QRIS / Transfer / Ojek Online</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* QRIS */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-purple-900 border border-blue-200 dark:border-blue-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1">
                        <QrCode className="w-3 h-3" /> Uang QRIS
                      </span>
                      <span className="text-[10px] text-slate-400">Sistem: {formatRupiah(modalPosQris)}</span>
                    </div>
                    <input
                      type="number"
                      min={0}
                      value={actualQrisRevenue || (actualQrisRevenue === 0 && modalPosQris > 0 ? modalPosQris : actualQrisRevenue)}
                      onChange={(e) => setActualQrisRevenue(Number(e.target.value))}
                      placeholder={String(modalPosQris)}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-purple-700 bg-slate-50 dark:bg-purple-950 font-bold text-xs text-right text-blue-600"
                    />
                  </div>

                  {/* Transfer Bank */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-purple-900 border border-indigo-200 dark:border-indigo-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                        <CreditCard className="w-3 h-3" /> Transfer Bank
                      </span>
                      <span className="text-[10px] text-slate-400">Sistem: {formatRupiah(modalPosTransfer)}</span>
                    </div>
                    <input
                      type="number"
                      min={0}
                      value={actualTransferRevenue || (actualTransferRevenue === 0 && modalPosTransfer > 0 ? modalPosTransfer : actualTransferRevenue)}
                      onChange={(e) => setActualTransferRevenue(Number(e.target.value))}
                      placeholder={String(modalPosTransfer)}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-purple-700 bg-slate-50 dark:bg-purple-950 font-bold text-xs text-right text-indigo-600"
                    />
                  </div>

                  {/* Online Food */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-purple-900 border border-orange-200 dark:border-orange-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-orange-700 dark:text-orange-300 flex items-center gap-1">
                        <Smartphone className="w-3 h-3" /> Online Food
                      </span>
                      <span className="text-[10px] text-slate-400">Grab/Go/Shopee</span>
                    </div>
                    <input
                      type="number"
                      min={0}
                      value={onlineFoodRevenue}
                      onChange={(e) => setOnlineFoodRevenue(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-purple-700 bg-slate-50 dark:bg-purple-950 font-bold text-xs text-right text-orange-600"
                    />
                  </div>
                </div>

                {/* Total Omset Keseluruhan Shift */}
                <div className="flex justify-between items-center pt-2 border-t border-blue-200 dark:border-blue-900/60">
                  <span className="font-black text-blue-900 dark:text-blue-300">TOTAL OMSET SHIFT (TUNAI + QRIS + TRF + ONLINE):</span>
                  <span className="font-black text-blue-950 dark:text-amber-300 text-sm">{formatRupiah(totalShiftRevenue)}</span>
                </div>
              </div>

              {/* Audit Result Display */}
              <div className="p-3.5 rounded-2xl bg-purple-900 text-white space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span>Hasil Hitung Fisik Laci Kasir:</span>
                  <span className="font-black text-amber-400 text-sm">{formatRupiah(calculatedActualCash)}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1.5 border-t border-purple-800">
                  <span>Selisih Kas Laci Audit:</span>
                  <span
                    className={`font-black text-sm px-2.5 py-0.5 rounded-lg ${
                      cashDifference === 0
                        ? 'bg-emerald-500 text-white'
                        : cashDifference > 0
                        ? 'bg-blue-500 text-white'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {cashDifference === 0 ? '✓ PAS / SEIMBANG' : cashDifference > 0 ? `+${formatRupiah(cashDifference)} (LEBIH)` : `${formatRupiah(cashDifference)} (KURANG)`}
                  </span>
                </div>
              </div>

              {/* Catatan Kasir / Manager */}
              <div>
                <label className="font-extrabold text-slate-700 dark:text-purple-300">Catatan Kasir / Manager</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Uang fisik sesuai, uang kembalian utuh, QRIS match EDC"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Tombol Simpan / Batal */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-purple-900">
                <button
                  type="button"
                  onClick={() => setShowClosingModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-purple-900 text-slate-700 dark:text-slate-200 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveClosingShift}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black cursor-pointer shadow-lg hover:shadow-emerald-500/20 transition-all"
                >
                  {editingShiftId ? 'Simpan Perubahan Closing Shift' : 'Simpan Closing Shift'}
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
              {expenseModalSource === 'cash_flow'
                ? 'Catat Pengeluaran Beban Usaha (Cash Flow)'
                : 'Catat Pengeluaran Kas Kecil Operasional'}
            </h3>

            <form onSubmit={handleSaveExpense} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-purple-300">Lokasi Outlet Cabang *</label>
                  <select
                    value={outlet}
                    onChange={(e) => setOutlet(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold text-slate-800 dark:text-slate-100"
                  >
                    {locations.length > 0 ? (
                      locations.map((loc) => (
                        <option key={loc.id} value={loc.name}>
                          {loc.name}
                        </option>
                      ))
                    ) : (
                      outletsList.map((out) => (
                        <option key={out} value={out}>{out}</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 dark:text-purple-300">Kategori Pengeluaran *</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold text-slate-800 dark:text-slate-100"
                  >
                    <option value="Bahan Baku & HPP">Bahan Baku & HPP (Daging, Ayam)</option>
                    <option value="Belanja Pasar & Sayur">Belanja Pasar & Sayur</option>
                    <option value="Pembelian Bahan Darurat">Bahan Darurat (Es, Bumbu)</option>
                    <option value="Gas LPG">Gas LPG Kompor Grill</option>
                    <option value="Listrik & Air">Listrik & Air Operasional</option>
                    <option value="Kebersihan & Operasional">Kebersihan & Perlengkapan</option>
                    <option value="Gaji & Bonus Harian">Gaji & Bonus Harian</option>
                    <option value="Transport & Kurir">Transport & Kurir</option>
                    <option value="Lain-lain">Lain-lain</option>
                  </select>
                </div>
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
                {expenseModalSource === 'cash_flow'
                  ? 'ℹ️ Pengeluaran beban ini khusus untuk laporan Cash Flow & Gross Profit dan TIDAK disinkronkan ke Kas Laci Audit Closing Shift Kasir.'
                  : 'ℹ️ Pengeluaran kas kecil ini otomatis langsung memotong Saldo Laci Kasir dan disinkronkan ke Audit Closing Shift.'}
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

      {/* MODAL INPUT BIAYA PENGURANG BULANAN */}
      {showDeductionModal && (
        <div className="fixed inset-0 z-50 bg-purple-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1a0c28] border border-purple-900/50 rounded-2xl p-5 sm:p-6 max-w-md w-full my-auto max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <h3 className="font-extrabold text-lg text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
              <Receipt className="w-5 h-5 text-rose-500" />
              Tambah Pos Biaya Pengurang Bulanan
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!dedName.trim() || dedAmount <= 0) {
                  showToast('⚠️ Nama biaya dan nominal wajib diisi!');
                  return;
                }
                const newDed: MonthlyDeductionItem = {
                  id: `DED-${dedMonth.replace('-', '')}-${Date.now().toString().slice(-4)}`,
                  month: dedMonth,
                  outlet: dedOutlet,
                  category: dedCategory,
                  name: dedName.trim(),
                  amount: dedAmount,
                  notes: dedNotes.trim() || undefined,
                  createdAt: new Date().toISOString()
                };
                const updated = [newDed, ...monthlyDeductions];
                saveMonthlyDeductionsData(updated);
                setShowDeductionModal(false);
                setDedName('');
                setDedAmount(1000000);
                setDedNotes('');
                showToast(`💸 Biaya pengurang "${newDed.name}" (${formatRupiah(dedAmount)}) berhasil ditambahkan!`);
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-purple-300">Bulan Periode *</label>
                  <input
                    type="month"
                    required
                    value={dedMonth}
                    onChange={(e) => setDedMonth(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 dark:text-purple-300">Alokasi Cabang *</label>
                  <select
                    value={dedOutlet}
                    onChange={(e) => setDedOutlet(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold text-slate-800 dark:text-slate-100"
                  >
                    <option value="Semua Cabang (Konsolidasi)">Semua Cabang (Konsolidasi)</option>
                    {allKnownOutlets.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-purple-300">Kategori Biaya Pengurang *</label>
                <select
                  value={dedCategory}
                  onChange={(e) => setDedCategory(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold text-slate-800 dark:text-slate-100"
                >
                  <option value="Penggajian & Bonus">Penggajian, Lembur & Bonus Tambahan</option>
                  <option value="Sewa Tempat & Gedung">Sewa Tempat, Lapak & Ruko Outlet</option>
                  <option value="Listrik, Air & Utilitas">Listrik, Air, Gas & WiFi / Internet</option>
                  <option value="Operasional & Perlengkapan">Operasional Toko & Perlengkapan</option>
                  <option value="Marketing & Promo">Marketing, Iklan Ads, Promo & Brosur</option>
                  <option value="Maintenance & Perbaikan">Maintenance Alat, Grill & Servis Freezer</option>
                  <option value="Pajak & Legalitas">Pajak Restoran, Retribusi & Izin</option>
                  <option value="Lain-lain">Biaya Lain-lain / Beban Lainnya</option>
                </select>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-purple-300">Nama / Rincian Beban *</label>
                <input
                  type="text"
                  required
                  value={dedName}
                  onChange={(e) => setDedName(e.target.value)}
                  placeholder="e.g. Sewa Ruko Outlet Cibubur Bulan Ini"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-purple-300">Nominal Beban (Rp) *</label>
                <input
                  type="number"
                  required
                  min={1000}
                  value={dedAmount}
                  onChange={(e) => setDedAmount(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-purple-300">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  value={dedNotes}
                  onChange={(e) => setDedNotes(e.target.value)}
                  placeholder="e.g. Bukti transfer sewa / slip pembayaran"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-[11px] text-purple-800 dark:text-purple-300">
                ℹ️ Biaya pengurang ini akan langsung mengurangi Total Gross Profit pada Laporan Laba / Rugi Bulanan.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-purple-900">
                <button
                  type="button"
                  onClick={() => setShowDeductionModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-purple-900 text-slate-700 dark:text-slate-200 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black cursor-pointer shadow-md"
                >
                  Simpan Biaya Pengurang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
