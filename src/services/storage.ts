import { 
  CreatorSettings, 
  Topic, 
  ContentGeneration, 
  PostRecord, 
  PostEvaluation, 
  FormulaModel, 
  AppLog 
} from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'threads_lab_settings',
  TOPICS: 'threads_lab_topics',
  GENERATIONS: 'threads_lab_generations',
  POSTS: 'threads_lab_posts',
  EVALUATIONS: 'threads_lab_evaluations',
  FORMULAS: 'threads_lab_formulas',
  LOGS: 'threads_lab_logs',
};

export const DEFAULT_SETTINGS: CreatorSettings = {
  niche: 'Produk Digital & Solopreneurship',
  jenis_produk: 'Template Notion & Playbook Monetisasi',
  nama_produk: 'Creator OS & Threads Growth Playbook',
  link_produk: 'https://threadsformulalab.com/creator-os',
  harga_produk: 'Rp 149.000',
  persona_audiens: 'Creator pemula, freelancer, dan pekerja kantoran yang ingin bangun side income dari produk digital tanpa follower jutaan',
  pain_point_utama: 'Posting di Threads sepi respon, bingung cara jualan tanpa terasa hard-selling, dan belum tahu formula copywriting yang memancing percakapan',
  gaya_bahasa: 'santai',
  target_engagement_rate: 5.5,
  bobot_replies: 3,
  bobot_reposts: 2,
  bobot_quotes: 2,
  bobot_shares: 2,
  bobot_likes: 1,
};

export const INITIAL_FORMULA: FormulaModel = {
  formula_version: 'v1.0',
  created_at: new Date().toISOString(),
  status: 'eksperimen',
  struktur_hook: 'Pernyataan kontras 1 baris + data riil (Contoh: "90% creator digital gagal di 30 hari pertama bukan karena produknya jelek...")',
  format_terbaik: 'Cerita dengan Angka Nyata & Utas Tips Praktis',
  panjang_ideal: '250 - 450 karakter untuk post utama, atau utas 3-5 slides',
  gaya_bahasa: 'Santai, langsung to-the-point, nada kawan seperjuangan (bukan menggurui)',
  jenis_cta: 'Pertanyaan pancingan terbuka di akhir post utama, link produk ditaruh di balasan pertama (reply #1)',
  waktu_posting_terbaik: '07:30 - 09:00 WIB (pagi sebelum kerja) & 19:30 - 21:00 WIB (malam santai)',
  pilar_terbaik: 'Edukasi Praktis & Studi Kasus / Realita',
  aturan_wajib: [
    'DILARANG hard selling di post utama. Tempatkan link/penawaran di komentar pertama.',
    'Hook harus menghentikan scrolling dalam 1-2 baris pertama (gunakan angka atau kontras).',
    'Wajib akhiri dengan pertanyaan spesifik yang memancing balasan/diskusi.',
    'Porsi 80% value/cerita nyata, 20% call-to-action halus.'
  ],
  larangan: [
    'Jangan gunakan bahasa kaku seperti artikel berita formal.',
    'Jangan letakkan link eksternal di body post utama (akan diturunkan reach oleh algoritma).',
    'Hindari hashtag berlebihan (>2 tags). Threads memprioritaskan kata kunci alami.'
  ],
  bukti_post_ids: [],
  confidence: 45,
  ringkasan: 'Formula awal pengujian: Fokus pada pancingan balasan (replies) dengan membagikan angka transparan penjualan produk digital tanpa clickbait murahan.',
  changelog: 'Inisialisasi formula awal v1.0 untuk niche produk digital.',
  saran_eksperimen_berikutnya: 'Uji variasi hook dengan perbandingan before-after pendapatan vs waktu kerja.'
};

