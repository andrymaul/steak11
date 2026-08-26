import React, { useState, useMemo } from 'react';
import {
  Users,
  Calendar,
  Clock,
  Banknote,
  Plus,
  Edit,
  Trash2,
  Search,
  Download,
  Upload,
  RefreshCw,
  Printer,
  Send,
  Eye,
  X,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Camera,
  Sliders,
  Sparkles,
  DollarSign
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Employee,
  AttendanceRecord,
  PayrollSlip,
  WorkSchedule,
  ShiftTemplate,
  EmployeeLoan,
  RoleSetting,
  Location,
  AdminUser
} from '../types';
import {
  formatRupiah,
  isRegisteredAdmin,
  calculateLateDeduction,
  getMonthlyLatePenaltyThreshold
} from '../utils';

export interface EmployeeAndPayrollManagerProps {
  activeTab: 'karyawan' | 'absensi' | 'penggajian' | 'jadwal' | string;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  saveEmployees: (data: Employee[]) => void;
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  saveAttendance: (data: AttendanceRecord[]) => void;
  payrollSlips: PayrollSlip[];
  setPayrollSlips: React.Dispatch<React.SetStateAction<PayrollSlip[]>>;
  savePayrollSlips: (data: PayrollSlip[]) => void;
  schedules: WorkSchedule[];
  setSchedules: React.Dispatch<React.SetStateAction<WorkSchedule[]>>;
  saveSchedules: (data: WorkSchedule[]) => void;
  shiftTemplates: ShiftTemplate[];
  setShiftTemplates: React.Dispatch<React.SetStateAction<ShiftTemplate[]>>;
  saveShiftTemplates: (data: ShiftTemplate[]) => void;
  employeeLoans: EmployeeLoan[];
  setEmployeeLoans: React.Dispatch<React.SetStateAction<EmployeeLoan[]>>;
  saveEmployeeLoans: (data: EmployeeLoan[]) => void;
  roleSettings: RoleSetting[];
  locations: Location[];
  currentUser?: { name?: string; fullName?: string; role?: string; allowedTabs?: string[] } | AdminUser | null;
  showToast: (msg: string) => void;
}

