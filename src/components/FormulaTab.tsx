import React from 'react';
import { FormulaModel } from '../types';
import { 
  Award, 
  FlaskConical, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Layers, 
  MessageSquare, 
  Lightbulb, 
  History,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

interface FormulaTabProps {
  formulas: FormulaModel[];
  activeFormula: FormulaModel | null;
}

export const FormulaTab: React.FC<FormulaTabProps> = ({ formulas, activeFormula }) => {
  if (!activeFormula) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-xs text-neutral-500">
        Belum ada formula aktif.
      </div>
    );
  }

  const isFinal = activeFormula.status === 'FINAL';
  const isKandidat = activeFormula.status === 'kandidat';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ACTIVE FORMULA HERO CARD */}
      <div className={`p-6 sm:p-8 rounded-2xl bg-neutral-900/80 border transition-all ${
        isFinal 
          ? 'border-amber-500/50 bg-gradient-to-b from-amber-500/10 to-neutral-900' 
          : isKandidat
          ? 'border-sky-500/40'
          : 'border-neutral-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-white">
                Formula {activeFormula.formula_version}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isFinal 
                  ? 'bg-amber-400 text-neutral-950 animate-pulse' 
                  : isKandidat
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'bg-neutral-800 text-neutral-300'
              }`}>
                {isFinal ? '🏆 FORMULA FINAL' : activeFormula.status}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-xl">
              {activeFormula.ringkasan}
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <div className="text-xs text-neutral-400">Tingkat Keyakinan (Confidence)</div>
            <div className="text-3xl font-extrabold text-amber-400">
              {activeFormula.confidence}%
            </div>
            <div className="w-36 h-2 bg-neutral-800 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${activeFormula.confidence}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* CORE PILLARS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
              🪝 Struktur Hook Teruji
            </span>
            <p className="text-xs text-neutral-200 leading-relaxed font-sans">
              {activeFormula.struktur_hook}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              📄 Format Konten Terbaik
            </span>
            <p className="text-xs text-neutral-200 leading-relaxed font-sans">
              {activeFormula.format_terbaik}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              📏 Panjang & Format Ideal
            </span>
            <p className="text-xs text-neutral-200 leading-relaxed font-sans">
              {activeFormula.panjang_ideal}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
              💬 Model CTA Balasan Pertama
            </span>
            <p className="text-xs text-neutral-200 leading-relaxed font-sans">
              {activeFormula.jenis_cta}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
              ⏰ Waktu Posting Terbaik
            </span>
            <p className="text-xs text-neutral-200 leading-relaxed font-sans">
              {activeFormula.waktu_posting_terbaik}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
              🎯 Pilar Konten Unggulan
            </span>
            <p className="text-xs text-neutral-200 leading-relaxed font-sans">
              {activeFormula.pilar_terbaik}
            </p>
          </div>
        </div>

        {/* RULES & FORBIDDEN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 mt-6 border-t border-neutral-800">
          <div className="space-y-2">
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>Aturan Wajib Formula:</span>
            </div>
            <ul className="space-y-1.5 text-xs text-neutral-300">
              {(activeFormula.aturan_wajib || []).map((rule, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <XCircle className="w-4 h-4" />
              <span>Larangan & Pantangan:</span>
            </div>
            <ul className="space-y-1.5 text-xs text-neutral-300">
              {(activeFormula.larangan || []).map((rule, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold shrink-0">✗</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* NEXT EXPERIMENT SUGGESTION */}
        {activeFormula.saran_eksperimen_berikutnya && (
          <div className="mt-6 p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-300 leading-relaxed">
              <strong className="text-amber-400 font-semibold">Saran Eksperimen Berikutnya (1 Variabel):</strong>{' '}
              {activeFormula.saran_eksperimen_berikutnya}
            </div>
          </div>
        )}
      </div>

      {/* FORMULA HISTORY / CHANGELOG */}
      <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <History className="w-4 h-4 text-neutral-400" />
          <span>Riwayat Evolusi Versi Formula (Changelog)</span>
        </h3>

        <div className="divide-y divide-neutral-800/80">
          {formulas.slice().reverse().map((f) => (
            <div key={f.formula_version} className="py-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{f.formula_version}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-semibold uppercase bg-neutral-800 text-neutral-300">
                    {f.status}
                  </span>
                  <span className="text-xs text-amber-400 font-mono">
                    Confidence: {f.confidence}%
                  </span>
                </div>
                <span className="text-[11px] text-neutral-500">
                  {new Date(f.created_at).toLocaleDateString('id-ID')}
                </span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {f.changelog || f.ringkasan}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
