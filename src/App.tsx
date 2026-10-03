import React, { useState, useEffect, useCallback } from 'react';
import { 
  CreatorSettings, 
  Topic, 
  ContentGeneration, 
  PostRecord, 
  PostEvaluation, 
  FormulaModel,
  ContentPillar,
  GasConnectionConfig,
  ThreadsAccount
} from './types';
import { 
  getSettings, 
  saveSettings, 
  getTopics, 
  saveTopics, 
  getGenerations, 
  saveGenerations, 
  getPosts, 
  savePosts, 
  getEvaluations, 
  saveEvaluations, 
  getFormulas, 
  saveFormulas, 
  addLog,
  seedDemoData,
  resetAllData,
  initStorageIfNeeded,
  getGasConfig,
  saveGasConfig
} from './services/storage';
import { determineFormulaStatus } from './services/formulaEngine';
import { 
  enrichTopicApi, 
  generateContentApi, 
  analyzeEvaluationApi, 
  updateFormulaApi, 
  recycleContentApi 
} from './services/aiClient';
import { 
  getThreadsStatus, 
  publishToThreads, 
  fetchThreadsInsights 
} from './services/threadsClient';
import { pushGasData } from './services/gasClient';

import { Navbar } from './components/Navbar';
import { DashboardTab } from './components/DashboardTab';
import { TopicTab } from './components/TopicTab';
import { GeneratorTab } from './components/GeneratorTab';
import { PostingTab } from './components/PostingTab';
import { EvaluationTab } from './components/EvaluationTab';
import { FormulaTab } from './components/FormulaTab';
import { HistoryTab } from './components/HistoryTab';
import { SettingsTab } from './components/SettingsTab';
import { GasIntegrationTab } from './components/GasIntegrationTab';
import { ThreadsConnectModal } from './components/ThreadsConnectModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  // Initialize storage if empty on first load
  useEffect(() => {
    initStorageIfNeeded();
  }, []);

  const [settings, setSettingsState] = useState<CreatorSettings>(() => getSettings());
  const [topics, setTopicsState] = useState<Topic[]>(() => getTopics());
  const [generations, setGenerationsState] = useState<ContentGeneration[]>(() => getGenerations());
  const [posts, setPostsState] = useState<PostRecord[]>(() => getPosts());
  const [evaluations, setEvaluationsState] = useState<PostEvaluation[]>(() => getEvaluations());
  const [formulas, setFormulasState] = useState<FormulaModel[]>(() => getFormulas());

  const [threadsAccount, setThreadsAccount] = useState<ThreadsAccount | null>(null);
  const [isThreadsModalOpen, setIsThreadsModalOpen] = useState(false);

  const [gasConfig, setGasConfig] = useState<GasConnectionConfig>(() => getGasConfig());

  // Check Threads connection on mount
  useEffect(() => {
    getThreadsStatus()
      .then((res) => {
        if (res.isConnected && res.account) {
          setThreadsAccount(res.account);
        }
      })
      .catch(console.error);
  }, []);

  const handleUpdateGasConfig = useCallback((newConfig: GasConnectionConfig) => {
    setGasConfig(newConfig);
    saveGasConfig(newConfig);
  }, []);

  const handleImportFromGas = useCallback((data: {
    settings?: CreatorSettings;
    topics?: Topic[];
    generations?: ContentGeneration[];
    posts?: PostRecord[];
    evaluations?: PostEvaluation[];
    formulas?: FormulaModel[];
  }) => {
    if (data.settings) {
      setSettingsState(data.settings);
      saveSettings(data.settings);
    }
    if (data.topics && Array.isArray(data.topics) && data.topics.length > 0) {
      setTopicsState(data.topics);
      saveTopics(data.topics);
    }
    if (data.generations && Array.isArray(data.generations) && data.generations.length > 0) {
      setGenerationsState(data.generations);
      saveGenerations(data.generations);
    }
    if (data.posts && Array.isArray(data.posts) && data.posts.length > 0) {
      setPostsState(data.posts);
      savePosts(data.posts);
    }
    if (data.evaluations && Array.isArray(data.evaluations) && data.evaluations.length > 0) {
      setEvaluationsState(data.evaluations);
      saveEvaluations(data.evaluations);
    }
    if (data.formulas && Array.isArray(data.formulas) && data.formulas.length > 0) {
      setFormulasState(data.formulas);
      saveFormulas(data.formulas);
    }
    addLog('GAS_IMPORT', 'Data berhasil disinkronkan dari Google Spreadsheet');
  }, []);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [queuedGen, setQueuedGen] = useState<ContentGeneration | null>(null);

  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  // Sync state whenever needed
  const reloadFromStorage = useCallback(() => {
    setSettingsState(getSettings());
    setTopicsState(getTopics());
    setGenerationsState(getGenerations());
    setPostsState(getPosts());
    setEvaluationsState(getEvaluations());
    setFormulasState(getFormulas());
  }, []);

  const activeFormula = formulas.length > 0 ? formulas[formulas.length - 1] : null;

  // Set default selected topic id if available
  useEffect(() => {
    if (!selectedTopicId && topics.length > 0) {
      setSelectedTopicId(topics[0].topic_id);
    }
  }, [topics, selectedTopicId]);

  // Set default selected post id if available
  useEffect(() => {
    if (!selectedPostId && posts.length > 0) {
      setSelectedPostId(posts[0].post_id);
    }
  }, [posts, selectedPostId]);

  // 1. AI ENRICH TOPIC
  const handleEnrichTopic = async (rawText: string) => {
    try {
      const res = await enrichTopicApi(rawText, settings);
      addLog('ENRICH_TOPIC', `Ide mentah diolah: "${rawText.substring(0, 40)}..."`);
      showToast('Ide berhasil diperkaya oleh AI!', 'success');
      return res;
    } catch (err: any) {
      showToast(err.message || 'Gagal memanggil AI untuk mengolah topik', 'error');
      throw err;
    }
  };

  // 2. SAVE TOPIC
  const handleSaveTopic = (topicData: Partial<Topic>, proceedToGenerate: boolean = false) => {
    const newTopic: Topic = {
      topic_id: `top-${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
      ide_mentah: topicData.ide_mentah || '',
      persona: topicData.persona || settings.persona_audiens,
      pain_point: topicData.pain_point || settings.pain_point_utama,
      pilar_konten: topicData.pilar_konten || 'Edukasi Praktis',
      sudut_pandang: topicData.sudut_pandang || topicData.ide_mentah || '',
      status: 'baru',
    };

    const updated = [newTopic, ...topics];
    setTopicsState(updated);
    saveTopics(updated);
    setSelectedTopicId(newTopic.topic_id);
    addLog('SAVE_TOPIC', `Topik baru disimpan: "${newTopic.ide_mentah}"`);

    if (proceedToGenerate) {
      setActiveTab('konten');
      handleGenerateContent(newTopic.topic_id);
    } else {
      showToast('Topik berhasil disimpan di Bank Ide!', 'success');
    }
  };

  // 3. GENERATE CONTENT VARIATIONS
  const handleGenerateContent = async (topicId: string) => {
    const topic = topics.find((t) => t.topic_id === topicId);
    if (!topic) {
      showToast('Pilih topik terlebih dahulu', 'error');
      return;
    }

    setLoadingAi(true);
    try {
      const rawVariations = await generateContentApi(topic, settings, activeFormula || ({} as any));
      const newGenerations: ContentGeneration[] = rawVariations.map((v, idx) => ({
        gen_id: `gen-${Date.now().toString(36)}-${idx}`,
        topic_id: topic.topic_id,
        created_at: new Date().toISOString(),
        formula_version: activeFormula?.formula_version || 'v1.0',
        format: v.format,
        hook: v.hook,
        body: v.body,
        cta_reply: v.cta_reply,
        topic_tag: v.topic_tag || 'ProdukDigital',
        alasan_strategi: v.alasan_strategi,
        prediksi_skor: Number(v.prediksi_skor) || 8,
        is_exploration: v.is_exploration === true,
      }));

      // Update generations state
      const updatedGenerations = [...newGenerations, ...generations.filter((g) => g.topic_id !== topic.topic_id)];
      setGenerationsState(updatedGenerations);
      saveGenerations(updatedGenerations);

      // Update topic status to 'diproses'
      const updatedTopics = topics.map((t) => (t.topic_id === topic.topic_id ? { ...t, status: 'diproses' as const } : t));
      setTopicsState(updatedTopics);
      saveTopics(updatedTopics);

      addLog('GENERATE_CONTENT', `${newGenerations.length} variasi dibuat untuk topik ${topic.topic_id}`);
      showToast(`${newGenerations.length} variasi konten Threads berhasil dibuat!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal generate variasi konten', 'error');
    } finally {
      setLoadingAi(false);
    }
  };

  // 4. MARK FOR POSTING
  const handleMarkForPosting = (gen: ContentGeneration) => {
    setQueuedGen(gen);
    setActiveTab('posting');
    showToast(`Variasi "${gen.format}" dimuat ke formulir posting`, 'info');
  };

  // 5. SUBMIT POST RECORD
  const handleSubmitPost = (postData: {
    gen_id?: string;
    topic_id?: string;
    tanggal_posting: string;
    jam_posting: string;
    link_threads: string;
    versi_final_dipost: string;
    cta_reply?: string;
  }) => {
    const newPost: PostRecord = {
      post_id: `post-${Date.now().toString(36)}`,
      gen_id: postData.gen_id || 'manual',
      topic_id: postData.topic_id || 'manual',
      tanggal_posting: postData.tanggal_posting,
      jam_posting: postData.jam_posting,
      link_threads: postData.link_threads,
      versi_final_dipost: postData.versi_final_dipost,
      cta_reply: postData.cta_reply,
      created_at: new Date().toISOString(),
      status_evaluasi: 'belum',
    };

    const updatedPosts = [newPost, ...posts];
    setPostsState(updatedPosts);
    savePosts(updatedPosts);
    setSelectedPostId(newPost.post_id);

    // Update topic status if present
    if (newPost.topic_id && newPost.topic_id !== 'manual') {
      const updatedTopics = topics.map((t) => (t.topic_id === newPost.topic_id ? { ...t, status: 'diposting' as const } : t));
      setTopicsState(updatedTopics);
      saveTopics(updatedTopics);
    }

    setQueuedGen(null);
    addLog('RECORD_POST', `Postingan baru dicatat: ${newPost.post_id}`);
    showToast('Postingan berhasil dicatat! Siap dievaluasi 24 jam kemudian.', 'success');
  };

  // 5b. LIVE PUBLISH DIRECTLY TO THREADS API
  const handleLivePublishToThreads = async (postData: {
    text: string;
    cta_reply?: string;
    gen_id?: string;
    topic_id?: string;
  }) => {
    if (!threadsAccount?.is_connected) {
      setIsThreadsModalOpen(true);
      showToast('Silakan sambungkan akun Threads Anda terlebih dahulu', 'error');
      return;
    }

    try {
      showToast('Menerbitkan ke Threads API...', 'info');
      const res = await publishToThreads(postData.text, postData.cta_reply);
      const now = new Date();
      const newPost: PostRecord = {
        post_id: `post-${Date.now().toString(36)}`,
        gen_id: postData.gen_id || 'manual',
        topic_id: postData.topic_id || 'manual',
        tanggal_posting: now.toISOString().substring(0, 10),
        jam_posting: now.toTimeString().substring(0, 5),
        link_threads: res.permalink,
        versi_final_dipost: postData.text,
        cta_reply: postData.cta_reply,
        threads_post_id: res.threads_post_id,
        threads_permalink: res.permalink,
        published_via_api: true,
        created_at: now.toISOString(),
        status_evaluasi: 'belum',
      };

      const updatedPosts = [newPost, ...posts];
      setPostsState(updatedPosts);
      savePosts(updatedPosts);
      setSelectedPostId(newPost.post_id);

      if (newPost.topic_id && newPost.topic_id !== 'manual') {
        const updatedTopics = topics.map((t) => (t.topic_id === newPost.topic_id ? { ...t, status: 'diposting' as const } : t));
        setTopicsState(updatedTopics);
        saveTopics(updatedTopics);
      }

      setQueuedGen(null);
      addLog('THREADS_PUBLISHED', `Konten tayang di Threads: ${res.permalink}`);
      showToast(`Postingan & balasan CTA berhasil tayang live di @${threadsAccount.username}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal menerbitkan postingan ke Threads', 'error');
      throw err;
    }
  };

  // 5c. DIRECT PUBLISH FROM GENERATOR CARD
  const handleDirectPublishFromGenerator = async (gen: ContentGeneration) => {
    await handleLivePublishToThreads({
      text: `${gen.hook}\n\n${gen.body}`,
      cta_reply: gen.cta_reply,
      gen_id: gen.gen_id,
      topic_id: gen.topic_id,
    });
  };

  // 5d. FETCH LIVE INSIGHTS
  const handleFetchThreadsInsights = async (postId: string) => {
    try {
      showToast('Menghubungkan ke Threads API untuk mengambil insight...', 'info');
      const data = await fetchThreadsInsights(postId);
      showToast('Metrik real-time berhasil ditarik dari Threads API!', 'success');
      return data;
    } catch (err: any) {
      showToast(err.message || 'Gagal menarik wawasan Threads', 'error');
      throw err;
    }
  };

  // 6. SUBMIT EVALUATION & UPDATE FORMULA
  const handleSubmitEvaluation = async (evalData: Partial<PostEvaluation>) => {
    setLoadingAi(true);
    try {
      const post = posts.find((p) => p.post_id === evalData.post_id);
      if (!post) throw new Error('Post tidak ditemukan');

      const gen = generations.find((g) => g.gen_id === post.gen_id);
      const topic = gen ? topics.find((t) => t.topic_id === gen.topic_id) : undefined;

      const newEval: PostEvaluation = {
        eval_id: `eval-${Date.now().toString(36)}`,
        post_id: post.post_id,
        dievaluasi_pada: evalData.dievaluasi_pada || '24 jam',
        created_at: new Date().toISOString(),
        views: evalData.views || 0,
        likes: evalData.likes || 0,
        replies: evalData.replies || 0,
        reposts: evalData.reposts || 0,
        quotes: evalData.quotes || 0,
        shares: evalData.shares || 0,
        follower_baru: evalData.follower_baru || 0,
        klik_link: evalData.klik_link || 0,
        penjualan: evalData.penjualan || 0,
        rating_diri: evalData.rating_diri || 4,
        sentimen_komentar: evalData.sentimen_komentar || 'positif',
        catatan_user: evalData.catatan_user || '',
        contoh_komentar: evalData.contoh_komentar || '',
        engagement_score: evalData.engagement_score || 0,
      };

      // 1. Panggil AI Analyzer untuk 1 evaluasi ini
      const analysisResult = await analyzeEvaluationApi(
        newEval,
        post,
        gen,
        topic,
        evaluations,
        settings
      );
      newEval.ai_analysis = analysisResult;

      // Update evaluations list
      const updatedEvals = [newEval, ...evaluations];
      setEvaluationsState(updatedEvals);
      saveEvaluations(updatedEvals);

      // Update post status to lengkap
      const updatedPosts = posts.map((p) => (p.post_id === post.post_id ? { ...p, status_evaluasi: 'lengkap' as const } : p));
      setPostsState(updatedPosts);
      savePosts(updatedPosts);

      // Update topic status to dievaluasi
      if (post.topic_id && post.topic_id !== 'manual') {
        const updatedTopics = topics.map((t) => (t.topic_id === post.topic_id ? { ...t, status: 'dievaluasi' as const } : t));
        setTopicsState(updatedTopics);
        saveTopics(updatedTopics);
      }

      // 2. Evaluasi status transisi formula (Eksperimen -> Kandidat -> FINAL)
      const currentFormula = activeFormula || ({} as FormulaModel);
      const statusCheck = determineFormulaStatus(
        updatedEvals,
        currentFormula,
        settings.target_engagement_rate
      );

      // 3. Panggil AI Formula Engine untuk memperbarui formula
      const updatedFormulaRes = await updateFormulaApi(
        updatedEvals,
        updatedPosts,
        generations,
        currentFormula,
        settings
      );

      // Inject validated mathematical status & confidence
      updatedFormulaRes.status = statusCheck.status;
      updatedFormulaRes.confidence = statusCheck.confidence;

      const updatedFormulas = [...formulas, updatedFormulaRes];
      setFormulasState(updatedFormulas);
      saveFormulas(updatedFormulas);

      addLog(
        'EVALUATION_ANALYZED',
        `Evaluasi post ${post.post_id} dianalisis. Formula berevolusi ke ${updatedFormulaRes.formula_version} (${updatedFormulaRes.status}).`
      );

      showToast(
        `Evaluasi tersimpan! Formula berevolusi ke ${updatedFormulaRes.formula_version} (${updatedFormulaRes.status.toUpperCase()})`,
        'success'
      );

      return {
        evaluation: newEval,
        analysis: analysisResult,
        updatedFormula: updatedFormulaRes,
      };
    } catch (err: any) {
      showToast(err.message || 'Gagal memproses evaluasi', 'error');
      throw err;
    } finally {
      setLoadingAi(false);
    }
  };

  // 7. RECYCLE TOP PERFORMING CONTENT
  const handleRecycle = async (post: PostRecord) => {
    showToast('AI sedang mendaur ulang konten dengan sudut pandang baru...', 'info');
    try {
      const res = await recycleContentApi(post, settings, activeFormula || ({} as any));
      // Switch to topic tab and prefill
      setActiveTab('topik');
      handleSaveTopic({
        ide_mentah: res.new_hook,
        sudut_pandang: res.new_angle,
        pilar_konten: 'Studi Kasus / Realita',
        persona: settings.persona_audiens,
        pain_point: settings.pain_point_utama,
      }, false);
      showToast('Konten berhasil didaur ulang & disimpan di tab Topik Baru!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal mendaur ulang konten', 'error');
    }
  };

  // 8. UPDATE GENERATION
  const handleUpdateGeneration = (updated: ContentGeneration) => {
    const next = generations.map((g) => (g.gen_id === updated.gen_id ? updated : g));
    setGenerationsState(next);
    saveGenerations(next);
    showToast('Variasi konten berhasil diperbarui', 'success');
  };

  // 9. SAVE SETTINGS
  const handleSaveSettings = (newSettings: CreatorSettings) => {
    setSettingsState(newSettings);
    saveSettings(newSettings);
    addLog('SAVE_SETTINGS', 'Pengaturan creator diperbarui');
    showToast('Profil & konfigurasi algoritma tersimpan!', 'success');
  };

  // 10. SEED DEMO
  const handleSeedDemo = () => {
    if (window.confirm('Muat data simulasi lengkap (3 post, evaluasi nyata, formula evolusi v1.1)?')) {
      seedDemoData();
      reloadFromStorage();
      showToast('Data demo berhasil dimuat!', 'success');
    }
  };

  // 11. RESET
  const handleReset = () => {
    if (window.confirm('Hapus seluruh data lab? Tindakan ini akan mengosongkan semua riwayat.')) {
      resetAllData();
      reloadFromStorage();
      showToast('Database lab berhasil dikosongkan', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeFormula={activeFormula}
        threadsAccount={threadsAccount}
        onOpenThreadsConnect={() => setIsThreadsModalOpen(true)}
        onSeedDemo={handleSeedDemo}
        onReset={handleReset}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'dashboard' && (
          <DashboardTab
            topics={topics}
            posts={posts}
            evaluations={evaluations}
            generations={generations}
            formulas={formulas}
            settings={settings}
            onRecycle={handleRecycle}
            onSelectTopic={(id) => {
              setSelectedTopicId(id);
              setActiveTab('konten');
            }}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'topik' && (
          <TopicTab
            topics={topics}
            settings={settings}
            onEnrichTopic={handleEnrichTopic}
            onSaveTopic={handleSaveTopic}
            onSelectTopicForGenerator={(topicId) => {
              setSelectedTopicId(topicId);
              setActiveTab('konten');
            }}
          />
        )}

        {activeTab === 'konten' && (
          <GeneratorTab
            topics={topics}
            generations={generations}
            activeFormula={activeFormula}
            settings={settings}
            selectedTopicId={selectedTopicId}
            setSelectedTopicId={setSelectedTopicId}
            onGenerate={handleGenerateContent}
            onMarkForPosting={handleMarkForPosting}
            onDirectPublish={handleDirectPublishFromGenerator}
            threadsConnected={Boolean(threadsAccount?.is_connected)}
            onUpdateGeneration={handleUpdateGeneration}
            loading={loadingAi}
          />
        )}

        {activeTab === 'posting' && (
          <PostingTab
            posts={posts}
            generations={generations}
            topics={topics}
            queuedGen={queuedGen}
            threadsAccount={threadsAccount}
            onOpenThreadsConnect={() => setIsThreadsModalOpen(true)}
            onSubmitPost={handleSubmitPost}
            onLivePublishToThreads={handleLivePublishToThreads}
            onNavigateToEvaluation={(postId) => {
              setSelectedPostId(postId);
              setActiveTab('evaluasi');
            }}
          />
        )}

        {activeTab === 'evaluasi' && (
          <EvaluationTab
            posts={posts}
            evaluations={evaluations}
            settings={settings}
            activeFormula={activeFormula}
            threadsAccount={threadsAccount}
            selectedPostId={selectedPostId}
            setSelectedPostId={setSelectedPostId}
            onSubmitEvaluation={handleSubmitEvaluation}
            onFetchThreadsInsights={handleFetchThreadsInsights}
            loading={loadingAi}
          />
        )}

        {activeTab === 'formula' && (
          <FormulaTab formulas={formulas} activeFormula={activeFormula} />
        )}

        {activeTab === 'riwayat' && (
          <HistoryTab
            posts={posts}
            generations={generations}
            topics={topics}
            evaluations={evaluations}
          />
        )}

        {activeTab === 'pengaturan' && (
          <SettingsTab
            settings={settings}
            threadsAccount={threadsAccount}
            onOpenThreadsConnect={() => setIsThreadsModalOpen(true)}
            onSaveSettings={handleSaveSettings}
          />
        )}

        {(activeTab === 'gas_integration' || activeTab === 'gas_code') && (
          <GasIntegrationTab
            gasConfig={gasConfig}
            onUpdateGasConfig={handleUpdateGasConfig}
            settings={settings}
            topics={topics}
            generations={generations}
            posts={posts}
            evaluations={evaluations}
            formulas={formulas}
            onImportData={handleImportFromGas}
            showToast={showToast}
          />
        )}
      </main>

      <footer className="border-t border-neutral-900 bg-neutral-950 py-6 text-center text-xs text-neutral-500">
        <p>Threads Formula Lab · Laboratorium Strategi Konten Organik Produk Digital</p>
      </footer>

      {/* Threads API Connection Modal */}
      <ThreadsConnectModal
        isOpen={isThreadsModalOpen}
        onClose={() => setIsThreadsModalOpen(false)}
        threadsAccount={threadsAccount}
        onAccountUpdated={(acc) => setThreadsAccount(acc)}
        showToast={showToast}
      />

      <ToastContainer toasts={toasts} />
    </div>
  );
}
