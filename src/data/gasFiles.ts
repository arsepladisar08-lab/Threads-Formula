export interface GasFileItem {
  name: string;
  type: 'gs' | 'html';
  description: string;
  code: string;
}

export const GAS_FILES: GasFileItem[] = [
  {
    name: 'Code.gs',
    type: 'gs',
    description: 'Controller utama Web App: menangani routing doGet, komunikasi google.script.run, dan eksekusi workflow.',
    code: `/**
 * Code.gs - Entry point Google Apps Script Web App & Router Backend
 */

function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
    .setTitle('Threads Formula Lab')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Mengambil semua data utama aplikasi untuk dimuat sekaligus oleh frontend
 */
function getAppData() {
  try {
    var settings = getSettingsFromDb();
    var topics = getTopicsFromDb();
    var generations = getGenerationsFromDb();
    var posts = getPostsFromDb();
    var evaluations = getEvaluationsFromDb();
    var formulas = getFormulasFromDb();

    return {
      success: true,
      data: {
        settings: settings,
        topics: topics,
        generations: generations,
        posts: posts,
        evaluations: evaluations,
        formulas: formulas
      }
    };
  } catch (err) {
    logError_('getAppData', err.toString());
    return { success: false, error: err.message };
  }
}

/**
 * Menyimpan pengaturan profil dan bobot scoring
 */
function saveSettings(settings) {
  try {
    saveSettingsToDb(settings);
    return { success: true };
  } catch (err) {
    logError_('saveSettings', err.toString());
    return { success: false, error: err.message };
  }
}

/**
 * Memperkaya ide mentah dengan AI
 */
function aiEnrichTopic(ideMentah) {
  try {
    var settings = getSettingsFromDb();
    var userPrompt = 'Ide mentah dari user: "' + ideMentah + '"\\n' +
      'Profil Niche: ' + settings.niche + ', Nama Produk: ' + settings.nama_produk + ', Gaya: ' + settings.gaya_bahasa;

    var result = callAI(PROMPT_ENRICH_TOPIC, userPrompt, true);
    return { success: true, data: result };
  } catch (err) {
    logError_('aiEnrichTopic', err.toString());
    return { success: false, error: err.message };
  }
}

/**
 * Menyimpan topik baru
 */
function createTopic(topicData) {
  try {
    if (!topicData.topic_id) {
      topicData.topic_id = 'top-' + Utilities.getUuid().substring(0, 8);
    }
    topicData.created_at = new Date().toISOString();
    topicData.status = 'baru';
    var saved = addTopicToDb(topicData);
    return { success: true, data: saved };
  } catch (err) {
    logError_('createTopic', err.toString());
    return { success: false, error: err.message };
  }
}

/**
 * Menghasilkan 3-5 variasi konten dari topik dengan formula aktif
 */
function aiGenerateVariations(topicId) {
  try {
    var settings = getSettingsFromDb();
    var topics = getTopicsFromDb();
    var topic = topics.find(function(t) { return t.topic_id === topicId; });
    if (!topic) throw new Error('Topik tidak ditemukan: ' + topicId);

    var formulas = getFormulasFromDb();
    var activeFormula = formulas.length > 0 ? formulas[formulas.length - 1] : null;

    var userPrompt = 'Ide Topik: "' + topic.ide_mentah + '"\\n' +
      'Persona: ' + topic.persona + '\\n' +
      'Pain Point: ' + topic.pain_point + '\\n' +
      'Pilar: ' + topic.pilar_konten + '\\n' +
      'Sudut Pandang: ' + topic.sudut_pandang + '\\n' +
      'Formula Versi: ' + (activeFormula ? activeFormula.formula_version : 'v1.0') + ' (' + (activeFormula ? activeFormula.status : 'eksperimen') + ')\\n' +
      'Format Terbaik Formula: ' + (activeFormula ? activeFormula.format_terbaik : 'Cerita') + '\\n' +
      'Hook Wajib Formula: ' + (activeFormula ? activeFormula.struktur_hook : 'Angka riil');

    var variations = callAI(PROMPT_GENERATE_CONTENT, userPrompt, true);
    if (!Array.isArray(variations)) {
      throw new Error('Hasil AI tidak berformat list variasi');
    }

    var genList = variations.map(function(v, idx) {
      return {
        gen_id: 'gen-' + Utilities.getUuid().substring(0, 8),
        topic_id: topicId,
        created_at: new Date().toISOString(),
        formula_version: activeFormula ? activeFormula.formula_version : 'v1.0',
        format: v.format,
        hook: v.hook,
        body: v.body,
        cta_reply: v.cta_reply,
        topic_tag: v.topic_tag || 'ProdukDigital',
        alasan_strategi: v.alasan_strategi,
        prediksi_skor: Number(v.prediksi_skor) || 8,
        is_exploration: v.is_exploration === true
      };
    });

    saveGenerationsToDb(genList);

    // Update status topik
    var sheet = getSheet_(SHEET_NAMES.TOPICS);
    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] === topicId) {
        sheet.getRange(i + 1, 7).setValue('diproses');
        break;
      }
    }

    return { success: true, data: genList };
  } catch (err) {
    logError_('aiGenerateVariations', err.toString());
    return { success: false, error: err.message };
  }
}

/**
 * Mencatat postingan yang sudah tayang di Threads
 */
function recordPost(postData) {
  try {
    if (!postData.post_id) {
      postData.post_id = 'post-' + Utilities.getUuid().substring(0, 8);
    }
    var saved = addPostToDb(postData);

    if (postData.topic_id) {
      var sheet = getSheet_(SHEET_NAMES.TOPICS);
      var rows = sheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] === postData.topic_id) {
          sheet.getRange(i + 1, 7).setValue('diposting');
          break;
        }
      }
    }

    return { success: true, data: saved };
  } catch (err) {
    logError_('recordPost', err.toString());
    return { success: false, error: err.message };
  }
}

/**
 * Menyimpan evaluasi, memanggil AI analyzer, dan memperbarui formula
 */
function aiAnalyzeEvaluation(evalData) {
  try {
    var settings = getSettingsFromDb();
    evalData.engagement_score = calculateEngagementScore(evalData, settings);
    if (!evalData.eval_id) {
      evalData.eval_id = 'eval-' + Utilities.getUuid().substring(0, 8);
    }

    var posts = getPostsFromDb();
    var post = posts.find(function(p) { return p.post_id === evalData.post_id; });

    var userPrompt = 'Konten Dipost: "' + (post ? post.versi_final_dipost : '') + '"\\n' +
      'Views: ' + evalData.views + ', Likes: ' + evalData.likes + ', Replies: ' + evalData.replies + ', Reposts: ' + evalData.reposts + ', Quotes: ' + evalData.quotes + ', Shares: ' + evalData.shares + '\\n' +
      'Engagement Score: ' + evalData.engagement_score + '% (Target: ' + settings.target_engagement_rate + '%)\\n' +
      'Rating Diri: ' + evalData.rating_diri + '/5\\n' +
      'Catatan: ' + evalData.catatan_user + '\\n' +
      'Sentimen: ' + evalData.sentimen_komentar;

    var aiAnalysis = callAI(PROMPT_ANALYZE_EVALUATION, userPrompt, true);
    addEvaluationToDb(evalData);

    // Panggil update formula engine
    var allEvals = getEvaluationsFromDb();
    var formulas = getFormulasFromDb();
    var currentFormula = formulas.length > 0 ? formulas[formulas.length - 1] : null;

    var statusCheck = determineFormulaStatus(allEvals, currentFormula, Number(settings.target_engagement_rate));

    var promptFormula = 'Evaluasi Terkumpul: ' + allEvals.length + ' post\\n' +
      'Formula Saat Ini: ' + (currentFormula ? currentFormula.formula_version : 'v1.0') + ' (' + (currentFormula ? currentFormula.status : 'eksperimen') + ')\\n' +
      'Status Hitungan Statistik: ' + statusCheck.status + ' (Confidence: ' + statusCheck.confidence + '%, Catatan: ' + statusCheck.reason + ')\\n' +
      'Rincian Skor: ' + JSON.stringify(allEvals.map(function(e) { return e.engagement_score; }));

    var updatedFormula = callAI(PROMPT_UPDATE_FORMULA, promptFormula, true);
    updatedFormula.status = statusCheck.status;
    updatedFormula.confidence = statusCheck.confidence;
    addFormulaToDb(updatedFormula);

    return {
      success: true,
      data: {
        evaluation: evalData,
        analysis: aiAnalysis,
        updatedFormula: updatedFormula
      }
    };
  } catch (err) {
    logError_('aiAnalyzeEvaluation', err.toString());
    return { success: false, error: err.message };
  }
}

/**
 * Menulis ulang (recycle) konten top performing
 */
function aiRecycleContent(postId) {
  try {
    var posts = getPostsFromDb();
    var post = posts.find(function(p) { return p.post_id === postId; });
    if (!post) throw new Error('Post tidak ditemukan: ' + postId);

    var userPrompt = 'Konten Top Performing:\\n"' + post.versi_final_dipost + '"';
    var result = callAI(PROMPT_RECYCLE, userPrompt, true);

    return { success: true, data: result };
  } catch (err) {
    logError_('aiRecycleContent', err.toString());
    return { success: false, error: err.message };
  }
}`
  },
  {
    name: 'Database.gs',
    type: 'gs',
    description: 'Manajemen 7 sheet database di Google Spreadsheet (Settings, Topics, Generations, Posts, Evaluations, Formulas, Logs) beserta fungsi seedDemoData().',
    code: `/**
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
      headers: ['formula_version', 'created_at', 'status', 'struktur_hook', 'format_terbaik', 'panjang_ideal', 'gaya_bahasa', 'jenis_cta', 'waktu_posting_terbaik', 'pilar_terbaik', 'aturan_wajib', 'larangan', 'bukti', 'confidence', 'ringkasan']
    },
    {
      name: SHEET_NAMES.LOGS,
      headers: ['timestamp', 'aksi', 'detail', 'error']
    }
  ];

  schemas.forEach(function(schema) {
    var sheet = ss.getSheetByName(schema.name);
    if (!sheet) sheet = ss.insertSheet(schema.name);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(schema.headers);
      sheet.getRange(1, 1, 1, schema.headers.length).setFontWeight('bold').setBackground('#f3f4f6');
      sheet.setFrozenRows(1);
      if (schema.initialData) {
        schema.initialData.forEach(function(row) { sheet.appendRow(row); });
      }
    }
  });

  return { success: true, message: 'Database Threads Formula Lab berhasil dibuat!' };
}

function getSheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) { setupDatabase(); sheet = ss.getSheetByName(name); }
  return sheet;
}

function logAction_(aksi, detail, error) {
  try {
    var sheet = getSheet_(SHEET_NAMES.LOGS);
    sheet.appendRow([new Date().toISOString(), aksi, detail, error || '']);
  } catch (e) {}
}

function logError_(aksi, errorMsg) {
  logAction_(aksi, 'TERJADI KESALAHAN', errorMsg);
}

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
    if (!keysFound[k]) sheet.appendRow([k, newSettings[k]]);
  }
  logAction_('SAVE_SETTINGS', 'Pengaturan creator diperbarui');
  return { success: true };
}

function getTopicsFromDb() {
  var sheet = getSheet_(SHEET_NAMES.TOPICS);
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  var headers = rows[0];
  var list = [];
  for (var i = 1; i < rows.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) obj[headers[j]] = rows[i][j];
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
  return topic;
}

function getGenerationsFromDb() {
  var sheet = getSheet_(SHEET_NAMES.GENERATIONS);
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  var headers = rows[0];
  var list = [];
  for (var i = 1; i < rows.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) obj[headers[j]] = rows[i][j];
    list.push(obj);
  }
  return list;
}

function saveGenerationsToDb(genList) {
  var sheet = getSheet_(SHEET_NAMES.GENERATIONS);
  genList.forEach(function(g) {
    sheet.appendRow([
      g.gen_id, g.topic_id, g.created_at || new Date().toISOString(),
      g.formula_version, g.format, g.hook, g.body, g.cta_reply,
      g.topic_tag, g.alasan_strategi, g.prediksi_skor
    ]);
  });
  return { success: true };
}

function getPostsFromDb() {
  var sheet = getSheet_(SHEET_NAMES.POSTS);
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  var headers = rows[0];
  var list = [];
  for (var i = 1; i < rows.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) obj[headers[j]] = rows[i][j];
    list.push(obj);
  }
  return list.reverse();
}

function addPostToDb(post) {
  var sheet = getSheet_(SHEET_NAMES.POSTS);
  sheet.appendRow([
    post.post_id, post.gen_id, post.tanggal_posting, post.jam_posting, post.link_threads, post.versi_final_dipost
  ]);
  return post;
}

function getEvaluationsFromDb() {
  var sheet = getSheet_(SHEET_NAMES.EVALUATIONS);
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  var headers = rows[0];
  var list = [];
  for (var i = 1; i < rows.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) obj[headers[j]] = rows[i][j];
    list.push(obj);
  }
  return list.reverse();
}

function addEvaluationToDb(evalData) {
  var sheet = getSheet_(SHEET_NAMES.EVALUATIONS);
  sheet.appendRow([
    evalData.eval_id, evalData.post_id, evalData.dievaluasi_pada,
    evalData.views, evalData.likes, evalData.replies, evalData.reposts,
    evalData.quotes, evalData.shares, evalData.follower_baru, evalData.klik_link,
    evalData.penjualan, evalData.rating_diri, evalData.catatan_user,
    evalData.sentimen_komentar, evalData.engagement_score
  ]);
  return evalData;
}

function getFormulasFromDb() {
  var sheet = getSheet_(SHEET_NAMES.FORMULAS);
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  var headers = rows[0];
  var list = [];
  for (var i = 1; i < rows.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var val = rows[i][j];
      if (['aturan_wajib', 'larangan', 'bukti'].indexOf(headers[j]) !== -1) {
        try { val = JSON.parse(val); } catch(e) { val = []; }
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
    formula.formula_version, formula.created_at || new Date().toISOString(),
    formula.status, formula.struktur_hook, formula.format_terbaik,
    formula.panjang_ideal, formula.gaya_bahasa, formula.jenis_cta,
    formula.waktu_posting_terbaik, formula.pilar_terbaik,
    JSON.stringify(formula.aturan_wajib || []), JSON.stringify(formula.larangan || []),
    JSON.stringify(formula.bukti || []), formula.confidence, formula.ringkasan
  ]);
  return formula;
}

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
  return { success: true, message: 'Data demo 3 post berhasil disiapkan di Spreadsheet!' };
}`
  },
  {
    name: 'AI.gs',
    type: 'gs',
    description: 'Lapisan adapter AI untuk Gemini API (gemini-2.5-flash) via UrlFetchApp dengan mekanisme retry 2x untuk validasi format JSON.',
    code: `/**
 * AI.gs - Lapisan Adapter AI untuk Google Apps Script
 */

function getApiKey_() {
  var props = PropertiesService.getScriptProperties();
  var key = props.getProperty('GEMINI_API_KEY');
  if (!key) {
    throw new Error('GEMINI_API_KEY belum dikonfigurasi di Script Properties.');
  }
  return key;
}

function callAI(systemPrompt, userPrompt, expectJson) {
  if (expectJson === undefined) expectJson = true;
  var maxRetries = 2;
  var currentTry = 0;
  var lastError = null;

  while (currentTry <= maxRetries) {
    try {
      var rawResponse = callGeminiApi_(systemPrompt, userPrompt, currentTry > 0);
      if (!expectJson) return rawResponse;
      var parsed = cleanAndParseJson_(rawResponse);
      if (parsed !== null) return parsed;
      throw new Error('Hasil AI bukan JSON valid');
    } catch (err) {
      lastError = err;
      currentTry++;
      Utilities.sleep(1000);
    }
  }
  logError_('callAI_Failed', lastError.toString());
  throw new Error('Gagal memproses AI: ' + lastError.message);
}

function callGeminiApi_(systemPrompt, userPrompt, isRetry) {
  var apiKey = getApiKey_();
  var model = 'gemini-2.5-flash';
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey;

  var promptText = userPrompt;
  if (isRetry) {
    promptText += '\\n\\nPERINGATAN: Kembalikan HANYA JSON valid tanpa tanda pembungkus markdown.';
  }

  var payload = {
    contents: [{ role: 'user', parts: [{ text: promptText }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      temperature: 0.7,
      responseMimeType: 'application/json'
    }
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(url, options);
  var statusCode = response.getResponseCode();
  var content = response.getContentText();

  if (statusCode !== 200) {
    throw new Error('Gemini API Error (' + statusCode + '): ' + content);
  }

  var data = JSON.parse(content);
  return data.candidates[0].content.parts[0].text;
}

function cleanAndParseJson_(rawText) {
  if (!rawText) return null;
  var text = rawText.trim();
  var tick = String.fromCharCode(96);
  if (text.indexOf(tick) !== -1) {
    text = text.split(tick).join('').replace(/^json/i, '').trim();
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}`
  },
  {
    name: 'Prompts.gs',
    type: 'gs',
    description: 'Kumpulan Prompt Sistem AI spesialis algoritma Threads: santai, no hard-sell, memancing balasan, 80% value / 20% promosi halus.',
    code: `/**
 * Prompts.gs - Sistem Prompt AI Threads Formula Lab
 */

var PROMPT_ENRICH_TOPIC = [
  'Anda adalah ahli strategi konten Threads papan atas khusus kreator produk digital.',
  'Tugas: Mengolah ide mentah topik menjadi sudut pandang (angle) konten yang tajam dan scroll-stopper di Threads.',
  'Kembalikan HANYA JSON valid:',
  '{',
  '  "persona": "Persona audiens sasaran paling spesifik",',
  '  "pain_point": "Masalah nyata yang dialami persona",',
  '  "pilar_konten": "Edukasi Praktis | Studi Kasus / Realita | Opini Kontroversial | Behind the Scenes | Inspirasi & Mindset",',
  '  "sudut_pandang": "Angle unik dan kontras yang belum basi"',
  '}'
].join('\\n');

var PROMPT_GENERATE_CONTENT = [
  'Anda adalah ahli strategi konten Threads papan atas untuk produk digital.',
  'Tugas: Membuat 3-5 variasi konten Threads siap posting dengan format berbeda dari 1 topik.',
  'Prinsip Wajib:',
  '- DILARANG hard selling di post utama. Link produk HANYA di kolom reply #1.',
  '- Hook maksimal 2 baris, gunakan angka riil atau opini tegas.',
  '- Porsi: 80% edukasi/cerita, 20% promosi halus.',
  '- Sertakan 1 variasi eksplorasi (is_exploration: true).',
  'Kembalikan HANYA array JSON:',
  '[',
  '  {',
  '    "format": "Nama Format",',
  '    "hook": "Kalimat pembuka scroll stopper",',
  '    "body": "Teks post utama (200-480 karakter). Jangan ada link di sini!",',
  '    "cta_reply": "Teks balasan pertama penawaran ramah",',
  '    "topic_tag": "KataKunci",',
  '    "alasan_strategi": "Kenapa memicu engagement",',
  '    "prediksi_skor": 9,',
  '    "is_exploration": false',
  '  }',
  ']'
].join('\\n');

var PROMPT_ANALYZE_EVALUATION = [
  'Anda adalah AI Analis Performa Konten Threads spesialis niche Produk Digital.',
  'Menganalisis hasil evaluasi post dibandingkan target dan riwayat.',
  'Kembalikan HANYA JSON valid:',
  '{',
  '  "skor_dibandingkan_rata2": "+35% di atas target engagement",',
  '  "faktor_kunci": ["Faktor 1", "Faktor 2"],',
  '  "kelebihan_post": "Poin pemicu reply",',
  '  "kelemahan_post": "Hal penahan reach",',
  '  "rekomendasi_perbaikan": "1 saran konkret"',
  '}'
].join('\\n');

var PROMPT_UPDATE_FORMULA = [
  'Anda adalah Kepala Riset Formula Engine Threads.',
  'Susun Formula Konten versi baru dari seluruh data evaluasi post.',
  'Kembalikan HANYA JSON valid:',
  '{',
  '  "formula_version": "v1.X",',
  '  "status": "eksperimen" | "kandidat" | "FINAL",',
  '  "struktur_hook": "Pola hook terbukti terbaik",',
  '  "format_terbaik": "Format terbaik",',
  '  "panjang_ideal": "Panjang ideal",',
  '  "gaya_bahasa": "Tone of voice",',
  '  "jenis_cta": "Model CTA balasan pertama",',
  '  "waktu_posting_terbaik": "Jam posting terbaik",',
  '  "pilar_terbaik": "Pilar terbaik",',
  '  "aturan_wajib": ["Aturan 1", "Aturan 2"],',
  '  "larangan": ["Larangan 1"],',
  '  "confidence": 75,',
  '  "ringkasan": "Ringkasan eksekutif",',
  '  "changelog": "Perubahan dibanding versi lama",',
  '  "saran_eksperimen_berikutnya": "Uji 1 variabel berikutnya"',
  '}'
].join('\\n');

var PROMPT_RECYCLE = [
  'Tulis ulang konten berkinerja tinggi menjadi post baru dengan angle segar tanpa menghilangkan inti pesan terbukti.',
  'Kembalikan HANYA JSON valid:',
  '{',
  '  "new_hook": "Hook baru",',
  '  "new_body": "Teks post baru",',
  '  "new_cta_reply": "CTA reply baru",',
  '  "new_angle": "Penjelasan angle baru",',
  '  "alasan_daur_ulang": "Kenapa berpotensi tinggi"',
  '}'
].join('\\n');`
  },
  {
    name: 'Formula.gs',
    type: 'gs',
    description: 'Logika matematika perhitungan Engagement Score berbobot, standar deviasi, koefisien variasi (CV), transisi status formula, dan deteksi kejenuhan audiens.',
    code: `/**
 * Formula.gs - Mesin Perhitungan Skor & Logika Formula Engine
 */

function calculateEngagementScore(evalData, settings) {
  if (!evalData.views || Number(evalData.views) <= 0) return 0;
  var bReplies = Number(settings.bobot_replies || 3);
  var bReposts = Number(settings.bobot_reposts || 2);
  var bQuotes = Number(settings.bobot_quotes || 2);
  var bShares = Number(settings.bobot_shares || 2);
  var bLikes = Number(settings.bobot_likes || 1);

  var total = (Number(evalData.replies || 0) * bReplies) +
              (Number(evalData.reposts || 0) * bReposts) +
              (Number(evalData.quotes || 0) * bQuotes) +
              (Number(evalData.shares || 0) * bShares) +
              (Number(evalData.likes || 0) * bLikes);

  return Math.round((total / Number(evalData.views)) * 10000) / 100;
}

function computeStatistics(scores) {
  if (!scores || scores.length === 0) return { mean: 0, stdDev: 0, cv: 0, count: 0 };
  var sum = scores.reduce(function(a, b) { return a + Number(b); }, 0);
  var mean = sum / scores.length;
  if (scores.length === 1) return { mean: mean, stdDev: 0, cv: 0, count: 1 };

  var varSum = scores.reduce(function(acc, val) { return acc + Math.pow(Number(val) - mean, 2); }, 0);
  var stdDev = Math.sqrt(varSum / (scores.length - 1));
  var cv = mean > 0 ? (stdDev / mean) * 100 : 0;

  return {
    mean: Math.round(mean * 100) / 100,
    stdDev: Math.round(stdDev * 100) / 100,
    cv: Math.round(cv * 100) / 100,
    count: scores.length
  };
}

function determineFormulaStatus(evaluations, currentFormula, targetRate) {
  var scores = evaluations.map(function(e) { return Number(e.engagement_score || 0); }).filter(function(s) { return s > 0; });
  var count = scores.length;

  if (count < 5) {
    return {
      status: 'eksperimen',
      reason: 'Data belum mencapai minimal 5 post dievaluasi (' + count + '/5).',
      confidence: Math.min(65, (count * 12) + 10)
    };
  }

  var stats = computeStatistics(scores);
  var aboveTarget = scores.filter(function(s) { return s >= targetRate; }).length;
  var abovePct = (aboveTarget / count) * 100;

  // Deteksi kejenuhan audiens pada formula FINAL
  if (currentFormula && currentFormula.status === 'FINAL' && count >= 3) {
    var last3 = scores.slice(scores.length - 3);
    var all3Drop = last3.every(function(s) { return s < targetRate; });
    if (all3Drop) {
      return {
        status: 'kandidat',
        reason: 'Performa turun 3 kali berturut-turut di bawah target. Terdeteksi kejenuhan audiens. Status diturunkan ke Kandidat.',
        confidence: Math.max(55, (currentFormula.confidence || 85) - 20)
      };
    }
  }

  var baseConfidence = Math.min(100, Math.round((abovePct * 0.5) + (Math.max(0, 100 - stats.cv) * 0.3) + (Math.min(count, 15) * 2)));

  // Syarat FINAL: minimal 10 post, >= 70% di atas target, confidence >= 80
  if (count >= 10 && abovePct >= 70 && baseConfidence >= 80) {
    return {
      status: 'FINAL',
      reason: 'Formula teruji konsisten (' + count + ' post, ' + Math.round(abovePct) + '% di atas target, stabilitas CV ' + stats.cv + '%).',
      confidence: Math.max(80, baseConfidence)
    };
  }

  // Syarat Kandidat: minimal 5 post, rata-rata di atas target, CV < 30%
  if (count >= 5 && stats.mean >= targetRate && stats.cv < 30) {
    return {
      status: 'kandidat',
      reason: 'Rata-rata skor ' + stats.mean + '% melampaui target ' + targetRate + '% dengan variasi stabil (CV ' + stats.cv + '%).',
      confidence: Math.min(79, Math.max(65, baseConfidence))
    };
  }

  return {
    status: 'eksperimen',
    reason: 'Rata-rata skor atau variasi belum memenuhi kriteria kandidat.',
    confidence: Math.min(65, Math.max(30, baseConfidence))
  };
}`
  },
  {
    name: 'Index.html',
    type: 'html',
    description: 'File HTML template utama untuk GAS Web App via HtmlService. Memuat layout 9 tab, modal edit, dan integrasi Chart.js.',
    code: `<!-- Lihat file /gas/Index.html yang sudah disediakan di workspace -->`
  },
  {
    name: 'CSS.html',
    type: 'html',
    description: 'File stylesheet CSS murni tanpa build tool, responsive, mendukung Dark Mode & Light Mode, bergaya Threads.',
    code: `<!-- Lihat file /gas/CSS.html yang sudah disediakan di workspace -->`
  },
  {
    name: 'JS.html',
    type: 'html',
    description: 'Logika antarmuka client-side vanilla JS yang berkomunikasi langsung dengan google.script.run.',
    code: `<!-- Lihat file /gas/JS.html yang sudah disediakan di workspace -->`
  }
];
