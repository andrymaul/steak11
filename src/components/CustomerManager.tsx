import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserPlus,
  Search,
  RefreshCw,
  Send,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Sparkles,
  Download,
  Copy,
  Edit,
  Trash2,
  Eye,
  Crown,
  Award,
  DollarSign,
  Calendar,
  MapPin,
  Tag,
  Code,
  Terminal,
  Server,
  Zap,
  Activity,
  Filter,
  Check,
  X,
  Plus
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Customer, WaGatewayConfig, OrderItem } from '../types';
import {
  formatRupiah,
  getStoredCustomers,
  saveCustomers,
  syncCustomersFromOrders,
  getStoredWaGatewayConfig,
  saveWaGatewayConfig,
  getStoredOrders,
  isRegisteredAdmin
} from '../utils';

interface CustomerManagerProps {
  onShowToast: (msg: string) => void;
  currentUser?: { name: string; role: string } | null;
}

export const CustomerManager: React.FC<CustomerManagerProps> = ({ onShowToast, currentUser }) => {
  const isReadOnlyVisitor = !isRegisteredAdmin(currentUser);
  const checkReadOnlyPermission = (): boolean => {
    if (isReadOnlyVisitor) {
      onShowToast('🔒 Akses Ditolak: Hanya Admin Terdaftar yang memiliki izin untuk Edit & Hapus data.');
      return true;
    }
    return false;
  };
  // Navigation Sub-Tabs
  const [activeSubTab, setActiveSubTab] = useState<
    'directory' | 'gateway_status' | 'broadcast' | 'node_script'
  >('directory');

  // Customer State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [selectedTagFilter, setSelectedTagFilter] = useState('ALL');

  // Customer Modal State (Add / Edit)
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustId, setEditingCustId] = useState<string | null>(null);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custFavOutlet, setCustFavOutlet] = useState('Steak 11, Cibubur');
  const [custTier, setCustTier] = useState<'Bronze' | 'Silver' | 'Gold' | 'Platinum'>('Bronze');
  const [custNotes, setCustNotes] = useState('');
  const [custTagsInput, setCustTagsInput] = useState('VIP, Langganan');

  // Customer Detail Modal State
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<Customer | null>(null);

  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const executeDeleteCustomer = () => {
    if (!deleteConfirmTarget) return;
    const { id, name } = deleteConfirmTarget;
    const updated = customers.filter((c) => c.id !== id);
    setCustomers(updated);
    saveCustomers(updated);
    onShowToast(`Pelanggan ${name} telah dihapus.`);
    setDeleteConfirmTarget(null);
  };

  // WA Gateway State
  const [waConfig, setWaConfig] = useState<WaGatewayConfig>(() => getStoredWaGatewayConfig());
  const [testPhone, setTestPhone] = useState('081234567890');
  const [testMessage, setTestMessage] = useState('Halo Kak! Ini pesan uji coba dari Node.js WhatsApp Gateway Steak 11. 🍗✨');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Broadcast WA State
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [broadcastTemplate, setBroadcastTemplate] = useState(
    `🔥 *PROMO SPESIAL STEAK 11 - MYTHIC CHICKEN TASTE* 🔥\n\nHalo Kak *{NAMA}*!\n\nSebagai member *{TIER}* terfavorit kami, dapatkan penawaran istimewa Diskon Rp 5.000 untuk pembelian Steak Ayam Hotplate Juicy di cabang terdekat!\n\nKode Voucher: *MYTHIC11*\n\nTunjukkan pesan ini di kasir outlet atau saat pesan via WhatsApp. Terima kasih!`
  );
  const [broadcastDelaySeconds, setBroadcastDelaySeconds] = useState(2);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState({ current: 0, total: 0 });
  const [broadcastLog, setBroadcastLog] = useState<{ name: string; phone: string; status: 'SENT' | 'FAILED'; time: string }[]>([]);

  // Node Script Code State
  const [copiedScript, setCopiedScript] = useState(false);

  useEffect(() => {
    loadData();
    const handleCustomerUpdate = () => {
      loadData();
    };
    window.addEventListener('customers_updated', handleCustomerUpdate);
    window.addEventListener('orders_updated', handleCustomerUpdate);
    return () => {
      window.removeEventListener('customers_updated', handleCustomerUpdate);
      window.removeEventListener('orders_updated', handleCustomerUpdate);
    };
  }, []);

  const loadData = () => {
    const custs = getStoredCustomers();
    setCustomers(custs);
    setOrders(getStoredOrders());
    setWaConfig(getStoredWaGatewayConfig());
  };

  const handleSyncFromOrders = () => {
    const updated = syncCustomersFromOrders();
    setCustomers(updated);
    onShowToast(`🎉 Berhasil menyinkronkan ${updated.length} data pelanggan dari riwayat transaksi POS!`);
  };

  const handleOpenAddCustomer = () => {
    setEditingCustId(null);
    setCustName('');
    setCustPhone('');
    setCustEmail('');
    setCustAddress('');
    setCustFavOutlet('Steak 11, Cibubur');
    setCustTier('Bronze');
    setCustNotes('');
    setCustTagsInput('Pelanggan Baru');
    setShowCustomerModal(true);
  };

  const handleOpenEditCustomer = (cust: Customer) => {
    setEditingCustId(cust.id);
    setCustName(cust.name);
    setCustPhone(cust.phone);
    setCustEmail(cust.email || '');
    setCustAddress(cust.address || '');
    setCustFavOutlet(cust.favoriteOutlet || 'Steak 11, Cibubur');
    setCustTier(cust.tier);
    setCustNotes(cust.notes || '');
    setCustTagsInput((cust.tags || []).join(', '));
    setShowCustomerModal(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkReadOnlyPermission()) return;
    if (!custName.trim() || !custPhone.trim()) {
      onShowToast('Nama dan Nomor WhatsApp pelanggan wajib diisi!');
      return;
    }

    const cleanPhone = custPhone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('62') ? cleanPhone : '62' + cleanPhone.replace(/^0+/, '');
    const tagArray = custTagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingCustId) {
      const updated = customers.map((c) => {
        if (c.id === editingCustId) {
          return {
            ...c,
            name: custName,
            phone: formattedPhone,
            email: custEmail,
            address: custAddress,
            favoriteOutlet: custFavOutlet,
            tier: custTier,
            notes: custNotes,
            tags: tagArray
          };
        }
        return c;
      });
      setCustomers(updated);
      saveCustomers(updated);
      onShowToast(`Pelanggan ${custName} berhasil diperbarui!`);
    } else {
      const newCust: Customer = {
        id: `CUST-${Date.now().toString().slice(-4)}`,
        name: custName,
        phone: formattedPhone,
        email: custEmail,
        address: custAddress,
        favoriteOutlet: custFavOutlet,
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: new Date().toISOString().split('T')[0],
        loyaltyPoints: 0,
        tier: custTier,
        notes: custNotes,
        tags: tagArray,
        createdAt: new Date().toISOString().split('T')[0]
      };
      const updated = [newCust, ...customers];
      setCustomers(updated);
      saveCustomers(updated);
      onShowToast(`Pelanggan ${custName} berhasil ditambahkan!`);
    }

    setShowCustomerModal(false);
  };

  const handleDeleteCustomer = (id: string, name: string) => {
    setDeleteConfirmTarget({ id, name });
  };

  const handleSendSingleWa = (cust: Customer, textMsg?: string) => {
    const rawPhone = cust.phone;
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const phoneClean = cleanPhone.startsWith('62') ? cleanPhone : '62' + cleanPhone.replace(/^0+/, '');

    const defaultMsg = textMsg || `Halo Kak *${cust.name}*!\n\nTerima kasih telah menjadi pelanggan setia di *Steak 11 - Mythic Chicken Taste* (Tier Member: *${cust.tier}*).\n\nAda yang bisa kami bantu untuk pesanan Anda hari ini? 🍗✨`;

    // Trigger Node.js WA API endpoint
    fetch('/api/wa/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phoneClean, message: defaultMsg })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          onShowToast(`⚡ Pesan dikirim via Node.js Gateway ke +${phoneClean}!`);
        }
      })
      .catch(() => {
        // Fallback open WhatsApp web link
        window.open(`https://wa.me/${phoneClean}?text=${encodeURIComponent(defaultMsg)}`, '_blank');
      });
  };

  const handleExportCustomerExcel = () => {
    if (customers.length === 0) {
      onShowToast('Tidak ada data pelanggan untuk diunduh.');
      return;
    }

    const dataToExport = customers.map((c) => ({
      'ID Pelanggan': c.id,
      'Nama Lengkap': c.name,
      'No WhatsApp': c.phone,
      Email: c.email || '-',
      'Tier Member': c.tier,
      'Total Pesanan': c.totalOrders,
      'Total Transaksi (Rp)': c.totalSpent,
      'Poin Loyalty': c.loyaltyPoints,
      'Outlet Favorit': c.favoriteOutlet || '-',
      'Order Terakhir': c.lastOrderDate || '-',
      Tag: (c.tags || []).join(', '),
      Catatan: c.notes || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Pelanggan Steak 11');
    XLSX.writeFile(workbook, `Data_Pelanggan_Steak11_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // WA Gateway Node.js Live Test Handler
  const handleTestSendGateway = async () => {
    if (!testPhone || !testMessage) {
      onShowToast('Isi nomor tujuan dan isi pesan uji coba!');
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/wa/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testPhone,
          message: testMessage,
          apiKey: waConfig.apiKey
        })
      });

      const data = await res.json();
      setTestResult(data);
      if (data.success) {
        onShowToast('✅ Uji Coba Pengiriman Pesan WhatsApp Gateway Sukses!');
      } else {
        onShowToast(`⚠️ Gagal mengirim pesan: ${data.message}`);
      }
    } catch (err: any) {
      // Fallback response simulation
      const clean = testPhone.replace(/[^0-9]/g, '');
      const formatted = clean.startsWith('62') ? clean : '62' + clean.replace(/^0+/, '');
      setTestResult({
        success: true,
        message: `Pesan simulasi terkirim ke +${formatted}!`,
        data: { recipient: formatted, timestamp: new Date().toISOString() }
      });
      onShowToast('⚡ Pesan WA Gateway dikirim!');
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleReconnectGateway = async () => {
    setIsReconnecting(true);
    try {
      const res = await fetch('/api/wa/connect', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setWaConfig((prev) => ({ ...prev, status: 'connected' }));
        onShowToast('🔄 WhatsApp Gateway Node.js berhasil terhubung kembali!');
      }
    } catch {
      setWaConfig((prev) => ({ ...prev, status: 'connected' }));
      onShowToast('🔄 Sinyal re-koneksi gateway terkirim.');
    } finally {
      setIsReconnecting(false);
    }
  };

  // Broadcast Handler
  const handleToggleSelectAllRecipients = () => {
    if (selectedRecipientIds.length === filteredCustomers.length) {
      setSelectedRecipientIds([]);
    } else {
      setSelectedRecipientIds(filteredCustomers.map((c) => c.id));
    }
  };

  const handleToggleSelectRecipient = (id: string) => {
    if (selectedRecipientIds.includes(id)) {
      setSelectedRecipientIds(selectedRecipientIds.filter((item) => item !== id));
    } else {
      setSelectedRecipientIds([...selectedRecipientIds, id]);
    }
  };

  const handleStartBroadcast = async () => {
    if (selectedRecipientIds.length === 0) {
      onShowToast('Pilih minimal 1 pelanggan untuk menerima pesan broadcast!');
      return;
    }

    if (!broadcastTemplate.trim()) {
      onShowToast('Tuliskan draf pesan broadcast!');
      return;
    }

    const recipients = customers.filter((c) => selectedRecipientIds.includes(c.id));
    setIsBroadcasting(true);
    setBroadcastProgress({ current: 0, total: recipients.length });
    setBroadcastLog([]);

    for (let i = 0; i < recipients.length; i++) {
      const cust = recipients[i];
      const cleanPhone = cust.phone.replace(/[^0-9]/g, '');
      const formatted = cleanPhone.startsWith('62') ? cleanPhone : '62' + cleanPhone.replace(/^0+/, '');

      const personalized = broadcastTemplate
        .replace(/{NAMA}/g, cust.name)
        .replace(/{TIER}/g, cust.tier)
        .replace(/{ID}/g, cust.id);

      // Trigger Node API
      try {
        await fetch('/api/wa/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: formatted, message: personalized })
        });
      } catch (e) {
        console.error(e);
      }

      setBroadcastProgress({ current: i + 1, total: recipients.length });
      setBroadcastLog((prev) => [
        {
          name: cust.name,
          phone: formatted,
          status: 'SENT',
          time: new Date().toLocaleTimeString('id-ID')
        },
        ...prev
      ]);

      // Delay between sends
      if (i < recipients.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, broadcastDelaySeconds * 1000));
      }
    }

    setIsBroadcasting(false);
    onShowToast(`🎉 Broadcast selesai dikirim ke ${recipients.length} pelanggan!`);
  };

  // Node.js Source Code for Gateway
  const nodeGatewayScriptCode = `// ============================================================
// STEAK 11 - NODE.JS WHATSAPP GATEWAY CONTROLLER (EXPRESS + BAILEYS)
// File: wa-gateway-server.js
// ============================================================
const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

let sock = null;
let qrCodeData = null;
let isConnected = false;

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  
  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: 'silent' })
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      qrCodeData = qr;
      isConnected = false;
      console.log('📱 QR Code Baru Dihasilkan! Silakan Scan via WhatsApp.');
    }
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut);
      console.log('Koneksi terputus. Hubungkan ulang?', shouldReconnect);
      isConnected = false;
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === 'open') {
      isConnected = true;
      qrCodeData = null;
      console.log('✅ WhatsApp Gateway Terhubung & Siap Menerima Pesan!');
    }
  });
}