export const DEMO_DATA = {
  topics: [
    {
      topic_id: 'top-001',
      created_at: '2026-09-24T08:30:00Z',
      ide_mentah: 'Cara jualan template Notion pertama tanpa perlu pasang iklan berbayar',
      persona: 'Freelancer & Notion user yang ingin jualan digital',
      pain_point: 'Bingung distribusi pertama kali dan tidak punya budget ads',
      pilar_konten: 'Edukasi Praktis' as const,
      sudut_pandang: 'Framework 3 langkah organik dari 0 ke penjualan pertama dalam 7 hari',
      status: 'dievaluasi' as const,
      skor_rata2: 6.8
    },
    {
      topic_id: 'top-002',
      created_at: '2026-09-26T19:15:00Z',
      ide_mentah: 'Kesalahan fatal pasang harga ebook murah Rp 20 ribuan malah ga laku',
      persona: 'Penulis & creator e-book baru',
      pain_point: 'Mengira harga murah pasti laris, ternyata diragukan kualitasnya',
      pilar_konten: 'Opini Kontroversial' as const,
      sudut_pandang: 'Psikologi harga produk digital: Kenapa Rp 149k lebih dipercaya daripada Rp 20k',
      status: 'dievaluasi' as const,
      skor_rata2: 7.4
    },
    {
      topic_id: 'top-003',
      created_at: '2026-09-28T07:45:00Z',
      ide_mentah: 'Bongkar proses bikin 1 template Notion yang laku 340+ copy waktu libur weekend',
      persona: 'Side-hustler & digital worker',
      pain_point: 'Waktu terbatas karena masih kerja 9-to-5',
      pilar_konten: 'Studi Kasus / Realita' as const,
      sudut_pandang: 'Transparansi dapur pembuatan: validasi masalah nyata sebelum bikin template',
      status: 'dievaluasi' as const,
      skor_rata2: 8.2
    }
  ],
  generations: [
    {
      gen_id: 'gen-001',
      topic_id: 'top-001',
      created_at: '2026-09-24T08:35:00Z',
      formula_version: 'v1.0',
      format: 'Cerita dengan Angka Nyata' as const,
      hook: 'Nol rupiah modal iklan, tapi bisa tembus 18 penjualan template Notion di minggu pertama.',
      body: 'Waktu pertama kali rilis template, saya hampir keluar duit 500rb buat ads Instagram. Untung ditahan teman senior.\n\nStrategi yang saya pakai cuma 3 langkah:\n1. Bagikan 1 bagian template secara gratis (freebie) di Threads dengan breakdown masalahnya.\n2. Minta feedback jujur di kolom reply (dapat 40+ komentar).\n3. Tawarkan full-version berbayar ke mereka yang butuh automasi lebih lengkap lewat DM & link di bio.\n\nHasilnya? 18 orang beli di hari ke-4 tanpa diskon potong leher.\n\nKalian yang lagi bikin produk digital, paling mentok di tahap mana: bikin materinya atau cari pembeli pertamanya?',
      cta_reply: '📌 Full template Creator OS & breakdown langkahnya saya taruh di link ini ya (ada diskon early-bird): https://threadsformulalab.com/creator-os',
      topic_tag: 'ProdukDigital',
      alasan_strategi: 'Menampilkan angka realistis yang relatable dan diakhiri pertanyaan 2 pilihan yang memicu balasan singkat namun personal.',
      prediksi_skor: 8,
      is_exploration: false
    },
    {
      gen_id: 'gen-002',
      topic_id: 'top-002',
      created_at: '2026-09-26T19:20:00Z',
      formula_version: 'v1.0',
      format: 'Hot Take / Opini Kontroversial' as const,
      hook: 'Hot take: Menjual ebook seharga Rp 19.000 adalah cara tercepat merusak kredibilitas produkmu sendiri.',
      body: 'Banyak creator mengira: "Kalau murah pasti semua orang beli."\n\nFaktanya di dunia produk digital:\n1. Harga terlalu murah bikin calon buyer mikir: "Ini pasti cuma ringkasan gratisan Google."\n2. Buyer Rp 19k seringkali yang paling banyak menuntut revisi dan refund.\n3. Begitu dinaikkan ke Rp 149k dengan value yang jelas, konversi justru naik 2.4x lipat.\n\nOrang tidak membeli jumlah halaman, mereka membeli kepastian solusi atas masalah mereka.\n\nSetuju atau menurutmu di Indonesia harga tetap nomor satu?',
      cta_reply: 'Mau tahu kalkulator penetapan harga produk digital yang saya pakai? Saya bagikan sheet gratisnya di balasan ini.',
      topic_tag: 'Monetisasi',
      alasan_strategi: 'Mematahkan miskonsepsi umum dengan kontras psikologi harga, memicu perdebatan sehat di kolom komentar.',
      prediksi_skor: 9,
      is_exploration: true
    },
    {
      gen_id: 'gen-003',
      topic_id: 'top-003',
      created_at: '2026-09-28T07:50:00Z',
      formula_version: 'v1.1',
      format: 'Build in Public' as const,
      hook: 'Cuma butuh 6 jam di hari Sabtu untuk rakit template ini, tapi sudah bantu 340+ freelancer rapihin invoice.',
      body: 'Dulu saya bikin produk digital selalu overthinking:\n- Pengen fitur super lengkap\n- Desain harus aesthetic luar biasa\n- Akhirnya 3 bulan gak pernah launch.\n\nKali ini polanya saya balik:\nBikin sesimpel mungkin untuk 1 masalah spesifik (tracking invoice yang belum dibayar klien). Launch dalam 1 hari.\n\nKuncinya bukan seberapa rumit fiturnya, tapi seberapa cepat bisa menyelesaikan sakit kepala user.\n\nAda yang punya draft produk digital yang nganggur di laptop lebih dari 1 bulan? Spill di bawah, mari kita validasi bareng.',
      cta_reply: 'Preview live template-nya bisa dicek langsung di sini: https://threadsformulalab.com/creator-os (bisa diduplikasi gratis versi simplenya).',
      topic_tag: 'Solopreneur',
      alasan_strategi: 'Format build in public dengan vulnerabilitas (mengaku dulu overthinking) membangun trust tinggi.',
      prediksi_skor: 9,
      is_exploration: false
    }
  ],
  posts: [
    {
      post_id: 'post-001',
      gen_id: 'gen-001',
      topic_id: 'top-001',
      tanggal_posting: '2026-09-24',
      jam_posting: '07:45',
      link_threads: 'https://threads.net/@creator_id/post/1',
      versi_final_dipost: 'Nol rupiah modal iklan, tapi bisa tembus 18 penjualan template Notion di minggu pertama.\n\nWaktu pertama kali rilis template, saya hampir keluar duit 500rb buat ads Instagram. Untung ditahan teman senior.\n\nStrategi yang saya pakai cuma 3 langkah:\n1. Bagikan 1 bagian template secara gratis (freebie) di Threads dengan breakdown masalahnya.\n2. Minta feedback jujur di kolom reply (dapat 40+ komentar).\n3. Tawarkan full-version berbayar ke mereka yang butuh automasi lebih lengkap lewat DM & link di bio.\n\nHasilnya? 18 orang beli di hari ke-4 tanpa diskon potong leher.\n\nKalian yang lagi bikin produk digital, paling mentok di tahap mana: bikin materinya atau cari pembeli pertamanya?',
      created_at: '2026-09-24T07:45:00Z',
      status_evaluasi: 'lengkap' as const
    },
    {
      post_id: 'post-002',
      gen_id: 'gen-002',
      topic_id: 'top-002',
      tanggal_posting: '2026-09-26',
      jam_posting: '19:30',
      link_threads: 'https://threads.net/@creator_id/post/2',
      versi_final_dipost: 'Hot take: Menjual ebook seharga Rp 19.000 adalah cara tercepat merusak kredibilitas produkmu sendiri.\n\nBanyak creator mengira: "Kalau murah pasti semua orang beli."\n\nFaktanya di dunia produk digital:\n1. Harga terlalu murah bikin calon buyer mikir: "Ini pasti cuma ringkasan gratisan Google."\n2. Buyer Rp 19k seringkali yang paling banyak menuntut revisi dan refund.\n3. Begitu dinaikkan ke Rp 149k dengan value yang jelas, konversi justru naik 2.4x lipat.\n\nOrang tidak membeli jumlah halaman, mereka membeli kepastian solusi atas masalah mereka.\n\nSetuju atau menurutmu di Indonesia harga tetap nomor satu?',
      created_at: '2026-09-26T19:30:00Z',
      status_evaluasi: 'lengkap' as const
    },
    {
      post_id: 'post-003',
      gen_id: 'gen-003',
      topic_id: 'top-003',
      tanggal_posting: '2026-09-28',
      jam_posting: '08:00',
      link_threads: 'https://threads.net/@creator_id/post/3',
      versi_final_dipost: 'Cuma butuh 6 jam di hari Sabtu untuk rakit template ini, tapi sudah bantu 340+ freelancer rapihin invoice.\n\nDulu saya bikin produk digital selalu overthinking:\n- Pengen fitur super lengkap\n- Desain harus aesthetic luar biasa\n- Akhirnya 3 bulan gak pernah launch.\n\nKali ini polanya saya balik:\nBikin sesimpel mungkin untuk 1 masalah spesifik (tracking invoice yang belum dibayar klien). Launch dalam 1 hari.\n\nKuncinya bukan seberapa rumit fiturnya, tapi seberapa cepat bisa menyelesaikan sakit kepala user.\n\nAda yang punya draft produk digital yang nganggur di laptop lebih dari 1 bulan? Spill di bawah, mari kita validasi bareng.',
      created_at: '2026-09-28T08:00:00Z',
      status_evaluasi: 'lengkap' as const
    }
  ],
  evaluations: [
    {
      eval_id: 'eval-001',
      post_id: 'post-001',
      dievaluasi_pada: '72 jam' as const,
      created_at: '2026-09-27T08:00:00Z',
      views: 4200,
      likes: 110,
      replies: 46, // 46 * 3 = 138
      reposts: 12, // 12 * 2 = 24
      quotes: 5,  // 5 * 2 = 10
      shares: 8,  // 8 * 2 = 16
      follower_baru: 24,
      klik_link: 68,
      penjualan: 4,
      rating_diri: 4,
      catatan_user: 'Pertanyaan di akhir sangat ampuh. Audiens curhat soal susahnya cari pembeli pertama, langsung saya balas satu per satu.',
      sentimen_komentar: 'positif' as const,
      contoh_komentar: '"Gue relate banget min, template udah jadi tapi bingung mau sebar kemana selain keluarga haha"',
      engagement_score: 7.1, // (138 + 24 + 10 + 16 + 110) / 4200 * 100 = 298 / 4200 * 100 = 7.10%
      ai_analysis: {
        skor_dibandingkan_rata2: '+29% di atas target engagement',
        faktor_kunci: ['Hook angka riil', 'Pertanyaan 2 pilihan di akhir', 'Balasan cepat 30 menit pertama'],
        kelebihan_post: 'Menawarkan jalan keluar tanpa modal iklan, menyentuh pain point utama freelancer.',
        kelemahan_post: 'CTA di komentar belum menyertakan urgency atau diskon batas waktu.',
        rekomendasi_perbaikan: 'Pertahankan struktur pertanyaan biner (A atau B), tambahkan bukti sosial di utas lanjutan.'
      }
    },
    {
      eval_id: 'eval-002',
      post_id: 'post-002',
      dievaluasi_pada: '72 jam' as const,
      created_at: '2026-09-29T20:00:00Z',
      views: 6500,
      likes: 195,
      replies: 78, // 78 * 3 = 234
      reposts: 22, // 22 * 2 = 44
      quotes: 14, // 14 * 2 = 28
      shares: 16, // 16 * 2 = 32
      follower_baru: 52,
      klik_link: 92,
      penjualan: 7,
      rating_diri: 5,
      catatan_user: 'Hot take memicu debat seru antara yang pro harga murah dan pro value-based pricing. Skor repost & quotes tinggi sekali.',
      sentimen_komentar: 'campuran' as const,
      contoh_komentar: '"Setuju banget, dulu jual 10rb malah dibilang penipu karena kemurahan. Pas dinaikin 150rb laku keras."',
      engagement_score: 8.2, // (234 + 44 + 28 + 32 + 195) / 6500 * 100 = 533 / 6500 * 100 = 8.20%
      ai_analysis: {
        skor_dibandingkan_rata2: '+49% di atas target 5.5%',
        faktor_kunci: ['Opini tegas kontra-intuitif', 'Data perbandingan 2.4x konversi', 'Memantik 2 kubu diskusi'],
        kelebihan_post: 'Tingkat virality tinggi lewat quotes dan reposts karena banyak creator merasa divalidasi.',
        kelemahan_post: 'Ada beberapa komentar tersinggung yang merasa direndahkan karena menjual produk murah.',
        rekomendasi_perbaikan: 'Beri disclaimer bahwa harga murah tetap valid untuk lead magnet, tapi bukan core offer.'
      }
    },
    {
      eval_id: 'eval-003',
      post_id: 'post-003',
      dievaluasi_pada: '24 jam' as const,
      created_at: '2026-09-29T10:00:00Z',
      views: 3800,
      likes: 140,
      replies: 52, // 52 * 3 = 156
      reposts: 18, // 18 * 2 = 36
      quotes: 8,  // 8 * 2 = 16
      shares: 12, // 12 * 2 = 24
      follower_baru: 31,
      klik_link: 110,
      penjualan: 8,
      rating_diri: 5,
      catatan_user: 'Format build in public dengan ajakan "spill di bawah" menghasilkan banyak reply panjang dan konversi link klik tertinggi.',
      sentimen_komentar: 'positif' as const,
      contoh_komentar: '"Template gue udah 6 bulan di draft Notion mas wkwk bener kata masnya, terlalu mikirin perfect"',
      engagement_score: 9.79, // (156 + 36 + 16 + 24 + 140) / 3800 * 100 = 372 / 3800 * 100 = 9.79%
      ai_analysis: {
        skor_dibandingkan_rata2: '+78% di atas target engagement',
        faktor_kunci: ['Vulnerability (cerita kegagalan overthinking)', 'Angka waktu pengerjaan 6 jam', 'Call to conversation spesifik'],
        kelebihan_post: 'Membangun trust paling tinggi dan menghasilkan rasio klik ke penjualan terbaik (7.2% CR).',
        kelemahan_post: 'Format sedikit padat, bisa dibuat lebih banyak white space antar baris.',
        rekomendasi_perbaikan: 'Jadikan format "Build in Public + Vulnerability + Angka Jam" sebagai formula andalan.'
      }
    }
  ],
  formulas: [
    {
      formula_version: 'v1.0',
      created_at: '2026-09-23T10:00:00Z',
      status: 'eksperimen' as const,
      struktur_hook: 'Pernyataan kontras 1 baris + data riil',
      format_terbaik: 'Cerita dengan Angka Nyata',
      panjang_ideal: '250 - 450 karakter',
      gaya_bahasa: 'Santai, lugas, ramah',
      jenis_cta: 'Pertanyaan terbuka di body, link di komentar #1',
      waktu_posting_terbaik: '07:30 - 09:00 WIB',
      pilar_terbaik: 'Edukasi Praktis',
      aturan_wajib: [
        'Link produk HANYA di kolom reply pertama',
        'Hook wajib ada angka atau kontras tajam',
        'Akhiri dengan pertanyaan spesifik'
      ],
      larangan: [
        'Dilarang hard-sell di post utama',
        'Jangan pakai bahasa corporate kaku'
      ],
      bukti_post_ids: ['post-001'],
      confidence: 45,
      ringkasan: 'Formula inisial fokus pada pencegahan hard sell.',
      changelog: 'Versi perdana.'
    },
    {
      formula_version: 'v1.1',
      created_at: '2026-09-27T12:00:00Z',
      status: 'kandidat' as const,
      struktur_hook: 'Angka Waktu / Hasil Spesifik + Pengakuan Vulnerability ("Dulu saya overthinking...")',
      format_terbaik: 'Build in Public & Hot Take Kontroversial',
      panjang_ideal: '300 - 450 karakter dengan baris kosong (whitespace)',
      gaya_bahasa: 'Santai, jujur, mengedepankan empati dan realitas lapangan',
      jenis_cta: 'Ajakan diskusi kolaboratif ("Spill di bawah...") + Link tool preview di reply #1',
      waktu_posting_terbaik: '07:45 - 08:30 WIB (Pagi) & 19:30 - 20:30 WIB (Malam)',
      pilar_terbaik: 'Studi Kasus / Realita & Opini Kontroversial',
      aturan_wajib: [
        'Sertakan angka spesifik (jam kerja, jumlah copy terjual, rasio konversi).',
        'Tulis kelemahan/kesalahan masa lalu sebelum solusi (pola Before-After).',
        'Pertanyaan penutup harus mudah dijawab tanpa mikir keras.',
        'Wajib balas semua komentar dalam 60 menit pertama setelah posting.'
      ],
      larangan: [
        'Jangan berteori tanpa bukti riil atau studi kasus.',
        'Jangan menaruh link di body utama.',
        'Jangan gunakan format listicle generik tanpa sentuhan personal.'
      ],
      bukti_post_ids: ['post-001', 'post-002', 'post-003'],
      confidence: 74,
      ringkasan: 'Formula diperbarui: Format Build in Public dan Hot Take terbukti menghasilkan engagement 8.2% - 9.8% (jauh melampaui target 5.5%). Reposts & Replies meningkat tajam berkat pancingan percakapan jujur.',
      changelog: 'v1.1: Menambahkan aturan Vulnerability Hook, memfokuskan pilar pada Realita & Kontroversi Berfaedah, dan menaikkan status menjadi Kandidat (rata-rata skor 8.36%).',
      saran_eksperimen_berikutnya: 'Uji variasi Carousel/Utas (3-5 slides) untuk studi kasus yang lebih mendalam guna menaikkan follower conversion.'
    }
  ]
};

