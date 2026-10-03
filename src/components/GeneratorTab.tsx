import React, { useState } from 'react';
import { 
  Topic, 
  ContentGeneration, 
  FormulaModel, 
  CreatorSettings 
} from '../types';
import { 
  Copy, 
  Edit3, 
  Share2, 
  Sparkles, 
  Check, 
  Flame, 
  HelpCircle, 
  Compass, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface GeneratorTabProps {
  topics: Topic[];
  generations: ContentGeneration[];
  activeFormula: FormulaModel | null;
  settings: CreatorSettings;
  selectedTopicId: string;
  setSelectedTopicId: (id: string) => void;
  onGenerate: (topicId: string) => Promise<void>;
  onMarkForPosting: (gen: ContentGeneration) => void;
  onDirectPublish?: (gen: ContentGeneration) => Promise<void>;
  threadsConnected?: boolean;
  onUpdateGeneration: (updated: ContentGeneration) => void;
  loading: boolean;
}

export const GeneratorTab: React.FC<GeneratorTabProps> = ({
  topics,
  generations,
  activeFormula,
  settings,
  selectedTopicId,
  setSelectedTopicId,
  onGenerate,
  onMarkForPosting,
  onDirectPublish,
  threadsConnected = false,
  onUpdateGeneration,
  loading,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [editingGen, setEditingGen] = useState<ContentGeneration | null>(null);

  const selectedTopic = topics.find((t) => t.topic_id === selectedTopicId);
  const topicGenerations = generations.filter((g) => g.topic_id === selectedTopicId);

  const handleCopy = (gen: ContentGeneration) => {
    const fullText = `${gen.hook}\n\n${gen.body}`;
    navigator.clipboard.writeText(fullText);
    setCopiedId(gen.gen_id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveEdit = () => {
    if (!editingGen) return;
    onUpdateGeneration(editingGen);
    setEditingGen(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* TOP CONTROLS & FORMULA INFO */}
      <div className="p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>✍️ AI Content Generator</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-800 text-sky-400 border border-neutral-700 font-semibold">
                Formula Aktif: {activeFormula?.formula_version || 'v1.0'}
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Menghasilkan 4-5 variasi konten terstruktur: Hook scroll-stopper, Body tanpa hard-selling, dan CTA balasan pertama (reply #1).
            </p>
          </div>

          {activeFormula && (
            <div className="text-xs text-neutral-400 bg-neutral-950 px-3.5 py-2 rounded-xl border border-neutral-800">
              <span className="text-neutral-500">Pedoman Hook:</span>{' '}
              <strong className="text-neutral-200">{activeFormula.struktur_hook}</strong>
            </div>
          )}
        </div>

        {/* SELECT TOPIC & ACTION */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
            >
              <option value="">-- Pilih Topik untuk Dibuat Konten --</option>
              {topics.map((t) => (
                <option key={t.topic_id} value={t.topic_id}>
                  [{t.pilar_konten}] {t.ide_mentah}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => onGenerate(selectedTopicId)}
            disabled={loading || !selectedTopicId}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-white text-neutral-950 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></span>
                <span>Meracik 4-5 Variasi Konten...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Variasi Konten</span>
              </>
            )}
          </button>
        </div>

        {/* TOPIC CONTEXT BADGES */}
        {selectedTopic && (
          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
            <span>Persona: <strong className="text-neutral-200">{selectedTopic.persona}</strong></span>
            <span>·</span>
            <span>Pain Point: <strong className="text-neutral-200">{selectedTopic.pain_point}</strong></span>
            <span>·</span>
            <span>Pilar: <strong className="text-sky-400">{selectedTopic.pilar_konten}</strong></span>
          </div>
        )}
      </div>

      {/* VARIATIONS CARDS CONTAINER */}
      {topicGenerations.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-neutral-900/30 border border-neutral-800/60">
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Belum ada variasi untuk topik ini. Pilih topik di atas lalu klik tombol <strong className="text-neutral-300">Generate Variasi Konten</strong>.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
            <span>Menampilkan {topicGenerations.length} variasi konten untuk topik ini</span>
            <span>Formula: {activeFormula?.formula_version}</span>
          </div>

          {topicGenerations.map((gen, idx) => {
            const isExploration = gen.is_exploration;
            return (
              <div
                key={gen.gen_id}
                className={`p-6 rounded-2xl bg-neutral-900/80 border transition-all ${
                  isExploration
                    ? 'border-amber-500/40 shadow-sm shadow-amber-500/5'
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {/* CARD HEADER */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-400">#{idx + 1}</span>
                    <span className="text-xs font-semibold text-white">
                      {gen.format}
                    </span>
                    {isExploration && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <Compass className="w-3 h-3" />
                        Eksplorasi Hipotesis Baru
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-neutral-500">Prediksi Skor:</span>
                    <span className="font-bold text-emerald-400">{gen.prediksi_skor}/10</span>
                  </div>
                </div>

                {/* HOOK & BODY */}
                <div className="space-y-3 mb-4">
                  {/* HOOK */}
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400 mb-1">
                      🪝 Scroll-Stopper Hook
                    </div>
                    <p className="text-sm font-bold text-white leading-snug font-sans">
                      {gen.hook}
                    </p>
                  </div>

                  {/* BODY */}
                  <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/60">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                      📄 Body Post Utama (Tanpa Hard Selling)
                    </div>
                    <div className="text-xs text-neutral-200 leading-relaxed whitespace-pre-line font-sans">
                      {gen.body}
                    </div>
                    <div className="mt-2 pt-2 border-t border-neutral-900 flex justify-end text-[11px] text-neutral-500">
                      {gen.body.length} karakter
                    </div>
                  </div>

                  {/* CTA REPLY #1 */}
                  <div className="p-3.5 rounded-xl bg-sky-950/20 border border-sky-500/20 text-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400 mb-1 flex items-center gap-1.5">
                      <span>💬 Balasan Pertama (First Reply CTA)</span>
                      <span className="text-neutral-400 font-normal">· Penempatan Link Produk</span>
                    </div>
                    <p className="text-neutral-300 leading-relaxed">
                      {gen.cta_reply}
                    </p>
                  </div>

                  {/* STRATEGY REASON */}
                  <div className="text-xs text-neutral-400 italic bg-neutral-950/40 p-2.5 rounded-lg border border-neutral-850">
                    💡 <strong>Alasan Strategi:</strong> {gen.alasan_strategi}
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-800/80">
                  <div className="text-[11px] text-neutral-500">
                    Tag: #{gen.topic_tag}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(gen)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition"
                      title="Salin Hook dan Body ke Clipboard"
                    >
                      {copiedId === gen.gen_id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Teks</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setEditingGen({ ...gen })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => onMarkForPosting(gen)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition"
                    >
                      <span>Atur Jadwal</span>
                    </button>

                    {onDirectPublish && (
                      <button
                        onClick={async () => {
                          setPublishingId(gen.gen_id);
                          try {
                            await onDirectPublish(gen);
                          } finally {
                            setPublishingId(null);
                          }
                        }}
                        disabled={publishingId === gen.gen_id}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-white text-neutral-950 hover:bg-neutral-200 disabled:opacity-50 transition shadow-sm"
                        title="Terbitkan langsung post utama dan balasan CTA ke Threads"
                      >
                        {publishingId === gen.gen_id ? (
                          <>
                            <span className="w-3 h-3 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></span>
                            <span>Menerbitkan...</span>
                          </>
                        ) : (
                          <>
                            <span className="font-extrabold text-sm leading-none">@</span>
                            <span>Post Live ke Threads</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT MODAL */}
      {editingGen && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-white">Edit Variasi Konten</h3>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Hook Pembuka (Maks 2 Baris)
              </label>
              <textarea
                value={editingGen.hook}
                onChange={(e) => setEditingGen({ ...editingGen, hook: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Body Post Utama
              </label>
              <textarea
                value={editingGen.body}
                onChange={(e) => setEditingGen({ ...editingGen, body: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                CTA Balasan Pertama (Reply #1)
              </label>
              <textarea
                value={editingGen.cta_reply}
                onChange={(e) => setEditingGen({ ...editingGen, cta_reply: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingGen(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-neutral-950 hover:bg-neutral-200 transition"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
