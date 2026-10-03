import { ThreadsAccount } from '../types';

export async function getThreadsAuthUrl(): Promise<{
  url: string;
  redirectUri: string;
  appId?: string;
  isConfigured: boolean;
}> {
  const res = await fetch('/api/auth/threads/url');
  if (!res.ok) {
    throw new Error('Gagal mendapatkan URL Threads OAuth');
  }
  return await res.json();
}

export async function getThreadsStatus(): Promise<{
  isConnected: boolean;
  account: ThreadsAccount | null;
  hasAppCredentials: boolean;
}> {
  const res = await fetch('/api/threads/status');
  if (!res.ok) {
    return { isConnected: false, account: null, hasAppCredentials: false };
  }
  return await res.json();
}

export async function connectWithToken(token?: string, username?: string): Promise<{
  success: boolean;
  account: ThreadsAccount;
}> {
  const res = await fetch('/api/threads/connect-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, username }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Gagal menyambungkan akun');
  }
  return await res.json();
}

export async function disconnectThreads(): Promise<{ success: boolean }> {
  const res = await fetch('/api/threads/disconnect', { method: 'POST' });
  return await res.json();
}

export async function publishToThreads(text: string, cta_reply?: string): Promise<{
  success: boolean;
  threads_post_id: string;
  permalink: string;
  reply_id?: string;
  message: string;
}> {
  const res = await fetch('/api/threads/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, cta_reply }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Gagal menerbitkan postingan ke Threads');
  }
  return await res.json();
}

export async function fetchThreadsInsights(postId: string): Promise<{
  success: boolean;
  views: number;
  likes: number;
  replies: number;
  reposts: number;
  quotes: number;
  shares?: number;
  source: string;
}> {
  const res = await fetch(`/api/threads/insights/${encodeURIComponent(postId)}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Gagal mengambil data wawasan Threads');
  }
  return await res.json();
}
