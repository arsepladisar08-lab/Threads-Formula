/**
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
    var userPrompt = 'Ide mentah dari user: "' + ideMentah + '"\n' +
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

    var userPrompt = 'Ide Topik: "' + topic.ide_mentah + '"\n' +
      'Persona: ' + topic.persona + '\n' +
      'Pain Point: ' + topic.pain_point + '\n' +
      'Pilar: ' + topic.pilar_konten + '\n' +
      'Sudut Pandang: ' + topic.sudut_pandang + '\n' +
      'Formula Versi: ' + (activeFormula ? activeFormula.formula_version : 'v1.0') + ' (' + (activeFormula ? activeFormula.status : 'eksperimen') + ')\n' +
      'Format Terbaik Formula: ' + (activeFormula ? activeFormula.format_terbaik : 'Cerita') + '\n' +
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

    // Update status topik ke diposting
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

    var userPrompt = 'Konten Dipost: "' + (post ? post.versi_final_dipost : '') + '"\n' +
      'Views: ' + evalData.views + ', Likes: ' + evalData.likes + ', Replies: ' + evalData.replies + ', Reposts: ' + evalData.reposts + ', Quotes: ' + evalData.quotes + ', Shares: ' + evalData.shares + '\n' +
      'Engagement Score: ' + evalData.engagement_score + '% (Target: ' + settings.target_engagement_rate + '%)\n' +
      'Rating Diri: ' + evalData.rating_diri + '/5\n' +
      'Catatan: ' + evalData.catatan_user + '\n' +
      'Sentimen: ' + evalData.sentimen_komentar;

    var aiAnalysis = callAI(PROMPT_ANALYZE_EVALUATION, userPrompt, true);
    addEvaluationToDb(evalData);

    // Panggil update formula engine
    var allEvals = getEvaluationsFromDb();
    var formulas = getFormulasFromDb();
    var currentFormula = formulas.length > 0 ? formulas[formulas.length - 1] : null;

    var statusCheck = determineFormulaStatus(allEvals, currentFormula, Number(settings.target_engagement_rate));

    var promptFormula = 'Evaluasi Terkumpul: ' + allEvals.length + ' post\n' +
      'Formula Saat Ini: ' + (currentFormula ? currentFormula.formula_version : 'v1.0') + ' (' + (currentFormula ? currentFormula.status : 'eksperimen') + ')\n' +
      'Status Hitungan Statistik: ' + statusCheck.status + ' (Confidence: ' + statusCheck.confidence + '%, Catatan: ' + statusCheck.reason + ')\n' +
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

    var userPrompt = 'Konten Top Performing:\n"' + post.versi_final_dipost + '"';
    var result = callAI(PROMPT_RECYCLE, userPrompt, true);

    return { success: true, data: result };
  } catch (err) {
    logError_('aiRecycleContent', err.toString());
    return { success: false, error: err.message };
  }
}