export const EmployeeAndPayrollManager: React.FC<EmployeeAndPayrollManagerProps> = ({
  activeTab,
  employees,
  setEmployees,
  saveEmployees,
  attendance,
  setAttendance,
  saveAttendance,
  payrollSlips,
  setPayrollSlips,
  savePayrollSlips,
  schedules,
  setSchedules,
  saveSchedules,
  shiftTemplates,
  setShiftTemplates,
  saveShiftTemplates,
  employeeLoans,
  setEmployeeLoans,
  saveEmployeeLoans,
  roleSettings,
  locations,
  currentUser,
  showToast
}) => {
  const isAdmin = isRegisteredAdmin(currentUser);

  // Sub-tabs / Filters
  const [empSearchTerm, setEmpSearchTerm] = useState('');
  const [empOutletFilter, setEmpOutletFilter] = useState('ALL');
  const [empRoleFilter, setEmpRoleFilter] = useState('ALL');
  const [isRefreshingEmployees, setIsRefreshingEmployees] = useState(false);

  // Attendance Filters
  const [attSearchTerm, setAttSearchTerm] = useState('');
  const [attDateFilter, setAttDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [attOutletFilter, setAttOutletFilter] = useState('ALL');
  const [attTypeFilter, setAttTypeFilter] = useState<'ALL' | 'REGULAR' | 'OVERTIME'>('ALL');
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<{ url: string; name: string; time: string; type: string } | null>(null);

  // Payroll Filters & Month
  const [payrollMonth, setPayrollMonth] = useState(new Date().toISOString().slice(0, 7));
  const [payrollOutletFilter, setPayrollOutletFilter] = useState('ALL');
  const [payrollSearchTerm, setPayrollSearchTerm] = useState('');
  const [isGeneratingPayroll, setIsGeneratingPayroll] = useState(false);
  const [payrollCycleType, setPayrollCycleType] = useState<'CUTOFF_25' | 'FULL_CALENDAR'>('CUTOFF_25');

  // Schedule Filters & Month
  const [scheduleMonth, setScheduleMonth] = useState(new Date().toISOString().slice(0, 7));
  const [scheduleOutletFilter, setScheduleOutletFilter] = useState(locations[0]?.name || 'Steak 11, Cibubur');
  const [scheduleSearchTerm, setScheduleSearchTerm] = useState('');

  // Modals
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
  const [empCustomId, setEmpCustomId] = useState('');
  const [empName, setEmpName] = useState('');
  const [empUsername, setEmpUsername] = useState('');
  const [empRole, setEmpRole] = useState(roleSettings[0]?.name || 'Cook / Chef');
  const [empOutlet, setEmpOutlet] = useState(locations[0]?.name || 'Steak 11, Cibubur');
  const [empPhone, setEmpPhone] = useState('');
  const [empPin, setEmpPin] = useState('1234');
  const [empDailyRate, setEmpDailyRate] = useState(70000);
  const [empHourlyRate, setEmpHourlyRate] = useState(15000);
  const [empDailyAllowance, setEmpDailyAllowance] = useState(15000);
  const [empOutletBonus, setEmpOutletBonus] = useState(5000);
  const [empAllowedTabs, setEmpAllowedTabs] = useState<string[]>(['kasir', 'pesanan', 'inventory', 'absensi']);

  // Edit Payroll Slip Modal
  const [editingSlipId, setEditingSlipId] = useState<string | null>(null);
  const [editBaseSalary, setEditBaseSalary] = useState(0);
  const [editAllowance, setEditAllowance] = useState(0);
  const [editPunctualityAllowance, setEditPunctualityAllowance] = useState(0);
  const [editOvertimePay, setEditOvertimePay] = useState(0);
  const [editOutletBonus, setEditOutletBonus] = useState(0);
  const [editBonus, setEditBonus] = useState(0);
  const [editDeductions, setEditDeductions] = useState(0);
  const [editLatePenalty, setEditLatePenalty] = useState(0);
  const [editLoanDeduction, setEditLoanDeduction] = useState(0);
  const [editOtherDeductions, setEditOtherDeductions] = useState(0);
  const [editNote, setEditNote] = useState('');
  const [syncToEmployeeMaster, setSyncToEmployeeMaster] = useState(false);

  // Late Penalty Threshold Modal
  const [showLatePenaltyModal, setShowLatePenaltyModal] = useState(false);
  const [latePenaltyMinutes, setLatePenaltyMinutes] = useState(getMonthlyLatePenaltyThreshold());

  // Overtime Rate Modal
  const [showOvertimeRateModal, setShowOvertimeRateModal] = useState(false);
  const [globalOtRate, setGlobalOtRate] = useState(15000);

  // Loan Ledger Modal & Add Loan
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanEmpId, setLoanEmpId] = useState('');
  const [loanAmount, setLoanAmount] = useState(100000);
  const [loanMonthlyInstallment, setLoanMonthlyInstallment] = useState(50000);
  const [loanReason, setLoanReason] = useState('');

  // Schedule Modal (Assign shift)
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [schEmployeeId, setSchEmployeeId] = useState('');
  const [schDate, setSchDate] = useState(new Date().toISOString().split('T')[0]);
  const [schShiftId, setSchShiftId] = useState('');
  const [schNotes, setSchNotes] = useState('');

  // Shift Template Modal
  const [showShiftTemplateModal, setShowShiftTemplateModal] = useState(false);
  const [shiftTplOutlet, setShiftTplOutlet] = useState('Semua Outlet');
  const [shiftTplName, setShiftTplName] = useState('');
  const [shiftTplStart, setShiftTplStart] = useState('14:00');
  const [shiftTplEnd, setShiftTplEnd] = useState('23:00');
  const [shiftTplIsOff, setShiftTplIsOff] = useState(false);
  const [shiftTplColor, setShiftTplColor] = useState('emerald');
  const [editingShiftTplId, setEditingShiftTplId] = useState<string | null>(null);

  // Delete Target Modal
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'employee' | 'attendance' | 'schedule' | 'shiftTemplate' | 'loan';
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

  // Helper shifts for outlet
  const getShiftsForOutlet = (outletName?: string) => {
    return shiftTemplates.filter((s) => !s.outlet || s.outlet === 'Semua Outlet' || s.outlet === outletName);
  };

  // ==========================================
  // EMPLOYEE CRUD
  // ==========================================
  const handleOpenAddEmployee = () => {
    if (!checkAdminPermission('menambah karyawan baru')) return;
    setEditingEmpId(null);
    setEmpCustomId(`EMP-${Date.now().toString().slice(-3)}`);
    setEmpName('');
    setEmpUsername('');
    setEmpRole(roleSettings[0]?.name || 'Cook / Chef');
    setEmpOutlet(locations[0]?.name || 'Steak 11, Cibubur');
    setEmpPhone('');
    setEmpPin('1234');
    setEmpDailyRate(70000);
    setEmpHourlyRate(15000);
    setEmpDailyAllowance(15000);
    setEmpOutletBonus(5000);
    setEmpAllowedTabs(['kasir', 'pesanan', 'inventory', 'absensi']);
    setShowAddEmpModal(true);
  };

  const handleOpenEditEmployee = (emp: Employee) => {
    if (!checkAdminPermission('mengedit data karyawan')) return;
    setEditingEmpId(emp.id);
    setEmpCustomId(emp.id);
    setEmpName(emp.name);
    setEmpUsername(emp.username || '');
    setEmpRole(emp.role);
    setEmpOutlet(emp.outlet);
    setEmpPhone(emp.phone);
    setEmpPin(emp.pin || '1234');
    setEmpDailyRate(emp.dailyRate || 70000);
    setEmpHourlyRate(emp.hourlyRate || 15000);
    setEmpDailyAllowance(emp.dailyAllowance || 15000);
    setEmpOutletBonus(emp.outletBonus || 5000);
    setEmpAllowedTabs(emp.allowedTabs || ['kasir', 'pesanan', 'inventory', 'absensi']);
    setShowAddEmpModal(true);
  };

  const handleSaveEmployee = () => {
    if (!checkAdminPermission('menyimpan data karyawan')) return;
    if (!empName.trim() || !empPhone.trim()) {
      showToast('Nama lengkap dan No. WhatsApp karyawan wajib diisi!');
      return;
    }

    if (editingEmpId) {
      const updated = employees.map((emp) =>
        emp.id === editingEmpId
          ? {
              ...emp,
              id: empCustomId.trim() || emp.id,
              name: empName.trim(),
              username: empUsername.trim() || undefined,
              role: empRole,
              outlet: empOutlet,
              phone: empPhone.trim(),
              pin: empPin.trim() || '1234',
              dailyRate: Number(empDailyRate),
              hourlyRate: Number(empHourlyRate),
              dailyAllowance: Number(empDailyAllowance),
              outletBonus: Number(empOutletBonus),
              allowedTabs: empAllowedTabs
            }
          : emp
      );
      setEmployees(updated);
      saveEmployees(updated);
      showToast(`Data karyawan "${empName}" berhasil diperbarui!`);
    } else {
      const newEmp: Employee = {
        id: empCustomId.trim() || `EMP-${Date.now().toString().slice(-4)}`,
        name: empName.trim(),
        username: empUsername.trim() || undefined,
        role: empRole,
        outlet: empOutlet,
        phone: empPhone.trim(),
        status: 'Aktif',
        joinDate: new Date().toISOString().split('T')[0],
        pin: empPin.trim() || '1234',
        dailyRate: Number(empDailyRate),
        hourlyRate: Number(empHourlyRate),
        dailyAllowance: Number(empDailyAllowance),
        outletBonus: Number(empOutletBonus),
        allowedTabs: empAllowedTabs
      };
      const updated = [...employees, newEmp];
      setEmployees(updated);
      saveEmployees(updated);
      showToast(`Karyawan "${empName}" berhasil ditambahkan!`);
    }

    setShowAddEmpModal(false);
  };

  // ==========================================
  // PAYROLL GENERATOR (CUT-OFF 25 OR FULL MONTH)
  // ==========================================
  const handleGeneratePayroll = () => {
    if (!checkAdminPermission('menghasilkan draf penggajian')) return;
    setIsGeneratingPayroll(true);

    const [yearStr, monthStr] = payrollMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10); // 1-12

    let startDateStr = '';
    let endDateStr = '';

    if (payrollCycleType === 'CUTOFF_25') {
      // 26 bulan lalu s/d 25 bulan ini
      const prevDate = new Date(year, month - 2, 26);
      const curDate = new Date(year, month - 1, 25);
      startDateStr = prevDate.toISOString().split('T')[0];
      endDateStr = curDate.toISOString().split('T')[0];
    } else {
      // 1 s/d akhir bulan
      const firstDate = new Date(year, month - 1, 1);
      const lastDate = new Date(year, month, 0);
      startDateStr = firstDate.toISOString().split('T')[0];
      endDateStr = lastDate.toISOString().split('T')[0];
    }

    const activeEmployees = employees.filter(
      (e) => e.status === 'Aktif' && (payrollOutletFilter === 'ALL' || e.outlet === payrollOutletFilter)
    );

    const generatedSlips: PayrollSlip[] = activeEmployees.map((emp) => {
      // Filter attendance records in cycle
      const empAttendance = attendance.filter(
        (a) => a.employeeId === emp.id && a.date >= startDateStr && a.date <= endDateStr && a.status === 'Hadir'
      );

      const totalDaysPresent = empAttendance.length;
      const totalHoursWorked = empAttendance.reduce((acc, c) => acc + (c.workHours || 8), 0);

      // Overtime records
      const otRecords = attendance.filter(
        (a) =>
          a.employeeId === emp.id &&
          a.date >= startDateStr &&
          a.date <= endDateStr &&
          a.attendanceType === 'OVERTIME' &&
          (a.overtimeApproved || a.status === 'Hadir')
      );
      const overtimeHours = otRecords.reduce((acc, c) => acc + (c.overtimeHours || c.workHours || 0), 0);
      const overtimePay = overtimeHours * (emp.hourlyRate || 15000);

      // Calculate Late Deductions
      const lateMinutes = empAttendance.reduce((acc, c) => acc + (c.lateMinutes || 0), 0);
      const latePenalty = calculateLateDeduction(lateMinutes);

      // Check active employee loan deduction
      const activeLoan = employeeLoans.find((l) => l.employeeId === emp.id && l.status === 'ACTIVE');
      const loanDeduction = activeLoan ? Math.min(activeLoan.monthlyInstallment || activeLoan.monthlyDeduction || 0, activeLoan.remainingAmount) : 0;

      const baseSalary = totalDaysPresent * (emp.dailyRate || 70000);
      const allowance = totalDaysPresent * (emp.dailyAllowance || 15000);
      const outletBonus = totalDaysPresent * (emp.outletBonus || 5000);
      const punctualityAllowance = lateMinutes <= latePenaltyMinutes && totalDaysPresent >= 20 ? 100000 : 0;
      const totalDeductions = latePenalty + loanDeduction;

      const netSalary = baseSalary + allowance + outletBonus + punctualityAllowance + overtimePay - totalDeductions;

      return {
        id: `SLIP-${payrollMonth.replace('-', '')}-${emp.id}`,
        periodMonth: payrollMonth,
        periodLabel: payrollCycleType === 'CUTOFF_25' ? `Bulan ${payrollMonth} (Cut-off 25)` : `Bulan ${payrollMonth}`,
        month: payrollMonth,
        employeeId: emp.id,
        employeeName: emp.name,
        employeeRole: emp.role,
        outlet: emp.outlet,
        totalDaysPresent,
        totalDaysLate: empAttendance.filter((a) => (a.lateMinutes || 0) > 0).length,
        totalDaysOnTime: empAttendance.filter((a) => !a.lateMinutes || a.lateMinutes <= 0).length,
        totalHoursWorked,
        totalOvertimeHours: overtimeHours,
        hourlyRate: emp.hourlyRate || 15000,
        baseSalary,
        totalAllowance: allowance,
        allowance,
        punctualityAllowance,
        overtimePay,
        outletBonus,
        bonus: 0,
        deductions: totalDeductions,
        latePenalty,
        loanDeduction,
        otherDeductions: 0,
        netSalary: Math.max(0, netSalary),
        paymentStatus: 'Draft',
        notes: `Periode ${startDateStr} s/d ${endDateStr}`,
        note: `Periode ${startDateStr} s/d ${endDateStr}`
      };
    });

    // Replace or merge with existing slips for this month
    const existingOtherMonths = payrollSlips.filter((s) => (s.periodMonth || s.month) !== payrollMonth);
    const updated = [...existingOtherMonths, ...generatedSlips];
    setPayrollSlips(updated);
    savePayrollSlips(updated);

    setIsGeneratingPayroll(false);
    showToast(`✅ Berhasil menghasilkan ${generatedSlips.length} slip gaji untuk periode ${payrollMonth}!`);
  };

  // Open Edit Slip
  const handleOpenEditPayroll = (slip: PayrollSlip) => {
    if (!checkAdminPermission('mengedit slip gaji')) return;
    setEditingSlipId(slip.id);
    setEditBaseSalary(slip.baseSalary || 0);
    setEditAllowance(slip.allowance || 0);
    setEditPunctualityAllowance(slip.punctualityAllowance || 0);
    setEditOvertimePay(slip.overtimePay || 0);
    setEditOutletBonus(slip.outletBonus || 0);
    setEditBonus(slip.bonus || 0);
    setEditDeductions(slip.deductions || 0);
    setEditLatePenalty(slip.latePenalty || 0);
    setEditLoanDeduction(slip.loanDeduction || 0);
    setEditOtherDeductions(slip.otherDeductions || 0);
    setEditNote(slip.notes || '');
    setSyncToEmployeeMaster(false);
  };

  const handleSavePayrollEdit = () => {
    if (!editingSlipId || !checkAdminPermission('menyimpan slip gaji')) return;
    const totalDeductions = Number(editLatePenalty) + Number(editLoanDeduction) + Number(editOtherDeductions);
    const net =
      Number(editBaseSalary) +
      Number(editAllowance) +
      Number(editPunctualityAllowance) +
      Number(editOvertimePay) +
      Number(editOutletBonus) +
      Number(editBonus) -
      totalDeductions;

    const updated = payrollSlips.map((s) => {
      if (s.id === editingSlipId) {
        return {
          ...s,
          baseSalary: Number(editBaseSalary),
          allowance: Number(editAllowance),
          punctualityAllowance: Number(editPunctualityAllowance),
          overtimePay: Number(editOvertimePay),
          outletBonus: Number(editOutletBonus),
          bonus: Number(editBonus),
          deductions: totalDeductions,
          latePenalty: Number(editLatePenalty),
          loanDeduction: Number(editLoanDeduction),
          otherDeductions: Number(editOtherDeductions),
          netSalary: Math.max(0, net),
          notes: editNote.trim()
        };
      }
      return s;
    });

    setPayrollSlips(updated);
    savePayrollSlips(updated);
    setEditingSlipId(null);
    showToast('Slip gaji berhasil disesuaikan!');
  };

  // Print Slip PDF
  const handlePrintPayrollPdf = (slip: PayrollSlip) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('STEAK 11 — SLIP GAJI KARYAWAN', 14, 20);
    doc.setFontSize(10);
    doc.text(`ID Slip: ${slip.id} | Periode: ${slip.month}`, 14, 28);
    doc.text(`Nama: ${slip.employeeName} (${slip.employeeRole})`, 14, 34);
    doc.text(`Outlet: ${slip.outlet} | Kehadiran: ${slip.totalDaysPresent} Hari`, 14, 40);

    const rows = [
      ['Gaji Pokok', formatRupiah(slip.baseSalary)],
      ['Uang Makan & Transport', formatRupiah(slip.allowance)],
      ['Tunjangan Tepat Waktu', formatRupiah(slip.punctualityAllowance)],
      ['Upah Lembur', formatRupiah(slip.overtimePay)],
      ['Bonus Outlet', formatRupiah(slip.outletBonus || 0)],
      ['Bonus Tambahan / Insentif', formatRupiah(slip.bonus || 0)],
      ['Potongan Keterlambatan', `-${formatRupiah(slip.latePenalty || 0)}`],
      ['Potongan Kasbon Karyawan', `-${formatRupiah(slip.loanDeduction || 0)}`],
      ['Potongan Lainnya', `-${formatRupiah(slip.otherDeductions || 0)}`],
      ['TOTAL GAJI BERSIH (THP)', formatRupiah(slip.netSalary)]
    ];

    autoTable(doc, {
      head: [['Komponen Penggajian', 'Jumlah (Rp)']],
      body: rows,
      startY: 46,
      theme: 'grid',
      headStyles: { fillColor: [61, 18, 89] }
    });

    doc.save(`Slip_Gaji_${slip.employeeName}_${slip.month}.pdf`);
    showToast(`Slip gaji ${slip.employeeName} berhasil diunduh!`);
  };

  // WhatsApp Slip
  const handleSendPayrollWhatsApp = (slip: PayrollSlip) => {
    const matchedEmp = employees.find((e) => e.id === slip.employeeId);
    if (!matchedEmp || !matchedEmp.phone) {
      showToast(`Nomor WhatsApp untuk ${slip.employeeName} belum terdaftar!`);
      return;
    }

    const cleanPhone = matchedEmp.phone.replace(/[^0-9]/g, '');
    const phoneWith62 = cleanPhone.startsWith('62') ? cleanPhone : '62' + cleanPhone.replace(/^0+/, '');

    const text = `*SLIP GAJI RESMI STEAK 11* 🥩
━━━━━━━━━━━━━━━━━━━━
👤 *Nama:* ${slip.employeeName}
💼 *Jabatan:* ${slip.employeeRole}
🏬 *Outlet:* ${slip.outlet}
📅 *Periode:* ${slip.month}
🕒 *Hari Hadir:* ${slip.totalDaysPresent} Hari (${slip.totalHoursWorked || 0} Jam)
━━━━━━━━━━━━━━━━━━━━
💰 *Gaji Pokok:* ${formatRupiah(slip.baseSalary)}
🍱 *Uang Makan & Transport:* ${formatRupiah(slip.allowance)}
⏰ *Tunj. Tepat Waktu:* ${formatRupiah(slip.punctualityAllowance)}
🔥 *Upah Lembur:* ${formatRupiah(slip.overtimePay)}
⭐ *Bonus Outlet:* ${formatRupiah(slip.outletBonus || 0)}
🎁 *Insentif / Bonus:* ${formatRupiah(slip.bonus || 0)}
━━━━━━━━━━━━━━━━━━━━
🛑 *Potongan Denda Telat:* -${formatRupiah(slip.latePenalty || 0)}
💳 *Potongan Kasbon:* -${formatRupiah(slip.loanDeduction || 0)}
━━━━━━━━━━━━━━━━━━━━
💵 *TOTAL GAJI BERSIH (THP):*
👉 *${formatRupiah(slip.netSalary)}*

_Terima kasih atas dedikasi dan kerja keras Anda untuk Steak 11!_`;

    const url = `https://api.whatsapp.com/send?phone=${phoneWith62}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // ==========================================
  // SCHEDULE / ROSTER MATRIKS
  // ==========================================
  const handleOpenAssignSchedule = (empId?: string, dateStr?: string) => {
    if (!checkAdminPermission('mengatur roster shift')) return;
    const initialEmp = empId || employees[0]?.id || '';
    const empObj = employees.find((e) => e.id === initialEmp);
    const available = getShiftsForOutlet(empObj?.outlet);

    setEditingScheduleId(null);
    setSchEmployeeId(initialEmp);
    setSchDate(dateStr || new Date().toISOString().split('T')[0]);
    setSchShiftId(available[0]?.id || 'shift-1');
    setSchNotes('');
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = () => {
    if (!checkAdminPermission('menyimpan jadwal shift')) return;
    if (!schEmployeeId || !schShiftId || !schDate) {
      showToast('Karyawan, Tanggal, dan Shift wajib dipilih!');
      return;
    }

    const empObj = employees.find((e) => e.id === schEmployeeId);
    const shiftObj = shiftTemplates.find((s) => s.id === schShiftId);

    const existingIndex = schedules.findIndex((s) => s.employeeId === schEmployeeId && s.date === schDate);

    const newRec: WorkSchedule = {
      id: editingScheduleId || `SCH-${Date.now().toString().slice(-4)}`,
      employeeId: schEmployeeId,
      employeeName: empObj?.name || 'Karyawan',
      outlet: empObj?.outlet || 'Steak 11, Cibubur',
      date: schDate,
      shiftId: schShiftId,
      shiftName: shiftObj?.name || 'Shift Regular',
      startTime: shiftObj?.startTime || '14:00',
      endTime: shiftObj?.endTime || '23:00',
      isOff: shiftObj?.isOff || false,
      notes: schNotes.trim() || undefined
    };

    let updated: WorkSchedule[] = [];
    if (existingIndex >= 0) {
      updated = [...schedules];
      updated[existingIndex] = newRec;
    } else {
      updated = [newRec, ...schedules];
    }

    setSchedules(updated);
    saveSchedules(updated);
    setShowScheduleModal(false);
    showToast(`Shift untuk ${newRec.employeeName} tanggal ${schDate} berhasil disimpan!`);
  };

  // Execution delete handler
  const executeDelete = () => {
    if (!deleteConfirmTarget || !checkAdminPermission('menghapus data')) return;
    const { type, id, desc } = deleteConfirmTarget;

    if (type === 'employee') {
      const updated = employees.filter((e) => e.id !== id);
      setEmployees(updated);
      saveEmployees(updated);
      showToast(`🗑️ Karyawan "${desc}" berhasil dihapus.`);
    } else if (type === 'attendance') {
      const updated = attendance.filter((a) => a.id !== id);
      setAttendance(updated);
      saveAttendance(updated);
      showToast(`🗑️ Data presensi "${desc}" berhasil dihapus.`);
    } else if (type === 'schedule') {
      const updated = schedules.filter((s) => s.id !== id);
      setSchedules(updated);
      saveSchedules(updated);
      showToast(`🗑️ Jadwal shift berhasil dihapus.`);
    }

    setDeleteConfirmTarget(null);
  };

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      (emp.name || '').toLowerCase().includes(empSearchTerm.toLowerCase()) ||
      (emp.role || '').toLowerCase().includes(empSearchTerm.toLowerCase()) ||
      (emp.phone || '').includes(empSearchTerm);
    const matchesOutlet = empOutletFilter === 'ALL' || emp.outlet === empOutletFilter;
    const matchesRole = empRoleFilter === 'ALL' || emp.role === empRoleFilter;
    return matchesSearch && matchesOutlet && matchesRole;
  });

  // Filtered attendance
  const filteredAttendance = attendance.filter((att) => {
    const matchesSearch =
      (att.employeeName || '').toLowerCase().includes(attSearchTerm.toLowerCase()) ||
      (att.employeeRole || '').toLowerCase().includes(attSearchTerm.toLowerCase());
    const matchesDate = !attDateFilter || att.date === attDateFilter;
    const matchesOutlet = attOutletFilter === 'ALL' || att.outlet === attOutletFilter;
    const matchesType =
      attTypeFilter === 'ALL' ||
      (attTypeFilter === 'OVERTIME' ? att.attendanceType === 'OVERTIME' : att.attendanceType !== 'OVERTIME');
    return matchesSearch && matchesDate && matchesOutlet && matchesType;
  });

  // Filtered payroll
  const filteredPayroll = payrollSlips.filter((s) => {
    const matchesMonth = s.month === payrollMonth;
    const matchesOutlet = payrollOutletFilter === 'ALL' || s.outlet === payrollOutletFilter;
    const matchesSearch =
      !payrollSearchTerm.trim() ||
      (s.employeeName || '').toLowerCase().includes(payrollSearchTerm.toLowerCase()) ||
      (s.employeeRole || '').toLowerCase().includes(payrollSearchTerm.toLowerCase());
    return matchesMonth && matchesOutlet && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* TAB 1: KELOLA KARYAWAN */}
      {/* ========================================================================= */}
      {activeTab === 'karyawan' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
            <div>
              <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo">
                Daftar Karyawan Outlet Steak 11
              </h3>
              <p className="text-xs text-slate-500">
                Kelola staf, jabatan, outlet penugasan, PIN absensi, serta tarif gaji harian &amp; tunjangan.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              {isAdmin && (
                <button
                  onClick={handleOpenAddEmployee}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-black text-xs hover:bg-amber-300 shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" /> <span>Tambah Karyawan</span>
                </button>
              )}
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama, jabatan, telepon..."
                value={empSearchTerm}
                onChange={(e) => setEmpSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={empOutletFilter}
                onChange={(e) => setEmpOutletFilter(e.target.value)}
                className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 cursor-pointer"
              >
                <option value="ALL">Semua Outlet</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>

              <select
                value={empRoleFilter}
                onChange={(e) => setEmpRoleFilter(e.target.value)}
                className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 cursor-pointer"
              >
                <option value="ALL">Semua Jabatan</option>
                {roleSettings.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Employee Table */}
          <div className="bg-white dark:bg-[#1f0e30] rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 dark:bg-purple-950/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-purple-900">
                  <tr>
                    <th className="p-3">ID &amp; Nama Staf</th>
                    <th className="p-3">Jabatan &amp; Outlet</th>
                    <th className="p-3">Kontak WhatsApp</th>
                    <th className="p-3">Gaji Harian &amp; Uang Makan</th>
                    <th className="p-3">PIN Login</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-purple-900/40">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-purple-900/20 transition-colors">
                      <td className="p-3">
                        <span className="font-extrabold text-slate-900 dark:text-slate-100 block">{emp.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{emp.id}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-300 font-bold text-[10px]">
                          {emp.role}
                        </span>
                        <span className="block text-[11px] text-slate-500 mt-1">{emp.outlet}</span>
                      </td>
                      <td className="p-3 font-mono text-slate-700 dark:text-slate-300">{emp.phone}</td>
                      <td className="p-3">
                        <span className="font-bold text-emerald-600 block">{formatRupiah(emp.dailyRate || 70000)} /hari</span>
                        <span className="text-[10px] text-amber-600">+{formatRupiah(emp.dailyAllowance || 15000)} makan</span>
                      </td>
                      <td className="p-3 font-mono font-bold text-purple-900 dark:text-amber-300">
                        {emp.pin || '••••'}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {emp.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isAdmin && (
                            <button
                              onClick={() => handleOpenEditEmployee(emp)}
                              className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                              title="Edit Data Karyawan"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => setDeleteConfirmTarget({ type: 'employee', id: emp.id, desc: `${emp.name} (${emp.role})` })}
                              className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                              title="Hapus Karyawan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REKAP PRESENSI DIGITAL */}
      {/* ========================================================================= */}
      {activeTab === 'absensi' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Rekap Presensi Digital &amp; Foto Selfie Karyawan
              </h3>
              <p className="text-xs text-slate-500">
                Pencatatan waktu masuk, pulang, status terlambat, serta verifikasi foto kamera selfie karyawan.
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <input
              type="text"
              placeholder="Cari nama karyawan..."
              value={attSearchTerm}
              onChange={(e) => setAttSearchTerm(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950"
            />
            <input
              type="date"
              value={attDateFilter}
              onChange={(e) => setAttDateFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold"
            />
            <select
              value={attOutletFilter}
              onChange={(e) => setAttOutletFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold"
            >
              <option value="ALL">Semua Outlet</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
            <select
              value={attTypeFilter}
              onChange={(e) => setAttTypeFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold"
            >
              <option value="ALL">Semua Tipe Presensi</option>
              <option value="REGULAR">Shift Reguler</option>
              <option value="OVERTIME">Lembur</option>
            </select>
          </div>

          {/* Attendance Table */}
          <div className="bg-white dark:bg-[#1f0e30] rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 dark:bg-purple-950/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-purple-900">
                  <tr>
                    <th className="p-3">Karyawan &amp; Outlet</th>
                    <th className="p-3">Tanggal &amp; Shift</th>
                    <th className="p-3">Jam Masuk</th>
                    <th className="p-3">Jam Pulang</th>
                    <th className="p-3">Durasi Kerja</th>
                    <th className="p-3">Keterlambatan</th>
                    <th className="p-3">Foto Selfie</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-purple-900/40">
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                        Belum ada catatan presensi pada tanggal/filter ini.
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-purple-900/20">
                        <td className="p-3">
                          <span className="font-extrabold text-slate-900 dark:text-slate-100 block">{rec.employeeName}</span>
                          <span className="text-[10px] text-slate-400">{rec.outlet}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block">{rec.date}</span>
                          <span className="text-[10px] text-purple-700 dark:text-amber-400">{rec.shiftName || 'Shift Reguler'}</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-600">{rec.checkInTime || '-'}</td>
                        <td className="p-3 font-mono font-bold text-blue-600">{rec.checkOutTime || '-'}</td>
                        <td className="p-3 font-bold">{rec.workHours || 8} Jam</td>
                        <td className="p-3">
                          {rec.lateMinutes && rec.lateMinutes > 0 ? (
                            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold text-[10px]">
                              Telat {rec.lateMinutes}m
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                              Tepat Waktu
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            {rec.checkInPhoto && (
                              <button
                                onClick={() => setSelectedPhotoModal({ url: rec.checkInPhoto!, name: rec.employeeName, time: rec.checkInTime || '', type: 'Foto Masuk' })}
                                className="p-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-700 cursor-pointer"
                                title="Lihat Foto Masuk"
                              >
                                <Camera className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {rec.checkOutPhoto && (
                              <button
                                onClick={() => setSelectedPhotoModal({ url: rec.checkOutPhoto!, name: rec.employeeName, time: rec.checkOutTime || '', type: 'Foto Pulang' })}
                                className="p-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 cursor-pointer"
                                title="Lihat Foto Pulang"
                              >
                                <Camera className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          {isAdmin && (
                            <button
                              onClick={() => setDeleteConfirmTarget({ type: 'attendance', id: rec.id, desc: `${rec.employeeName} (${rec.date})` })}
                              className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 cursor-pointer"
                              title="Hapus Presensi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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

      {/* ========================================================================= */}
      {/* TAB 3: PENGGAJIAN / PAYROLL */}
      {/* ========================================================================= */}
      {activeTab === 'penggajian' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                <Banknote className="w-5 h-5 text-amber-500" />
                Manajemen Penggajian &amp; Payroll Karyawan
              </h3>
              <p className="text-xs text-slate-500">
                Kalkulasi otomatis periode Cut-Off 25, denda telat, kasbon, cetak PDF dan kirim WhatsApp slip gaji resmi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowLatePenaltyModal(true)}
                className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" /> <span>Aturan Denda Telat</span>
              </button>

              {isAdmin && (
                <button
                  onClick={handleGeneratePayroll}
                  disabled={isGeneratingPayroll}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> <span>{isGeneratingPayroll ? 'Menghitung...' : 'Hitung Draf Payroll'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Month and Outlet Controls */}
          <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-500 block mb-1">Periode Bulan:</label>
              <input
                type="month"
                value={payrollMonth}
                onChange={(e) => setPayrollMonth(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-500 block mb-1">Filter Outlet:</label>
              <select
                value={payrollOutletFilter}
                onChange={(e) => setPayrollOutletFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold"
              >
                <option value="ALL">Semua Outlet</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-500 block mb-1">Siklus Penggajian:</label>
              <select
                value={payrollCycleType}
                onChange={(e) => setPayrollCycleType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-purple-950 dark:text-amber-300"
              >
                <option value="CUTOFF_25">📅 Cut-Off 25 (26 lalu s/d 25 ini)</option>
                <option value="FULL_CALENDAR">📅 Kalender Penuh (1 s/d Akhir)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-500 block mb-1">Cari Karyawan:</label>
              <input
                type="text"
                placeholder="Nama karyawan..."
                value={payrollSearchTerm}
                onChange={(e) => setPayrollSearchTerm(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950"
              />
            </div>
          </div>

          {/* Payroll Slips Table */}
          <div className="bg-white dark:bg-[#1f0e30] rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 dark:bg-purple-950/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-purple-900">
                  <tr>
                    <th className="p-3">Karyawan &amp; Outlet</th>
                    <th className="p-3">Hari Hadir</th>
                    <th className="p-3">Gaji Pokok</th>
                    <th className="p-3">Uang Makan &amp; Tunj.</th>
                    <th className="p-3">Lembur &amp; Bonus</th>
                    <th className="p-3">Potongan / Kasbon</th>
                    <th className="p-3 font-black text-purple-950 dark:text-amber-400">Total Bersih (THP)</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-purple-900/40">
                  {filteredPayroll.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                        Belum ada data slip gaji untuk periode {payrollMonth}. Klik tombol &quot;Hitung Draf Payroll&quot; di atas.
                      </td>
                    </tr>
                  ) : (
                    filteredPayroll.map((slip) => (
                      <tr key={slip.id} className="hover:bg-slate-50/80 dark:hover:bg-purple-900/20">
                        <td className="p-3">
                          <span className="font-extrabold text-slate-900 dark:text-slate-100 block">{slip.employeeName}</span>
                          <span className="text-[10px] text-slate-400">{slip.employeeRole} • {slip.outlet}</span>
                        </td>
                        <td className="p-3 font-bold">{slip.totalDaysPresent} Hari</td>
                        <td className="p-3 font-bold text-emerald-600">{formatRupiah(slip.baseSalary)}</td>
                        <td className="p-3 font-bold text-blue-600">
                          {formatRupiah((slip.allowance || 0) + (slip.punctualityAllowance || 0))}
                        </td>
                        <td className="p-3 font-bold text-amber-600">
                          {formatRupiah((slip.overtimePay || 0) + (slip.outletBonus || 0) + (slip.bonus || 0))}
                        </td>
                        <td className="p-3 font-bold text-rose-600">
                          -{formatRupiah(slip.deductions || 0)}
                        </td>
                        <td className="p-3 font-black text-sm text-purple-950 dark:text-amber-400">
                          {formatRupiah(slip.netSalary)}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isAdmin && (
                              <button
                                onClick={() => handleOpenEditPayroll(slip)}
                                className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 cursor-pointer"
                                title="Edit Penyesuaian Slip"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handlePrintPayrollPdf(slip)}
                              className="p-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700 cursor-pointer"
                              title="Download PDF"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleSendPayrollWhatsApp(slip)}
                              className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 cursor-pointer"
                              title="Kirim WhatsApp"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

      {/* ========================================================================= */}
      {/* TAB 4: JADWAL SHIFT & ROSTER */}
      {/* ========================================================================= */}
      {activeTab === 'jadwal' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                Matriks Roster Shift &amp; Jadwal Kerja Karyawan
              </h3>
              <p className="text-xs text-slate-500">
                Atur jadwal shift kerja harian per outlet dan kontrol hari libur (OFF) staf.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => handleOpenAssignSchedule()}
                className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-black text-xs hover:bg-amber-300 shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> <span>Atur Shift Karyawan</span>
              </button>
            )}
          </div>

          {/* Roster Controls */}
          <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="month"
                value={scheduleMonth}
                onChange={(e) => setScheduleMonth(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold"
              />
              <select
                value={scheduleOutletFilter}
                onChange={(e) => setScheduleOutletFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Schedules List */}
          <div className="bg-white dark:bg-[#1f0e30] rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {schedules
                .filter((s) => s.outlet === scheduleOutletFilter && s.date.startsWith(scheduleMonth))
                .map((sch) => (
                  <div
                    key={sch.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950/40 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100 block">
                        {sch.employeeName}
                      </span>
                      <span className="text-[11px] text-slate-500 block">📅 {sch.date}</span>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          sch.isOff ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {sch.shiftName} ({sch.isOff ? 'LIBUR' : `${sch.startTime} - ${sch.endTime}`})
                      </span>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => setDeleteConfirmTarget({ type: 'schedule', id: sch.id, desc: `${sch.employeeName} (${sch.date})` })}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL ADD / EDIT EMPLOYEE */}
      {/* ========================================================================= */}
      {showAddEmpModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-purple-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg my-auto max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1a0c28] text-slate-800 dark:text-slate-100 rounded-2xl p-5 sm:p-6 shadow-2xl border border-purple-900/50 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-purple-900 pb-3">
              <h3 className="font-extrabold text-lg text-[#3D1259] dark:text-amber-400 font-baloo">
                {editingEmpId ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
              </h3>
              <button onClick={() => setShowAddEmpModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold block mb-1">ID Karyawan:</label>
                <input
                  type="text"
                  value={empCustomId}
                  onChange={(e) => setEmpCustomId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-mono font-bold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  placeholder="Budi Santoso"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Jabatan / Role:</label>
                <select
                  value={empRole}
                  onChange={(e) => setEmpRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold"
                >
                  {roleSettings.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">Outlet Penugasan:</label>
                <select
                  value={empOutlet}
                  onChange={(e) => setEmpOutlet(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">No. WhatsApp:</label>
                <input
                  type="text"
                  value={empPhone}
                  onChange={(e) => setEmpPhone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">PIN Absensi:</label>
                <input
                  type="text"
                  value={empPin}
                  onChange={(e) => setEmpPin(e.target.value)}
                  placeholder="1234"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-mono font-bold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Gaji Harian (Rp):</label>
                <input
                  type="number"
                  value={empDailyRate}
                  onChange={(e) => setEmpDailyRate(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold text-emerald-600"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Uang Makan / Hari (Rp):</label>
                <input
                  type="number"
                  value={empDailyAllowance}
                  onChange={(e) => setEmpDailyAllowance(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold text-amber-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-purple-900">
              <button
                type="button"
                onClick={() => setShowAddEmpModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEmployee}
                className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md cursor-pointer"
              >
                Simpan Data Karyawan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL EDIT SLIP GAJI */}
      {/* ========================================================================= */}
      {editingSlipId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-purple-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg my-auto max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1a0c28] text-slate-800 dark:text-slate-100 rounded-2xl p-5 sm:p-6 shadow-2xl border border-purple-900/50 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-purple-900 pb-3">
              <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo">
                Edit &amp; Penyesuaian Slip Gaji
              </h3>
              <button onClick={() => setEditingSlipId(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Gaji Pokok (Rp):</label>
                <input
                  type="number"
                  value={editBaseSalary}
                  onChange={(e) => setEditBaseSalary(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Uang Makan &amp; Transpor (Rp):</label>
                <input
                  type="number"
                  value={editAllowance}
                  onChange={(e) => setEditAllowance(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold text-amber-600"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Tunjangan Tepat Waktu (Rp):</label>
                <input
                  type="number"
                  value={editPunctualityAllowance}
                  onChange={(e) => setEditPunctualityAllowance(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold text-emerald-600"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Upah Lembur (Rp):</label>
                <input
                  type="number"
                  value={editOvertimePay}
                  onChange={(e) => setEditOvertimePay(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold text-blue-600"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Denda Telat (Rp):</label>
                <input
                  type="number"
                  value={editLatePenalty}
                  onChange={(e) => setEditLatePenalty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold text-rose-600"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Potongan Kasbon (Rp):</label>
                <input
                  type="number"
                  value={editLoanDeduction}
                  onChange={(e) => setEditLoanDeduction(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold text-purple-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-purple-900">
              <button
                type="button"
                onClick={() => setEditingSlipId(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSavePayrollEdit}
                className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md cursor-pointer"
              >
                Simpan Penyesuaian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL ASSIGN SHIFT */}
      {/* ========================================================================= */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-purple-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-[#1a0c28] text-slate-800 dark:text-slate-100 rounded-2xl p-6 shadow-2xl border border-purple-900/50 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-purple-900 pb-3">
              <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo">
                Penugasan Shift Kerja
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Pilih Karyawan:</label>
                <select
                  value={schEmployeeId}
                  onChange={(e) => setSchEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role} - {emp.outlet})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Tanggal Shift:</label>
                <input
                  type="date"
                  value={schDate}
                  onChange={(e) => setSchDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Pilih Shift:</label>
                <select
                  value={schShiftId}
                  onChange={(e) => setSchShiftId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 font-bold text-purple-950 dark:text-amber-300"
                >
                  {getShiftsForOutlet(employees.find((e) => e.id === schEmployeeId)?.outlet).map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.isOff ? 'OFF / Libur' : `${tpl.startTime} - ${tpl.endTime}`})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-purple-900">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveSchedule}
                className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md cursor-pointer"
              >
                Simpan Shift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHOTO PREVIEW MODAL */}
      {/* ========================================================================= */}
      {selectedPhotoModal && (
        <div className="fixed inset-0 z-70 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C0D2B] rounded-2xl p-5 max-w-sm w-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                {selectedPhotoModal.type} — {selectedPhotoModal.name}
              </span>
              <button onClick={() => setSelectedPhotoModal(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-950">
              <img src={selectedPhotoModal.url} alt="Presensi Selfie" className="w-full h-full object-cover" />
            </div>
            <div className="text-[11px] text-slate-400 font-mono text-center">Waktu: {selectedPhotoModal.time} WIB</div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C0D2B] rounded-2xl p-6 max-w-md w-full border border-red-500/30 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-3 bg-red-100 dark:bg-red-950/80 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">Hapus Data</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{deleteConfirmTarget.desc}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-purple-950/50 p-3 rounded-xl border border-slate-200 dark:border-purple-900">
              Tindakan ini tidak dapat dibatalkan.
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
                onClick={executeDelete}
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
