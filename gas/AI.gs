/**
 * AI.gs - Lapisan Adapter AI untuk Google Apps Script
 * Mendukung Gemini API (default: gemini-2.5-flash), dengan arsitektur adapter
 * sehingga dapat dialihkan ke OpenAI atau Anthropic Claude jika diinginkan.
 */

function getApiKey_() {
  var props = PropertiesService.getScriptProperties();
  var key = props.getProperty('GEMINI_API_KEY');
  if (!key) {
    throw new Error('GEMINI_API_KEY belum dikonfigurasi di Script Properties. Silakan buka Project Settings > Script Properties.');
  }
  return key;
}

/**
 * Adapter pemanggil AI dengan mekanisme retry maksimal 2 kali untuk validasi JSON.
 * @param {string} systemPrompt - Instruksi sistem AI
 * @param {string} userPrompt - Input pengguna
 * @param {boolean} expectJson - Apakah output diharapkan berupa JSON
 * @return {any} Objek JSON hasil parsing atau string teks
 */
function callAI(systemPrompt, userPrompt, expectJson) {
  if (expectJson === undefined) expectJson = true;
  var maxRetries = 2;
  var currentTry = 0;
  var lastError = null;

  while (currentTry <= maxRetries) {
    try {
      var rawResponse = callGeminiApi_(systemPrompt, userPrompt, currentTry > 0);
      if (!expectJson) {
        return rawResponse;
      }

      var parsed = cleanAndParseJson_(rawResponse);
      if (parsed !== null) {
        return parsed;
      }
      throw new Error('Hasil AI bukan JSON valid: ' + rawResponse.substring(0, 150));
    } catch (err) {
      lastError = err;
      currentTry++;
      logError_('callAI_Retry_' + currentTry, err.toString());
      Utilities.sleep(1000); // jeda singkat sebelum mencoba ulang
    }
  }

  logError_('callAI_Failed', 'Gagal memanggil AI setelah ' + (maxRetries + 1) + ' percobaan: ' + lastError.toString());
  throw new Error('Gagal memproses permintaan AI: ' + lastError.message);
}

/**
 * Pemanggilan API Google Gemini via UrlFetchApp
 */
function callGeminiApi_(systemPrompt, userPrompt, isRetry) {
  var apiKey = getApiKey_();
  var model = 'gemini-3.8-flash';
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey;

  var promptWithRetryNote = userPrompt;
  if (isRetry) {
    promptWithRetryNote += '\n\nPERINGATAN PENTING: Output Anda sebelumnya gagal di-parse sebagai JSON. Pastikan HANYA menghasilkan format JSON valid tanpa tanda petik pembungkus markdown (```json).';
  }

  var payload = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: promptWithRetryNote }
        ]
      }
    ],
    systemInstruction: {
      parts: [
        { text: systemPrompt }
      ]
    },
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
  if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
    throw new Error('Gemini API tidak mengembalikan konten');
  }

  var textPart = data.candidates[0].content.parts[0].text;
  return textPart;
}

/**
 * Pembersih string markdown dan parser JSON aman
 */
function cleanAndParseJson_(rawText) {
  if (!rawText) return null;
  var text = rawText.trim();
  
  // Hapus kode blok markdown ```json atau ```
  if (text.indexOf('```') !== -1) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    // Coba cari substring kurung kurawal pertama hingga terakhir
    var startBrace = text.indexOf('{');
    var endBrace = text.lastIndexOf('}');
    var startBracket = text.indexOf('[');
    var endBracket = text.lastIndexOf(']');

    if (startBrace !== -1 && endBrace !== -1 && (startBracket === -1 || startBrace < startBracket)) {
      try {
        return JSON.parse(text.substring(startBrace, endBrace + 1));
      } catch (e2) {}
    } else if (startBracket !== -1 && endBracket !== -1) {
      try {
        return JSON.parse(text.substring(startBracket, endBracket + 1));
      } catch (e3) {}
    }
    return null;
  }
}
