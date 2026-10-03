/**
 * Formula.gs - Mesin Perhitungan Skor & Logika Formula Engine
 */

/**
 * Menghitung Engagement Score sesuai rumus bobot:
 * engagement_rate = ((replies×3) + (reposts×2) + (quotes×2) + (shares×2) + likes) / views × 100
 */
function calculateEngagementScore(evalData, settings) {
  if (!evalData.views || Number(evalData.views) <= 0) return 0;

  var bReplies = Number(settings.bobot_replies || 3);
  var bReposts = Number(settings.bobot_reposts || 2);
  var bQuotes = Number(settings.bobot_quotes || 2);
  var bShares = Number(settings.bobot_shares || 2);
  var bLikes = Number(settings.bobot_likes || 1);

  var totalWeighted = 
    (Number(evalData.replies || 0) * bReplies) +
    (Number(evalData.reposts || 0) * bReposts) +
    (Number(evalData.quotes || 0) * bQuotes) +
    (Number(evalData.shares || 0) * bShares) +
    (Number(evalData.likes || 0) * bLikes);

  var score = (totalWeighted / Number(evalData.views)) * 100;
  return Math.round(score * 100) / 100;
}

/**
 * Menghitung rata-rata, standar deviasi, dan koefisien variasi (CV)
 */
function computeStatistics(scores) {
  if (!scores || scores.length === 0) {
    return { mean: 0, stdDev: 0, cv: 0, count: 0 };
  }

  var sum = 0;
  for (var i = 0; i < scores.length; i++) {
    sum += Number(scores[i]);
  }
  var mean = sum / scores.length;

  if (scores.length === 1) {
    return { mean: Math.round(mean * 100) / 100, stdDev: 0, cv: 0, count: 1 };
  }

  var varianceSum = 0;
  for (var j = 0; j < scores.length; j++) {
    varianceSum += Math.pow(Number(scores[j]) - mean, 2);
  }
  var stdDev = Math.sqrt(varianceSum / (scores.length - 1));
  var cv = mean > 0 ? (stdDev / mean) * 100 : 0;

  return {
    mean: Math.round(mean * 100) / 100,
    stdDev: Math.round(stdDev * 100) / 100,
    cv: Math.round(cv * 100) / 100,
    count: scores.length
  };
}

/**
 * Menentukan status formula: 'eksperimen', 'kandidat', atau 'FINAL'
 */
function determineFormulaStatus(evaluations, currentFormula, targetRate) {
  var scores = [];
  evaluations.forEach(function(e) {
    if (Number(e.engagement_score) > 0) {
      scores.push(Number(e.engagement_score));
    }
  });

  var count = scores.length;

  // 1. Data kurang dari 5 post = eksperimen
  if (count < 5) {
    return {
      status: 'eksperimen',
      reason: 'Data belum mencapai minimal 5 post dievaluasi (' + count + '/5).',
      confidence: Math.min(65, (count * 12) + 10)
    };
  }

  var stats = computeStatistics(scores);
  var aboveTargetCount = 0;
  scores.forEach(function(s) {
    if (s >= targetRate) aboveTargetCount++;
  });
  var aboveTargetPercent = (aboveTargetCount / count) * 100;

  // 2. Deteksi kejenuhan audiens pada formula FINAL:
  // Jika performa formula FINAL turun 3 kali berturut-turut di bawah target, kembalikan ke Kandidat
  if (currentFormula && currentFormula.status === 'FINAL' && count >= 3) {
    var last3 = scores.slice(scores.length - 3);
    var all3Below = true;
    for (var k = 0; k < last3.length; k++) {
      if (last3[k] >= targetRate) {
        all3Below = false;
        break;
      }
    }
    if (all3Below) {
      return {
        status: 'kandidat',
        reason: 'Performa turun 3 kali berturut-turut di bawah target. Terdeteksi kejenuhan audiens (audience fatigue). Formula diturunkan ke status Kandidat untuk refresh pola hook.',
        confidence: Math.max(55, (currentFormula.confidence || 85) - 20)
      };
    }
  }

  var baseConfidence = Math.min(
    100,
    Math.round((aboveTargetPercent * 0.5) + (Math.max(0, 100 - stats.cv) * 0.3) + (Math.min(count, 15) * 2))
  );

  // 3. FINAL: minimal 10 post, >= 70% di atas target, confidence >= 80
  if (count >= 10 && aboveTargetPercent >= 70 && baseConfidence >= 80) {
    return {
      status: 'FINAL',
      reason: 'Formula telah divalidasi ' + count + ' post dengan ' + Math.round(aboveTargetPercent) + '% di atas target dan stabilitas tinggi (CV ' + stats.cv + '%).',
      confidence: Math.max(80, baseConfidence)
    };
  }

  // 4. Kandidat: minimal 5 post, rata-rata di atas target, variasi stabil (CV < 30%)
  if (count >= 5 && stats.mean >= targetRate && stats.cv < 30) {
    return {
      status: 'kandidat',
      reason: 'Rata-rata skor ' + stats.mean + '% melampaui target ' + targetRate + '% dengan variasi stabil (CV ' + stats.cv + '%).',
      confidence: Math.min(79, Math.max(65, baseConfidence))
    };
  }

  return {
    status: 'eksperimen',
    reason: 'Rata-rata skor ' + stats.mean + '% atau variasi skor (CV ' + stats.cv + '%) masih di luar batas kandidat.',
    confidence: Math.min(65, Math.max(30, baseConfidence))
  };
}
