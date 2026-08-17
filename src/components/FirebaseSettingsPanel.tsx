import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Server, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  RefreshCcw, 
  Copy, 
  ShieldCheck, 
  Database,
  Layers,
  Info,
  Mail,
  Trash2
} from 'lucide-react';
import { 
  isFirebaseConfigured, 
  getEffectiveFirebaseConfig, 
  saveStoredFirebaseConfig, 
  initFirebase, 
  FirebaseConfig,
  PROVISIONED_CONFIG
} from '../lib/firebase';
import { initializeFirestoreDatabase, testFirestoreConnection, pushAllLocalDataToFirestore, pullAllFirestoreDataToLocal, cleanUpLegacyUserDocs } from '../lib/firebaseServices';
import { syncAllLocalMenuToFirebase } from '../utils';

interface FirebaseSettingsPanelProps {
  onConfigSaved?: () => void;
  currentUser?: { name: string; role: string } | null;
}

export const FirebaseSettingsPanel: React.FC<FirebaseSettingsPanelProps> = ({ onConfigSaved, currentUser }) => {
  const isReadOnlyVisitor = currentUser?.role === 'Pengunjung' || currentUser?.role?.toLowerCase().includes('pengunjung');
  const checkReadOnlyPermission = (): boolean => {
    if (isReadOnlyVisitor) {
      alert('🔒 Akses Read-Only: Mode Pengunjung hanya dapat melihat data (tindakan ubah/hapus dibatasi).');
      return true;
    }
    return false;
  };
  const currentConfig = getEffectiveFirebaseConfig();
  
  const [apiKey, setApiKey] = useState(currentConfig.apiKey || '');
  const [projectId, setProjectId] = useState(currentConfig.projectId || '');
  const [authDomain, setAuthDomain] = useState(currentConfig.authDomain || '');
  const [storageBucket, setStorageBucket] = useState(currentConfig.storageBucket || '');
  const [firestoreDatabaseId, setFirestoreDatabaseId] = useState(currentConfig.firestoreDatabaseId || '');
  const [messagingSenderId, setMessagingSenderId] = useState(currentConfig.messagingSenderId || '');
  const [appId, setAppId] = useState(currentConfig.appId || '');
  const [connectedEmail, setConnectedEmail] = useState(currentConfig.connectedEmail || 'andrymaul.am@gmail.com');

  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; menuCount?: number; orderCount?: number } | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'form' | 'env'>('status');

  const isConnected = isFirebaseConfigured();

  useEffect(() => {
    const cfg = getEffectiveFirebaseConfig();
    setApiKey(cfg.apiKey || '');
    setProjectId(cfg.projectId || '');
    setAuthDomain(cfg.authDomain || '');
    setStorageBucket(cfg.storageBucket || '');
    setFirestoreDatabaseId(cfg.firestoreDatabaseId || '');
    setMessagingSenderId(cfg.messagingSenderId || '');
    setAppId(cfg.appId || '');
    setConnectedEmail(cfg.connectedEmail || 'andrymaul.am@gmail.com');
    handleTestConnection();
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkReadOnlyPermission()) return;
    if (!apiKey.trim() || !projectId.trim()) {
      setSaveMessage('Mohon isi API Key dan Project ID Firebase.');
      return;
    }

    const newCfg: FirebaseConfig = {
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      storageBucket: storageBucket.trim() || `${projectId.trim()}.firebasestorage.app`,
      firestoreDatabaseId: firestoreDatabaseId.trim() || '(default)',
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
      connectedEmail: connectedEmail.trim() || 'andrymaul.am@gmail.com',
    };

    saveStoredFirebaseConfig(newCfg);
    initFirebase();
    initializeFirestoreDatabase();

    setSaveMessage('Konfigurasi Pengaturan Firebase berhasil diperbarui!');
    if (onConfigSaved) onConfigSaved();
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleResetToDefault = () => {
    saveStoredFirebaseConfig(PROVISIONED_CONFIG);
    initFirebase();
    
    const cfg = PROVISIONED_CONFIG;
    setApiKey(cfg.apiKey);
    setProjectId(cfg.projectId);
    setAuthDomain(cfg.authDomain || '');
    setStorageBucket(cfg.storageBucket || '');
    setFirestoreDatabaseId(cfg.firestoreDatabaseId || '');
    setMessagingSenderId(cfg.messagingSenderId || '');
    setAppId(cfg.appId || '');
    setConnectedEmail(cfg.connectedEmail || 'andrymaul.am@gmail.com');
    setSaveMessage('Pengaturan Firebase dikembalikan ke server default.');
    if (onConfigSaved) onConfigSaved();
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    const res = await testFirestoreConnection();
    setTestingConnection(false);
    setTestResult(res);
  };

  const handleSyncFirestore = async () => {
    setSaveMessage('Menyinkronkan seluruh 27 Data Operasional ke Firebase Firestore...');
    await pushAllLocalDataToFirestore();
    await syncAllLocalMenuToFirebase();
    await initializeFirestoreDatabase();
    setSaveMessage('✅ Semua 27 Data Operasional & Menu berhasil di-push ke Firebase Firestore!');
    setTimeout(() => setSaveMessage(null), 3500);
  };

  const handlePullFromFirestore = async () => {
    setSaveMessage('Menarik & menyinkronkan seluruh data dari Firebase Firestore ke aplikasi...');
    const result = await pullAllFirestoreDataToLocal();
    setSaveMessage(result.message);
    setTimeout(() => setSaveMessage(null), 4000);
  };

  const handleCleanUpLegacyDocs = async () => {
    setSaveMessage('Menghapus dokumen ganda users/d2d8IJ0cRwMCNs71Y1L7vk5ZpEw2 dari Cloud Firestore...');
    const result = await cleanUpLegacyUserDocs();
    setSaveMessage(result.message);
    setTimeout(() => setSaveMessage(null), 4000);
  };

  const envText = `VITE_FIREBASE_API_KEY=${apiKey || currentConfig.apiKey}
VITE_FIREBASE_AUTH_DOMAIN=${authDomain || currentConfig.authDomain}
VITE_FIREBASE_PROJECT_ID=${projectId || currentConfig.projectId}
VITE_FIREBASE_FIRESTORE_DATABASE_ID=${firestoreDatabaseId || currentConfig.firestoreDatabaseId}
VITE_FIREBASE_STORAGE_BUCKET=${storageBucket || currentConfig.storageBucket}
VITE_FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId || currentConfig.messagingSenderId}
VITE_FIREBASE_APP_ID=${appId || currentConfig.appId}
VITE_FIREBASE_CONNECTED_EMAIL=${connectedEmail || currentConfig.connectedEmail}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envText);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  return (
    <div className="space-y-4">
      {saveMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 rounded-2xl text-xs flex items-center gap-2 border border-emerald-200 dark:border-emerald-800 font-semibold shadow-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Sub Tab Navigation */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab('status')}
          className={`flex-1 py-2 px-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'status'
              ? 'bg-white dark:bg-slate-900 text-[#3D1259] dark:text-amber-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Status Koneksi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('form')}
          className={`flex-1 py-2 px-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'form'
              ? 'bg-white dark:bg-slate-900 text-[#3D1259] dark:text-amber-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Edit Kredensial</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('env')}
          className={`flex-1 py-2 px-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'env'
              ? 'bg-white dark:bg-slate-900 text-[#3D1259] dark:text-amber-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Environment Var</span>
        </button>
      </div>

      {/* TAB 1: STATUS KONEKSI */}
      {activeTab === 'status' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-purple-500/5 to-slate-900/5 dark:from-amber-950/20 dark:to-purple-950/20 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-500 rounded-xl">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Firestore Database Cluster</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Provisi Proyek Google Firebase AI Studio</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                isConnected 
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
              }`}>
                {isConnected ? 'ONLINE / CONNECTED' : 'OFFLINE / FALLBACK'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-4">
              <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <span className="block text-[10px] font-bold uppercase text-slate-400">Firebase Project ID</span>
                <span className="font-mono font-extrabold text-slate-800 dark:text-amber-300 text-xs truncate block mt-0.5">
                  {currentConfig.projectId || '(Belum terkonfigurasi)'}
                </span>
              </div>

              <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <span className="block text-[10px] font-bold uppercase text-slate-400">Firestore Database ID</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs truncate block mt-0.5">
                  {currentConfig.firestoreDatabaseId || '(default)'}
                </span>
              </div>

              <div className="p-3 bg-amber-500/10 dark:bg-purple-950/60 rounded-xl border border-amber-400/40 dark:border-purple-800">
                <span className="block text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-amber-500" /> Email Terhubung
                </span>
                <span className="font-mono font-extrabold text-slate-900 dark:text-amber-300 text-xs truncate block mt-0.5" title={currentConfig.connectedEmail || 'andrymaul.am@gmail.com'}>
                  {currentConfig.connectedEmail || 'andrymaul.am@gmail.com'}
                </span>
              </div>
            </div>

            {testResult && (
              <div className={`p-3.5 rounded-2xl border text-xs font-semibold mb-4 flex items-center justify-between gap-2 ${
                testResult.success 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
              }`}>
                <div className="flex items-center gap-2">
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />}
                  <span>{testResult.message}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-[#3D1259] hover:bg-[#521B75] text-amber-400 font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Activity className="w-4 h-4" />
                <span>{testingConnection ? 'Menguji...' : 'Uji Koneksi'}</span>
              </button>

              <button
                type="button"
                onClick={handlePullFromFirestore}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                <RefreshCcw className="w-4 h-4" />
                <span>📥 Tarik Data</span>
              </button>

              <button
                type="button"
                onClick={handleSyncFirestore}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Database className="w-4 h-4" />
                <span>📤 Push Data</span>
              </button>

              <button
                type="button"
                onClick={handleCleanUpLegacyDocs}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                title="Hapus dokumen ganda users/d2d8IJ0cRwMCNs71Y1L7vk5ZpEw2"
              >
                <Trash2 className="w-4 h-4" />
                <span>🧹 Hapus Dokumen Ganda</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
              <Info className="w-4 h-4 text-amber-500" />
              <span>Integrasi Realtime Terhubung ke Koleksi:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 pl-1 font-mono text-[11px]">
              <li><strong className="text-purple-600 dark:text-amber-400 font-sans">orders</strong>: Realtime Sync Kasir & Dapur</li>
              <li><strong className="text-purple-600 dark:text-amber-400 font-sans">menu_items</strong>: Katalog Menu & Harga Steak</li>
              <li><strong className="text-purple-600 dark:text-amber-400 font-sans">inventory</strong>: Stok Bahan Baku & Resep BOM</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 2: EDIT KREDENSIAL */}
      {activeTab === 'form' && (
        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-500" /> Alamat Email Terhubung (Admin / Owner Proyek Firebase)
            </label>
            <input
              type="email"
              value={connectedEmail}
              onChange={(e) => setConnectedEmail(e.target.value)}
              placeholder="andrymaul.am@gmail.com"
              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              API Key Firebase *
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Project ID *
              </label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="gen-lang-client-..."
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Firestore Database ID
              </label>
              <input
                type="text"
                value={firestoreDatabaseId}
                onChange={(e) => setFirestoreDatabaseId(e.target.value)}
                placeholder="ai-studio-kitabuatsteak11-..."
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Auth Domain
              </label>
              <input
                type="text"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                placeholder="project-id.firebaseapp.com"
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Storage Bucket
              </label>
              <input
                type="text"
                value={storageBucket}
                onChange={(e) => setStorageBucket(e.target.value)}
                placeholder="project-id.firebasestorage.app"
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-extrabold text-xs rounded-xl cursor-pointer transition-all"
            >
              Reset Default
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#3D1259] hover:bg-[#521B75] text-amber-400 font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Simpan Pengaturan Firebase</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: ENVIRONMENT VARIABLES */}
      {activeTab === 'env' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
              Variabel Lingkungan (.env.example / AI Studio Settings)
            </span>
            <button
              type="button"
              onClick={copyToClipboard}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedEnv ? 'Tersalin ke Clipboard!' : 'Salin Semua Variable'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-900 text-amber-300 text-xs font-mono rounded-2xl overflow-x-auto leading-relaxed border border-slate-800">
            {envText}
          </pre>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
            * Variabel ini telah diisi otomatis dari provisi Firebase Cloud proyek Anda.
          </p>
        </div>
      )}
    </div>
  );
};
