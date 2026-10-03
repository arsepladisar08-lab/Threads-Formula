import React, { useState, useId } from 'react';
import { 
  PostRecord, 
  PostEvaluation, 
  CreatorSettings, 
  EvaluationTimeframe, 
  SentimentType,
  FormulaModel,
  ThreadsAccount
} from '../types';
import { calculateEngagementScore } from '../services/formulaEngine';
import { 
  BarChart3, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  ThumbsUp,
  MessageSquare,
  Repeat,
  Share2,
  TrendingUp,
  Award,
  RefreshCw,
  Zap
} from 'lucide-react';

interface EvaluationTabProps {
  posts: PostRecord[];
  evaluations: PostEvaluation[];
  settings: CreatorSettings;
  activeFormula: FormulaModel | null;
  threadsAccount: ThreadsAccount | null;
  selectedPostId: string;
  setSelectedPostId: (id: string) => void;
  onSubmitEvaluation: (evalData: Partial<PostEvaluation>) => Promise<{
    evaluation: PostEvaluation;
    analysis?: any;
    updatedFormula?: FormulaModel;
  }>;
  onFetchThreadsInsights?: (postId: string) => Promise<any>;
  loading: boolean;
}

export const EvaluationTab: React.FC<EvaluationTabProps> = ({
  posts,
  evaluations,
  settings,
  activeFormula,
  threadsAccount,
  selectedPostId,
  setSelectedPostId,
  onSubmitEvaluation,
  onFetchThreadsInsights,
  loading,
}) => {
  const [timeframe, setTimeframe] = useState<EvaluationTimeframe>('24 jam');
  const [views, setViews] = useState<number>(3500);
  const [likes, setLikes] = useState<number>(120);
  const [replies, setReplies] = useState<number>(45);
  const [reposts, setReposts] = useState<number>(14);
  const [quotes, setQuotes] = useState<number>(6);
  const [shares, setShares] = useState<number>(10);
  const [followers, setFollowers] = useState<number>(22);
  const [clicks, setClicks] = useState<number>(75);
  const [sales, setSales] = useState<number>(4);
  const [ratingDiri, setRatingDiri] = useState<number>(4);
  const [sentimen, setSentimen] = useState<SentimentType>('positif');
  const [catatan, setCatatan] = useState('');
  const [contohKomentar, setContohKomentar] = useState('');
  const [isSyncingMetrics, setIsSyncingMetrics] = useState(false);

  const [latestAnalysisResult, setLatestAnalysisResult] = useState<{
    evaluation: PostEvaluation;
    analysis?: any;
    updatedFormula?: FormulaModel;
  } | null>(null);

  // Live Engagement Score calculation
  const liveScore = calculateEngagementScore(
    { views, likes, replies, reposts, quotes, shares },
    settings
  );

  const selectedPost = posts.find((p) => p.post_id === selectedPostId);

  const handleSyncFromThreads = async () => {
    if (!selectedPost || !onFetchThreadsInsights) return;
    setIsSyncingMetrics(true);
    try {
      const data = await onFetchThreadsInsights(selectedPost.threads_post_id || selectedPost.post_id);
      if (data) {
        if (data.views !== undefined) setViews(data.views);
        if (data.likes !== undefined) setLikes(data.likes);
        if (data.replies !== undefined) setReplies(data.replies);
        if (data.reposts !== undefined) setReposts(data.reposts);
        if (data.quotes !== undefined) setQuotes(data.quotes);
        if (data.shares !== undefined) setShares(data.shares);
      }
    } finally {
      setIsSyncingMetrics(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPostId) return;

    try {
      const res = await onSubmitEvaluation({
        post_id: selectedPostId,
        dievaluasi_pada: timeframe,
        views,
        likes,
        replies,
        reposts,
        quotes,
        shares,
        follower_baru: followers,
        klik_link: clicks,
        penjualan: sales,
        rating_diri: ratingDiri,
        sentimen_komentar: sentimen,
        catatan_user: catatan,
        contoh_komentar: contohKomentar,
        engagement_score: liveScore,
      });

      setLatestAnalysisResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* FORM EVALUATION */}
      <div className="p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>📈 Evaluasi Mandiri Per Post</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Catat metrik performa setelah post tayang (24 jam, 72 jam, atau 7 hari). AI akan menganalisis faktor penyebab performa dan memperbarui Formula Engine.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-neutral-500">Target Engagement:</span>
            <div className="text-sm font-bold text-amber-400">{settings.target_engagement_rate}%</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Post Selection & Timeframe */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Pilih Postingan
              </label>
              <select
                value={selectedPostId}
                onChange={(e) => setSelectedPostId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
              >
                <option value="">-- Pilih Postingan untuk Dievaluasi --</option>
                {posts.map((p) => (
                  <option key={p.post_id} value={p.post_id}>
                    {p.tanggal_posting} - {p.versi_final_dipost.substring(0, 45)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Titik Waktu Evaluasi
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as EvaluationTimeframe)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
              >
                <option value="24 jam">24 Jam Pertama (Initial Reach & Hook Test)</option>
                <option value="72 jam">72 Jam (Algorithmic Long-Tail & Conversion)</option>
                <option value="7 hari">7 Hari (Final Lifetime Performance)</option>
              </select>
            </div>
          </div>

          {/* Snippet Preview */}
          {selectedPost && (
            <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-850 text-xs text-neutral-300">
              <span className="text-[10px] text-neutral-500 font-mono block mb-1">
                KONTEN YANG DIEVALUASI:
              </span>
              <p className="line-clamp-3 leading-relaxed font-sans">{selectedPost.versi_final_dipost}</p>
            </div>
          )}

          {/* Metrics Inputs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-neutral-300">Metrik Engagement Utama:</div>
              {onFetchThreadsInsights && (
                <button
                  type="button"
                  onClick={handleSyncFromThreads}
                  disabled={isSyncingMetrics || !selectedPost}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500/25 disabled:opacity-50 transition"
                  title="Ambil metrik views, likes, replies, reposts langsung dari server Threads API"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncingMetrics ? 'animate-spin' : ''}`} />
                  <span>{isSyncingMetrics ? 'Menarik Metrik...' : 'Tarik Metrik Real-Time dari Threads'}</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Views</label>
                <input
                  type="number"
                  value={views}
                  onChange={(e) => setViews(Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Likes (×{settings.bobot_likes})</label>
                <input
                  type="number"
                  value={likes}
                  onChange={(e) => setLikes(Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-sky-400 font-bold mb-1">Replies (×{settings.bobot_replies})</label>
                <input
                  type="number"
                  value={replies}
                  onChange={(e) => setReplies(Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-sky-500/40 text-xs text-sky-300 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Reposts (×{settings.bobot_reposts})</label>
                <input
                  type="number"
                  value={reposts}
                  onChange={(e) => setReposts(Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Quotes (×{settings.bobot_quotes})</label>
                <input
                  type="number"
                  value={quotes}
                  onChange={(e) => setQuotes(Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Shares (×{settings.bobot_shares})</label>
                <input
                  type="number"
                  value={shares}
                  onChange={(e) => setShares(Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Conversion Metrics */}
          <div>
            <div className="text-xs font-semibold text-neutral-300 mb-2">Metrik Konversi Produk Digital:</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Follower Baru</label>
                <input
                  type="number"
                  value={followers}
                  onChange={(e) => setFollowers(Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Klik Tautan Produk</label>
                <input
                  type="number"
                  value={clicks}
                  onChange={(e) => setClicks(Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-emerald-400 font-bold mb-1">Penjualan Terjadi (Order)</label>
                <input
                  type="number"
                  value={sales}
                  onChange={(e) => setSales(Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-emerald-500/40 text-xs text-emerald-400 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* LIVE SCORE BANNER */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-neutral-400">Skor Engagement Terhitung:</div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-extrabold ${liveScore >= settings.target_engagement_rate ? 'text-emerald-400' : 'text-sky-400'}`}>
                  {liveScore}%
                </span>
                <span className="text-xs text-neutral-500">
                  (Target: {settings.target_engagement_rate}%)
                </span>
              </div>
            </div>

            <div className="text-right text-xs text-neutral-500 max-w-xs">
              Balasan (Replies) memiliki bobot tertinggi ({settings.bobot_replies}x) karena algoritma Threads memprioritaskan percakapan.
            </div>
          </div>

          {/* Qualitative Questions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Rating Kepuasan Diri (1 - 5)
              </label>
              <select
                value={ratingDiri}
                onChange={(e) => setRatingDiri(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
              >
                <option value={5}>⭐⭐⭐⭐⭐ 5/5 - Sangat Memuaskan (Viral & Ramai Diskusi)</option>
                <option value={4}>⭐⭐⭐⭐ 4/5 - Bagus (Di Atas Rata-rata)</option>
                <option value={3}>⭐⭐⭐ 3/5 - Cukup (Sesuai Ekspektasi Awal)</option>
                <option value={2}>⭐⭐ 2/5 - Kurang (Kurang Respons)</option>
                <option value={1}>⭐ 1/5 - Mengecewakan (Sepi Total)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Sentimen Komentar Audiens
              </label>
              <select
                value={sentimen}
                onChange={(e) => setSentimen(e.target.value as SentimentType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
              >
                <option value="positif">Positif (Banyak Ucapan Terima Kasih & Curhat)</option>
                <option value="campuran">Campuran (Diskusi Seru & Perdebatan Konstruktif)</option>
                <option value="negatif">Kritik / Skeptis</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Catatan Pengamatan Anda (Apa yang terasa berhasil atau gagal?)
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={2}
              placeholder="Contoh: Format pertanyaan di akhir memancing banyak creator curhat tentang masalah validasi ide..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Contoh Komentar Terbaik dari Audiens
            </label>
            <input
              type="text"
              value={contohKomentar}
              onChange={(e) => setContohKomentar(e.target.value)}
              placeholder="Salin komentar audiens yang paling bermakna..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || !selectedPostId}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-white text-neutral-950 hover:bg-neutral-200 disabled:opacity-50 transition"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></span>
                  <span>Menganalisis & Mengupdate Formula...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simpan & Analisis dengan AI (Update Formula)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ANALYSIS RESULT CARD */}
      {latestAnalysisResult && (
        <div className="p-6 rounded-2xl bg-neutral-900/80 border border-sky-500/30 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-bold text-sky-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Hasil Analisis AI & Evolusi Formula Engine</span>
            </h3>
            <span className="text-xs font-bold text-emerald-400">
              Skor: {latestAnalysisResult.evaluation.engagement_score}%
            </span>
          </div>

          {latestAnalysisResult.analysis && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="font-semibold text-white block mb-1">
                  {latestAnalysisResult.analysis.skor_dibandingkan_rata2}
                </span>
                <p className="text-neutral-300 leading-relaxed">
                  <strong>Kelebihan Post:</strong> {latestAnalysisResult.analysis.kelebihan_post}
                </p>
                <p className="text-neutral-400 leading-relaxed mt-1">
                  <strong>Kelemahan:</strong> {latestAnalysisResult.analysis.kelemahan_post}
                </p>
                <p className="text-sky-300 leading-relaxed mt-1">
                  <strong>Saran Perbaikan:</strong> {latestAnalysisResult.analysis.rekomendasi_perbaikan}
                </p>
              </div>

              {latestAnalysisResult.analysis.faktor_kunci && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {latestAnalysisResult.analysis.faktor_kunci.map((f: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-md text-[11px] bg-neutral-800 text-neutral-300">
                      ✓ {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {latestAnalysisResult.updatedFormula && (
            <div className="pt-3 border-t border-neutral-800 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white">
                  Formula Engine Diperbarui: {latestAnalysisResult.updatedFormula.formula_version} ({latestAnalysisResult.updatedFormula.status.toUpperCase()})
                </span>
                <span className="text-amber-400 font-semibold">
                  Confidence: {latestAnalysisResult.updatedFormula.confidence}%
                </span>
              </div>
              <p className="text-neutral-300 leading-relaxed">
                {latestAnalysisResult.updatedFormula.ringkasan}
              </p>
              {latestAnalysisResult.updatedFormula.saran_eksperimen_berikutnya && (
                <div className="mt-2 text-sky-400">
                  <strong>Saran Uji Coba Siklus Berikutnya:</strong> {latestAnalysisResult.updatedFormula.saran_eksperimen_berikutnya}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
