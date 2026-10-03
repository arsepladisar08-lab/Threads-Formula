import React, { useState } from 'react';
import { Topic, ContentPillar, CreatorSettings } from '../types';
import { Sparkles, ArrowRight, Check, Clock, PlusCircle } from 'lucide-react';

interface TopicTabProps {
  topics: Topic[];
  settings: CreatorSettings;
  onEnrichTopic: (rawText: string) => Promise<{
    persona: string;
    pain_point: string;
    pilar_konten: ContentPillar;
    sudut_pandang: string;
  }>;
  onSaveTopic: (topic: Partial<Topic>, proceedToGenerate?: boolean) => void;
  onSelectTopicForGenerator: (topicId: string) => void;
}

export const TopicTab: React.FC<TopicTabProps> = ({
  topics,
  settings,
  onEnrichTopic,
  onSaveTopic,
  onSelectTopicForGenerator,
}) => {
  const [ideMentah, setIdeMentah] = useState('');
  const [loading, setLoading] = useState(false);
  const [enrichedData, setEnrichedData] = useState<{
    persona: string;
    pain_point: string;
    pilar_konten: ContentPillar;
    sudut_pandang: string;
  } | null>(null);

  const handleEnrich = async () => {
    if (!ideMentah.trim()) return;
    setLoading(true);
    try {
      const res = await onEnrichTopic(ideMentah);
      setEnrichedData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOnly = () => {
    if (!ideMentah.trim()) return;
    onSaveTopic({
      ide_mentah: ideMentah,
      persona: enrichedData?.persona || settings.persona_audiens,
      pain_point: enrichedData?.pain_point || settings.pain_point_utama,
      pilar_konten: enrichedData?.pilar_konten || 'Edukasi Praktis',
      sudut_pandang: enrichedData?.sudut_pandang || ideMentah,
      status: 'baru',
    }, false);

    setIdeMentah('');
    setEnrichedData(null);
  };

  const handleSaveAndGenerate = () => {
    if (!ideMentah.trim()) return;
    onSaveTopic({
      ide_mentah: ideMentah,
      persona: enrichedData?.persona || settings.persona_audiens,
      pain_point: enrichedData?.pain_point || settings.pain_point_utama,
      pilar_konten: enrichedData?.pilar_konten || 'Edukasi Praktis',
      sudut_pandang: enrichedData?.sudut_pandang || ideMentah,
      status: 'baru',
    }, true);

    setIdeMentah('');
    setEnrichedData(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* INPUT RAW TOPIC CARD */}
      <div className="p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base font-bold text-white">Input Ide Topik Mentah</span>
        </div>
        <p className="text-xs text-neutral-400 mb-4">
          Cukup tulis 1 kalimat ide kasar. AI akan menganalisis persona audiens, pain point, pilar konten, dan sudut pandang kontras yang memancing percakapan di Threads.
        </p>

        <div className="space-y-4">
          <div>
            <textarea
              value={ideMentah}
              onChange={(e) => setIdeMentah(e.target.value)}
              placeholder="Contoh: Bongkar cara bikin template Notion invoice yang laku 300+ copy dalam seminggu..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 text-sm focus:outline-none focus:border-sky-500 placeholder-neutral-600 transition"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-[11px] text-neutral-500">
              Profil Niche: <strong className="text-neutral-300">{settings.niche}</strong> · Produk: <strong className="text-neutral-300">{settings.nama_produk}</strong>
            </div>

            <button
              onClick={handleEnrich}
              disabled={loading || !ideMentah.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-neutral-950 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></span>
                  <span>Menganalisis Angle...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Olah dengan AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ENRICHED RESULT CARD */}
      {enrichedData && (
        <div className="p-6 rounded-2xl bg-neutral-900/80 border border-sky-500/30 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-sky-400">
              Hasil Pengolahan AI (Dapat Diedit Bebas)
            </h3>
            <span className="text-[11px] text-neutral-400">
              Siap dikirim ke AI Generator
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Persona Sasaran Spesifik
              </label>
              <input
                type="text"
                value={enrichedData.persona}
                onChange={(e) => setEnrichedData({ ...enrichedData, persona: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Pilar Konten
              </label>
              <select
                value={enrichedData.pilar_konten}
                onChange={(e) => setEnrichedData({ ...enrichedData, pilar_konten: e.target.value as ContentPillar })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
              >
                <option value="Edukasi Praktis">Edukasi Praktis</option>
                <option value="Studi Kasus / Realita">Studi Kasus / Realita</option>
                <option value="Opini Kontroversial">Opini Kontroversial</option>
                <option value="Behind the Scenes">Behind the Scenes</option>
                <option value="Inspirasi & Mindset">Inspirasi & Mindset</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Pain Point Mendalam yang Dijawab
              </label>
              <input
                type="text"
                value={enrichedData.pain_point}
                onChange={(e) => setEnrichedData({ ...enrichedData, pain_point: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Sudut Pandang (Angle) Kontras & Scroll-Stopper
              </label>
              <textarea
                value={enrichedData.sudut_pandang}
                onChange={(e) => setEnrichedData({ ...enrichedData, sudut_pandang: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-800">
            <button
              onClick={handleSaveOnly}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition"
            >
              Simpan Topik Saja
            </button>
            <button
              onClick={handleSaveAndGenerate}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-neutral-950 transition"
            >
              <span>Lanjut ke Konten Generator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* RECENT TOPICS LIST */}
      <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
        <h3 className="text-sm font-semibold text-white mb-3">Daftar Bank Topik ({topics.length})</h3>
        {topics.length === 0 ? (
          <p className="text-xs text-neutral-500 py-4 text-center">
            Belum ada topik yang disimpan. Tulis ide pertama Anda di formulir atas.
          </p>
        ) : (
          <div className="divide-y divide-neutral-800">
            {topics.map((t) => (
              <div key={t.topic_id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-neutral-200">{t.ide_mentah}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-800 text-neutral-400">
                      {t.pilar_konten}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Angle: <span className="text-neutral-300">{t.sudut_pandang}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    t.status === 'dievaluasi' ? 'bg-emerald-500/15 text-emerald-400' :
                    t.status === 'diposting' ? 'bg-sky-500/15 text-sky-400' :
                    t.status === 'diproses' ? 'bg-amber-500/15 text-amber-400' :
                    'bg-neutral-800 text-neutral-400'
                  }`}>
                    {t.status}
                  </span>
                  <button
                    onClick={() => onSelectTopicForGenerator(t.topic_id)}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition"
                    title="Buat variasi konten dari topik ini"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
