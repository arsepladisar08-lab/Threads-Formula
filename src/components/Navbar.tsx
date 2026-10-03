import React from 'react';
import { FormulaModel, ThreadsAccount } from '../types';
import { Sparkles, RefreshCw, Database, Terminal, Link2, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeFormula: FormulaModel | null;
  threadsAccount: ThreadsAccount | null;
  onOpenThreadsConnect: () => void;
  onSeedDemo: () => void;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeFormula,
  threadsAccount,
  onOpenThreadsConnect,
  onSeedDemo,
  onReset,
}) => {
  const getStatusBadge = () => {
    if (!activeFormula) return null;
    const status = activeFormula.status;
    if (status === 'FINAL') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
          🏆 FORMULA FINAL ({activeFormula.formula_version})
        </span>
      );
    }
    if (status === 'kandidat') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
          🧪 Kandidat Formula ({activeFormula.formula_version})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
        🔬 Eksperimen ({activeFormula.formula_version})
      </span>
    );
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'topik', label: 'Topik Baru' },
    { id: 'konten', label: 'Konten' },
    { id: 'posting', label: 'Posting' },
    { id: 'evaluasi', label: 'Evaluasi' },
    { id: 'formula', label: 'Formula' },
    { id: 'riwayat', label: 'Riwayat' },
    { id: 'pengaturan', label: 'Pengaturan' },
    { id: 'gas_code', label: 'Kode GAS' },
  ];

  return (
    <header className="border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-neutral-950 flex items-center justify-center font-extrabold text-lg shadow-sm">
              @
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white">Threads Formula Lab</span>
                {getStatusBadge()}
              </div>
              <p className="text-xs text-neutral-400">
                Laboratorium Konten Organik untuk Kreator Produk Digital
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {threadsAccount?.is_connected ? (
              <button
                onClick={onOpenThreadsConnect}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/50 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-900/40 transition"
                title="Akun Threads terhubung secara live. Klik untuk melihat detail atau memutuskan"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                <span>@{threadsAccount.username}</span>
              </button>
            ) : (
              <button
                onClick={onOpenThreadsConnect}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-neutral-950 hover:bg-neutral-200 transition shadow-sm"
                title="Hubungkan akun Threads Anda via OAuth 2.0"
              >
                <span className="font-extrabold text-sm leading-none">@</span>
                <span>Sambungkan Threads</span>
              </button>
            )}

            <button
              onClick={onSeedDemo}
              title="Isi database dengan simulasi 3 post, evaluasi performa, dan formula evolusi"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition"
            >
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span>Muat Demo</span>
            </button>
            <button
              onClick={onReset}
              title="Kosongkan data"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent hover:border-neutral-800 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-4 -mb-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-neutral-100 text-neutral-950 font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
