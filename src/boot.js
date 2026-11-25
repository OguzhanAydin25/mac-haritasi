// Veriyi yükler, sonra uygulamayı başlatır.
import { fill } from './store.js';

async function getJSON(url) { const r = await fetch(url, { cache: 'no-cache' }); if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); }

(async () => {
  const msg = document.getElementById('loading');
  try {
    let data, events = {};
    try {
      data = await getJSON('data/season.json');
      try { events = await getJSON('data/events.json'); } catch { /* henüz yok */ }
    } catch {
      data = await getJSON('data/demo.json'); events = data.events || {};
    }
    fill(data, events);
    await import('./main.js');
    msg && msg.remove();
  } catch (e) {
    console.error(e);
    if (msg) msg.textContent = 'Veri yüklenemedi: ' + e.message;
  }
})();
