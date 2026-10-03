import { CreatorSettings, PostEvaluation, FormulaModel, FormulaStatus } from '../types';

export function calculateEngagementScore(
  evalData: Pick<PostEvaluation, 'views' | 'likes' | 'replies' | 'reposts' | 'quotes' | 'shares'>,
  settings: CreatorSettings
): number {
  if (!evalData.views || evalData.views <= 0) return 0;
  
  const bReplies = settings.bobot_replies ?? 3;
  const bReposts = settings.bobot_reposts ?? 2;
  const bQuotes = settings.bobot_quotes ?? 2;
  const bShares = settings.bobot_shares ?? 2;
  const bLikes = settings.bobot_likes ?? 1;

  const totalWeightedActions = 
    (evalData.replies * bReplies) +
    (evalData.reposts * bReposts) +
    (evalData.quotes * bQuotes) +
    (evalData.shares * bShares) +
    (evalData.likes * bLikes);

  const rate = (totalWeightedActions / evalData.views) * 100;
  return Math.round(rate * 100) / 100;
}

export function computeStatistics(scores: number[]) {
  if (scores.length === 0) {
    return { mean: 0, stdDev: 0, cv: 0, count: 0 };
  }

  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  if (scores.length === 1) {
    return { mean: Math.round(mean * 100) / 100, stdDev: 0, cv: 0, count: 1 };
  }

  const variance = scores.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (scores.length - 1);
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? (stdDev / mean) * 100 : 0;

  return {
    mean: Math.round(mean * 100) / 100,
    stdDev: Math.round(stdDev * 100) / 100,
    cv: Math.round(cv * 100) / 100,
    count: scores.length
  };
}

export function determineFormulaStatus(
  evaluations: PostEvaluation[],
  currentFormula: FormulaModel,
  targetRate: number
): { status: FormulaStatus; reason: string; confidence: number } {
  // Ambil evaluasi terbaru
  const scores = evaluations.map(e => e.engagement_score).filter(s => s > 0);
  const count = scores.length;

  if (count < 5) {
    const confidence = Math.min(65, Math.round((count / 5) * 60) + 10);
    return {
      status: 'eksperimen',
      reason: `Data masih tahap eksplorasi (${count}/5 post dievaluasi). Butuh minimal 5 post untuk naik ke Kandidat.`,
      confidence
    };
  }

  const { mean, cv } = computeStatistics(scores);
  const aboveTargetCount = scores.filter(s => s >= targetRate).length;
  const aboveTargetPercent = (aboveTargetCount / count) * 100;

  // Deteksi kejenuhan audiens pada formula FINAL:
  // Jika 3 post evaluasi terakhir berturut-turut di bawah target
  if (currentFormula.status === 'FINAL' && count >= 3) {
    const last3 = scores.slice(-3);
    const all3BelowTarget = last3.every(s => s < targetRate);
    if (all3BelowTarget) {
      return {
        status: 'kandidat',
        reason: 'Performa turun 3 kali berturut-turut di bawah target engagement. Terdeteksi kejenuhan audiens (audience fatigue). Formula diturunkan ke status Kandidat untuk penyesuaian angle.',
        confidence: Math.max(50, currentFormula.confidence - 20)
      };
    }
  }

  // Syarat FINAL:
  // Minimal 10 post, >= 70% di atas target, dan confidence >= 80
  const baseConfidence = Math.min(
    100,
    Math.round((aboveTargetPercent * 0.5) + (Math.max(0, 100 - cv) * 0.3) + (Math.min(count, 15) * 2))
  );

  if (count >= 10 && aboveTargetPercent >= 70 && baseConfidence >= 80) {
    return {
      status: 'FINAL',
      reason: `Formula telah teruji konsisten (${count} post, ${Math.round(aboveTargetPercent)}% di atas target ${targetRate}%, stabilitas CV ${cv}%). Siap menjadi SOP utama konten!`,
      confidence: Math.max(80, baseConfidence)
    };
  }

  // Syarat Kandidat:
  // Minimal 5 post, rata-rata skor di atas target, dan CV < 30%
  if (count >= 5 && mean >= targetRate && cv < 30) {
    return {
      status: 'kandidat',
      reason: `Performa konsisten di atas target (Rata-rata ${mean}%, target ${targetRate}%, variasi stabil CV ${cv}%). Membutuhkan minimal 10 post dengan >= 70% keberhasilan untuk finalisasi.`,
      confidence: Math.min(79, Math.max(65, baseConfidence))
    };
  }

  // Jika belum memenuhi syarat kandidat
  return {
    status: 'eksperimen',
    reason: `Belum stabil (Rata-rata: ${mean}%, Target: ${targetRate}%, Stabilitas CV: ${cv}% ${cv >= 30 ? '- variasi masih tinggi >30%' : ''}). Lanjutkan pengujian variasi.`,
    confidence: Math.min(65, Math.max(30, baseConfidence))
  };
}
