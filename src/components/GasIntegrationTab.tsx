import React, { useState } from 'react';
import { 
  GasConnectionConfig, 
  CreatorSettings, 
  Topic, 
  ContentGeneration, 
  PostRecord, 
  PostEvaluation, 
  FormulaModel 
} from '../types';
import { 
  pingGasWebApp, 
  fetchGasData, 
  pushGasData 
} from '../services/gasClient';
import { 
  Link2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Check, 
  ExternalLink, 
  Code2, 
  ChevronDown, 
  ChevronUp, 
  Zap,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';

interface GasIntegrationTabProps {
  gasConfig: GasConnectionConfig;
  onUpdateGasConfig: (config: GasConnectionConfig) => void;
  settings: CreatorSettings;
  topics: Topic[];
  generations: ContentGeneration[];
  posts: PostRecord[];
  evaluations: PostEvaluation[];
  formulas: FormulaModel[];
  onImportData: (data: {
    settings?: CreatorSettings;
    topics?: Topic[];
    generations?: ContentGeneration[];
    posts?: PostRecord[];
    evaluations?: PostEvaluation[];
    formulas?: FormulaModel[];
  }) => void;
  showToast: (text: string, type?: 'info' | 'success' | 'error') => void;
}

export const GasIntegrationTab: React.FC<GasIntegrationTabProps> = ({
  gasConfig,
  onUpdateGasConfig,
  settings,
  topics,
  generations,
  posts,
  evaluations,
  formulas,
  onImportData,
  showToast,
}) => {
  const [urlInput, setUrlInput] = useState(gasConfig.web_app_url || '');
  const [testing, setTesting] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [showCodeHelper, setShowCodeHelper] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const isConnected = gasConfig.is_connected && Boolean(gasConfig.web_app_url);

  // 1. TEST & SAVE CONNECTION
  const handleTestAndSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) {
      showToast('Masukkan URL Web App Google Apps Script', 'error');
      return;
    }

    if (!cleanUrl.startsWith('https://script.google.com/')) {
      showToast('URL harus diawali dengan https://script.google.com/macros/s/.../exec', 'error');
      return;
    }

    setTesting(true);
    try {
      const res = await pingGasWebApp(cleanUrl);
      const newConfig: GasConnectionConfig = {
        web_app_url: cleanUrl,
        is_connected: true,
        auto_sync: gasConfig.auto_sync,
        last_synced_at: new Date().toISOString(),
        spreadsheet_name: res.spreadsheet_name || 'Google Spreadsheet Aktif',
      };

      onUpdateGasConfig(newConfig);
      showToast(res.message || 'Koneksi ke Web App Google Apps Script Berhasil!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal menyambungkan ke Google Apps Script', 'error');
    } finally {
      setTesting(false);
    }
  };

  // 2. DISCONNECT
  const handleDisconnect = () => {
    onUpdateGasConfig({
      web_app_url: '',
      is_connected: false,
      auto_sync: false,
      last_synced_at: undefined,
      spreadsheet_name: undefined,
    });
    setUrlInput('');
    showToast('Koneksi Google Apps Script telah diputuskan', 'info');
  };

  // 3. PULL DATA FROM GOOGLE SHEETS
  const handlePullData = async () => {
    if (!gasConfig.web_app_url) {
      showToast('Sambungkan URL Web App terlebih dahulu', 'error');
      return;
    }

    setPulling(true);
    try {
      showToast('Mengambil data dari Google Spreadsheet...', 'info');
      const res = await fetchGasData(gasConfig.web_app_url);
      if (res && res.data) {
        onImportData(res.data);
        onUpdateGasConfig({
          ...gasConfig,
          last_synced_at: new Date().toISOString(),
        });
        showToast('Data berhasil disinkronisasi dari Google Spreadsheet!', 'success');
      } else {
        showToast('Tidak ada data yang ditemukan di Spreadsheet', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal menarik data dari Google Spreadsheet', 'error');
    } finally {
      setPulling(false);
    }
  };

  // 4. PUSH DATA TO GOOGLE SHEETS
  const handlePushData = async () => {
    if (!gasConfig.web_app_url) {
      showToast('Sambungkan URL Web App terlebih dahulu', 'error');
      return;
    }

    setPushing(true);
    try {
      showToast('Mengirim seluruh data lokal ke Google Spreadsheet...', 'info');
      const payload = {
        settings,
        topics,
        generations,
        posts,
        evaluations,
        formulas,
      };

      const res = await pushGasData(gasConfig.web_app_url, payload);
      onUpdateGasConfig({
        ...gasConfig,
        last_synced_at: new Date().toISOString(),
      });
      showToast(res.message || 'Seluruh data berhasil dikirim ke Google Spreadsheet!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal mengirim data ke Google Spreadsheet', 'error');
    } finally {
      setPushing(false);
    }
  };

  // 5. TOGGLE AUTO SYNC
  const handleToggleAutoSync = () => {
    const nextVal = !gasConfig.auto_sync;
    onUpdateGasConfig({
      ...gasConfig,
      auto_sync: nextVal,
    });
    showToast(
      nextVal
        ? 'Auto-Sync Aktif: Data akan otomatis dicadangkan ke Google Spreadsheet'
        : 'Auto-Sync Dinonaktifkan',
      'info'
    );
  };

  const sampleGasSnippet = `function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'ping';
  if (action === 'getData') {
    return ContentService.createTextOutput(JSON.stringify(getAppData()))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Koneksi ke Web App Google Apps Script Berhasil!',
    spreadsheet_name: SpreadsheetApp.getActiveSpreadsheet().getName(),
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var body = {};
  try { body = JSON.parse(e.postData.contents); } catch(err) { body = e.parameter || {}; }
  var action = body.action || 'ping';
  
  if (action === 'syncData') {
    // Simpan payload ke Sheet (Settings, Topics, Posts, Evaluasi, Formula)
    if (body.data) {
      if (body.data.settings) saveSettingsToDb(body.data.settings);
      // Tambahkan logika simpan sheet sesuai kebutuhan...
    }
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Data berhasil disinkronkan ke Google Spreadsheet!'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  return doGet(e);
}`;

  const copySnippet = () => {
    navigator.clipboard.writeText(sampleGasSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    showToast('Kode snippet disalin!', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* HEADER HERO */}
      <div className="p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Koneksi Google Apps Script (Web App)</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Hubungkan langsung aplikasi ini ke Google Spreadsheet Anda via URL Web App yang telah di-deploy.
              </p>
            </div>
          </div>
        </div>

        {isConnected ? (
          <div className="flex items-center gap-2 text-xs bg-emerald-950/40 border border-emerald-500/40 px-3.5 py-2 rounded-xl text-emerald-400 self-start md:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <div>
              <div className="font-bold">Tersambung ke Spreadsheet</div>
              <div className="text-[10px] text-emerald-400/80">
                {gasConfig.spreadsheet_name || 'Google Spreadsheet'}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs bg-neutral-950 border border-neutral-800 px-3.5 py-2 rounded-xl text-neutral-400 self-start md:self-auto">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Belum Terhubung</span>
          </div>
        )}
      </div>

      {/* CONNECTION CONFIGURATION CARD */}
      <div className="p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-5">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Link2 className="w-4 h-4 text-sky-400" />
            <span>URL Web App Google Apps Script</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Tempelkan URL Web App yang Anda dapatkan setelah melakukan <strong>Deploy &gt; New deployment &gt; Web app</strong> di Google Apps Script.
          </p>
        </div>

        <form onSubmit={handleTestAndSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              URL Web App (Berakhiran /exec)
            </label>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500 font-mono placeholder:text-neutral-600"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={testing || !urlInput.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white text-neutral-950 hover:bg-neutral-200 disabled:opacity-50 transition shadow-sm"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menguji Koneksi Web App...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isConnected ? 'Simpan & Uji Ulang' : 'Hubungkan Web App'}</span>
                  </>
                )}
              </button>

              {isConnected && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-rose-300 hover:bg-rose-950/40 border border-rose-500/30 transition"
                >
                  Putuskan
                </button>
              )}
            </div>

            {gasConfig.last_synced_at && (
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                <Clock className="w-3 h-3 text-neutral-500" />
                <span>Terakhir terhubung: {new Date(gasConfig.last_synced_at).toLocaleTimeString('id-ID')}</span>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* SYNCHRONIZATION CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* TARIK DATA DARI SPREADSHEET */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs font-bold text-white">Tarik Data dari Spreadsheet</h4>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono">
              Import
            </span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Muat semua topik, postingan, evaluasi, dan formula yang tersimpan di baris-baris Google Spreadsheet ke dalam aplikasi ini.
          </p>
          <button
            onClick={handlePullData}
            disabled={pulling || !isConnected}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 disabled:opacity-50 transition"
          >
            {pulling ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Mengunduh dari Spreadsheet...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Tarik Data Terbaru Sekarang</span>
              </>
            )}
          </button>
        </div>

        {/* KIRIM DATA KE SPREADSHEET */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white">Kirim Data ke Spreadsheet</h4>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
              Export / Backup
            </span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Kirim dan cadangkan seluruh {topics.length} topik, {posts.length} postingan, dan {evaluations.length} evaluasi lokal ke Google Spreadsheet.
          </p>
          <button
            onClick={handlePushData}
            disabled={pushing || !isConnected}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-500/40 disabled:opacity-50 transition"
          >
            {pushing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Mengunggah ke Spreadsheet...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>Cadangkan Data ke Spreadsheet</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AUTO-SYNC TOGGLE & STATS SUMMARY */}
      <div className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Sinkronisasi Otomatis di Latar Belakang</div>
            <div className="text-[11px] text-neutral-400">
              Otomatis mengirim data ke Google Spreadsheet setiap kali ada topik baru, postingan, atau evaluasi.
            </div>
          </div>
        </div>

        <button
          onClick={handleToggleAutoSync}
          disabled={!isConnected}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition self-start sm:self-auto ${
            gasConfig.auto_sync && isConnected
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
              : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
          } disabled:opacity-50`}
        >
          {gasConfig.auto_sync && isConnected ? '✓ Auto-Sync Aktif' : 'Aktifkan Auto-Sync'}
        </button>
      </div>

      {/* LIVE DATA INVENTORY */}
      <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800/80">
        <div className="text-xs font-bold text-neutral-300 mb-3 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span>Status Inventori Data Lokal Siap Sinkron:</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850">
            <div className="text-lg font-extrabold text-white">{topics.length}</div>
            <div className="text-[10px] text-neutral-400">Topik Bank Ide</div>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850">
            <div className="text-lg font-extrabold text-sky-400">{generations.length}</div>
            <div className="text-[10px] text-neutral-400">Variasi Konten</div>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850">
            <div className="text-lg font-extrabold text-amber-400">{posts.length}</div>
            <div className="text-[10px] text-neutral-400">Postingan Aktif</div>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850">
            <div className="text-lg font-extrabold text-emerald-400">{evaluations.length}</div>
            <div className="text-[10px] text-neutral-400">Evaluasi Performa</div>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850">
            <div className="text-lg font-extrabold text-purple-400">{formulas.length}</div>
            <div className="text-[10px] text-neutral-400">Versi Formula</div>
          </div>
        </div>
      </div>

      {/* QUICK 3-STEP REFERENCE FOR USERS */}
      <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-850 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-300">
            💡 Cara Mendapatkan URL Web App di Google Spreadsheet Anda (3 Langkah):
          </span>
          <button
            onClick={() => setShowCodeHelper(!showCodeHelper)}
            className="text-[11px] text-sky-400 hover:underline inline-flex items-center gap-1 font-medium"
          >
            <span>{showCodeHelper ? 'Sembunyikan Kode Handler' : 'Lihat Contoh Script Web App'}</span>
            {showCodeHelper ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        <ol className="list-decimal list-inside space-y-1.5 text-xs text-neutral-400 leading-relaxed pl-1">
          <li>
            Buka Google Sheets Anda, lalu pilih menu <strong className="text-neutral-200">Ekstensi (Extensions) &gt; Apps Script</strong>.
          </li>
          <li>
            Klik tombol biru <strong className="text-neutral-200">Deploy &gt; New deployment</strong>, pilih jenis <strong className="text-neutral-200">Web app</strong>.
          </li>
          <li>
            Setel <strong className="text-neutral-200">Execute as: Me</strong> dan <strong className="text-neutral-200">Who has access: Anyone</strong>, lalu klik <strong>Deploy</strong> dan salin URL Web App yang berakhiran <code className="text-sky-300">/exec</code>.
          </li>
        </ol>

        {showCodeHelper && (
          <div className="mt-3 pt-3 border-t border-neutral-800 space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Pastikan file Apps Script Anda memiliki fungsi <code>doGet</code> dan <code>doPost</code> berikut:</span>
              <button
                onClick={copySnippet}
                className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:underline"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Code2 className="w-3 h-3" />}
                <span>{copiedCode ? 'Tersalin' : 'Salin Kode Handler'}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300 font-mono overflow-x-auto leading-relaxed max-h-60 overflow-y-auto">
              {sampleGasSnippet}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
