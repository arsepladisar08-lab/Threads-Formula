export async function pingGasWebApp(webAppUrl: string): Promise<{
  success: boolean;
  message: string;
  spreadsheet_name?: string;
  timestamp?: string;
}> {
  const res = await fetch('/api/gas/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      webAppUrl,
      action: 'ping',
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Gagal menghubungi Web App Google Apps Script');
  }

  return data;
}

export async function fetchGasData(webAppUrl: string): Promise<{
  success: boolean;
  data: any;
  message?: string;
}> {
  const res = await fetch('/api/gas/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      webAppUrl,
      action: 'getData',
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Gagal mengambil data dari Google Spreadsheet');
  }

  return data;
}

export async function pushGasData(
  webAppUrl: string,
  payload: {
    settings?: any;
    topics?: any[];
    generations?: any[];
    posts?: any[];
    evaluations?: any[];
    formulas?: any[];
  }
): Promise<{
  success: boolean;
  message?: string;
}> {
  const res = await fetch('/api/gas/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      webAppUrl,
      action: 'syncData',
      data: payload,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Gagal mengirim data ke Google Spreadsheet');
  }

  return data;
}
