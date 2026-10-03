export type ContentPillar = 
  | 'Edukasi Praktis' 
  | 'Studi Kasus / Realita' 
  | 'Opini Kontroversial' 
  | 'Behind the Scenes' 
  | 'Inspirasi & Mindset';

export type ContentFormat = 
  | 'Cerita dengan Angka Nyata'
  | 'Hot Take / Opini Kontroversial'
  | 'Pertanyaan ke Audiens'
  | 'Utas Tips Praktis'
  | 'Build in Public'
  | 'Before-After / Studi Kasus';

export type FormulaStatus = 'eksperimen' | 'kandidat' | 'FINAL';

export type TopicStatus = 'baru' | 'diproses' | 'diposting' | 'dievaluasi';

export type EvaluationTimeframe = '24 jam' | '72 jam' | '7 hari';

export type SentimentType = 'positif' | 'campuran' | 'negatif';

export interface CreatorSettings {
  niche: string;
  jenis_produk: string;
  nama_produk: string;
  link_produk: string;
  harga_produk: string;
  persona_audiens: string;
  pain_point_utama: string;
  gaya_bahasa: 'santai' | 'profesional' | 'gaul Indonesia';
  target_engagement_rate: number; // e.g. 5.0 (5%)
  bobot_replies: number;
  bobot_reposts: number;
  bobot_quotes: number;
  bobot_shares: number;
  bobot_likes: number;
}

export interface Topic {
  topic_id: string;
  created_at: string;
  ide_mentah: string;
  persona: string;
  pain_point: string;
  pilar_konten: ContentPillar;
  sudut_pandang: string;
  status: TopicStatus;
  skor_rata2?: number;
}

export interface ContentGeneration {
  gen_id: string;
  topic_id: string;
  created_at: string;
  formula_version: string;
  format: ContentFormat;
  hook: string;
  body: string;
  cta_reply: string;
  topic_tag: string;
  alasan_strategi: string;
  prediksi_skor: number; // 1-10
  is_exploration?: boolean;
}

export interface ThreadsAccount {
  user_id: string;
  username: string;
  name?: string;
  profile_picture_url?: string;
  biography?: string;
  access_token: string;
  token_expiry?: string;
  is_connected: boolean;
  is_simulation?: boolean;
}

export interface PostRecord {
  post_id: string;
  gen_id: string;
  topic_id: string;
  tanggal_posting: string;
  jam_posting: string;
  link_threads: string;
  versi_final_dipost: string;
  cta_reply?: string;
  threads_post_id?: string;
  threads_permalink?: string;
  published_via_api?: boolean;
  created_at: string;
  status_evaluasi?: 'belum' | 'sebagian' | 'lengkap';
}

export interface PostEvaluation {
  eval_id: string;
  post_id: string;
  dievaluasi_pada: EvaluationTimeframe;
  created_at: string;
  views: number;
  likes: number;
  replies: number;
  reposts: number;
  quotes: number;
  shares: number;
  follower_baru: number;
  klik_link: number;
  penjualan: number;
  rating_diri: number; // 1-5
  catatan_user: string;
  sentimen_komentar: SentimentType;
  contoh_komentar?: string;
  engagement_score: number; // calculated %
  ai_analysis?: {
    skor_dibandingkan_rata2: string; // e.g. "+35% di atas rata-rata"
    faktor_kunci: string[];
    kelebihan_post: string;
    kelemahan_post: string;
    rekomendasi_perbaikan: string;
  };
}

export interface FormulaModel {
  formula_version: string; // e.g. "v1.0", "v1.1", "v2.0"
  created_at: string;
  status: FormulaStatus;
  struktur_hook: string;
  format_terbaik: string;
  panjang_ideal: string;
  gaya_bahasa: string;
  jenis_cta: string;
  waktu_posting_terbaik: string;
  pilar_terbaik: string;
  aturan_wajib: string[];
  larangan: string[];
  bukti_post_ids: string[];
  confidence: number; // 0-100
  ringkasan: string;
  changelog?: string;
  saran_eksperimen_berikutnya?: string;
}

export interface AppLog {
  timestamp: string;
  aksi: string;
  detail: string;
  error?: string;
}
