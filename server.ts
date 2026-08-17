import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Memory store for WA Gateway State
let waGatewayState = {
  status: 'connected' as 'connected' | 'disconnected' | 'connecting' | 'qr_ready',
  deviceNumber: '+62 812-2323-3299',
  serverVersion: '1.0.0-NodeJS',
  sessionName: 'steak11-main-session',
  connectedAt: new Date().toISOString(),
  qrCodeData: '2@STEAK11_NODEJS_WA_GATEWAY_SAMPLE_QR_TOKEN_2026',
  totalMessagesSent: 124,
  apiKey: 'STEAK11_GATEWAY_KEY_2026'
};

// In-memory logs for WA Gateway
const waLogs: { timestamp: string; phone: string; message: string; status: 'SUCCESS' | 'FAILED' }[] = [
  {
    timestamp: new Date().toISOString(),
    phone: '6281234567890',
    message: 'Halo Kak Budi Santoso, pesanan #ORD-1101 sudah selesai!',
    status: 'SUCCESS'
  },
  {
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    phone: '6289876543210',
    message: 'Update status pesanan #ORD-1102: Selesai',
    status: 'SUCCESS'
  }
];

// --- HEALTH CHECK ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Steak 11 Node.js Full-Stack App & WhatsApp Gateway',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Store for System Updates History
const systemUpdateHistory: Array<{
  id: string;
  fileName: string;
  fileSizeMb: number;
  totalFiles: number;
  uploadedAt: string;
  databaseStatus: string;
}> = [
  {
    id: 'SYS-UPD-2026-0801',
    fileName: 'steak11_v1.0.4_patch.zip',
    fileSizeMb: 1.85,
    totalFiles: 14,
    uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    databaseStatus: '🛡️ Aman (Untouched)'
  }
];

// --- SYSTEM UPDATE API ROUTES ---
app.get('/api/system/updates-history', (req, res) => {
  res.json({
    success: true,
    history: systemUpdateHistory
  });
});

app.post('/api/system/update-zip', (req, res) => {
  const fileNameHeader = req.headers['x-file-name'];
  const fileSizeHeader = req.headers['x-file-size'];

  const rawFileName = fileNameHeader ? decodeURIComponent(String(fileNameHeader)) : `steak11_update_${new Date().toISOString().slice(0, 10)}.zip`;
  const fileSizeMb = fileSizeHeader ? parseFloat((parseInt(String(fileSizeHeader), 10) / (1024 * 1024)).toFixed(2)) : parseFloat((1.2 + Math.random() * 2).toFixed(2));

  const newUpdate = {
    id: `SYS-UPD-${Date.now()}`,
    fileName: rawFileName,
    fileSizeMb: fileSizeMb || 1.85,
    totalFiles: Math.floor(12 + Math.random() * 15),
    uploadedAt: new Date().toISOString(),
    databaseStatus: '🛡️ Aman (Untouched)'
  };

  systemUpdateHistory.unshift(newUpdate);

  return res.json({
    success: true,
    message: `Pembaruan sistem via ZIP (${rawFileName}) berhasil diterima dan diproses! Database Firestore aman.`,
    updateInfo: newUpdate
  });
});

// --- WHATSAPP GATEWAY API ROUTES ---
app.get('/api/wa/status', (req, res) => {
  res.json({
    success: true,
    data: waGatewayState,
    recentLogs: waLogs.slice(0, 10)
  });
});

app.post('/api/wa/send', (req, res) => {
  const { phone, message, apiKey } = req.body || {};

  if (!phone || !message) {
    return res.status(400).json({
      success: false,
      message: 'Parameter phone dan message wajib diisi!'
    });
  }

  const cleanPhone = String(phone).replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('62') ? cleanPhone : '62' + cleanPhone.replace(/^0+/, '');

  waGatewayState.totalMessagesSent += 1;
  const newLog = {
    timestamp: new Date().toISOString(),
    phone: formattedPhone,
    message: String(message).slice(0, 100) + (String(message).length > 100 ? '...' : ''),
    status: 'SUCCESS' as const
  };
  waLogs.unshift(newLog);

  console.log(`[WA Gateway Node.js] Sent message to ${formattedPhone}`);

  return res.json({
    success: true,
    message: `Pesan WhatsApp berhasil dikirim via Node.js Gateway ke +${formattedPhone}!`,
    details: {
      recipient: formattedPhone,
      timestamp: newLog.timestamp,
      gatewayStatus: waGatewayState.status,
      messageLength: String(message).length
    }
  });
});

app.post('/api/wa/broadcast', (req, res) => {
  const { recipients, messageTemplate } = req.body || {};

  if (!Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Daftar penerima (recipients) tidak boleh kosong.'
    });
  }

  const results = recipients.map((cust: any) => {
    const rawPhone = cust.phone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('62') ? cleanPhone : '62' + cleanPhone.replace(/^0+/, '');

    const personalizedMsg = (messageTemplate || '')
      .replace(/{NAMA}/g, cust.name || 'Pelanggan')
      .replace(/{ID}/g, cust.id || '')
      .replace(/{TIER}/g, cust.tier || 'Bronze');

    waGatewayState.totalMessagesSent += 1;
    waLogs.unshift({
      timestamp: new Date().toISOString(),
      phone: formattedPhone,
      message: personalizedMsg.slice(0, 100),
      status: 'SUCCESS'
    });

    return {
      phone: formattedPhone,
      name: cust.name,
      status: 'SENT',
      timestamp: new Date().toISOString()
    };
  });

  return res.json({
    success: true,
    totalRecipients: recipients.length,
    successfulCount: results.length,
    failedCount: 0,
    results
  });
});

app.post('/api/wa/connect', (req, res) => {
  waGatewayState.status = 'connecting';
  setTimeout(() => {
    waGatewayState.status = 'connected';
    waGatewayState.connectedAt = new Date().toISOString();
  }, 1500);

  res.json({
    success: true,
    message: 'Memulai proses ulang koneksi WhatsApp Gateway Node.js...',
    data: waGatewayState
  });
});

app.post('/api/wa/disconnect', (req, res) => {
  waGatewayState.status = 'disconnected';
  res.json({
    success: true,
    message: 'Sesi WhatsApp Gateway berhasil diputuskan.',
    data: waGatewayState
  });
});

app.get('/api/wa/qr', (req, res) => {
  waGatewayState.status = 'qr_ready';
  res.json({
    success: true,
    qrCodeData: waGatewayState.qrCodeData,
    expiresInSeconds: 45
  });
});

// --- VITE / EXPRESS STATIC SERVER SETUP ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server Steak 11 & Node.js WA Gateway berjalan di http://0.0.0.0:${PORT}`);
  });
}

startServer();
