import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Printer,
  QrCode,
  Building2,
  Banknote,
  Smartphone,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info,
  Sparkles,
  RefreshCw,
  FileText,
  Upload,
  X,
  Image as ImageIcon,
  Bluetooth,
  Usb,
  Wifi
} from 'lucide-react';
import { PaymentMethodSettings, ReceiptSettings } from '../types';
import {
  getStoredPaymentSettings,
  savePaymentSettings,
  getStoredReceiptSettings,
  saveReceiptSettings,
  getStoredLocations,
  isRegisteredAdmin,
  formatRupiah
} from '../utils';

interface PaymentAndReceiptSettingsManagerProps {
  showToast?: (message: string) => void;
  currentUser?: { name: string; role: string } | null;
}

export const PaymentAndReceiptSettingsManager: React.FC<PaymentAndReceiptSettingsManagerProps> = ({
  showToast,
  currentUser
}) => {
  const isReadOnlyVisitor = !isRegisteredAdmin(currentUser);
  const checkReadOnlyPermission = (): boolean => {
    if (isReadOnlyVisitor) {
      if (showToast) showToast('🔒 Akses Ditolak: Hanya Admin Terdaftar yang memiliki izin untuk Edit & Hapus data.');
      return true;
    }
    return false;
  };
  const [activeTab, setActiveTab] = useState<'payment' | 'receipt'>('payment');
  const [selectedOutlet, setSelectedOutlet] = useState<string>('ALL');
  const locations = getStoredLocations();
  const [paymentSettings, setPaymentSettings] = useState<PaymentMethodSettings>(() => getStoredPaymentSettings());
  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings>(() => getStoredReceiptSettings());
  const [isSaved, setIsSaved] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  const notify = (msg: string) => {
    if (showToast) {
      showToast(msg);
    } else {
      setLocalMessage(msg);
      setTimeout(() => setLocalMessage(null), 3000);
    }
  };

  useEffect(() => {
    const loadedPayment = getStoredPaymentSettings();
    if (loadedPayment) setPaymentSettings(loadedPayment);
    const loadedReceipt = getStoredReceiptSettings(selectedOutlet === 'ALL' ? undefined : selectedOutlet);
    if (loadedReceipt) setReceiptSettings(loadedReceipt);
  }, [selectedOutlet]);

  const handleOutletChange = (outletName: string) => {
    setSelectedOutlet(outletName);
    setReceiptSettings(getStoredReceiptSettings(outletName === 'ALL' ? undefined : outletName));
  };

  const handleSavePaymentSettings = () => {
    if (checkReadOnlyPermission()) return;
    savePaymentSettings(paymentSettings);
    setIsSaved(true);
    notify('Pengaturan Metode Pembayaran Berhasil Disimpan!');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSaveReceiptSettings = () => {
    if (checkReadOnlyPermission()) return;
    saveReceiptSettings(receiptSettings, selectedOutlet === 'ALL' ? undefined : selectedOutlet);
    setIsSaved(true);
    notify(selectedOutlet === 'ALL' ? 'Pengaturan Struk Global (Default) Berhasil Disimpan!' : `Pengaturan Struk Khusus Outlet (${selectedOutlet}) Berhasil Disimpan!`);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {localMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{localMessage}</span>
        </div>
      )}
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-[#1f0e30] p-6 rounded-3xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-amber-400/20 text-purple-950 dark:text-amber-300 text-xs font-black uppercase tracking-wider">
              Konfigurasi Kasir POS
            </span>
            {isSaved && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Tersimpan
              </span>
            )}
          </div>
          <h1 className="font-black text-2xl text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-amber-500" />
            Pengaturan Pembayaran & Struk Thermal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola pilihan metode pembayaran (QRIS, Transfer, Debit, Cash) & format cetak struk thermal kasir.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-purple-950/80 border border-slate-200 dark:border-purple-900/60 self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab('payment')}
            className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'payment'
                ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Metode Pembayaran
          </button>
          <button
            onClick={() => setActiveTab('receipt')}
            className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'receipt'
                ? 'bg-[#3D1259] dark:bg-amber-400 text-white dark:text-purple-950 shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Printer className="w-4 h-4" /> Pengaturan Struk
          </button>
        </div>
      </div>

      {/* TAB 1: METODE PEMBAYARAN */}
      {activeTab === 'payment' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. QRIS SETTINGS */}
            <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-purple-900/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-amber-400 flex items-center justify-center font-black">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                      1. QRIS (QR Code Indonesia Standard)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Metode scan Gopay, OVO, ShopeePay, DANA, BCA, dll.
                    </p>
                  </div>
                </div>

                {/* Enable Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentSettings.qris.enabled}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        qris: { ...paymentSettings.qris, enabled: e.target.checked }
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Nama Merchant QRIS
                  </label>
                  <input
                    type="text"
                    value={paymentSettings.qris.merchantName}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        qris: { ...paymentSettings.qris, merchantName: e.target.value }
                      })
                    }
                    placeholder="Contoh: STEAK 11 OFFICIAL"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    NMID / NMOD (Nomor ID Merchant QRIS)
                  </label>
                  <input
                    type="text"
                    value={paymentSettings.qris.nmid}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        qris: { ...paymentSettings.qris, nmid: e.target.value }
                      })
                    }
                    placeholder="Contoh: ID10200300405011"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    URL Gambar QR Code QRIS
                  </label>
                  <input
                    type="text"
                    value={paymentSettings.qris.qrisImageUrl}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        qris: { ...paymentSettings.qris, qrisImageUrl: e.target.value }
                      })
                    }
                    placeholder="https://i.ibb.co/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-mono text-[11px]"
                  />
                </div>

                {paymentSettings.qris.qrisImageUrl && (
                  <div className="p-3 bg-slate-50 dark:bg-purple-950/50 rounded-xl border border-slate-200 dark:border-purple-900 flex items-center gap-3">
                    <img
                      src={paymentSettings.qris.qrisImageUrl}
                      alt="QRIS Preview"
                      className="w-16 h-16 object-contain bg-white p-1 rounded-lg border border-slate-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://i.ibb.co/zWhxV6Bp/Gemini-Generated-Image-vvqchqvvqchqvvqc.png';
                      }}
                    />
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                      <span className="font-bold text-slate-700 dark:text-slate-200 block">Preview QR Code Kasir</span>
                      <span>Kode QR ini akan muncul saat kasir memilih metode bayar QRIS.</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Instruksi Pembayaran QRIS
                  </label>
                  <textarea
                    rows={2}
                    value={paymentSettings.qris.instructions}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        qris: { ...paymentSettings.qris, instructions: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-medium text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 2. BANK TRANSFER SETTINGS */}
            <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-purple-900/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                      2. Transfer Bank (M-Banking & ATM)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Nomor rekening untuk pembayaran via Transfer Bank.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentSettings.transfer.enabled}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        transfer: { ...paymentSettings.transfer, enabled: e.target.checked }
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Nama Bank Utama
                  </label>
                  <input
                    type="text"
                    value={paymentSettings.transfer.bankName}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        transfer: { ...paymentSettings.transfer, bankName: e.target.value }
                      })
                    }
                    placeholder="Contoh: BCA / Mandiri / BRI"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Nomor Rekening
                  </label>
                  <input
                    type="text"
                    value={paymentSettings.transfer.accountNumber}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        transfer: { ...paymentSettings.transfer, accountNumber: e.target.value }
                      })
                    }
                    placeholder="Contoh: 8830-1122-33"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Atas Nama (Pemilik Rekening)
                  </label>
                  <input
                    type="text"
                    value={paymentSettings.transfer.accountHolder}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        transfer: { ...paymentSettings.transfer, accountHolder: e.target.value }
                      })
                    }
                    placeholder="Contoh: PT STEAK SEBELAS NUSANTARA"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-medium uppercase"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Catatan Transfer Kasir
                  </label>
                  <textarea
                    rows={2}
                    value={paymentSettings.transfer.instructions}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        transfer: { ...paymentSettings.transfer, instructions: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-medium text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 3. DEBIT / CREDIT CARD (EDC) SETTINGS */}
            <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-purple-900/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-black">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                      3. Kartu Debit / Kredit (Mesin EDC)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Pembayaran gesek / dip / contactless di Mesin EDC Outlet.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentSettings.debit.enabled}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        debit: { ...paymentSettings.debit, enabled: e.target.checked }
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Bank Provider Mesin EDC
                  </label>
                  <input
                    type="text"
                    value={paymentSettings.debit.bankName}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        debit: { ...paymentSettings.debit, bankName: e.target.value }
                      })
                    }
                    placeholder="Contoh: BCA / Mandiri / BRI EDC"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Terminal ID (TID Mesin)
                  </label>
                  <input
                    type="text"
                    value={paymentSettings.debit.terminalId}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        debit: { ...paymentSettings.debit, terminalId: e.target.value }
                      })
                    }
                    placeholder="Contoh: TID-88192301"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Catatan Kasir EDC
                  </label>
                  <textarea
                    rows={2}
                    value={paymentSettings.debit.instructions}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        debit: { ...paymentSettings.debit, instructions: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-medium text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 4. CASH / TUNAI SETTINGS */}
            <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-purple-900/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-black">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                      4. Pembayaran Tunai (Cash)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Uang tunai fisik & perhitungan uang kembalian otomatis.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentSettings.cash.enabled}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        cash: { ...paymentSettings.cash, enabled: e.target.checked }
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Modal Awal Default Kasir (Laci Kas)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-slate-400">Rp</span>
                    <input
                      type="number"
                      value={paymentSettings.cash.defaultStartingCash}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          cash: {
                            ...paymentSettings.cash,
                            defaultStartingCash: parseInt(e.target.value) || 0
                          }
                        })
                      }
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Tombol Cepat Pecahan Uang (Quick Cash Presets)
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {paymentSettings.cash.quickCashPresets.map((val) => (
                      <span
                        key={val}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs border border-emerald-500/20"
                      >
                        {formatRupiah(val)}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Pilihan pecahan uang tunai pas untuk mempermudah kasir menghitung kembalian.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Action Save Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSavePaymentSettings}
              className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Simpan Pengaturan Pembayaran
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: PENGATURAN STRUK THERMAL */}
      {activeTab === 'receipt' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Panel: Form Settings */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-[#1f0e30] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-xs space-y-5">
              
              <div className="border-b border-slate-100 dark:border-purple-900/40 pb-3">
                <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                  <Printer className="w-5 h-5 text-amber-500" /> Pengaturan Header & Identitas Struk
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ubah nama toko, tagline, alamat, dan nomor kontak yang tercetak pada bagian atas struk.
                </p>
              </div>

              {/* TARGET OUTLET SELECTOR */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 dark:bg-purple-950/60 border border-amber-400/50 space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="font-extrabold text-xs text-[#3D1259] dark:text-amber-300 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-amber-500" />
                      Target Outlet Pengaturan Struk:
                    </label>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Pengaturan khusus per cabang atau 'Semua Outlet (Default Global)'.
                    </p>
                  </div>
                  <select
                    value={selectedOutlet}
                    onChange={(e) => handleOutletChange(e.target.value)}
                    className="px-3.5 py-2 rounded-xl border border-amber-400/80 bg-white dark:bg-[#12071B] text-slate-800 dark:text-amber-300 font-extrabold text-xs focus:outline-none shadow-sm cursor-pointer"
                  >
                    <option value="ALL">🌐 Semua Outlet (Default Global)</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.name}>
                        🏪 {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Nama Toko / Brand Utama di Struk
                  </label>
                  <input
                    type="text"
                    value={receiptSettings.brandTitle}
                    onChange={(e) =>
                      setReceiptSettings({ ...receiptSettings, brandTitle: e.target.value })
                    }
                    placeholder="Contoh: STEAK 11"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-black text-sm"
                  />
                </div>

                {/* EDIT NAMA LOKASI OUTLET DI STRUK */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block flex items-center justify-between">
                    <span>Nama / Lokasi Outlet di Struk (Custom Header Outlet):</span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Bisa Di-edit Bebas</span>
                  </label>
                  <input
                    type="text"
                    value={receiptSettings.customOutletHeader || ''}
                    onChange={(e) =>
                      setReceiptSettings({ ...receiptSettings, customOutletHeader: e.target.value })
                    }
                    placeholder={selectedOutlet !== 'ALL' ? `Contoh: ${selectedOutlet}` : 'Contoh: Outlet Cibubur Utama / Transyogi'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-amber-300 font-extrabold text-xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Teks nama outlet ini akan tercetak langsung di bawah tagline toko pada struk thermal.
                  </p>
                </div>

                {/* LOGO BRAND UPLOAD & URL */}
                <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 space-y-3">
                  <label className="font-bold text-[#3D1259] dark:text-amber-300 block flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-amber-500" /> Foto / Logo Brand Toko
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">Tampil di Header & Struk</span>
                  </label>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={receiptSettings.receiptLogoUrl || ''}
                        onChange={(e) =>
                          setReceiptSettings({ ...receiptSettings, receiptLogoUrl: e.target.value })
                        }
                        placeholder="https://.../logo.png atau Upload File ▶"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-white dark:bg-[#12071B] text-slate-800 dark:text-slate-100 font-medium text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <label className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-all shadow-sm">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              notify('Ukuran file logo terlalu besar! Maksimal 2 MB.');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setReceiptSettings({
                                ...receiptSettings,
                                receiptLogoUrl: reader.result as string
                              });
                              notify('Foto logo brand berhasil diunggah!');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* UKURAN FOTO LOGO SELECTOR */}
                  <div className="pt-2 border-t border-purple-200 dark:border-purple-900/60">
                    <label className="font-bold text-xs text-[#3D1259] dark:text-amber-300 block mb-1">
                      Ukuran Tampilan Foto Logo di Struk Thermal:
                    </label>
                    <select
                      value={receiptSettings.logoSize || 'large'}
                      onChange={(e) =>
                        setReceiptSettings({ ...receiptSettings, logoSize: e.target.value as any })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-white dark:bg-[#12071B] text-slate-800 dark:text-amber-300 font-bold text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="small">Kecil (Small - Height 40px)</option>
                      <option value="medium">Sedang (Medium - Height 56px)</option>
                      <option value="large">⭐ Besar (Large - Height 80px - Recommended)</option>
                      <option value="xlarge">🚀 Ekstra Besar (X-Large - Height 112px Jumbo Logo)</option>
                    </select>
                  </div>

                  {receiptSettings.receiptLogoUrl && (
                    <div className="flex items-center gap-3 pt-1 border-t border-purple-200 dark:border-purple-900/60">
                      <div className="relative w-20 h-20 rounded-xl border-2 border-amber-400/80 p-1 bg-white dark:bg-purple-950 flex items-center justify-center overflow-hidden shadow-sm">
                        <img
                          src={receiptSettings.receiptLogoUrl}
                          alt="Logo Brand"
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setReceiptSettings({ ...receiptSettings, receiptLogoUrl: '' })
                          }
                          className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-red-600 text-white text-[9px] font-bold shadow hover:bg-red-700"
                          title="Hapus Logo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Logo Siap Digunakan
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Tagline / Sub-Header Struk
                  </label>
                  <input
                    type="text"
                    value={receiptSettings.tagline}
                    onChange={(e) =>
                      setReceiptSettings({ ...receiptSettings, tagline: e.target.value })
                    }
                    placeholder="Contoh: MYTHIC CHICKEN TASTE - STEAK AYAM 20K"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Alamat Outlet
                  </label>
                  <textarea
                    rows={2}
                    value={receiptSettings.address}
                    onChange={(e) =>
                      setReceiptSettings({ ...receiptSettings, address: e.target.value })
                    }
                    placeholder="Jl. Raya Cibubur No. 11..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    No. Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={receiptSettings.phone}
                    onChange={(e) =>
                      setReceiptSettings({ ...receiptSettings, phone: e.target.value })
                    }
                    placeholder="0812-1111-1111"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-medium"
                  />
                </div>
              </div>

              {/* FORMAT & RESET NOMOR STRUK */}
              <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 space-y-3">
                <div className="flex items-center justify-between border-b border-purple-200 dark:border-purple-900/60 pb-2">
                  <h4 className="font-extrabold text-xs text-[#3D1259] dark:text-amber-300 flex items-center gap-1.5 font-baloo">
                    <FileText className="w-4 h-4 text-amber-500" /> Format & Reset Nomor Struk
                  </h4>
                  <span className="text-[10px] text-slate-500">Kustomisasi Prefix & Nomor Urut</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      Prefix No. Struk:
                    </label>
                    <input
                      type="text"
                      value={receiptSettings.receiptPrefix || 'ORD-'}
                      onChange={(e) =>
                        setReceiptSettings({ ...receiptSettings, receiptPrefix: e.target.value })
                      }
                      placeholder="Contoh: ORD-, INV-, STR-"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-white dark:bg-[#12071B] text-slate-800 dark:text-slate-100 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      No. Urut Struk Berikutnya:
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={receiptSettings.receiptNextNumber ?? 1}
                      onChange={(e) =>
                        setReceiptSettings({ ...receiptSettings, receiptNextNumber: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-white dark:bg-[#12071B] text-slate-800 dark:text-slate-100 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={receiptSettings.showDateInReceiptNo ?? false}
                      onChange={(e) =>
                        setReceiptSettings({ ...receiptSettings, showDateInReceiptNo: e.target.checked })
                      }
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                    />
                    <span>Sertakan Tanggal di No. Struk (Contoh: ORD-20260812-0001)</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setReceiptSettings({ ...receiptSettings, receiptNextNumber: 1 });
                      notify('Nomor urut struk berhasil di-reset ke 1 (0)!');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-[11px] shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reset No. Struk dari 1 (0)
                  </button>
                </div>
              </div>

              {/* INFORMASI WI-FI PELANGGAN */}
              <div className="p-4 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
                  <input
                    type="checkbox"
                    checked={receiptSettings.showWifiInfo ?? false}
                    onChange={(e) =>
                      setReceiptSettings({ ...receiptSettings, showWifiInfo: e.target.checked })
                    }
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-400"
                  />
                  <span>Tampilkan Informasi Wi-Fi Pelanggan di Struk</span>
                </label>

                {receiptSettings.showWifiInfo && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                        Nama Wi-Fi (SSID):
                      </label>
                      <input
                        type="text"
                        value={receiptSettings.wifiName || ''}
                        onChange={(e) =>
                          setReceiptSettings({ ...receiptSettings, wifiName: e.target.value })
                        }
                        placeholder="Contoh: Steak11_FreeWifi"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-white dark:bg-[#12071B] text-slate-800 dark:text-slate-100 font-medium"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                        Password Wi-Fi:
                      </label>
                      <input
                        type="text"
                        value={receiptSettings.wifiPassword || ''}
                        onChange={(e) =>
                          setReceiptSettings({ ...receiptSettings, wifiPassword: e.target.value })
                        }
                        placeholder="Contoh: steak11lezat"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-white dark:bg-[#12071B] text-slate-800 dark:text-slate-100 font-mono font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION: PENGATURAN KONEKSI MESIN PRINTER STRUK (BLUETOOTH & USB/LAN/BIASA) */}
              <div className="p-4 rounded-2xl bg-[#3D1259]/5 dark:bg-purple-950/60 border border-purple-300/80 dark:border-purple-800 space-y-4">
                <div className="flex items-center justify-between border-b border-purple-200 dark:border-purple-900/60 pb-2.5">
                  <div>
                    <h4 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-300 flex items-center gap-2 font-baloo">
                      <Printer className="w-4 h-4 text-amber-500" /> Pengaturan Koneksi Perangkat Mesin Struk
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Hubungkan aplikasi kasir ke mesin printer struk biasa (USB/System Driver) atau Bluetooth Portable.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-400/20 text-purple-950 dark:text-amber-300 font-extrabold text-[10px] uppercase">
                    {receiptSettings.printerConnectionType === 'web_bluetooth'
                      ? '📶 Bluetooth'
                      : receiptSettings.printerConnectionType === 'web_usb'
                      ? '🔌 USB Direct'
                      : receiptSettings.printerConnectionType === 'network_lan'
                      ? '🌐 IP Network LAN'
                      : '🖨️ Printer Biasa / Driver System'}
                  </span>
                </div>

                {/* MODE SELECTION GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Mode 1: System Printer (Printer Biasa / Driver Windows) */}
                  <div
                    onClick={() =>
                      setReceiptSettings({ ...receiptSettings, printerConnectionType: 'system_dialog' })
                    }
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-2.5 ${
                      (receiptSettings.printerConnectionType || 'system_dialog') === 'system_dialog'
                        ? 'border-amber-400 bg-amber-400/10 text-purple-950 dark:text-amber-300 font-extrabold shadow-xs'
                        : 'border-slate-200 dark:border-purple-900 bg-white/70 dark:bg-purple-950/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <Printer className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold">1. Printer Biasa / System OS Driver</div>
                      <div className="text-[10px] opacity-80 leading-tight mt-0.5">
                        Menghubungkan via Driver Windows/Mac/Linux (Spooler Cetak Browser & Bluetooth).
                      </div>
                    </div>
                  </div>

                  {/* Mode 2: Web Bluetooth Portable */}
                  <div
                    onClick={() =>
                      setReceiptSettings({ ...receiptSettings, printerConnectionType: 'web_bluetooth' })
                    }
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-2.5 ${
                      receiptSettings.printerConnectionType === 'web_bluetooth'
                        ? 'border-amber-400 bg-amber-400/10 text-purple-950 dark:text-amber-300 font-extrabold shadow-xs'
                        : 'border-slate-200 dark:border-purple-900 bg-white/70 dark:bg-purple-950/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <Bluetooth className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold">2. Bluetooth Portable (58/80mm)</div>
                      <div className="text-[10px] opacity-80 leading-tight mt-0.5">
                        Koneksi langsung tanpa kabel via Web Bluetooth API (Android & Chrome OS).
                      </div>
                    </div>
                  </div>

                  {/* Mode 3: WebUSB Direct */}
                  <div
                    onClick={() =>
                      setReceiptSettings({ ...receiptSettings, printerConnectionType: 'web_usb' })
                    }
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-2.5 ${
                      receiptSettings.printerConnectionType === 'web_usb'
                        ? 'border-amber-400 bg-amber-400/10 text-purple-950 dark:text-amber-300 font-extrabold shadow-xs'
                        : 'border-slate-200 dark:border-purple-900 bg-white/70 dark:bg-purple-950/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <Usb className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold">3. Printer Kasir USB Direct</div>
                      <div className="text-[10px] opacity-80 leading-tight mt-0.5">
                        Cetak cepat tanpa dialog via kabel USB (ESC/POS Epson/Xprinter).
                      </div>
                    </div>
                  </div>

                  {/* Mode 4: Network LAN / IP */}
                  <div
                    onClick={() =>
                      setReceiptSettings({ ...receiptSettings, printerConnectionType: 'network_lan' })
                    }
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-2.5 ${
                      receiptSettings.printerConnectionType === 'network_lan'
                        ? 'border-amber-400 bg-amber-400/10 text-purple-950 dark:text-amber-300 font-extrabold shadow-xs'
                        : 'border-slate-200 dark:border-purple-900 bg-white/70 dark:bg-purple-950/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <Wifi className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold">4. Network Ethernet LAN / Wi-Fi IP</div>
                      <div className="text-[10px] opacity-80 leading-tight mt-0.5">
                        Printer dapur/kasir jaringan IP LAN Port 9100.
                      </div>
                    </div>
                  </div>
                </div>

                {/* DETAILED PAIRING & ACTIONS ACCORDING TO SELECTED MODE */}
                {receiptSettings.printerConnectionType === 'web_bluetooth' && (
                  <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-400/40 space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-extrabold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                          <Bluetooth className="w-4 h-4 text-blue-500" /> Perangkat Bluetooth Terhubung:
                        </span>
                        <span className="font-mono font-extrabold text-slate-800 dark:text-amber-300 block text-xs mt-0.5">
                          {receiptSettings.connectedBluetoothName || 'Belum Ada Perangkat Bluetooth Terhubung'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          if (!(navigator as any).bluetooth) {
                            notify('Browser tidak mendukung Web Bluetooth API. Gunakan Google Chrome / Edge.');
                            return;
                          }
                          try {
                            const device = await (navigator as any).bluetooth.requestDevice({
                              acceptAllDevices: true,
                              optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb', 'e7810a71-73ae-499d-8c15-faa9aeef0c3f']
                            });
                            if (device) {
                              setReceiptSettings({
                                ...receiptSettings,
                                printerConnectionType: 'web_bluetooth',
                                connectedBluetoothName: device.name || 'BT Printer Portable',
                                connectedBluetoothDeviceId: device.id
                              });
                              notify(`Printer Bluetooth "${device.name || 'Perangkat BT'}" berhasil tersambung!`);
                            }
                          } catch (err: any) {
                            if (err.name !== 'NotFoundError') {
                              notify(`Gagal pairing Bluetooth: ${err.message || err}`);
                            }
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all shrink-0"
                      >
                        <Bluetooth className="w-4 h-4" /> Cari & Sambungkan Bluetooth
                      </button>
                    </div>
                  </div>
                )}

                {receiptSettings.printerConnectionType === 'web_usb' && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-400/40 space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-extrabold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                          <Usb className="w-4 h-4 text-emerald-500" /> Perangkat USB Kasir Terhubung:
                        </span>
                        <span className="font-mono font-extrabold text-slate-800 dark:text-amber-300 block text-xs mt-0.5">
                          {receiptSettings.connectedUsbName || 'Belum Ada Perangkat USB Terdeteksi'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          if (!(navigator as any).usb) {
                            notify('Browser tidak mendukung WebUSB API.');
                            return;
                          }
                          try {
                            const device = await (navigator as any).usb.requestDevice({ filters: [] });
                            if (device) {
                              const devName = device.productName || `USB Printer (Vendor: ${device.vendorId})`;
                              setReceiptSettings({
                                ...receiptSettings,
                                printerConnectionType: 'web_usb',
                                connectedUsbName: devName
                              });
                              notify(`Printer USB "${devName}" berhasil terdeteksi!`);
                            }
                          } catch (err: any) {
                            if (err.name !== 'NotFoundError') {
                              notify(`Gagal deteksi USB: ${err.message || err}`);
                            }
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all shrink-0"
                      >
                        <Usb className="w-4 h-4" /> Deteksi Perangkat USB
                      </button>
                    </div>
                  </div>
                )}

                {receiptSettings.printerConnectionType === 'network_lan' && (
                  <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-400/40 space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                          Alamat IP Printer Network LAN:
                        </label>
                        <input
                          type="text"
                          value={receiptSettings.networkPrinterIp || '192.168.1.200'}
                          onChange={(e) =>
                            setReceiptSettings({ ...receiptSettings, networkPrinterIp: e.target.value })
                          }
                          placeholder="192.168.1.200"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-white dark:bg-[#12071B] text-slate-800 dark:text-slate-100 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                          Port Printer (Default: 9100 RAW):
                        </label>
                        <input
                          type="number"
                          value={receiptSettings.networkPrinterPort || 9100}
                          onChange={(e) =>
                            setReceiptSettings({ ...receiptSettings, networkPrinterPort: parseInt(e.target.value) || 9100 })
                          }
                          placeholder="9100"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-white dark:bg-[#12071B] text-slate-800 dark:text-slate-100 font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* PRINTER HARDWARE OPTIONS & TEST PRINT */}
                <div className="pt-2 border-t border-purple-200 dark:border-purple-900/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-white/60 dark:bg-purple-950/40 border border-slate-200 dark:border-purple-900">
                    <input
                      type="checkbox"
                      checked={receiptSettings.autoCutPaper ?? true}
                      onChange={(e) =>
                        setReceiptSettings({ ...receiptSettings, autoCutPaper: e.target.checked })
                      }
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                    />
                    <span>✂️ Potong Kertas Otomatis (Auto Paper Cutter ESC/POS)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-white/60 dark:bg-purple-950/40 border border-slate-200 dark:border-purple-900">
                    <input
                      type="checkbox"
                      checked={receiptSettings.openCashDrawer ?? false}
                      onChange={(e) =>
                        setReceiptSettings({ ...receiptSettings, openCashDrawer: e.target.checked })
                      }
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                    />
                    <span>💵 Buka Laci Uang Kasir (Cash Drawer Kick Pin 2)</span>
                  </label>
                </div>

                <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Jumlah Cetak Lembar Struk:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={receiptSettings.printCopies || 1}
                      onChange={(e) =>
                        setReceiptSettings({ ...receiptSettings, printCopies: parseInt(e.target.value) || 1 })
                      }
                      className="w-16 px-2 py-1 rounded-lg border border-slate-200 dark:border-purple-900 bg-white dark:bg-[#12071B] text-slate-800 dark:text-slate-100 font-extrabold text-xs text-center"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (receiptSettings.printerConnectionType === 'system_dialog' || !receiptSettings.printerConnectionType) {
                        window.print();
                        notify('Perintah uji coba cetak sampel dikirim ke printer sistem!');
                      } else {
                        notify(`Uji coba cetak berhasil dikirim ke printer (${receiptSettings.printerConnectionType})!`);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Printer className="w-4 h-4" /> Uji Coba Cetak (Test Print)
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-purple-900/40 pt-4 space-y-4">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-500" /> Ukuran Kertas Default & Tampilan
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReceiptSettings({ ...receiptSettings, paperWidth: '58mm' })}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      receiptSettings.paperWidth === '58mm'
                        ? 'border-amber-400 bg-amber-400/10 text-[#3D1259] dark:text-amber-300 font-extrabold'
                        : 'border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold">Kertas 58 mm</div>
                    <div className="text-[10px] opacity-80">Printer Thermal Portable Bluetooth</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReceiptSettings({ ...receiptSettings, paperWidth: '80mm' })}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      receiptSettings.paperWidth === '80mm'
                        ? 'border-amber-400 bg-amber-400/10 text-[#3D1259] dark:text-amber-300 font-extrabold'
                        : 'border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold">Kertas 80 mm</div>
                    <div className="text-[10px] opacity-80">Printer Thermal Kasir Standar USB/LAN</div>
                  </button>
                </div>

                <div className="space-y-2.5 pt-2 text-xs font-semibold">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={receiptSettings.showCashierName ?? true}
                      onChange={(e) =>
                        setReceiptSettings({
                          ...receiptSettings,
                          showCashierName: e.target.checked
                        })
                      }
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                    />
                    <span>Tampilkan Nama Kasir di Struk</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={receiptSettings.showCustomerName ?? true}
                      onChange={(e) =>
                        setReceiptSettings({
                          ...receiptSettings,
                          showCustomerName: e.target.checked
                        })
                      }
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                    />
                    <span>Tampilkan Nama Pelanggan di Struk</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={receiptSettings.showTableNumber ?? true}
                      onChange={(e) =>
                        setReceiptSettings({
                          ...receiptSettings,
                          showTableNumber: e.target.checked
                        })
                      }
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                    />
                    <span>Tampilkan Tipe Layanan & No Meja (Dine In / Takeaway)</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={receiptSettings.showTax ?? true}
                      onChange={(e) =>
                        setReceiptSettings({
                          ...receiptSettings,
                          showTax: e.target.checked
                        })
                      }
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                    />
                    <span>Tampilkan PPN Resto (10%)</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={receiptSettings.showFooterPromo ?? true}
                      onChange={(e) =>
                        setReceiptSettings({
                          ...receiptSettings,
                          showFooterPromo: e.target.checked
                        })
                      }
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                    />
                    <span>Tampilkan Pesan Promo & Media Sosial di Footer</span>
                  </label>
                </div>
              </div>

              {/* Footer text settings */}
              <div className="border-t border-slate-100 dark:border-purple-900/40 pt-4 space-y-3 text-xs">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                  Pesan Footer Struk
                </h4>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Pesan Terima Kasih
                  </label>
                  <input
                    type="text"
                    value={receiptSettings.footerThankYouMessage}
                    onChange={(e) =>
                      setReceiptSettings({
                        ...receiptSettings,
                        footerThankYouMessage: e.target.value
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Pesan Promo / Voucher Struk
                  </label>
                  <input
                    type="text"
                    value={receiptSettings.footerPromoText}
                    onChange={(e) =>
                      setReceiptSettings({
                        ...receiptSettings,
                        footerPromoText: e.target.value
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Social Media / Website
                  </label>
                  <input
                    type="text"
                    value={receiptSettings.socialMediaText}
                    onChange={(e) =>
                      setReceiptSettings({
                        ...receiptSettings,
                        socialMediaText: e.target.value
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveReceiptSettings}
                  className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Simpan Format Struk
                </button>
              </div>

            </div>
          </div>

          {/* Right Panel: Live Receipt Preview Box */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-6 bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-purple-900/40">
                <span className="font-extrabold text-xs text-[#3D1259] dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Simulasi Struk Realtime
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/20 text-purple-900 dark:text-amber-300 font-bold">
                  {receiptSettings.paperWidth}
                </span>
              </div>

              {/* Thermal Receipt Box Simulation */}
              <div className="flex justify-center my-1">
                <div
                  style={{ width: receiptSettings.paperWidth === '58mm' ? '270px' : '330px' }}
                  className="bg-amber-50/90 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 rounded-lg border-2 border-dashed border-amber-300 dark:border-amber-500/40 shadow-inner font-mono text-[11px] leading-relaxed transition-all"
                >
                  {/* Header */}
                  <div className="text-center space-y-0.5 mb-2">
                    {receiptSettings.receiptLogoUrl && (
                      <div className="flex justify-center mb-1.5">
                        <img
                          src={receiptSettings.receiptLogoUrl}
                          alt="Logo Brand"
                          className={`${
                            receiptSettings.logoSize === 'small'
                              ? 'h-10 max-w-[120px]'
                              : receiptSettings.logoSize === 'medium'
                              ? 'h-14 max-w-[160px]'
                              : receiptSettings.logoSize === 'xlarge'
                              ? 'h-28 max-w-[260px]'
                              : 'h-20 max-w-[200px]'
                          } object-contain`}
                        />
                      </div>
                    )}
                    <h2 className="font-extrabold text-sm tracking-widest text-amber-600 dark:text-amber-400">
                      {receiptSettings.brandTitle || 'STEAK 11'}
                    </h2>
                    <p className="text-[9px] font-bold text-slate-600 dark:text-slate-400">
                      {receiptSettings.tagline || 'MYTHIC CHICKEN TASTE'}
                    </p>
                    <p className="text-[9px] text-slate-700 dark:text-slate-300">
                      Outlet Cibubur
                    </p>
                    <p className="text-[8px] text-slate-500 dark:text-slate-400">
                      {receiptSettings.address || 'Jl. Raya Cibubur No. 11'}
                    </p>
                    {receiptSettings.phone && (
                      <p className="text-[8px] text-slate-500 dark:text-slate-400">
                        Telp: {receiptSettings.phone}
                      </p>
                    )}
                  </div>

                  <div className="border-b border-dashed border-slate-400 dark:border-slate-600 my-2"></div>

                  {/* Metadata */}
                  <div className="text-[10px] space-y-0.5 text-slate-700 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span>No. Struk:</span>
                      <span className="font-bold">ORD-881923</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Waktu:</span>
                      <span>11/08/2026 18:30</span>
                    </div>
                    {receiptSettings.showCashierName && (
                      <div className="flex justify-between">
                        <span>Kasir:</span>
                        <span>Kasir Budi</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Pelanggan:</span>
                      <span className="font-bold">Walk-in Customer</span>
                    </div>
                  </div>

                  <div className="border-b border-dashed border-slate-400 dark:border-slate-600 my-2"></div>

                  {/* Sample Items */}
                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between font-semibold">
                      <span>1x Steak Ayam Original</span>
                      <span>Rp 20.000</span>
                    </div>
                    <div className="text-[9px] text-slate-500 pl-2">Saus: Barbeque Hot</div>

                    <div className="flex justify-between font-semibold">
                      <span>1x Es Teh Manis Jumbo</span>
                      <span>Rp 5.000</span>
                    </div>
                  </div>

                  <div className="border-b border-dashed border-slate-400 dark:border-slate-600 my-2"></div>

                  {/* Totals */}
                  <div className="space-y-0.5 text-[10px]">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>Rp 25.000</span>
                    </div>
                    {receiptSettings.showTax && (
                      <div className="flex justify-between text-slate-500">
                        <span>PPN Resto (10%):</span>
                        <span>Rp 2.500</span>
                      </div>
                    )}
                    <div className="flex justify-between font-extrabold text-xs text-amber-600 dark:text-amber-400 pt-1 border-t border-slate-300 dark:border-slate-700">
                      <span>TOTAL:</span>
                      <span>{receiptSettings.showTax ? 'Rp 27.500' : 'Rp 25.000'}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 pt-0.5">
                      <span>Metode Bayar:</span>
                      <span className="font-bold">QRIS</span>
                    </div>
                  </div>

                  <div className="border-b-2 border-double border-slate-400 dark:border-slate-600 my-2"></div>

                  {/* Footer */}
                  {receiptSettings.showFooterPromo && (
                    <div className="text-center space-y-0.5 text-[8px] text-slate-500 dark:text-slate-400">
                      <p className="font-bold text-slate-700 dark:text-slate-300 text-[9px]">
                        {receiptSettings.footerThankYouMessage || 'TERIMA KASIH ATAS KUNJUNGAN ANDA!'}
                      </p>
                      <p>{receiptSettings.footerPromoText}</p>
                      <p className="italic">{receiptSettings.socialMediaText}</p>
                      <div className="pt-1 font-mono text-[7px] text-slate-400">
                        *** {receiptSettings.brandTitle || 'STEAK 11'} CASHIER ***
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center italic">
                Pratinjau langsung tampilan struk saat dicetak ke printer thermal.
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
