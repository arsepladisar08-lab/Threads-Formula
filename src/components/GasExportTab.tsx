import React, { useState } from 'react';
import { GAS_FILES, GasFileItem } from '../data/gasFiles';
import { Copy, Check, FileCode, ExternalLink, Terminal, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const GasExportTab: React.FC = () => {
  const [selectedFileName, setSelectedFileName] = useState<string>('Code.gs');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const activeFile = GAS_FILES.find((f) => f.name === selectedFileName) || GAS_FILES[0];

  const handleCopyCode = (file: GasFileItem) => {
    navigator.clipboard.writeText(file.code);
    setCopiedFile(file.name);
    setTimeout(() => setCopiedFile(null), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* INTRO HERO */}
      <div className="p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800">
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
          <Terminal className="w-5 h-5 text-sky-400" />
          <span>Panduan Deployment & Ekspor Kode Google Apps Script (GAS)</span>
        </h2>
        <p className="text-xs text-neutral-400 leading-relaxed max-w-3xl">
          Aplikasi ini telah dirancang dengan arsitektur penuh agar dapat dijalankan sebagai <strong>Google Apps Script Web App</strong> yang terikat langsung ke <strong>Google Spreadsheet</strong> sebagai database gratis Anda. Di bawah ini adalah kode siap pakai per file beserta panduan instalasi langkah-demi-langkah.
        </p>
      </div>

      {/* STEP-BY-STEP DEPLOYMENT GUIDE */}
      <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span>📋 Panduan Instalasi Langkah-demi-Langkah</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sky-400">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center text-xs">1</span>
              <span>Buat Spreadsheet & Buka Apps Script</span>
            </div>
            <p className="text-neutral-300 leading-relaxed">
              Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">sheets.new</a> di browser untuk membuat Google Sheets baru. Beri judul misal: <strong className="text-white">Threads Formula Lab Database</strong>. Kemudian buka menu:
              <br />
              <code className="text-[11px] bg-neutral-900 px-2 py-0.5 rounded text-neutral-300 mt-1 inline-block">
                Extensions (Ekstensi) → Apps Script
              </code>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sky-400">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center text-xs">2</span>
              <span>Buat File & Salin Kode</span>
            </div>
            <p className="text-neutral-300 leading-relaxed">
              Di editor Apps Script, klik tombol <strong>+</strong> lalu buat file sesuai nama (8 file):
              <br />
              <span className="text-neutral-400">Script (.gs):</span> <code>Code.gs</code>, <code>Database.gs</code>, <code>AI.gs</code>, <code>Prompts.gs</code>, <code>Formula.gs</code>
              <br />
              <span className="text-neutral-400">HTML (.html):</span> <code>Index.html</code>, <code>CSS.html</code>, <code>JS.html</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sky-400">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center text-xs">3</span>
              <span>Jalankan Inisialisasi Database</span>
            </div>
            <p className="text-neutral-300 leading-relaxed">
              Pilih fungsi <strong className="text-white">setupDatabase</strong> di toolbar atas Apps Script, lalu klik <strong>Run</strong>. Berikan izin akses (Review Permissions) ke Spreadsheet Anda. Seluruh 7 sheet akan otomatis terbuat beserta header-nya!
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sky-400">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center text-xs">4</span>
              <span>Atur GEMINI_API_KEY & Deploy</span>
            </div>
            <p className="text-neutral-300 leading-relaxed">
              Klik ikon gerigi <strong>Project Settings</strong> di bilah kiri Apps Script → scroll ke <strong>Script Properties</strong> → klik <em>Add script property</em> → isi <code>GEMINI_API_KEY</code> dengan API Key Gemini Anda.
              <br />
              Lalu klik <strong>Deploy → New deployment → Web app</strong> (Access: Anyone) dan buka tautan Web App Anda.
            </p>
          </div>
        </div>
      </div>

      {/* CODE VIEWER WITH TABS */}
      <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 overflow-hidden">
        {/* FILE SELECTOR BAR */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-950 border-b border-neutral-800 overflow-x-auto">
          <div className="flex items-center gap-1">
            {GAS_FILES.map((f) => {
              const isSelected = f.name === selectedFileName;
              return (
                <button
                  key={f.name}
                  onClick={() => setSelectedFileName(f.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                    isSelected
                      ? 'bg-neutral-800 text-sky-400 font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                  }`}
                >
                  {f.name}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handleCopyCode(activeFile)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-neutral-950 hover:bg-neutral-200 transition shrink-0 ml-3"
          >
            {copiedFile === activeFile.name ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin {activeFile.name}</span>
              </>
            )}
          </button>
        </div>

        {/* FILE DESCRIPTION BANNER */}
        <div className="px-5 py-2.5 bg-neutral-900 text-xs text-neutral-400 border-b border-neutral-850 flex items-center justify-between">
          <span>{activeFile.description}</span>
          <span className="font-mono text-[11px] text-neutral-500">
            {activeFile.code.split('\n').length} baris kode
          </span>
        </div>

        {/* CODE BLOCK */}
        <div className="p-4 bg-neutral-950/90 overflow-x-auto max-h-[500px]">
          <pre className="text-xs font-mono text-neutral-200 leading-relaxed selection:bg-sky-500/30 selection:text-white">
            <code>{activeFile.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
