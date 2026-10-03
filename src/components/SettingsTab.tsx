import React, { useState } from 'react';
import { CreatorSettings, ThreadsAccount } from '../types';
import { Save, Check, Sliders, User, DollarSign, ExternalLink, Link2 } from 'lucide-react';

interface SettingsTabProps {
  settings: CreatorSettings;
  threadsAccount: ThreadsAccount | null;
  onOpenThreadsConnect: () => void;
  onSaveSettings: (settings: CreatorSettings) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  threadsAccount,
  onOpenThreadsConnect,
  onSaveSettings,
}) => {
  const [form, setForm] = useState<CreatorSettings>({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* THREADS API CONNECTION CARD */}
      <div className="p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-white text-neutral-950 font-extrabold flex items-center justify-center text-sm">@</span>
            <h2 className="text-sm font-bold text-white">Integrasi Threads API Live</h2>
            {threadsAccount?.is_connected ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Terhubung (@{threadsAccount.username})
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-800 text-neutral-400">
                Belum Terhubung
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Aktifkan koneksi resmi Meta Threads API untuk auto-publishing (post utama & balasan CTA) serta penarikan statistik tayangan dan balasan real-time.
          </p>
        </div>

        <button
          onClick={onOpenThreadsConnect}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white text-neutral-950 hover:bg-neutral-200 transition shrink-0"
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>{threadsAccount?.is_connected ? 'Kelola Koneksi Threads' : 'Sambungkan Akun Threads'}</span>
        </button>
      </div>

      <div className="p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-sky-400" />
              <span>Profil Kreator & Konfigurasi Algoritma</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Data profil ini disuntikkan secara otomatis sebagai sistem konteks ke setiap panggilan AI (Topik, Generator, dan Analyzer).
            </p>
          </div>

          {saved && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Check className="w-3.5 h-3.5" />
              <span>Tersimpan!</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Niche & Jenis Produk */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Niche Utama Kreator
              </label>
              <input
                type="text"
                value={form.niche}
                onChange={(e) => setForm({ ...form, niche: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Jenis Produk Digital
              </label>
              <input
                type="text"
                value={form.jenis_produk}
                onChange={(e) => setForm({ ...form, jenis_produk: e.target.value })}
                required
                placeholder="Contoh: Template Notion, Ebook, E-course, Preset"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Nama & Harga Produk */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Nama Produk Digital Anda
              </label>
              <input
                type="text"
                value={form.nama_produk}
                onChange={(e) => setForm({ ...form, nama_produk: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Harga Jual Produk
              </label>
              <input
                type="text"
                value={form.harga_produk}
                onChange={(e) => setForm({ ...form, harga_produk: e.target.value })}
                placeholder="Contoh: Rp 149.000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Link Produk */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Tautan Landing Page / Checkout Produk (Ditaruh di Komentar Pertama)
            </label>
            <input
              type="url"
              value={form.link_produk}
              onChange={(e) => setForm({ ...form, link_produk: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Persona & Pain Point */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Persona Target Audiens
            </label>
            <textarea
              value={form.persona_audiens}
              onChange={(e) => setForm({ ...form, persona_audiens: e.target.value })}
              rows={2}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Pain Point / Masalah Terbesar yang Dihadapi Audiens
            </label>
            <textarea
              value={form.pain_point_utama}
              onChange={(e) => setForm({ ...form, pain_point_utama: e.target.value })}
              rows={2}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Gaya Bahasa & Target Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Gaya Bahasa (Tone of Voice)
              </label>
              <select
                value={form.gaya_bahasa}
                onChange={(e) => setForm({ ...form, gaya_bahasa: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
              >
                <option value="santai">Santai (Sahabat Seperjuangan, Relatable)</option>
                <option value="profesional">Profesional (Otoritatif & Berbobot)</option>
                <option value="gaul Indonesia">Gaul Indonesia (Kasual, Gen-Z / Milenial)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Target Engagement Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={form.target_engagement_rate}
                onChange={(e) => setForm({ ...form, target_engagement_rate: Number(e.target.value) })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          {/* Bobot Scoring Algoritma */}
          <div className="pt-4 border-t border-neutral-800">
            <h3 className="text-xs font-bold text-neutral-300 mb-2 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>Bobot Scoring Algoritma Threads:</span>
            </h3>
            <p className="text-[11px] text-neutral-500 mb-3">
              Balasan (Replies) default diberi bobot 3x karena percakapan dua arah adalah sinyal organik paling berharga di algoritma Threads.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Bobot Replies</label>
                <input
                  type="number"
                  value={form.bobot_replies}
                  onChange={(e) => setForm({ ...form, bobot_replies: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Bobot Reposts</label>
                <input
                  type="number"
                  value={form.bobot_reposts}
                  onChange={(e) => setForm({ ...form, bobot_reposts: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Bobot Quotes</label>
                <input
                  type="number"
                  value={form.bobot_quotes}
                  onChange={(e) => setForm({ ...form, bobot_quotes: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Bobot Shares</label>
                <input
                  type="number"
                  value={form.bobot_shares}
                  onChange={(e) => setForm({ ...form, bobot_shares: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-white text-neutral-950 hover:bg-neutral-200 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Profil & Pengaturan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
