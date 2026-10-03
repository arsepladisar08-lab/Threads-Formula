/**
 * Database.gs - Manajemen Google Sheets sebagai Database Sementara
 */

var SHEET_NAMES = {
  SETTINGS: 'Settings',
  TOPICS: 'Topics',
  GENERATIONS: 'Generations',
  POSTS: 'Posts',
  EVALUATIONS: 'Evaluations',
  FORMULAS: 'Formulas',
  LOGS: 'Logs'
};

/**
 * Membuat dan menginisialisasi semua sheet beserta header-nya
 */
function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var schemas = [
    {
      name: SHEET_NAMES.SETTINGS,
      headers: ['key', 'value'],
      initialData: [
        ['niche', 'Produk Digital & Solopreneurship'],
        ['jenis_produk', 'Template Notion & Playbook Monetisasi'],
        ['nama_produk', 'Creator OS & Threads Growth Playbook'],
        ['link_produk', 'https://threadsformulalab.com/creator-os'],
        ['harga_produk', 'Rp 149.000'],
        ['persona_audiens', 'Creator pemula, freelancer, dan pekerja kantoran yang ingin bangun side income dari produk digital'],
        ['pain_point_utama', 'Posting Threads sepi respon, bingung cara jualan tanpa terasa hard-selling'],
        ['gaya_bahasa', 'santai'],
        ['target_engagement_rate', '5.5'],
        ['bobot_replies', '3'],
        ['bobot_reposts', '2'],
        ['bobot_quotes', '2'],
        ['bobot_shares', '2'],
        ['bobot_likes', '1']
      ]
    },
    {
      name: SHEET_NAMES.TOPICS,
      headers: ['topic_id', 'created_at', 'ide_mentah', 'persona', 'pain_point', 'pilar_konten', 'status', 'skor_rata2']
    },
    {
      name: SHEET_NAMES.GENERATIONS,
      headers: ['gen_id', 'topic_id', 'created_at', 'formula_version', 'format', 'hook', 'body', 'cta_reply', 'topic_tag', 'alasan_strategi', 'prediksi_skor']
    },
    {
      name: SHEET_NAMES.POSTS,
      headers: ['post_id', 'gen_id', 'tanggal_posting', 'jam_posting', 'link_threads', 'versi_final_dipost']
    },
    {
      name: SHEET_NAMES.EVALUATIONS,
      headers: ['eval_id', 'post_id', 'dievaluasi_pada', 'views', 'likes', 'replies', 'reposts', 'quotes', 'shares', 'follower_baru', 'klik_link', 'penjualan', 'rating_diri', 'catatan_user', 'sentimen_komentar', 'engagement_score']
    },
    {
      name: SHEET_NAMES.FORMULAS,
      headers: ['formula_version', 'created_at', 'status', 'struktur_hook', 'format_terbaik', 'panjang_ideal', 'gaya_bahasa', 'jenis_cta', 'waktu_posting_terbaik', 'pilar_terbaik', 'aturan_wajib', 'larangan', 'bukti', 'confidence', 'ringkasan'],
      initialData: [
        [
          'v1.0',
          new Date().toISOString(),
          'eksperimen',
          'Pernyataan kontras 1 baris + data riil',
          'Cerita dengan Angka Nyata',
          '250 - 450 karakter',
          'Santai, langsung to-the-point',
          'Pertanyaan pancingan di post utama, link di reply #1',
          '07:30 - 09:00 WIB & 19:30 - 21:00 WIB',
          'Edukasi Praktis & Studi Kasus / Realita',
          JSON.stringify(['Link produk HANYA di kolom reply pertama', 'Hook wajib ada angka atau kontras', 'Akhiri dengan pertanyaan spesifik']),
          JSON.stringify(['Dilarang hard-sell di post utama', 'Jangan pakai bahasa kaku']),
          JSON.stringify([]),
          45,
          'Formula awal pengujian: Fokus pancingan balasan (replies) tanpa hard-sell.'
        ]
      ]
    },
    {
      name: SHEET_NAMES.LOGS,
      headers: ['timestamp', 'aksi', 'detail', 'error']
    }
  ];

  schemas.forEach(function(schema) {
    var sheet = ss.getSheetByName(schema.name);
    if (!sheet) {
      sheet = ss.insertSheet(schema.name);
    }
    // Jika masih kosong, set header
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(schema.headers);
      sheet.getRange(1, 1, 1, schema.headers.length).setFontWeight('bold').setBackground('#f3f4f6');
      sheet.setFrozenRows(1);

      if (schema.initialData && schema.initialData.length > 0) {
        schema.initialData.forEach(function(row) {
          sheet.appendRow(row);
        });
      }
    }
  });

  logAction_('SETUP_DATABASE', 'Setup skema 7 sheet Google Spreadsheet selesai');
  return { success: true, message: 'Database Threads Formula Lab berhasil dibuat!' };
}

function getSheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    setupDatabase();
    sheet = ss.getSheetByName(name);
  }
  return sheet;
}

function logAction_(aksi, detail, error) {
  try {
    var sheet = getSheet_(SHEET_NAMES.LOGS);
    sheet.appendRow([new Date().toISOString(), aksi, detail, error || '']);
  } catch (e) {
    console.error('Error logging to sheet:', e);
  }
}

function logError_(aksi, errorMsg) {
  logAction_(aksi, 'TERJADI KESALAHAN', errorMsg);
}

// SETTINGS CRUD
function getSettingsFromDb() {
  var sheet = getSheet_(SHEET_NAMES.SETTINGS);
  var data = sheet.getDataRange().getValues();
  var settings = {};
  for (var i = 1; i < data.length; i++) {
    var key = data[i][0];
    var val = data[i][1];
    if (key) {
      if (['target_engagement_rate', 'bobot_replies', 'bobot_reposts', 'bobot_quotes', 'bobot_shares', 'bobot_likes'].indexOf(key) !== -1) {
        settings[key] = Number(val);
      } else {
        settings[key] = val;
      }
    }
  }
  return settings;
}

function saveSettingsToDb(newSettings) {
  var sheet = getSheet_(SHEET_NAMES.SETTINGS);
  var data = sheet.getDataRange().getValues();
  var keysFound = {};

  for (var i = 1; i < data.length; i++) {
    var key = data[i][0];
    if (newSettings.hasOwnProperty(key)) {
      sheet.getRange(i + 1, 2).setValue(newSettings[key]);
      keysFound[key] = true;
    }
  }

  for (var k in newSettings) {
    if (!keysFound[k]) {
      sheet.appendRow([k, newSettings[k]]);
    }
  }

  logAction_('SAVE_SETTINGS', 'Pengaturan creator diperbarui');
  return { success: true };
}

// TOPICS CRUD
function getTopicsFromDb() {
  var sheet = getSheet_(SHEET_NAMES.TOPICS);
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  var headers = rows[0];
  var list = [];
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    list.push(obj);
  }
  return list.reverse();
}

function addTopicToDb(topic) {
  var sheet = getSheet_(SHEET_NAMES.TOPICS);
  sheet.appendRow([
    topic.topic_id,
    topic.created_at || new Date().toISOString(),
    topic.ide_mentah,
    topic.persona,
    topic.pain_point,
    topic.pilar_konten,
    topic.status || 'baru',
    topic.skor_rata2 || 0
  ]);
  logAction_('ADD_TOPIC', 'Topik baru disimpan: ' + topic.topic_id);
  return topic;
}

// GENERATIONS CRUD
function getGenerationsFromDb() {
  var sheet = getSheet_(SHEET_NAMES.GENERATIONS);
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  var headers = rows[0];
  var list = [];
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    list.push(obj);
  }
  return list;
}

function saveGenerationsToDb(genList) {
  var sheet = getSheet_(SHEET_NAMES.GENERATIONS);
  genList.forEach(function(g) {
    sheet.appendRow([
      g.gen_id,
      g.topic_id,
      g.created_at || new Date().toISOString(),
      g.formula_version,
      g.format,
      g.hook,
      g.body,
      g.cta_reply,
      g.topic_tag,
      g.alasan_strategi,
      g.prediksi_skor
    ]);
  });
  logAction_('SAVE_GENERATIONS', genList.length + ' variasi konten disimpan.');
  return { success: true };
}

// POSTS CRUD
function getPostsFromDb() {
  var sheet = getSheet_(SHEET_NAMES.POSTS);
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  var headers = rows[0];
  var list = [];
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    list.push(obj);
  }
  return list.reverse();
}

function addPostToDb(post) {
  var sheet = getSheet_(SHEET_NAMES.POSTS);
  sheet.appendRow([
    post.post_id,
    post.gen_id,
    post.tanggal_posting,
    post.jam_posting,
    post.link_threads,
    post.versi_final_dipost
  ]);
  logAction_('ADD_POST', 'Post dicatat: ' + post.post_id);
  return post;
}

// EVALUATIONS CRUD
function getEvaluationsFromDb() {
  var sheet = getSheet_(SHEET_NAMES.EVALUATIONS);
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  var headers = rows[0];
  var list = [];
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    list.push(obj);
  }
  return list.reverse();
}

