import React, { useState } from 'react';
import { PostRecord, ContentGeneration, Topic, ThreadsAccount } from '../types';
import { Send, Clock, ExternalLink, MessageCircle, AlertCircle, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface PostingTabProps {
  posts: PostRecord[];
  generations: ContentGeneration[];
  topics: Topic[];
  queuedGen: ContentGeneration | null;
  threadsAccount: ThreadsAccount | null;
  onOpenThreadsConnect: () => void;
  onSubmitPost: (postData: {
    gen_id?: string;
    topic_id?: string;
    tanggal_posting: string;
    jam_posting: string;
    link_threads: string;
    versi_final_dipost: string;
    cta_reply?: string;
  }) => void;
  onLivePublishToThreads: (postData: {
    text: string;
    cta_reply?: string;
    gen_id?: string;
    topic_id?: string;
  }) => Promise<void>;
  onNavigateToEvaluation: (postId: string) => void;
}

export const PostingTab: React.FC<PostingTabProps> = ({
  posts,
  generations,
  topics,
  queuedGen,
  threadsAccount,
  onOpenThreadsConnect,
  onSubmitPost,
  onLivePublishToThreads,
  onNavigateToEvaluation,
}) => {
  const now = new Date();
  const defaultDate = now.toISOString().substring(0, 10);
  const defaultTime = now.toTimeString().substring(0, 5);

  const [tanggal, setTanggal] = useState(defaultDate);
  const [jam, setJam] = useState(defaultTime);
  const [linkThreads, setLinkThreads] = useState('');
  const [finalText, setFinalText] = useState(
    queuedGen ? `${queuedGen.hook}\n\n${queuedGen.body}` : ''
  );
  const [ctaReply, setCtaReply] = useState(queuedGen?.cta_reply || '');
  const [isPublishingLive, setIsPublishingLive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalText.trim()) return;

    onSubmitPost({
      gen_id: queuedGen?.gen_id || (generations[0]?.gen_id || 'manual'),
      topic_id: queuedGen?.topic_id || (topics[0]?.topic_id || 'manual'),
      tanggal_posting: tanggal,
      jam_posting: jam,
      link_threads: linkThreads,
      versi_final_dipost: finalText,
      cta_reply: ctaReply,
    });

    setLinkThreads('');
    setFinalText('');
    setCtaReply('');
  };

  const handleLivePublish = async () => {
    if (!finalText.trim()) return;
    setIsPublishingLive(true);
    try {
      await onLivePublishToThreads({
        text: finalText,
        cta_reply: ctaReply,
        gen_id: queuedGen?.gen_id,
        topic_id: queuedGen?.topic_id,
      });
      setLinkThreads('');
      setFinalText('');
      setCtaReply('');
    } finally {
      setIsPublishingLive(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 30-60 MINUTE ALGORITHM REMINDER */}
      <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-500/30 flex items-start gap-3">
        <Clock className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div className="text-xs text-neutral-300 leading-relaxed">
          <strong className="text-sky-300 font-semibold">Kaidah Algoritma Threads:</strong> Balas komentar yang masuk dalam <strong>30–60 menit pertama</strong> setelah posting! Algoritma Threads mengukur kecepatan percakapan awal (velocity of replies) sebagai sinyal utama untuk melipatgandakan distribusi organik ke tab 'Untuk Anda' (For You).
        </div>
      </div>

      {/* RECORD POST FORM */}
      <div className="p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>📝 Catat / Terbitkan Postingan ke Threads</span>
              {queuedGen && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 font-semibold">
                  Dari Variasi: {queuedGen.format}
                </span>
              )}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Anda bisa menerbitkan langsung secara live via Threads API atau mencatat postingan secara manual.
            </p>
          </div>

          <div className="shrink-0">
            {threadsAccount?.is_connected ? (
              <div className="flex items-center gap-2 text-xs bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Tersambung: <strong>@{threadsAccount.username}</strong></span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenThreadsConnect}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-neutral-950 hover:bg-neutral-200 transition"
              >
                <span>@ Sambungkan Threads Live</span>
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Tanggal Posting
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Jam Posting (WIB)
              </label>
              <input
                type="time"
                value={jam}
                onChange={(e) => setJam(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Versi Final Post Utama yang Dipost
            </label>
            <textarea
              value={finalText}
              onChange={(e) => setFinalText(e.target.value)}
              rows={5}
              required
              placeholder="Teks post utama yang menghentikan scroll (tanpa link)..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500 font-sans leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-sky-400 mb-1.5">
              Balasan Pertama (Reply #1 CTA / Link Produk)
            </label>
            <textarea
              value={ctaReply}
              onChange={(e) => setCtaReply(e.target.value)}
              rows={2}
              placeholder="Contoh: Template lengkap & panduannya bisa dicek di tautan ini..."
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-sky-500/30 text-xs text-neutral-200 focus:outline-none focus:border-sky-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Tautan Postingan Threads (Otomatis terisi jika terbit lewat API)
            </label>
            <input
              type="url"
              value={linkThreads}
              onChange={(e) => setLinkThreads(e.target.value)}
              placeholder="https://threads.net/@username/post/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500 placeholder-neutral-600"
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-neutral-850">
            <button
              type="submit"
              disabled={!finalText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 disabled:opacity-50 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Simpan Catatan Manual</span>
            </button>

            <button
              type="button"
              onClick={handleLivePublish}
              disabled={!finalText.trim() || isPublishingLive}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-white text-neutral-950 hover:bg-neutral-200 disabled:opacity-50 transition shadow-sm"
              title="Kirim dan terbitkan langsung ke akun Threads Anda"
            >
              {isPublishingLive ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></span>
                  <span>Menerbitkan Live ke Threads...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
                  <span>
                    {threadsAccount?.is_connected
                      ? `Terbitkan Live ke @${threadsAccount.username}`
                      : 'Terbitkan Live ke Threads'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* POSTED HISTORY TABLE */}
      <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
        <h3 className="text-sm font-semibold text-white mb-3">
          Daftar Postingan Aktif ({posts.length})
        </h3>

        {posts.length === 0 ? (
          <p className="text-xs text-neutral-500 py-6 text-center">
            Belum ada postingan yang dicatat. Buat variasi konten di tab Konten, lalu tandai akan diposting.
          </p>
        ) : (
          <div className="divide-y divide-neutral-800">
            {posts.map((post) => {
              const gen = generations.find((g) => g.gen_id === post.gen_id);
              const topic = gen ? topics.find((t) => t.topic_id === gen.topic_id) : null;
              return (
                <div key={post.post_id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-neutral-300">
                        {post.tanggal_posting} pukul {post.jam_posting}
                      </span>
                      {gen?.format && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-800 text-neutral-300">
                          {gen.format}
                        </span>
                      )}
                      {post.link_threads && (
                        <a
                          href={post.link_threads}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Buka di Threads</span>
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 line-clamp-2 font-sans">
                      {post.versi_final_dipost}
                    </p>
                  </div>

                  <div className="shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => onNavigateToEvaluation(post.post_id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition"
                    >
                      <span>Evaluasi Performa</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
