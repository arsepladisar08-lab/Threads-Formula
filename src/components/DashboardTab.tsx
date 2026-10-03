import React, { useMemo, useState } from 'react';
import { 
  Topic, 
  PostRecord, 
  PostEvaluation, 
  FormulaModel, 
  ContentGeneration, 
  CreatorSettings 
} from '../types';
import { 
  TrendingUp, 
  Award, 
  Repeat, 
  Clock, 
  Layers, 
  FileText, 
  ArrowUpRight, 
  CheckCircle2, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface DashboardTabProps {
  topics: Topic[];
  posts: PostRecord[];
  evaluations: PostEvaluation[];
  generations: ContentGeneration[];
  formulas: FormulaModel[];
  settings: CreatorSettings;
  onRecycle: (post: PostRecord) => void;
  onSelectTopic: (topicId: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  topics,
  posts,
  evaluations,
  generations,
  formulas,
  settings,
  onRecycle,
  onNavigateToTab,
}) => {
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  const activeFormula = formulas.length > 0 ? formulas[formulas.length - 1] : null;
  const isFinalFormula = activeFormula?.status === 'FINAL';

  // Summary Metrics
  const avgEngagementRate = useMemo(() => {
    if (evaluations.length === 0) return 0;
    const sum = evaluations.reduce((acc, curr) => acc + (curr.engagement_score || 0), 0);
    return Math.round((sum / evaluations.length) * 10) / 10;
  }, [evaluations]);

  const totalFollowersGained = useMemo(() => {
    return evaluations.reduce((acc, curr) => acc + (curr.follower_baru || 0), 0);
  }, [evaluations]);

  const totalSalesCount = useMemo(() => {
    return evaluations.reduce((acc, curr) => acc + (curr.penjualan || 0), 0);
  }, [evaluations]);

  // Rankings by Format
  const formatRankings = useMemo(() => {
    const map: Record<string, { totalScore: number; count: number }> = {};
    evaluations.forEach((ev) => {
      const post = posts.find((p) => p.post_id === ev.post_id);
      const gen = post ? generations.find((g) => g.gen_id === post.gen_id) : null;
      const fmt = gen?.format || 'Format Lainnya';

      if (!map[fmt]) map[fmt] = { totalScore: 0, count: 0 };
      map[fmt].totalScore += ev.engagement_score;
      map[fmt].count += 1;
    });

    return Object.entries(map)
      .map(([format, data]) => ({
        format,
        avg: Math.round((data.totalScore / data.count) * 100) / 100,
        count: data.count,
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [evaluations, posts, generations]);

  // Rankings by Content Pillar
  const pillarRankings = useMemo(() => {
    const map: Record<string, { totalScore: number; count: number }> = {};
    evaluations.forEach((ev) => {
      const post = posts.find((p) => p.post_id === ev.post_id);
      const topic = post ? topics.find((t) => t.topic_id === post.topic_id) : null;
      const pillar = topic?.pilar_konten || 'Tanpa Pilar';

      if (!map[pillar]) map[pillar] = { totalScore: 0, count: 0 };
      map[pillar].totalScore += ev.engagement_score;
      map[pillar].count += 1;
    });

    return Object.entries(map)
      .map(([pillar, data]) => ({
        pillar,
        avg: Math.round((data.totalScore / data.count) * 100) / 100,
        count: data.count,
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [evaluations, posts, topics]);

  // Rankings by Posting Hour
  const hourRankings = useMemo(() => {
    const map: Record<string, { totalScore: number; count: number }> = {};
    evaluations.forEach((ev) => {
      const post = posts.find((p) => p.post_id === ev.post_id);
      if (!post || !post.jam_posting) return;
      const hour = post.jam_posting.split(':')[0] + ':00';

      if (!map[hour]) map[hour] = { totalScore: 0, count: 0 };
      map[hour].totalScore += ev.engagement_score;
      map[hour].count += 1;
    });

    return Object.entries(map)
      .map(([hour, data]) => ({
        hour,
        avg: Math.round((data.totalScore / data.count) * 100) / 100,
        count: data.count,
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [evaluations, posts]);

  // Top 5 Best Performing Posts
  const topPosts = useMemo(() => {
    return [...evaluations]
      .sort((a, b) => b.engagement_score - a.engagement_score)
      .slice(0, 5)
      .map((ev) => {
        const post = posts.find((p) => p.post_id === ev.post_id);
        const gen = post ? generations.find((g) => g.gen_id === post.gen_id) : null;
        const topic = post ? topics.find((t) => t.topic_id === post.topic_id) : null;
        return { evaluation: ev, post, generation: gen, topic };
      });
  }, [evaluations, posts, generations, topics]);

  // Trend Chart data points
  const chartData = useMemo(() => {
    return [...evaluations].map((ev, index) => {
      const post = posts.find((p) => p.post_id === ev.post_id);
      return {
        label: `#${index + 1}`,
        score: ev.engagement_score,
        target: settings.target_engagement_rate,
        date: post?.tanggal_posting || ev.created_at.substring(0, 10),
        timeframe: ev.dievaluasi_pada,
        postSnippet: post?.versi_final_dipost.substring(0, 60) + '...',
      };
    });
  }, [evaluations, posts, settings.target_engagement_rate]);

  // SVG Chart Dimensions & Math
  const maxScore = useMemo(() => {
    const maxInEvals = Math.max(...chartData.map((d) => d.score), settings.target_engagement_rate, 10);
    return Math.ceil(maxInEvals + 2);
  }, [chartData, settings.target_engagement_rate]);

  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const pointsString = useMemo(() => {
    if (chartData.length < 2) return '';
    const step = (svgWidth - paddingX * 2) / (chartData.length - 1);
    return chartData
      .map((d, i) => {
        const x = paddingX + i * step;
        const y = svgHeight - paddingY - (d.score / maxScore) * (svgHeight - paddingY * 2);
        return `${x},${y}`;
      })
      .join(' ');
  }, [chartData, maxScore]);

  const targetLineY = svgHeight - paddingY - (settings.target_engagement_rate / maxScore) * (svgHeight - paddingY * 2);

  return (
    <div className="space-y-6">
      {/* FINAL FORMULA WINNER BANNER */}
      {isFinalFormula && activeFormula && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-emerald-500/15 border border-amber-500/40 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <h2 className="text-lg font-bold text-amber-300">
                  Formula Final Ditemukan ({activeFormula.formula_version})
                </h2>
              </div>
              <p className="text-sm text-neutral-200 leading-relaxed max-w-3xl">
                {activeFormula.ringkasan}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400 pt-1">
                <span>Hook: <strong className="text-white">{activeFormula.struktur_hook}</strong></span>
                <span>·</span>
                <span>Format: <strong className="text-white">{activeFormula.format_terbaik}</strong></span>
                <span>·</span>
                <span>Confidence: <strong className="text-amber-400">{activeFormula.confidence}%</strong></span>
              </div>
            </div>
            <button
              onClick={() => onNavigateToTab('formula')}
              className="self-start md:self-center px-4 py-2 rounded-xl text-xs font-semibold bg-amber-400 text-neutral-950 hover:bg-amber-300 transition"
            >
              Lihat Blueprint Lengkap
            </button>
          </div>
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-neutral-900/70 border border-neutral-800">
          <div className="text-xs font-medium text-neutral-400">Total Topik Diolah</div>
          <div className="text-2xl font-bold text-white mt-1">{topics.length}</div>
          <div className="text-xs text-neutral-500 mt-1">Ide tervalidasi AI</div>
        </div>

        <div className="p-5 rounded-xl bg-neutral-900/70 border border-neutral-800">
          <div className="text-xs font-medium text-neutral-400">Postingan Tayang</div>
          <div className="text-2xl font-bold text-white mt-1">{posts.length}</div>
          <div className="text-xs text-neutral-500 mt-1">{evaluations.length} telah dievaluasi</div>
        </div>

        <div className="p-5 rounded-xl bg-neutral-900/70 border border-neutral-800">
          <div className="text-xs font-medium text-neutral-400">Rata-rata Engagement</div>
          <div className="text-2xl font-bold text-sky-400 mt-1">{avgEngagementRate}%</div>
          <div className="text-xs text-neutral-500 mt-1">Target: {settings.target_engagement_rate}%</div>
        </div>

        <div className="p-5 rounded-xl bg-neutral-900/70 border border-neutral-800">
          <div className="text-xs font-medium text-neutral-400">Status Formula Aktif</div>
          <div className="text-2xl font-bold text-white mt-1 capitalize">
            {activeFormula?.status || 'Eksperimen'}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Versi {activeFormula?.formula_version || 'v1.0'} · {activeFormula?.confidence || 45}% Confidence
          </div>
        </div>
      </div>

      {/* MAIN CHART & RANKINGS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Engagement Trend Chart */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Tren Engagement Score per Post</h3>
              <p className="text-xs text-neutral-400">
                Formula bobot: ((Replies×{settings.bobot_replies}) + (Reposts×{settings.bobot_reposts}) + (Quotes×{settings.bobot_quotes}) + (Shares×{settings.bobot_shares}) + Likes) / Views × 100
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-neutral-400">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span> Postingan
              </span>
              <span className="flex items-center gap-1.5 text-neutral-400">
                <span className="w-3 border-b-2 border-dashed border-amber-400 inline-block"></span> Target ({settings.target_engagement_rate}%)
              </span>
            </div>
          </div>

          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-neutral-500 text-xs">
              Belum ada data evaluasi post.
            </div>
          ) : (
            <div className="relative">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-52 overflow-visible select-none"
              >
                {/* Horizontal Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                  const y = svgHeight - paddingY - pct * (svgHeight - paddingY * 2);
                  const scoreLabel = Math.round(pct * maxScore);
                  return (
                    <g key={idx}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={svgWidth - paddingX}
                        y2={y}
                        stroke="#262626"
                        strokeWidth="1"
                      />
                      <text
                        x={paddingX - 8}
                        y={y + 4}
                        fill="#737373"
                        fontSize="10"
                        textAnchor="end"
                      >
                        {scoreLabel}%
                      </text>
                    </g>
                  );
                })}

                {/* Target Rate Dashed Line */}
                <line
                  x1={paddingX}
                  y1={targetLineY}
                  x2={svgWidth - paddingX}
                  y2={targetLineY}
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />

                {/* Shaded Area under Curve */}
                {chartData.length > 1 && (
                  <polygon
                    points={`${paddingX},${svgHeight - paddingY} ${pointsString} ${svgWidth - paddingX},${svgHeight - paddingY}`}
                    fill="url(#skyGradient)"
                    opacity="0.2"
                  />
                )}

                {/* Gradient Definition */}
                <defs>
                  <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Connected Line */}
                {chartData.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={pointsString}
                  />
                )}

                {/* Data Points */}
                {chartData.map((d, i) => {
                  const step = chartData.length > 1 ? (svgWidth - paddingX * 2) / (chartData.length - 1) : 0;
                  const x = chartData.length > 1 ? paddingX + i * step : svgWidth / 2;
                  const y = svgHeight - paddingY - (d.score / maxScore) * (svgHeight - paddingY * 2);
                  const isHovered = selectedPointIndex === i;

                  return (
                    <g key={i} className="cursor-pointer" onClick={() => setSelectedPointIndex(i)}>
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 6 : 4}
                        className="transition-all"
                        fill={d.score >= settings.target_engagement_rate ? '#10b981' : '#38bdf8'}
                        stroke="#0a0a0a"
                        strokeWidth="2"
                      />
                      <text
                        x={x}
                        y={svgHeight - 10}
                        fill="#737373"
                        fontSize="10"
                        textAnchor="middle"
                      >
                        {d.label}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Point Detail Tooltip */}
              {selectedPointIndex !== null && chartData[selectedPointIndex] && (
                <div className="mt-3 p-3 rounded-lg bg-neutral-800/90 border border-neutral-700 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white">
                      Post {chartData[selectedPointIndex].label} ({chartData[selectedPointIndex].date})
                    </span>
                    <p className="text-neutral-400 text-xs mt-0.5">
                      {chartData[selectedPointIndex].postSnippet}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-sky-400">
                      {chartData[selectedPointIndex].score}%
                    </span>
                    <div className="text-[10px] text-neutral-400">
                      {chartData[selectedPointIndex].timeframe}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Format & Pillar Rankings */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <h3 className="text-sm font-semibold text-white mb-3">Ranking Format Konten</h3>
            {formatRankings.length === 0 ? (
              <p className="text-xs text-neutral-500">Belum ada data format.</p>
            ) : (
              <div className="space-y-3">
                {formatRankings.map((item, idx) => (
                  <div key={item.format} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 max-w-[70%]">
                      <span className="font-mono text-neutral-500">#{idx + 1}</span>
                      <span className="font-medium text-neutral-200 truncate">{item.format}</span>
                      <span className="text-[11px] text-neutral-500">({item.count} post)</span>
                    </div>
                    <span className="font-bold text-emerald-400">{item.avg}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <h3 className="text-sm font-semibold text-white mb-3">Ranking Pilar Konten</h3>
            {pillarRankings.length === 0 ? (
              <p className="text-xs text-neutral-500">Belum ada data pilar.</p>
            ) : (
              <div className="space-y-3">
                {pillarRankings.map((item, idx) => (
                  <div key={item.pillar} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 max-w-[70%]">
                      <span className="font-mono text-neutral-500">#{idx + 1}</span>
                      <span className="font-medium text-neutral-200 truncate">{item.pillar}</span>
                      <span className="text-[11px] text-neutral-500">({item.count} post)</span>
                    </div>
                    <span className="font-bold text-sky-400">{item.avg}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TOP 5 PERFORMING CONTENT WITH 1-CLICK RECYCLE */}
      <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Top 5 Konten Berkinerja Terbaik</h3>
            <p className="text-xs text-neutral-400">
              Daur ulang (recycle) konten yang sudah terbukti menghasilkan percakapan tinggi dengan sudut pandang baru.
            </p>
          </div>
        </div>

        {topPosts.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-500">
            Belum ada konten yang dievaluasi. Mulai dari tab <span className="text-sky-400">Topik Baru</span>.
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/80">
            {topPosts.map(({ evaluation, post, generation, topic }, idx) => {
              if (!post) return null;
              return (
                <div key={evaluation.eval_id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-amber-400">#{idx + 1}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-800 text-neutral-300">
                        {generation?.format || 'Format Teruji'}
                      </span>
                      {topic?.pilar_konten && (
                        <span className="text-neutral-400">· {topic.pilar_konten}</span>
                      )}
                      <span className="text-neutral-500">· Tayang {post.tanggal_posting}</span>
                    </div>
                    <p className="text-xs text-neutral-200 line-clamp-2 leading-relaxed font-sans">
                      {post.versi_final_dipost}
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-neutral-400">
                      <span>👁️ {evaluation.views.toLocaleString()}</span>
                      <span>💬 {evaluation.replies} balasan</span>
                      <span>🔄 {evaluation.reposts} repost</span>
                      <span>🔗 {evaluation.klik_link} klik link</span>
                      {evaluation.penjualan > 0 && (
                        <span className="text-emerald-400 font-semibold">💰 {evaluation.penjualan} penjualan</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                    <div className="text-right">
                      <div className="text-base font-bold text-emerald-400">
                        {evaluation.engagement_score}%
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        {evaluation.dievaluasi_pada}
                      </div>
                    </div>
                    <button
                      onClick={() => onRecycle(post)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-700 transition"
                      title="AI akan menulis ulang post ini dengan sudut pandang baru"
                    >
                      <Repeat className="w-3.5 h-3.5 text-sky-400" />
                      <span>Daur Ulang</span>
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