function addEvaluationToDb(evalData) {
  var sheet = getSheet_(SHEET_NAMES.EVALUATIONS);
  sheet.appendRow([
    evalData.eval_id,
    evalData.post_id,
    evalData.dievaluasi_pada,
    evalData.views,
    evalData.likes,
    evalData.replies,
    evalData.reposts,
    evalData.quotes,
    evalData.shares,
    evalData.follower_baru,
    evalData.klik_link,
    evalData.penjualan,
    evalData.rating_diri,
    evalData.catatan_user,
    evalData.sentimen_komentar,
    evalData.engagement_score
  ]);
  logAction_('ADD_EVALUATION', 'Evaluasi post ' + evalData.post_id + ' disimpan (Skor: ' + evalData.engagement_score + '%)');
  return evalData;
}

// FORMULAS CRUD
function getFormulasFromDb() {
  var sheet = getSheet_(SHEET_NAMES.FORMULAS);
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  var headers = rows[0];
  var list = [];
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var val = row[j];
      if (headers[j] === 'aturan_wajib' || headers[j] === 'larangan' || headers[j] === 'bukti') {
        try {
          val = JSON.parse(val);
        } catch(e) {
          val = [];
        }
      }
      obj[headers[j]] = val;
    }
    list.push(obj);
  }
  return list;
}

function addFormulaToDb(formula) {
  var sheet = getSheet_(SHEET_NAMES.FORMULAS);
  sheet.appendRow([
    formula.formula_version,
    formula.created_at || new Date().toISOString(),
    formula.status,
    formula.struktur_hook,
    formula.format_terbaik,
    formula.panjang_ideal,
    formula.gaya_bahasa,
    formula.jenis_cta,
    formula.waktu_posting_terbaik,
    formula.pilar_terbaik,
    JSON.stringify(formula.aturan_wajib || []),
    JSON.stringify(formula.larangan || []),
    JSON.stringify(formula.bukti || []),
    formula.confidence,
    formula.ringkasan
  ]);
  logAction_('ADD_FORMULA', 'Formula versi baru disimpan: ' + formula.formula_version + ' (' + formula.status + ')');
  return formula;
}

/**
 * Data simulasi awal untuk menguji dashboard dan formula engine langsung
 */
function seedDemoData() {
  setupDatabase();

  var demoTopic = {
    topic_id: 'top-001',
    created_at: new Date().toISOString(),
    ide_mentah: 'Cara jualan template Notion pertama tanpa modal iklan',
    persona: 'Freelancer & Digital Creator',
    pain_point: 'Bingung cari pembeli pertama tanpa budget ads',
    pilar_konten: 'Edukasi Praktis',
    status: 'dievaluasi',
    skor_rata2: 7.1
  };
  addTopicToDb(demoTopic);

  var demoGen = {
    gen_id: 'gen-001',
    topic_id: 'top-001',
    created_at: new Date().toISOString(),
    formula_version: 'v1.0',
    format: 'Cerita dengan Angka Nyata',
    hook: 'Nol rupiah modal iklan, tapi bisa tembus 18 penjualan template Notion di minggu pertama.',
    body: 'Waktu pertama kali rilis, saya bagikan 1 bagian template gratis di Threads lalu minta feedback jujur di kolom reply (dapat 40+ komentar). Hasilnya 18 orang beli full version tanpa diskon potong leher.\n\nKalian paling mentok di mana: bikin materinya atau cari pembeli pertamanya?',
    cta_reply: '📌 Full template bisa diakses di link ini: https://threadsformulalab.com/creator-os',
    topic_tag: 'ProdukDigital',
    alasan_strategi: 'Menampilkan angka realistis dan diakhiri pertanyaan biner pancingan reply.',
    prediksi_skor: 8
  };
  saveGenerationsToDb([demoGen]);

  var demoPost = {
    post_id: 'post-001',
    gen_id: 'gen-001',
    tanggal_posting: '2026-09-24',
    jam_posting: '07:45',
    link_threads: 'https://threads.net/@creator_id/post/1',
    versi_final_dipost: demoGen.body
  };
  addPostToDb(demoPost);

  var demoEval = {
    eval_id: 'eval-001',
    post_id: 'post-001',
    dievaluasi_pada: '72 jam',
    views: 4200,
    likes: 110,
    replies: 46,
    reposts: 12,
    quotes: 5,
    shares: 8,
    follower_baru: 24,
    klik_link: 68,
    penjualan: 4,
    rating_diri: 4,
    catatan_user: 'Pertanyaan di akhir sangat ampuh menarik 46 balasan.',
    sentimen_komentar: 'positif',
    engagement_score: 7.1
  };
  addEvaluationToDb(demoEval);

  logAction_('SEED_DEMO', '3 Post demo dan histori simulasi berhasil di-seed.');
  return { success: true, message: 'Data demo berhasil dimuat ke Spreadsheet!' };
}