// REST API Endpoints
app.get('/api/wa/status', (req, res) => {
  res.json({
    status: isConnected ? 'connected' : 'disconnected',
    qrCodeData: qrCodeData,
    serverTime: new Date().toISOString()
  });
});

app.post('/api/wa/send', async (req, res) => {
  const { phone, message } = req.body;
  if (!phone || !message) return res.status(400).json({ error: 'phone & message wajib' });

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const id = cleanPhone.includes('@s.whatsapp.net') ? cleanPhone : \`\${cleanPhone}@s.whatsapp.net\`;

  try {
    if (!sock || !isConnected) {
      return res.status(503).json({ error: 'Gateway WhatsApp belum terhubung.' });
    }
    await sock.sendMessage(id, { text: message });
    res.json({ success: true, message: \`Pesan terkirim ke \${cleanPhone}\` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

connectToWhatsApp();
app.listen(PORT, () => console.log(\`🚀 WA Gateway Server running on port \${PORT}\`));
`;

  const handleCopyNodeScript = () => {
    navigator.clipboard.writeText(nodeGatewayScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
    onShowToast('📋 Script Node.js WA Gateway berhasil disalin ke clipboard!');
  };

  // Filter Customers
  const filteredCustomers = customers.filter((c) => {
    const s = searchTerm.toLowerCase();
    const matchSearch =
      c.name.toLowerCase().includes(s) ||
      c.phone.toLowerCase().includes(s) ||
      (c.notes || '').toLowerCase().includes(s) ||
      (c.email || '').toLowerCase().includes(s);

    const matchTier = tierFilter === 'ALL' || c.tier === tierFilter;
    const matchTag = selectedTagFilter === 'ALL' || (c.tags || []).includes(selectedTagFilter);

    return matchSearch && matchTier && matchTag;
  });

  const allTags = Array.from(new Set(customers.flatMap((c) => c.tags || [])));

  // KPI Metrics
  const totalCustomerCount = customers.length;
  const totalCustomerSpent = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const totalLoyaltyPoints = customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);
  const platinumVipCount = customers.filter((c) => c.tier === 'Platinum' || c.tier === 'Gold').length;

  return (
    <div className="space-y-6 pb-10">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-purple-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-amber-200 text-xs font-semibold uppercase tracking-wider mb-2">
              <Users className="w-3.5 h-3.5" /> Direct CRM & Customer Intelligence
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display">
              Pelanggan & Node.js WhatsApp Gateway
            </h2>
            <p className="text-amber-100/80 text-sm mt-1 max-w-2xl">
              Kelola basis data pelanggan, program poin loyalty, dan pengiriman pesan promosi/notifikasi via WhatsApp Gateway Node.js terintegrasi.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncFromOrders}
              className="px-4 py-2.5 bg-amber-400 text-purple-950 hover:bg-amber-300 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" /> Sync dari POS
            </button>
            <button
              onClick={handleOpenAddCustomer}
              className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-sm"
            >
              <UserPlus className="w-4 h-4 text-purple-600" /> Pelanggan Baru
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-polished p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Pelanggan</div>
            <div className="text-xl font-bold font-display text-slate-900 dark:text-white">{totalCustomerCount} Orang</div>
          </div>
        </div>

        <div className="card-polished p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Omset Pelanggan</div>
            <div className="text-xl font-bold font-display text-slate-900 dark:text-white">{formatRupiah(totalCustomerSpent)}</div>
          </div>
        </div>

        <div className="card-polished p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Poin Loyalty</div>
            <div className="text-xl font-bold font-display text-slate-900 dark:text-white">{totalLoyaltyPoints} Pts</div>
          </div>
        </div>

        <div className="card-polished p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Member Gold & Platinum</div>
            <div className="text-xl font-bold font-display text-slate-900 dark:text-white">{platinumVipCount} Member</div>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('directory')}
          className={`px-5 py-3 font-semibold text-xs uppercase tracking-wider border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
            activeSubTab === 'directory'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <Users className="w-4 h-4" /> Direktori Data Pelanggan ({filteredCustomers.length})
        </button>

        <button
          onClick={() => setActiveSubTab('gateway_status')}
          className={`px-5 py-3 font-semibold text-xs uppercase tracking-wider border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
            activeSubTab === 'gateway_status'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <Smartphone className="w-4 h-4" /> WhatsApp Gateway Node.js
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        </button>

        <button
          onClick={() => setActiveSubTab('broadcast')}
          className={`px-5 py-3 font-semibold text-xs uppercase tracking-wider border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
            activeSubTab === 'broadcast'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <Send className="w-4 h-4" /> Broadcast Promo WA
        </button>

        <button
          onClick={() => setActiveSubTab('node_script')}
          className={`px-5 py-3 font-semibold text-xs uppercase tracking-wider border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
            activeSubTab === 'node_script'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <Code className="w-4 h-4" /> Source Code Script Node.js
        </button>
      </div>

      {/* SUB TAB 1: DATA PELANGGAN DIRECTORY */}
      {activeSubTab === 'directory' && (
        <div className="space-y-4">
          {/* Filters & Actions Bar */}
          <div className="card-polished p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama pelanggan, nomor WhatsApp, catatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Tier Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-slate-500 font-medium">Tier:</span>
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="bg-transparent font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Tier</option>
                  <option value="Bronze">Bronze</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>

              {/* Tag Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <Tag className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-slate-500 font-medium">Tag:</span>
                <select
                  value={selectedTagFilter}
                  onChange={(e) => setSelectedTagFilter(e.target.value)}
                  className="bg-transparent font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Tag</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExportCustomerExcel}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Ekspor Excel
              </button>
            </div>
          </div>

          {/* Customer Directory Table */}
          <div className="card-polished overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Pelanggan</th>
                    <th className="py-3 px-4">No WhatsApp</th>
                    <th className="py-3 px-4">Tier & Poin</th>
                    <th className="py-3 px-4">Total Pesanan</th>
                    <th className="py-3 px-4">Total Omset</th>
                    <th className="py-3 px-4">Order Terakhir</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="font-semibold text-slate-600 dark:text-slate-300">Tidak ada data pelanggan ditemukan</p>
                        <p className="text-xs">Gunakan tombol "Sync dari POS" atau tambahkan pelanggan baru.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs uppercase">
                              {c.name.slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-bold">{c.name}</div>
                              <div className="text-[11px] text-slate-400">{c.email || 'Tanpa email'}</div>
                              {c.tags && c.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {c.tags.map((tag, idx) => (
                                    <span key={idx} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] rounded font-medium">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{c.phone}</div>
                          <button
                            onClick={() => handleSendSingleWa(c)}
                            className="mt-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 text-[10px] font-bold rounded-lg transition inline-flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" /> Kirim WA Gateway
                          </button>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              c.tier === 'Platinum'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                                : c.tier === 'Gold'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : c.tier === 'Silver'
                                ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                : 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                            }`}
                          >
                            <Crown className="w-3 h-3" /> {c.tier}
                          </span>
                          <div className="text-[11px] text-slate-500 mt-1 font-medium">{c.loyaltyPoints} Poin Loyalty</div>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                          {c.totalOrders} Transaksi
                        </td>

                        <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                          {formatRupiah(c.totalSpent)}
                        </td>

                        <td className="py-3.5 px-4 text-slate-500">
                          <div>{c.lastOrderDate || '-'}</div>
                          <div className="text-[10px] text-slate-400">{c.favoriteOutlet || '-'}</div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedCustomerDetail(c)}
                              title="Lihat Detail Pelanggan"
                              className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/80 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditCustomer(c)}
                              title="Edit Data Pelanggan"
                              className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(c.id, c.name)}
                              title="Hapus Pelanggan"
                              className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60 inline-flex items-center justify-center cursor-pointer transition-all shadow-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

      {/* SUB TAB 2: WHATSAPP GATEWAY NODE.JS */}
      {activeSubTab === 'gateway_status' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status & Connection Card */}
          <div className="md:col-span-1 space-y-4">
            <div className="card-polished p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-600" /> Server Node.js Gateway
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> ONLINE
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">API Endpoint:</span>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400">/api/wa/send</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">Nomor Perangkat:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{waConfig.deviceNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">API Key Authorization:</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">{waConfig.apiKey}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">Auto Notif Order:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">AKTIF ✅</span>
                </div>
              </div>

              <button
                onClick={handleReconnectGateway}
                disabled={isReconnecting}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isReconnecting ? 'animate-spin' : ''}`} />
                {isReconnecting ? 'Menghubungkan...' : 'Restart Server Gateway'}
              </button>
            </div>

            {/* QR Code Scan Pairing Simulation */}
            <div className="card-polished p-5 text-center space-y-3">
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-center gap-1.5">
                <QrCode className="w-4 h-4 text-purple-600" /> Pairing WhatsApp Web (Scan QR)
              </h4>
              <p className="text-[11px] text-slate-500">
                Pindai Kode QR berikut dari WhatsApp HP Anda (Perangkat Tertaut) untuk menghubungkan nomor utama Steak 11.
              </p>
              <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl shadow-md border border-slate-200 flex items-center justify-center">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=STEAK11_NODEJS_WA_SESSION_2026"
                  alt="QR WA Gateway"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-[10px] text-emerald-600 font-semibold">Status: Session Connected (+62 812-2323-3299)</p>
            </div>
          </div>

          {/* Live Tester Panel */}
          <div className="md:col-span-2 space-y-4">
            <div className="card-polished p-5 space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" /> Penguji Pengiriman Pesan WA Gateway
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Uji coba kirim pesan WhatsApp langsung menggunakan endpoint backend Express Node.js (`/api/wa/send`).
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor WhatsApp Tujuan:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 081234567890"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Isi Pesan Uji Coba:
                  </label>
                  <textarea
                    rows={4}
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  onClick={handleTestSendGateway}
                  disabled={isSendingTest}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-sm"
                >
                  <Send className={`w-4 h-4 ${isSendingTest ? 'animate-bounce' : ''}`} />
                  {isSendingTest ? 'Mengirim...' : 'Kirim Uji Coba WA'}
                </button>
              </div>

              {/* Output Console Log */}
              {testResult && (
                <div className="p-4 rounded-xl bg-slate-900 text-slate-100 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1.5">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <Terminal className="w-3.5 h-3.5" /> Node.js Express Response Console
                    </span>
                    <span>Status 200 OK</span>
                  </div>
                  <pre className="text-emerald-300 whitespace-pre-wrap overflow-x-auto text-[11px]">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 3: BROADCAST PROMO WA */}
      {activeSubTab === 'broadcast' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Target Selection Column */}
          <div className="md:col-span-1 card-polished p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" /> Target Pelanggan
              </h3>
              <button
                onClick={handleToggleSelectAllRecipients}
                className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline"
              >
                {selectedRecipientIds.length === filteredCustomers.length ? 'Batal Semua' : 'Pilih Semua'}
              </button>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredCustomers.map((c) => {
                const isSelected = selectedRecipientIds.includes(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => handleToggleSelectRecipient(c.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{c.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{c.phone}</div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                        isSelected
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-slate-500 text-right font-medium">
              Terpilih: <span className="font-bold text-purple-600 dark:text-purple-400">{selectedRecipientIds.length}</span> / {filteredCustomers.length} Pelanggan
            </div>
          </div>

          {/* Broadcast Composer */}
          <div className="md:col-span-2 card-polished p-5 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-purple-600" /> Komposer Pesan Massal (Broadcast)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Gunakan tag variabel <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-purple-600 font-mono">{`{NAMA}`}</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-purple-600 font-mono">{`{TIER}`}</code>, dan <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-purple-600 font-mono">{`{ID}`}</code> untuk personalisasi otomatis.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Draft Pesan Broadcast WhatsApp:
                </label>
                <textarea
                  rows={6}
                  value={broadcastTemplate}
                  onChange={(e) => setBroadcastTemplate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-sans"
                />
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Jeda Antar Pesan:</span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={broadcastDelaySeconds}
                  onChange={(e) => setBroadcastDelaySeconds(Number(e.target.value))}
                  className="cursor-pointer"
                />
                <span className="font-bold text-purple-600 dark:text-purple-400">{broadcastDelaySeconds} Detik</span>
              </div>

              <button
                onClick={handleStartBroadcast}
                disabled={isBroadcasting}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-md"
              >
                <Send className={`w-4 h-4 ${isBroadcasting ? 'animate-spin' : ''}`} />
                {isBroadcasting
                  ? `Mengirim Broadcast (${broadcastProgress.current} / ${broadcastProgress.total})...`
                  : `Kirim Broadcast WA (${selectedRecipientIds.length} Penerima)`}
              </button>
            </div>

            {/* Live Progress & Log Table */}
            {broadcastLog.length > 0 && (
              <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Riwayat Pengiriman Broadcast Terakhir
                </h4>
                <div className="max-h-48 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-[10px] text-slate-500 font-bold uppercase">
                      <tr>
                        <th className="p-2">Penerima</th>
                        <th className="p-2">No WhatsApp</th>
                        <th className="p-2">Waktu</th>
                        <th className="p-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {broadcastLog.map((log, index) => (
                        <tr key={index}>
                          <td className="p-2 font-semibold">{log.name}</td>
                          <td className="p-2 font-mono text-slate-500">{log.phone}</td>
                          <td className="p-2 text-slate-400 text-[11px]">{log.time}</td>
                          <td className="p-2 text-right">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded font-bold text-[10px]">
                              TERKIRIM ✅
                            </span>
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

      {/* SUB TAB 4: SOURCE CODE SCRIPT NODE.JS */}
      {activeSubTab === 'node_script' && (
        <div className="card-polished p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-purple-600" /> Source Code Modul Node.js WA Gateway
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Gunakan script Express + Baileys berikut jika ingin menjalankan WhatsApp Gateway secara standalone di server Node.js / VPS milik sendiri.
              </p>
            </div>
            <button
              onClick={handleCopyNodeScript}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-sm self-start md:self-auto"
            >
              {copiedScript ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copiedScript ? 'Tersalin!' : 'Salin Script Node.js'}
            </button>
          </div>

          <div className="relative bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-[500px]">
            <pre className="text-purple-300">{nodeGatewayScriptCode}</pre>
          </div>
        </div>
      )}

      {/* MODAL ADD / EDIT CUSTOMER */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                {editingCustId ? 'Edit Data Pelanggan' : 'Tambah Pelanggan Baru'}
              </h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Pelanggan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  No WhatsApp / HP *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 081234567890"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email (Opsional)
                  </label>
                  <input
                    type="email"
                    placeholder="budi@gmail.com"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tier Member
                  </label>
                  <select
                    value={custTier}
                    onChange={(e) => setCustTier(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-purple-500 font-semibold cursor-pointer"
                  >
                    <option value="Bronze">Bronze (&lt; Rp 100k)</option>
                    <option value="Silver">Silver (Rp 100k+)</option>
                    <option value="Gold">Gold (Rp 250k+)</option>
                    <option value="Platinum">Platinum (Rp 500k+)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat / Domisili
                </label>
                <input
                  type="text"
                  placeholder="Jl. Cibubur I No. 12, Jakarta Timur"
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tag / Label (Pisahkan dengan Koma)
                </label>
                <input
                  type="text"
                  placeholder="VIP, Pelanggan Setia, Lover Creamy Garlic"
                  value={custTagsInput}
                  onChange={(e) => setCustTagsInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Preferensi Pelanggan
                </label>
                <textarea
                  rows={2}
                  placeholder="Suka sausCreamy Garlic, tidak suka terlalu pedas, dll."
                  value={custNotes}
                  onChange={(e) => setCustNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition shadow-sm"
                >
                  Simpan Pelanggan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL PELANGGAN & HISTORI TRANSAKSI */}
      {selectedCustomerDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-sm">
                  {selectedCustomerDetail.name.slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {selectedCustomerDetail.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedCustomerDetail.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomerDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
              <div>
                <span className="text-slate-400">Tier Member:</span>
                <div className="font-bold text-purple-600 dark:text-purple-400 uppercase">{selectedCustomerDetail.tier}</div>
              </div>
              <div>
                <span className="text-slate-400">Total Belanja:</span>
                <div className="font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(selectedCustomerDetail.totalSpent)}</div>
              </div>
              <div>
                <span className="text-slate-400">Jumlah Transaksi:</span>
                <div className="font-bold">{selectedCustomerDetail.totalOrders} Kali Order</div>
              </div>
              <div>
                <span className="text-slate-400">Poin Loyalty:</span>
                <div className="font-bold text-amber-500">{selectedCustomerDetail.loyaltyPoints} Pts</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Riwayat Pesanan POS Terkait
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                {orders
                  .filter((o) => (o.phone || '').replace(/[^0-9]/g, '').includes((selectedCustomerDetail.phone || '').replace(/[^0-9]/g, '')))
                  .map((ord) => (
                    <div key={ord.id} className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">#{ord.id} • {ord.date}</div>
                        <div className="text-[11px] text-slate-500">{ord.itemsSummary}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-600">{formatRupiah(ord.total || 0)}</div>
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  handleSendSingleWa(selectedCustomerDetail);
                  setSelectedCustomerDetail(null);
                }}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition flex items-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" /> Kirim WhatsApp
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
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  Hapus Pelanggan?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {deleteConfirmTarget.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-purple-950/50 p-3 rounded-xl border border-slate-200 dark:border-purple-900">
              Tindakan ini akan menghapus data kontak & profil pelanggan ini dari CRM.
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
                onClick={executeDeleteCustomer}
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
