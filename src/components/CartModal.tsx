import React, { useState, useEffect } from 'react';
import { ShoppingCart, X, Trash2, Plus, Minus, Send, Ticket, Tag, CheckCircle2, AlertCircle } from 'lucide-react';
import { CartItem, OrderItem, LocationItem, PromoVoucher } from '../types';
import { formatRupiah, getStoredOrders, saveOrders, getStoredGasUrl, getStoredLocations, getStoredWaSettings, getStoredBranding, getStoredPromos, getNextReceiptNumber } from '../utils';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onOrderSubmitted: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onOrderSubmitted,
}) => {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedOutlet, setSelectedOutlet] = useState('');
  const [serviceType, setServiceType] = useState<'Takeaway' | 'Delivery'>('Takeaway');
  const [addressOrTime, setAddressOrTime] = useState('');

  // Voucher & Promo Code Generator State
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoVoucher | null>(null);
  const [promoMsg, setPromoMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [availablePromos, setAvailablePromos] = useState<PromoVoucher[]>([]);

  useEffect(() => {
    const loadLocsAndPromos = () => {
      const locs = getStoredLocations();
      setLocations(locs);
      if (locs.length > 0 && !selectedOutlet) {
        setSelectedOutlet(locs[0].name);
      }
      const activePromos = getStoredPromos().filter((p) => p.status === 'Aktif');
      setAvailablePromos(activePromos);
    };

    if (isOpen) {
      loadLocsAndPromos();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    window.addEventListener('locations_updated', loadLocsAndPromos);
    window.addEventListener('promos_updated', loadLocsAndPromos);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('locations_updated', loadLocsAndPromos);
      window.removeEventListener('promos_updated', loadLocsAndPromos);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const subtotal = (cart || []).reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Discount Calculation
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountType === 'nominal') {
      discountAmount = appliedPromo.discountValue;
    } else if (appliedPromo.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * appliedPromo.discountValue) / 100);
      if (appliedPromo.maxDiscountAmount && discountAmount > appliedPromo.maxDiscountAmount) {
        discountAmount = appliedPromo.maxDiscountAmount;
      }
    }
    if (discountAmount > subtotal) discountAmount = subtotal;
  }

  const grandTotal = Math.max(0, subtotal - discountAmount);

  // Apply Voucher Handler
  const handleApplyPromo = (codeArg?: string) => {
    const code = (codeArg || promoInput).trim().toUpperCase();
    if (!code) {
      setPromoMsg({ text: 'Masukkan kode voucher promo terlebih dahulu.', isError: true });
      return;
    }
    const promos = getStoredPromos();
    const found = promos.find((p) => p.code.toUpperCase() === code && p.status === 'Aktif');

    if (!found) {
      setPromoMsg({ text: `Kode promo "${code}" tidak valid atau sudah kadaluwarsa.`, isError: true });
      return;
    }

    if (subtotal < found.minOrderAmount) {
      setPromoMsg({
        text: `Voucher ${found.code} memerlukan min. transaksi ${formatRupiah(found.minOrderAmount)}. (Subtotal Anda: ${formatRupiah(subtotal)})`,
        isError: true
      });
      return;
    }

    let discVal = 0;
    if (found.discountType === 'nominal') {
      discVal = found.discountValue;
    } else {
      discVal = Math.round((subtotal * found.discountValue) / 100);
      if (found.maxDiscountAmount && discVal > found.maxDiscountAmount) {
        discVal = found.maxDiscountAmount;
      }
    }

    setAppliedPromo(found);
    setPromoInput(found.code);
    setPromoMsg({
      text: `🎉 Berhasil! Diskon promo ${found.code} sebesar ${formatRupiah(discVal)} telah diterapkan!`,
      isError: false
    });
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoMsg(null);
  };

  const handleSubmitOrder = () => {
    const finalName = customerName.trim() || 'Pelanggan Steak 11';
    const finalPhone = customerPhone.trim() || '6281223233299';
    const finalAddressOrTime = addressOrTime.trim() || '-';
    const itemsSummary = (cart || []).map((i) => `${i.quantity}x ${i.name}`).join(', ');

    const newOrder: OrderItem = {
      id: getNextReceiptNumber(selectedOutlet),
      date: new Date().toISOString().split('T')[0],
      createdTime: new Date().toTimeString().slice(0, 5),
      customerName: finalName,
      phone: finalPhone,
      outlet: selectedOutlet,
      serviceType: serviceType,
      addressOrTime: finalAddressOrTime,
      itemsSummary: itemsSummary,
      subtotal: subtotal,
      discountAmount: discountAmount,
      total: grandTotal,
      totalPrice: grandTotal,
      paymentMethod: 'Online QRIS / Transfer',
      cashierName: 'Online Web',
      cogsTotal: Math.round(subtotal * 0.45),
      netProfit: Math.round(grandTotal * 0.55),
      status: 'Pending',
    };

    const orders = getStoredOrders();
    orders.unshift(newOrder);
    saveOrders(orders);

    // Sync to Google Apps Script
    const gasUrl = getStoredGasUrl();
    if (gasUrl) {
      fetch(gasUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orders),
      }).catch((err) => console.error('GAS Sync Error:', err));
    }

    let itemsListText = (cart || [])
      .map((item, idx) => {
        let text = `${idx + 1}. ${item.name} (${item.quantity}x) = ${formatRupiah(item.price * item.quantity)}`;
        if (item.specialNotes) text += `\n   Note: ${item.specialNotes}`;
        return text;
      })
      .join('\n\n');

    if (appliedPromo && discountAmount > 0) {
      itemsListText += `\n\n🎁 *Voucher Promo (${appliedPromo.code}):* -${formatRupiah(discountAmount)}`;
    }

    const customFieldLabel = serviceType === 'Delivery' ? 'Alamat Pengiriman' : 'Jam Ambil';
    const locationOrTime = `${customFieldLabel}: ${finalAddressOrTime}`;

    const waSettings = getStoredWaSettings();
    const branding = getStoredBranding();

    let cleanWa = waSettings.targetWaNumber || branding.mainWhatsapp || '6281223233299';
    cleanWa = cleanWa.replace(/\D/g, '');
    if (cleanWa.startsWith('0')) {
      cleanWa = '62' + cleanWa.slice(1);
    }

    let template = waSettings.templateNewOrder ||
      `*HALO {BRAND_NAME}! SAYA MAU PESAN STEAK*\n\n*Order ID:* {ORDER_ID}\n*Nama Pemesan:* {NAMA}\n*Outlet:* {OUTLET}\n*Tipe Layanan:* {SERVICE_TYPE}\n*Lokasi/Jam:* {ADDRESS_TIME}\n\n*RINCIAN PESANAN:*\n{ITEMS_SUMMARY}\n\n*GRAND TOTAL:* {TOTAL}\n\nMohon diproses ya Kak, Terima kasih!`;

    const message = template
      .replace(/{BRAND_NAME}/g, (branding.brandName || 'STEAK 11').toUpperCase())
      .replace(/{ORDER_ID}/g, newOrder.id)
      .replace(/{NAMA}/g, finalName)
      .replace(/{OUTLET}/g, selectedOutlet)
      .replace(/{SERVICE_TYPE}/g, serviceType)
      .replace(/{ADDRESS_TIME}/g, locationOrTime)
      .replace(/{ITEMS_SUMMARY}/g, itemsListText)
      .replace(/{TOTAL}/g, formatRupiah(grandTotal));

    const encodedMsg = encodeURIComponent(message);
    onClearCart();
    onClose();
    onOrderSubmitted();

    // Send via Node.js WA Gateway API
    fetch('/api/wa/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanWa, message })
    }).catch(() => {});

    window.open(`https://wa.me/${cleanWa}?text=${encodedMsg}`, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-[#1a0c28] text-slate-800 dark:text-slate-100 rounded-2xl overflow-hidden shadow-2xl border border-purple-900/50 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 bg-[#250838] text-white flex items-center justify-between border-b border-purple-800/50">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-extrabold text-lg font-baloo text-white">
                Daftar Pesanan Steak 11
              </h3>
              <p className="text-[11px] text-slate-300">
                Lengkapi rincian untuk kirim via WhatsApp
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

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {cart.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-3xl">
                🛒
              </div>
              <h4 className="font-bold text-base text-slate-800 dark:text-slate-200">
                Keranjang Masih Kosong
              </h4>
              <p className="text-xs text-slate-500 max-w-xs">
                Pilih menu steak lezat atau racik kreasimu di halaman utama.
              </p>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-purple-900/40">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Item Dipilih ({cart.length})
                  </span>
                  <button
                    onClick={onClearCart}
                    className="text-[11px] font-semibold text-red-600 hover:underline cursor-pointer"
                  >
                    Bersihkan
                  </button>
                </div>

                {(cart || []).map((item, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-purple-950/40 border border-slate-200 dark:border-purple-900/40 flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 space-y-1">
                      <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        {item.name}
                      </h5>
                      {item.specialNotes && (
                        <p className="text-[11px] text-purple-700 dark:text-amber-300 font-medium">
                          {item.specialNotes}
                        </p>
                      )}
                      <div className="text-xs font-extrabold text-amber-600">
                        {formatRupiah(item.price * item.quantity)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white dark:bg-purple-900 p-1 rounded-lg border border-slate-200 dark:border-purple-800">
                      <button
                        onClick={() => onUpdateQty(item.id, -1)}
                        className="w-6 h-6 rounded-md bg-slate-100 dark:bg-purple-950 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 min-w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQty(item.id, 1)}
                        className="w-6 h-6 rounded-md bg-slate-900 dark:bg-amber-400 text-white dark:text-purple-950 flex items-center justify-center font-bold cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Customer Info Form */}
              <div className="pt-4 border-t border-slate-200 dark:border-purple-900/40 space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Informasi Pemesan:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Nama Pemesan:
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      No. WhatsApp (cth: 62812...):
                    </label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="628123456789"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Pilih Outlet Steak 11:
                    </label>
                    <select
                      value={selectedOutlet}
                      onChange={(e) => setSelectedOutlet(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                    >
                      {(locations || []).map((l) => (
                        <option key={l.id} value={l.name}>
                          {l.name} ({l.city})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    Tipe Layanan:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setServiceType('Takeaway')}
                      className={`py-2.5 px-3 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                        serviceType === 'Takeaway'
                          ? 'border-amber-400 bg-amber-400/20 text-[#3D1259] dark:text-amber-300 shadow-sm'
                          : 'border-slate-200 dark:border-purple-900/60 bg-slate-50 dark:bg-purple-950 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Takeaway
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceType('Delivery')}
                      className={`py-2.5 px-3 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                        serviceType === 'Delivery'
                          ? 'border-amber-400 bg-amber-400/20 text-[#3D1259] dark:text-amber-300 shadow-sm'
                          : 'border-slate-200 dark:border-purple-900/60 bg-slate-50 dark:bg-purple-950 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Delivery
                    </button>
                  </div>
                </div>

                <div>
                  {serviceType === 'Delivery' ? (
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Alamat Pengiriman:
                      </label>
                      <textarea
                        value={addressOrTime}
                        onChange={(e) => setAddressOrTime(e.target.value)}
                        placeholder="Contoh: Jl. Merdeka No. 10, RT 01/02, Cibubur"
                        rows={2}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Jam Ambil (Takeaway):
                      </label>
                      <input
                        type="text"
                        value={addressOrTime}
                        onChange={(e) => setAddressOrTime(e.target.value)}
                        placeholder="Contoh: Pukul 17.30 WIB"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Voucher & Promo Code Section */}
              <div className="p-3.5 bg-amber-500/10 dark:bg-purple-950/80 rounded-xl border border-amber-400/40 dark:border-purple-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                      Kode Promo / Voucher Diskon
                    </span>
                  </div>
                  {appliedPromo && (
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-[11px] font-bold text-red-500 hover:underline cursor-pointer"
                    >
                      Batal Gunakan
                    </button>
                  )}
                </div>

                {/* Promo Code Input & Apply Button */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="Masukkan Kode (misal: STEAKMERDEKA)"
                      disabled={!!appliedPromo}
                      className="w-full px-3 py-2 uppercase tracking-wider text-xs font-mono font-bold rounded-xl border border-slate-300 dark:border-purple-800 bg-white dark:bg-[#150921] text-purple-950 dark:text-amber-300 placeholder:normal-case placeholder:font-normal placeholder:tracking-normal"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyPromo()}
                    disabled={!!appliedPromo || !promoInput.trim()}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-purple-950 font-black text-xs transition-colors cursor-pointer shrink-0"
                  >
                    {appliedPromo ? 'Terpasang' : 'Terapkan'}
                  </button>
                </div>

                {/* Quick Available Promo Badges */}
                {availablePromos.length > 0 && !appliedPromo && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Pilihan Promo Tersedia (Klik untuk Pakai):
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {availablePromos.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleApplyPromo(p.code)}
                          className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-purple-900/60 border border-amber-300/60 dark:border-purple-700 hover:border-amber-400 text-purple-950 dark:text-amber-300 font-bold text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                          title={p.description}
                        >
                          <Tag className="w-3 h-3 text-amber-500" />
                          <span>{p.code}</span>
                          <span className="text-[9px] opacity-75 font-sans">
                            ({p.discountType === 'nominal' ? formatRupiah(p.discountValue) : p.discountValue + '%'})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Promo Alert Message */}
                {promoMsg && (
                  <div
                    className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                      promoMsg.isError
                        ? 'bg-red-500/10 text-red-600 dark:text-red-300 border border-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                    }`}
                  >
                    {promoMsg.isError ? (
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    )}
                    <span>{promoMsg.text}</span>
                  </div>
                )}
              </div>

              {/* Subtotal & Checkout Button */}
              <div className="p-4 bg-slate-50 dark:bg-purple-950/60 rounded-xl border border-slate-200 dark:border-purple-900/40 space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Subtotal Menu:</span>
                    <span className="font-semibold">{formatRupiah(subtotal)}</span>
                  </div>
                  {appliedPromo && discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>Diskon Promo ({appliedPromo.code}):</span>
                      <span>-{formatRupiah(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-900 dark:text-amber-300 font-extrabold text-base pt-1.5 border-t border-slate-200 dark:border-purple-800">
                    <span>Total Biaya:</span>
                    <span>{formatRupiah(grandTotal)}</span>
                  </div>
                </div>
                <button
                  onClick={handleSubmitOrder}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Simpan Pesanan & Kirim ke WhatsApp
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
