import React, { useState, useEffect } from 'react';
import { Printer, Bluetooth, X, Download, CheckCircle2, AlertCircle, FileText, Smartphone, Building2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { OrderItem } from '../types';
import { formatRupiah, getStoredReceiptSettings } from '../utils';

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderItem | null;
  brandName?: string;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  brandName = 'STEAK 11',
}) => {
  const receiptConfig = getStoredReceiptSettings(order?.outlet);
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>(receiptConfig.paperWidth || '58mm');
  const [bluetoothStatus, setBluetoothStatus] = useState<string | null>(null);
  const [isBluetoothConnecting, setIsBluetoothConnecting] = useState(false);
  const [overrideOutlet, setOverrideOutlet] = useState<string>('');

  useEffect(() => {
    if (isOpen && order) {
      const cfg = getStoredReceiptSettings(order?.outlet);
      setPaperWidth(cfg.paperWidth || '58mm');
      setOverrideOutlet(cfg.customOutletHeader || order.outlet || 'Steak 11 Outlet');
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, order?.outlet]);

  if (!isOpen || !order) return null;

  const displayBrand = receiptConfig.brandTitle || brandName;
  const displayTagline = receiptConfig.tagline || 'MYTHIC CHICKEN TASTE';
  const receiptLogo = receiptConfig.receiptLogoUrl;
  const logoSize = receiptConfig.logoSize || 'large';
  
  const logoClass = logoSize === 'small'
    ? 'h-10 max-w-[120px]'
    : logoSize === 'medium'
    ? 'h-14 max-w-[160px]'
    : logoSize === 'xlarge'
    ? 'h-28 max-w-[260px]'
    : 'h-20 max-w-[200px]';
  const displayAddress = order.addressOrTime || receiptConfig.address || 'Steak 11 Branch Outlet';
  const displayPhone = receiptConfig.phone || '0812-1111-1111';
  const displayFooterMsg = receiptConfig.footerThankYouMessage || 'TERIMA KASIH ATAS KUNJUNGAN ANDA!';
  const displayFooterPromo = receiptConfig.footerPromoText || 'Simpan struk ini untuk promo!';
  const displaySosmed = receiptConfig.socialMediaText || 'Instagram & TikTok: @steak11.official';

  const charsPerLine = paperWidth === '58mm' ? 32 : 48;

  // Format line helper
  const formatLineTwoCols = (left: string, right: string): string => {
    const total = charsPerLine;
    const spaceCount = Math.max(1, total - left.length - right.length);
    return left + ' '.repeat(spaceCount) + right;
  };

  const lineSeparator = '-'.repeat(charsPerLine);
  const doubleSeparator = '='.repeat(charsPerLine);

  // Web Bluetooth ESC/POS Printing
  const handleBluetoothPrint = async () => {
    setIsBluetoothConnecting(true);
    setBluetoothStatus('Mencari Printer Bluetooth Thermal (58mm/80mm)...');

    try {
      if (!('bluetooth' in navigator) || !(navigator as any).bluetooth) {
        throw new Error('Browser atau lingkungan Anda tidak mendukung Web Bluetooth API. Gunakan Google Chrome / Edge versi desktop.');
      }

      // Request Bluetooth device
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb', // Common printer service UUID
          '0000ff00-0000-1000-8000-00805f9b34fb',
          '00004953-0000-1000-8000-00805f9b34fb',
          'e7810a71-73ae-499d-8c15-faa9aef0c3f2'
        ]
      });

      setBluetoothStatus(`Terhubung ke ${device.name || 'Printer Bluetooth'}! Mengirim perintah cetak...`);

      const server = await device.gatt.connect();
      const services = await server.getPrimaryServices();

      if (!services || services.length === 0) {
        throw new Error('Layanan printer tidak ditemukan pada perangkat Bluetooth ini.');
      }

      // Find characteristic
      let writeCharacteristic: any = null;
      for (const service of services) {
        const characteristics = await service.getCharacteristics();
        for (const char of characteristics) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            writeCharacteristic = char;
            break;
          }
        }
        if (writeCharacteristic) break;
      }

      if (!writeCharacteristic) {
        throw new Error('Karakteristik penulisan data printer tidak ditemukan.');
      }

      // Construct ESC/POS bytes
      const encoder = new TextEncoder();
      const initCommand = new Uint8Array([0x1B, 0x40]); // ESC @
      const centerAlign = new Uint8Array([0x1B, 0x61, 0x01]); // ESC a 1
      const leftAlign = new Uint8Array([0x1B, 0x61, 0x00]); // ESC a 0
      const boldOn = new Uint8Array([0x1B, 0x45, 0x01]); // ESC E 1
      const boldOff = new Uint8Array([0x1B, 0x45, 0x00]); // ESC E 0
      const doubleSize = new Uint8Array([0x1D, 0x21, 0x11]); // GS ! 11
      const normalSize = new Uint8Array([0x1D, 0x21, 0x00]); // GS ! 00
      const feedLines = new Uint8Array([0x1B, 0x64, 0x04]); // ESC d 4

      // ESC/POS String content
      let escText = '';
      escText += `${displayBrand}\n`;
      escText += `${displayTagline}\n`;
      escText += `${overrideOutlet}\n`;
      escText += `${displayAddress}\n`;
      if (displayPhone) escText += `Telp: ${displayPhone}\n`;
      escText += `${lineSeparator}\n`;
      escText += `ID: ${order.id}\n`;
      escText += `Tgl: ${order.date} ${order.createdTime || ''}\n`;
      if (receiptConfig.showCashierName) escText += `Kasir: ${order.cashierName || 'Kasir POS'}\n`;
      if (receiptConfig.showCustomerName) escText += `Pelanggan: ${order.customerName}\n`;
      if (receiptConfig.showServiceType) escText += `Layanan: ${order.serviceType} ${order.tableNumber ? `(${order.tableNumber})` : ''}\n`;
      escText += `${lineSeparator}\n`;
      escText += `${order.itemsSummary}\n`;
      escText += `${lineSeparator}\n`;
      if (order.subtotal) escText += `${formatLineTwoCols('Subtotal', formatRupiah(order.subtotal))}\n`;
      if (order.discountAmount) escText += `${formatLineTwoCols('Diskon', `- ${formatRupiah(order.discountAmount)}`)}\n`;
      if (receiptConfig.showTax && order.taxAmount) escText += `${formatLineTwoCols('PPN (10%)', formatRupiah(order.taxAmount))}\n`;
      escText += `${formatLineTwoCols('TOTAL', formatRupiah(order.total))}\n`;
      escText += `${formatLineTwoCols('Metode', order.paymentMethod || 'Cash')}\n`;
      if (order.cashPaid) escText += `${formatLineTwoCols('Tunai', formatRupiah(order.cashPaid))}\n`;
      if (order.changeAmount !== undefined) escText += `${formatLineTwoCols('Kembalian', formatRupiah(order.changeAmount))}\n`;
      if (receiptConfig.showWifiInfo && receiptConfig.wifiName) {
        escText += `${lineSeparator}\n`;
        escText += `Wi-Fi: ${receiptConfig.wifiName} | Pass: ${receiptConfig.wifiPassword || '-'}\n`;
      }
      escText += `${doubleSeparator}\n`;
      escText += `${displayFooterMsg}\n`;
      if (receiptConfig.showFooterPromo && displayFooterPromo) escText += `${displayFooterPromo}\n`;
      if (displaySosmed) escText += `${displaySosmed}\n`;
      escText += `\n\n\n`;

      // Send bytes in chunks
      await writeCharacteristic.writeValue(initCommand);
      await writeCharacteristic.writeValue(centerAlign);
      await writeCharacteristic.writeValue(boldOn);
      await writeCharacteristic.writeValue(doubleSize);
      await writeCharacteristic.writeValue(encoder.encode(`${displayBrand}\n`));
      await writeCharacteristic.writeValue(normalSize);
      await writeCharacteristic.writeValue(boldOff);
      await writeCharacteristic.writeValue(leftAlign);
      await writeCharacteristic.writeValue(encoder.encode(escText));
      await writeCharacteristic.writeValue(feedLines);

      setBluetoothStatus('✅ Struk berhasil dicetak ke Printer Bluetooth!');
      setTimeout(() => setBluetoothStatus(null), 5000);
    } catch (err: any) {
      console.warn('Bluetooth Print Error:', err);
      let errMsg = err?.message || 'Gagal menyambung ke printer Bluetooth.';
      if (
        err?.name === 'SecurityError' || 
        errMsg.toLowerCase().includes('permissions policy') || 
        errMsg.toLowerCase().includes('disallowed') || 
        errMsg.toLowerCase().includes('not allowed')
      ) {
        errMsg = 'Akses Bluetooth diblokir oleh kebijakan keamanan iFrame preview. Silakan gunakan tombol "Cetak USB / Driver" atau buka aplikasi di Tab Baru browser.';
      } else if (err?.name === 'NotFoundError' || errMsg.toLowerCase().includes('cancelled') || errMsg.toLowerCase().includes('dibatalkan')) {
        errMsg = 'Pencarian perangkat Bluetooth dibatalkan oleh pengguna.';
      }
      setBluetoothStatus(`❌ ${errMsg}`);
    } finally {
      setIsBluetoothConnecting(false);
    }
  };

  // Browser / Driver Print
  const handleBrowserPrint = () => {
    window.print();
  };

  // Download PDF Struk
  const handleDownloadPdfReceipt = () => {
    const doc = new jsPDF({
      unit: 'mm',
      format: paperWidth === '58mm' ? [58, 160] : [80, 200]
    });

    const startX = 4;
    let currentY = 8;
    const width = paperWidth === '58mm' ? 50 : 72;

    doc.setFont('courier', 'bold');
    doc.setFontSize(12);
    doc.text(brandName, startX + width / 2, currentY, { align: 'center' });

    currentY += 5;
    doc.setFontSize(8);
    doc.setFont('courier', 'normal');
    doc.text('MYTHIC CHICKEN TASTE', startX + width / 2, currentY, { align: 'center' });

    currentY += 4;
    doc.text(order.outlet, startX + width / 2, currentY, { align: 'center' });

    currentY += 4;
    doc.text(lineSeparator, startX, currentY);

    currentY += 4;
    doc.text(`ID: ${order.id}`, startX, currentY);
    currentY += 4;
    doc.text(`Tgl: ${order.date} ${order.createdTime || ''}`, startX, currentY);
    currentY += 4;
    doc.text(`Kasir: ${order.cashierName || 'Kasir 1'}`, startX, currentY);
    currentY += 4;
    doc.text(`Pelanggan: ${order.customerName}`, startX, currentY);
    currentY += 4;
    doc.text(`Layanan: ${order.serviceType} ${order.tableNumber ? `(${order.tableNumber})` : ''}`, startX, currentY);

    currentY += 4;
    doc.text(lineSeparator, startX, currentY);

    currentY += 4;
    doc.text(order.itemsSummary, startX, currentY);

    currentY += 6;
    doc.text(lineSeparator, startX, currentY);

    if (order.subtotal) {
      currentY += 4;
      doc.text(formatLineTwoCols('Subtotal', formatRupiah(order.subtotal)), startX, currentY);
    }
    if (order.discountAmount) {
      currentY += 4;
      doc.text(formatLineTwoCols('Diskon', `- ${formatRupiah(order.discountAmount)}`), startX, currentY);
    }
    currentY += 4;
    doc.setFont('courier', 'bold');
    doc.text(formatLineTwoCols('TOTAL', formatRupiah(order.total)), startX, currentY);
    doc.setFont('courier', 'normal');

    currentY += 4;
    doc.text(formatLineTwoCols('Bayar (' + (order.paymentMethod || 'Cash') + ')', formatRupiah(order.cashPaid || order.total)), startX, currentY);
    if (order.changeAmount !== undefined) {
      currentY += 4;
      doc.text(formatLineTwoCols('Kembalian', formatRupiah(order.changeAmount)), startX, currentY);
    }

    currentY += 5;
    doc.text(doubleSeparator, startX, currentY);

    currentY += 5;
    doc.text('TERIMA KASIH ATAS KUNJUNGAN ANDA!', startX + width / 2, currentY, { align: 'center' });
    currentY += 4;
    doc.text('Simpan Struk Ini Untuk Promo!', startX + width / 2, currentY, { align: 'center' });

    doc.save(`Struk_Steak11_${order.id}.pdf`);
  };

  return (
    <div 
      className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-4 bg-purple-950/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-white dark:bg-[#1a0c28] text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl border border-purple-900/50 p-5 sm:p-6 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-purple-900/50 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-purple-950 flex items-center justify-center font-black shadow-sm">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base font-baloo text-[#3D1259] dark:text-amber-400 leading-tight">
                Cetak Struk Kasir Thermal
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Dukungan Printer Thermal Bluetooth 58mm / 80mm & USB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-extrabold text-xs transition-all cursor-pointer border border-rose-200 dark:border-rose-900/50"
            title="Tutup Struk"
          >
            <span>Tutup</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body Container */}
        <div className="overflow-y-auto flex-1 my-3 pr-1 space-y-4 custom-scrollbar">
          {/* Paper Size Selector */}
          <div className="flex items-center justify-between bg-slate-100 dark:bg-purple-950/70 p-2.5 rounded-xl border border-slate-200 dark:border-purple-900/60 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-amber-500" /> Ukuran Kertas Struk:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPaperWidth('58mm')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  paperWidth === '58mm'
                    ? 'bg-amber-400 text-purple-950 shadow-sm font-extrabold'
                    : 'bg-white dark:bg-purple-900/50 text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                58 mm (Kecil/Mobile)
              </button>
              <button
                type="button"
                onClick={() => setPaperWidth('80mm')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  paperWidth === '80mm'
                    ? 'bg-amber-400 text-purple-950 shadow-sm font-extrabold'
                    : 'bg-white dark:bg-purple-900/50 text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                80 mm (Standar POS)
              </button>
            </div>
          </div>

          {/* Edit Outlet Header On-The-Fly Bar */}
          <div className="bg-amber-500/10 dark:bg-purple-950/70 p-2.5 rounded-xl border border-amber-400/40 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-extrabold text-slate-800 dark:text-amber-300 flex items-center gap-1.5 shrink-0">
                <Building2 className="w-4 h-4 text-amber-500" /> Edit Outlet di Struk:
              </span>
              <input
                type="text"
                value={overrideOutlet}
                onChange={(e) => setOverrideOutlet(e.target.value)}
                placeholder="Tulis / Edit nama outlet di struk..."
                className="w-full sm:w-64 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-purple-800 bg-white dark:bg-[#12071B] text-slate-800 dark:text-slate-100 font-extrabold text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Bluetooth Status Notification */}
          {bluetoothStatus && (
            <div className="p-3.5 rounded-xl bg-purple-900/30 border border-purple-500/40 text-purple-900 dark:text-purple-100 text-xs font-semibold flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <Bluetooth className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{bluetoothStatus}</span>
              </div>
              {bluetoothStatus.includes('diblokir') && (
                <div className="flex items-center gap-2 pt-1 border-t border-purple-500/20 text-[11px]">
                  <button
                    type="button"
                    onClick={handleBrowserPrint}
                    className="px-2.5 py-1 rounded-lg bg-amber-400 text-purple-950 font-extrabold hover:bg-amber-300 transition-all cursor-pointer"
                  >
                    Gunakan Cetak Driver / USB
                  </button>
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-purple-800 text-white font-extrabold hover:bg-purple-700 transition-all cursor-pointer underline"
                  >
                    Buka Tab Baru ↗
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Thermal Receipt Visual Preview Box */}
          <div className="flex justify-center my-2">
            <div
              id="thermal-receipt-printable"
              style={{ width: paperWidth === '58mm' ? '280px' : '360px' }}
              className="bg-amber-50/90 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-5 rounded-lg border-2 border-dashed border-amber-300 dark:border-amber-500/40 shadow-inner font-mono text-xs leading-relaxed transition-all max-h-[55vh] overflow-y-auto custom-scrollbar"
            >
              {/* Receipt Header */}
              <div className="text-center space-y-1 mb-3">
                {receiptLogo && (
                  <div className="flex justify-center mb-2">
                    <img
                      src={receiptLogo}
                      alt="Logo Brand"
                      className={`${logoClass} object-contain`}
                    />
                  </div>
                )}
                <h2 className="font-extrabold text-base tracking-widest text-amber-600 dark:text-amber-400">
                  {displayBrand}
                </h2>
                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                  {displayTagline}
                </p>
                {(receiptConfig.showOutletLocation ?? true) && (
                  <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    {overrideOutlet || receiptConfig.customOutletHeader || order.outlet}
                  </p>
                )}
                <p className="text-[9px] text-slate-500 dark:text-slate-400">
                  {displayAddress} {displayPhone ? `| Telp: ${displayPhone}` : ''}
                </p>

                {receiptConfig.showWifiInfo && receiptConfig.wifiName && (
                  <div className="mt-1 p-1 rounded bg-amber-500/10 border border-amber-400/30 text-[9px] text-amber-900 dark:text-amber-300">
                    📶 Wi-Fi: <span className="font-bold">{receiptConfig.wifiName}</span> | Pass: <span className="font-mono font-bold">{receiptConfig.wifiPassword || '-'}</span>
                  </div>
                )}
              </div>

              <div className="border-b border-dashed border-slate-400 dark:border-slate-600 my-2"></div>

              {/* Receipt Metadata */}
              <div className="text-[11px] space-y-0.5 text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>No. Struk:</span>
                  <span className="font-bold">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waktu:</span>
                  <span>{order.date} {order.createdTime || '18:00'}</span>
                </div>
                {(receiptConfig.showCashierName ?? true) && (
                  <div className="flex justify-between">
                    <span>Kasir:</span>
                    <span>{order.cashierName || 'Kasir 1'}</span>
                  </div>
                )}
                {(receiptConfig.showCustomerName ?? true) && (
                  <div className="flex justify-between">
                    <span>Pelanggan:</span>
                    <span className="font-bold">{order.customerName}</span>
                  </div>
                )}
                {(receiptConfig.showTableNumber ?? true) && (
                  <div className="flex justify-between">
                    <span>Layanan:</span>
                    <span className="font-bold">{order.serviceType} {order.tableNumber ? `(${order.tableNumber})` : ''}</span>
                  </div>
                )}
              </div>

              <div className="border-b border-dashed border-slate-400 dark:border-slate-600 my-2"></div>

              {/* Itemized Order Details */}
              <div className="space-y-1 text-[11px]">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  {order.itemsSummary}
                </div>
              </div>

              <div className="border-b border-dashed border-slate-400 dark:border-slate-600 my-2"></div>

              {/* Financial Totals */}
              <div className="space-y-1 text-[11px]">
                {order.subtotal && (
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatRupiah(order.subtotal)}</span>
                  </div>
                )}
                {order.discountAmount && receiptConfig.showDiscount !== false ? (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Diskon Voucher:</span>
                    <span>- {formatRupiah(order.discountAmount)}</span>
                  </div>
                ) : null}
                {receiptConfig.showTax && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[10px]">
                    <span>PPN Resto (10%):</span>
                    <span>{formatRupiah(Math.round((order.total || 0) * 0.1))}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-sm text-amber-600 dark:text-amber-400 pt-1 border-t border-slate-300 dark:border-slate-700">
                  <span>GRAND TOTAL:</span>
                  <span>{formatRupiah(order.total)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-1">
                  <span>Metode Bayar:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{order.paymentMethod || 'Cash'}</span>
                </div>
                {order.cashPaid && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Bayar Tunai:</span>
                    <span>{formatRupiah(order.cashPaid)}</span>
                  </div>
                )}
                {order.changeAmount !== undefined && (
                  <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span>Kembalian:</span>
                    <span>{formatRupiah(order.changeAmount)}</span>
                  </div>
                )}
              </div>

              <div className="border-b-2 border-double border-slate-400 dark:border-slate-600 my-3"></div>

              {/* Receipt Footer */}
              <div className="text-center space-y-1 text-[9px] text-slate-500 dark:text-slate-400">
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  {displayFooterMsg}
                </p>
                {receiptConfig.showFooterPromo && (
                  <>
                    <p>{displayFooterPromo}</p>
                    <p className="italic">{displaySosmed}</p>
                  </>
                )}
                {receiptConfig.showCustomNotes && receiptConfig.customNotesText && (
                  <p className="pt-1 text-[8.5px] italic text-slate-600 dark:text-slate-400 border-t border-dashed border-slate-300 dark:border-slate-700">
                    {receiptConfig.customNotesText}
                  </p>
                )}
                <div className="pt-2 font-mono text-[8px] tracking-widest text-slate-400">
                  *** {displayBrand} OFFICIAL CASHIER ***
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Print & Action Buttons */}
        <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-purple-900/50 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={handleBluetoothPrint}
              disabled={isBluetoothConnecting}
              className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Bluetooth className="w-4 h-4 text-sky-200" />
              <span>Cetak Bluetooth</span>
            </button>

            <button
              type="button"
              onClick={handleBrowserPrint}
              className="py-2.5 px-3 rounded-xl bg-[#3D1259] dark:bg-amber-400 hover:bg-purple-900 dark:hover:bg-amber-300 text-amber-300 dark:text-purple-950 font-extrabold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak USB / Driver</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdfReceipt}
              className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-purple-900/50 hover:bg-slate-200 dark:hover:bg-purple-800 text-slate-800 dark:text-slate-200 font-extrabold text-xs transition-all border border-slate-300 dark:border-purple-800 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Unduh PDF</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-purple-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Selesai & Tutup Struk (Transaksi Baru)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
