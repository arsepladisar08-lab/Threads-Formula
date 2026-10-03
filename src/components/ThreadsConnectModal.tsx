import React, { useState, useEffect } from 'react';
import { ThreadsAccount } from '../types';
import { 
  getThreadsAuthUrl, 
  connectWithToken, 
  disconnectThreads 
} from '../services/threadsClient';
import { 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Key, 
  AlertCircle, 
  LogOut, 
  Sparkles,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface ThreadsConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  threadsAccount: ThreadsAccount | null;
  onAccountUpdated: (account: ThreadsAccount | null) => void;
  showToast: (text: string, type?: 'info' | 'success' | 'error') => void;
}

export const ThreadsConnectModal: React.FC<ThreadsConnectModalProps> = ({
  isOpen,
  onClose,
  threadsAccount,
  onAccountUpdated,
  showToast,
}) => {
  const [tokenInput, setTokenInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [loadingOAuth, setLoadingOAuth] = useState(false);
  const [loadingManual, setLoadingManual] = useState(false);
  const [copiedUri, setCopiedUri] = useState(false);
  const [authConfig, setAuthConfig] = useState<{
    url: string;
    redirectUri: string;
    appId?: string;
    isConfigured: boolean;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      getThreadsAuthUrl()
        .then(setAuthConfig)
        .catch(console.error);
    }
  }, [isOpen]);

  // Listen for OAuth message from popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('threads.net')) {
        return;
      }

      if (event.data?.type === 'THREADS_AUTH_SUCCESS' && event.data.account) {
        onAccountUpdated(event.data.account);
        showToast(`Berhasil tersambung ke akun Threads @${event.data.account.username}!`, 'success');
        setLoadingOAuth(false);
      } else if (event.data?.type === 'THREADS_AUTH_ERROR') {
        showToast(`Otentikasi Threads gagal: ${event.data.error || 'Dibatalkan'}`, 'error');
        setLoadingOAuth(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onAccountUpdated, showToast]);

  if (!isOpen) return null;

  const handleOAuthConnect = async () => {
    try {
      setLoadingOAuth(true);
      const data = await getThreadsAuthUrl();

      // Open OAuth provider URL directly in popup
      const authWindow = window.open(
        data.url,
        'threads_oauth_popup',
        'width=600,height=750,scrollbars=yes,status=1'
      );

      if (!authWindow) {
        showToast('Popup diblokir oleh browser. Izinkan popup untuk melanjutkan otentikasi Threads.', 'error');
        setLoadingOAuth(false);
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal membuka popup Threads', 'error');
      setLoadingOAuth(false);
    }
  };

  const handleManualConnect = async (isSandbox: boolean = false) => {
    try {
      setLoadingManual(true);
      const token = isSandbox ? '' : tokenInput.trim();
      const username = usernameInput.trim() || 'arsepladisar.digital';

      const res = await connectWithToken(token, username);
      onAccountUpdated(res.account);
      showToast(
        isSandbox
          ? `Tersambung ke Threads Sandbox Live (@${res.account.username})!`
          : `Token Threads terverifikasi (@${res.account.username})!`,
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Gagal menyambungkan akun', 'error');
    } finally {
      setLoadingManual(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectThreads();
      onAccountUpdated(null);
      showToast('Koneksi akun Threads telah diputuskan', 'info');
    } catch (err: any) {
      showToast(err.message || 'Gagal memutuskan koneksi', 'error');
    }
  };

  const copyCallbackUrl = () => {
    const uri = authConfig?.redirectUri || 'https://ais-dev-dq6zdato7la4s6dnwhul2k-845694696908.asia-southeast1.run.app/api/auth/threads/callback';
    navigator.clipboard.writeText(uri);
    setCopiedUri(true);
    setTimeout(() => setCopiedUri(false), 2000);
    showToast('Tautan Redirect URI disalin!', 'success');
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-7 space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-neutral-950 font-extrabold text-xl flex items-center justify-center">
              @
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Integrasi Threads API Live</span>
              </h2>
              <p className="text-xs text-neutral-400">
                Hubungkan langsung akun Threads untuk memposting otomatis dan menarik metrik performa real-time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-xs font-semibold p-1"
          >
            ✕
          </button>
        </div>

        {/* STATUS CARD */}
        {threadsAccount?.is_connected ? (
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-neutral-800 border border-emerald-500/50 shrink-0">
                {threadsAccount.profile_picture_url ? (
                  <img
                    src={threadsAccount.profile_picture_url}
                    alt={threadsAccount.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-emerald-400 font-bold">
                    @
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    @{threadsAccount.username}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {threadsAccount.is_simulation ? 'Threads Live Sandbox' : 'Terhubung Live'}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {threadsAccount.name || 'Akun Threads Aktif'} · Siap untuk Direct Publishing & Live Insights
                </p>
              </div>
            </div>

            <button
              onClick={handleDisconnect}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-300 hover:bg-rose-950/40 border border-rose-500/30 transition self-end sm:self-auto shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Putuskan</span>
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-neutral-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block animate-pulse"></span>
              <span>Status: <strong>Belum Tersambung</strong> ke Akun Threads</span>
            </div>
            <span className="text-[11px] text-neutral-500">Pilih opsi di bawah untuk menyambungkan</span>
          </div>
        )}

        {/* CONNECTION OPTIONS */}
        <div className="space-y-4">
          {/* OPTION 1: OFFICIAL POPUP OAUTH 2.0 */}
          <div className="p-5 rounded-xl bg-neutral-950/70 border border-neutral-800/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Opsi 1: Login Langsung via Threads OAuth (Rekomendasi)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono">
                OAuth 2.0 Popup
              </span>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Masuk langsung dengan otorisasi resmi Meta Threads. Jendela popup otentikasi akan meminta izin publikasi konten dan pembacaan metrik.
            </p>

            <button
              onClick={handleOAuthConnect}
              disabled={loadingOAuth}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white text-neutral-950 hover:bg-neutral-200 disabled:opacity-50 transition"
            >
              {loadingOAuth ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Membuka Otorisasi Threads...</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Sambungkan Akun Threads Sekarang</span>
                </>
              )}
            </button>
          </div>

          {/* OPTION 2: INSTANT SANDBOX OR DIRECT USER TOKEN */}
          <div className="p-5 rounded-xl bg-neutral-950/70 border border-neutral-800/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Opsi 2: Sambungkan Cepat (Sandbox / Token Pengembang)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono">
                Instant Test
              </span>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Jika Anda sedang melakukan uji coba tanpa perlu konfigurasi Meta App ID terlebih dahulu, atau ingin menggunakan User Token dari Meta Graph API Explorer:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">
                  Username Threads Anda
                </label>
                <input
                  type="text"
                  placeholder="@arsepladisar.digital"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">
                  Access Token Meta (Opsional)
                </label>
                <input
                  type="password"
                  placeholder="TH_ACCESS_TOKEN..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500 font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => handleManualConnect(false)}
                disabled={loadingManual}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition"
              >
                Gunakan Token Di Atas
              </button>
              <button
                onClick={() => handleManualConnect(true)}
                disabled={loadingManual}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500/25 transition"
              >
                ⚡ Aktifkan Mode Sandbox Kreator 1-Klik
              </button>
            </div>
          </div>
        </div>

        {/* DEVELOPER CALLBACK CONFIGURATION NOTICE */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 space-y-2 text-xs">
          <div className="font-semibold text-neutral-300 flex items-center justify-between">
            <span>⚙️ Pengaturan Meta Developer (Threads App Settings):</span>
            <button
              onClick={copyCallbackUrl}
              className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:underline"
            >
              {copiedUri ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedUri ? 'Tersalin' : 'Salin Callback URL'}</span>
            </button>
          </div>
          <p className="text-neutral-400 text-[11px] leading-relaxed">
            Tambahkan URL Callback ini ke dashboard Meta for Developers di menu <strong className="text-neutral-200">Threads → App Settings → Redirect Callback URLs</strong>:
          </p>
          <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 font-mono text-[11px] text-sky-300 break-all select-all">
            {authConfig?.redirectUri || 'https://ais-dev-dq6zdato7la4s6dnwhul2k-845694696908.asia-southeast1.run.app/api/auth/threads/callback'}
          </div>
        </div>
      </div>
    </div>
  );
};
