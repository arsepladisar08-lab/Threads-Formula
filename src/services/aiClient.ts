import { 
  CreatorSettings, 
  Topic, 
  ContentGeneration, 
  FormulaModel, 
  PostRecord, 
  PostEvaluation 
} from '../types';

export async function enrichTopicApi(ide_mentah: string, settings: CreatorSettings): Promise<{
  persona: string;
  pain_point: string;
  pilar_konten: any;
  sudut_pandang: string;
}> {
  const res = await fetch('/api/ai/enrich-topic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ide_mentah, settings }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal mengolah ide dengan AI');
  }

  return await res.json();
}

export async function generateContentApi(
  topic: Topic,
  settings: CreatorSettings,
  formula: FormulaModel
): Promise<Array<{
  format: any;
  hook: string;
  body: string;
  cta_reply: string;
  topic_tag: string;
  alasan_strategi: string;
  prediksi_skor: number;
  is_exploration?: boolean;
}>> {
  const res = await fetch('/api/ai/generate-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, settings, formula }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal membuat variasi konten dengan AI');
  }

  return await res.json();
}

export async function analyzeEvaluationApi(
  evaluation: PostEvaluation,
  post: PostRecord,
  generation: ContentGeneration | undefined,
  topic: Topic | undefined,
  allEvaluations: PostEvaluation[],
  settings: CreatorSettings
) {
  const res = await fetch('/api/ai/analyze-evaluation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      evaluation,
      post,
      generation,
      topic,
      allEvaluations,
      settings,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal menganalisis evaluasi dengan AI');
  }

  return await res.json();
}

export async function updateFormulaApi(
  evaluations: PostEvaluation[],
  posts: PostRecord[],
  generations: ContentGeneration[],
  currentFormula: FormulaModel,
  settings: CreatorSettings
): Promise<FormulaModel> {
  const res = await fetch('/api/ai/update-formula', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      evaluations,
      posts,
      generations,
      currentFormula,
      settings,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal memperbarui formula dengan AI');
  }

  const data = await res.json();
  return {
    ...data,
    created_at: new Date().toISOString(),
    bukti_post_ids: posts.map((p) => p.post_id),
  };
}

export async function recycleContentApi(
  post: PostRecord,
  settings: CreatorSettings,
  formula: FormulaModel
): Promise<{
  new_hook: string;
  new_body: string;
  new_cta_reply: string;
  new_angle: string;
  alasan_daur_ulang: string;
}> {
  const res = await fetch('/api/ai/recycle-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ post, settings, formula }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal mendaur ulang konten dengan AI');
  }

  return await res.json();
}