// Local storage helper functions
export function getSettings(): CreatorSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: CreatorSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function getTopics(): Topic[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TOPICS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTopics(topics: Topic[]): void {
  localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics));
}

export function getGenerations(): ContentGeneration[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GENERATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGenerations(generations: ContentGeneration[]): void {
  localStorage.setItem(STORAGE_KEYS.GENERATIONS, JSON.stringify(generations));
}

export function getPosts(): PostRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePosts(posts: PostRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
}

export function getEvaluations(): PostEvaluation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveEvaluations(evaluations: PostEvaluation[]): void {
  localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evaluations));
}

export function getFormulas(): FormulaModel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FORMULAS);
    if (!raw) return [INITIAL_FORMULA];
    const parsed = JSON.parse(raw);
    return parsed.length > 0 ? parsed : [INITIAL_FORMULA];
  } catch {
    return [INITIAL_FORMULA];
  }
}

export function saveFormulas(formulas: FormulaModel[]): void {
  localStorage.setItem(STORAGE_KEYS.FORMULAS, JSON.stringify(formulas));
}

export function getLogs(): AppLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addLog(aksi: string, detail: string, error?: string): void {
  const logs = getLogs();
  const newLog: AppLog = {
    timestamp: new Date().toISOString(),
    aksi,
    detail,
    error
  };
  const updated = [newLog, ...logs.slice(0, 99)]; // keep latest 100
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));
}

export function seedDemoData(): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(DEMO_DATA.topics));
  localStorage.setItem(STORAGE_KEYS.GENERATIONS, JSON.stringify(DEMO_DATA.generations));
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(DEMO_DATA.posts));
  localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(DEMO_DATA.evaluations));
  localStorage.setItem(STORAGE_KEYS.FORMULAS, JSON.stringify(DEMO_DATA.formulas));
  addLog('SEED_DEMO', 'Data simulasi 3 post, evaluasi performa, dan formula evolusi v1.1 berhasil dimuat.');
}

export function resetAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.TOPICS);
  localStorage.removeItem(STORAGE_KEYS.GENERATIONS);
  localStorage.removeItem(STORAGE_KEYS.POSTS);
  localStorage.removeItem(STORAGE_KEYS.EVALUATIONS);
  localStorage.removeItem(STORAGE_KEYS.FORMULAS);
  localStorage.removeItem(STORAGE_KEYS.LOGS);
  addLog('RESET_DATABASE', 'Semua data lab telah dibersihkan.');
}

export function initStorageIfNeeded(): void {
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    // If first time visit, automatically seed rich demo data so app is immediately alive!
    seedDemoData();
  }
}
