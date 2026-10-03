import React, { useState, useMemo } from 'react';
import { PostRecord, ContentGeneration, Topic, PostEvaluation, ContentPillar } from '../types';
import { Search, Download, ExternalLink, Filter, Eye } from 'lucide-react';

interface HistoryTabProps {
  posts: PostRecord[];
  generations: ContentGeneration[];
  topics: Topic[];
  evaluations: PostEvaluation[];
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  posts,
  generations,
  topics,
  evaluations,
}) => {
  const [search, setSearch] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<string>('all');
  const [selectedPostDetail, setSelectedPostDetail] = useState<PostRecord | null>(null);

  const combinedRecords = useMemo(() => {
    return posts.map((post) => {
      const gen = generations.find((g) => g.gen_id === post.gen_id);
      const topic = gen ? topics.find((t) => t.topic_id === gen.topic_id) : null;
      const evals = evaluations.filter((e) => e.post_id === post.post_id);
      const latestEval = evals.length > 0 ? evals[evals.length - 1] : null;

      return {
        post,
        gen,
        topic,
        evals,
        latestEval,
      };
    });
  }, [posts, generations, topics, evaluations]);

  const filtered = useMemo(() => {
    return combinedRecords.filter((rec) => {
      const q = search.toLowerCase();
      const matchesSearch = 
        !search ||
        rec.post.versi_final_dipost.toLowerCase().includes(q) ||
        rec.topic?.ide_mentah.toLowerCase().includes(q) ||
        rec.gen?.format.toLowerCase().includes(q);

      const matchesPillar = 
        selectedPillar === 'all' || 
        rec.topic?.pilar_konten === selectedPillar;

      return matchesSearch && matchesPillar;
    });
  }, [combinedRecords, search, selectedPillar]);

  const exportCSV = () => {
    const headers = [
      'ID Post',
      'Tanggal Posting',
      'Jam Posting',
      'Topik',
      'Pilar Konten',
      'Format',
      'Teks Konten',
      'Views',
      'Likes',
      'Replies',
      'Reposts',
      'Quotes',
      'Shares',
      'Engagement Score (%)',
      'Followers Baru',
      'Klik Link',
      'Penjualan',
      'Link Threads'
    ];

    const rows = combinedRecords.map((r) => [
      r.post.post_id,
      r.post.tanggal_posting,
      r.post.jam_posting,
      `"${(r.topic?.ide_mentah || '').replace(/"/g, '""')}"`,
      r.topic?.pilar_konten || '',
      r.gen?.format || '',
      `"${(r.post.versi_final_dipost || '').replace(/"/g, '""')}"`,
      r.latestEval?.views || 0,
      r.latestEval?.likes || 0,
      r.latestEval?.replies || 0,
      r.latestEval?.reposts || 0,
      r.latestEval?.quotes || 0,
      r.latestEval?.shares || 0,
      r.latestEval?.engagement_score || 0,
      r.latestEval?.follower_baru || 0,
      r.latestEval?.klik_link || 0,
      r.latestEval?.penjualan || 0,
      r.post.link_threads || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Threads_Formula_Lab_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* TOOLBAR */}
      <div className="p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white">📁 Bank Konten & Riwayat Lengkap</h2>
          <p className="text-xs text-neutral-400 mt-1">
            Data riwayat komprehensif mulai dari ide topik, variasi generator, postingan tayang, hingga metrik evaluasi.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-neutral-950 hover:bg-neutral-200 transition shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Ekspor ke CSV</span>
        </button>
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kata kunci topik, isi konten, atau format..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="sm:w-64">
          <select
            value={selectedPillar}
            onChange={(e) => setSelectedPillar(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
          >
            <option value="all">Semua Pilar Konten</option>
            <option value="Edukasi Praktis">Edukasi Praktis</option>
            <option value="Studi Kasus / Realita">Studi Kasus / Realita</option>
            <option value="Opini Kontroversial">Opini Kontroversial</option>
            <option value="Behind the Scenes">Behind the Scenes</option>
            <option value="Inspirasi & Mindset">Inspirasi & Mindset</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl bg-neutral-900/60 border border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-medium">
              <tr>
                <th className="py-3 px-4">Tanggal Posting</th>
                <th className="py-3 px-4">Topik & Pilar</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4">Cuplikan Konten</th>
                <th className="py-3 px-4 text-right">Engagement</th>
                <th className="py-3 px-4 text-right">Hasil Konversi</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-500">
                    Tidak ada catatan yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filtered.map(({ post, gen, topic, latestEval }) => (
                  <tr key={post.post_id} className="hover:bg-neutral-850/40 transition">
                    <td className="py-3 px-4 whitespace-nowrap text-neutral-400">
                      <div>{post.tanggal_posting}</div>
                      <div className="text-[10px] text-neutral-500">{post.jam_posting} WIB</div>
                    </td>

                    <td className="py-3 px-4 max-w-[200px]">
                      <div className="font-semibold text-neutral-200 truncate">
                        {topic?.ide_mentah || 'Topik Langsung'}
                      </div>
                      <div className="text-[10px] text-sky-400">
                        {topic?.pilar_konten || '-'}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-neutral-800 text-neutral-300">
                        {gen?.format || 'Manual'}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="line-clamp-2 leading-relaxed font-sans text-neutral-300">
                        {post.versi_final_dipost}
                      </p>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {latestEval ? (
                        <div>
                          <span className="font-bold text-emerald-400">
                            {latestEval.engagement_score}%
                          </span>
                          <div className="text-[10px] text-neutral-500">
                            {latestEval.dievaluasi_pada}
                          </div>
                        </div>
                      ) : (
                        <span className="text-neutral-500 text-[11px]">Belum Dievaluasi</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap text-[11px]">
                      {latestEval ? (
                        <div>
                          <span className="text-neutral-300">+{latestEval.follower_baru} fol</span>
                          <span className="text-neutral-500 mx-1">·</span>
                          <span className="text-emerald-400 font-semibold">{latestEval.penjualan} sales</span>
                        </div>
                      ) : (
                        <span className="text-neutral-500">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedPostDetail(post)}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
                        title="Lihat Detail Lengkap"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedPostDetail && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white">Detail Postingan & Histori Evaluasi</h3>
              <button
                onClick={() => setSelectedPostDetail(null)}
                className="text-neutral-400 hover:text-white text-xs font-semibold"
              >
                Tutup
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-400 block mb-1 text-[10px] font-mono">
                  TAYANG PADA: {selectedPostDetail.tanggal_posting} pukul {selectedPostDetail.jam_posting} WIB
                </span>
                <p className="whitespace-pre-wrap text-neutral-200 leading-relaxed font-sans">
                  {selectedPostDetail.versi_final_dipost}
                </p>
              </div>

              {selectedPostDetail.link_threads && (
                <div>
                  <a
                    href={selectedPostDetail.link_threads}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sky-400 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Tautan Postingan di Threads</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
